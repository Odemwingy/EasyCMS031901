# 需求变更日志（CHANGELOG）

> 目标：快速查看“版本演进 + 对应差异文件”。

## 2026-03-25

- 建立需求版本化目录：
  - `requirements/versions/`
  - `requirements/diffs/`
  - `requirements/CURRENT.md`
- 当前有效版本：`PRD_v1.2.md`
- 差异模板：`DIFF_TEMPLATE.md`
- 将根目录 `PRODUCT_REQUIREMENTS.md` 正文迁移到 `requirements/versions/PRD_v1.2.md`，并改为单一真源

## 后续记录格式

- 日期：
- 版本变更：`vX.Y -> vX.Z`
- 差异文件：`requirements/diffs/DIFF_vX.Y_to_vX.Z.md`
- 变更摘要：1~3 行
