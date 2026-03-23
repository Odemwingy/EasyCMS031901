# 后端进度 — 阶段一

> **维护方**：后端开发者 / 负责后端的 AI
> **更新规则**：每次后端有实质进展或阻塞时更新本文件；阶段完成时通知整合方更新 `CURRENT_PROGRESS.md` 的状态列。
> 本阶段完整任务定义见 [`OVERVIEW.md`](./OVERVIEW.md)。

---

## 本阶段任务

| 状态 | 项 |
|------|----|
| 已完成 | 后端项目脚手架初始化（`app/backend/`，Laravel 10） |
| 已完成 | 基于 Podman 的本地开发环境初始化（PHP-FPM、Nginx、MySQL、Redis） |
| 待完成 | 数据库 Schema：User、Role、Permission、Menu、AuditLog |
| 待完成 | Sanctum Bearer Token 鉴权（登录签发 Token、请求校验 Token） |
| 待完成 | 认证 API：`POST /api/v1/auth/login`、`POST /api/v1/auth/logout`、`POST /api/v1/auth/change-password`、`GET /api/v1/auth/me`、`GET /api/v1/auth/menus` |
| 待完成 | 用户管理 CRUD API：`/api/v1/admin/users` |
| 待完成 | 角色管理 CRUD / 复制 / 状态切换 API：`/api/v1/admin/roles` |
| 待完成 | 菜单管理 API：`/api/v1/admin/menus` 与菜单树接口 |
| 待完成 | 权限配置 API：`PUT /api/v1/admin/roles/{id}/permissions` |
| 待完成 | 审计日志列表与详情 API：`/api/v1/admin/audit-logs` |
| 待完成 | 接口级权限拦截与只读角色策略 |
| 存在问题 | 当前 `podman compose` 通过外部 `docker-compose.exe` 兼容层运行；本地开发可用，但后续若要长期维护，建议补一份明确的 Podman 使用说明 |

## 本次更新

- 2026-03-23：在 `app/backend/` 初始化 Laravel 10 工程。
- 2026-03-23：新增 `docker-compose.yml`、Nginx 配置、本地 PHP 配置，并切换为 Podman 本地镜像运行。
- 2026-03-23：确认本地服务端口为 `7050(MySQL)`、`7051(Nginx/API)`、`7052(Redis)`。
- 2026-03-23：修复 Windows 挂载目录权限问题，改用 named volume 托管 `storage/` 与 `bootstrap/cache/`，Laravel 首页可正常返回 `200`。

---

*更新时请注明日期，例如：YYYY-MM-DD 完成 User Schema 定义。*
