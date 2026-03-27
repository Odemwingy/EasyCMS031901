from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any


CASE_ID_PATTERN = re.compile(r"[A-Z]+-\d+")


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
        "screenshots_dir": screenshots_dir,
        "buglist_path": output_dir / "buglist.md",
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


def write_buglist(context: dict[str, Any], tests_collected: int) -> None:
    results = context["results"]
    failed = [item for item in results if item["outcome"] == "failed"]
    passed = [item for item in results if item["outcome"] == "passed"]
    skipped = [item for item in results if item["outcome"] == "skipped"]

    lines = [
        f"# {context['automation_name']}{context['suite_name']}执行缺陷清单",
        "",
        f"- 测试类型：{context['automation_name']}",
        f"- 套件：{context['suite_name']}",
        f"- 总收集用例数：{tests_collected}",
        f"- 执行通过：{len(passed)}",
        f"- 执行失败：{len(failed)}",
        f"- 执行跳过：{len(skipped)}",
        f"- HTML 报告：{context['html_report_path']}",
        "",
    ]

    if not failed:
        lines.extend(
            [
                "## 结果概览",
                "",
                "本次执行未发现失败用例，当前未生成缺陷项。",
                "",
            ]
        )
        context["buglist_path"].write_text("\n".join(lines), encoding="utf-8")
        return

    lines.extend(
        [
            "## 缺陷列表",
            "",
        ]
    )

    for index, item in enumerate(failed, start=1):
        case_text = "、".join(item["case_ids"]) if item["case_ids"] else "未映射用例编号"
        screenshot_text = item["screenshot_path"] or "无截图"
        lines.extend(
            [
                f"### {index}. {item['test_name']}",
                "",
                f"- 用例编号：{case_text}",
                f"- 缺陷归属：{item['bug_side']}",
                f"- 失败描述：{item['failure_summary']}",
                f"- 测试节点：{item['nodeid']}",
                f"- 失败截图：{screenshot_text}",
                "",
            ]
        )

    context["buglist_path"].write_text("\n".join(lines), encoding="utf-8")
