# EasyCMS 地面内容管理平台 技术架构文档

**版本**: v1.2  
**最后更新**: 2026-03-26  
**文档负责人**: [姓名]

---

## 1. 概述

### 1.1 文档目的

本文档面向研发团队（前端、后端、运维），描述 EasyCMS 地面内容管理平台的整体技术架构、技术选型、开发规范和部署方案，作为项目开发阶段的技术基准文档。

### 1.2 系统简介

EasyCMS 是一套面向国产 IFE（机上娱乐）场景的地面内容管理平台，统一承载内容主数据管理、分类编排、审核签核、周期管理、配置治理、导出发布和质量追踪，服务内部员工（运营/审核/发布/配置）和企业客户（内容服务商）两类用户。

### 1.3 架构目标

- **安全**：基于 RBAC 的权限控制，所有写操作留审计日志，传输层强制 HTTPS
- **可维护**：前后端分离，后端分层清晰（Controller / Service / Repository），便于独立迭代
- **可扩展**：模块化设计，新增内容对象、导出规则、适配标准无需改动核心架构
- **可追溯**：关键操作全链路审计，导出结果留摘要，变更申请可追溯审批过程
- **高性能**：核心列表接口 P99 < 300ms，Redis 缓存热点数据，队列异步处理耗时任务

---

## 2. 系统架构总览

### 2.1 架构模式

采用**前后端分离单体架构**。

前端为 React SPA，通过 RESTful API 与后端通信。后端采用 Laravel 单体应用，内部按业务模块分层组织，不拆微服务。选型理由：

- 团队规模适中，单体架构运维成本低，迭代速度快
- Laravel 生态成熟，内置认证、队列、任务调度、事件系统，覆盖当前所有业务诉求
- 后续若有性能瓶颈，可将导出/导入等重型任务剥离为独立 Worker 服务，不需要整体重构

### 2.2 整体架构分层

```
┌─────────────────────────────────────────────────┐
│                   浏览器 / Client                │
│            React 18 SPA（Vite 构建）             │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / RESTful API
┌────────────────────▼────────────────────────────┐
│                  Nginx                           │
│  静态资源托管（前端 dist）+ 反向代理（/api/*）   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│             Laravel 10 应用层                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │Routes/   │  │ Middleware│  │ FormRequest   │  │
│  │Controller│  │ Auth/RBAC │  │ Validation    │  │
│  └────┬─────┘  └──────────┘  └───────────────┘  │
│       │                                          │
│  ┌────▼─────────────────────────────────────┐   │
│  │               Service 层                  │   │
│  │  业务逻辑 / 事务控制 / 权限校验            │   │
│  └────┬─────────────────────────────────────┘   │
│       │                                          │
│  ┌────▼──────────┐   ┌──────────────────────┐   │
│  │  Repository   │   │  Queue Jobs / Events  │   │
│  │  Eloquent ORM │   │  导出/导入/通知任务    │   │
│  └────┬──────────┘   └──────────────────────┘   │
└───────┼─────────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────┐
│                    数据层                        │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  MySQL 8.0  │  │  Redis   │  │  本地/OSS  │  │
│  │  主业务数据  │  │ 缓存/队列│  │  文件存储  │  │
│  └─────────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 3. 技术选型

### 3.1 技术栈总览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 前端框架 | React | 18.x | 函数式组件 + Hooks，生态成熟 |
| 构建工具 | Vite | 6.x | 开发启动快，HMR 体验好，生产构建性能优 |
| 语言（前端） | TypeScript | 5.x | 严格模式，接口类型与后端对齐 |
| 路由 | React Router | 7.x | Browser Router，支持嵌套路由与权限守卫 |
| 样式 | TailwindCSS | 4.x | Utility-first，与 shadcn/ui 深度集成 |
| 组件库 | shadcn/ui（Radix UI） | latest | 可复制组件，无额外 CSS 框架，无障碍支持 |
| 图标 | lucide-react | 0.487.x | 与 shadcn/ui 风格统一 |
| Toast 通知 | sonner | 2.x | 轻量，与 shadcn/ui 集成 |
| 包管理 | npm | — | package-lock.json 提交仓库 |
| 后端框架 | Laravel | 10.x | PHP 生态最成熟的全功能框架，内置认证/队列/调度 |
| 语言（后端） | PHP | 8.2+ | 严格类型，性能较 8.0 有显著提升 |
| 数据库 | MySQL | 8.0 | 强一致性，事务支持，窗口函数支持 |
| 缓存 / 队列 | Redis | 7.x | 会话存储、热点缓存、队列驱动、限流计数 |
| Web 服务器 | Nginx | 1.24+ | 静态资源托管 + PHP-FPM 反向代理 |
| 进程管理 | Supervisor | — | 管理 Laravel Queue Worker 进程 |
| 容器化 | Docker + Docker Compose | — | 开发环境统一，生产环境标准化部署 |

### 3.2 前端补充推荐库

| 库 | 用途 | 推荐理由 |
|----|------|---------|
| TanStack Query（React Query） | 服务端状态管理、接口缓存与同步 | 替代 useEffect + useState 手写请求，内置缓存、重试、分页 |
| React Hook Form | 表单状态管理与校验 | 性能优，与 shadcn/ui Form 组件深度集成，支持 Zod schema 校验 |
| Zod | 运行时数据校验 + TypeScript 类型推导 | 前后端 schema 对齐，表单校验与接口响应校验统一 |
| axios | HTTP 请求 | 拦截器机制统一处理 token、错误、超时 |
| date-fns | 日期处理 | 轻量、树摇友好，替代 moment.js |
| @tanstack/react-table | 复杂表格（排序/筛选/分页） | 内容列表、审计日志等重型表格场景 |
| recharts | 报表图表 | 基于 D3，React 原生支持，满足报表中心需求 |
| react-dropzone | 文件上传拖拽区 | 素材/导入文件上传场景 |
| cmdk | 命令面板 | 全局搜索入口，shadcn/ui Command 组件底层依赖 |

### 3.3 后端推荐扩展包

| 包 | 用途 | 说明 |
|----|------|------|
| laravel/sanctum | API Token 认证 | SPA 认证首选，支持 Cookie + Token 双模式 |
| spatie/laravel-permission | RBAC 权限管理 | 角色/权限模型开箱即用，与 Laravel 深度集成 |
| spatie/laravel-activitylog | 审计日志 | 自动记录 Eloquent 模型变更，支持自定义日志内容 |
| spatie/laravel-query-builder | 接口筛选/排序/分页 | 通过 URL 参数自动构建 Eloquent 查询，减少重复代码 |
| league/flysystem | 文件存储抽象层 | Laravel 内置，支持本地/OSS/S3 切换无需改业务代码 |
| maatwebsite/excel | Excel 导入导出 | 内容批量导入、报表导出场景 |
| barryvdh/laravel-ide-helper | IDE 类型提示 | 提升开发体验，生成 Eloquent 模型类型提示 |

### 3.4 第三方服务依赖

| 服务 | 用途 | 备选方案 |
|------|------|---------|
| 邮件服务（SMTP） | 用户通知（二期）| 阿里云邮件推送 / SendGrid |
| 对象存储（OSS/S3） | 素材文件、导出包存储 | 阿里云 OSS / 本地存储（开发环境） |

---

## 4. 前端架构

### 4.1 目录结构

```
src/
├── api/                  # 接口请求层，按业务域拆分
│   ├── auth.ts
│   ├── users.ts
│   ├── roles.ts
│   ├── permissions.ts
│   ├── media.ts              # 媒体管理（元数据 CRUD，可选拆分为独立文件）
│   ├── audit-logs.ts
│   └── request.ts        # axios 实例，统一拦截器
├── components/
│   ├── ui/               # shadcn/ui 组件（从 shadcn 复制，不修改）
│   └── common/           # 业务公共组件（布局、表格、权限守卫等）
├── features/             # 按业务功能模块组织
│   ├── auth/             # 登录、修改密码
│   ├── users/            # 用户管理
│   ├── roles/            # 角色管理
│   ├── permissions/      # 权限配置
│   ├── media/            # 媒体管理（列表与表单）
│   └── audit-logs/       # 审计日志
├── hooks/                # 全局自定义 Hook
│   ├── useAuth.ts        # 当前登录用户信息
│   ├── usePermission.ts  # 权限判断 Hook
│   └── usePagination.ts  # 分页状态管理
├── lib/                  # 工具库封装
│   ├── utils.ts          # shadcn/ui cn() 等工具
│   ├── date.ts           # date-fns 封装
│   └── zod-schemas.ts    # 公共 Zod schema
├── router/               # 路由配置
│   ├── index.tsx         # 路由表
│   └── PrivateRoute.tsx  # 权限守卫
├── store/                # 客户端全局状态（zustand，仅用于 UI 状态）
│   └── auth.ts           # 登录态、用户信息
├── types/                # 全局 TypeScript 类型
│   ├── api.ts            # 接口响应通用类型
│   ├── user.ts
│   └── permission.ts
└── main.tsx              # 应用入口
```

### 4.2 状态管理策略

| 状态类型 | 方案 | 说明 |
|---------|------|------|
| 服务端数据 | TanStack Query | 列表、详情、分页，内置缓存与重新验证 |
| 登录态 / 用户信息 | Zustand + localStorage | 持久化 token，刷新后恢复 |
| 表单状态 | React Hook Form + Zod | 表单校验与提交 |
| UI 局部状态 | useState / useReducer | 弹窗开关、加载状态等 |

> 原则：服务端状态不进 Zustand，Zustand 只存纯客户端 UI 状态。

### 4.3 权限控制（前端）

**路由级守卫**

```tsx
// router/PrivateRoute.tsx
export function PrivateRoute({ permission }: { permission?: string }) {
  const { user } = useAuthStore();
  const { hasPermission } = usePermission();

  if (!user) return <Navigate to="/login" />;
  if (permission && !hasPermission(permission)) return <NoPermission />;

  return <Outlet />;
}
```

**操作级控制**

```tsx
// hooks/usePermission.ts
export function usePermission() {
  const permissions = useAuthStore(s => s.permissions);
  return {
    hasPermission: (key: string) => permissions.includes(key),
  };
}

// 使用
const { hasPermission } = usePermission();
{hasPermission('admin:users:create') && <Button>新建用户</Button>}
```

- 无权限菜单不渲染，不做跳转后提示
- 无权限按钮不渲染（不置灰），防止用户误触
- 前端权限仅做展示控制，后端每次请求必须实时校验

### 4.4 接口请求层

```ts
// api/request.ts
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 请求拦截：注入 token
request.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一错误处理
request.interceptors.response.use(
  res => res.data,
  error => {
    const status = error.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    if (status === 403) {
      toast.error('权限已变更，请刷新页面后重试');
    }
    return Promise.reject(error);
  }
);
```

### 4.5 性能优化策略

- 路由懒加载（`React.lazy` + `Suspense`），按 feature 拆包
- TanStack Query 缓存列表数据，避免重复请求
- 长列表场景（审计日志、内容列表）使用分页，不做虚拟滚动（后台系统数据量可控）
- 图片资源使用 WebP 格式，素材缩略图走 OSS 图片处理
- Vite 生产构建自动 Code Splitting，按需加载

---

## 5. 后端架构

### 5.1 目录结构

```
app/
├── Console/                      # Artisan 命令（定时任务、脚本）
├── Events/                       # 业务事件定义
│   ├── User/
│   │   ├── UserCreated.php
│   │   ├── UserDeactivated.php
│   │   └── UserRoleChanged.php
│   └── Auth/
│       ├── UserLoggedIn.php
│       └── UserLoginFailed.php
├── Exceptions/                   # 全局异常处理
│   ├── Handler.php
│   └── BusinessException.php     # 业务规则拦截异常（code 1005）
├── Http/
│   ├── Controllers/              # 只管路由接收和响应，不含业务逻辑
│   │   ├── Auth/
│   │   │   └── AuthController.php
│   │   └── Admin/
│   │       ├── UserController.php
│   │       ├── RoleController.php
│   │       ├── MenuController.php
│   │       ├── PermissionController.php
│   │       └── AuditLogController.php
│   ├── Middleware/
│   │   ├── CheckPermission.php        # 操作级权限校验
│   │   ├── ForceChangePassword.php    # 首次登录强制改密
│   │   └── RequestId.php              # 请求 ID 注入与透传
│   ├── Requests/                 # FormRequest：参数校验 + authorize() 权限预校验
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   └── ChangePasswordRequest.php
│   │   └── Admin/
│   │       ├── CreateUserRequest.php
│   │       ├── UpdateUserRequest.php
│   │       ├── CreateRoleRequest.php
│   │       ├── CreateMenuRequest.php
│   │       ├── UpdateMenuRequest.php
│   │       └── UpdateRolePermissionsRequest.php
│   └── Resources/                # API Resource：响应数据格式化，与业务逻辑解耦
│       ├── UserResource.php
│       ├── UserCollection.php
│       ├── RoleResource.php
│       ├── MenuResource.php
│       └── AuditLogResource.php
│
├── Actions/                      # 单一业务动作，原子操作，可独立测试，可跨 Service 复用
│   ├── User/
│   │   ├── CreateUserAction.php
│   │   ├── UpdateUserAction.php
│   │   ├── DeactivateUserAction.php
│   │   ├── ActivateUserAction.php
│   │   ├── ResetPasswordAction.php
│   │   └── UnlockUserAction.php
│   ├── Role/
│   │   ├── CreateRoleAction.php
│   │   ├── UpdateRoleAction.php
│   │   ├── DeactivateRoleAction.php
│   │   └── SyncRolePermissionsAction.php
│   ├── Menu/
│   │   ├── CreateMenuAction.php
│   │   ├── UpdateMenuAction.php
│   │   ├── ToggleMenuStatusAction.php
│   │   └── DeleteMenuAction.php
│   └── Auth/
│       ├── LoginAction.php
│       └── LogoutAction.php
│
├── Services/                     # 业务编排层，组合 Action 和 Repository，控制事务边界
│   ├── Auth/
│   │   └── AuthService.php
│   └── Admin/
│       ├── UserService.php
│       ├── RoleService.php
│       ├── MenuService.php
│       ├── PermissionService.php
│       └── AuditLogService.php
│
├── Repositories/
│   ├── Contracts/                # Repository 接口定义，Service/Action 依赖接口而非实现
│   │   ├── UserRepositoryInterface.php
│   │   ├── RoleRepositoryInterface.php
│   │   ├── MenuRepositoryInterface.php
│   │   └── AuditLogRepositoryInterface.php
│   └── Eloquent/                 # Eloquent 具体实现，单测时可整体 mock 替换
│       ├── UserRepository.php
│       ├── RoleRepository.php
│       ├── MenuRepository.php
│       └── AuditLogRepository.php
│
├── Models/                       # 只保留：关联定义、属性转换（cast）、常量枚举、Scope
│   ├── User.php
│   ├── Role.php
│   ├── Menu.php
│   └── AuditLog.php
│
├── Listeners/                    # 事件监听器，处理审计日志、通知等副作用，与主流程解耦
│   ├── WriteAuditLog.php         # 统一监听所有业务事件，写入审计日志
│   └── SendNotification.php      # 二期：监听事件发送站内消息/邮件
│
├── Jobs/                         # 队列异步任务
│   ├── ExportContentJob.php      # 二期：导出包生成
│   └── ImportContentJob.php      # 二期：批量内容导入
│
├── Traits/
│   └── ApiResponse.php           # Controller 统一响应格式 Trait
│
└── Providers/
    └── RepositoryServiceProvider.php  # 绑定 Interface → Eloquent 实现
```

### 5.2 分层职责

| 层 | 职责 | 禁止 |
|----|------|------|
| Controller | 接收请求、调用 FormRequest 校验、调用 Service、使用 Resource 格式化响应 | 写业务逻辑、直接操作数据库、手动格式化响应字段 |
| FormRequest | 参数格式校验（`rules()`）、权限预校验（`authorize()`） | 写业务逻辑、调数据库 |
| API Resource | 响应字段映射、label 转换、关联数据格式化 | 写业务逻辑、触发数据库查询 |
| Service | 业务流程编排、事务边界控制、组合多个 Action | 直接写 Eloquent 查询、处理 HTTP 细节 |
| Action | 单一原子业务动作，可被多个 Service 或其他 Action 复用 | 跨越多个无关业务领域、直接返回 HTTP 响应 |
| Repository Interface | 定义数据访问契约，Service/Action 依赖此接口 | 包含任何业务判断 |
| Repository Eloquent | 实现 Interface，封装 Eloquent 查询、分页、条件过滤 | 写业务判断、调其他 Service |
| Model | 定义关联关系（`hasMany`/`belongsTo`）、属性转换（`casts`）、查询 Scope、枚举常量 | 写业务逻辑、调 Service |
| Event / Listener | 解耦副作用：审计日志、通知、缓存清理等，监听方可独立扩展 | 修改主业务流程的数据 |
| Job | 异步耗时任务（导出、导入、批量操作） | 写 HTTP 相关逻辑 |

**Action 拆分原则**（避免过度设计）：
- Service 方法超过 30 行 → 提取为 Action
- 同一段逻辑被超过一处调用 → 提取为 Action
- 包含事务 + 事件触发的完整动作 → 提取为 Action

### 5.3 接口规范

- 协议：RESTful API
- 数据格式：JSON
- 统一响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1700000000000
}
```

- 列表响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 128,
    "per_page": 20,
    "current_page": 1,
    "last_page": 7,
    "list": []
  }
}
```

- 错误码规范：

| 错误码 | 含义 | HTTP 状态码 |
|--------|------|------------|
| 0 | 成功 | 200 |
| 1001 | 参数校验失败 | 422 |
| 1002 | 未认证（未登录或 token 失效） | 401 |
| 1003 | 无权限 | 403 |
| 1004 | 资源不存在 | 404 |
| 1005 | 操作被业务规则拦截（如停用最后一个管理员） | 422 |
| 5000 | 服务器内部错误 | 500 |

### 5.4 鉴权方案（Laravel Sanctum）

- 登录：用户名/密码 → 校验 → 签发 Sanctum Token，存入 `personal_access_tokens` 表
- Token 有效期：8 小时（与会话超时一致），通过 Sanctum 配置 `expiration`
- 接口鉴权：`Authorization: Bearer {token}`，`auth:sanctum` 中间件验证
- 权限校验：在 Sanctum 认证通过后，由 `CheckPermission` 中间件或 `spatie/laravel-permission` Gate 校验操作级权限
- 首次登录强制改密：`ForceChangePassword` 中间件检查 `must_change_password` 字段，为 true 时除改密接口外全部返回 403

```php
// 路由示例
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'force.change.password'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/permissions', [AuthController::class, 'permissions']);

    Route::prefix('admin')->middleware('check.permission')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
    });
});
```

### 5.5 RBAC 权限实现（spatie/laravel-permission）

```php
// 权限命名规范：模块:资源:动作
// 示例
'admin:users:list'
'admin:users:create'
'admin:users:edit'
'admin:users:delete'
'admin:roles:list'
'admin:roles:edit'
'admin:audit-logs:list'
'admin:audit-logs:export'

// CheckPermission 中间件
public function handle(Request $request, Closure $next, string $permission): Response
{
    if (!$request->user()->can($permission)) {
        return response()->json(['code' => 1003, 'message' => '无权限'], 403);
    }
    return $next($request);
}
```

### 5.6 审计日志实现

使用 `spatie/laravel-activitylog` + 自定义 Event/Listener 双轨并行：

- Eloquent 模型变更（用户、角色、权限）：通过 `LogsActivity` Trait 自动记录
- 业务动作（登录、重置密码、停用账号）：通过 `AuditLog::record()` 静态方法手动记录

```php
// 统一记录方法
AuditLog::record(
    type: 'user_permission',
    action: 'create',
    objectType: 'user',
    objectId: $user->id,
    objectName: $user->name,
    before: null,
    after: $user->toArray(),
);
```

### 5.7 队列与异步任务

队列驱动：Redis（`QUEUE_CONNECTION=redis`）

| Job | 触发时机 | 说明 |
|-----|---------|------|
| SendNotificationJob | 通知事件触发 | 二期，站内消息/邮件异步发送 |
| ExportContentJob | 发起导出任务 | 二期，导出包生成为耗时任务 |
| ImportContentJob | 上传导入文件后 | 二期，批量导入解析与写入 |

首期后台管理模块暂无异步任务，队列基础设施提前搭建，Worker 通过 Supervisor 管理。

### 5.8 媒体管理模块（后台）

**目标**：维护媒体资源**元数据**（名称、类型、存储路径占位、MIME、大小、状态等），与对象存储/OSS 对接前可用 `storage_path` 记录相对路径或 URL；**首期不包含**二进制直传与分片上传。

**权限标识**（与菜单种子一致）：

| 权限字 | 说明 |
|--------|------|
| `admin:media:list` | 列表与详情 |
| `admin:media:create` | 新建 |
| `admin:media:edit` | 更新 |
| `admin:media:delete` | 删除 |

**HTTP 接口**（前缀 `/api/v1/admin`，均需 `auth:sanctum` + 对应 `admin.permission`）：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/media-items` | 分页列表，查询参数：`page`、`per_page`、`keyword`、`media_type`、`status` |
| GET | `/media-items/{id}` | 详情 |
| POST | `/media-items` | 新建 |
| PUT | `/media-items/{id}` | 更新 |
| DELETE | `/media-items/{id}` | 删除 |

**前端路由**：SPA 路径 `/media`（与菜单 `route_path` `/admin/media` 经映射对齐）；页面与 `admin.ts` 中请求封装保持一致。

**数据表**：见 §6.2 `media_items` 定义。

---

## 6. 数据库设计

### 6.1 数据库选型

| 数据库 | 用途 |
|-------|------|
| MySQL 8.0 | 所有核心业务数据，强一致性 + 事务支持 |
| Redis 7.x | Sanctum Token 黑名单、接口限流计数、队列、热点缓存 |

### 6.2 核心表设计（第一阶段）

```sql
-- 用户表
CREATE TABLE users (
  id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username            VARCHAR(64) UNIQUE NOT NULL COMMENT '登录名，创建后不可修改',
  name                VARCHAR(64) NOT NULL COMMENT '展示姓名',
  password            VARCHAR(256) NOT NULL COMMENT 'bcrypt 加密',
  user_type           TINYINT DEFAULT 1 COMMENT '1 内部员工 2 企业客户',
  org_id              VARCHAR(32) NOT NULL COMMENT '所属组织',
  status              TINYINT DEFAULT 1 COMMENT '1 启用 2 停用 3 锁定 4 未激活',
  must_change_password TINYINT DEFAULT 1 COMMENT '1 首次登录强制改密',
  login_fail_count    TINYINT DEFAULT 0 COMMENT '连续登录失败次数',
  locked_at           DATETIME NULL COMMENT '账号锁定时间',
  last_login_at       DATETIME NULL,
  remark              VARCHAR(500) NULL,
  created_by          BIGINT UNSIGNED NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_status (status),
  INDEX idx_org_id (org_id)
) COMMENT='用户表';

-- 用户项目关联表
CREATE TABLE user_projects (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  project_id  VARCHAR(32) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_project (user_id, project_id),
  INDEX idx_user_id (user_id)
) COMMENT='用户项目关联';

-- 角色表（spatie/laravel-permission 扩展）
-- spatie 自动创建 roles / permissions / model_has_roles
-- / model_has_permissions / role_has_permissions 5 张表
-- 以下为补充字段，通过 migration 扩展 roles 表

ALTER TABLE roles ADD COLUMN description VARCHAR(500) NULL AFTER name;
ALTER TABLE roles ADD COLUMN data_scope   TINYINT DEFAULT 1 COMMENT '1 全量（首期默认）2 组织内 3 项目内' AFTER description;
ALTER TABLE roles ADD COLUMN is_system_preset TINYINT DEFAULT 0 COMMENT '1 系统预置，不可删除' AFTER data_scope;
ALTER TABLE roles ADD COLUMN status       TINYINT DEFAULT 1 COMMENT '1 启用 2 停用' AFTER is_system_preset;
ALTER TABLE roles ADD COLUMN created_at   DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE roles ADD COLUMN updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 审计日志表
CREATE TABLE audit_logs (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  log_type      VARCHAR(50) NOT NULL COMMENT '日志类型：user_permission / role_permission / login / content_edit 等',
  operator_id   BIGINT UNSIGNED NULL COMMENT '操作人 ID，系统触发时为 null',
  operator_name VARCHAR(64) NULL,
  action        VARCHAR(50) NOT NULL COMMENT '操作动作：create/update/delete/login/logout/reset_password 等',
  object_type   VARCHAR(50) NOT NULL COMMENT '对象类型：user/role/permission/content 等',
  object_id     VARCHAR(64) NULL,
  object_name   VARCHAR(255) NULL,
  before_value  JSON NULL COMMENT '变更前字段值',
  after_value   JSON NULL COMMENT '变更后字段值',
  result        TINYINT DEFAULT 1 COMMENT '1 成功 2 失败',
  fail_reason   VARCHAR(500) NULL,
  source_page   VARCHAR(255) NULL,
  request_id    VARCHAR(64) NULL COMMENT '请求唯一 ID，用于后端追踪',
  project_id    VARCHAR(32) NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_type (log_type),
  INDEX idx_operator_id (operator_id),
  INDEX idx_object (object_type, object_id),
  INDEX idx_created_at (created_at),
  INDEX idx_project_id (project_id)
) COMMENT='审计日志';

-- 媒体资源元数据（首期：不含文件二进制，存储路径占位）
CREATE TABLE media_items (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL COMMENT '显示名称',
  media_type      VARCHAR(32) NOT NULL COMMENT 'video/audio/image/document/other',
  storage_path    VARCHAR(512) NULL COMMENT '存储路径或 URL 占位',
  mime_type       VARCHAR(128) NULL,
  file_size       BIGINT UNSIGNED NULL COMMENT '字节',
  status          TINYINT DEFAULT 1 COMMENT '1 启用 2 停用',
  remark          VARCHAR(500) NULL,
  created_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_media_type (media_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) COMMENT='媒体元数据';

-- Sanctum 个人访问令牌（框架自动创建，记录在此供参考）
-- personal_access_tokens: id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at
```

### 6.3 缓存策略

| 缓存场景 | Key 格式 | TTL | 更新策略 |
|---------|---------|-----|---------|
| 当前用户权限 | `user_permissions:{user_id}` | 登录态有效期 | 角色/权限变更时主动删除 |
| 接口限流（登录） | `login_limit:{ip}` | 15 分钟 | 滑动窗口计数 |
| 账号锁定状态 | `user_locked:{user_id}` | 30 分钟 | 解锁后删除 |
| 队列任务状态 | `job_status:{job_id}` | 24 小时 | Job 完成后更新 |

> 权限缓存说明：用户权限在登录时加载并缓存，角色或权限配置变更时通过 Event 触发删除对应用户的权限缓存，下次请求时重新从数据库加载，实现「下次请求生效」的权限变更机制。

### 6.4 数据库开发规范

- 表名、字段名使用 `snake_case`
- 所有表必须有 `created_at` / `updated_at`
- 禁止使用外键约束，在应用层（Service）保证数据一致性
- 禁止在 ORM 之外直接写裸 SQL，复杂查询统一封装在 Repository
- 单表超过 300 万行时评估分区或归档策略
- Migration 文件必须可回滚（实现 `down()` 方法）
- 不允许在生产环境直接执行 DDL，必须通过 Migration

---

## 7. 基础设施

### 7.1 部署架构

```
生产环境
├── Nginx 1.24
│   ├── 托管前端静态资源（/dist）
│   └── /api/* 反向代理到 PHP-FPM（127.0.0.1:9000）
├── PHP 8.2 + PHP-FPM
│   └── Laravel 10 应用
├── Supervisor
│   └── Laravel Queue Worker × 2（Redis 队列）
├── MySQL 8.0
│   └── 主从复制（1 主 1 从，读写分离可选）
├── Redis 7.x
│   └── 单节点（首期），后续视需要升级为哨兵
└── 文件存储
    └── 开发/测试：本地磁盘；生产：对象存储（OSS/S3）
```

### 7.2 Nginx 配置要点

```nginx
server {
    listen 443 ssl;
    server_name cms.example.com;

    # 前端静态资源
    root /var/www/easycms/frontend/dist;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/easycms/backend/public/index.php;
    }

    # 禁止访问 .env 等敏感文件
    location ~ /\. { deny all; }
}
```

### 7.3 环境规划

| 环境 | 用途 | 说明 |
|------|------|------|
| local | 本地开发 | Docker Compose 统一环境，`.env.local` 配置 |
| staging | 测试验收 | 与生产配置结构一致，数据独立 |
| production | 线上生产 | 高可用，数据与 staging 严格隔离 |

### 7.4 Docker Compose（开发环境）

```yaml
services:
  app:
    build: ./backend
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - mysql
      - redis

  nginx:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/var/www/html/public/dist

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: easycms
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

---

## 8. 安全架构

### 8.1 安全措施清单

| 层级 | 措施 |
|------|------|
| 传输层 | 全站 HTTPS，TLS 1.2+，HTTP 强制跳转 HTTPS |
| 认证层 | Sanctum Token，8 小时过期，登录失败 5 次锁定 |
| 权限层 | RBAC，后端每次请求实时校验，前端仅做展示控制 |
| 应用层 | Laravel FormRequest 参数校验，防 SQL 注入（Eloquent ORM），XSS 过滤 |
| 数据层 | 密码 bcrypt 加密，敏感配置走环境变量，禁止明文存储 |
| 接口层 | 登录接口限流（IP 维度，15 分钟内最多 20 次），防暴力破解 |

### 8.2 敏感数据处理

- 密码：`Hash::make()`（bcrypt）加密存储，禁止明文，禁止日志打印
- Token：存储在 `personal_access_tokens` 表，哈希存储，禁止明文记录
- 审计日志 `before_value` / `after_value`：密码字段自动脱敏，不记录原始值
- `.env` 文件：不提交版本库，通过运维平台注入环境变量

### 8.3 CORS 配置

```php
// config/cors.php
'allowed_origins' => [env('FRONTEND_URL', 'https://cms.example.com')],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['Content-Type', 'Authorization', 'X-Request-ID'],
```

---

## 9. 可观测性

### 9.1 日志规范

- 框架日志：Laravel Log（Monolog），JSON 格式输出
- 日志级别：ERROR / WARNING / INFO / DEBUG
- 必须包含字段：timestamp、level、service、request_id、user_id、message

```json
{
  "timestamp": "2026-03-23T10:00:00Z",
  "level": "ERROR",
  "service": "easycms-api",
  "request_id": "req_abc123",
  "user_id": "u_001",
  "message": "用户登录失败",
  "context": { "username": "zhangsan", "reason": "密码错误" }
}
```

- 禁止在日志中打印密码、token 等敏感字段
- 生产环境日志级别不低于 WARNING，staging 可开启 DEBUG

### 9.2 请求追踪

每个请求生成唯一 `X-Request-ID`，在以下位置透传：

- Nginx access log
- Laravel 日志（注入到 Log context）
- 审计日志 `request_id` 字段
- 接口响应 Header `X-Request-ID`

```php
// Middleware/RequestId.php
public function handle(Request $request, Closure $next): Response
{
    $requestId = $request->header('X-Request-ID', Str::uuid()->toString());
    $request->headers->set('X-Request-ID', $requestId);
    Log::withContext(['request_id' => $requestId]);

    $response = $next($request);
    $response->headers->set('X-Request-ID', $requestId);
    return $response;
}
```

### 9.3 监控指标

| 指标类型 | 指标 | 告警阈值 |
|---------|------|---------|
| 系统 | CPU 使用率 | > 80% |
| 系统 | 内存使用率 | > 85% |
| 应用 | 接口错误率（5xx） | > 1% |
| 应用 | P99 响应时间 | > 1s |
| 数据库 | 慢查询（> 500ms） | 出现即告警 |
| 队列 | Worker 积压任务数 | > 100 |

---

## 10. 代码风格与编写规范

### 10.1 通用原则

- **可读性优先**：命名即文档，避免缩写和魔法值
- **单一职责**：每个函数/类只做一件事
- **DRY**：重复逻辑抽成工具函数、Trait 或 Hook
- **显式优于隐式**：避免隐式类型转换、隐式依赖、隐式副作用

### 10.2 命名规范

| 场景 | 规范 | 示例 |
|------|------|------|
| 前端变量 / 函数 | camelCase | `getUserInfo`, `isLoading` |
| 前端组件 / 类型 | PascalCase | `UserTable`, `ApiResponse<T>` |
| 前端常量 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| 前端文件（组件） | PascalCase | `UserTable.tsx` |
| 前端文件（工具/API） | kebab-case | `user.ts`, `date-utils.ts` |
| 后端类 | PascalCase | `UserService`, `CreateUserRequest` |
| 后端方法 | camelCase | `createUser()`, `findByUsername()` |
| 后端路由 | kebab-case | `/admin/audit-logs` |
| 数据库表 / 字段 | snake_case | `audit_logs`, `created_at` |
| 权限标识 | 冒号分隔字符串 | `admin:users:create` |
| 环境变量 | UPPER_SNAKE_CASE | `DB_HOST`, `REDIS_PORT` |

### 10.3 前端规范（React + TypeScript）

**组件规范**

```tsx
// ✅ 函数组件 + 显式 Props 类型
interface UserTableProps {
  orgId?: string;
  onEdit: (id: string) => void;
}

export function UserTable({ orgId, onEdit }: UserTableProps) {
  const { data, isLoading } = useUsers({ orgId });
  const { hasPermission } = usePermission();

  if (isLoading) return <TableSkeleton />;

  return (
    <Table>
      {data?.list.map(user => (
        <TableRow key={user.id}>
          <TableCell>{user.name}</TableCell>
          <TableCell>
            {hasPermission('admin:users:edit') && (
              <Button onClick={() => onEdit(user.id)}>编辑</Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

- 组件只负责渲染，业务逻辑下沉到自定义 Hook
- Props 超过 4 个必须用接口定义，不用位置参数
- 禁止在 JSX 中写内联复杂逻辑

**API 层规范**

```ts
// api/users.ts
import { request } from './request';
import type { User, CreateUserDto, PaginatedResponse } from '@/types';

export const usersApi = {
  list: (params: UserListParams) =>
    request.get<PaginatedResponse<User>>('/admin/users', { params }),
  create: (data: CreateUserDto) =>
    request.post<User>('/admin/users', data),
  update: (id: string, data: Partial<CreateUserDto>) =>
    request.put<User>(`/admin/users/${id}`, data),
  resetPassword: (id: string, data: ResetPasswordDto) =>
    request.post(`/admin/users/${id}/reset-password`, data),
};
```

### 10.4 后端规范（Laravel + PHP）

**Controller 规范**

Controller 只做三件事：接收 → 调 Service → 用 Resource 格式化响应。

```php
class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly UserService $userService) {}

    public function index(UserListRequest $request): JsonResponse
    {
        $users = $this->userService->paginate($request->validated());
        return $this->success(UserCollection::make($users));
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());
        return $this->success(UserResource::make($user), '用户创建成功', 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->deactivate($id);
        return $this->success(null, '用户已停用');
    }
}
```

**FormRequest 规范**

`rules()` 做参数格式校验，`authorize()` 做权限预校验，两者都不写业务逻辑。

```php
class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 权限预校验，通过 spatie/laravel-permission
        return $this->user()->can('admin:users:create');
    }

    public function rules(): array
    {
        return [
            'username'   => ['required', 'string', 'max:64', 'unique:users'],
            'name'       => ['required', 'string', 'max:64'],
            'user_type'  => ['required', 'in:1,2'],
            'org_id'     => ['required', 'string'],
            'role_ids'   => ['required', 'array', 'min:1'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
            'password'   => ['required', 'string', 'min:8', new StrongPassword()],
            'project_ids'   => ['nullable', 'array'],
            'project_ids.*' => ['string'],
            'remark'     => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

**API Resource 规范**

只做字段映射和格式转换，不触发额外数据库查询（用 `whenLoaded` 处理关联）。

```php
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'username'         => $this->username,
            'name'             => $this->name,
            'user_type'        => $this->user_type,
            'user_type_label'  => $this->user_type === 1 ? '内部员工' : '企业客户',
            'org_id'           => $this->org_id,
            'status'           => $this->status,
            'status_label'     => User::STATUS_LABELS[$this->status] ?? '',
            'roles'            => RoleResource::collection($this->whenLoaded('roles')),
            'project_ids'      => $this->whenLoaded('projects',
                                    fn() => $this->projects->pluck('project_id')),
            'last_login_at'    => $this->last_login_at?->toISOString(),
            'created_at'       => $this->created_at->toISOString(),
        ];
    }
}
```

**Service 规范**

Service 是编排层，组合 Action，控制事务边界，不直接写 Eloquent 查询。

```php
class UserService
{
    public function __construct(
        private readonly CreateUserAction      $createUser,
        private readonly DeactivateUserAction  $deactivateUser,
        private readonly ResetPasswordAction   $resetPassword,
        private readonly UserRepositoryInterface $userRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        // 简单查询直接调 Repository
        return $this->userRepo->paginate($filters);
    }

    public function create(array $data): User
    {
        // 复杂动作交给 Action
        return $this->createUser->execute($data);
    }

    public function deactivate(int $id): void
    {
        $user = $this->userRepo->findOrFail($id);
        $this->deactivateUser->execute($user);
    }
}
```

**Action 规范**

每个 Action 只做一件事，包含完整的事务 + 事件触发，可被多处复用。

```php
// Actions/User/CreateUserAction.php
class CreateUserAction
{
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'username'            => $data['username'],
                'name'                => $data['name'],
                'password'            => Hash::make($data['password']),
                'user_type'           => $data['user_type'],
                'org_id'              => $data['org_id'],
                'status'              => User::STATUS_ACTIVE,
                'must_change_password'=> true,
            ]);

            if (!empty($data['role_ids'])) {
                $user->syncRoles($data['role_ids']);
            }

            if (!empty($data['project_ids'])) {
                $user->projects()->createMany(
                    collect($data['project_ids'])
                        ->map(fn($id) => ['project_id' => $id])
                        ->all()
                );
            }

            // 触发事件，由 Listener 负责写审计日志
            // 后期加通知只需新增 Listener，不改这里
            event(new UserCreated($user));

            return $user->load('roles');
        });
    }
}

// Actions/User/DeactivateUserAction.php
class DeactivateUserAction
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepo
    ) {}

    public function execute(User $user): void
    {
        // 业务规则校验：不可停用最后一个管理员
        if ($user->hasRole('system_admin')) {
            $activeAdminCount = $this->userRepo->countActiveAdmins();
            if ($activeAdminCount <= 1) {
                throw new BusinessException('不可停用最后一个系统管理员');
            }
        }

        DB::transaction(function () use ($user) {
            $user->update(['status' => User::STATUS_INACTIVE]);
            // 立即吊销该用户所有 Token
            $user->tokens()->delete();
            event(new UserDeactivated($user));
        });
    }
}
```

**Repository 规范**

Service 和 Action 依赖 Interface，不直接依赖 Eloquent 实现类。

```php
// Repositories/Contracts/UserRepositoryInterface.php
interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findOrFail(int $id): User;
    public function findByUsername(string $username): ?User;
    public function paginate(array $filters, int $perPage = 20): LengthAwarePaginator;
    public function countActiveAdmins(): int;
    public function create(array $data): User;
    public function update(User $user, array $data): User;
}

// Repositories/Eloquent/UserRepository.php
class UserRepository implements UserRepositoryInterface
{
    public function paginate(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        return User::query()
            ->when($filters['keyword'] ?? null, fn($q, $v) =>
                $q->where(fn($q) =>
                    $q->where('name', 'like', "%$v%")
                      ->orWhere('username', 'like', "%$v%")
                ))
            ->when($filters['status'] ?? null,    fn($q, $v) => $q->where('status', $v))
            ->when($filters['user_type'] ?? null,  fn($q, $v) => $q->where('user_type', $v))
            ->when($filters['org_id'] ?? null,     fn($q, $v) => $q->where('org_id', $v))
            ->when($filters['role_id'] ?? null,    fn($q, $v) =>
                $q->whereHas('roles', fn($q) => $q->where('id', $v)))
            ->with('roles')
            ->latest()
            ->paginate($perPage);
    }

    public function countActiveAdmins(): int
    {
        return User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->whereHas('roles', fn($q) => $q->where('name', 'system_admin'))
            ->count();
    }
}

// Providers/RepositoryServiceProvider.php
class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // 绑定 Interface → 实现，单测时可整体替换为 mock
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(AuditLogRepositoryInterface::class, AuditLogRepository::class);
    }
}
```

**Event / Listener 规范**

业务代码只触发事件，副作用（审计日志、通知、缓存清理）全部在 Listener 里处理。

```php
// Listeners/WriteAuditLog.php
// 统一监听所有业务事件，根据事件类型写入对应日志
class WriteAuditLog
{
    public function handle(object $event): void
    {
        $log = match (true) {
            $event instanceof UserCreated => [
                'log_type'    => 'user_permission',
                'action'      => 'create',
                'object_type' => 'user',
                'object_id'   => $event->user->id,
                'object_name' => $event->user->name,
                'before'      => null,
                'after'       => $event->user->toAuditArray(),
            ],
            $event instanceof UserDeactivated => [
                'log_type'    => 'user_permission',
                'action'      => 'deactivate',
                'object_type' => 'user',
                'object_id'   => $event->user->id,
                'object_name' => $event->user->name,
                'before'      => ['status' => User::STATUS_ACTIVE],
                'after'       => ['status' => User::STATUS_INACTIVE],
            ],
            // 后续新增事件类型，只在这里加 case，不动业务代码
            default => null,
        };

        if ($log) {
            AuditLog::create([
                ...$log,
                'operator_id'   => auth()->id(),
                'operator_name' => auth()->user()?->name,
                'request_id'    => request()->header('X-Request-ID'),
                'result'        => 1,
            ]);
        }
    }
}
```

**异常处理规范**

```php
// 全局 Handler.php 统一格式化，Controller 不写 try/catch
// BusinessException：业务规则拦截（如停用最后一个管理员）
throw new BusinessException('不可停用最后一个系统管理员');
// → code 1005, HTTP 422

// 资源不存在：用 findOrFail()，自动触发 ModelNotFoundException
// → code 1004, HTTP 404

// 参数校验失败：FormRequest 自动处理
// → code 1001, HTTP 422

// 禁止：空 catch 块吞掉异常
try {
    $this->doSomething();
} catch (\Exception $e) {
    // ❌ 绝对禁止
}
```

### 10.5 TypeScript 规范（前端通用）

- **禁止 `any`**：用 `unknown` + 类型收窄，或明确声明类型
- **禁止非空断言 `!`**：用可选链 `?.` 或显式判断
- **接口响应类型必须声明**，禁止裸 `axios.get()` 不带泛型
- **枚举替代魔法字符串**：

```ts
// ✅
export const UserStatus = {
  Active: 1,
  Inactive: 2,
  Locked: 3,
  Pending: 4,
} as const;

export const UserType = {
  Internal: 1,
  External: 2,
} as const;
```

### 10.6 Git 提交规范

遵循 Conventional Commits：

```
<type>(<scope>): <subject>

type: feat | fix | refactor | perf | style | test | docs | chore
```

示例：

```
feat(user): 新增用户管理列表页及筛选功能
fix(auth): 修复首次登录强制改密后 token 未刷新的问题
refactor(permission): 将权限校验逻辑提取为 CheckPermission 中间件
docs(audit-log): 更新审计日志写入规范文档
```

- 每个 commit 只做一件事
- 主干分支（main）禁止直接 push，必须通过 PR + 至少 1 人 Code Review
- 分支命名：`feat/user-management`、`fix/login-lock`、`chore/upgrade-sanctum`

### 10.7 Code Review 检查清单

- [ ] 命名是否语义清晰，无缩写歧义
- [ ] Controller 是否混入了业务逻辑
- [ ] Service 是否直接写了 SQL 或 HTTP 相关代码
- [ ] 是否有未处理的异常或边界情况
- [ ] 新增接口是否有 FormRequest 校验
- [ ] 权限相关变更是否同步更新了审计日志记录
- [ ] 是否有硬编码的配置值（应移入 `.env` 或常量）
- [ ] 是否引入了不必要的依赖

---

## 11. 附录

### 11.1 相关文档

- 产品需求文档（PRD v1.1）：[链接]
- 后台管理 PRD 补充 V1.1：[链接]
- API 接口文档（Swagger）：[链接]
- 审计日志写入规范：[链接]
- 数据库 ER 图：[链接]
- 运维部署手册：[链接]

### 11.2 修订记录

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|---------|
| v1.0 | 2026-03-23 | [姓名] | 初始版本，覆盖第一阶段技术架构（登录、用户管理、角色管理、权限配置、审计日志） |
| v1.1 | 2026-03-23 | [姓名] | 后端架构升级：引入 Action 层、API Resource 层、Repository Interface/Eloquent 分离、Event/Listener 解耦审计日志；补充各层职责边界、Action 拆分原则和完整代码规范 |
| v1.2 | 2026-03-26 | [姓名] | 新增媒体管理后台模块：§5.8 接口与安全约定、§6.2 `media_items` 表；权限 `admin:media:*`；前后端 CRUD 与菜单种子同步说明 |
