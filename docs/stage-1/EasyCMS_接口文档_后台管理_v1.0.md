# EasyCMS 后台管理 接口文档

文档版本：v1.0
最后更新：2026-03-23
接口负责人：[姓名]
适用环境：dev / staging
调用方：前端（React SPA）
状态：待联调

---

## 模块说明

模块名称：后台管理 — 第一期

模块作用：
提供用户账号全生命周期管理、基于 RBAC 的角色权限控制、菜单树管理和关键操作审计日志能力，支撑平台内部员工与企业客户两类用户的权限隔离与操作追踪。

本次提供给前端联调的功能范围：
- 登录 / 登出 / 强制改密
- 获取当前用户信息与权限菜单
- 用户管理（增删改查、停用启用、解锁、重置密码）
- 角色管理（增删改查、停用启用、复制）
- 菜单管理（增删改查、停用启用、获取完整菜单树）
- 权限配置（角色绑定菜单权限）
- 审计日志（列表查询）

本次不包含的范围：
- 忘记密码 / 邮件激活（二期）
- 组织管理页面（二期，当前组织为预置枚举）
- 数据范围权限过滤逻辑（首期预留字段，不生效）
- 消息中心（二期）
- 通知配置（二期）
- 系统参数页（二期）

---

## 通用规则

**基础域名**
- dev：`https://dev-api.easycms.com`
- staging：`https://staging-api.easycms.com`

**鉴权方式**
- Header：`Authorization: Bearer {token}`
- token 由登录接口返回，有效期 8 小时
- 除登录接口外，所有接口均需携带 token

**请求格式**
- `Content-Type: application/json`

**请求追踪**
- 每个请求建议携带 `X-Request-ID: {uuid}`
- 响应 Header 会原样返回 `X-Request-ID`，用于排查问题

**统一响应结构**
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1711180800000
}
```

**列表响应结构**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 58,
    "per_page": 20,
    "current_page": 1,
    "last_page": 3,
    "list": []
  },
  "timestamp": 1711180800000
}
```

**成功判断规则**
- `code === 0` 为成功，其他均为失败

**公共错误码**

| code | 说明 | 前端处理建议 |
|------|------|------------|
| 0 | 成功 | — |
| 1001 | 参数校验失败 | 展示 message 中的具体字段错误信息 |
| 1002 | 未登录或 token 失效 | 清除本地 token，跳转登录页 |
| 1003 | 无权限 | 提示「权限已变更，请刷新页面后重试」 |
| 1004 | 资源不存在 | 提示「数据不存在或已被删除」 |
| 1005 | 业务规则拦截 | 展示 message 中的具体拦截原因 |
| 5000 | 服务器内部错误 | 提示「服务异常，请稍后重试」 |

**枚举值定义**

用户状态（`status`）
- `1` 启用
- `2` 停用
- `3` 锁定
- `4` 未激活

用户类型（`user_type`）
- `1` 内部员工
- `2` 企业客户

菜单类型（`type`）
- `1` 目录（无路由，作为分组容器）
- `2` 菜单项（有路由的页面）
- `3` 按钮（操作级权限节点）

角色状态（`status`）
- `1` 启用
- `2` 停用

审计日志操作结果（`result`）
- `1` 成功
- `2` 失败

**时间格式**
- 所有时间字段均为 UTC ISO 8601 字符串，如 `2026-03-23T10:00:00Z`
- 前端统一使用 `date-fns` 格式化为本地时间展示

**空值规则**
- 后端不返回 `undefined`，可空字段统一返回 `null`
- 列表字段不存在数据时返回 []，不返回 
ull`n
**权限标识规则**
- 全项目统一采用 模块:资源:动作 格式
- 示例：dmin:users:list、dmin:users:create、dmin:roles:assign-permissions"

Replace-RegexInFile D:\下载\EasyCMS_技术架构文档_v1.1.md '│   ├── roles.ts\n│   ├── permissions.ts' 

---

## 接口清单

| # | 接口名称 | 方法 | 路径 | 是否鉴权 |
|---|---------|------|------|---------|
| 1 | 登录 | POST | `/api/v1/auth/login` | 否 |
| 2 | 登出 | POST | `/api/v1/auth/logout` | 是 |
| 3 | 修改密码 | POST | `/api/v1/auth/change-password` | 是 |
| 4 | 获取当前用户信息 | GET | `/api/v1/auth/me` | 是 |
| 5 | 获取当前用户权限菜单 | GET | `/api/v1/auth/menus` | 是 |
| 6 | 用户列表 | GET | `/api/v1/admin/users` | 是 |
| 7 | 用户详情 | GET | `/api/v1/admin/users/{id}` | 是 |
| 8 | 新建用户 | POST | `/api/v1/admin/users` | 是 |
| 9 | 编辑用户 | PUT | `/api/v1/admin/users/{id}` | 是 |
| 10 | 切换用户状态 | PATCH | `/api/v1/admin/users/{id}/status` | 是 |
| 11 | 解锁用户 | PATCH | `/api/v1/admin/users/{id}/unlock` | 是 |
| 12 | 重置密码 | POST | `/api/v1/admin/users/{id}/reset-password` | 是 |
| 13 | 角色列表 | GET | `/api/v1/admin/roles` | 是 |
| 14 | 角色详情 | GET | `/api/v1/admin/roles/{id}` | 是 |
| 15 | 新建角色 | POST | `/api/v1/admin/roles` | 是 |
| 16 | 编辑角色 | PUT | `/api/v1/admin/roles/{id}` | 是 |
| 17 | 复制角色 | POST | `/api/v1/admin/roles/{id}/copy` | 是 |
| 18 | 切换角色状态 | PATCH | `/api/v1/admin/roles/{id}/status` | 是 |
| 19 | 删除角色 | DELETE | `/api/v1/admin/roles/{id}` | 是 |
| 20 | 获取角色已绑定权限 | GET | `/api/v1/admin/roles/{id}/permissions` | 是 |
| 21 | 更新角色权限 | PUT | `/api/v1/admin/roles/{id}/permissions` | 是 |
| 22 | 获取完整菜单树（管理用） | GET | `/api/v1/admin/menus/tree` | 是 |
| 23 | 新建菜单节点 | POST | `/api/v1/admin/menus` | 是 |
| 24 | 编辑菜单节点 | PUT | `/api/v1/admin/menus/{id}` | 是 |
| 25 | 切换菜单状态 | PATCH | `/api/v1/admin/menus/{id}/status` | 是 |
| 26 | 删除菜单节点 | DELETE | `/api/v1/admin/menus/{id}` | 是 |
| 27 | 审计日志列表 | GET | `/api/v1/admin/audit-logs` | 是 |
| 28 | 审计日志详情 | GET | `/api/v1/admin/audit-logs/{id}` | 是 |

---

## 接口详情

---

### 1. 登录

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/auth/login`
- 是否需要登录：否
- 接口作用：用户名密码登录，返回 token 和用户基本信息

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 登录用户名 | `admin` |
| password | string | 是 | 登录密码 | `Abc12345` |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "1|abc123xyz...",
    "expires_at": "2026-03-23T18:00:00Z",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "张三",
      "user_type": 1,
      "org_id": "org_001",
      "must_change_password": false
    }
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| token | string | 否 | Sanctum Token | 存入 localStorage，后续请求携带在 Authorization Header |
| expires_at | string | 否 | token 过期时间，UTC | 可存储用于前端提前感知过期 |
| user.id | number | 否 | 用户 ID | 直接使用 |
| user.username | string | 否 | 登录名 | 直接使用 |
| user.name | string | 否 | 展示姓名 | 展示在页面右上角 |
| user.user_type | number | 否 | 用户类型枚举 | 1=内部员工 2=企业客户 |
| user.org_id | string | 否 | 所属组织 ID | 直接使用 |
| user.must_change_password | boolean | 否 | 是否需要强制改密 | **为 true 时登录后立即跳转改密页，不允许进入其他页面** |

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1001 | 参数为空 | 用户名不能为空 | 展示字段错误提示 |
| 1002 | 用户名或密码错误 | 用户名或密码错误 | 展示错误提示，不清空密码框 |
| 1005 | 账号已停用 | 账号已停用，请联系管理员 | 展示 message |
| 1005 | 账号已锁定 | 账号已锁定，请联系管理员或 30 分钟后重试 | 展示 message |

**空值和边界规则**
- 连续登录失败 5 次后账号自动锁定，后续请求直接返回锁定提示，不再校验密码
- 密码错误时不提示当前已失败几次（安全考虑）

**联调注意事项**
- `must_change_password` 为 `true` 时，前端必须强制跳转改密页，改密成功后才能访问其他页面
- token 格式为 `{id}|{hash}`，直接透传，不做解析

---

### 2. 登出

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/auth/logout`
- 是否需要登录：是
- 接口作用：吊销当前 token，服务端删除 token 记录

**请求参数**：无

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": null,
  "timestamp": 1711180800000
}
```

**联调注意事项**
- 无论接口是否成功，前端均需清除本地 token 并跳转登录页
- `data` 固定返回 `null`

---

### 3. 修改密码

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/auth/change-password`
- 是否需要登录：是
- 接口作用：用户主动修改密码，或首次登录强制改密

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| old_password | string | 是 | 当前密码 | `OldPass123` |
| new_password | string | 是 | 新密码，最少 8 位，须含大写+小写+数字 | `NewPass456` |
| new_password_confirmation | string | 是 | 新密码确认，须与 new_password 一致 | `NewPass456` |

**成功响应**
```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null,
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1001 | 两次密码不一致 | 两次密码输入不一致 | 展示在确认密码字段下方 |
| 1001 | 新密码不符合规则 | 密码须包含大写字母、小写字母和数字 | 展示在新密码字段下方 |
| 1005 | 原密码错误 | 原密码错误 | 展示在原密码字段下方 |

**联调注意事项**
- 改密成功后当前 token 不失效，前端无需重新登录
- 首次登录强制改密场景：改密成功后前端将 `must_change_password` 置为 `false`，放行路由守卫

---

### 4. 获取当前用户信息

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/auth/me`
- 是否需要登录：是
- 接口作用：获取当前登录用户的完整信息和角色列表，用于页面初始化

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "张三",
    "user_type": 1,
    "user_type_label": "内部员工",
    "org_id": "org_001",
    "status": 1,
    "status_label": "启用",
    "must_change_password": false,
    "last_login_at": "2026-03-23T10:00:00Z",
    "roles": [
      {
        "id": 1,
        "name": "系统管理员",
        "code": "system_admin"
      }
    ]
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| id | number | 否 | 用户 ID | 直接使用 |
| username | string | 否 | 登录名 | 直接使用 |
| name | string | 否 | 展示姓名 | 展示在右上角 |
| user_type | number | 否 | 用户类型枚举 | 见枚举值定义 |
| user_type_label | string | 否 | 用户类型展示文本 | 直接展示 |
| org_id | string | 否 | 所属组织 ID | 直接使用 |
| status | number | 否 | 账号状态枚举 | 见枚举值定义 |
| status_label | string | 否 | 状态展示文本 | 直接展示 |
| must_change_password | boolean | 否 | 是否需强制改密 | 为 true 时强制跳转改密页 |
| last_login_at | string | 是 | 上次登录时间，UTC | 为空时展示「从未登录」 |
| roles | array | 否 | 角色列表 | 空数组时说明账号未分配角色 |
| roles[].id | number | 否 | 角色 ID | 直接使用 |
| roles[].name | string | 否 | 角色名称 | 直接展示 |
| roles[].code | string | 否 | 角色编码 | 用于前端角色判断逻辑 |

---

### 5. 获取当前用户权限菜单

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/auth/menus`
- 是否需要登录：是
- 接口作用：返回当前用户有权限的菜单树，前端据此动态生成路由和侧边栏导航

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "type": 1,
      "name": "后台管理",
      "permission": "admin",
      "route_path": null,
      "component": null,
      "icon": "Settings",
      "sort": 1,
      "children": [
        {
          "id": 2,
          "parent_id": 1,
          "type": 2,
          "name": "用户管理",
          "permission": "admin:users:list",
          "route_path": "/admin/users",
          "component": "features/users/UserListPage",
          "icon": "Users",
          "sort": 1,
          "children": [
            {
              "id": 10,
              "parent_id": 2,
              "type": 3,
              "name": "新建用户",
              "permission": "admin:users:create",
              "route_path": null,
              "component": null,
              "icon": null,
              "sort": 1,
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| id | number | 否 | 菜单 ID | 直接使用 |
| parent_id | number | 是 | 父节点 ID | 为 null 表示根节点 |
| type | number | 否 | 节点类型枚举 | 1=目录 2=菜单项 3=按钮 |
| name | string | 否 | 菜单名称 | 直接展示 |
| permission | string | 否 | 权限标识 | 用于 `hasPermission()` 判断 |
| route_path | string | 是 | 前端路由路径 | type=1/3 时为 null，不注册路由 |
| component | string | 是 | 前端组件路径 | type=1/3 时为 null，动态 import 时使用 |
| icon | string | 是 | lucide-react 图标名 | type=3（按钮）时为 null |
| sort | number | 否 | 排序值 | 后端已排序返回，前端直接使用顺序 |
| children | array | 否 | 子节点列表 | 无子节点时为 `[]` |

**空值和边界规则**
- 此接口只返回用户有权限且状态为启用的节点，无权限或已停用的节点不出现在结果中
- 按钮类型节点（type=3）的 `route_path`、`component`、`icon` 均为 `null`
- 目录类型节点（type=1）的 `route_path`、`component` 均为 `null`
- `children` 固定返回数组，不返回 `null`
- 后端已按 `sort` 升序排列，前端不需要重排序

**联调注意事项**
- 前端应将 type=3（按钮）的权限标识提取到权限 Map 中，用于控制按钮显隐
- 前端应将 type=2（菜单项）的 `component` 字段用于动态路由注册
- 此接口在登录后、刷新页面时调用，结果存入全局状态

---

### 6. 用户列表

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/users`
- 是否需要登录：是
- 所需权限：`admin:users:list`
- 接口作用：分页查询用户列表，支持多条件筛选

**Query 参数**

| 参数名 | 类型 | 必填 | 说明 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| page | number | 否 | 页码 | 1 | `1` |
| per_page | number | 否 | 每页条数，最大 100 | 20 | `20` |
| keyword | string | 否 | 关键字，匹配用户名或姓名 | — | `张三` |
| user_type | number | 否 | 用户类型筛选 | — | `1` |
| org_id | string | 否 | 组织 ID 筛选 | — | `org_001` |
| role_id | number | 否 | 角色 ID 筛选 | — | `1` |
| status | number | 否 | 账号状态筛选 | — | `1` |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 58,
    "per_page": 20,
    "current_page": 1,
    "last_page": 3,
    "list": [
      {
        "id": 1,
        "username": "zhangsan",
        "name": "张三",
        "user_type": 1,
        "user_type_label": "内部员工",
        "org_id": "org_001",
        "org_name": "内容运营组",
        "status": 1,
        "status_label": "启用",
        "roles": [
          { "id": 1, "name": "内容运营", "code": "content_operator" }
        ],
        "last_login_at": "2026-03-23T10:00:00Z",
        "created_at": "2026-01-01T00:00:00Z"
      }
    ]
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| total | number | 否 | 总记录数 | 用于分页组件 |
| per_page | number | 否 | 每页条数 | 直接使用 |
| current_page | number | 否 | 当前页码 | 直接使用 |
| last_page | number | 否 | 最后页码 | 用于判断是否有下一页 |
| list | array | 否 | 用户列表 | 空数组时展示空状态 |
| list[].id | number | 否 | 用户 ID | 直接使用 |
| list[].username | string | 否 | 登录名 | 直接展示 |
| list[].name | string | 否 | 姓名 | 直接展示 |
| list[].user_type | number | 否 | 用户类型枚举 | 见枚举值定义 |
| list[].user_type_label | string | 否 | 用户类型文本 | 直接展示，不需要前端转换 |
| list[].org_id | string | 否 | 组织 ID | 直接使用 |
| list[].org_name | string | 否 | 组织名称 | 直接展示 |
| list[].status | number | 否 | 状态枚举 | 见枚举值定义 |
| list[].status_label | string | 否 | 状态文本 | 直接展示 |
| list[].roles | array | 否 | 角色列表 | 空数组时展示「未分配角色」 |
| list[].last_login_at | string | 是 | 上次登录时间，UTC | 为 null 时展示「从未登录」，否则格式化为本地时间 |
| list[].created_at | string | 否 | 创建时间，UTC | 格式化为本地时间展示 |

---

### 7. 用户详情

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/users/{id}`
- 是否需要登录：是
- 所需权限：`admin:users:list`
- 接口作用：获取单个用户的完整信息，用于编辑表单回显

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户 ID |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "name": "张三",
    "user_type": 1,
    "user_type_label": "内部员工",
    "org_id": "org_001",
    "org_name": "内容运营组",
    "status": 1,
    "status_label": "启用",
    "must_change_password": false,
    "remark": "负责视频内容运营",
    "roles": [
      { "id": 1, "name": "内容运营", "code": "content_operator" }
    ],
    "project_ids": ["p_001", "p_002"],
    "login_fail_count": 0,
    "locked_at": null,
    "last_login_at": "2026-03-23T10:00:00Z",
    "created_by": 1,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-20T08:00:00Z"
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| project_ids | array | 否 | 可访问项目 ID 列表 | 空数组表示不限制项目 |
| login_fail_count | number | 否 | 当前连续登录失败次数 | 用于管理员判断风险 |
| locked_at | string | 是 | 账号锁定时间，UTC | 为 null 表示未锁定 |
| remark | string | 是 | 备注 | 为 null 时表单展示空字符串 |
| created_by | number | 是 | 创建人用户 ID | 可选展示 |

---

### 8. 新建用户

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/admin/users`
- 是否需要登录：是
- 所需权限：`admin:users:create`
- 接口作用：创建新用户账号

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 登录名，全局唯一，创建后不可修改 | `zhangsan` |
| name | string | 是 | 姓名 | `张三` |
| password | string | 是 | 初始密码，须符合密码规则 | `Abc12345` |
| user_type | number | 是 | 用户类型，1 内部员工 2 企业客户 | `1` |
| org_id | string | 是 | 所属组织 ID | `org_001` |
| role_ids | array\<number\> | 是 | 角色 ID 列表，至少 1 个 | `[1, 2]` |
| project_ids | array\<string\> | 否 | 可访问项目 ID 列表，为空不限制 | `["p_001"]` |
| remark | string | 否 | 备注 | `负责视频内容运营` |

**成功响应**
```json
{
  "code": 0,
  "message": "用户创建成功",
  "data": {
    "id": 10,
    "username": "zhangsan",
    "name": "张三",
    "status": 1,
    "status_label": "启用",
    "created_at": "2026-03-23T10:00:00Z"
  },
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1001 | 用户名重复 | 用户名已存在 | 展示在 username 字段下方 |
| 1001 | 密码不符合规则 | 密码须包含大写字母、小写字母和数字 | 展示在 password 字段下方 |
| 1001 | role_ids 为空 | 角色不能为空 | 展示在角色字段下方 |
| 1004 | 角色 ID 不存在 | 所选角色不存在 | 提示刷新后重试 |

---

### 9. 编辑用户

**基本信息**
- 请求方法：PUT
- 请求路径：`/api/v1/admin/users/{id}`
- 是否需要登录：是
- 所需权限：`admin:users:edit`
- 接口作用：修改用户信息（用户名不可修改）

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户 ID |

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 姓名 |
| user_type | number | 是 | 用户类型 |
| org_id | string | 是 | 所属组织 ID |
| role_ids | array\<number\> | 是 | 角色 ID 列表 |
| project_ids | array\<string\> | 否 | 可访问项目 ID 列表 |
| remark | string | 否 | 备注 |

**成功响应**：同用户详情响应结构

**联调注意事项**
- `username` 字段不接受修改，传了也忽略
- 编辑成功后建议前端重新调用用户详情接口刷新数据

---

### 10. 切换用户状态

**基本信息**
- 请求方法：PATCH
- 请求路径：`/api/v1/admin/users/{id}/status`
- 是否需要登录：是
- 所需权限：`admin:users:toggle-status`
- 接口作用：启用或停用用户账号

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户 ID |

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| status | number | 是 | 目标状态，1 启用 2 停用 | `2` |

**成功响应**
```json
{
  "code": 0,
  "message": "用户已停用",
  "data": null,
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1005 | 停用最后一个系统管理员 | 不可停用最后一个系统管理员 | Toast 展示 message |

---

### 11. 解锁用户

**基本信息**
- 请求方法：PATCH
- 请求路径：`/api/v1/admin/users/{id}/unlock`
- 是否需要登录：是
- 所需权限：`admin:users:toggle-status`
- 接口作用：解除因登录失败过多导致的账号锁定

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户 ID |

**成功响应**
```json
{
  "code": 0,
  "message": "账号已解锁",
  "data": null,
  "timestamp": 1711180800000
}
```

**统计字段说明**
- `user_count`：角色绑定用户总数
- `active_user_count`：角色绑定用户中，状态为 `1`（启用）的数量
- `disabled_user_count`：角色绑定用户中，状态为 `2`（停用）的数量
- `status = 3`（锁定）与 `status = 4`（未激活）不计入上述两个新增字段

---

### 12. 重置密码

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/admin/users/{id}/reset-password`
- 是否需要登录：是
- 所需权限：`admin:users:reset-password`
- 接口作用：管理员为用户重置密码，重置后用户下次登录强制改密

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户 ID |

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| new_password | string | 是 | 新密码，须符合密码规则 | `NewPass456` |

**成功响应**
```json
{
  "code": 0,
  "message": "密码重置成功，用户下次登录须修改密码",
  "data": null,
  "timestamp": 1711180800000
}
```

---

### 13. 角色列表

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/roles`
- 是否需要登录：是
- 所需权限：`admin:roles:list`
- 接口作用：分页查询角色列表

**Query 参数**

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| per_page | number | 否 | 每页条数 | 20 |
| keyword | string | 否 | 关键字，匹配角色名称 | — |
| status | number | 否 | 状态筛选 | — |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 9,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1,
    "list": [
      {
        "id": 1,
        "name": "系统管理员",
        "code": "system_admin",
        "description": "平台最高权限，负责用户、角色、权限、审计管理",
        "data_scope": 1,
        "is_system_preset": true,
        "status": 1,
        "status_label": "启用",
        "user_count": 2,
        "updated_at": "2026-03-23T10:00:00Z"
      }
    ]
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| list[].is_system_preset | boolean | 否 | 是否系统预置 | 为 true 时隐藏删除按钮 |
| list[].user_count | number | 否 | 当前绑定用户数 | user_count > 0 时禁止删除，可在按钮 tooltip 提示 |
| list[].data_scope | number | 否 | 数据范围，首期固定为 1（全量） | 首期不展示此字段，预留 |

---

### 14. 角色详情

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/roles/{id}`
- 是否需要登录：是
- 所需权限：`admin:roles:list`
- 接口作用：获取角色详情，用于编辑表单回显

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "系统管理员",
    "code": "system_admin",
    "description": "平台最高权限",
    "data_scope": 1,
    "is_system_preset": true,
    "status": 1,
    "status_label": "启用",
    "user_count": 2,
    "active_user_count": 1,
    "disabled_user_count": 1,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-23T10:00:00Z"
  },
  "timestamp": 1711180800000
}
```

---

### 15. 新建角色

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/admin/roles`
- 是否需要登录：是
- 所需权限：`admin:roles:create`
- 接口作用：创建新角色

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | string | 是 | 角色名称，全局唯一 | `内容审核员` |
| code | string | 是 | 角色编码，全局唯一，创建后不可修改，仅限小写字母、数字、下划线 | `content_reviewer` |
| description | string | 否 | 角色说明 | `负责内容技术审核` |
| status | number | 是 | 状态，1 启用 2 停用 | `1` |

**成功响应**
```json
{
  "code": 0,
  "message": "角色创建成功",
  "data": {
    "id": 10,
    "name": "内容审核员",
    "code": "content_reviewer",
    "status": 1,
    "created_at": "2026-03-23T10:00:00Z"
  },
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1001 | 角色名称重复 | 角色名称已存在 | 展示在 name 字段下方 |
| 1001 | 角色编码重复 | 角色编码已存在 | 展示在 code 字段下方 |
| 1001 | 编码格式不合法 | 角色编码只允许小写字母、数字和下划线 | 展示在 code 字段下方 |

---

### 16. 编辑角色

**基本信息**
- 请求方法：PUT
- 请求路径：`/api/v1/admin/roles/{id}`
- 是否需要登录：是
- 所需权限：`admin:roles:edit`
- 接口作用：修改角色信息（编码不可修改）

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 角色名称 |
| description | string | 否 | 角色说明 |
| status | number | 是 | 状态 |

**联调注意事项**
- `code` 字段不接受修改，传了也忽略
- `is_system_preset` 为 true 的角色仍可编辑名称和描述，但不可删除

---

### 17. 复制角色

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/admin/roles/{id}/copy`
- 是否需要登录：是
- 所需权限：`admin:roles:create`
- 接口作用：基于现有角色复制生成新角色，复制角色名称和权限配置

**Path 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 被复制的角色 ID |

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | string | 是 | 新角色名称 | `内容审核员（副本）` |
| code | string | 是 | 新角色编码 | `content_reviewer_copy` |

**成功响应**：同新建角色响应结构

---

### 18. 切换角色状态

**基本信息**
- 请求方法：PATCH
- 请求路径：`/api/v1/admin/roles/{id}/status`
- 是否需要登录：是
- 所需权限：`admin:roles:toggle-status`
- 接口作用：启用或停用角色

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| status | number | 是 | 目标状态，1 启用 2 停用 | `2` |

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1005 | 停用角色下存在活跃用户 | 该角色下存在 3 个活跃用户，请先解绑或停用相关用户后再停用角色 | Toast 展示 message，并提供跳转用户列表按钮 |

---

### 19. 删除角色

**基本信息**
- 请求方法：DELETE
- 请求路径：`/api/v1/admin/roles/{id}`
- 是否需要登录：是
- 所需权限：`admin:roles:delete`
- 接口作用：删除角色（仅允许删除未绑定用户且非系统预置的角色）

**成功响应**
```json
{
  "code": 0,
  "message": "角色已删除",
  "data": null,
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1005 | 系统预置角色 | 系统预置角色不可删除 | Toast 展示 message |
| 1005 | 角色下有绑定用户 | 该角色下存在用户，请先解绑后再删除 | Toast 展示 message |

---

### 20. 获取角色已绑定权限

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/roles/{id}/permissions`
- 是否需要登录：是
- 所需权限：`admin:roles:assign-permissions`
- 接口作用：获取角色已绑定的权限标识列表，用于权限配置页回显

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "role_id": 1,
    "permissions": [
      "admin:users:list",
      "admin:users:create",
      "admin:users:edit",
      "admin:roles:list"
    ]
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| permissions | array\<string\> | 否 | 已绑定权限标识列表 | 空数组表示无任何权限，与菜单树对比高亮已勾选节点 |

---

### 21. 更新角色权限

**基本信息**
- 请求方法：PUT
- 请求路径：`/api/v1/admin/roles/{id}/permissions`
- 是否需要登录：是
- 所需权限：`admin:roles:assign-permissions`
- 接口作用：全量替换角色的权限绑定（传入的即最终状态）

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| permissions | array\<string\> | 是 | 权限标识列表，全量替换；传空数组即清空所有权限 | `["admin:users:list"]` |

**成功响应**
```json
{
  "code": 0,
  "message": "权限配置已保存",
  "data": null,
  "timestamp": 1711180800000
}
```

**联调注意事项**
- 此接口为全量替换，不是增量更新，传入什么就是最终状态
- 权限保存后立即生效，已登录用户下次请求时自动拿到新权限
- 传入不存在的权限标识时后端忽略，不报错

---

### 22. 获取完整菜单树（管理用）

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/menus/tree`
- 是否需要登录：是
- 所需权限：`admin:menus:list`
- 接口作用：获取完整菜单树（含停用节点），用于菜单管理列表页和权限配置页左侧树

**Query 参数**

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| include_disabled | boolean | 否 | 是否包含停用节点，菜单管理页传 true，权限配置页传 false | `false` |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "type": 1,
      "name": "后台管理",
      "permission": "admin",
      "route_path": null,
      "component": null,
      "icon": "Settings",
      "sort": 1,
      "status": 1,
      "status_label": "启用",
      "remark": null,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-03-23T10:00:00Z",
      "children": [
        {
          "id": 2,
          "parent_id": 1,
          "type": 2,
          "name": "用户管理",
          "permission": "admin:users:list",
          "route_path": "/admin/users",
          "component": "features/users/UserListPage",
          "icon": "Users",
          "sort": 1,
          "status": 1,
          "status_label": "启用",
          "remark": null,
          "created_at": "2026-01-01T00:00:00Z",
          "updated_at": "2026-03-23T10:00:00Z",
          "children": [
            {
              "id": 10,
              "parent_id": 2,
              "type": 3,
              "name": "新建用户",
              "permission": "admin:users:create",
              "route_path": null,
              "component": null,
              "icon": null,
              "sort": 1,
              "status": 1,
              "status_label": "启用",
              "remark": null,
              "created_at": "2026-01-01T00:00:00Z",
              "updated_at": "2026-03-23T10:00:00Z",
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| parent_id | number | 是 | 父节点 ID | null 表示根节点 |
| type | number | 否 | 节点类型，1 目录 2 菜单项 3 按钮 | 用于渲染不同图标和交互 |
| route_path | string | 是 | 前端路由路径 | type=1/3 时为 null |
| component | string | 是 | 前端组件路径 | type=1/3 时为 null |
| icon | string | 是 | lucide-react 图标名 | type=3 时为 null，null 时不展示图标 |
| remark | string | 是 | 备注 | 为 null 时展示空 |
| children | array | 否 | 子节点列表 | 无子节点时为 `[]`，不为 null |

**空值和边界规则**
- `children` 固定返回数组，不返回 `null`
- 按钮类型节点（type=3）必然没有子节点，`children` 为 `[]`
- 后端已按 `sort` 升序排列，前端不需要重排序

---

### 23. 新建菜单节点

**基本信息**
- 请求方法：POST
- 请求路径：`/api/v1/admin/menus`
- 是否需要登录：是
- 所需权限：`admin:menus:create`
- 接口作用：新建菜单节点

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| parent_id | number | 否 | 父节点 ID，为空则为根节点 | `1` |
| type | number | 是 | 节点类型，1 目录 2 菜单项 3 按钮 | `2` |
| name | string | 是 | 菜单名称，最多 20 字 | `用户管理` |
| permission | string | 是 | 权限标识，全局唯一，格式：模块:资源:动作 | `admin:users:list` |
| route_path | string | type=2 时必填 | 前端路由路径 | `/admin/users` |
| component | string | type=2 时必填 | 前端组件路径 | `features/users/UserListPage` |
| icon | string | 否 | lucide-react 图标名 | `Users` |
| sort | number | 是 | 排序值，数字越小越靠前 | `1` |
| status | number | 是 | 状态，1 启用 2 停用 | `1` |
| remark | string | 否 | 备注 | — |

**成功响应**
```json
{
  "code": 0,
  "message": "菜单创建成功",
  "data": {
    "id": 20,
    "name": "用户管理",
    "permission": "admin:users:list",
    "created_at": "2026-03-23T10:00:00Z"
  },
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1001 | 权限标识重复 | 权限标识已存在 | 展示在 permission 字段下方 |
| 1001 | 按钮挂在目录下 | 按钮类型节点只能挂载在菜单项下 | 展示表单错误 |
| 1001 | 超过最大层级 | 菜单树最多支持 3 级 | 展示表单错误 |

---

### 24. 编辑菜单节点

**基本信息**
- 请求方法：PUT
- 请求路径：`/api/v1/admin/menus/{id}`
- 是否需要登录：是
- 所需权限：`admin:menus:edit`
- 接口作用：修改菜单节点信息（permission 字段不可修改）

**Body 参数**：同新建，除 `permission` 字段外均可修改

**联调注意事项**
- `permission` 字段传了也忽略，不允许修改
- `type` 字段传了也忽略，节点类型创建后不可修改

---

### 25. 切换菜单状态

**基本信息**
- 请求方法：PATCH
- 请求路径：`/api/v1/admin/menus/{id}/status`
- 是否需要登录：是
- 所需权限：`admin:menus:toggle-status`
- 接口作用：启用或停用菜单节点，停用父节点时子节点同步停用

**Body 参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| status | number | 是 | 目标状态，1 启用 2 停用 | `2` |

**成功响应**
```json
{
  "code": 0,
  "message": "菜单已停用",
  "data": {
    "affected_count": 5
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| affected_count | number | 否 | 受影响的节点数（含子节点） | 停用时展示「已停用 N 个节点」提示 |

---

### 26. 删除菜单节点

**基本信息**
- 请求方法：DELETE
- 请求路径：`/api/v1/admin/menus/{id}`
- 是否需要登录：是
- 所需权限：`admin:menus:delete`
- 接口作用：删除菜单节点（仅允许删除未被角色引用的节点）

**成功响应**
```json
{
  "code": 0,
  "message": "菜单已删除",
  "data": null,
  "timestamp": 1711180800000
}
```

**错误响应**

| code | 场景 | message 示例 | 前端处理建议 |
|------|------|------------|------------|
| 1005 | 节点已被角色引用 | 该菜单已被 3 个角色引用，请先解绑后再删除 | Toast 展示 message |
| 1005 | 节点有子节点 | 请先删除子节点后再删除父节点 | Toast 展示 message |

---

### 27. 审计日志列表

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/audit-logs`
- 是否需要登录：是
- 所需权限：`admin:audit-logs:list`
- 接口作用：分页查询审计日志，支持多条件筛选

**Query 参数**

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| per_page | number | 否 | 每页条数，最大 100 | 20 |
| log_type | string | 否 | 日志类型筛选 | — |
| operator_id | number | 否 | 操作人用户 ID | — |
| object_type | string | 否 | 对象类型筛选 | — |
| object_id | string | 否 | 对象 ID 精确查询 | — |
| start_time | string | 否 | 开始时间，UTC ISO 格式 | — |
| end_time | string | 否 | 结束时间，UTC ISO 格式 | — |
| project_id | string | 否 | 项目 ID 筛选 | — |

**log_type 可选值**

| 值 | 说明 |
|----|------|
| `user_permission` | 用户权限操作 |
| `role_permission` | 角色权限操作 |
| `menu` | 菜单操作 |
| `login` | 登录相关 |
| `content_edit` | 内容编辑（二期接入） |
| `sign` | 签核操作（二期接入） |
| `change` | 变更审批（二期接入） |
| `config` | 配置修改（二期接入） |
| `import` | 导入操作（二期接入） |
| `export` | 导出操作（二期接入） |

**object_type 可选值**

| 值 | 说明 |
|----|------|
| `user` | 用户 |
| `role` | 角色 |
| `menu` | 菜单 |
| `permission` | 权限 |

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 320,
    "per_page": 20,
    "current_page": 1,
    "last_page": 16,
    "list": [
      {
        "id": 1001,
        "log_type": "user_permission",
        "log_type_label": "用户权限操作",
        "operator_id": 1,
        "operator_name": "张三",
        "action": "create",
        "action_label": "新建",
        "object_type": "user",
        "object_type_label": "用户",
        "object_id": "5",
        "object_name": "李四",
        "result": 1,
        "result_label": "成功",
        "project_id": null,
        "created_at": "2026-03-23T10:00:00Z"
      }
    ]
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| list[].id | number | 否 | 日志 ID | 用于查询详情 |
| list[].log_type | string | 否 | 日志类型标识 | 直接使用 |
| list[].log_type_label | string | 否 | 日志类型展示文本 | 直接展示，不需要前端转换 |
| list[].action | string | 否 | 操作动作标识 | 直接使用 |
| list[].action_label | string | 否 | 操作动作展示文本 | 直接展示 |
| list[].object_type_label | string | 否 | 对象类型展示文本 | 直接展示 |
| list[].result | number | 否 | 1 成功 2 失败 | 用于列表状态颜色区分 |
| list[].result_label | string | 否 | 结果展示文本 | 直接展示 |
| list[].project_id | string | 是 | 关联项目 ID | 为 null 时不展示 |

---

### 28. 审计日志详情

**基本信息**
- 请求方法：GET
- 请求路径：`/api/v1/admin/audit-logs/{id}`
- 是否需要登录：是
- 所需权限：`admin:audit-logs:list`
- 接口作用：获取单条审计日志详情，包含字段级变更前后值

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "log_type": "user_permission",
    "log_type_label": "用户权限操作",
    "operator_id": 1,
    "operator_name": "张三",
    "action": "update",
    "action_label": "编辑",
    "object_type": "user",
    "object_type_label": "用户",
    "object_id": "5",
    "object_name": "李四",
    "before_value": {
      "name": "李四",
      "org_id": "org_001",
      "roles": ["内容运营"]
    },
    "after_value": {
      "name": "李四",
      "org_id": "org_002",
      "roles": ["内容运营", "审核人员"]
    },
    "result": 1,
    "result_label": "成功",
    "fail_reason": null,
    "source_page": "/admin/users",
    "request_id": "req_abc123xyz",
    "project_id": null,
    "created_at": "2026-03-23T10:00:00Z"
  },
  "timestamp": 1711180800000
}
```

**响应字段说明**

| 字段名 | 类型 | 是否可空 | 说明 | 前端处理建议 |
|--------|------|---------|------|------------|
| before_value | object | 是 | 变更前字段值（JSON 对象） | 为 null 表示新建操作，不展示变更前 |
| after_value | object | 是 | 变更后字段值（JSON 对象） | 为 null 表示删除操作，不展示变更后 |
| fail_reason | string | 是 | 失败原因 | 为 null 时不展示 |
| source_page | string | 是 | 操作来源页面路径 | 为 null 时不展示 |
| request_id | string | 是 | 请求追踪 ID | 展示供排障使用 |

---

## 接口差异提醒

1. 所有 ID 字段均为 `number` 类型（MySQL BIGINT），**不是** string
2. `object_id` 字段为 `string` 类型（因为不同对象类型的 ID 格式不同）
3. 所有时间字段均为 UTC ISO 8601 字符串，**不是**时间戳，前端统一格式化
4. 枚举字段后端同时返回值（如 `status: 1`）和展示文本（如 `status_label: "启用"`），前端直接展示 label 字段，**不需要**前端自己做枚举转换
5. 列表接口的 `list` 字段空数据时返回 `[]`，**不返回** `null`
6. `children` 字段空数据时返回 `[]`，**不返回** `null`
7. 删除、状态切换等操作成功时 `data` 返回 `null`，**不返回**被操作的实体
8. 权限更新接口（接口 21）为**全量替换**，不是增量更新
9. `permission` 字段（权限标识）在菜单节点创建后**不可修改**
10. 角色 `code` 字段在角色创建后**不可修改**
11. 用户 `username` 字段在创建后**不可修改**

---

## 联调样例

### 样例 1：登录并获取权限菜单

```
步骤 1：POST /api/v1/auth/login
Body: { "username": "admin", "password": "Abc12345" }

期望返回：
- code = 0
- data.token 存入 localStorage
- data.user.must_change_password = false（为 true 则跳改密页）

步骤 2：GET /api/v1/auth/menus（携带 token）

期望返回：
- code = 0
- data 为菜单树数组
- 前端遍历，type=2 的节点注册路由，type=3 的节点提取 permission 存入权限 Map
```

### 样例 2：新建用户完整流程

```
前置：GET /api/v1/admin/roles（拉取可选角色列表）

新建：POST /api/v1/admin/users
Body:
{
  "username": "lisi",
  "name": "李四",
  "password": "Abc12345",
  "user_type": 1,
  "org_id": "org_001",
  "role_ids": [2],
  "project_ids": [],
  "remark": ""
}

期望返回：code = 0，data.id 为新用户 ID
前端：关闭弹窗，刷新用户列表
```

### 样例 3：权限配置页完整流程

```
步骤 1：GET /api/v1/admin/menus/tree?include_disabled=false
→ 获取全部启用菜单，渲染左侧树

步骤 2：GET /api/v1/admin/roles/{id}/permissions
→ 获取角色已有权限标识列表，在树中高亮已勾选节点

步骤 3：用户勾选/取消后，点击保存
PUT /api/v1/admin/roles/{id}/permissions
Body: { "permissions": ["admin:users:list", "admin:users:create"] }

期望返回：code = 0
前端：Toast 提示「权限配置已保存」
```

### 样例 4：停用角色（含活跃用户时的错误处理）

```
PATCH /api/v1/admin/roles/3/status
Body: { "status": 2 }

正常返回：{ "code": 0, "message": "角色已停用" }

异常返回：
{
  "code": 1005,
  "message": "该角色下存在 3 个活跃用户，请先解绑或停用相关用户后再停用角色"
}
前端：Toast 展示 message，可选提供跳转至用户列表并按该角色筛选的快捷按钮
```

---

## 修订记录

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|---------|
| v1.0 | 2026-03-23 | [姓名] | 初始版本，覆盖第一期 28 个接口：认证（5）、用户管理（7）、角色管理（7）、菜单管理（5）、审计日志（2）、权限配置（2）|
