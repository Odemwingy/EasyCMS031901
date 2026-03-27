from __future__ import annotations

import pytest
from playwright.sync_api import expect

from api_automation.test_data import (
    delete_menu_by_permission_if_possible,
    delete_role_by_code_if_possible,
    disable_user_by_username_if_possible,
)
from pages.audit_log_page import AuditLogPage
from pages.menu_management_page import MenuManagementPage
from pages.permission_config_page import PermissionConfigPage
from pages.role_management_page import RoleManagementPage
from pages.user_management_page import UserManagementPage


@pytest.mark.case_ids("FUNC-004")
@pytest.mark.bug_side("前端")
def test_login_invalid_password_shows_feedback(login_page, admin_account):
    login_page.login(admin_account["username"], "WrongPassword123")

    expect(login_page.invalid_credentials_feedback()).to_be_visible()
    assert "/login" in login_page.page.url


@pytest.mark.case_ids("FUNC-017")
@pytest.mark.bug_side("前端")
def test_user_management_can_search_admin(admin_logged_in_page, admin_account):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()
    users_page.search_user(admin_account["username"])
    users_page.expect_user_visible(admin_account["username"])


@pytest.mark.case_ids("FUNC-018")
@pytest.mark.bug_side("前端")
def test_user_management_filter_controls_exist(admin_logged_in_page):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()

    expect(users_page.page.get_by_text("所属组织")).to_be_visible()
    expect(users_page.page.get_by_text("用户类型")).to_be_visible()
    expect(users_page.page.get_by_text("角色")).to_be_visible()
    expect(users_page.page.get_by_text("状态")).to_be_visible()


@pytest.mark.case_ids("FUNC-019", "FUNC-020")
@pytest.mark.bug_side("前端")
def test_user_management_status_and_pagination_controls(admin_logged_in_page, admin_account):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()
    users_page.search_user(admin_account["username"])

    expect(users_page.first_status_tag()).to_be_visible()
    expect(users_page.row_for_user(admin_account["username"])).to_be_visible()
    expect(users_page.previous_page_button).to_be_visible()
    expect(users_page.next_page_button).to_be_visible()


@pytest.mark.case_ids("FUNC-021")
@pytest.mark.bug_side("前端")
def test_user_create_dialog_displays_expected_fields(admin_logged_in_page):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()
    users_page.open_create_dialog()
    users_page.assert_create_dialog_fields()


@pytest.mark.case_ids("FUNC-021")
@pytest.mark.bug_side("前端")
def test_user_create_dialog_empty_submit_shows_required_validation(admin_logged_in_page):
    users_page = UserManagementPage(admin_logged_in_page)
    users_page.wait_until_loaded()
    users_page.open_create_dialog()
    users_page.submit_empty_create_dialog()
    expect(users_page.required_fields_toast()).to_be_visible()


@pytest.mark.case_ids("FUNC-021")
@pytest.mark.bug_side("前端")
def test_user_create_dialog_can_create_internal_user(
    admin_logged_in_page,
    backend_client,
    admin_api_headers,
    ui_created_role,
    ui_case_suffix,
):
    username = f"ui_user_{ui_case_suffix}"
    try:
        users_page = UserManagementPage(admin_logged_in_page)
        users_page.wait_until_loaded()
        users_page.open_create_dialog()
        users_page.fill_create_dialog(
            username=username,
            name=f"UI用户{ui_case_suffix}",
            password="Abc12345",
            org_id="org_ui_auto",
            role_name=ui_created_role["name"],
        )
        users_page.submit_create_dialog()

        expect(users_page.create_success_toast()).to_be_visible()
        users_page.search_user(username)
        users_page.expect_user_visible(username)
    finally:
        disable_user_by_username_if_possible(backend_client, admin_api_headers, username)


@pytest.mark.case_ids("FUNC-034", "FUNC-035")
@pytest.mark.bug_side("前端")
def test_role_management_supports_search_and_shows_preset_role(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="角色管理").click()

    roles_page = RoleManagementPage(page)
    roles_page.wait_until_loaded()
    roles_page.search_role("系统管理员")
    roles_page.expect_role_card_visible("系统管理员")
    roles_page.expect_preset_tag_visible()
    roles_page.no_delete_entry_visible()


@pytest.mark.case_ids("FUNC-036")
@pytest.mark.bug_side("前端")
def test_role_create_dialog_displays_expected_fields(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="角色管理").click()

    roles_page = RoleManagementPage(page)
    roles_page.wait_until_loaded()
    roles_page.open_create_dialog()
    roles_page.assert_create_dialog_fields()


@pytest.mark.case_ids("FUNC-036", "FUNC-037")
@pytest.mark.bug_side("前端")
def test_role_create_dialog_empty_submit_shows_required_validation(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="角色管理").click()

    roles_page = RoleManagementPage(page)
    roles_page.wait_until_loaded()
    roles_page.open_create_dialog()
    roles_page.submit_empty_create_dialog()
    expect(roles_page.required_fields_toast()).to_be_visible()


@pytest.mark.case_ids("FUNC-036")
@pytest.mark.bug_side("前端")
def test_role_create_dialog_can_create_role(
    admin_logged_in_page,
    backend_client,
    admin_api_headers,
    ui_case_suffix,
):
    role_name = f"UI角色{ui_case_suffix}"
    role_code = f"ui_role_{ui_case_suffix}"
    try:
        page = admin_logged_in_page
        page.get_by_role("link", name="角色管理").click()

        roles_page = RoleManagementPage(page)
        roles_page.wait_until_loaded()
        roles_page.open_create_dialog()
        roles_page.fill_create_dialog(name=role_name, code=role_code, description="created by UI regression")
        roles_page.submit_create_dialog()

        expect(roles_page.create_success_toast()).to_be_visible()
        roles_page.search_role(role_name)
        roles_page.expect_role_card_visible(role_name)
    finally:
        delete_role_by_code_if_possible(backend_client, admin_api_headers, role_code)


@pytest.mark.case_ids("FUNC-059", "FUNC-060")
@pytest.mark.bug_side("前端")
def test_permission_config_displays_backend_permission_groups(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="权限配置").click()

    permission_page = PermissionConfigPage(page)
    permission_page.wait_until_loaded()
    permission_page.expect_permission_group_visible("用户管理")
    permission_page.expect_permission_group_visible("角色管理")
    permission_page.expect_permission_group_visible("菜单管理")


@pytest.mark.case_ids("FUNC-045", "FUNC-046")
@pytest.mark.bug_side("前端")
def test_menu_management_displays_backend_root_node_and_no_expand_all(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="菜单管理").click()

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.expect_node_visible("后台管理")
    menu_page.expect_no_expand_all_button()


@pytest.mark.case_ids("FUNC-047")
@pytest.mark.bug_side("前端")
def test_menu_create_dialog_displays_expected_fields(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="菜单管理").click()

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.open_create_root_dialog()
    menu_page.assert_create_dialog_fields()


@pytest.mark.case_ids("FUNC-047")
@pytest.mark.bug_side("前端")
def test_menu_create_dialog_empty_submit_shows_required_validation(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="菜单管理").click()

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.open_create_root_dialog()
    menu_page.submit_create_dialog()
    expect(menu_page.missing_name_or_permission_toast()).to_be_visible()


@pytest.mark.case_ids("FUNC-048")
@pytest.mark.bug_side("前端")
def test_menu_create_dialog_requires_route_and_component_for_menu_item(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="菜单管理").click()

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.open_create_root_dialog()
    menu_page.fill_create_dialog_basic_menu_fields(name="自动化菜单校验", permission="admin:auto:ui-check")
    menu_page.submit_create_dialog()
    expect(menu_page.missing_route_or_component_toast()).to_be_visible()


@pytest.mark.case_ids("FUNC-047")
@pytest.mark.bug_side("前端")
def test_menu_create_dialog_can_create_root_directory(
    admin_logged_in_page,
    backend_client,
    admin_api_headers,
    ui_case_suffix,
):
    menu_name = f"UI根目录{ui_case_suffix}"
    permission = f"admin:ui-root:{ui_case_suffix}"
    try:
        page = admin_logged_in_page
        page.get_by_role("link", name="菜单管理").click()

        menu_page = MenuManagementPage(page)
        menu_page.wait_until_loaded()
        menu_page.open_create_root_dialog()
        menu_page.fill_create_dialog_root_directory(name=menu_name, permission=permission)
        menu_page.submit_create_dialog()

        expect(menu_page.create_success_toast()).to_be_visible()
        menu_page.expect_node_visible(menu_name)
    finally:
        delete_menu_by_permission_if_possible(backend_client, admin_api_headers, permission)


@pytest.mark.case_ids("FUNC-052")
@pytest.mark.bug_side("前端")
def test_menu_edit_dialog_shows_readonly_permission_and_type_hint(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="菜单管理").click()

    menu_page = MenuManagementPage(page)
    menu_page.wait_until_loaded()
    menu_page.open_first_edit_dialog()
    menu_page.assert_edit_dialog_readonly_fields()


@pytest.mark.case_ids("FUNC-069", "FUNC-070", "FUNC-074")
@pytest.mark.bug_side("前端")
def test_audit_log_page_shows_records_and_has_no_edit_delete(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="审计日志").click()

    audit_page = AuditLogPage(page)
    audit_page.wait_until_loaded()
    audit_page.page.get_by_text("登录").first.wait_for()
    audit_page.expect_no_edit_or_delete_entry()


@pytest.mark.case_ids("FUNC-070")
@pytest.mark.bug_side("前端")
def test_audit_log_detail_dialog_displays_json_content(admin_logged_in_page):
    page = admin_logged_in_page
    page.get_by_role("link", name="审计日志").click()

    audit_page = AuditLogPage(page)
    audit_page.wait_until_loaded()
    audit_page.open_first_detail_dialog()
    audit_page.assert_detail_dialog_content()
