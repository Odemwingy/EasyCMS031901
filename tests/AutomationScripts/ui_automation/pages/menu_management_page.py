from __future__ import annotations

from playwright.sync_api import Locator, Page, expect


class MenuManagementPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def page_title(self) -> Locator:
        return self.page.get_by_role("heading", name="菜单管理")

    @property
    def create_root_button(self) -> Locator:
        return self.page.get_by_role("button", name="新建根节点")

    @property
    def create_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("新建菜单节点"))

    @property
    def edit_dialog(self) -> Locator:
        return self.page.locator("[role='dialog']").filter(has=self.page.get_by_text("编辑菜单节点"))

    def wait_until_loaded(self) -> None:
        self.page.wait_for_url("**/menus")
        expect(self.page_title).to_be_visible()

    def assert_core_layout(self) -> None:
        expect(self.create_root_button).to_be_visible()
        expect(self.page.get_by_text("名称 / 类型 / 状态")).to_be_visible()
        expect(self.page.get_by_text("权限标识")).to_be_visible()
        expect(self.page.get_by_text("路由路径")).to_be_visible()
        expect(self.page.get_by_text("操作")).to_be_visible()

    def expect_node_visible(self, node_name: str) -> None:
        expect(self.page.get_by_text(node_name)).to_be_visible()

    def expect_no_expand_all_button(self) -> None:
        expect(self.page.get_by_role("button", name="展开全部")).to_have_count(0)
        expect(self.page.get_by_role("button", name="收起全部")).to_have_count(0)

    def open_create_root_dialog(self) -> None:
        self.create_root_button.click()
        expect(self.create_dialog).to_be_visible()

    def assert_create_dialog_fields(self) -> None:
        dialog = self.create_dialog
        expect(dialog.get_by_text("新建菜单节点")).to_be_visible()
        expect(dialog.get_by_text("父节点")).to_be_visible()
        expect(dialog.get_by_text("节点类型")).to_be_visible()
        expect(dialog.get_by_text("名称 *")).to_be_visible()
        expect(dialog.get_by_text("权限标识 *")).to_be_visible()
        expect(dialog.get_by_text("路由路径（type=2 必填）")).to_be_visible()
        expect(dialog.get_by_text("组件路径（type=2 必填）")).to_be_visible()
        expect(dialog.get_by_role("button", name="取消")).to_be_visible()
        expect(dialog.get_by_role("button", name="创建")).to_be_visible()

    def fill_create_dialog_basic_menu_fields(self, *, name: str, permission: str) -> None:
        inputs = self.create_dialog.locator("input")
        inputs.nth(0).fill(name)
        inputs.nth(1).fill(permission)

    def select_create_dialog_node_type(self, label: str) -> None:
        self.create_dialog.locator("[role='combobox']").nth(1).click()
        self.page.get_by_role("option", name=label).click()

    def fill_create_dialog_root_directory(self, *, name: str, permission: str) -> None:
        self.select_create_dialog_node_type("目录")
        self.fill_create_dialog_basic_menu_fields(name=name, permission=permission)

    def submit_create_dialog(self) -> None:
        self.create_dialog.get_by_role("button", name="创建").click()

    def missing_name_or_permission_toast(self) -> Locator:
        return self.page.get_by_text("请填写菜单名称和权限标识")

    def missing_route_or_component_toast(self) -> Locator:
        return self.page.get_by_text("菜单项类型必须填写路由路径和组件路径")

    def open_first_edit_dialog(self) -> None:
        self.page.get_by_title("编辑").first.click()
        expect(self.edit_dialog).to_be_visible()

    def assert_edit_dialog_readonly_fields(self) -> None:
        dialog = self.edit_dialog
        expect(dialog.get_by_text("编辑菜单节点")).to_be_visible()
        expect(dialog.get_by_text("permission 和 type 为创建后不可改字段")).to_be_visible()
        disabled_inputs = dialog.locator("input:disabled")
        expect(disabled_inputs).to_have_count(1)

    def create_success_toast(self) -> Locator:
        return self.page.get_by_text("菜单创建成功")
