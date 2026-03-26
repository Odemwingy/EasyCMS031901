# UI 设计稿 vs 应用前端差异说明

**对照目录**：`ui/Content Management Platform/`（设计稿 / Figma 导出原型）  
**实现目录**：`app/frontend/`（EasyCMS 可运行前端）  
**文档生成目的**：记录信息架构、页面、路由与能力差异，便于按阶段还原与验收。

---

## 1. 总体结论

| 维度 | 设计稿 (`ui/…`) | 应用前端 (`app/frontend`) |
|------|-----------------|---------------------------|
| 定位 | 全站 IA 原型，大量 **Placeholder** 与 **本地假登录** | **阶段一后台**：真实 **Bearer 鉴权**、菜单权限、与 Laravel API 联调 |
| 路由风格 | `/workbench/...`、`/content/...`、`/backend/user` 等两级路径 | **扁平后台路径**：`/users`、`/roles`、`/permissions`、`/menus` 等 |
| 登录后默认页 | 跳转 `/workbench/my-todo` | 跳转 `/`（用户管理） |
| 壳布局 | `DashboardLayout` 内嵌于 `routes.tsx`，顶栏含 **退出 / 用户菜单** 等（以设计稿为准） | 独立 `AdminLayout.tsx`，已与设计稿 **TopBar + 深栏主导航 + 侧栏 + 面包屑** 对齐；仅 **后台** 一级可进入 |
| 鉴权 | 无后端，`localStorage` 模拟 | `requireAuth` loader、`hasRouteAccess`、403/404 行为已落地 |

---

## 2. 路由与信息架构差异

### 2.1 设计稿侧（节选）

- **登录**：`/login`（无 `loader` 重定向逻辑）。
- **根路径**：`/` → `Navigate` 至 `/workbench/my-todo`。
- **一级模块**：`workbench`、`content`、`classification`、`cycle`、`config`、`report`、`backend`、`help`（URL 第一段）。
- **后台子路径**：`/backend/user`、`/backend/role`、`/backend/audit`；其余后台子项多为 **占位**（如权限配置合并在角色卡片流程、无独立 `/backend/permission` 路由）。
- **通配**：`:primary/:secondary` → 占位页。

### 2.2 应用前端侧（当前）

- **登录**：`/login`，已登录会 `redirect` 到 `/`。
- **业务根**：`/` 使用 `AdminLayout`，**无** `/workbench`、`/content` 等段路径。
- **子路由（节选）**：
  - `/`、`/users`、`/users/:id`
  - `/roles`、`/roles/:id`
  - `/permissions`（权限配置独立页，支持 `?roleId=`）
  - `/menus`、`/audit-log`、`/notifications`、`/system-params`
  - `/403`、`/*` → NotFound（未注册路径不鉴菜单）

### 2.3 路径映射参考（设计 → 实现）

若需口头或文档对齐，可参考：

| 设计稿意图 | 应用当前路径 |
|-----------|--------------|
| `/backend/user` | `/users` |
| `/backend/role` | `/roles` |
| 角色上「权限配置」 | `/permissions?roleId={id}` |
| `/backend/audit` | `/audit-log` |
| 通知中心 | `/notifications` |
| 系统参数 | `/system-params` |
| 菜单管理（PRD 有，设计 SECONDARY 列表未列 `menus`） | `/menus` |

---

## 3. 页面级差异

### 3.1 仅设计稿中存在（应用未实现或仅为占位）

| 模块 | 设计稿页面 / 行为 | 应用前端 |
|------|-------------------|----------|
| 工作台 | `WorkbenchView`，多区块看板等 | 主导航「工作台」为 **未开放** |
| 内容中心 | `ContentCenterView`（多类型 Tab/列表） | 未实现 |
| 分类与质量 | `CategoryTreeLayout` 等 | 未实现 |
| 周期与发布 | 占位 | 未实现 |
| 配置中心 | 占位 | 未实现 |
| 报表中心 | 占位 | 未实现 |
| 帮助 | 占位 | 未实现 |
| 登录 | 曾含「演示任意账号」类文案 | 已改为 **真实 API**，SSO/LDAP 为 toast 提示未接入 |

### 3.2 两边都有但实现形态不同

| 页面 | 设计稿 | 应用前端 |
|------|--------|----------|
| 登录 | 双栏品牌 + 表单，模拟登录 | **视觉已对齐**双栏；**逻辑**为 `login()` + 跳转 `/`；记住用户名、忘记密码提示等已产品化 |
| 用户管理 | `UserManagementView`，表格+筛选为静态 | **同风格 UI** + `getUsers` 分页、筛选、新建用户、批量停用等 |
| 角色管理 | `RoleManagementView` 卡片栅格 + 内嵌权限视图切换 | **卡片栅格** + 真实接口；权限为 **独立路由** `/permissions` |
| 权限配置 | `PermissionConfigView` 嵌入角色页或独立矩阵 demo | **左侧模块 + 右侧矩阵** 对齐视觉；数据来自 `auth/menus` + `roles/:id/permissions` |
| 审计日志 | `AuditLogView` 表格 + 抽屉详情（静态） | `AuditLog.tsx` 以接口为准，UI 可能与设计稿仍有细节差 |

### 3.3 仅应用中存在

| 页面 | 说明 |
|------|------|
| `UserDetail` / `RoleDetail` | 详情页，设计稿大列表原型未单独拆页 |
| `MenuManagement` | 菜单树管理 |
| `NotificationConfig` / `SystemParams` | 阶段一原型页，可能仍为占位或部分联调 |
| `NoPermission` / `NotFound` | 403 / 404，设计稿 IA 未强调 |

---

## 4. 组件与静态资源差异

| 项 | 设计稿 | 应用 |
|----|--------|------|
| `FilterSelect` | 内联于 `BackendManagement.tsx` 等 | 抽离 `components/admin/FilterSelect.tsx` |
| `ImageWithFallback` | `components/figma/ImageWithFallback.tsx` | **无**（内容中心未接入时可后续拷贝） |
| `PRIMARY_NAV` / `SECONDARY_NAV` | 在 `routes.tsx` 导出常量 | 主导航在 `AdminLayout`；侧栏 **后台** 与 `permission` 白名单对齐 |
| 主题入口 | `styles/index.css`（fonts + tailwind + theme） | 结构相同；另存在根级 `theme.css` / `tailwind.css` 引用以 Vite 入口为准 |

---

## 5. 数据与行为差异

| 项 | 设计稿 | 应用 |
|----|--------|------|
| HTTP | 无 | `lib/http.ts`、`api/auth.ts`、`api/admin.ts` |
| Token | 无或本地 flag | `lib/auth.ts`（localStorage） |
| 菜单权限 | 无 | `lib/permission.ts`、`setAccessFromMenus` |
| 退出登录 | TopBar 内示意 | 顶栏下拉 **退出**，并调 `logout` API |
| 组织/周期切换 | TopBar 下拉（静态） | **禁用 + title 说明**，待对接 |

---

## 6. 依赖差异（摘要）

设计稿 `package.json` 包含较多 **未在应用中使用** 的依赖（如 MUI、`recharts`、`react-hook-form`、`motion` 等）；应用侧 **精简为** shadcn/radix 子集 + `lucide-react` + `react-router` + `sonner` 等。  
**不必**为「对齐设计稿」一次性补齐全部设计稿依赖，可按页面按需增加。

---

## 7. 建议的后续对齐顺序（供排期）

1. **路由策略（可选大改）**：是否将后台改为 `/backend/*` 并与设计 URL 完全一致（需后端书签、文档、权限路径同步）。  
2. **阶段二+模块**：工作台、内容中心等按 `PRIMARY_NAV` 逐个替换占位为真实路由与页面。  
3. **审计日志 / 通知 / 系统参数**：与 `AuditLogView` 等设计稿逐屏 diff 像素与交互。  
4. **设计稿特有依赖**：如图表、动效，在对应页面引入后再比对 `package.json`。

---

*本文档由仓库对照生成，若任一侧目录有重大变更，请更新本文件或改为链接到 `progress/` 中的正式规格。*
