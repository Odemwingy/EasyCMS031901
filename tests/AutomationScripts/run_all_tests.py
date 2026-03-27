from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

AUTOMATION_CONFIG = {
    "ui": {
        "label": "功能自动化",
        "workdir": ROOT / "ui_automation",
    },
    "api": {
        "label": "接口自动化",
        "workdir": ROOT / "api_automation",
    },
}

SUITE_TO_FILE = {
    "smoke": "tests/test_smoke.py",
    "regression": "tests/test_regression.py",
}


def run_single_suite(target: str, suite: str) -> int:
    config = AUTOMATION_CONFIG[target]
    workdir = config["workdir"]
    output_dir = workdir / "outputs" / suite
    html_report = output_dir / "测试报告.html"

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["TEST_SUITE_NAME"] = suite
    env["TEST_OUTPUT_DIR"] = str(output_dir)

    command = [
        sys.executable,
        "-m",
        "pytest",
        SUITE_TO_FILE[suite],
        f"--html={html_report}",
        "--self-contained-html",
    ]

    print(f"开始执行：{config['label']} - {suite}")
    print(f"工作目录：{workdir}")
    print(f"HTML 报告：{html_report}")

    completed = subprocess.run(command, cwd=workdir, env=env, check=False)

    buglist = output_dir / "buglist.md"
    screenshots_dir = output_dir / "screenshots"

    print(f"执行完成：{config['label']} - {suite}，退出码={completed.returncode}")
    print(f"Bug 清单：{buglist}")
    if target == "ui":
        print(f"失败截图目录：{screenshots_dir}")
    print()
    return completed.returncode


def expand_targets(target: str) -> list[str]:
    if target == "all":
        return ["ui", "api"]
    return [target]


def expand_suites(suite: str) -> list[str]:
    if suite == "all":
        return ["smoke", "regression"]
    return [suite]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run EasyCMS Testrelated automation suites.")
    parser.add_argument("--target", choices=["ui", "api", "all"], default="all", help="测试目标")
    parser.add_argument("--suite", choices=["smoke", "regression", "all"], default="all", help="执行套件")
    args = parser.parse_args()

    exit_codes = []
    for target in expand_targets(args.target):
        for suite in expand_suites(args.suite):
            exit_codes.append(run_single_suite(target, suite))

    return 1 if any(code != 0 for code in exit_codes) else 0


if __name__ == "__main__":
    raise SystemExit(main())
