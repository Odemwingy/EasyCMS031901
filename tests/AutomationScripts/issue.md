# EasyCMS GitHub Issue Drafts

以下内容已整理为更适合在 GitHub 上创建 issue 的样式。  
每条 issue 都包含：

- `Issue Title`
- `Assignees`
- `Labels`
- `Description`
- `Preconditions`
- `Steps To Reproduce`
- `Actual Result`
- `Expected Result`
- `Evidence`

前端问题统一指派给 `Jinx962`，后端问题统一指派给 `LHB1994`，标签统一为 `bug`。

---

## Issue 1

### Issue Title
【后端】用户管理页按用户名搜索时触发服务器内部错误并清空列表

### Assignees
- `LHB1994`

### Labels
- `bug`

### Description
在“后台管理 > 用户管理”页面，按用户名搜索已有用户 `admin` 时，页面右上角弹出红色提示“服务器内部错误”，同时用户列表区域变成“暂无数据”。  
这会直接阻塞用户筛选、状态校验和分页相关验证，与测试用例 `FUNC-017`、`FUNC-018`、`FUNC-019`、`FUNC-020` 的预期不符。

### Preconditions
- 使用系统管理员账号登录后台
- 用户列表中存在 `admin` 用户

### Steps To Reproduce
1. 登录系统。
2. 进入“后台管理 > 用户管理”。
3. 在搜索框“搜索用户名 / 姓名”中输入 `admin`。
4. 观察页面右上角提示和列表返回结果。

### Actual Result
- 页面出现红色 Toast：“服务器内部错误”
- 列表区域显示“暂无数据”
- 无法继续验证 `admin` 用户的状态、操作列和分页结果

### Expected Result
- 应返回与 `admin` 匹配的用户记录
- 列表不应报服务器内部错误
- 状态标签、操作列、分页器应正常展示

### Evidence
- 关联用例：`FUNC-017`、`FUNC-018`、`FUNC-019`、`FUNC-020`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_management_status_and_pagination_controls_chromium.png`

---

## Issue 2

### Issue Title
【前端】后台已登录状态下进入部分管理场景会被异常重定向回登录页

### Assignees
- `Jinx962`

### Labels
- `bug`

### Description
系统登录成功后，在执行部分后台管理操作时，会从已登录状态异常跳回登录页，导致后续流程无法继续。  
当前受影响场景包括：

- 新建用户弹窗相关操作
- 进入角色管理
- 新建角色相关操作
- 菜单管理相关操作

该问题会直接阻塞 `FUNC-021`、`FUNC-034`、`FUNC-035`、`FUNC-036`、`FUNC-047` 的验证。

### Preconditions
- 使用系统管理员账号登录后台
- 成功进入后台首页

### Steps To Reproduce
1. 登录后台系统。
2. 保持登录状态不退出。
3. 执行以下任一操作：
   - 在用户管理页尝试点击“新建用户”
   - 从左侧菜单进入“角色管理”
   - 在角色管理页尝试进行新建角色相关操作
   - 从左侧菜单进入“菜单管理”并尝试继续操作
4. 观察当前页面是否保持在后台模块内。

### Actual Result
- 页面被异常重定向回登录页
- 当前模块流程中断
- 无法继续打开弹窗或完成表单提交

### Expected Result
- 登录后应持续保持有效会话
- 在正常后台操作过程中不应无故跳回登录页

### Evidence
- 关联用例：`FUNC-021`、`FUNC-034`、`FUNC-035`、`FUNC-036`、`FUNC-047`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_displays_expected_fields_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_empty_submit_shows_required_validation_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_management_supports_search_and_shows_preset_role_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_role_create_dialog_can_create_role_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_can_create_root_directory_chromium.png`

---

## Issue 3

### Issue Title
【前端】权限配置页未完整展示“菜单管理”权限分组

### Assignees
- `Jinx962`

### Labels
- `bug`

### Description
在“后台管理 > 权限配置”页面，首屏可见“用户管理”“角色管理”“权限配置”等权限分组，但未看到“菜单管理”分组。  
根据测试用例 `FUNC-059`、`FUNC-060`，管理员应能在该页面查看后台管理相关权限分组，以完成权限核对和配置。

### Preconditions
- 使用系统管理员账号登录后台
- 进入“后台管理 > 权限配置”

### Steps To Reproduce
1. 登录系统。
2. 进入“后台管理 > 权限配置”。
3. 保持左侧当前模块为“后台管理”。
4. 查看右侧权限明细区域当前展示的权限分组。

### Actual Result
- 首屏未见“菜单管理”权限分组
- 当前可见区域只展示了部分后台管理权限模块

### Expected Result
- 右侧权限明细区域应完整展示后台管理相关权限分组
- 至少应包含“菜单管理”分组

### Evidence
- 关联用例：`FUNC-059`、`FUNC-060`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_permission_config_displays_backend_permission_groups_chromium.png`

---

## Issue 4

### Issue Title
【前端】菜单管理页点击新建或编辑后触发运行时异常 fieldErrors is not defined

### Assignees
- `Jinx962`

### Labels
- `bug`

### Description
在“后台管理 > 菜单管理”页面，点击“新建根节点”或编辑图标后，没有出现预期的“新建菜单节点 / 编辑菜单节点”弹窗，而是直接进入 React 错误页。  
错误页提示：

`Unexpected Application Error!`

`ReferenceError: fieldErrors is not defined`

这会导致菜单新增、菜单项必填校验、编辑节点等核心场景全部无法继续。

### Preconditions
- 使用系统管理员账号登录后台
- 成功进入“后台管理 > 菜单管理”

### Steps To Reproduce
1. 登录系统。
2. 进入“后台管理 > 菜单管理”。
3. 执行以下任一操作：
   - 点击右上角“新建根节点”
   - 点击菜单节点行中的编辑图标
4. 观察页面行为。

### Actual Result
- 页面直接进入错误边界
- 出现前端运行时异常：`fieldErrors is not defined`
- 无法打开新增或编辑弹窗

### Expected Result
- 应正常弹出“新建菜单节点”或“编辑菜单节点”弹窗
- 可继续完成字段填写、空提交校验和编辑保存
- 不应出现页面级 JS 崩溃

### Evidence
- 关联用例：`FUNC-047`、`FUNC-048`、`FUNC-052`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_displays_expected_fields_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_empty_submit_shows_required_validation_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_create_dialog_requires_route_and_component_for_menu_item_chromium.png`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_menu_edit_dialog_shows_readonly_permission_and_type_hint_chromium.png`

---

## Issue 5

### Issue Title
【后端】创建测试角色时 /api/v1/admin/roles 返回 500，阻塞新建用户流程

### Assignees
- `LHB1994`

### Labels
- `bug`

### Description
在执行“新建内部员工用户成功”场景时，需要先通过角色创建接口准备可分配角色。  
当前 `/api/v1/admin/roles` 接口返回 `500 Internal Server Error`，导致后续“新建用户”流程无法继续进行。  
这会直接阻塞测试用例 `FUNC-021` 的自动化和联调验证。

### Preconditions
- 使用系统管理员账号
- 具备调用角色创建接口权限

### Steps To Reproduce
1. 调用角色创建接口 `/api/v1/admin/roles`。
2. 请求体中传入新的角色名称、角色编码、描述和状态。
3. 观察接口返回结果。

### Actual Result
- 接口返回 `500 Internal Server Error`
- 无法继续完成后续“新建用户并分配角色”流程

### Expected Result
- 接口应正常创建角色并返回成功结果
- 后续 UI 侧可继续完成“新建内部员工用户”流程

### Evidence
- 关联用例：`FUNC-021`
- 截图地址：`E:\AIautomation\Testrelated\ui_automation\outputs\regression\screenshots\tests_test_regression.py_test_user_create_dialog_can_create_internal_user_chromium.png`

---

## 备注

以下回归失败项当前更像“自动化定位冲突 / 断言口径问题 / 需人工复核”，本次没有转成 GitHub issue：

- 用户管理筛选器文本重复导致定位冲突
- 菜单管理页“后台管理”文本多处重名导致节点断言冲突
- 审计日志页“删除”是日志动作文本，不一定等于页面存在删除按钮

如需，我可以下一步再把这些内容单独整理成“待人工复核列表”。
