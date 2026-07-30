# 规格书的构成

生成的规格书应具有以下构成

1. 概要
   - 简洁说明这是一个做什么的流程。
   - 用一句至数句话说明业务从开始到结束的过程。

2. 参与者（角色）
   - 从池、泳道、任务等说明流程的参与者・相关方
   - 根据池、泳道、任务的名称提议角色 ID
     - 角色 ID 应为小写蛇形命名（snake_case），且在 20 个字符以内

3. 流程详情
   - 按流程分别创建事件・任务的一览
     - 一览中记载事件・任务的种类、负责人、画面、执行条件的说明等
     - 一览的画面项目中，有画面时记载画面定义名（设为指向画面定义的链接），无画面时记载 "-"
     - 若存在调用活动，则明确记载被调用流程名。若存在被调用流程的规格书，则将被调用流程名设为指向规格书目录的链接。
   - 记载流程的开始方法
     - 无明确指示时，从 IM-BPM 标准的流程开始一览启动
   - 记载流程的异常处理（错误事件或异常流程的说明）
   - 对于独立的任务（无顺序流、无边界事件），询问是否设为可选任务
     - 同时记载于待讨论事项中
   - 条件分支：网关的条件表达式或分支规则的说明
     - 存在条件分支时，必须提议用于存放判定值的流程变量。
     - 用于条件分支的流程变量，在顺序流的条件中作为使用 EL 表达式的判定式加以利用。
   - 根据需要提议流程变量（用于业务数据主键信息的传递等）
   - 若导入的 BPMN 中存在设想与外部联动的功能，则予以记载
   - 对于信号开始事件与信号捕获事件，应明确信号的发送来源与信号发送的条件
     - 若信号发送来源或条件不明确，则在待讨论事项中提出询问。
   - 对于消息开始事件与消息捕获事件，应明确消息的发送来源与消息发送的条件
     - 若消息发送来源或条件不明确，则在待讨论事项中提出询问。

## 参照 BPMN 为 iGrafx 制作时必须执行的事项
- 池的内部若没有泳道，则建议追加泳道。
- 以下 BPMN 要素在 iGrafx 中有定义，但 IM-BPM 中没有定义，因此应在流程详情的一览中提议变更为其他要素。
  - Vertical Pool：垂直池 → 变更为池
  - Collapsed Event Sub-Process：折叠事件子流程 → 变更为事件子流程
  - Collapsed Sub-Process：折叠子流程 → 变更为子流程
  - Message Send Event：消息发送事件 → 变更为任务（因为在 IM-BPM 中，消息发送以 IM-LogicDesigner 任务代替）
  - Escalation Catch Event：升级捕获事件 → 由于 IM-BPM 本身没有升级事件，建议以其他任务・事件代替
  - Cancel Catch Event：取消捕获事件 → 由于 IM-BPM 本身没有取消事件，建议以其他任务・事件代替
  - Compensation Catch Event：补偿捕获事件 → 由于 IM-BPM 本身没有补偿事件，建议以其他任务・事件代替
  - Conditional Event：条件事件 → 由于 IM-BPM 没有条件事件，建议以其他任务・事件代替
  - Link Event - Incoming：链接事件接收 → 由于 IM-BPM 本身没有链接事件，建议以其他任务・事件代替
  - Multiple Throw Event：多重抛出事件 → 由于 IM-BPM 本身没有多重事件，建议以其他任务・事件代替
  - Complex Gateway：复合网关 → 建议以其他网关代替
- 以下任务在 IM-BPM 中没有定义，因此建议以其他任务代替
  - Send Task：发送任务
  - Business Rule Task：业务规则任务
  - Notification Task：通知任务
  - Mapping Task：映射任务
  - Reporting Task：报表任务
  - Manual Service Task：手动服务任务
  - Automated Service Task：自动服务任务
  - Rule Flow Task：规则流任务
  - Rule Script Task：规则脚本任务
  - Decision Table Task：决策表任务
  - Rule Task：规则任务
  - Ruleset Task：规则集任务
  - Flow Ruleset Task：流程规则集任务
- 池内存在多层级泳道时，提议将泳道改为 1 层。（因为 IM-BPM 不支持多层级泳道）
- 调用活动应明确记载被调用方的流程名。特定方法如下。
  - 使用脚本：从 `.claude/skills/bpm-docs-generator/scripts/search-called-elements.js` 的返回值中确认各调用活动的被调用方。
  - 在流程详情的调用活动项目中明确记载结果。（流程名，或被调用方不明）
  - 同时在 `to-be-discussed.md` 的「第 3 章 调用活动的被调用流程置换履历」中记载结果。

**流程变量的注意事项**
 - 流程变量应提议 ID、名称、类型。
   - ID 与名称应设为可类推所设定值的形式。
   - 类型从 `string`、`boolean`、`datetime`、`int`、`long`、`double` 中根据值的用途进行选择。
 - 流程实例 ID 可从隐式对象（`${execution.processInstanceId}`）中获取，因此排除在流程变量的候选之外。
 - 可用业务数据的项目代替的要素，排除在流程变量的候选之外。
