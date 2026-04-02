# 角色入口导航

> 适用场景：产品、前端、后端、测试在当前项目中接手新任务、需求变更、Bug 修复、联调回归时，先按本导航找到正确入口文档。

## 1. 总体规则

所有角色开始工作前，先确认两件事：

1. 当前最新需求入口是什么
2. 当前处理的是 Bug 还是需求变更

通用优先顺序：

1. `AI_PRD_GUIDE.md`
2. `requirements/CURRENT.md`
3. 最新 `requirements/diffs/DIFF_*.md`
4. `progress/CURRENT_PROGRESS.md`
5. 自己角色对应的专项文档

## 2. 产品入口

产品在以下场景优先从这里开始：

- 新增需求
- 已完成需求发生变更
- 测试提的问题需要判断是不是需求变化

先看：

1. `requirements/CURRENT.md`
2. `requirements/CHANGE_PROCESS.md`
3. `docs/stage-1/PRD_后台管理_用户角色权限_v1.2.md`
4. 如有新版或补充说明，再看 `docs/` 下最新原始文档

产品主要职责：

- 先给出产品变更说明
- 明确当前行为与目标行为
- 明确验收口径

## 3. 前端入口

前端在以下场景优先从这里开始：

- 新需求页面适配
- 已完成页面的增量修改
- 接口字段变化后的联调
- 收到前端侧 Bug Issue

先看：

1. `requirements/CURRENT.md`
2. 最新 `requirements/diffs/DIFF_*.md`
3. `technology/API_SPEC.md`
4. `issue/ISSUE_WORKFLOW.md`
5. `progress/阶段一/前端.md`

前端执行原则：

- 默认做增量适配，不从头开发
- 先判断本次变更是否真的影响现有页面
- 若问题本质是需求变更，先转 `requirements/CHANGE_PROCESS.md`

## 4. 后端入口

后端在以下场景优先从这里开始：

- 新增或修复接口
- 数据、权限、审计、登录安全问题
- 收到后端侧 Bug Issue

先看：

1. `requirements/CURRENT.md`
2. 最新 `requirements/diffs/DIFF_*.md`
3. `technology/API_SPEC.md`
4. `issue/ISSUE_WORKFLOW.md`
5. `progress/阶段一/后端.md`
6. `docs/ENGINEERING_GUARDRAILS.md`

后端执行原则：

- Bug 修复走独立 `codex/*` 分支
- 修复后先 PR，再转测试回归
- 不直接在 `main` 上修复
- 不重置真实开发库

## 5. 测试入口

测试在以下场景优先从这里开始：

- 提 Bug
- 跟进 PR 回归
- 更新测试用例
- 判断是实现问题还是需求变更

先看：

1. `requirements/CURRENT.md`
2. 最新 `requirements/diffs/DIFF_*.md`
3. `issue/ISSUE_WORKFLOW.md`
4. `progress/阶段一/测试.md`
5. `technology/API_SPEC.md`

测试执行原则：

- 先看当前 diff，再更新用例
- 回归基于指定分支 / PR 进行
- 回归通过后再推动关闭 Issue
- 若发现是需求变化，不直接当 Bug 推进

## 6. 处理 Bug 时的统一入口

无论前端、后端还是测试，只要进入 Bug 流程，统一先看：

1. `issue/README.md`
2. `issue/ISSUE_WORKFLOW.md`
3. 如涉及环境与数据安全，再看 `docs/ENGINEERING_GUARDRAILS.md`

## 7. 处理需求变更时的统一入口

无论谁发现“当前实现不是坏了，而是要改口径”，统一先看：

1. `requirements/CHANGE_PROCESS.md`
2. `requirements/CURRENT.md`
3. 最新 `requirements/diffs/DIFF_*.md`

## 8. 最容易出错的情况

以下情况要特别警惕：

- 前端只看代码，不看 diff
- 后端收到 Issue 后不分类直接修
- 测试把需求变更当作 Bug 提
- 产品只口头描述变更，不落文档
- 所有人都不知道当前最新入口文档是哪份

## 9. 执行原则

一句话总结：

不同角色做不同事，但所有人都先从同一套需求入口和流程入口开始，再进入自己的执行文档。
