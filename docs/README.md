# docs/

本目录用于归档项目共享文档原文与补充资料。

## 使用规则

1. 所有新增的需求原文、接口文档、技术架构文档、评审纪要、补充说明等，统一归档到 `docs/`。
2. 建议按阶段或主题分目录，例如：`docs/stage-1/`、`docs/reviews/`。
3. 正式执行版文档应放在项目固定目录中，例如：
   - `requirements/versions/PRD_v1.2.md`
   - `technology/TECH_STACK.md`
   - `technology/API_SPEC.md`
4. 正式执行版文档引用原始资料时，应引用本目录内的仓库路径，不得引用开发者本地绝对路径。
5. 已开发完成需求发生变更时，优先使用 [CHANGE_REQUEST_TEMPLATE.md](./CHANGE_REQUEST_TEMPLATE.md) 提交变更单，再进入影响分析和开发。
6. 协作补充文档可放在 `docs/`，例如：
   - `docs/ENGINEERING_GUARDRAILS.md`
   - `docs/ROLE_ENTRYPOINTS.md`
