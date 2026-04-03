# EasyCMS 测试数据分层创建方案

## 目标

本文用于说明如何按依赖关系分层创建测试数据，再按具体测试用例组合出目标场景数据。

核心原则：

- 先创建依赖少的基础对象
- 再创建绑定关系
- 再加工状态
- 最后按用例组合

不优先一次性硬造“最终态”数据。

## 推荐分层

### 第一层：基础资源层

先创建最独立的数据：

- 用户
- 角色
- 菜单节点

适合通过接口直接创建：

- `POST /api/v1/admin/users`
- `POST /api/v1/admin/roles`
- `POST /api/v1/admin/menus`

这一层的目标是先得到可复用的基础对象 ID。

## 第二层：关系绑定层

在基础对象上建立关系：

- 用户绑定角色
- 角色绑定权限
- 菜单节点通过 `parent_id` 形成树

典型动作：

- 创建用户时传 `role_ids`
- `PUT /api/v1/admin/roles/{id}/permissions`
- 创建菜单时设置 `parent_id`

这一层的目标是把独立对象接成可用结构。

## 第三层：状态加工层

在已创建并已绑定的对象上加工状态：

- 用户启用/停用
- 角色启用/停用
- 菜单启用/停用
- 用户解锁
- 用户重置密码

典型接口：

- `PATCH /api/v1/admin/users/{id}/status`
- `PATCH /api/v1/admin/users/{id}/unlock`
- `POST /api/v1/admin/users/{id}/reset-password`
- `PATCH /api/v1/admin/roles/{id}/status`
- `PATCH /api/v1/admin/menus/{id}/status`

这一层的目标是让基础结构进入测试所需状态。

## 第四层：场景装配层

最后根据功能用例组合生成场景数据，例如：

- `user_readonly`
- `no_permission_user`
- `role_with_bound_users`
- `three_level_menu_tree`
- `role_with_menu_reference`

推荐方式：

- 底层只保留通用 create / bind / update 能力
- 场景层再组合成专用 helper

## 推荐建模方式

建议按四类 helper 组织：

### 1. base_builders

- `create_user`
- `create_role`
- `create_menu`

### 2. relation_builders

- `assign_role_permissions`
- `bind_user_role`
- `create_menu_tree`

### 3. state_builders

- `disable_user`
- `enable_user`
- `disable_role`
- `disable_menu`
- `unlock_user`

### 4. scenario_builders

- `create_readonly_user`
- `create_no_permission_user`
- `create_role_with_bound_users`
- `create_three_level_menu_tree`

## 典型组合示例

### 示例 1：生成 `user_readonly`

步骤：

1. 创建菜单树
2. 创建只读角色
3. 给角色绑定仅查看权限
4. 创建普通用户并绑定该角色
5. 如有需要，再将其作为 UI/API 断言对象

### 示例 2：生成“已绑定活跃用户的角色”

步骤：

1. 创建角色
2. 创建启用用户并绑定该角色
3. 创建停用用户并绑定该角色
4. 查询角色详情
5. 验证 `user_count`、`active_user_count`、`disabled_user_count`

### 示例 3：生成三级菜单树

步骤：

1. 创建根目录
2. 在根目录下创建二级菜单
3. 在二级菜单下创建三级按钮或页面节点
4. 再按需要给角色分配菜单权限

## 适合接口造数的范围

当前适合通过接口逐层造数的有：

- 普通用户
- 普通角色
- 菜单节点
- 菜单树
- 用户绑定角色
- 角色绑定权限
- 用户启用/停用
- 角色启用/停用
- 菜单启用/停用

## 不适合仅靠接口稳定创建的范围

以下数据更适合环境预置、业务触发或底层准备：

- `user_locked`
- `user_must_change_password`
- 审计日志样本
- 组织、项目、字典等基础数据
- 部分环境级稳定基线数据

原因：

- 当前接口未提供直接创建能力
- 或需要依赖真实业务过程触发
- 或需要依赖环境内的稳定基础主数据

## 推荐执行顺序

```text
第 1 层：菜单节点 / 角色 / 用户
第 2 层：菜单树 / 角色权限 / 用户绑定角色
第 3 层：启用停用 / 解锁 / 重置密码
第 4 层：按 FUNC 场景组合
```

## 适用价值

采用分层创建后：

- 测试数据更容易复用
- 清理更容易做
- 回归时可只重建局部层
- 新增用例时只需要新增组合，不需要每次从零造整套数据

## 与测试流程的关系

这套方法属于测试数据准备规范，应与以下文档一起使用：

- `tests/TEST_DATA_CHECKLIST.md`
- `tests/REDEME.md`

如果后续用户新增了新的造数规则、依赖顺序、限制条件，也必须同步写入 `tests/REDEME.md`。
