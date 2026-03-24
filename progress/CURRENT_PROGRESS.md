# 当前进度总览（主控）

> 本目录仅保留本文件与 `PHASES.md`。  
> 角色进度（前端/后端/UI/测试）统一写在本文件，便于快速阅读。

---

## 速览

- **当前阶段**：阶段一（Day 1–5）
- **阶段目标**：完成认证、布局、权限框架与后台管理一期基础联调
- **开发限制**：仅允许开发阶段一及之前内容

---

## 总状态看板

| 领域 | 状态 | 一句话进展 |
|------|------|------------|
| 前端 | 🟡 进行中 | 页面已成型，核心接口联调推进中 |
| 后端 | 🟡 进行中 | Laravel 与本地环境已完成，业务 API 开发中 |
| UI 设计 | 🟡 进行中 | 后台管理设计稿已交付，登录/会话提示待补 |
| 测试 | ⚪ 未开始 | 依赖前后端联调完成后启动 |

状态说明：🟢 已完成 · 🟡 进行中 · 🔴 阻塞 · ⚪ 未开始

---

## 当前阻塞（按优先级）

1. 后端业务 API 尚未完整落地，前端仍有页面依赖原型/假数据。
2. 通知配置、系统参数页面是原型页，不在阶段一正式交付范围，容易误联调。
3. 登录、鉴权、菜单权限、审计日志接口虽有文档基线，后端模块仍需补齐实现。

---

## 下一步（建议顺序）

1. 后端优先完成阶段一核心 API：`auth`、`users`、`roles`、`menus`、`audit-logs`。
2. 前端继续去 mock，按接口完成登录态、权限行为、详情页联调。
3. 测试开始编写并执行阶段一 E2E 与接口回归用例。

---

## 角色进度明细（阶段一）

> 状态颜色说明：<span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> · <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span>

### 前端

| 状态 | 项 |
|------|----|
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | Vite + React 18 + TypeScript 脚手架初始化（`app/frontend/`） |
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | TailwindCSS 4 + shadcn/ui 组件库接入 |
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | React Router 7 路由配置 |
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | AdminLayout 与后台管理核心页面原型（用户/角色/权限/审计） |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 登录 / 登出 / 路由守卫与登录态完善 |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 对接 `/api/v1/auth/*`、`/api/v1/admin/users`、`/api/v1/admin/roles`、`/api/v1/admin/menus/tree`、`/api/v1/admin/audit-logs` |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 基于 `auth/menus` 完成菜单与按钮权限控制 |

### 后端

| 状态 | 项 |
|------|----|
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | 后端脚手架初始化（`app/backend/`，Laravel 10） |
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | Podman 本地环境初始化（PHP-FPM、Nginx、MySQL、Redis） |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 数据库 Schema：User、Role、Permission、Menu、AuditLog |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | Sanctum Bearer Token 鉴权链路 |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 认证 API：`/api/v1/auth/login`、`/api/v1/auth/logout`、`/api/v1/auth/change-password`、`/api/v1/auth/me`、`/api/v1/auth/menus` |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 用户/角色/菜单/审计日志 API 与权限拦截 |

### UI 设计

| 状态 | 项 |
|------|----|
| <span style="background-color:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:4px;">已完成</span> | 后台管理模块设计稿（布局、用户、角色、权限、审计、通知、系统参数） |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 登录页设计稿 |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 登出/会话过期提示设计稿 |

### 测试

| 状态 | 项 |
|------|----|
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 登录/登出流程 E2E |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | Bearer Token 鉴权与权限拦截测试 |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 用户 / 角色 / 菜单 / 审计日志接口测试 |
| <span style="background-color:#fffbe6; color:#d48806; padding:2px 8px; border-radius:4px;">待完成</span> | 前端路由守卫与按钮级权限显隐测试 |

---

## 阶段切换记录

| 阶段 | 日期 | 备注 |
|------|------|------|
| 阶段一 | 2026-03-20 | 初始化 |
| 阶段一 | 2026-03-23 | 同步阶段一需求、接口与技术架构文档，明确后台管理一期范围 |
| 阶段一 | 2026-03-23 | 完成 `app/backend/` Laravel 脚手架与 Podman 本地环境初始化 |
