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

## 使用约定

- 任何需求变更都**必须**新增一个差异文件，不直接口头覆盖。
- 开发执行以“当前版本 + 最新差异文件”为准。
- 若差异文件与旧版本冲突，以差异文件为准，并在下一版 PRD 回收。
