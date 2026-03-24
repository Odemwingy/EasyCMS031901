# GitHub Issues 使用指南（AI / Skill）

> **本仓库 Issue 以 GitHub Issues 为唯一事实来源**（列表、详情、状态、新建均在 GitHub 上操作）。  
> 本文件供 AI 按步骤调用 **GitHub CLI (`gh`)** 或 **REST API**，不将令牌写入仓库正文。  
> 若与 `rule.md` 中「本地 `issue/` 下放 Word」的旧描述冲突，**以本文件为准**。

---

## 1. 前置条件

| 项 | 说明 |
|----|------|
| 仓库 | 在 GitHub 上；本地需能 `git push` / 有网络访问 `api.github.com`。 |
| 身份 | 使用 **GitHub CLI 登录** 或 **Personal Access Token (PAT)**。 |
| 机密 | Token、组织专用密钥等只放在本机 **`config/`**（如 `config/github.local.env`），**禁止**提交进 Git。 |
| 解析 `owner/repo` | 优先读环境变量 `GITHUB_REPOSITORY`（格式 `owner/repo`）；否则执行：`gh repo view --json nameWithOwner -q .nameWithOwner`；再否则从 `git remote get-url origin` 解析。 |

**PAT 权限（REST API）**：至少需要 `repo`（私有库）或 `public_repo`（仅公开库）；若用 Projects 看板再另加 `read:project` 等。

**CLI 登录（人类一次性完成）**：

```bash
gh auth login
```

**AI 在终端调用 `gh` 时**：若未登录，应提示人类执行 `gh auth login`，不要猜测 Token。

---

## 2. 获取 Issue 列表

### 2.1 GitHub CLI（推荐）

```bash
# 默认当前仓库，仅 Open
gh issue list --limit 50

# JSON 便于程序解析（number, title, state, labels, author 等）
gh issue list --state open --limit 100 --json number,title,state,labels,author,createdAt,url

# 按标签筛选
gh issue list --label "bug" --json number,title,state,url

# 指定仓库
gh issue list --repo OWNER/REPO --limit 30
```

### 2.2 REST API

```http
GET https://api.github.com/repos/OWNER/REPO/issues?state=open&per_page=30&page=1
Authorization: Bearer <TOKEN>
Accept: application/vnd.github+json
```

注意：此接口返回的含 **Pull Request**，若只要 Issue 需过滤 `pull_request` 字段为空的对象。

**curl 示例**：

```bash
curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/OWNER/REPO/issues?state=open&per_page=30"
```

---

## 3. 读取 Issue 详情

### 3.1 GitHub CLI

```bash
# 人类可读
gh issue view 42

# 机器可读 JSON
gh issue view 42 --json number,title,body,state,labels,author,assignees,createdAt,updatedAt,closedAt,url,comments

# 指定仓库
gh issue view 42 --repo OWNER/REPO
```

### 3.2 REST API

```http
GET https://api.github.com/repos/OWNER/REPO/issues/ISSUE_NUMBER
Authorization: Bearer <TOKEN>
Accept: application/vnd.github+json
```

---

## 4. 修改状态（与 GitHub 语义对齐）

GitHub 原生状态主要是 **`open` / `closed`**；「未解决 / 已解决 / 待定」建议用 **Label** 表达，避免与 `closed` 混淆（例如先标 `已解决` 再关 Issue，或仅用 label 表示业务状态）。

### 4.1 关闭 / 重新打开 Issue

```bash
gh issue close 42 --repo OWNER/REPO
gh issue close 42 --comment "已在 v1.2 修复"

gh issue reopen 42 --repo OWNER/REPO
```

**REST API**：

```http
PATCH https://api.github.com/repos/OWNER/REPO/issues/ISSUE_NUMBER
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"state": "closed"}
```

或 `"state": "open"` 重新打开。

### 4.2 用标签表示业务状态（推荐与团队约定标签名）

```bash
# 增加 / 移除标签（标签须已在仓库中存在，否则先在 GitHub 网页或使用 gh label create 创建）
gh issue edit 42 --repo OWNER/REPO --add-label "status:已解决" --remove-label "status:未解决"
```

**REST API**（替换整组 labels 时用 `labels` 数组；或单独用 Labels API 增删）。

---

## 5. 新建 Issue

### 5.1 GitHub CLI（交互少时用参数）

```bash
gh issue create --repo OWNER/REPO \
  --title "简要标题" \
  --body "## 描述\n\n复现步骤…\n\n## 验收标准\n- [ ] …" \
  --label "bug,backend"
```

多标签用逗号分隔；`--assignee @me` 可指派。

### 5.2 REST API

```http
POST https://api.github.com/repos/OWNER/REPO/issues
Authorization: Bearer <TOKEN>
Content-Type: application/json
Accept: application/vnd.github+json

{
  "title": "简要标题",
  "body": "Markdown 正文",
  "labels": ["bug", "frontend"]
}
```

---

## 6. AI 执行检查清单（开发结束后）

1. 用 **§2** 拉取 `open` 的 Issue 列表（或带 `status:未解决` 等团队约定标签）。
2. 对需跟进的条目用 **§3** 读详情。
3. 修复完成后：按团队规范 **§4** 更新标签并/或 `close`；需要继续跟踪则只改标签、保持 `open`。
4. 新缺陷/任务用 **§5** 创建，并在 `progress/` 或 PR 描述中引用 Issue 编号（如 `#42`）。

---

## 7. 可选：GitHub Projects（看板列 = 状态）

若团队使用 **Projects v2**，列拖动对应的是 **Project item 的 field**，不是 Issue 的 `state`，需通过 **GraphQL API**（`updateProjectV2ItemFieldValue`）修改；实现前应先向人类确认 **project id、field id、option id**。本文件不展开，避免写死错误 ID。

---

## 8. 故障排查

| 现象 | 处理 |
|------|------|
| `401` / `Bad credentials` | 检查 Token 是否过期、`gh auth status` 是否已登录。 |
| `403` | 权限不足或仓库对 Token 不可见。 |
| `404` | `OWNER/REPO` 错误或私有库无权限。 |
| `gh: command not found` | 安装 GitHub CLI 或改用纯 curl + PAT。 |

---

*维护本文件时：保持「不写死令牌、不写死仓库名」；仓库名一律从环境或 `gh repo view` 推导。*
