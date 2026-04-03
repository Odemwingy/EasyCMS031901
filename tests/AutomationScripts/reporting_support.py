from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any


CASE_ID_PATTERN = re.compile(r"[A-Z]+-\d+")
ISSUE_ID_PATTERN = re.compile(r"【(\d{3,})】")
ISSUE_SIGNATURE_PATTERN = re.compile(r"<!-- ISSUE-SIGNATURE:\s*(.+?)\s*-->")

PRODUCT_KEYWORDS = (
    "500 internal server error",
    "unexpected application error",
    "referenceerror",
    "typeerror",
    "服务器内部错误",
    "internal server error",
)

ENVIRONMENT_KEYWORDS = (
    "httpx.readtimeout",
    "httpcore.readtimeout",
    "connecterror",
    "connection refused",
    "name or service not known",
    "temporary failure in name resolution",
    "network is unreachable",
    "timed out",
    "readtimeout",
)

SCRIPT_KEYWORDS = (
    "assertionerror: locator",
    "timeouterror: locator",
    "strict mode violation",
    "element(s) not found",
    "get_by_text(",
    "get_by_role(",
    "get_by_title(",
    "locator expected",
    "to_be_visible",
    "to_have_count",
    "to_have_text",
)


def sanitize_name(value: str) -> str:
    sanitized = re.sub(r"[^0-9A-Za-z\u4e00-\u9fff._-]+", "_", value)
    sanitized = sanitized.strip("._")
    return sanitized or "unnamed"


def build_report_context(
    *,
    root_dir: Path,
    automation_name: str,
    default_bug_side: str,
    screenshots_enabled: bool,
) -> dict[str, Any]:
    suite_name = os.getenv("TEST_SUITE_NAME", "manual")
    output_dir = Path(os.getenv("TEST_OUTPUT_DIR", root_dir / "outputs" / suite_name))
    output_dir.mkdir(parents=True, exist_ok=True)

    screenshots_dir = output_dir / "screenshots"
    if screenshots_enabled:
        screenshots_dir.mkdir(parents=True, exist_ok=True)

    return {
        "automation_name": automation_name,
        "suite_name": suite_name,
        "default_bug_side": default_bug_side,
        "screenshots_enabled": screenshots_enabled,
        "output_dir": output_dir,
        "automation_root_dir": root_dir.parent,
        "screenshots_dir": screenshots_dir,
        "buglist_path": output_dir / "buglist.md",
        "non_product_path": output_dir / "non_product_issues.md",
        "html_report_path": output_dir / "测试报告.html",
        "results": [],
    }


def extract_case_ids(item) -> list[str]:
    marker = item.get_closest_marker("case_ids")
    if marker:
        return [str(case_id) for case_id in marker.args]

    doc = getattr(item.obj, "__doc__", "") or ""
    return CASE_ID_PATTERN.findall(doc)


def extract_bug_side(item, default_bug_side: str) -> str:
    marker = item.get_closest_marker("bug_side")
    if marker and marker.args:
        return str(marker.args[0])
    return default_bug_side


def summarize_failure(longreprtext: str) -> str:
    lines = [line.strip() for line in longreprtext.splitlines() if line.strip()]
    highlights = []
    for line in lines:
        if line.startswith("E       "):
            highlights.append(line.replace("E       ", "", 1))
        elif "AssertionError" in line or "Timeout" in line or "HTTPStatusError" in line:
            highlights.append(line)

    selected = highlights[:6] if highlights else lines[:8]
    return "\n".join(selected).strip() or "测试失败，但未提取到明确错误摘要。"


def capture_failure_screenshot(item, screenshots_dir: Path) -> str | None:
    page = item.funcargs.get("page")
    if page is None:
        page = item.funcargs.get("admin_logged_in_page")
    if page is None:
        page = item.funcargs.get("login_page")
        if page is not None and hasattr(page, "page"):
            page = page.page

    if page is None:
        return None

    filename = f"{sanitize_name(item.nodeid)}.png"
    screenshot_path = screenshots_dir / filename
    page.screenshot(path=str(screenshot_path), full_page=True)
    return str(screenshot_path)


def append_result(context: dict[str, Any], result: dict[str, Any]) -> None:
    context["results"].append(result)


def _load_existing_issue_id_map(issue_md_path: Path) -> dict[str, str]:
    if not issue_md_path.exists():
        return {}

    text = issue_md_path.read_text(encoding="utf-8")
    blocks = text.split("\n---\n")
    signature_to_id: dict[str, str] = {}

    for block in blocks:
        id_match = ISSUE_ID_PATTERN.search(block)
        signature_match = ISSUE_SIGNATURE_PATTERN.search(block)
        if not id_match or not signature_match:
            continue
        signature_to_id[signature_match.group(1).strip()] = id_match.group(1)

    return signature_to_id


def _next_issue_number(existing_ids: list[str]) -> int:
    if not existing_ids:
        return 1
    return max(int(item) for item in existing_ids) + 1


def _assign_bug_ids(context: dict[str, Any], product_failed: list[dict[str, Any]]) -> None:
    issue_md_path = context["automation_root_dir"] / "issue.md"
    existing_map = _load_existing_issue_id_map(issue_md_path)
    next_issue_number = _next_issue_number(list(existing_map.values()))

    for item in product_failed:
        signature = item["nodeid"]
        existing_id = existing_map.get(signature)
        if existing_id:
            item["issue_id"] = existing_id
            continue

        item["issue_id"] = f"{next_issue_number:03d}"
        existing_map[signature] = item["issue_id"]
        next_issue_number += 1


def classify_failure(failure_summary: str) -> tuple[str, str]:
    normalized = failure_summary.lower()

    if any(keyword in normalized for keyword in PRODUCT_KEYWORDS):
        return "product", "产品缺陷"
    if any(keyword in normalized for keyword in SCRIPT_KEYWORDS):
        return "non_product", "脚本问题"
    if any(keyword in normalized for keyword in ENVIRONMENT_KEYWORDS):
        return "non_product", "环境问题"
    return "non_product", "待人工复核"


def _write_buglist(
    context: dict[str, Any],
    tests_collected: int,
    passed_count: int,
    skipped_count: int,
    product_failed: list[dict[str, Any]],
) -> None:
    lines = [
        f"# {context['automation_name']}{context['suite_name']}执行缺陷清单",
        "",
        f"- 测试类型：{context['automation_name']}",
        f"- 套件：{context['suite_name']}",
        f"- 总收集用例数：{tests_collected}",
        f"- 执行通过：{passed_count}",
        f"- 执行失败：{len(product_failed)}",
        f"- 执行跳过：{skipped_count}",
        f"- HTML 报告：{context['html_report_path']}",
        "",
    ]

    if not product_failed:
        lines.extend(
            [
                "## 结果概览",
                "",
                "本次执行未识别到可直接归类为产品缺陷的失败项。",
                "",
            ]
        )
        context["buglist_path"].write_text("\n".join(lines), encoding="utf-8")
        return

    _assign_bug_ids(context, product_failed)
    lines.extend(["## 缺陷列表", ""])

    for item in product_failed:
        case_text = "、".join(item["case_ids"]) if item["case_ids"] else "未映射用例编号"
        screenshot_text = item["screenshot_path"] or "无截图"
        issue_tag = f"【{item['issue_id']}】"
        lines.extend(
            [
                f"### {issue_tag} {item['test_name']}",
                "",
                f"- 缺陷编号：{issue_tag}",
                f"- 用例编号：{case_text}",
                f"- 缺陷归属：{item['bug_side']}",
                f"- 失败描述：{item['failure_summary']}",
                f"- 测试节点：{item['nodeid']}",
                f"- 失败截图：{screenshot_text}",
                "",
            ]
        )

    context["buglist_path"].write_text("\n".join(lines), encoding="utf-8")


def _write_non_product_issues(
    context: dict[str, Any],
    non_product_failed: list[dict[str, Any]],
) -> None:
    lines = [
        f"# {context['automation_name']}{context['suite_name']}非产品问题记录",
        "",
        "- 说明：本文件只记录环境问题、脚本问题和待人工复核项。",
        "- 这些内容不进入 buglist.md，不进入 issue.md，不提交 GitHub issue。",
        f"- HTML 报告：{context['html_report_path']}",
        "",
    ]

    if not non_product_failed:
        lines.extend(["## 结果概览", "", "本次执行未识别到非产品问题。", ""])
        context["non_product_path"].write_text("\n".join(lines), encoding="utf-8")
        return

    lines.extend(["## 列表", ""])
    for index, item in enumerate(non_product_failed, start=1):
        case_text = "、".join(item["case_ids"]) if item["case_ids"] else "未映射用例编号"
        screenshot_text = item["screenshot_path"] or "无截图"
        lines.extend(
            [
                f"### NP-{index:03d} {item['test_name']}",
                "",
                f"- 分类：{item['non_product_reason']}",
                f"- 用例编号：{case_text}",
                f"- 归属：{item['bug_side']}",
                f"- 失败描述：{item['failure_summary']}",
                f"- 测试节点：{item['nodeid']}",
                f"- 失败截图：{screenshot_text}",
                "",
            ]
        )

    context["non_product_path"].write_text("\n".join(lines), encoding="utf-8")


def write_buglist(context: dict[str, Any], tests_collected: int) -> None:
    results = context["results"]
    failed = [item for item in results if item["outcome"] == "failed"]
    passed = [item for item in results if item["outcome"] == "passed"]
    skipped = [item for item in results if item["outcome"] == "skipped"]

    product_failed: list[dict[str, Any]] = []
    non_product_failed: list[dict[str, Any]] = []

    for item in failed:
        category, reason = classify_failure(item["failure_summary"])
        item["failure_category"] = category
        item["non_product_reason"] = reason
        if category == "product":
            product_failed.append(item)
        else:
            non_product_failed.append(item)

    _write_buglist(context, tests_collected, len(passed), len(skipped), product_failed)
    _write_non_product_issues(context, non_product_failed)
