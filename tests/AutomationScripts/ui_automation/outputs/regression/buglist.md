# 功能自动化regression执行缺陷清单

- 测试类型：功能自动化
- 套件：regression
- 总收集用例数：20
- 执行通过：7
- 执行失败：13
- 执行跳过：0
- HTML 报告：E:\AIautomation\Testrelated\ui_automation\outputs\regression\测试报告.html

## 缺陷列表

### 1. test_user_management_filter_controls_exist[chromium]

- 用例编号：FUNC-018
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: strict mode violation: get_by_text("所属组织") resolved to 2 elements:
    1) <span class="px-3 py-1.5 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium shrink-0 whitespace-nowrap">所属组织</span> aka locator("span").filter(has_text="所属组织")
    2) <th class="px-4 py-3 font-medium">所属组织</th> aka get_by_role("columnheader", name="所属组织")
Call log:
- 测试节点：tests/test_regression.py::test_user_management_filter_controls_exist[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_management_filter_controls_exist_chromium.png

### 2. test_user_management_status_and_pagination_controls[chromium]

- 用例编号：FUNC-019、FUNC-020
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: hidden
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for get_by_text("启用").first
    9 × locator resolved to <option value="1">启用</option>
- 测试节点：tests/test_regression.py::test_user_management_status_and_pagination_controls[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_management_status_and_pagination_controls_chromium.png

### 3. test_user_create_dialog_displays_expected_fields[chromium]

- 用例编号：FUNC-021
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for get_by_role("heading", name="用户管理")
- 测试节点：tests/test_regression.py::test_user_create_dialog_displays_expected_fields[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_displays_expected_fields_chromium.png

### 4. test_user_create_dialog_empty_submit_shows_required_validation[chromium]

- 用例编号：FUNC-021
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for get_by_role("heading", name="用户管理")
- 测试节点：tests/test_regression.py::test_user_create_dialog_empty_submit_shows_required_validation[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_empty_submit_shows_required_validation_chromium.png

### 5. test_user_create_dialog_can_create_internal_user[chromium]

- 用例编号：FUNC-021
- 缺陷归属：前端
- 失败描述：Raise the `HTTPStatusError` if one occurred.
>       raise HTTPStatusError(message, request=request, response=self)
httpx.HTTPStatusError: Server error '500 Internal Server Error' for url 'http://192.168.18.79:5173/api/v1/admin/roles'
For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
D:\tools\Python\Lib\site-packages\httpx\_models.py:829: HTTPStatusError
- 测试节点：tests/test_regression.py::test_user_create_dialog_can_create_internal_user[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_can_create_internal_user_chromium.png

### 6. test_role_management_supports_search_and_shows_preset_role[chromium]

- 用例编号：FUNC-034、FUNC-035
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Locator.click: Timeout 30000ms exceeded.
    Call log:
      - waiting for get_by_role("link", name="角色管理")
D:\tools\Python\Lib\site-packages\playwright\_impl\_connection.py:559: TimeoutError
- 测试节点：tests/test_regression.py::test_role_management_supports_search_and_shows_preset_role[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_management_supports_search_and_shows_preset_role_chromium.png

### 7. test_menu_management_displays_backend_root_node_and_no_expand_all[chromium]

- 用例编号：FUNC-045、FUNC-046
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: strict mode violation: get_by_text("后台管理") resolved to 3 elements:
    1) <a href="/users" data-discover="true" class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0 bg-indigo-600 text-white">…</a> aka get_by_role("navigation").get_by_role("link", name="后台管理")
    2) <h2 class="text-sm font-bold text-gray-800 uppercase tracking-wider">后台管理</h2> aka get_by_role("heading", name="后台管理")
    3) <a href="/users" data-discover="true" class="hover:text-indigo-600 transition-colors">后台管理</a> aka get_by_role("main").get_by_role("link", name="后台管理")
- 测试节点：tests/test_regression.py::test_menu_management_displays_backend_root_node_and_no_expand_all[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_management_displays_backend_root_node_and_no_expand_all_chromium.png

### 8. test_menu_create_dialog_displays_expected_fields[chromium]

- 用例编号：FUNC-047
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for locator("[role='dialog']").filter(has=get_by_text("新建菜单节点"))
- 测试节点：tests/test_regression.py::test_menu_create_dialog_displays_expected_fields[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_displays_expected_fields_chromium.png

### 9. test_menu_create_dialog_empty_submit_shows_required_validation[chromium]

- 用例编号：FUNC-047
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for locator("[role='dialog']").filter(has=get_by_text("新建菜单节点"))
- 测试节点：tests/test_regression.py::test_menu_create_dialog_empty_submit_shows_required_validation[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_empty_submit_shows_required_validation_chromium.png

### 10. test_menu_create_dialog_requires_route_and_component_for_menu_item[chromium]

- 用例编号：FUNC-048
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for locator("[role='dialog']").filter(has=get_by_text("新建菜单节点"))
- 测试节点：tests/test_regression.py::test_menu_create_dialog_requires_route_and_component_for_menu_item[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_requires_route_and_component_for_menu_item_chromium.png

### 11. test_menu_create_dialog_can_create_root_directory[chromium]

- 用例编号：FUNC-047
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Locator.click: Timeout 30000ms exceeded.
    Call log:
      - waiting for get_by_role("link", name="菜单管理")
        - waiting for navigation to finish...
        - navigated to "http://192.168.18.79:5173/login"
        - waiting for" http://192.168.18.79:5173/login" navigation to finish...
- 测试节点：tests/test_regression.py::test_menu_create_dialog_can_create_root_directory[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_can_create_root_directory_chromium.png

### 12. test_menu_edit_dialog_shows_readonly_permission_and_type_hint[chromium]

- 用例编号：FUNC-052
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for locator("[role='dialog']").filter(has=get_by_text("编辑菜单节点"))
- 测试节点：tests/test_regression.py::test_menu_edit_dialog_shows_readonly_permission_and_type_hint[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_edit_dialog_shows_readonly_permission_and_type_hint_chromium.png

### 13. test_audit_log_page_shows_records_and_has_no_edit_delete[chromium]

- 用例编号：FUNC-069、FUNC-070、FUNC-074
- 缺陷归属：前端
- 失败描述：AssertionError: Locator expected to have count '0'
Actual value: 2
Call log:
  - Expect "to_have_count" with timeout 5000ms
  - waiting for get_by_text("删除")
    9 × locator resolved to 2 elements
- 测试节点：tests/test_regression.py::test_audit_log_page_shows_records_and_has_no_edit_delete[chromium]
- 失败截图：E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_audit_log_page_shows_records_and_has_no_edit_delete_chromium.png
