from __future__ import annotations

from playwright.sync_api import Locator, Page, expect


class PermissionConfigPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def title_text(self) -> Locator:
        return self.page.get_by_text("配置权限")

    @property
    def reset_button(self) -> Locator:
        return self.page.get_by_role("button", name="重置")

    @property
    def save_button(self) -> Locator:
        return self.page.get_by_role("button").filter(has_text="权限")

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/permissions")
        expect(self.title_text).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.page.get_by_role("combobox").first).to_be_visible()
        expect(self.reset_button).to_be_visible()
        expect(self.page.get_by_text("选择功能模块", exact=True)).to_be_visible()
        expect(self.page.get_by_text("全选本模块", exact=True)).to_be_visible()

    def expect_permission_group_visible(self, group_name: str) -> None:
        expect(self.page.get_by_text(group_name)).to_be_visible()
