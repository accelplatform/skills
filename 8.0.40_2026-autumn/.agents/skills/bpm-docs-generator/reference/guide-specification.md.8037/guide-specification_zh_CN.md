# 规格书的结构

生成的规格书须具备以下结构

1. 概要
   - 简要说明该流程要做什么。
   - 用一句到几句话说明业务从开始到结束的过程。

2. 参与者（角色）
   - 根据泳池、泳道、任务等说明流程的参与者/相关方
   - 根据泳池、泳道、任务的名称提出角色 ID
     - 角色 ID 须为小写蛇形命名（snake_case），且不超过 20 个字符
   - 须按以下格式显示一览表
      | 参与者 | 角色 ID | 角色名 | 泳池/泳道 | 主要负责的任务・事件 |
      |---|---|---|---|---|
      | <参与者名> | <角色ID方案> | <角色名方案> | <泳池/泳道> | <主要负责的任务等（可省略）> |

3. 流程详情
   - 针对每个流程，创建以下格式的一览表，展示事件与任务
     | 事件・任务的种类 | 负责人 | 画面 | 执行条件说明 |
     |---|---|---|---|
     | <事件・任务的种类> | <负责人> | <画面定义的链接 或 -> | <执行条件说明> |
     - 一览表的画面项目中，若存在画面，则记载画面定义名（作为指向画面定义的链接），若不存在则记载「-」
     - 若存在调用活动，须明确记载被调用流程名。若被调用流程有对应规格书，则被调用流程名应作为指向该规格书目录的链接。
   - 记载流程的启动方式
     - 若无明确指示，则从 IM-BPM 标准的流程启动一览中选取
   - 记载流程的异常处理（错误事件及异常流程的说明）
   - 对于独立的任务（没有序列流、没有边界事件），需询问是否作为可选任务处理
     - 同时也须记载到要探讨事项中
   - 条件分支：说明网关的条件表达式及分支规则
     - 若存在条件分支，须提出用于存储判定值的流程变量
     - 用于条件分支的流程变量，将在序列流条件中通过 EL 表达式的判定式使用
   - 视需要提出流程变量（用于携带业务数据主键信息等用途）
   - 若导入的 BPMN 中存在预计涉及外部联动的功能，须予以记载
   - 对于信号开始事件及信号捕获事件，须明确信号的发送方及信号发送的条件
     - 若信号发送方或条件不明确，须记载到要探讨事项中进行询问
   - 对于消息开始事件及消息捕获事件，须明确消息的发送方及消息发送的条件
     - 若消息发送方或条件不明确，须记载到要探讨事项中进行询问

## 参照的 BPMN 为 iGrafx 制作时必须执行
- **判定对象**：须使用 Read 工具，直接参照 SKILL.md step.2 中指定为复制源的**转换前的原始 BPMN 文件**进行判定（不创建副本，仅参照，且禁止修改该文件）。转换后的 `<BPM流程名>-prompt/<BPM流程名>.bpmn` 已由 `bpmn-transform.js` 执行面向 IM-BPM 的转换，去除了 ixbpmn:/igx: 要素及属性，因此不能用于本项检查。
- 是否为 iGrafx 制作的判定基准与 `.agents/skills/bpm-docs-generator/scripts/bpmn-transform.js` 的 `detectVendor()` 相同。若原始 BPMN 中包含以下任一项，则判定为 iGrafx 制作。
  - `exporter="iGrafx"`
  - 带有 `ixbpmn:` 前缀的要素・属性
  - 命名空间 URI 中包含 `igrafx.com` 的 `xmlns:*` 声明
- 判定为 NG（IM-BPM 不支持）的要素及条件
  | 要素名 | 判定条件 | 应对方案 |
  | ---- | ---- | ---- |
  | 多层级泳道 | `lane` 的子要素中存在 `childLaneSet` 标签 | 建议将泳道改为单层级 |
  | 无泳道的泳池 | `process` 标签的子要素中没有 `laneSet` | 建议追加泳道 |
  | 垂直泳池 | 与 `pool` 或 `lane` 关联的 `bpmndi:BPMNShape` 标签带有 `isHorizontal="false"` 属性 | 变更为泳池 |
  | 折叠的事件子流程 | 与 `subProcess（triggeredByEvent="true"）` 关联的 `bpmndi:BPMNShape` 标签带有 `isExpanded="false"` 属性 | 建议变更为事件子流程 |
  | 折叠的子流程 | 与 `subProcess（triggeredByEvent="false"）` 关联的 `bpmndi:BPMNShape` 标签带有 `isExpanded="false"` 属性 | 建议变更为子流程 |
  | 消息发送事件 | `startEvent` 标签的子要素中存在 `messageEventDefinition` 标签 | 建议以其他事件替代 |
  | 升级捕获事件 | `boundaryEvent` 标签的子要素中存在 `escalationEventDefinition` 标签 | 建议以其他事件替代 |
  | 取消捕获事件 | `boundaryEvent` 标签的子要素中存在 `cancelEventDefinition` 标签 | 建议以其他事件替代 |
  | 补偿捕获事件 | `boundaryEvent` 标签的子要素中存在 `compensateEventDefinition` 标签 | 建议以其他事件替代 |
  | 条件事件 | `intermediateCatchEvent` 标签的子要素中存在 `conditionalEventDefinition` 标签 | 建议以其他事件替代 |
  | 链接事件接收 | `intermediateCatchEvent` 标签的子要素中存在 `eventDefinitionRef` 标签 | 建议以其他事件替代 |
  | 多重抛出事件 | `endEvent` 标签的子要素中存在多个 `messageEventDefinition` 标签 | 建议以其他事件替代 |
  | 复合网关 | `complexGateway` 标签 | 建议以其他网关替代 |
  | 发送任务 | `sendTask` 标签 | 建议以其他任务替代 |
  | 业务规则任务 | `businessRuleTask` 标签 | 建议以其他任务替代 |
  | 通知任务 | `task` 标签带有 `ixbpmn:extendedTaskType="NOTIFICATION"` 属性 | 建议以其他任务替代 |
  | 映射任务 | `task` 标签带有 `ixbpmn:extendedTaskType="MAPPING"` 属性 | 建议以其他任务替代 |
  | 报表任务 | `task` 标签带有 `ixbpmn:extendedTaskType="REPORTING"` 属性 | 建议以其他任务替代 |
  | 手动服务任务 | `task` 标签带有 `ixbpmn:extendedTaskType="MANUAL_SERVICE"` 属性 | 建议以其他任务替代 |
  | 自动服务任务 | `task` 标签带有 `ixbpmn:extendedTaskType="AUTOMATED_SERVICE"` 属性 | 建议以其他任务替代 |
  | 规则流任务 | `task` 标签带有 `ixbpmn:extendedTaskType="RULE_FLOW"` 属性 | 建议以其他任务替代 |
  | 规则脚本任务 | `task` 标签带有 `ixbpmn:extendedTaskType="RULE_SCRIPT"` 属性 | 建议以其他任务替代 |
  | 决策表任务 | `task` 标签带有 `ixbpmn:extendedTaskType="DECISION_TABLE"` 属性 | 建议以其他任务替代 |
  | 规则任务 | `task` 标签带有 `ixbpmn:extendedTaskType="RULE"` 属性 | 建议以其他任务替代 |
  | 规则集任务 | `task` 标签带有 `ixbpmn:extendedTaskType="RULE_SET"` 属性 | 建议以其他任务替代 |
  | 流程规则集任务 | `task` 标签带有 `ixbpmn:extendedTaskType="FLOW_RULE_SET"` 属性 | 建议以其他任务替代 |
- 上述 NG 要素的判定结果，须在记载到 `specification.md` 的流程详情的同一时间点，也输出到 `to-be-discussed.md` 中。
  - 验证结果・应对方案：记载于第 1 章「iGrafx 特有要素兼容性检查」中，重要度固定为「高」，并包含应对方案（记载规则参见 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`）。
  - 不输出到 `spec-to-bpmn-fixes.json`（由于运用上是在 iGrafx 一侧修正 BPMN，故不属于 `.agents/skills/bpm-xml-reflector/SKILL.md` 自动反映的对象）。
- 调用活动须明确记载被调用流程名。确定方法如下。
  - 使用的脚本：根据 `.agents/skills/bpm-docs-generator/scripts/search-called-elements.js` 的返回值，确认各调用活动的调用目标。
    - 执行示例：`{{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/search-called-elements.js <diagram.bpmn>`
  - 将结果（流程名，或「调用目标不明」）明确记载于流程详情的调用活动项目中。
  - 同时也将结果记载于 `to-be-discussed.md` 的「第 3 章调用活动的被调用流程替换履历」中。
  - 若被调用流程已确定，须同时以 `operation: "replace-callee-process"` 的形式输出到 `spec-to-bpmn-fixes.json` 中（详情参见本文件末尾「输出到 `spec-to-bpmn-fixes.json`」）。若调用目标不明，则不输出。

**流程变量的注意事项**
 - 流程变量须提出 ID、名称、类型。
   - ID 和名称应能让人联想到所设置的值。
   - 类型须根据值的用途，从 `string`、`boolean`、`datetime`、`int`、`long`、`double` 中选择。
 - 由于流程实例 ID 可以从隐式对象（`${execution.processInstanceId}`）获取，故将其排除在流程变量候选之外。
 - 可用业务数据项目替代的要素，也应排除在流程变量候选之外。
 - **当后续的开始事件・用户任务需要显示/继承前一工序中输入的业务数据时**（即业务数据以「流程实例 ID + 任务 ID」的复合主键管理、「1 个任务完成 = 1 行」的情形。参见 [guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md)），须提出一个流程变量，用于在前一工序完成时保存该工序自身的任务 ID。
   - 命名示例：`<功能名>TaskId`（例如「采购申请录入」任务则为 `applyTaskId`）。类型为 `string`。
   - 用途：用于后续任务的画面显示处理中，以「流程实例 ID + 该流程变量」作为检索条件，获取前一工序的记录。须注明其目的与用于分支判定的流程变量不同。
   - 设置时机：在前一工序（开始事件或用户任务）的完成处理中，原样设置自身的 `taskId`（若为开始事件，则设置流程实例启动时分配的任务 ID 等）。
 - 若采用在开始事件的同时将其输入值直接登记到业务数据的方针（参见 [guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md) 中「开始事件涉及业务数据输入输出时」一节），则该项目应从流程变量候选中排除。须明确记载后续任务并非从流程变量，而是从业务数据（固定伪任务 ID 的行）中重新获取并使用。

## 输出到 `spec-to-bpmn-fixes.json`

本指南所提出并确定的以下项目，须在记载到 `specification.md`（以及适用情形下的 `to-be-discussed.md`）的同一时间点，也输出到 `doc/<BPM流程名>-prompt/spec-to-bpmn-fixes.json` 中。条目结构、`fixId` 命名规则、`operation` 受控词汇以 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 的「`spec-to-bpmn-fixes.json` 的格式」为准，向 BPMN 的实际反映由 `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 以本文件作为唯一输入来执行。

| 提出项目 | `operation` | `targets` 的对象 | 主要 `params` |
|---|---|---|---|
| 角色 ID（泳池/流程启动者） | `set-role-starter-groups` | process | `roleId` |
| 角色 ID（泳道） | `set-lane-candidate-groups` | lane | `roleId` |
| 角色 ID（任务）/可选任务 | `set-usertask-candidate-groups` | userTask | `roleId`、`isOptional`（适用时） |
| 任务背景色 | `set-task-color` | task | `taskType` |
| 流程变量 | `add-data-object` | process | `variables: [{ id, name, type }]` |
| 信号定义 | `add-signal` | - | `id`、`name` |
| 消息定义 | `add-message` | - | `id`、`name` |
| 调用活动的被调用流程替换 | `replace-callee-process` | callActivity | `fromId`、`toId` |

**输出时的注意事项**
- 对于信号・消息，若发送方或发送条件不明确、仍作为要探讨事项处于询问中（未确定）的状态，即使 `id`/`name` 已知，也不得创建条目。须等用户的回答确定后再追加。
- 调用活动的被调用目标替换，若 `.agents/skills/bpm-docs-generator/scripts/search-called-elements.js` 的结果为「调用目标不明」，则不创建条目。待被调用流程名确定后，以 `fixId: CALLEE-<连续编号>` 追加。
- 任务背景色（`set-task-color`），若同时满足以下所有条件，即使规格书中无明确指示，也须自动创建条目（`requiresApproval: false`）。
  - 目标 BPMN 为 iGrafx 制作（IM-BPM 制作的 BPMN 因假定另行运用 `activiti:color`，故不属于本项对象）。判定方法须与本文件开头「参照的 BPMN 为 iGrafx 制作时必须执行」相同，参照复制源 BPMN（转换前的原始文件）进行。
  - 目标任务的种类属于 `bpmn-xml-reflector` 的颜色映射对象（`userTask` / `scriptTask` / `serviceTask` / `mailTask` / `manualTask` / `receiveTask` / `callActivity`。详情参见 `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 「任务种类与 color 值的对应关系」）
  - 目标任务未设置 `color` 属性（若已设置，则尊重现有配色，不创建条目）
- 角色 ID・任务颜色・流程变量等无需业务判断、可根据规格书记载内容唯一确定的项目，可设置为 `requiresApproval: false`（但 `replace-callee-process` 因属于破坏性操作，须始终为 `true`）。
- `fixId` 的命名规则（`ROLE-`/`COLOR-`/`VAR-`/`SIG-`/`MSG-`/`CALLEE-` 等前缀）参见 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`。
- **流程变量（`add-data-object`）的 `targets.elementId` 须指定目标 process 的 `id`（processId）。若同一个 `spec-to-bpmn-fixes.json` 中存在以该 process 为对象的 `replace-process-id`（流程定义键替换）条目，则 `targets.elementId` 须指定**替换后的值（`toId`）**，而非替换前的值（`fromId`）。** 由于 `reflectFixes()` 按照 fixes 数组从头开始依次应用，若指定替换前的值，则在 process id 替换反映后将找不到目标 process，`add-data-object` 会被静默跳过（详情参见 `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 「`targets` 的指定规则」）。
