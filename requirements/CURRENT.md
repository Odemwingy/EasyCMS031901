# 当前需求基线（CURRENT）

## 当前版本

- 需求基线：`requirements/versions/PRD_v1.2.md`
- 变更入口：`requirements/diffs/`
- 总览变更日志：`requirements/CHANGELOG.md`
- 唯一正文：`requirements/versions/PRD_v1.2.md`（不再维护根目录 `PRODUCT_REQUIREMENTS.md`）

## AI 执行入口（固定顺序）

1. 先读 `requirements/CURRENT.md`
2. 再读最新 `requirements/diffs/DIFF_*.md`
3. 最后读 `progress/CURRENT_PROGRESS.md`

## 需求变更流程

- 规范流程说明见：`requirements/CHANGE_PROCESS.md`
- 已完成需求发生变更时，先按该流程补产品变更说明与标准 diff，再进入开发

## 使用约定

- 任何需求变更都**必须**新增一个差异文件，不直接口头覆盖。
- 开发执行以“当前版本 + 最新差异文件”为准。
- 若差异文件与旧版本冲突，以差异文件为准，并在下一版 PRD 回收。
## 最新需求变更

- 角色管理 - 角色详情：
  - 新增 `active_user_count`
  - 新增 `disabled_user_count`
  - `user_count` 保持原口径不变

详细变更说明见：
- `requirements/diffs/DIFF_role_detail_user_status_counts.md`
