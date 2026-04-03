from __future__ import annotations

import pytest
from playwright.sync_api import expect

from pages.audit_log_page import AuditLogPage
from pages.menu_management_page import MenuManagementPage
from pages.permission_config_page import PermissionConfigPage
from pages.role_management_page import RoleManagementPage
from pages.user_management_page import UserManagementPage


@pytest.mark.case_ids("FUNC-001", "FUNC-004")
@pytest.mark.bug_side("前端")
def test_login_page_has_expected_controls(login_page):
    expect(login_page.page.get_by_text("登录系统")).to_be_visible()
    expect(login_page.username_input).to_be_visible()
    expect(login_page.password_input).to_be_visible()
    expect(login_page.remember_me_checkbox).to_be_visible()
    expect(login_page.forgot_password_button).to_be_visible()
    expect(login_page.login_button).to_be_visible()
    expect(login_page.sso_button).to_be_visible()
    expect(login_page.ldap_button).to_be_visible()


@pytest.mark.case_ids("FUNC-001")
@pytest.mark.bug_side("前端")
def test_login_smoke(login_page, admin_account):
    login_page.login(admin_account["username"], admin_account["password"])
    login_page.wait_for_success_redirect()

    assert "/login" not in login_page.page.url
    expect(login_page.welcome_back_banner).to_be_visible()


@pytest.mark.case_ids("FUNC-016", "FUNC-033", "FUNC-045", "FUNC-059", "FUNC-069")
@pytest.mark.bug_side("前端")
def test_backend_sidebar_navigation(admin_logged_in_page):
    page = admin_logged_in_page

    page.get_by_role("link", name="角色管理").click()
    page.wait_for_url("**/role")
    expect(page.get_by_role("heading", name="角色管理")).to_be_visible()

    page.get_by_role("link", name="权限配置").click()
    page.wait_for_url("**/permission")
    expect(page.get_by_text("配置权限", exact=True).first).to_be_visible()

    page.get_by_role("link", name="菜单管理").click()
    page.wait_for_url("**/menu")
    expect(page.get_by_role("heading", name="菜单管理")).to_be_visible()

    page.get_by_role("link", name="审计日志").click()
    page.wait_for_url("**/audit")
    expect(page.get_by_placeholder("搜索对象 ID（object_id）")).to_be_visible()

    page.get_by_role("link", name="用户管理").click()
    page.wait_for_url("**/user")
    expect(page.get_by_role("heading", name="用户管理")).to_be_visible()


@pytest.mark.case_ids("FUNC-016")
@pytest.mark.bug_side("前端")
def test_user_management_page_core_layout(admin_logged_in_page):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()
    users_page.assert_core_layout()


@pytest.mark.case_ids("FUNC-033")
@pytest.mark.bug_side("前端")
def test_role_management_page_core_layout(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="角色管理").click()

    roles_page = RoleManagementPage(page)
    roles_page.wait_until_loaded()
    roles_page.assert_core_layout()


@pytest.mark.case_ids("FUNC-059")
@pytest.mark.bug_side("前端")
def test_permission_config_page_core_layout(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="权限配置").click()

    permission_page = PermissionConfigPage(page)
    permission_page.wait_until_loaded()
    permission_page.assert_core_layout()


@pytest.mark.case_ids("FUNC-045")
@pytest.mark.bug_side("前端")
def test_menu_management_page_core_layout(admin_logged_in_page, page_urls):
    page = admin_logged_in_page
    page.goto(page_urls["menu"], wait_until="domcontentloaded")

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.assert_core_layout()


@pytest.mark.case_ids("FUNC-069")
@pytest.mark.bug_side("前端")
def test_audit_log_page_core_layout(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="审计日志").click()

    audit_page = AuditLogPage(page)
    audit_page.wait_until_loaded()
    audit_page.assert_core_layout()
