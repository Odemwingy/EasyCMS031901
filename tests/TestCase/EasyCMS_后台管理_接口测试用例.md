# EasyCMS 后台管理接口测试用例

- 生成日期：2026-03-27
- 覆盖说明：覆盖通用协议、认证鉴权、用户管理、角色管理、菜单权限与审计日志接口。
- 用例总数：99

## 依据文档

- `EasyCMS_接口文档_后台管理_v1.0.md`（v1.0）：接口范围、请求/响应结构、错误码、字段约束、联调注意事项
- `PRD_后台管理_用户角色权限_v1.2.md`（v1.2）：业务流程、页面功能、角色权限规则、验收标准
- `EasyCMS_技术架构文档_v1.1.md`（v1.1）：鉴权链路、错误码与 HTTP 映射、RBAC 与审计日志实现口径

## 待澄清项

- PRD 中出现“批量停用 / 批量启用用户”和“导出用户列表 / 导出日志”按钮，但接口文档未提供对应 API，当前测试用例按现有接口能力输出，并将这些功能列为待澄清。
- 技术架构文档示例中存在 `/auth/permissions` 路径，但接口文档定义的当前用户权限菜单接口为 `/api/v1/auth/menus`；本次用例以接口文档为准。
- 接口文档中“权限标识规则”附近存在少量乱码/编辑残留，不影响本次根据接口清单与 PRD 提炼的测试范围，但建议后续修订源文档。

## 前端实现差异

- 当前前端实际路由为 `/users`、`/roles`、`/permissions`、`/menus`、`/audit-log`，默认首页为 `/users`，与接口文档中的 `/admin/*` 路径通过前端别名映射适配。
- 登录接口返回 `must_change_password=true` 时，当前前端仅弹出“该账号需修改密码，改密页面暂未接入”的 Toast，尚未实现独立改密页和路由强制跳转。
- 用户管理页当前为固定每页 10 条、上一页/下一页分页；支持批量停用，不支持批量启用；新建/编辑用户当前仅支持单角色选择。
- 用户列表中的“重置密码”按钮目前仅弹 Toast“重置密码接口暂未对接”；锁定用户的“解锁”入口当前前端未接入。
- 角色管理页当前为卡片布局，停用/启用与复制位于更多菜单中；删除入口当前前端未接入，需要以后端接口或后续页面补充验证。
- 权限配置页左侧模块树当前来自 `getCurrentUserMenus()`，即当前登录用户可见菜单，而不是管理员完整菜单树；“复制自其他角色”“权限预览”尚未接入。
- 菜单管理页当前没有“展开全部/收起全部”顶部按钮，删除菜单使用浏览器 `window.confirm` 二次确认。
- 审计日志页当前仅支持 `object_id`、`log_type`、`result` 三项筛选，详情弹窗仅展示 `request_id/before_value/after_value/fail_reason` JSON；“导出日志”为占位 Toast。

## 截图校准

- 登录页为左右分栏布局：左侧品牌与模块介绍，右侧登录表单包含“用户名”“密码”“记住我”“忘记密码？”“登录”“SSO 单点登录”“LDAP 认证”。
- 后台整体 UI 采用顶部主导航 + 左侧后台管理二级菜单 + 面包屑 + 主内容卡片布局，测试步骤应优先从左侧菜单和面包屑定位页面。
- 用户管理页使用表格布局，头部区域包含搜索框、所属组织/用户类型/角色/状态筛选器，右上角包含“批量停用”“新建用户”。
- 角色管理页使用卡片布局，每张角色卡通过右上角更多菜单提供“查看详情”“复制角色”“停用角色/启用角色”。
- 权限配置页包含返回箭头、角色下拉、重置按钮、保存按钮、黄色提示条、左侧模块树、右侧权限分组卡片和“全选本模块”复选框。
- 菜单管理页使用树形行布局，列包含名称/类型/状态、权限标识、路由路径、操作；操作区以图标按钮表示新增子节点、编辑、启停、删除。
- 审计日志页头部包含对象 ID 查询输入框、日志类型筛选、结果筛选和“导出日志”按钮；列表行右侧为“查看详情”文字按钮。

## 覆盖统计

| 模块 | 用例数 |
| --- | --- |
| 审计日志 | 6 |
| 用户管理 | 26 |
| 菜单与权限 | 20 |
| 角色管理 | 19 |
| 认证与会话 | 19 |
| 通用规则 | 9 |

## 审计日志

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-092 | /api/v1/admin/audit-logs | GET | P0 | 正向 | 审计日志列表分页查询成功 | 具备 admin:audit-logs:list 权限 | 1. 调用审计日志列表<br>2. 检查分页与字段 | page=1&per_page=20 | 返回日志列表，含 log_type、operator、action、object、result、created_at 等字段。 | 接口文档 §27 审计日志列表；PRD §3.6.2 |
| API-093 | /api/v1/admin/audit-logs | GET | P0 | 筛选 | 支持按日志类型、操作人、对象类型、时间范围筛选 | 存在多类日志数据 | 1. 组合传入筛选条件<br>2. 校验结果集 | log_type=user_permission&operator_id=1&object_type=user&start_time=2026-03-01T00:00:00Z&end_time=2026-03-31T23:59:59Z | 返回结果同时满足筛选条件。 | 接口文档 §27 审计日志列表；PRD §3.6.2 |
| API-094 | /api/v1/admin/audit-logs | GET | P1 | 校验 | 时间筛选格式非法时返回参数错误 | 无 | 1. 传非法 start_time/end_time<br>2. 查看响应 | start_time=2026/03/01 00:00:00 | 返回 1001，提示时间格式需为 UTC ISO 8601。 | 接口文档 §27 审计日志列表；接口文档-时间格式 |
| API-095 | /api/v1/admin/audit-logs/{id} | GET | P0 | 正向 | 审计日志详情可返回字段级 before/after 变更值 | 存在编辑类日志 | 1. 调用日志详情接口<br>2. 检查 before_value/after_value | id=1001 | 返回变更前后 JSON、source_page、request_id、result 等字段。 | 接口文档 §28 审计日志详情；PRD §3.6.3 |
| API-096 | /api/v1/admin/audit-logs/{id} | GET | P1 | 边界 | 新建/删除类日志支持 before_value 或 after_value 为 null | 存在 create 或 delete 类型日志 | 1. 查询新建日志详情<br>2. 查询删除日志详情 | id=create_log_id / delete_log_id | 新建日志 before_value=null；删除日志 after_value=null；失败原因无值时 fail_reason=null。 | 接口文档 §28 审计日志详情 |
| API-097 | /api/v1/admin/audit-logs/{id} | GET | P1 | 异常 | 不存在日志详情返回 1004 | 无 | 1. 查询不存在日志 id<br>2. 检查响应 | id=999999 | 返回 1004。 | 接口文档-公共错误码；接口文档 §28 审计日志详情 |

## 用户管理

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-029 | /api/v1/admin/users | GET | P0 | 正向 | 用户列表默认分页查询成功 | 使用具备 admin:users:list 权限账号 | 1. 调用用户列表接口<br>2. 检查分页信息与列表字段 | page=1&per_page=20 | 返回 total/per_page/current_page/last_page/list；列表含用户名、姓名、组织、状态、角色等字段。 | 接口文档 §6 用户列表；PRD §3.2.1 |
| API-030 | /api/v1/admin/users | GET | P0 | 筛选 | 关键字搜索支持用户名或姓名模糊匹配 | 存在可匹配数据 | 1. 传 keyword=张三<br>2. 校验结果集 | keyword=张三 | 仅返回用户名或姓名匹配“张三”的用户数据。 | 接口文档 §6 用户列表；PRD §3.2.1 |
| API-031 | /api/v1/admin/users | GET | P1 | 筛选 | 支持 user_type、org_id、role_id、status 组合筛选 | 存在多种类型用户 | 1. 同时传 user_type/org_id/role_id/status<br>2. 对比结果 | user_type=1&org_id=org_001&role_id=1&status=1 | 返回结果同时满足所有筛选条件。 | 接口文档 §6 用户列表；PRD §3.2.1 |
| API-032 | /api/v1/admin/users | GET | P1 | 校验 | per_page 超过 100 时返回参数校验错误 | 无 | 1. 调用接口并传 per_page=101<br>2. 检查响应 | per_page=101 | 返回 1001，不允许超过最大分页条数。 | 接口文档 §6 用户列表 |
| API-033 | /api/v1/admin/users | GET | P1 | 边界 | 空结果时 list 返回 [] | 使用不存在的筛选条件 | 1. 传入不存在的 keyword 或组合条件<br>2. 检查空结果结构 | keyword=__no_data__ | code=0；total=0；list=[]，不返回 null。 | 接口文档 §6 用户列表；接口差异提醒第 5 条 |
| API-034 | /api/v1/admin/users/{id} | GET | P0 | 正向 | 用户详情查询成功 | 存在目标用户 | 1. 调用用户详情接口<br>2. 检查项目、角色、锁定信息 | id=1 | 返回完整用户信息，包括 project_ids、login_fail_count、locked_at、remark 等字段。 | 接口文档 §7 用户详情 |
| API-035 | /api/v1/admin/users/{id} | GET | P1 | 异常 | 查询不存在用户返回 1004 | 无 | 1. 传不存在 id<br>2. 查看响应 | id=999999 | 返回 1004，提示资源不存在或已删除。 | 接口文档-公共错误码；接口文档 §7 用户详情 |
| API-036 | /api/v1/admin/users | POST | P0 | 正向 | 新建内部员工用户成功 | 使用具备 admin:users:create 权限账号；准备内部角色 | 1. 提交内部员工用户创建请求<br>2. 检查返回 | {"username":"zhangsan","name":"张三","password":"Abc12345","user_type":1,"org_id":"org_001","role_ids":[1],"project_ids":["p_001"]} | 返回“用户创建成功”；status=启用；created_at 为 UTC 时间。 | 接口文档 §8 新建用户；PRD §3.2.2 |
| API-037 | /api/v1/admin/users | POST | P0 | 正向 | 新建企业客户用户成功 | 准备内容服务商相关角色 | 1. 提交企业客户用户创建请求<br>2. 检查返回 | {"username":"vendor01","name":"服务商A","password":"Abc12345","user_type":2,"org_id":"org_vendor","role_ids":[9]} | 返回创建成功；角色与用户类型匹配。 | 接口文档 §8 新建用户；PRD §3.2.2 |
| API-038 | /api/v1/admin/users | POST | P0 | 校验 | 用户名重复时阻止保存 | 系统中已存在同名用户 | 1. 使用重复 username 创建用户<br>2. 查看错误提示 | {"username":"admin","name":"张三","password":"Abc12345","user_type":1,"org_id":"org_001","role_ids":[1]} | 返回 1001，message 为“用户名已存在”，错误定位到 username。 | 接口文档 §8 新建用户；PRD §3.2.2 |
| API-039 | /api/v1/admin/users | POST | P0 | 校验 | 创建用户时密码不符合复杂度规则被拦截 | 无 | 1. 提交弱密码<br>2. 查看响应 | {"username":"u100","name":"张三","password":"12345678","user_type":1,"org_id":"org_001","role_ids":[1]} | 返回 1001，message 指向密码复杂度要求。 | 接口文档 §8 新建用户；PRD §3.1/§3.2.2 |
| API-040 | /api/v1/admin/users | POST | P0 | 校验 | role_ids 为空时不允许创建用户 | 无 | 1. 提交空 role_ids<br>2. 查看响应 | {"username":"u101","name":"张三","password":"Abc12345","user_type":1,"org_id":"org_001","role_ids":[]} | 返回 1001，message 为“角色不能为空”。 | 接口文档 §8 新建用户 |
| API-041 | /api/v1/admin/users | POST | P0 | 异常 | 传入不存在角色 ID 时返回资源不存在 | 无 | 1. 提交不存在的 role_id<br>2. 查看响应 | {"username":"u102","name":"张三","password":"Abc12345","user_type":1,"org_id":"org_001","role_ids":[9999]} | 返回 1004，message 为“所选角色不存在”。 | 接口文档 §8 新建用户 |
| API-042 | /api/v1/admin/users | POST | P0 | 业务规则 | 企业客户用户不可分配内部角色 | 存在内部角色与服务商角色 | 1. user_type=2<br>2. role_ids 传入系统管理员或发布人员角色<br>3. 提交 | {"username":"vendor02","name":"服务商B","password":"Abc12345","user_type":2,"org_id":"org_vendor","role_ids":[1]} | 请求被拦截，返回字段校验或业务规则错误；禁止分配内部角色。 | PRD §3.2.2 规则说明 |
| API-043 | /api/v1/admin/users/{id} | PUT | P0 | 正向 | 编辑用户成功并返回最新详情结构 | 存在目标用户 | 1. 提交姓名/组织/角色/项目/备注修改<br>2. 检查返回 | {"name":"张三-更新","user_type":1,"org_id":"org_002","role_ids":[1,2],"project_ids":["p_001","p_002"],"remark":"更新备注"} | 编辑成功；返回与用户详情一致的结构；变更字段生效。 | 接口文档 §9 编辑用户 |
| API-044 | /api/v1/admin/users/{id} | PUT | P1 | 边界 | 编辑用户时传 username 也应被忽略 | 存在目标用户 | 1. 在编辑请求中额外传 username<br>2. 查询详情确认 | {"username":"new_name_should_ignore","name":"张三","user_type":1,"org_id":"org_001","role_ids":[1]} | 接口忽略 username 修改，原用户名保持不变。 | 接口文档 §9 编辑用户；接口差异提醒第 11 条 |
| API-045 | /api/v1/admin/users/{id} | PUT | P1 | 业务规则 | 编辑用户后仍需遵守用户类型与角色匹配规则 | 存在企业客户用户 | 1. 将企业客户用户编辑为绑定内部角色<br>2. 提交 | {"name":"服务商A","user_type":2,"org_id":"org_vendor","role_ids":[1]} | 请求被拦截，不允许将企业客户用户绑定内部角色。 | PRD §3.2.2 规则说明 |
| API-046 | /api/v1/admin/users/{id}/status | PATCH | P0 | 正向 | 停用用户成功 | 存在启用状态普通用户 | 1. 提交 status=2<br>2. 查询用户详情或列表 | {"status":2} | 返回“用户已停用”；目标用户状态变为停用，后续无法登录。 | 接口文档 §10 切换用户状态；PRD §3.2.2 |
| API-047 | /api/v1/admin/users/{id}/status | PATCH | P1 | 正向 | 启用用户成功 | 存在停用状态用户 | 1. 提交 status=1<br>2. 查询用户状态 | {"status":1} | 返回成功；状态切回启用。 | 接口文档 §10 切换用户状态 |
| API-048 | /api/v1/admin/users/{id}/status | PATCH | P0 | 业务规则 | 停用最后一个系统管理员被拦截 | 仅剩一个启用中的系统管理员 | 1. 对最后一个管理员提交 status=2<br>2. 检查响应 | {"status":2} | 返回 1005，message 为“不可停用最后一个系统管理员”。 | 接口文档 §10 切换用户状态；PRD §3.2.2 |
| API-049 | /api/v1/admin/users/{id}/status | PATCH | P1 | 校验 | 用户状态仅允许 1 或 2 | 无 | 1. 提交非法 status<br>2. 查看响应 | {"status":3} | 返回 1001，不接受非法状态值。 | 接口文档 §10 切换用户状态；接口文档-枚举值定义 |
| API-050 | /api/v1/admin/users/{id}/unlock | PATCH | P0 | 正向 | 解锁锁定用户成功 | 目标用户处于锁定状态 | 1. 调用解锁接口<br>2. 查询用户详情 | id=locked_user_id | 返回“账号已解锁”；locked_at 清空，状态恢复可用。 | 接口文档 §11 解锁用户；PRD §3.1 |
| API-051 | /api/v1/admin/users/{id}/unlock | PATCH | P1 | 异常 | 解锁不存在用户返回 1004 | 无 | 1. 传不存在 id<br>2. 查看响应 | id=999999 | 返回 1004。 | 接口文档-公共错误码；接口文档 §11 解锁用户 |
| API-052 | /api/v1/admin/users/{id}/reset-password | POST | P0 | 正向 | 管理员重置密码成功 | 存在目标用户 | 1. 提交新密码<br>2. 检查响应 | {"new_password":"NewPass456"} | 返回“密码重置成功，用户下次登录须修改密码”。 | 接口文档 §12 重置密码；PRD §3.2.3 |
| API-053 | /api/v1/admin/users/{id}/reset-password | POST | P1 | 校验 | 重置密码时新密码仍需符合规则 | 无 | 1. 提交弱密码<br>2. 查看响应 | {"new_password":"12345678"} | 返回 1001，提示密码复杂度不满足要求。 | 接口文档 §12 重置密码；PRD §3.1/§3.2.3 |
| API-054 | /api/v1/admin/users/{id}/reset-password | POST | P1 | 联动 | 重置密码后用户下一次登录被强制改密 | 目标用户已完成密码重置 | 1. 管理员重置目标用户密码<br>2. 用新密码登录<br>3. 检查登录响应 | 重置后使用新密码登录 | 登录成功且 must_change_password=true。 | 接口文档 §12 重置密码；接口文档 §1 登录；PRD §3.2.3 |

## 菜单与权限

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-072 | /api/v1/admin/roles/{id}/permissions | GET | P0 | 正向 | 获取角色已绑定权限成功 | 存在目标角色 | 1. 调用角色权限查询接口<br>2. 检查 permissions 列表 | id=1 | 返回 role_id 与 permissions 数组；用于权限配置页回显。 | 接口文档 §20 获取角色已绑定权限；PRD §3.5.2 |
| API-073 | /api/v1/admin/roles/{id}/permissions | GET | P1 | 边界 | 未配置任何权限的角色返回空数组 | 准备无权限角色 | 1. 调用角色权限查询接口<br>2. 查看 permissions | id=no_permission_role_id | permissions=[]，不返回 null。 | 接口文档 §20 获取角色已绑定权限 |
| API-074 | /api/v1/admin/roles/{id}/permissions | PUT | P0 | 正向 | 更新角色权限成功，采用全量替换语义 | 存在目标角色与菜单权限 | 1. 提交新的 permissions 数组<br>2. 再次查询角色权限 | {"permissions":["admin:users:list","admin:users:create"]} | 返回“权限配置已保存”；再次查询结果与提交内容完全一致。 | 接口文档 §21 更新角色权限；接口差异提醒第 8 条；PRD §3.5.2 |
| API-075 | /api/v1/admin/roles/{id}/permissions | PUT | P1 | 边界 | 传空数组可清空角色所有权限 | 目标角色已有权限 | 1. 提交 permissions=[]<br>2. 重新查询角色权限 | {"permissions":[]} | 保存成功；角色权限被清空。 | 接口文档 §21 更新角色权限 |
| API-076 | /api/v1/admin/roles/{id}/permissions | PUT | P1 | 边界 | 传入不存在权限标识时后端忽略而不报错 | 目标角色存在 | 1. 提交有效权限 + 无效权限组合<br>2. 再次查询角色权限 | {"permissions":["admin:users:list","not:exists:permission"]} | 接口保存成功；无效权限不会被持久化，有效权限正常生效。 | 接口文档 §21 更新角色权限 |
| API-077 | /api/v1/admin/menus/tree | GET | P0 | 正向 | 获取完整菜单树默认不包含停用节点 | 具备 admin:menus:list 权限 | 1. 调用接口，不传 include_disabled<br>2. 检查结果 | include_disabled=false | 返回完整菜单树，但默认不含停用节点；children 固定为数组。 | 接口文档 §22 获取完整菜单树 |
| API-078 | /api/v1/admin/menus/tree | GET | P1 | 边界 | 菜单管理页场景 include_disabled=true 可返回停用节点 | 存在停用菜单节点 | 1. 传 include_disabled=true<br>2. 检查返回 | include_disabled=true | 结果中包含停用节点，并带 status/status_label。 | 接口文档 §22 获取完整菜单树 |
| API-079 | /api/v1/admin/menus | POST | P0 | 正向 | 新建根目录节点成功 | 具备 admin:menus:create 权限 | 1. parent_id 置空，新建目录节点<br>2. 检查返回 | {"parent_id":null,"type":1,"name":"帮助中心","permission":"help","sort":100,"status":1} | 目录节点创建成功。 | 接口文档 §23 新建菜单节点；PRD §3.4.2 |
| API-080 | /api/v1/admin/menus | POST | P0 | 正向 | 新建菜单项节点时 route_path 和 component 必填 | 存在父目录 | 1. 创建 type=2 菜单项<br>2. 检查返回 | {"parent_id":1,"type":2,"name":"用户管理","permission":"admin:users:list","route_path":"/admin/users","component":"features/users/UserListPage","icon":"Users","sort":1,"status":1} | 菜单项创建成功；返回 id/name/permission/created_at。 | 接口文档 §23 新建菜单节点；PRD §3.4.2 |
| API-081 | /api/v1/admin/menus | POST | P1 | 正向 | 新建按钮节点成功 | 存在菜单项父节点 | 1. 以菜单项为父节点创建 type=3 按钮<br>2. 检查返回 | {"parent_id":2,"type":3,"name":"新建用户","permission":"admin:users:create","sort":1,"status":1} | 按钮节点创建成功。 | 接口文档 §23 新建菜单节点；PRD §3.4.2 |
| API-082 | /api/v1/admin/menus | POST | P0 | 校验 | 权限标识重复时阻止保存 | 已存在相同 permission 节点 | 1. 使用重复 permission 创建节点<br>2. 检查响应 | {"parent_id":1,"type":2,"name":"用户管理2","permission":"admin:users:list","route_path":"/admin/users2","component":"features/users/UserListPage","sort":2,"status":1} | 返回 1001，message 为“权限标识已存在”。 | 接口文档 §23 新建菜单节点；PRD §3.4.4 |
| API-083 | /api/v1/admin/menus | POST | P0 | 业务规则 | 按钮节点不能直接挂在目录下 | 存在目录父节点 | 1. parent_id 指向目录节点<br>2. 创建 type=3 按钮 | {"parent_id":1,"type":3,"name":"非法按钮","permission":"admin:invalid:create","sort":1,"status":1} | 返回 1001，message 为“按钮类型节点只能挂载在菜单项下”。 | 接口文档 §23 新建菜单节点；PRD §3.4.4 |
| API-084 | /api/v1/admin/menus | POST | P0 | 业务规则 | 菜单树最大仅支持 3 级 | 已存在目录→菜单项→按钮 三级结构 | 1. 以按钮为父节点继续创建子节点<br>2. 查看响应 | {"parent_id":10,"type":3,"name":"四级按钮","permission":"admin:level4:create","sort":1,"status":1} | 返回 1001，message 为“菜单树最多支持 3 级”。 | 接口文档 §23 新建菜单节点；PRD §3.4.4 |
| API-085 | /api/v1/admin/menus/{id} | PUT | P0 | 正向 | 编辑菜单节点成功 | 存在目标菜单节点 | 1. 修改名称、路由、组件、排序、状态、备注<br>2. 提交 | {"name":"用户管理-新","route_path":"/admin/users","component":"features/users/UserListPage","icon":"Users","sort":10,"status":1,"remark":"说明"} | 节点信息更新成功。 | 接口文档 §24 编辑菜单节点 |
| API-086 | /api/v1/admin/menus/{id} | PUT | P1 | 边界 | 编辑菜单节点时 permission 和 type 传入也会被忽略 | 存在目标节点 | 1. 编辑时同时传 permission 与 type<br>2. 查询详情或树 | {"name":"用户管理","permission":"changed:permission","type":1,"route_path":"/admin/users","component":"features/users/UserListPage","sort":1,"status":1} | 接口忽略 permission 与 type 修改；原值保持不变。 | 接口文档 §24 编辑菜单节点；接口差异提醒第 9 条 |
| API-087 | /api/v1/admin/menus/{id}/status | PATCH | P0 | 正向 | 停用父节点时子节点同步停用并返回受影响节点数 | 目标父节点下存在多级子节点 | 1. 对父节点提交 status=2<br>2. 查询菜单树 | {"status":2} | 返回 affected_count>=父节点及全部子节点数量；父节点和子节点均为停用。 | 接口文档 §25 切换菜单状态；PRD §3.4.4 |
| API-088 | /api/v1/admin/menus/{id}/status | PATCH | P1 | 业务规则 | 启用父节点时子节点状态不自动恢复 | 父节点及其子节点已全部停用 | 1. 先启用父节点<br>2. 再查询树结构 | {"status":1} | 父节点恢复启用；原被连带停用的子节点仍保持停用，需要手动启用。 | 接口文档 §25 切换菜单状态；PRD §3.4.4 |
| API-089 | /api/v1/admin/menus/{id} | DELETE | P0 | 正向 | 删除未被引用且无子节点的菜单成功 | 目标节点无子节点且未被角色引用 | 1. 调用删除接口<br>2. 检查树中节点消失 | id=deletable_menu_id | 返回“菜单已删除”；data=null。 | 接口文档 §26 删除菜单节点 |
| API-090 | /api/v1/admin/menus/{id} | DELETE | P0 | 业务规则 | 被角色引用的菜单节点不可删除 | 目标节点已绑定到角色权限 | 1. 删除被角色引用的节点<br>2. 查看响应 | id=referenced_menu_id | 返回 1005，message 为“该菜单已被 N 个角色引用，请先解绑后再删除”。 | 接口文档 §26 删除菜单节点；PRD §3.4.4 |
| API-091 | /api/v1/admin/menus/{id} | DELETE | P0 | 业务规则 | 存在子节点的父节点不可直接删除 | 目标节点存在子节点 | 1. 删除父节点<br>2. 查看响应 | id=parent_menu_id | 返回 1005，message 为“请先删除子节点后再删除父节点”。 | 接口文档 §26 删除菜单节点；PRD §3.4.4 |

## 角色管理

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-055 | /api/v1/admin/roles | GET | P0 | 正向 | 角色列表默认分页查询成功 | 具备 admin:roles:list 权限 | 1. 调用角色列表接口<br>2. 检查系统预置标识、绑定用户数 | page=1&per_page=20 | 返回 list；包含 is_system_preset、user_count、status_label 等字段。 | 接口文档 §13 角色列表；PRD §3.3.2 |
| API-056 | /api/v1/admin/roles | GET | P1 | 筛选 | 角色列表支持关键字与状态筛选 | 存在多种角色数据 | 1. 传 keyword/status<br>2. 校验结果 | keyword=管理员&status=1 | 只返回满足关键字和状态的角色。 | 接口文档 §13 角色列表；PRD §3.3.2 |
| API-057 | /api/v1/admin/roles/{id} | GET | P0 | 正向 | 角色详情查询成功并返回扩展统计字段 | 存在目标角色 | 1. 调用角色详情接口<br>2. 检查基础字段与统计字段 | id=1 | 返回名称、编码、描述、状态、是否预置、`user_count`、`active_user_count`、`disabled_user_count` 等字段。 | 接口文档 §14 角色详情；需求差异 DIFF_role_detail_user_status_counts §3 |
| API-057A | /api/v1/admin/roles/{id} | GET | P0 | 口径 | 启用与停用用户统计字段按状态精确计数 | 目标角色已绑定启用、停用、锁定、未激活四类用户 | 1. 调用角色详情接口<br>2. 分别核对 `active_user_count` 与 `disabled_user_count`<br>3. 对照绑定用户状态分布 | id=role_detail_stats_id | `active_user_count` 仅统计 `status=1`；`disabled_user_count` 仅统计 `status=2`；`status=3/4` 不计入这两个新增字段。 | 需求差异 DIFF_role_detail_user_status_counts §3/§6；接口文档 §14 角色详情 |
| API-057B | /api/v1/admin/roles/{id} | GET | P0 | 回归 | 新增状态统计字段后 user_count 原口径保持不变 | 目标角色已绑定多种状态用户 | 1. 调用角色详情接口<br>2. 核对 `user_count`<br>3. 与角色实际绑定用户总数比对 | id=role_detail_stats_id | `user_count` 仍等于角色绑定用户总数，不因新增 `active_user_count`、`disabled_user_count` 而改变口径。 | 需求差异 DIFF_role_detail_user_status_counts §3/§6；接口文档 §14 角色详情 |
| API-058 | /api/v1/admin/roles/{id} | GET | P1 | 异常 | 不存在角色返回 1004 | 无 | 1. 查询不存在角色 id<br>2. 检查响应 | id=999999 | 返回 1004。 | 接口文档-公共错误码；接口文档 §14 角色详情 |
| API-059 | /api/v1/admin/roles | POST | P0 | 正向 | 新建角色成功 | 具备 admin:roles:create 权限 | 1. 提交合法角色名称、编码、状态<br>2. 检查返回 | {"name":"内容审核员","code":"content_reviewer","description":"负责内容技术审核","status":1} | 返回“角色创建成功”；数据入库。 | 接口文档 §15 新建角色；PRD §3.3.3 |
| API-060 | /api/v1/admin/roles | POST | P0 | 校验 | 角色名称重复时阻止保存 | 已存在同名角色 | 1. 使用重复 name 创建角色<br>2. 检查响应 | {"name":"系统管理员","code":"system_admin_copy","status":1} | 返回 1001，message 为“角色名称已存在”。 | 接口文档 §15 新建角色；PRD §3.3.3 |
| API-061 | /api/v1/admin/roles | POST | P0 | 校验 | 角色编码重复时阻止保存 | 已存在同编码角色 | 1. 使用重复 code 创建角色<br>2. 查看响应 | {"name":"审核员副本","code":"system_admin","status":1} | 返回 1001，message 为“角色编码已存在”。 | 接口文档 §15 新建角色；PRD §3.3.3 |
| API-062 | /api/v1/admin/roles | POST | P0 | 校验 | 角色编码格式非法时阻止保存 | 无 | 1. 提交包含大写或连字符的 code<br>2. 检查响应 | {"name":"审核员","code":"Content-Reviewer","status":1} | 返回 1001，提示编码仅允许小写字母、数字和下划线。 | 接口文档 §15 新建角色 |
| API-063 | /api/v1/admin/roles/{id} | PUT | P0 | 正向 | 编辑角色成功 | 存在目标角色 | 1. 修改角色名称、描述、状态<br>2. 提交 | {"name":"内容审核员-高级","description":"高级审核","status":1} | 角色信息更新成功。 | 接口文档 §16 编辑角色 |
| API-064 | /api/v1/admin/roles/{id} | PUT | P1 | 边界 | 编辑角色时传 code 也应被忽略 | 存在目标角色 | 1. 在编辑请求中附带 code<br>2. 查询详情 | {"name":"内容审核员","description":"说明","status":1,"code":"changed_code"} | 编码保持原值不变。 | 接口文档 §16 编辑角色；接口差异提醒第 10 条 |
| API-065 | /api/v1/admin/roles/{id}/copy | POST | P0 | 正向 | 复制角色成功并继承原权限集 | 存在源角色且已配置权限 | 1. 调用复制角色接口<br>2. 查询新角色权限 | {"name":"内容审核员（副本）","code":"content_reviewer_copy"} | 返回创建成功；新角色拥有与源角色相同的权限配置。 | 接口文档 §17 复制角色；PRD §3.3.1/§3.5.2 |
| API-066 | /api/v1/admin/roles/{id}/copy | POST | P1 | 校验 | 复制角色时新名称或新编码重复被拦截 | 存在源角色 | 1. 使用已存在的 name 或 code 复制角色<br>2. 查看响应 | {"name":"系统管理员","code":"system_admin"} | 返回 1001，指出重复字段。 | 接口文档 §17 复制角色；接口文档 §15 错误响应 |
| API-067 | /api/v1/admin/roles/{id}/status | PATCH | P0 | 正向 | 停用无活跃用户绑定的角色成功 | 目标角色无启用状态绑定用户 | 1. 提交 status=2<br>2. 查询角色状态 | {"status":2} | 角色成功停用。 | 接口文档 §18 切换角色状态；PRD §3.3.3 |
| API-068 | /api/v1/admin/roles/{id}/status | PATCH | P0 | 业务规则 | 停用存在活跃用户的角色时被拦截 | 目标角色已绑定启用中的用户 | 1. 提交 status=2<br>2. 检查错误提示 | {"status":2} | 返回 1005，message 说明存在 N 个活跃用户，需要先解绑或停用用户。 | 接口文档 §18 切换角色状态；PRD §3.3.3 |
| API-069 | /api/v1/admin/roles/{id} | DELETE | P0 | 正向 | 删除未绑定用户且非系统预置角色成功 | 目标角色满足删除条件 | 1. 调用删除接口<br>2. 校验角色已不存在 | id=deletable_role_id | 返回“角色已删除”；data=null。 | 接口文档 §19 删除角色；PRD §3.3.2/§3.3.3 |
| API-070 | /api/v1/admin/roles/{id} | DELETE | P0 | 业务规则 | 系统预置角色不可删除 | 目标角色 is_system_preset=true | 1. 删除系统预置角色<br>2. 查看响应 | id=1 | 返回 1005，message 为“系统预置角色不可删除”。 | 接口文档 §19 删除角色；PRD §3.3.1 |
| API-071 | /api/v1/admin/roles/{id} | DELETE | P0 | 业务规则 | 已绑定用户的角色不可删除 | 目标角色存在绑定用户 | 1. 删除已绑定用户的角色<br>2. 查看响应 | id=bound_role_id | 返回 1005，message 表示需先解绑用户后再删除。 | 接口文档 §19 删除角色；PRD §3.3.2/§3.3.3 |

## 认证与会话

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-010 | /api/v1/auth/login | POST | P0 | 正向 | 登录成功返回 token、过期时间和用户信息 | 存在启用状态账号 | 1. 提交正确用户名密码<br>2. 检查响应字段 | {"username":"admin","password":"Abc12345"} | code=0；返回 token、expires_at、user 对象；token 格式为 {id}\|{hash}。 | 接口文档 §1 登录 |
| API-011 | /api/v1/auth/login | POST | P0 | 边界 | 首次登录或重置密码后 must_change_password=true | 目标账号处于首次登录或已被管理员重置密码 | 1. 使用目标账号登录<br>2. 查看 user.must_change_password | {"username":"new_user","password":"Abc12345"} | 登录成功且 user.must_change_password=true，用于前端强制跳改密页。 | 接口文档 §1 登录；PRD §3.1/§3.2.3 |
| API-012 | /api/v1/auth/login | POST | P0 | 异常 | 用户名或密码错误时返回错误提示且不泄露失败次数 | 存在合法账号 | 1. 输入正确用户名+错误密码<br>2. 查看错误信息 | {"username":"admin","password":"Wrong123"} | 返回 1002 或业务定义错误；message 为“用户名或密码错误”；不返回已失败次数。 | 接口文档 §1 登录；PRD §3.1 |
| API-013 | /api/v1/auth/login | POST | P0 | 校验 | 缺失用户名时阻止登录 | 无 | 1. username 置空<br>2. 提交登录 | {"username":"","password":"Abc12345"} | 返回 1001，message 表明用户名不能为空。 | 接口文档 §1 登录 |
| API-014 | /api/v1/auth/login | POST | P0 | 异常 | 停用账号登录被拦截 | 目标账号状态=停用 | 1. 用停用账号尝试登录<br>2. 检查错误信息 | {"username":"disabled_user","password":"Abc12345"} | 返回 1005，message 为“账号已停用，请联系管理员”。 | 接口文档 §1 登录；PRD §3.1 |
| API-015 | /api/v1/auth/login | POST | P0 | 异常 | 锁定账号登录被拦截 | 目标账号状态=锁定 | 1. 用锁定账号尝试登录<br>2. 检查错误信息 | {"username":"locked_user","password":"Abc12345"} | 返回 1005，message 为“账号已锁定，请联系管理员或 30 分钟后重试”。 | 接口文档 §1 登录；PRD §3.1 |
| API-016 | /api/v1/auth/login | POST | P0 | 边界 | 连续失败 5 次后账号自动锁定 | 准备可登录账号 | 1. 连续 5 次输入错误密码<br>2. 第 6 次继续尝试登录 | 同一用户名多次错误密码请求 | 第 5 次后账号被锁定；后续请求直接返回锁定提示，不再校验密码。 | 接口文档 §1 登录；PRD §3.1 |
| API-017 | /api/v1/auth/logout | POST | P0 | 正向 | 登出成功返回 data=null | 用户已登录 | 1. 携带合法 token 调用登出接口<br>2. 检查返回 | Header: Authorization=Bearer {token} | code=0；data 固定返回 null；服务端吊销当前 token。 | 接口文档 §2 登出 |
| API-018 | /api/v1/auth/logout | POST | P1 | 鉴权 | 登出接口缺失 token 时返回未登录 | 无 | 1. 不携带 token 调用登出<br>2. 检查响应 | 无 | 返回 1002；前端仍应清理本地 token 并跳转登录页。 | 接口文档 §2 登出 |
| API-019 | /api/v1/auth/change-password | POST | P0 | 正向 | 修改密码成功且当前 token 不失效 | 用户已登录且知道旧密码 | 1. 提交 old_password/new_password/confirmation<br>2. 改密成功后继续调用 /auth/me | {"old_password":"OldPass123","new_password":"NewPass456","new_password_confirmation":"NewPass456"} | 返回“密码修改成功”；当前 token 继续可用，无需重新登录。 | 接口文档 §3 修改密码 |
| API-020 | /api/v1/auth/change-password | POST | P0 | 校验 | 新密码与确认密码不一致时返回字段错误 | 用户已登录 | 1. 提交不一致的新密码和确认密码<br>2. 检查错误信息 | {"old_password":"OldPass123","new_password":"NewPass456","new_password_confirmation":"NewPass789"} | 返回 1001，message 为“两次密码输入不一致”，错误定位到确认密码字段。 | 接口文档 §3 修改密码 |
| API-021 | /api/v1/auth/change-password | POST | P0 | 校验 | 新密码不符合复杂度规则时拦截 | 用户已登录 | 1. 提交仅小写或仅数字的新密码<br>2. 检查响应 | {"old_password":"OldPass123","new_password":"abcdefg1","new_password_confirmation":"abcdefg1"} | 返回 1001，message 指向密码复杂度要求。 | 接口文档 §3 修改密码；PRD §3.1 |
| API-022 | /api/v1/auth/change-password | POST | P0 | 异常 | 旧密码错误时不允许修改密码 | 用户已登录 | 1. 提交错误 old_password<br>2. 检查响应 | {"old_password":"WrongOld123","new_password":"NewPass456","new_password_confirmation":"NewPass456"} | 返回 1005，message 为“原密码错误”。 | 接口文档 §3 修改密码 |
| API-023 | /api/v1/auth/me | GET | P0 | 正向 | 获取当前用户完整信息成功 | 用户已登录 | 1. 调用 /auth/me<br>2. 检查字段完整性 | 无 | 返回 id、username、name、user_type、status、must_change_password、roles 等字段。 | 接口文档 §4 获取当前用户信息 |
| API-024 | /api/v1/auth/me | GET | P1 | 边界 | 从未登录用户 last_login_at 返回 null | 准备从未登录的账号 | 1. 登录后调用 /auth/me<br>2. 观察 last_login_at | 无 | last_login_at=null；前端展示“从未登录”。 | 接口文档 §4 获取当前用户信息 |
| API-025 | /api/v1/auth/menus | GET | P0 | 正向 | 获取当前用户权限菜单树成功 | 用户已登录且已有角色权限 | 1. 调用 /auth/menus<br>2. 检查目录/菜单项/按钮节点 | 无 | 返回树形数组；type=2 菜单项包含 route_path/component；type=3 按钮用于权限 Map。 | 接口文档 §5 获取当前用户权限菜单 |
| API-026 | /api/v1/auth/menus | GET | P0 | 权限 | 仅返回已启用且有权限的节点 | 准备含禁用菜单和无权限节点的账号/数据 | 1. 调用 /auth/menus<br>2. 对比后台完整菜单树 | 无 | 结果中不出现无权限节点，也不出现停用节点。 | 接口文档 §5 获取当前用户权限菜单；PRD §3.5.3 |
| API-027 | /api/v1/auth/menus | GET | P1 | 边界 | 按钮节点的 route_path/component/icon 为空，children 固定为 [] | 用户有按钮权限 | 1. 调用 /auth/menus<br>2. 检查 type=3 节点字段 | 无 | type=3 时 route_path=null、component=null、icon=null、children=[]。 | 接口文档 §5 获取当前用户权限菜单 |
| API-028 | /api/v1/auth/menus | GET | P1 | 边界 | 菜单树按 sort 升序返回 | 准备同级多个节点 | 1. 调用 /auth/menus<br>2. 检查同级节点顺序 | 无 | 后端返回顺序已按 sort 排好，前端无需重排。 | 接口文档 §5 获取当前用户权限菜单 |

## 通用规则

| 用例ID | 接口 | 方法 | 优先级 | 类型 | 标题 | 前置条件 | 测试步骤 | 请求数据/参数 | 预期结果 | 关联依据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-001 | 全量接口 | ALL | P0 | 协议 | 统一响应结构符合 code/message/data/timestamp 规范 | 任选 1 个成功接口与 1 个失败接口 | 1. 调用成功接口<br>2. 调用失败接口<br>3. 对比响应结构 | 成功接口示例：GET /api/v1/auth/me；失败接口示例：缺失必填参数 | 成功与失败响应均包含 code、message、data、timestamp；成功 code=0，失败 code!=0。 | 接口文档-通用规则；技术架构文档 §5.3 |
| API-002 | 全量接口 | ALL | P0 | 鉴权 | 需鉴权接口缺失 Bearer token 时返回未登录错误 | 选择任一需鉴权接口 | 1. 不携带 Authorization 调用需鉴权接口<br>2. 查看返回码与 message | GET /api/v1/auth/me | 返回 HTTP 401 / 业务码 1002，提示未登录或 token 失效。 | 接口文档-通用规则；技术架构文档 §5.3/§5.4 |
| API-003 | 全量接口 | ALL | P0 | 权限 | 无权限访问时返回 1003 且前端可触发统一提示 | 使用缺少目标权限的账号 | 1. 以无权限账号登录<br>2. 调用受控接口<br>3. 查看响应 | PATCH /api/v1/admin/users/1/status | 返回 HTTP 403 / 业务码 1003，message 表示无权限或权限已变更。 | 接口文档-公共错误码；PRD §3.5.3；技术架构文档 §5.3/§5.5 |
| API-004 | 全量接口 | ALL | P1 | 协议 | 请求头携带 X-Request-ID 时响应头原样透传 | 准备 uuid 风格 request id | 1. 调用任一接口并携带 X-Request-ID<br>2. 检查响应头 | X-Request-ID=req-test-20260327-001 | 响应头中存在相同的 X-Request-ID，便于后端排障追踪。 | 接口文档-请求追踪；技术架构文档 §9.2 |
| API-005 | 全量接口 | ALL | P1 | 边界 | 所有时间字段返回 UTC ISO 8601 字符串 | 任选包含时间字段的接口 | 1. 调用用户详情/日志详情接口<br>2. 检查 created_at、updated_at 等字段格式 | GET /api/v1/admin/users/1 | 时间字段格式如 2026-03-23T10:00:00Z；不返回本地格式、不返回时间戳。 | 接口文档-时间格式；接口差异提醒第 3 条 |
| API-006 | 全量接口 | ALL | P1 | 边界 | 列表与树形 children 空值统一返回 [] 而非 null | 准备无数据场景 | 1. 调用空列表接口<br>2. 调用无子节点菜单接口<br>3. 检查空值 | 空条件列表查询；GET /api/v1/admin/menus/tree | list 与 children 在无数据时均返回 []；可空对象字段返回 null，不返回 undefined。 | 接口文档-空值规则；接口差异提醒第 5-6 条 |
| API-007 | 全量接口 | ALL | P1 | 校验 | 参数校验失败统一返回 1001 | 任选存在必填字段的接口 | 1. 缺失必填字段调用接口<br>2. 观察响应码与 message | POST /api/v1/admin/roles 缺失 name | 返回 HTTP 422 / 业务码 1001，message 指向具体字段错误。 | 接口文档-公共错误码；技术架构文档 §5.3 |
| API-008 | 全量接口 | ALL | P1 | 业务规则 | 业务规则拦截统一返回 1005 | 准备触发业务限制的数据 | 1. 触发最后一个管理员停用<br>2. 或触发预置角色删除<br>3. 查看响应 | PATCH /api/v1/admin/users/{id}/status 或 DELETE /api/v1/admin/roles/{id} | 返回 HTTP 422 / 业务码 1005，并展示业务拦截原因。 | 接口文档-公共错误码；技术架构文档 §5.3 |
| API-009 | 全量接口 | ALL | P2 | 协议 | 请求体使用 application/json 发送 | 任选 POST/PUT/PATCH 接口 | 1. 以 Content-Type: application/json 调用接口<br>2. 验证接口成功受理 | POST /api/v1/auth/login | 接口正常处理 JSON 请求体；与文档定义保持一致。 | 接口文档-请求格式 |
