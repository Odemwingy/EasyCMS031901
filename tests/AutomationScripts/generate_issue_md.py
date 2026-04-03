from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


ISSUE_BLOCK_PATTERN = re.compile(
    r"<!-- ISSUE-START: (?P<issue_id>\d{3}) -->\n"
    r"(?P<body>.*?)"
    r"<!-- ISSUE-END: (?P=issue_id) -->",
    re.S,
)

ISSUE_STATUS_PATTERN = re.compile(r"<!-- ISSUE-STATUS:\s*(open|fixed)\s*-->")

BUG_BLOCK_PATTERN = re.compile(
    r"###\s+【(?P<issue_id>\d{3})】(?P<title>.+?)\n(?P<body>.*?)(?=\n###\s+【\d{3}】|\Z)",
    re.S,
)

LINE_VALUE_PATTERNS = {
    "case_ids": re.compile(r"-\s*关联用例：`?(?P<value>.+?)`?\s*$", re.M),
    "impact_module": re.compile(r"-\s*影响模块：`?(?P<value>.+?)`?\s*$", re.M),
    "evidence": re.compile(r"-\s*证据：`?(?P<value>.+?)`?\s*$", re.M),
}

DEFAULT_ISSUE_HEADER = """# EasyCMS GitHub Issue Drafts

以下内容用于沉淀自动化测试发现的产品缺陷草稿。
- 每条 issue 标题必须带唯一编号和模块名，格式：`【001】【用户管理模块】标题`
- `issue.md` 与 `buglist.md` 按编号一一对应
- 后续只新增 issue，不删除原有 issue
- 已确认修复的 issue 保留原文，并标注 `已修复`
- 提交到 GitHub 时，只处理本次新增的 issue
- 环境问题、脚本问题、待人工复核项不进入本文件
---
"""


@dataclass
class BugItem:
    issue_id: str
    title: str
    module_name: str
    case_ids: str
    evidence: str
    impact_module: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate or update tests/AutomationScripts/issue.md from buglist.md.")
    parser.add_argument("--buglist", help="Path to buglist.md. Defaults to the latest buglist under AutomationScripts outputs.")
    parser.add_argument(
        "--issue-file",
        default=str(Path(__file__).resolve().parent / "issue.md"),
        help="Path to the issue.md file.",
    )
    parser.add_argument(
        "--resolved",
        default="",
        help="Comma-separated issue ids to mark as fixed, for example: 003,007",
    )
    return parser.parse_args()


def find_latest_buglist(automation_root: Path) -> Path:
    candidates = sorted(automation_root.glob("**/outputs/*/buglist.md"), key=lambda path: path.stat().st_mtime, reverse=True)
    if not candidates:
        raise FileNotFoundError("未找到 buglist.md，请先执行自动化测试。")
    return candidates[0]


def extract_line_value(body: str, key: str, default: str = "") -> str:
    pattern = LINE_VALUE_PATTERNS[key]
    match = pattern.search(body)
    if not match:
        return default
    return match.group("value").strip()


def normalize_module(module_hint: str, title: str, case_ids: str) -> str:
    text = " ".join([module_hint, title, case_ids]).lower()

    if "audit" in text or "日志" in text:
        return "审计日志模块"
    if "permission" in text or "权限" in text:
        if "role" in text or "角色" in text:
            return "角色权限模块"
        return "权限配置模块"
    if "menu" in text or "菜单" in text:
        return "菜单管理模块"
    if "role" in text or "角色" in text:
        return "角色管理模块"
    if "user" in text or "用户" in text:
        return "用户管理模块"
    if "login" in text or "auth" in text or "登录" in text:
        return "认证模块"
    return "待归类模块"


def parse_buglist(buglist_path: Path) -> list[BugItem]:
    text = buglist_path.read_text(encoding="utf-8")
    items: list[BugItem] = []

    for match in BUG_BLOCK_PATTERN.finditer(text):
        body = match.group("body")
        title = match.group("title").strip()
        case_ids = extract_line_value(body, "case_ids", "待补充")
        impact_module = extract_line_value(body, "impact_module", "")
        evidence = extract_line_value(body, "evidence", "无截图")
        module_name = normalize_module(impact_module, title, case_ids)

        items.append(
            BugItem(
                issue_id=match.group("issue_id"),
                title=title,
                module_name=module_name,
                case_ids=case_ids,
                evidence=evidence,
                impact_module=impact_module,
            )
        )

    return items


def ensure_issue_file(issue_file: Path) -> str:
    if not issue_file.exists():
        issue_file.write_text(DEFAULT_ISSUE_HEADER, encoding="utf-8")
    return issue_file.read_text(encoding="utf-8")


def infer_assignee(module_name: str, title: str) -> str:
    text = f"{module_name} {title}"
    if "前端" in text:
        return "Jinx962"
    if "后端" in text:
        return "LHB1994"
    if "认证" in text or "用户" in text or "角色" in text or "菜单" in text or "权限" in text or "日志" in text:
        return "LHB1994"
    return "待补充"


def build_issue_title(item: BugItem) -> str:
    return f"【{item.issue_id}】【{item.module_name}】{item.title}"


def build_issue_block(item: BugItem, buglist_path: Path) -> str:
    assignee = infer_assignee(item.module_name, item.title)
    issue_title = build_issue_title(item)

    return f"""<!-- ISSUE-START: {item.issue_id} -->
<!-- ISSUE-SIGNATURE: auto-{item.issue_id} -->
<!-- ISSUE-STATUS: open -->
## Issue 【{item.issue_id}】
### Issue Title
{issue_title}

### Assignees
- `{assignee}`

### Labels
- `bug`

### Description
自动化测试识别到一条产品缺陷，请结合需求文档和测试证据补充更完整的业务背景与影响范围。

### Preconditions
- 已执行自动化测试
- 来源缺陷清单：`{buglist_path}`

### Steps To Reproduce
1. 参考对应自动化测试或缺陷清单中的复现步骤
2. 在测试环境中执行相同操作
3. 观察实际结果

### Actual Result
请参考对应 `buglist.md` 中的“实际结果”补充。

### Expected Result
请参考对应需求、接口文档和测试用例补充。

### Evidence
- 关联用例：`{item.case_ids}`
- 模块：`{item.module_name}`
- 证据：`{item.evidence}`
- 来源缺陷清单：`{buglist_path}`

<!-- ISSUE-END: {item.issue_id} -->"""


def mark_issue_fixed(block: str, issue_id: str) -> str:
    updated = ISSUE_STATUS_PATTERN.sub("<!-- ISSUE-STATUS: fixed -->", block, count=1)
    return updated.replace(f"## Issue 【{issue_id}】", f"## Issue 【{issue_id}】（已修复）", 1)


def mark_issue_open(block: str, issue_id: str) -> str:
    updated = ISSUE_STATUS_PATTERN.sub("<!-- ISSUE-STATUS: open -->", block, count=1)
    return updated.replace(f"## Issue 【{issue_id}】（已修复）", f"## Issue 【{issue_id}】", 1)


def update_issue_file(issue_file: Path, buglist_path: Path, bug_items: list[BugItem], resolved_ids: set[str]) -> None:
    text = ensure_issue_file(issue_file)
    existing_blocks = {match.group("issue_id"): match.group(0) for match in ISSUE_BLOCK_PATTERN.finditer(text)}
    current_open_ids = {item.issue_id for item in bug_items}
    new_blocks: list[str] = []

    for item in bug_items:
        existing_block = existing_blocks.get(item.issue_id)
        if existing_block:
            replacement = mark_issue_open(existing_block, item.issue_id)
            replacement = re.sub(
                r"(### Issue Title\n).+?\n",
                rf"\1{build_issue_title(item)}\n",
                replacement,
                count=1,
                flags=re.S,
            )
            text = text.replace(existing_block, replacement, 1)
            continue
        new_blocks.append(build_issue_block(item, buglist_path))

    for issue_id in resolved_ids:
        existing_block = existing_blocks.get(issue_id)
        if not existing_block:
            continue
        replacement = mark_issue_fixed(existing_block, issue_id)
        text = text.replace(existing_block, replacement, 1)

    for issue_id, existing_block in existing_blocks.items():
        if issue_id in current_open_ids or issue_id not in resolved_ids:
            continue
        replacement = mark_issue_fixed(existing_block, issue_id)
        text = text.replace(existing_block, replacement, 1)

    if new_blocks:
        if not text.endswith("\n"):
            text += "\n"
        if not text.rstrip().endswith("---"):
            text = text.rstrip() + "\n\n---\n"
        text += "\n\n---\n\n".join(new_blocks) + "\n"

    issue_file.write_text(text, encoding="utf-8")


def parse_resolved_ids(raw_value: str) -> set[str]:
    values = set()
    for item in raw_value.split(","):
        value = item.strip()
        if value:
            values.add(value.zfill(3))
    return values


def main() -> int:
    args = parse_args()
    automation_root = Path(__file__).resolve().parent
    buglist_path = Path(args.buglist) if args.buglist else find_latest_buglist(automation_root)
    issue_file = Path(args.issue_file)
    resolved_ids = parse_resolved_ids(args.resolved)
    bug_items = parse_buglist(buglist_path)

    update_issue_file(issue_file, buglist_path, bug_items, resolved_ids)
    print(f"issue.md 已更新：{issue_file}")
    print(f"来源 buglist：{buglist_path}")
    if resolved_ids:
        print(f"已标记修复：{', '.join(sorted(resolved_ids))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
