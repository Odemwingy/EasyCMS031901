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
        return self.page.get_by_placeholder("搜索对象 ID（object_id）")

    @property
    def export_button(self) -> Locator:
        return self.page.get_by_role("button", name="导出结果")

    @property
    def previous_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="上一页")

    @property
    def next_page_button(self) -> Locator:
        return self.page.get_by_role("button", name="下一页")

    @property
    def detail_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("日志详情"))

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/audit")
        expect(self.object_id_input).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.object_id_input).to_be_visible()
        expect(self.page.get_by_text("日志类型", exact=True).first).to_be_visible()
        expect(self.page.get_by_text("结果", exact=True).first).to_be_visible()
        expect(self.export_button).to_be_visible()
        expect(self.page.get_by_text("操作时间")).to_be_visible()
        expect(self.page.get_by_text("查看", exact=True).first).to_be_visible()
        expect(self.previous_page_button).to_be_visible()
        expect(self.next_page_button).to_be_visible()

    def expect_no_edit_or_delete_entry(self) -> None:
        expect(self.page.get_by_text("编辑")).to_have_count(0)
        expect(self.page.get_by_text("删除")).to_have_count(0)

    def open_first_detail_dialog(self) -> None:
        self.page.get_by_text("查看", exact=True).first.click()
        expect(self.detail_dialog).to_be_visible()

    def assert_detail_dialog_content(self) -> None:
        expect(self.detail_dialog.get_by_text("日志详情")).to_be_visible()
        expect(self.detail_dialog.get_by_text("基础信息")).to_be_visible()
        expect(self.detail_dialog.get_by_text("变更数据")).to_be_visible()
        expect(self.detail_dialog.locator("pre")).to_be_visible()
