# 接口自动化regression执行缺陷清单

- 测试类型：接口自动化
- 套件：regression
- 总收集用例数：12
- 执行通过：6
- 执行失败：6
- 执行跳过：0
- HTML 报告：E:\AIautomation\Testrelated\api_automation\outputs\regression\测试报告.html

## 缺陷列表

### 1. test_users_list_rejects_per_page_over_limit

- 用例编号：API-032
- 缺陷归属：后端
- 失败描述：assert 0 == 1001
tests\test_regression.py:59: AssertionError
- 测试节点：tests/test_regression.py::test_users_list_rejects_per_page_over_limit
- 失败截图：无截图

### 2. test_create_user_duplicate_username_returns_validation_error

- 用例编号：API-038
- 缺陷归属：后端
- 失败描述：AssertionError: assert '用户名已存在' in '参数校验失败'
tests\test_regression.py:111: AssertionError
- 测试节点：tests/test_regression.py::test_create_user_duplicate_username_returns_validation_error
- 失败截图：无截图

### 3. test_create_role_duplicate_name_and_code_return_validation_error

- 用例编号：API-060、API-061
- 缺陷归属：后端
- 失败描述：assert 500 in (200, 400, 409, 422)
 +  where 500 = <Response [500 Internal Server Error]>.status_code
tests\test_regression.py:137: AssertionError
- 测试节点：tests/test_regression.py::test_create_role_duplicate_name_and_code_return_validation_error
- 失败截图：无截图

### 4. test_update_role_ignores_code_field

- 用例编号：API-064
- 缺陷归属：后端
- 失败描述：Raise the `HTTPStatusError` if one occurred.
>       raise HTTPStatusError(message, request=request, response=self)
httpx.HTTPStatusError: Server error '500 Internal Server Error' for url 'http://192.168.18.79:5173/api/v1/admin/roles'
For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
D:\tools\Python\Lib\site-packages\httpx\_models.py:829: HTTPStatusError
- 测试节点：tests/test_regression.py::test_update_role_ignores_code_field
- 失败截图：无截图

### 5. test_new_role_permissions_default_to_empty_list

- 用例编号：API-073
- 缺陷归属：后端
- 失败描述：Raise the `HTTPStatusError` if one occurred.
>       raise HTTPStatusError(message, request=request, response=self)
httpx.HTTPStatusError: Server error '500 Internal Server Error' for url 'http://192.168.18.79:5173/api/v1/admin/roles'
For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
D:\tools\Python\Lib\site-packages\httpx\_models.py:829: HTTPStatusError
- 测试节点：tests/test_regression.py::test_new_role_permissions_default_to_empty_list
- 失败截图：无截图

### 6. test_menu_tree_include_disabled_flag_controls_disabled_nodes

- 用例编号：API-077、API-078
- 缺陷归属：后端
- 失败描述：Raise the `HTTPStatusError` if one occurred.
>       raise HTTPStatusError(message, request=request, response=self)
httpx.HTTPStatusError: Server error '500 Internal Server Error' for url 'http://192.168.18.79:5173/api/v1/admin/menus'
For more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
D:\tools\Python\Lib\site-packages\httpx\_models.py:829: HTTPStatusError
- 测试节点：tests/test_regression.py::test_menu_tree_include_disabled_flag_controls_disabled_nodes
- 失败截图：无截图
