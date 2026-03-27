from __future__ import annotations

import sys
from pathlib import Path

import httpx
import pytest

SUPPORT_ROOT = Path(__file__).resolve().parents[1]
if str(SUPPORT_ROOT) not in sys.path:
    sys.path.insert(0, str(SUPPORT_ROOT))

from config_loader import get_admin_account, get_ui_base_url
from reporting_support import (
    append_result,
    build_report_context,
    extract_bug_side,
    extract_case_ids,
    summarize_failure,
    write_buglist,
)
from test_data import (
    create_menu,
    create_role,
    create_user,
    delete_menu_if_possible,
    delete_role_if_possible,
    disable_user,
)


@pytest.fixture(scope="session")
def env_config() -> dict:
    return {
        "ui_base_url": get_ui_base_url(),
    }


@pytest.fixture(scope="session")
def admin_account() -> dict:
    return get_admin_account()


@pytest.fixture(scope="session")
def api_base_url(env_config: dict) -> str:
    return env_config["ui_base_url"]


@pytest.fixture(scope="session")
def client(api_base_url: str) -> httpx.Client:
    with httpx.Client(base_url=api_base_url, timeout=20.0, follow_redirects=True) as client:
        yield client


@pytest.fixture(scope="session")
def admin_token(client: httpx.Client, admin_account: dict) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": admin_account["username"],
            "password": admin_account["password"],
        },
    )
    response.raise_for_status()
    payload = response.json()
    assert payload["code"] == 0, payload
    return payload["data"]["token"]


@pytest.fixture()
def auth_headers(admin_token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {admin_token}",
    }


@pytest.fixture()
def created_role(client: httpx.Client, auth_headers: dict[str, str]) -> dict:
    role = create_role(client, auth_headers)
    yield role
    delete_role_if_possible(client, auth_headers, role["id"])


@pytest.fixture()
def created_user(client: httpx.Client, auth_headers: dict[str, str], created_role: dict) -> dict:
    user = create_user(client, auth_headers, role_ids=[created_role["id"]])
    yield user
    disable_user(client, auth_headers, user["id"])


@pytest.fixture()
def disabled_user(client: httpx.Client, auth_headers: dict[str, str], created_user: dict) -> dict:
    disable_user(client, auth_headers, created_user["id"])
    detail_response = client.get(f"/api/v1/admin/users/{created_user['id']}", headers=auth_headers)
    detail_response.raise_for_status()
    payload = detail_response.json()
    assert payload["code"] == 0, payload
    return payload["data"]


@pytest.fixture()
def created_menu(client: httpx.Client, auth_headers: dict[str, str]) -> dict:
    menu = create_menu(client, auth_headers)
    yield menu
    delete_menu_if_possible(client, auth_headers, menu["id"])


def pytest_configure(config):
    config._easycms_report_context = build_report_context(
        root_dir=Path(__file__).resolve().parent,
        automation_name="接口自动化",
        default_bug_side="后端",
        screenshots_enabled=False,
    )

    metadata = getattr(config, "_metadata", None)
    if metadata is not None:
        metadata["项目"] = "EasyCMS 后台管理"
        metadata["测试类型"] = "接口自动化"
        metadata["执行套件"] = config._easycms_report_context["suite_name"]
        metadata["缺陷清单"] = str(config._easycms_report_context["buglist_path"])


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when not in {"setup", "call"}:
        return
    if report.when == "setup" and report.passed:
        return

    context = item.config._easycms_report_context
    append_result(
        context,
        {
            "nodeid": item.nodeid,
            "test_name": item.name,
            "outcome": report.outcome,
            "phase": report.when,
            "case_ids": extract_case_ids(item),
            "bug_side": extract_bug_side(item, context["default_bug_side"]),
            "failure_summary": summarize_failure(report.longreprtext) if report.failed else "",
            "screenshot_path": None,
        },
    )


def pytest_sessionfinish(session, exitstatus):
    context = session.config._easycms_report_context
    write_buglist(context, session.testscollected)


def pytest_html_report_title(report):
    report.title = "EasyCMS 后台管理接口自动化测试报告"
