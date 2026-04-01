# 功能自动化smoke执行缺陷清单

- 测试类型：功能自动化
- 套件：smoke
- 总收集用例数：8
- 执行通过：3
- 执行失败：5
- 执行跳过：0
- HTML 报告：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\测试报告.html

## 缺陷列表

### 1. test_login_smoke[chromium]

- 用例编号：FUNC-001
- 缺陷归属：前端
- 失败描述：AssertionError: assert False
 +  where False = <built-in method endswith of str object at 0x000002952A7C5110>(('192.168.18.79:5173', '/users'))
 +    where <built-in method endswith of str object at 0x000002952A7C5110> = 'http://192.168.18.79:5173/backend/user'.endswith
 +      where 'http://192.168.18.79:5173/backend/user' = <built-in method rstrip of str object at 0x000002952A7C5110>('/')
 +        where <built-in method rstrip of str object at 0x000002952A7C5110> = 'http://192.168.18.79:5173/backend/user'.rstrip
 +          where 'http://192.168.18.79:5173/backend/user' = <Page url='http://192.168.18.79:5173/backend/user'>.url
- 测试节点：tests/test_smoke.py::test_login_smoke[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\screenshots\tests_test_smoke.py_test_login_smoke_chromium.png

### 2. test_backend_sidebar_navigation[chromium]

- 用例编号：FUNC-016、FUNC-033、FUNC-045、FUNC-059、FUNC-069
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_smoke.py::test_backend_sidebar_navigation[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\screenshots\tests_test_smoke.py_test_backend_sidebar_navigation_chromium.png

### 3. test_role_management_page_core_layout[chromium]

- 用例编号：FUNC-033
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/roles" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_smoke.py::test_role_management_page_core_layout[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\screenshots\tests_test_smoke.py_test_role_management_page_core_layout_chromium.png

### 4. test_permission_config_page_core_layout[chromium]

- 用例编号：FUNC-059
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/permissions" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_smoke.py::test_permission_config_page_core_layout[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\screenshots\tests_test_smoke.py_test_permission_config_page_core_layout_chromium.png

### 5. test_audit_log_page_core_layout[chromium]

- 用例编号：FUNC-069
- 缺陷归属：前端
- 失败描述：playwright._impl._errors.TimeoutError: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/audit-log" until 'load'
============================================================
D:\tools\Python\Lib\site-packages\playwright\_impl\_frame.py:239: TimeoutError
- 测试节点：tests/test_smoke.py::test_audit_log_page_core_layout[chromium]
- 失败截图：E:\AIautomation\EasyCMS031901\tests\AutomationScripts\ui_automation\outputs\smoke\screenshots\tests_test_smoke.py_test_audit_log_page_core_layout_chromium.png
