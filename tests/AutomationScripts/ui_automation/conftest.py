from __future__ import annotations

import json
import sys
from pathlib import Path

import httpx
import pytest

SUPPORT_ROOT = Path(__file__).resolve().parents[1]
if str(SUPPORT_ROOT) not in sys.path:
    sys.path.insert(0, str(SUPPORT_ROOT))

from api_automation.test_data import create_menu, create_role, delete_menu_if_possible, delete_role_if_possible
from api_automation.test_data import unique_suffix
from config_loader import get_admin_account, get_page_url, get_ui_base_url
from pages.login_page import LoginPage
from reporting_support import (
    append_result,
    build_report_context,
    capture_failure_screenshot,
    extract_bug_side,
    extract_case_ids,
    summarize_failure,
    write_buglist,
)


@pytest.fixture(scope="session")
def env_config() -> dict:
    return {
        "ui_base_url": get_ui_base_url(),
    }


@pytest.fixture(scope="session")
def page_urls() -> dict:
    return {
        "login": get_page_url("login"),
        "user": get_page_url("user"),
        "role": get_page_url("role"),
        "permission": get_page_url("permission"),
        "menu": get_page_url("menu"),
        "audit": get_page_url("audit"),
    }


@pytest.fixture(scope="session")
def admin_account() -> dict:
    return get_admin_account()


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, env_config):
    return {
        **browser_context_args,
        "base_url": env_config["ui_base_url"],
        "viewport": {"width": 1440, "height": 900},
    }


@pytest.fixture(scope="session")
def backend_client(env_config: dict) -> httpx.Client:
    with httpx.Client(base_url=env_config["ui_base_url"], timeout=20.0, follow_redirects=True) as client:
        yield client


@pytest.fixture(scope="session")
def admin_api_session(backend_client: httpx.Client, admin_account: dict) -> dict:
    response = backend_client.post(
        "/api/v1/auth/login",
        json={
            "username": admin_account["username"],
            "password": admin_account["password"],
        },
    )
    response.raise_for_status()
    payload = response.json()
    assert payload["code"] == 0, payload
    return payload["data"]


@pytest.fixture(scope="session")
def admin_api_headers(admin_api_session: dict) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {admin_api_session['token']}",
    }


@pytest.fixture()
def login_page(page, page_urls):
    login = LoginPage(page)
    login.goto(page_urls["login"])
    return login


@pytest.fixture()
def admin_logged_in_page(page, page_urls, admin_api_session):
    auth_seed = json.dumps(
        {
            "token": admin_api_session["token"],
            "expiresAt": admin_api_session.get("expires_at"),
        },
        ensure_ascii=False,
    )
    page.add_init_script(
        script=f"""
        (() => {{
          const auth = {auth_seed};
          window.localStorage.setItem("easycms_token", auth.token);
          if (auth.expiresAt) {{
            window.localStorage.setItem("easycms_token_expires_at", auth.expiresAt);
          }}
        }})()
        """
    )
    page.goto(page_urls["user"], wait_until="domcontentloaded")
    page.wait_for_url("**/user")
    return page


@pytest.fixture()
def ui_created_role(backend_client: httpx.Client, admin_api_headers: dict[str, str]) -> dict:
    role = create_role(backend_client, admin_api_headers, name_prefix="ui_role_name", code_prefix="ui_role_code")
    yield role
    delete_role_if_possible(backend_client, admin_api_headers, role["id"])


@pytest.fixture()
def ui_created_root_menu(backend_client: httpx.Client, admin_api_headers: dict[str, str]) -> dict:
    menu = create_menu(
        backend_client,
        admin_api_headers,
        parent_id=None,
        node_type=1,
        name_prefix="ui_root_menu_name",
        permission_prefix="admin:ui-root",
    )
    yield menu
    delete_menu_if_possible(backend_client, admin_api_headers, menu["id"])


@pytest.fixture()
def ui_case_suffix() -> str:
    return unique_suffix()


def pytest_configure(config):
    config._easycms_report_context = build_report_context(
        root_dir=Path(__file__).resolve().parent,
        automation_name="功能自动化",
        default_bug_side="前端",
        screenshots_enabled=True,
    )

    metadata = getattr(config, "_metadata", None)
    if metadata is not None:
        metadata["项目"] = "EasyCMS 后台管理"
        metadata["测试类型"] = "功能自动化"
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
    screenshot_path = None
    if report.failed and context["screenshots_enabled"]:
        screenshot_path = capture_failure_screenshot(item, context["screenshots_dir"])

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
            "screenshot_path": screenshot_path,
        },
    )


def pytest_sessionfinish(session, exitstatus):
    context = session.config._easycms_report_context
    write_buglist(context, session.testscollected)


def pytest_html_report_title(report):
    report.title = "EasyCMS 后台管理功能自动化测试报告"
