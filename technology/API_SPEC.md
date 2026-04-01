# 阶段一接口执行基线

## 1. 接口范围

当前阶段接口范围仅覆盖后台管理一期：
- 认证
- 用户管理
- 角色管理
- 菜单管理
- 权限配置
- 审计日志

来源依据：
- `D:\下载\EasyCMS_接口文档_后台管理_v1.0.md`

## 2. 通用约定

- 基础路径：`/api/v1`
- 鉴权方式：`Authorization: Bearer {token}`
- Content-Type：`application/json`
- 时间格式：UTC ISO 8601
- 统一响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1711180800000
}
```

公共错误码：
- `0` 成功
- `1001` 参数校验失败
- `1002` 未登录或 token 失效
- `1003` 无权限
- `1004` 资源不存在
- `1005` 业务规则拦截
- `5000` 服务异常

## 3. 枚举约定

- 用户状态：`1 启用`、`2 停用`、`3 锁定`、`4 未激活`
- 用户类型：`1 内部员工`、`2 企业客户`
- 菜单类型：`1 目录`、`2 菜单项`、`3 按钮`
- 角色状态：`1 启用`、`2 停用`
- 审计结果：`1 成功`、`2 失败`

## 4. 主要接口

### 4.1 认证
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/menus`

### 4.2 用户管理
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{id}`
- `POST /api/v1/admin/users`
- `PUT /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/status`
- `PATCH /api/v1/admin/users/{id}/unlock`
- `POST /api/v1/admin/users/{id}/reset-password`

### 4.3 角色管理
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/roles/{id}`
- `POST /api/v1/admin/roles`
- `PUT /api/v1/admin/roles/{id}`
- `POST /api/v1/admin/roles/{id}/copy`
- `PATCH /api/v1/admin/roles/{id}/status`
- `DELETE /api/v1/admin/roles/{id}`
- `GET /api/v1/admin/roles/{id}/permissions`
- `PUT /api/v1/admin/roles/{id}/permissions`
- 角色详情接口 `GET /api/v1/admin/roles/{id}` 当前额外返回：`user_count`、`active_user_count`、`disabled_user_count`

### 4.4 菜单管理
- `GET /api/v1/admin/menus/tree`
- `POST /api/v1/admin/menus`
- `PUT /api/v1/admin/menus/{id}`
- `PATCH /api/v1/admin/menus/{id}/status`
- `DELETE /api/v1/admin/menus/{id}`

### 4.5 审计日志
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/{id}`

## 5. 执行要求

- 权限标识统一使用 `模块:资源:动作`
- 角色权限更新接口为**全量替换**
- 菜单管理是权限配置的数据源
- 后端接口实现时必须严格遵守本文件与 `D:\下载\EasyCMS_接口文档_后台管理_v1.0.md`
