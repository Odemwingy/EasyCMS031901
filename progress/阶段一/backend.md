# 后端进度 — 阶段一

> **维护方**：后端开发者 / 负责后端的 AI
> **更新规则**：每次后端有实质进展或阻塞时更新本文件；阶段完成时通知整合方更新 `CURRENT_PROGRESS.md` 的状态列。
> 本阶段完整任务定义见 [`OVERVIEW.md`](./OVERVIEW.md)。

---

## 本阶段任务

| 状态 | 项 |
|------|----|
| 已完成 | |
| 待完成 | 后端项目脚手架初始化（`app/backend/`） |
| 待完成 | 数据库 Schema：User（用户）、Role（角色）、Permission（权限） |
| 待完成 | JWT 鉴权中间件（登录签发 Token、请求校验 Token） |
| 待完成 | 登录 / 登出 API（`POST /api/auth/login`、`POST /api/auth/logout`） |
| 待完成 | 用户管理 CRUD API（`/api/users`） |
| 待完成 | 角色管理 CRUD API（`/api/roles`） |
| 待完成 | 权限配置 API（`/api/roles/:id/permissions`） |
| 待完成 | 只读角色标识与基础权限拦截（接口级鉴权中间件） |
| 存在问题 | |

---

*更新时请注明日期，例如：YYYY-MM-DD 完成 User Schema 定义。*
