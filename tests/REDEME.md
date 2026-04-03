# EasyCMS 测试全流程 Skill

## 目标

本文用于约束当前项目在 `tests/` 目录下的测试工作流，覆盖以下闭环：

1. 读取需求、diff、阶段进度和规则
2. 识别测试影响范围
3. 增量更新测试用例
4. 从测试用例映射自动化范围
5. 增量更新自动化脚本
6. 执行测试并产出报告
7. 区分产品缺陷与非产品问题
8. 生成 `buglist.md`
9. 生成或更新 `issue.md`
10. 提交到 Git
11. 按 issue 状态做定向回归

本流程只描述 `tests/` 下的测试资产，不涉及修改 `app/` 目录代码。

## 固定原则

- 只做增量，不重写整套测试
- 不允许扩大测试范围
- 先分析影响，再修改测试资产
- 任何会修改文件的操作，必须先说明改哪些文件、改什么、为什么改，得到确认后再执行
- 先更新测试用例，再补自动化脚本
- `buglist.md` 和 `issue.md` 只记录产品真实缺陷
- 环境问题、脚本问题、待人工复核项不进入 `buglist.md` 和 `issue.md`
- 用户后续新增的流程约束、输入要求、口径要求，必须同步写入本 skill
- 测试数据优先采用“分层创建 + 最后组合”的方式，不优先一次性硬造最终态

## 开始前必读

开始执行测试工作前，优先读取：

- `AI_PRD_GUIDE.md`
- `rule.md`
- `requirements/CURRENT.md`
- `requirements/diffs/DIFF_*.md`
- `technology/API_SPEC.md`
- `docs/stage-*/`
- `progress/CURRENT_PROGRESS.md`

如果用户在对话中新增了测试规则、排除项、提交流程、输入要求，这些要求必须：

1. 在当前任务中立刻执行
2. 同步写入本 skill
3. 后续继续按新规则执行

## 差异识别

若本次是增量需求，必须先按 diff 文档中的三类识别测试影响：

- 一、增量
- 二、修改
- 三、删除

输出时必须先给出本次受影响测试范围，再决定后续用例和自动化动作。

## 目录约定

- 测试用例：`tests/TestCase/`
- 自动化脚本：`tests/AutomationScripts/`
- 自动化总入口：`tests/AutomationScripts/run_all_tests.py`
- 覆盖矩阵：`tests/AutomationScripts/功能用例自动化覆盖矩阵.md`
- issue 草稿：`tests/AutomationScripts/issue.md`
- UI 报告：`tests/AutomationScripts/ui_automation/outputs/`
- API 报告：`tests/AutomationScripts/api_automation/outputs/`

## 框架总览

当前测试框架分 6 层：

1. 需求输入层
- 读取 `requirements/`、`docs/stage-*`、`progress/`、`AI_PRD_GUIDE.md`

2. 用例层
- 测试用例维护在 `tests/TestCase/`

3. 映射层
- 通过覆盖矩阵和 traceability 将 case ID 映射到自动化脚本

4. 实现层
- UI：`tests/AutomationScripts/ui_automation/`
- API：`tests/AutomationScripts/api_automation/`

5. 执行层
- 统一入口：`tests/AutomationScripts/run_all_tests.py`

6. 闭环层
- 产物：`测试报告.html`、`buglist.md`、`non_product_issues.md`、`screenshots/`
- issue 维护：`tests/AutomationScripts/generate_issue_md.py`、`tests/AutomationScripts/issue.md`

简版流程图：

```text
需求 / diff / 当前进度
    ->
tests/TestCase/*.md
    ->
覆盖矩阵 / TRACEABILITY
    ->
UI 或 API 自动化脚本
    ->
conftest / pages / test_data / config
    ->
run_all_tests.py
    ->
pytest 执行
    ->
outputs/<suite>/
    -> 测试报告.html
    -> buglist.md
    -> non_product_issues.md
    -> screenshots/
    ->
generate_issue_md.py
    ->
issue.md
    ->
Git / GitHub issue / 定向回归
```

## Skill 流程

### 1. 读取需求

先确认：

- 本次测试对象是功能还是接口
- 本次是新增、修改还是删除
- 是否要求只做增量
- 是否限制不可扩大范围

### 2. 更新测试用例

根据需求类型更新：

- `tests/TestCase/EasyCMS_后台管理_功能测试用例.md`
- `tests/TestCase/EasyCMS_后台管理_接口测试用例.md`

规则：

- 只补本次直接影响的增量
- 不从头重写全部用例
- 不擅自扩到无关模块
- 必须明确区分：
  - 新增测试点
  - 需要修改的旧用例
  - 可删除的旧用例
  - 需要补做的回归测试

### 3. 用例映射自动化

更新自动化脚本前，先做映射：

1. 找到对应 case ID
2. 确认是否已在覆盖矩阵中登记
3. 判断落到 UI 还是 API 自动化
4. 确认 fixture、页面对象、配置文件是否可复用

要求：

- 自动化脚本必须能回溯到 case ID
- 优先做增量补充，不整体重写脚本
- 如果只是选择器、路由、fixture、断言口径问题，按脚本问题处理，不写成产品缺陷

### 4. 更新自动化脚本

- UI：`tests/AutomationScripts/ui_automation/`
- API：`tests/AutomationScripts/api_automation/`

规则：

- 优先复用已有 fixture、页面对象、请求封装
- 只修改本次需求直接影响到的断言、路由、字段、造数逻辑
- 若需求未落地到前端页面，不补 UI 断言
- 若只是接口增量字段，不扩大功能冒烟范围

### 5. 执行自动化

统一命令：

```powershell
python tests\AutomationScripts\run_all_tests.py --target ui --suite smoke
python tests\AutomationScripts\run_all_tests.py --target ui --suite regression
python tests\AutomationScripts\run_all_tests.py --target api --suite smoke
python tests\AutomationScripts\run_all_tests.py --target api --suite regression
python tests\AutomationScripts\run_all_tests.py --target all --suite all
```

执行后重点关注：

- `测试报告.html`
- `buglist.md`
- `non_product_issues.md`
- UI 失败截图

### 6. 截图和报告规则

- UI 失败截图默认位于 `outputs/<suite>/screenshots/`
- `buglist.md`、`non_product_issues.md`、`issue.md` 应优先附截图路径作为证据
- 若没有截图，必须明确写 `无截图`
- 若截图不足，需补充 `测试报告.html` 作为证据来源
- 关闭 issue 前，要同时查看 `buglist.md`、`non_product_issues.md`、`测试报告.html`

### 7. 区分产品缺陷与非产品问题

- 产品真实缺陷：
  - 写入 `buglist.md`
  - 可进入 `issue.md`
  - 可提交 GitHub issue
- 环境问题：
  - 只写入 `non_product_issues.md`
  - 不进入 `buglist.md`
  - 不进入 `issue.md`
- 脚本问题：
  - 只写入 `non_product_issues.md`
  - 不进入 `buglist.md`
  - 不进入 `issue.md`
- 待人工复核项：
  - 先写入 `non_product_issues.md`

`non_product_issues.md` 规则：

- 尽量附截图路径或 `测试报告.html` 路径
- 不提交 GitHub issue
- 可作为后续环境排查、脚本修复、人工复核输入
- 回归后若仍是环境或脚本问题，继续更新该文件，不误转产品缺陷

### 8. buglist 和 issue 规则

`buglist.md` 只记录产品缺陷。

规则：

- 每条标题必须带唯一编号，格式 `【001】`
- `buglist.md` 和 `issue.md` 必须一一对应
- 编号优先复用已有 issue 编号
- 新问题再顺延新增编号

`issue.md` 规则：

- 只接收产品缺陷
- 每条 issue 标题至少必须带编号，格式 `【001】标题`
- 若当前 `issue.md` 已补充模块名，可保留 `【001】【用户管理模块】标题` 形式；但自动生成规则以 `【001】标题` 为基线
- 之后只新增，不删除原有 issue
- 已确认修复的 issue 不删除，保留原文并标注 `已修复`
- 提交 GitHub 时，只处理本次新增编号的 issue

推荐命令：

```powershell
python tests\AutomationScripts\generate_issue_md.py
python tests\AutomationScripts\generate_issue_md.py --buglist tests\AutomationScripts\ui_automation\outputs\regression\buglist.md
python tests\AutomationScripts\generate_issue_md.py --resolved 003,007
```

### 9. Git 提交

```powershell
git status --short
git add tests
git commit -m "test: update testing workflow"
git push
```

提交前检查：

- 是否只包含本次测试范围内的改动
- 是否误包含 `app/` 目录修改
- 是否误提交本地敏感配置

### 10. 按 issue 做回归

不要默认全量重跑，优先做：

- 与 issue 直接相关的回归测试
- 上下游最小关联回归
- 必要时再补 smoke 主链路

当 issue 进入“待回归”或等价状态时：

1. 重新读取需求与 issue 描述
2. 核对修复是否覆盖原失败点
3. 只执行直接相关的用例或套件
4. 查看新的 `buglist.md`、`non_product_issues.md`、`测试报告.html`
5. 若通过，则在 `issue.md` 中将对应编号标为 `已修复`
6. 若失败，则补充新证据并保持 issue open

### 10.1 GitHub issue 回归验证与关闭

- 先读取 GitHub 上对应 issue 及评论，判断是否有“已修复 / 待回归 / 请测试验证”等线索
- 只对有修复线索的 issue 做定向验证，不默认全量回归
- 验证通过后：
  - 先更新本地 `tests/AutomationScripts/issue.md`
  - 将对应条目标记为 `ISSUE-STATUS: resolved`
  - 补充回归时间、验证命令、验证结果
  - 再到 GitHub 补一条“回归通过”评论
  - 最后关闭 GitHub issue
- 验证失败时：
  - 不关闭 GitHub issue
  - 在本地 `issue.md` 或 GitHub 评论中补充“回归失败”结论和证据

GitHub API / issue 操作注意事项：

- token 可从 `config/` 目录下的文本文件读取
- 不直接使用 PowerShell 处理中文 issue 正文或评论
- 需要调用 GitHub API 时，优先写临时 Python 脚本执行
- 临时脚本与请求体文件统一使用 `UTF-8` 且 `无 BOM`
- 执行前先查重，避免重复创建 issue

## 测试数据分层创建规则

测试数据优先按依赖关系分层创建，再按用例组合，不优先一次性创建“最终态”。

推荐四层：

1. 基础资源层
- 用户
- 角色
- 菜单节点

2. 关系绑定层
- 用户绑定角色
- 角色绑定权限
- 菜单形成父子树

3. 状态加工层
- 用户启用/停用
- 角色启用/停用
- 菜单启用/停用
- 解锁、重置密码等状态变换

4. 场景装配层
- `user_readonly`
- `no_permission_user`
- `create_role_with_bound_users`
- `create_three_level_menu_tree`

这样做的好处：

- 复用高
- 清理简单
- 问题定位更容易
- 后续新增用例时只需要重新组合

## 接口造数边界

当前更适合通过接口分层创建的有：

- 用户
- 角色
- 菜单
- 用户/角色/菜单状态切换
- 角色权限绑定

不适合仅靠现有接口直接稳定创建的有：

- `user_locked`
- `user_must_change_password`
- 审计日志样本
- 组织、项目、字典等基础数据
- 部分环境级稳定基线数据

这类数据需要环境预置、业务触发或更底层数据准备。

## 输出要求

每次测试任务至少输出：

- 本次受影响测试范围
- 新增测试点
- 修改的旧用例
- 删除的旧用例判断
- 自动化是否已同步
- 执行了哪些测试命令
- 测试结果汇总
- 是否生成或更新 `issue.md`
- 本次新增 issue 编号
- 哪些旧 issue 被标注为 `已修复`
- 是否存在环境问题或脚本问题
- 非产品问题是否已写入 `non_product_issues.md`

## 简版清单

1. 读需求
2. 做 diff 影响分析
3. 更新测试用例
4. 映射自动化覆盖
5. 更新脚本
6. 跑 smoke 或 regression
7. 先区分产品缺陷与非产品问题
8. 生成 `buglist.md`
9. 生成 `issue.md`
10. 提交 Git
11. 读 issue 状态
12. 做定向回归
