from __future__ import annotations

from playwright.sync_api import Locator, Page, expect


class RoleManagementPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def page_title(self) -> Locator:
        return self.page.get_by_role("heading", name="角色管理")

    @property
    def search_input(self) -> Locator:
        return self.page.get_by_placeholder("搜索角色名称 / 编码")

    @property
    def create_role_button(self) -> Locator:
        return self.page.get_by_role("button", name="新建角色")

    @property
    def previous_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="上一页")

    @property
    def next_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="下一页")

    @property
    def create_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("新建角色"))

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/role")
        expect(self.page_title).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.search_input).to_be_visible()
        expect(self.page.get_by_text("状态")).to_be_visible()
        expect(self.create_role_button).to_be_visible()
        expect(self.previous_page_button).to_be_visible()
        expect(self.next_page_button).to_be_visible()

    def search_role(self, keyword: str) -> None:
        self.search_input.fill(keyword)
        self.page.wait_for_timeout(500)

    def expect_role_card_visible(self, role_name: str) -> None:
        expect(self.page.get_by_role("link", name=role_name).first).to_be_visible()

    def expect_preset_tag_visible(self) -> None:
        expect(self.page.get_by_text("预置")).to_be_visible()

    def no_delete_entry_visible(self) -> None:
        expect(self.page.get_by_text("删除角色")).to_have_count(0)

    def open_create_dialog(self) -> None:
        self.create_role_button.click()
        expect(self.create_dialog).to_be_visible()

    def assert_create_dialog_fields(self) -> None:
        dialog = self.create_dialog
        expect(dialog.get_by_text("新建角色")).to_be_visible()
        expect(dialog.get_by_text("创建新角色并配置权限范围")).to_be_visible()
        expect(dialog.get_by_text("角色名称 *")).to_be_visible()
        expect(dialog.get_by_text("角色编码 *")).to_be_visible()
        expect(dialog.get_by_text("角色说明")).to_be_visible()
        expect(dialog.get_by_role("button", name="取消")).to_be_visible()
        expect(dialog.get_by_role("button", name="确定")).to_be_visible()

    def submit_empty_create_dialog(self) -> None:
        self.create_dialog.get_by_role("button", name="确定").click()

    def required_fields_toast(self) -> Locator:
        return self.page.get_by_text("请填写角色名称和角色编码")

    def fill_create_dialog(self, *, name: str, code: str, description: str = "") -> None:
        dialog = self.create_dialog
        dialog.locator("input").nth(0).fill(name)
        dialog.locator("input").nth(1).fill(code)
        if description:
            dialog.locator("textarea").fill(description)

    def submit_create_dialog(self) -> None:
        self.create_dialog.get_by_role("button", name="确定").click()

    def create_success_toast(self) -> Locator:
        return self.page.get_by_text("角色创建成功")
