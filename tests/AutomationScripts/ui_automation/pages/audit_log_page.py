from __future__ import annotations

from playwright.sync_api import Locator, Page, expect


class AuditLogPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def page_title(self) -> Locator:
        return self.page.get_by_text("审计日志", exact=True).last

    @property
    def object_id_input(self) -> Locator:
        return self.page.get_by_placeholder("按对象 ID 查询（object_id）")

    @property
    def export_button(self) -> Locator:
        return self.page.get_by_role("button", name="导出日志")

    @property
    def previous_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="上一页")

    @property
    def next_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="下一页")

    @property
    def detail_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("审计日志详情"))

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/audit-log")
        expect(self.object_id_input).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.object_id_input).to_be_visible()
        expect(self.page.get_by_text("全部类型")).to_be_visible()
        expect(self.page.get_by_text("全部结果")).to_be_visible()
        expect(self.export_button).to_be_visible()
        expect(self.page.get_by_text("日志ID")).to_be_visible()
        expect(self.page.get_by_role("button", name="查看详情").first).to_be_visible()
        expect(self.previous_page_button).to_be_visible()
        expect(self.next_page_button).to_be_visible()

    def expect_no_edit_or_delete_entry(self) -> None:
        expect(self.page.get_by_text("编辑")).to_have_count(0)
        expect(self.page.get_by_text("删除")).to_have_count(0)

    def open_first_detail_dialog(self) -> None:
        self.page.get_by_role("button", name="查看详情").first.click()
        expect(self.detail_dialog).to_be_visible()

    def assert_detail_dialog_content(self) -> None:
        expect(self.detail_dialog.get_by_text("审计日志详情")).to_be_visible()
        expect(self.detail_dialog.get_by_text("字段变更前后值与请求链路信息")).to_be_visible()
        expect(self.detail_dialog.locator("pre")).to_be_visible()
