# BPMN 规格书反映器

## 概要
解析 BPMN 格式的 XML，并将规格书的内容反映到 BPMN 中。

## 使用时机
当用户提出如下请求时：
- 「希望将 `doc/<BPM流程名>-prompt/` 的规格书内容反映到 BPMN XML 中」
- 「希望将规格书的内容反映到 BPMN XML 中」

## 反映目标
- 正确：`doc/<BPM流程名>-prompt/<BPM流程名>.bpmn`（复制目标。只能反映到此文件）
- 错误：`doc/<BPM流程名>.bpmn`（复制来源。**绝对不可改写**）

## 反映到 BPMN XML 的内容
- 本技能集执行以下操作。
  - 流程定义键置换
  - 添加角色 ID
  - 设置任务背景色
  - 可选任务设置
  - 添加流程变量定义
  - 添加信号定义
  - 添加消息定义

## 实施步骤

### 步骤 0. 确认对象
- 确认作为反映来源的规格书与反映目标文件。
  - 提示作为反映来源的规格书路径与反映目标 BPMN 文件的路径，确认是否有误。
- 确认反映内容
  - 从规格书中提取并提示需要反映的事项，询问希望反映的事项。
- 是否实施反映
  - 确认是否实施反映处理。若为 YES，则执行步骤 1 及之后的步骤。若为 NO，则中止处理。

### 步骤 1. 流程定义键置换（固定顺序）

本流程必须按此顺序执行。

#### 1-1. 已置换检查（JS）

- 执行：
  - `{{RUNTIME}} .agents/skills/bpm-xml-reflector/scripts/check-process-id-replaced.js <doc/*-prompt/*.bpmn> <replacements.json>`
- 判定：
  - `replaced`：已置换。不执行置换处理。
  - `not_replaced` / `partial`：进入步骤 2。

#### 1-2. 用户确认（是否实施置换）

- 提示规格书 `to-be-discussed.md` 中的 from-to 提案。
- 向用户确认「是否可以按此 from-to 进行置换」。
- 仅在 OK 的情况下进入步骤 3。

#### 1-3. 置换处理

**本步骤必须通过 `.agents/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` 的 `reflector.reflect()`（内部调用 `reflectProcessIdReplacements()`）执行。
不得使用 Read/Write/Edit 工具直接读写 `.bpmn` 来重现置换。**
对象文件路径仅作为 `bpmnPath` 参数指定。通过 `isPromptCopyBpmnPath()`，
除 `doc/<BPM流程名>-prompt/<BPM流程名>.bpmn` 格式以外的路径（包括复制来源 `doc/<BPM流程名>.bpmn`）
将抛出异常，不予反映。
以下 1-3-1～1-3-5 是对 `reflectProcessIdReplacements()` 内部动作的说明，并非代理需要单独重现的步骤。

##### 1-3-1. 执行 from-to 置换（内存中）
- 在内存中生成按规格书提案的 from-to 置换后的 XML（不写入磁盘）。
- 置换 `process@id` 后，在 process 标签中添加 documentation 标签，并追加以下格式的令牌（保留既有记述）
```
PROCESS_KEY_META:PROCESS_KEY_REPLACED=true;ORIGINAL_PROCESS_KEY=<原 process_id>;PROCESS_KEY=<采番后 process_id>;REPLACED_DATE=<YYYY-MM-DD>;REPLACE_POLICY=initial-only
```

##### 1-3-2. 置换验证（JS）
- 内部执行相当于 `verifyProcessIdReflections()` 的验证。
- 验证对象：
  - `participant@processRef`
  - `process@id`
- 需要单独确认时的执行示例（从 `reference/` 目录）：
  - `{{RUNTIME}} .agents/skills/bpm-xml-reflector/scripts/verify-process-id-reflection.js <doc/*-prompt/*.bpmn> <replacements.json>`

##### 1-3-3. 验证失败时的重试
- 验证失败时最多自动重试 2 次。
- 若重试后仍然失败，则作为错误中止处理，并向用户显示失败位置。

##### 1-3-4. 用户批准后直接写入本文件
- 通过 `onProcessIdReplacementDetected` 回调，向用户提示验证成功的置换后 XML。
- 显示「将哪些 from-to 反映到哪个文件（路径）」，并取得批准。
- 仅在获得批准的情况下，将置换后的 XML 直接写入对象 `.bpmn`。
- 若被拒绝则不做任何处理（由于对象 `.bpmn` 在批准前完全未被变更，因此也无需还原处理）。

##### 1-3-5. 完成确认
- 显示「哪个文件（路径）的置换已完成」。
- 向用户确认对象是否正确。

#### 1-4. 更新规格书

- 更新 `to-be-discussed.md` 的流程定义键置换履历。
  - 置换状态：已置换
  - 判定依据：documentation 令牌（反映后）
  - 反映日期时间：YYYY-MM-DD
  - 各置换提案表的反映日：YYYY-MM-DD

#### 1-5. 更新变更履历

- 在 `interactive-log.md` 中记录以下内容。
  - 执行日期时间
  - 对象文件路径
  - from-to 一览
  - 用户确认结果（1-2 / 1-3-4）
  - 验证结果（1-3-2 / 1-3-3）

#### 例外：禁止再次置换

对于判定为已置换的 process，不得实施新的采番。必须复用既有的键。

- 既有键的获取来源：
  - 从 documentation 令牌中提取 `PROCESS_KEY=<key>`


### 步骤 2. 角色 ID・任务背景色・可选任务设置・流程变量・信号定义・消息定义的反映处理

反映逻辑实现于 `.agents/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js`。以下为其概要与调用方法。

#### 处理概要

| 函数 | 作用 |
|------|------|
| `applyProcessCandidateStarterGroups(xml, processId, roleId)` | 为 `<process>` 标签添加 `candidateStarterGroups="<角色ID>"` |
| `applyLaneCandidateGroups(xml, laneId, roleId)` | 为 `<lane>` 标签添加 `candidateGroups="<角色ID>"` |
| `applyUserTaskCandidateGroups(xml, taskId, roleId)` | 为 `<userTask>` 标签添加 `candidateGroups="<角色ID>"` |
| `applyTaskColor(xml, taskId, taskType)` | 添加与任务种别对应的 `color` 属性（颜色映射参见下文） |
| `applyIsOptional(xml, taskId)` | 为可选任务的标签添加 `isOptional="true"` |
| `applyDataObjects(xml, processId, variables)` | 将流程变量作为 `<dataObject>` 插入到 `<process>` 块末尾 |
| `applyConditionExpression(xml, flowId, expression)` | 向 `<sequenceFlow>` 插入 `<conditionExpression>`（自闭合标签会自动展开） |
| `applySignal(xml, signalId, signalName)` | 在 `<process>` 之前插入 `<signal>` 元素 |
| `applyMessage(xml, messageId, messageName)` | 在 `<process>` 之前插入 `<message>` 元素 |
| `replaceProcessId(xml, fromId, toId)` | 置换 Process ID（同时置换 `<process id>` 与 `<participant processRef>`） |
| `reflectProcessIdReplacements(bpmnPath, xml, replacements, options)` | 在内存中实施 Process ID 置换，并在用户确认后直接写入对象 `.bpmn`（不创建 `.tmp`。通过可选参数指定 `onProcessIdReplacementDetected` 回调） |
| `verifyProcessIdReplacements(xml, replacements)` | 验证规格书的 process id 置换 from-to 与反映后 BPMN 是否一致（对照 `process@id` 与 `participant@processRef`） |
| `reflect(bpmnPath, specs, options)` | 汇总执行上述处理，并覆盖保存 BPMN 文件（可通过可选参数自定义 process id 置换时的动作） |

**任务种别与 color 值的对应：**

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

**通用规则：**
- 属性・元素已存在时跳过（幂等）
- 也支持 `<bpmn:process>` 等命名空间前缀

### 步骤 3. 置换调用活动的被调用流程

**置换被调用流程时的注意事项**
- 无需对被调用流程进行检查。
  - 不执行被调用流程的存在性检查或被调用流程的内容检查等。

#### 3-1. 获取置换后的值（流程定义键）
- 从 `to-be-discussed.md` 的调用活动被调用流程置换履历与被调用 BPMN 中获取置换后的值（流程定义键）。
  - 确认调用活动被调用流程置换履历与被调用 BPMN 的 ID（流程定义键）是否一致。
  - 若置换后的值未定、`to-be-discussed.md` 与被调用 BPMN 的值不一致、被调用 BPMN 的 ID 未置换等无法确定置换后值的情况，则在 3-3. 一览的「置换后的值」栏中显示「值不明」。

#### 3-2. 已置换检查（JS）
- 确认更新对象 BPMN 中调用活动的被调用流程的值是否已置换。
  - 若已置换且置换后的值与 3-1 中获取的值一致，则无需置换。

#### 3-3. 用户确认（是否实施置换）
- 显示 3-1.、3-2. 中获取的调用活动一览，确认是否实施置换。此外，对于置换后的值未定的条目，确认 ID（流程定义键）并提示输入。
  - 一览中显示调用活动名、置换前的值、置换后的值（流程定义键）、是否需要置换。
  - 在 3-2. 中判定为无需置换的调用活动，在是否需要置换栏中显示「已置换」。
  - 在 3-2. 中判定为未置换的调用活动，在是否需要置换栏中显示「等待置换」。
  - 置换后的值不明的条目，在是否需要置换栏中显示「等待值确定」。
- 若存在无法确定置换后值的调用活动，则显示将跳过对该调用活动的反映。
  - 同时通知用户，可在将 BPMN 上传至 IM-BPM 后，在流程设计器中设置调用活动的调用对象。

#### 3-4. 置换处理
- 根据 3-3. 的一览置换调用活动的被调用对象流程的值。
  - 在 callActivity 标签下添加 documentation 标签。输入以下内容。
    - CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<calledElement 置换前的值>;CALLEE_PROCESS=<置换后的值>;REPLACED_DATE=yyyy-MM-dd;
  - 用置换后的值覆盖 callActivity 标签的 calledElement。

#### 3-5. 更新规格书

- 更新 `to-be-discussed.md` 的调用活动被调用流程置换履历。
  - 反映日：YYYY-MM-DD

#### 3-6. 更新变更履历

- 在 `interactive-log.md` 中记录以下内容。
  - 执行日期时间
  - 对象文件路径
  - 已置换的调用活动一览
  - 用户确认结果（3-3）

### 调用示例（按步骤 1 → 步骤 2 的顺序执行）

步骤 1（流程定义键置换）与步骤 2（角色 ID・颜色・变量等）必须**分别调用 `reflect()`，并在确认步骤 1 完成后再进入步骤 2**。
不要在一次 `reflect()` 调用中同时传入两者的字段。

```javascript
var reflector = require('.agents/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector');
var bpmnPath = 'doc/vehicle-management-prompt/vehicle-management.bpmn';

// ---- 步骤 1：流程定义键置换（单独实施） ----
// 若不需要 processIdReplacements，可省略步骤 1，直接从步骤 2 开始实施。
reflector.reflect(
  bpmnPath,
  {
    // process id 置换的规格书对照（to-be-discussed.md 的 from-to）
    processIdReplacements: [
      { fromId: 'Process_1', toId: 'daily_check_0001' }
    ]
  },
  {
    // 用户确认回调（仅在步骤 1 中需要）
    onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
      // 向用户确认，批准则调用 onApprove()，拒绝则调用 onReject()
      console.log('File to be replaced: ' + filePath);
      replacements.forEach(function(r) {
        console.log('  ' + r.fromId + ' → ' + r.toId);
      });
      // 实现示例：通过 vscode_askQuestions 进行确认
      onApprove(); // or onReject();
    }
  }
);

// ---- 步骤 2：角色 ID・任务背景色・可选任务设置・
//              流程变量・信号定义・消息定义的反映（在步骤 1 完成后实施） ----
reflector.reflect(
  bpmnPath,
  {
    // 流程・池的角色设置
    processes: [
      { id: 'r_1', roleId: 'quality_safety_mgr' }
    ],

    // 泳道的角色设置
    lanes: [
      { id: '_4', roleId: 'quality_safety_mgr' }
    ],

    // 用户任务的角色设置（isOptional 为可选）
    userTasks: [
      { id: '_32', roleId: 'quality_safety_mgr' },
      { id: '_10', roleId: 'quality_safety_mgr', isOptional: true }
    ],

    // 流程变量（type: string / int / long / double / datetime / boolean）
    dataObjects: [
      {
        processId: 'r_1',
        variables: [
          { id: 'vehicleId', name: 'vehicleId', type: 'string' }
        ]
      }
    ],

    // 分支条件（EL 表达式）
    conditions: [
      { flowId: '_50', expression: "${approved == 'true'}" },
      { flowId: '_51', expression: "${approved == 'false'}" }
    ],

    // 信号定义
    signals: [
      { id: 'sig1', name: 'OrderCompleted' }
    ],

    // 消息定义
    messages: [
      { id: 'msg1', name: 'Notification' }
    ],

    // 任务的配色（taskType 参见上述颜色映射）
    colorize: [
      { taskId: '_32', taskType: 'userTask' },
      { taskId: '_10', taskType: 'userTask' }
    ]
    // 此处不指定 processIdReplacements（因为已在步骤 1 中反映完毕）
  }
);
```

### specs 各字段的注意事项

- `processes` / `lanes` / `userTasks`：角色 ID（`roleId`）应使用规格书的参与者定义中记载的 ID
- `dataObjects`：`type` 需指定 `string` / `int` / `long` / `double` / `datetime` / `boolean` 之一
- `conditions`：`expression` 以 EL 表达式记述（例：`${p1 > 999}`）。可直接书写 `>`（脚本将其作为值处理）
- `colorize`：需为所有用户任务着色。其他任务种别同样需无遗漏地指定
- `processIdReplacements`：设置规格书中记载的 process id 置换提案（from-to）。`toId` 为必填。将验证 `process@id` 与 `participant@processRef` 双方均已置换为 `toId`。仅在允许 `fromId` 于反映后残留的情况下附加 `allowFromIdExists: true`。**仅在步骤 1 的调用时指定，不要包含在步骤 2 的调用中**
- 不需要的字段可省略（`reflect` 会以 `|| []` 补全各字段）
- 伴随 Process ID 置换时，需在第 3 个参数 `options` 中指定 `onProcessIdReplacementDetected` 回调（用于用户确认流程）

### options（第 3 个参数）的指定

**仅在步骤 1（传入 `processIdReplacements` 的调用）中需要。步骤 2 的调用无需指定。**

```javascript
{
  onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
    // filePath: 置换对象文件路径
    // replacements: 置换内容的数组 [{ fromId: '...', toId: '...' }, ...]
    // onApprove: 批准时的回调（无参数）
    // onReject: 拒绝时的回调（无参数）
    //
    // 实现示例：
    // - 通过 vscode_askQuestions 显示确认对话框
    // - 用户选择「OK」→ 执行 onApprove()
    // - 用户选择「取消」→ 执行 onReject()
  }
}
```
