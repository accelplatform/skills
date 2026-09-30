# BPMN 规格书反映器

## 概述
解析 BPMN 格式的 XML，将规格书的内容反映到 BPMN 中。

## 使用时机
当用户提出如下请求时：
- 「希望将 `doc/<BPM流程名>-prompt/` 下规格书的内容反映到 BPMN XML 中」
- 「希望将规格书的内容反映到 BPMN XML 中」

## 反映目标
- 正确：`doc/<BPM流程名>-prompt/<BPM流程名>.bpmn`（复制目标。只允许在此处进行反映）
- 错误：`doc/<BPM流程名>.bpmn`（复制源。**绝对不可修改**）

## 反映到 BPMN XML 中的内容
- 本技能集执行以下操作。
  - 流程定义键替换（仅限 iGrafx 制作的 BPMN）
  - 调用活动（Call Activity）调用目标流程的替换
  - 添加角色 ID
  - 设置任务的背景色
  - 设置可选任务
  - 添加流程变量定义
  - 添加分支条件表达式（conditionExpression）
  - 添加信号定义
  - 添加消息定义
  - 反映 `.agents/skills/bpm-docs-generator/scripts/validate-bpmn.js` 检测到的错误的修正方案

## 整体结构（三阶段）

将规格书内容反映到 BPMN 的处理，由**将「判断・确定」与「机械化写入」分离**的三个阶段构成。

```
阶段1：创建 spec-to-bpmn-fixes.json      ← bpm-docs-generator 一侧（包含人工确认）
         ↓
阶段2：与规格书的差异检查・反映            ← bpm-xml-reflector 一侧（包含人工确认）
         ↓
阶段3：反映 JSON（reflectFixes()）         ← bpm-xml-reflector 一侧（本技能的职责）
```

### 阶段1：创建 `spec-to-bpmn-fixes.json`
将规格书中记载的内容（见下表）转换为机器可读的 `operation` / `params` / `targets` 格式，并输出到 `doc/<BPM流程名>-prompt/spec-to-bpmn-fixes.json`。**关于「反映什么内容」的所有判断（包括检查、向用户询问等）都必须在此阶段完成。** 尚未确定的项目（例如规格书中未定义 signal/message 的 ID 等）不得写入本文件（即也不会被反映）。

| 反映内容 | 规定详情的指南 |
|---|---|
| `.agents/skills/bpm-docs-generator/scripts/validate-bpmn.js` 错误修正方案 | `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` |
| 流程定义键（process id）替换 | `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` |
| 调用活动调用目标流程的替换 | `.agents/skills/bpm-docs-generator/reference/guide-specification.md`（调用活动章节） |
| 角色 ID・任务颜色・可选・流程变量・信号・消息 | `.agents/skills/bpm-docs-generator/reference/guide-specification.md` |
| `spec-to-bpmn-fixes.json` 的条目结构・`fixId` 命名规则・operation 受控词汇 | `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`（「`spec-to-bpmn-fixes.json` 的格式」章节） |

本阶段是 `.agents/skills/bpm-docs-generator` 一侧的职责。但存在本阶段完成后 `to-be-discussed.md` / `specification.md` / `supplement.md` 等被直接编辑、却未反映到 `spec-to-bpmn-fixes.json` 中而被搁置的情况，因此在执行 `reflectFixes()`（阶段3）之前，必须经由阶段2（下一节）。

### 阶段2：与规格书的差异检查・反映

若在创建 `spec-to-bpmn-fixes.json` 之后发生了规格变更（对待研讨事项的回答被直接追记、业务需求的追加・修改等），这些内容会未反映到 `spec-to-bpmn-fixes.json` 中而被遗留，从而产生即便执行 `reflectFixes()` 最新规格也不会反映到 BPMN 中的问题。为防止此情况，**在执行 `reflectFixes()`（阶段3）之前必须实施本阶段。**

**检查对象：**
- `doc/<BPM流程名>-prompt/to-be-discussed.md`（特别是第 3〜5 章待研讨事项的记述，以及各项目「修正方案」行的 `reflectStatus` 显示）
- `doc/<BPM流程名>-prompt/specification.md`
- `doc/<BPM流程名>-prompt/supplement.md`
- 上述内容与 `doc/<BPM流程名>-prompt/spec-to-bpmn-fixes.json` 的内容

**差异的检测模式：**

| 模式 | 检测内容 | 应对 |
|---|---|---|
| ① reflectStatus 不一致 | md 一侧已对待研讨事项追记了回答・确定的记述（例如原先为 `pending-confirmation` 的论点已确定），但对应的 `spec-to-bpmn-fixes.json` 条目的 `reflectStatus` 未更新 | 更新条目的 `reflectStatus` / `params`（例如提升为 `ready`） |
| ② 条目未创建 | md 一侧追记了新的业务需求反映事项（角色 ID・任务颜色・流程变量・信号・消息・process id 替换・调用活动调用目标替换等），但不存在对应的 `spec-to-bpmn-fixes.json` 条目 | 按照 `guide-bpmn-validation.md` 的 `fixId` 命名规则・`operation` 受控词汇追加新条目 |
| ③ 内容偏离 | 现有条目的 `params` 等与 md 一侧的最新记述不一致（值的变更・删除等） | 将条目的 `params` 更新为与 md 的内容一致 |

**步骤：**
1. 将 `spec-to-bpmn-fixes.json` 的各条目与对应的 md 记述进行核对，梳理出符合上述模式的差异。
2. 若差异为零，则可在记录该情况后进入阶段3（本阶段可跳过）。
3. 若存在差异，则针对各差异**向用户展示 fixId・变更前后的内容（`reflectStatus`/`operation`/`params`），并确认是否可以反映**（不自动反映）。
4. 仅将已获批准的差异反映到 `spec-to-bpmn-fixes.json` 中。此反映仅限于 JSON 文件的追加・更新，**绝不对 BPMN 本体进行任何写入**（对 BPMN 的写入是下一阶段（阶段3）的职责）。
5. `fixId` 命名规则・`reflectStatus` 的含义・`operation` 受控词汇・`requiresApproval` 的默认值，均遵循 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 中「`spec-to-bpmn-fixes.json` 的格式」章节（本阶段不新定义格式）。

**注意：**
- 本阶段属于「判断・确定」阶段，与阶段1（`.agents/skills/bpm-docs-generator` 一侧）相同，必须进行用户确认。这不影响 `reflectFixes()`（阶段3）一侧「不进行新的判断」这一原则。
- 由于本阶段伴随将 md 一侧的记述机械地转换为结构化数据的处理（自然语言解释），因此本阶段通过人工（或调用本技能的代理）核对来进行，不以专用脚本的自动差异检测为前提。

### 阶段3：反映 JSON（`reflectFixes()`）
读取 `spec-to-bpmn-fixes.json`，仅将 `reflectStatus: "ready"` 且对应 `operation` 的条目机械地反映到目标 BPMN 中。**专注于写入已判断・确定的内容，不进行新的判断（决定反映什么内容）。** 但 `replace-process-id` / `replace-callee-process` 的验证・重试・令牌附加，属于「写入内容是否按规格书指示得到反映」的机械化一致性验证，包含在本阶段的职责范围内。

反映逻辑实现于 `.agents/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` 中。以下是其概要及调用方法。

## `reflectFixes()` 的使用方法

在调用 `reflectFixes()` 之前，必须实施「阶段2：与规格书的差异检查・反映」，将 `spec-to-bpmn-fixes.json` 更新至最新状态。

### 调用示例

```javascript
var reflector = require('./.agents/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js');
var bpmnPath = 'doc/sample-process-prompt/sample-process.bpmn';
var fixesPath = 'doc/sample-process-prompt/spec-to-bpmn-fixes.json';

var result = reflector.reflectFixes(bpmnPath, fixesPath, {
  // 按 fix 单位的批准回调（requiresApproval: false 的条目可省略）
  onFixReflectionDetected: function (fix, onApprove, onReject) {
    // 向用户展示 fixId・operation・targets・params，并获取批准
    console.log('fixId=' + fix.fixId + ' operation=' + fix.operation);
    console.log('targets=' + JSON.stringify(fix.targets) + ' params=' + JSON.stringify(fix.params));
    // 实现示例：通过 vscode_askQuestions 获取确认
    onApprove(); // or onReject();
  }
});

console.log(result); // { applied: ['FIX-001', ...], skipped: [{ fixId, reason }, ...] }
```

- 若 `bpmnPath` 传入的不是 `doc/*-prompt/*.bpmn` 格式，将抛出异常（由 `isPromptCopyBpmnPath()` 判定）。
- 反映后，仅更新 `reflectedDate`，并覆盖保存 `fixesPath`（`reflectStatus` 为保留判定依据而不作变更）。
- 累积到 `skipped` 中的原因主要有以下 4 种：
  - `reflectStatus is not ready: ...`（`pending-confirmation` / `not-applicable`）
  - `unsupported operation (manual reflection required): ...`（`convert-event-type` / `delete-element` / `manual`）
  - `user rejected` / `approval required but no confirmation callback provided`
  - `apply failed: ...`（`replace-process-id` 等的验证失败。其他 fix 的反映会继续进行）

### 制作方判定

`reflectFixes()` 在读取 BPMN 时，会通过 `detectVendor(xml)` 根据命名空间声明自动判定制作方，并经由 `applyFixToTarget()` 将判定结果传递给各个 `applyXxx` 系列函数。根据判定结果，所赋予的属性名・元素标签名会随之切换（具体对应关系以各 `apply*` 函数・`resolveVendorName()` 的实现为准。参见「通用规则」）。

| 制作方 | 判定条件 |
|---------|---------|
| `im-bpm`（IM-BPM 制作） | 包含 `xmlns:activiti="http://activiti.org/bpmn"` |
| `igrafx`（iGrafx 制作） | 命名空间 URI 中包含 `www.igrafx.com` |
| `other`（其他） | 不符合上述任何一项 |

### operation 对应表

| operation | 反映内容 | 主要 `params` | 特别说明 |
|---|---|---|---|
| `set-attribute` | 对现有元素追加・更新属性 | `attrName`, `attrValue` | 支持任意元素・属性的通用 operation |
| `set-eventdef-ref` | 为事件定义设置 `messageRef`/`signalRef`/`errorRef` | `refType`, `refId` | 元素为自闭合标签时跳过 |
| `set-service-task-field` | 设置 ServiceTask 的 `activiti:field` 值 | `fieldName`, `fieldValue`（需同时设置多个时用 `fields: [{name, value}]`） | |
| `set-condition-expression` | 为 `sequenceFlow` 添加分支条件表达式（EL 表达式） | `expression` | |
| `set-timer-definition` | 设置 `timerEventDefinition` 的周期・日期时间・持续时间 | `timeCycle` / `timeDate` / `timeDuration`（三选一）, `businessCalendarName`（可选） | 目标元素为自闭合标签，或 `timerEventDefinition` 不存在时跳过 |
| `set-role-starter-groups` | 为 `process` 设置 `candidateStarterGroups` | `roleId` | target 为 process |
| `set-lane-candidate-groups` | 为 `lane` 设置 `candidateGroups` | `roleId` | target 为 lane |
| `set-usertask-candidate-groups` | 为 `userTask` 设置 `candidateGroups`・`isOptional` | `roleId`, `isOptional`（可选） | target 为 userTask |
| `set-task-color` | 设置任务的背景色 | `taskType` | 根据 `taskType` 自动决定颜色代码（参见下文颜色映射表） |
| `add-data-object` | 为 `process` 添加流程变量（`dataObject`） | `variables: [{ id, name, type }]` | target 为 process。已存在的 id 将跳过（幂等） |
| `add-signal` | 新增 `signal` 元素 | `id`, `name` | 若规格书中 ID 未定义，则不写入本文件（即不进行反映）。已存在的 id 将跳过（幂等） |
| `add-message` | 新增 `message` 元素 | `id`, `name` | 同上 |
| `replace-process-id` | 替换流程定义键（process id）。伴随验证（最多重试 2 次）・附加 `PROCESS_KEY_META` 令牌 | `fromId`（用于确定替换对象）, `toId`（替换值）, `allowFromIdExists`（可选） | 破坏性操作。必须设置 `requiresApproval: true`，在机械反映时（本阶段）也需要获取批准 |
| `replace-callee-process` | 替换 callActivity 的调用目标流程（`calledElement`）。伴随附加 `CALLEE_PROCESS_META` 令牌 | `fromId`（替换前的 `calledElement` 值）, `toId`（替换后的值） | target 为 callActivity。破坏性操作。必须设置 `requiresApproval: true` |

`convert-event-type` / `delete-element` / `manual`（伴随结构变更・删除・图形信息同步的操作）不在自动反映的范围内，`reflectFixes()` 会跳过这些条目（交由人工处理或另行处理。详情参见 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 中「设计上的约束」章节）。

### `targets` 的指定规则

- 以现有元素为对象的 operation（`set-attribute` 系列、`set-role-starter-groups` 系列、`replace-callee-process` 等），需通过 `targets: [{ elementId, elementType }]` 指定对象元素的实际 ID。
- 由于 `replace-process-id` 是改写对象 process 自身的 `id`，因此使用 `params.fromId` 来确定替换对象（可以附加 `targets`，但实际反映处理中不会引用它）。
- 像 `add-signal` / `add-message` 这类发行新 ID 的 operation，由于并非引用现有元素，需以 `targets: [{ elementId: <新发行的 id>, elementType: 'bpmn:Signal' | 'bpmn:Message' }]` 的形式记载与 `params.id` 相同的值（出于一览性・可追溯性考虑）。
- **`add-data-object` 的 `targets.elementId` 引用 process 自身的 `id`（processId）。** 若同一个 `spec-to-bpmn-fixes.json` 中存在以该 process 为对象的 `replace-process-id` 条目，则 `add-data-object` 的 `targets.elementId` 必须指定**替换后的值（`toId`）**。由于 `reflectFixes()` 是按顺序从头开始应用 fixes 数组的，一旦 `replace-process-id` 先被反映、process 的 `id` 被改写后，若 `targets.elementId` 指定的是替换前的值（`fromId`），将找不到对象 process，并会以 `[SKIP] process not found: <fromId>` 被跳过（注意这不会作为异常抛出，也不计入 `applied` 或 `skipped`，是一种静默跳过）。今后新增以 process 自身为 target 的 operation 时，也需注意同样的问题。

  | fixes.json 内的排列顺序 | `add-data-object` 的 `targets.elementId` 应指定的值 |
  |---|---|
  | 不包含 `replace-process-id`（不发生 process id 替换） | 当前的 process id（不变） |
  | 同时包含 `replace-process-id` | 替换后的值（`toId`）。指定替换前的值（`fromId`）会被静默跳过 |

### 任务种类与 color 值的对应关系

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

### 通用规则

- 属性・元素已存在时将跳过（幂等）。`replace-process-id` / `replace-callee-process` 同样会根据已嵌入的 `PROCESS_KEY_META` / `CALLEE_PROCESS_META` 令牌的有无进行判定，即使重复执行同一 fix 也不会造成重复反映。
- 同样支持 `<bpmn:process>` 等带命名空间前缀的写法。
- 由于制作方的判定・属性名/标签名的切换均在 `reflectFixes()` 内部自动进行，调用方无需关心。属性名・标签名在各制作方之间具体如何变化，以各 `apply*` 函数（`bpmn-specs-reflector.js`）・`resolveVendorName()` / `detectVendor()`（`bpmn-reflector-utils.js`）的实现及 JSDoc 为准（本文件不重复维护）。

## `applyFixToTarget()` 调用的主要函数

| 函数 | 作用 |
|------|------|
| `detectVendor(xml)` | 根据命名空间声明判定制作方（`'im-bpm'` / `'igrafx'` / `'other'`） |
| `applyProcessCandidateStarterGroups(xml, processId, roleId, vendor)` | `set-role-starter-groups` 的反映主体 |
| `applyLaneCandidateGroups(xml, laneId, roleId, vendor)` | `set-lane-candidate-groups` 的反映主体 |
| `applyUserTaskCandidateGroups(xml, taskId, roleId, vendor)` | `set-usertask-candidate-groups` 的反映主体（`candidateGroups` 部分） |
| `applyIsOptional(xml, taskId, vendor)` | `set-usertask-candidate-groups` 的反映主体（仅当 `params.isOptional` 为 true 时） |
| `applyTaskColor(xml, taskId, taskType, vendor)` | `set-task-color` 的反映主体 |
| `applyAttribute(xml, elementId, attrName, attrValue)` | `set-attribute` 的反映主体。与现有 `apply*` 系列不同，会覆盖值 |
| `applyEventDefinitionRef(xml, elementId, refType, refId)` | `set-eventdef-ref` 的反映主体 |
| `applyServiceTaskField(xml, taskId, fieldName, fieldValue)` | `set-service-task-field` 的反映主体 |
| `applyTimerDefinition(xml, ownerId, params)` | `set-timer-definition` 的反映主体 |
| `applyDataObjects(xml, processId, variables, vendor)` | `add-data-object` 的反映主体 |
| `applyConditionExpression(xml, flowId, expression, vendor)` | `set-condition-expression` 的反映主体 |
| `applySignal(xml, signalId, signalName, vendor)` | `add-signal` 的反映主体 |
| `applyMessage(xml, messageId, messageName, vendor)` | `add-message` 的反映主体 |
| `applyCalleeProcessReplacement(xml, callActivityId, fromId, toId)` | `replace-callee-process` 的反映主体。覆盖 `calledElement` 属性并附加 `CALLEE_PROCESS_META` 令牌 |
| `applyVerifiedProcessIdReplacements(xml, replacements)` | `replace-process-id` 的反映主体。在内存中完成替换・验证（最多重试 2 次）・附加 `PROCESS_KEY_META` 令牌（不进行文件写入） |
| `applyFixToTarget(xml, fix, target, vendor)` | 根据 `fix.operation` 分派到上述各函数（`replace-process-id` / `replace-callee-process` 在 `reflectFixes()` 内部单独处理） |
| `reflectFixes(bpmnPath, fixesPath, options)` | 本文件的主 API。汇总执行以上内容 |
| `replaceProcessId(xml, fromId, toId)` | 替换 Process ID（同时替换 `<process id>` 与 `<participant processRef>`） |
| `extractRepositoryObjectId(xml)` | 获取 `<bpmn:definitions>` 所持有的 `ixbpmn:repositoryObjectID` 属性值（仅限 iGrafx 制作的 BPMN。不存在时返回 `null`） |
| `applyProcessKeyMetaToken(xml, fromId, toId)` | 在 `<process id="toId">` 中以 documentation 的形式添加 `PROCESS_KEY_META` 令牌 |
| `verifyProcessIdReplacements(xml, replacements)` | 验证 process id 替换的 from-to 与反映后 BPMN 是否一致（核对 `process@id` 与 `participant@processRef`） |
| `checkProcessIdReplaced(bpmnPath, replacements)` | 判定 Process ID 替换是否已经反映（`replaced` / `not_replaced` / `partial`）。用于阶段1的检查（参见 `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`） |

## PROCESS_KEY_META / CALLEE_PROCESS_META 令牌的格式

`process@id` 替换后，在 process 标签中以以下格式的令牌追加为 documentation（保留现有记述）。

```
PROCESS_KEY_META:{REPOSITORY_OBJECT_ID=<repositoryObjectId 的值>;ORIGINAL_PROCESS_KEY=<原 process_id>;PROCESS_KEY=<编号后的 process_id>};
```

- 若已存在 `<documentation>`（或 `<bpmn:documentation>`）元素，且 `PROCESS_KEY_META` 令牌尚未定义，则在该已有元素内追加令牌（不新增元素）。
- 若不存在 documentation 元素，则根据制作方判定（`detectVendor()`）结果以相应的标签名新增元素：IM-BPM 制作使用 `<bpmn:documentation>`，其他（iGrafx 制作・其他）使用 `<documentation>`。
- 若 `PROCESS_KEY_META` 令牌已存在，则为避免重复添加而跳过。
- `REPOSITORY_OBJECT_ID` 并非对象 process 的属性，而是引用 **`<bpmn:definitions>`（文件根元素）所持有的 `ixbpmn:repositoryObjectID` 属性值**（仅限 iGrafx 制作 BPMN 的属性）。
- 若 `<bpmn:definitions>` 中不存在 `ixbpmn:repositoryObjectID` 属性，则**作为错误中断处理**（完全不对目标 `.bpmn` 进行写入）。此中断是独立于验证重试的失败条件，不进行重试。

替换 callActivity 的调用目标流程后，将以以下格式的令牌作为 documentation 追加到 callActivity 正下方。

```
CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<calledElement 替换前的值>;CALLEE_PROCESS=<替换后的值>;REPLACED_DATE=yyyy-MM-dd;
```

- 若已有 documentation 元素则在其中追加，若没有则新增（规则与 `PROCESS_KEY_META` 相同）。
- 若令牌已存在，则为避免重复添加而跳过。

## 验证失败时的处理（`replace-process-id` / `replace-callee-process`）

- 若 `replace-process-id` 的验证（相当于 `verifyProcessIdReplacements()`）失败，最多自动重试 2 次。若重试后仍失败，则仅将该 fix 累积到 `skipped` 中，其他 fix 的反映继续进行。
- 若无法获取 `REPOSITORY_OBJECT_ID`（例如 iGrafx 制作的 BPMN 中不存在 `ixbpmn:repositoryObjectID` 属性等），则作为独立于验证重试的失败条件立即报错，完全不对目标 `.bpmn` 进行写入。

## 例外：禁止重新替换

对于已判定为已替换的 process，不得进行新编号。必须始终重复使用现有的键。此判定在阶段1（创建 `spec-to-bpmn-fixes.json`）中使用 `checkProcessIdReplaced()` 等方法进行（详情参见 `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`）。

- 现有键的获取来源：
  - 从 documentation 令牌中提取 `PROCESS_KEY=<key>`
