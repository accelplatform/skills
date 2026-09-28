# 逻辑的构成与说明

生成的逻辑定义应具备以下结构。
**本文档应与画面定义（guide-screen.md）中记载的画面成对创建。并非针对 IM-LogicDesigner / IM-Workflow 的规定。**

1. 逻辑一览
  - 定义实现任务所需的处理内容。前提是在函数容器（function container）中创建。
  - 一览的项目应记载「逻辑ID」「逻辑名称」「对应画面」「功能概要」。

2. 逻辑详情（按逻辑分别创建）
  - 按逻辑分别记载以下内容
    - 处理概要
    - 输入输出值
    - 输入检查
    - SQL语句（如有必要）
    - 错误处理
    - 与外部系统的联动（如有必要）

## 开始事件与多个用户任务共享业务数据时的结构

当业务数据以「流程实例ID + 任务ID」的复合主键按「每完成1个任务=1行」进行管理时（参见 [guide-business-data.md](.claude/skills/bpm-docs-generator/reference/guide-business-data.md)），后续任务显示/继承前一工序输入数据的处理，应按如下方式分为**取得逻辑**和**登记逻辑**进行记载。

- 若开始事件本身涉及业务数据的输入输出（参见 [guide-business-data.md](.claude/skills/bpm-docs-generator/reference/guide-business-data.md) 中的「当开始事件涉及业务数据的输入输出时的处理方式」），则在开始处理（流程实例开始逻辑）中追加登记处理，以固定伪任务ID（例如：`'START'`）登记新记录。后续任务的取得逻辑在画面显示时以此固定伪任务ID为检索条件进行取得。

1. 取得逻辑（画面显示时・SELECT）
  - 以 `流程实例ID` 以及保存前一工序任务ID的流程变量（参见 [guide-specification.md](.claude/skills/bpm-docs-generator/reference/guide-specification.md)）为检索条件，取得前一工序完成时的一条记录。
  - 输入：`processInstanceId`、前一工序任务ID用的流程变量
  - 输出：前一工序登记的业务数据项目全集
2. 登记逻辑（按下按钮时・INSERT）
  - 将取得逻辑取得的业务数据项目与本次画面输入值合并，**作为新记录登记**（不对前一工序的记录执行UPDATE）。
  - 新记录的「任务ID」设置为该用户任务自身的任务ID。
  - 输入：取得逻辑的输出项目（从画面继承并发送）＋本次画面输入值
  - 输出：处理结果

> 如因希望减少记录数等理由采用「每次申请=1行」（Update方式），则无需分离取得・登记逻辑，可按以往方式记载为单一逻辑「取得→画面显示→反映输入值后UPDATE」。

## 参考技能
- `.claude/skills/jssp-page-generator/SKILL.md`：JSSP 代码生成支持
- `.claude/skills/jssp-im-master-usage/SKILL.md`：用户／组织搜索对话框
- `.claude/skills/jssp-security-check/SKILL.md`：SQL 注入・XSS 对策的验证

## 参考规约
- `.claude/rules/jssp-2way-sql.md`：SQL 外部化（含 `/*$*/` 的白名单验证）

**注意事项**
* **不要创建冗余的SQL。**
  * **可通过IF语句区分使用的SQL应予以整合。**
