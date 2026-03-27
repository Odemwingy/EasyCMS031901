from __future__ import annotations

from playwright.sync_api import Locator, Page, expect


class UserManagementPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def page_title(self) -> Locator:
        return self.page.get_by_role("heading", name="用户管理")

    @property
    def search_input(self) -> Locator:
        return self.page.get_by_placeholder("搜索用户名 / 姓名")

    @property
    def batch_disable_button(self) -> Locator:
        return self.page.get_by_role("button", name="批量停用")

    @property
    def create_user_button(self) -> Locator:
        return self.page.get_by_role("button", name="新建用户")

    @property
    def previous_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="上一页")

    @property
    def next_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="下一页")

    @property
    def create_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("新建用户"))

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/users")
        expect(self.page_title).to_be_visible()
        expect(self.search_input).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.page_title).to_be_visible()
        expect(self.page.get_by_text("所属组织", exact=True).first).to_be_visible()
        expect(self.page.get_by_text("用户类型", exact=True).first).to_be_visible()
        expect(self.page.get_by_text("角色", exact=True).first).to_be_visible()
        expect(self.page.get_by_text("状态", exact=True).first).to_be_visible()
        expect(self.batch_disable_button).to_be_visible()
        expect(self.create_user_button).to_be_visible()
        expect(self.page.get_by_text("用户名 / 姓名", exact=True)).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="绑定角色")).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="最近登录")).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="操作")).to_be_visible()
        expect(self.previous_page_button).to_be_visible()
        expect(self.next_page_button).to_be_visible()

    def search_user(self, keyword: str) -> None:
        self.search_input.fill(keyword)
        self.page.wait_for_timeout(500)

    def clear_search(self) -> None:
        self.search_input.clear()
        self.page.wait_for_timeout(300)

    def expect_user_visible(self, username: str) -> None:
        expect(self.page.get_by_text(username)).to_be_visible()

    def first_status_tag(self) -> Locator:
        return self.page.get_by_text("启用").first

    def row_for_user(self, username: str) -> Locator:
        return self.page.locator("tr").filter(has=self.page.get_by_text(username))

    def open_create_dialog(self) -> None:
        self.create_user_button.click()
        expect(self.create_dialog).to_be_visible()

    def assert_create_dialog_fields(self) -> None:
        dialog = self.create_dialog
        expect(dialog.get_by_text("新建用户")).to_be_visible()
        expect(dialog.get_by_text("创建新用户账号并分配角色")).to_be_visible()
        expect(dialog.get_by_text("用户名 *")).to_be_visible()
        expect(dialog.get_by_text("姓名 *")).to_be_visible()
        expect(dialog.get_by_text("初始密码 *")).to_be_visible()
        expect(dialog.get_by_text("用户类型")).to_be_visible()
        expect(dialog.get_by_text("所属组织 *")).to_be_visible()
        expect(dialog.get_by_text("角色 *")).to_be_visible()
        expect(dialog.get_by_role("button", name="取消")).to_be_visible()
        expect(dialog.get_by_role("button", name="确定")).to_be_visible()

    def submit_empty_create_dialog(self) -> None:
        self.create_dialog.get_by_role("button", name="确定").click()

    def required_fields_toast(self) -> Locator:
        return self.page.get_by_text("请完整填写必填字段")

    def fill_create_dialog(
        self,
        *,
        username: str,
        name: str,
        password: str,
        org_id: str,
        role_name: str,
    ) -> None:
        dialog = self.create_dialog
        inputs = dialog.locator("input")
        inputs.nth(0).fill(username)
        inputs.nth(1).fill(name)
        inputs.nth(2).fill(password)
        inputs.nth(3).fill(org_id)

        dialog.locator("[role='combobox']").nth(1).click()
        self.page.get_by_role("option", name=role_name).click()

    def submit_create_dialog(self) -> None:
        self.create_dialog.get_by_role("button", name="确定").click()

    def create_success_toast(self) -> Locator:
        return self.page.get_by_text("用户创建成功")
