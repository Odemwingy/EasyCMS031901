# 功能自动化regression执行缺陷清单

- 测试类型：功能自动化
- 套件：regression
- 总收集用例数：20
- 执行通过：5
- 执行失败：7
- 执行跳过：0
- HTML 报告：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\测试报告.html

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
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_management_filter_controls_exist_chromium.png

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
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_management_status_and_pagination_controls_chromium.png

### 3. test_role_management_supports_search_and_shows_preset_role[chromium]

- 用例编号：FUNC-034、FUNC-035
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_regression.py::test_role_management_supports_search_and_shows_preset_role[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_management_supports_search_and_shows_preset_role_chromium.png

### 4. test_role_create_dialog_displays_expected_fields[chromium]

- 用例编号：FUNC-036
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_regression.py::test_role_create_dialog_displays_expected_fields[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_create_dialog_displays_expected_fields_chromium.png

### 5. test_role_create_dialog_empty_submit_shows_required_validation[chromium]

- 用例编号：FUNC-036、FUNC-037
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_regression.py::test_role_create_dialog_empty_submit_shows_required_validation[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_create_dialog_empty_submit_shows_required_validation_chromium.png

### 6. test_role_create_dialog_can_create_role[chromium]

- 用例编号：FUNC-036
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_regression.py::test_role_create_dialog_can_create_role[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_create_dialog_can_create_role_chromium.png

### 7. test_permission_config_displays_backend_permission_groups[chromium]

- 用例编号：FUNC-059、FUNC-060
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/permissions" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_regression.py::test_permission_config_displays_backend_permission_groups[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_permission_config_displays_backend_permission_groups_chromium.png
