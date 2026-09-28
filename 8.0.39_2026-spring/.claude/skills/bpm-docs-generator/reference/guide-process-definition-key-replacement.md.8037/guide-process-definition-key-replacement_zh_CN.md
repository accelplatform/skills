# 流程定义键（process id）替换指南

为避免源自 iGrafx 的 BPMN 出现 process id 重复问题，本文档定义了面向 IM-BPM 导入的 process id 编号与管理机制。

**基本方针**：
- 仅当加载的 BPMN 文件为 iGrafx 制作时才执行本流程。
- 在规格书制作阶段（bpm-docs-generator），仅进行替换状态的判定与替换方案的提示。
  - BPMN 的 ID 替换，将在收到把规格书内容反映到 BPMN 的请求时，使用 bpm-xml-reflector 技能集来执行。
  - 一旦确定替换方案（from-to），除记载到 `to-be-discussed.md` 外，需在同一时间点将其作为 `operation: "replace-process-id"` 的条目输出到 `spec-to-bpmn-fixes.json` 中（详情参见「输出到 `spec-to-bpmn-fixes.json`」一节）。向 BPMN 的实际反映由 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 以 `spec-to-bpmn-fixes.json` 作为唯一输入来执行。
- 首次替换后，需复用已有的键。为防止错误的重新编号，替换完成的信息需在要探讨事项和 BPMN 内永久保留。

## 适用范围
- BPMN 文件生成时的 process id（= IM-BPM 的流程定义键）
- 替换对象**仅限 process id**，流程元素 ID、序列 ID、DI 元素 ID 不做变更。

## 检查实现
BPMN 文件的 ID 值、替换状态检查及获取的实现，使用以下脚本。

- `.claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- 执行示例：`{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn>`（结果始终以 JSON 格式返回）

## 处理流程

### Step 1：获取 ID

- 输入源 BPMN（`doc/<BPM流程名>.bpmn`）
  - `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <输入源BPMN文件>`
- 要探讨事项（`to-be-discussed.md`）
  - 从第 2 章「流程定义键替换履历」中获取各流程的「原流程定义键」与「替换后流程定义键」。
- 复制目标 BPMN（`<BPM流程名>-prompt/<BPM流程名>.bpmn`）
  - `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <复制目标BPMN文件>`

- **对输入源 BPMN 文件和复制目标 BPMN 文件，分别执行 validate-process-key-replacement.js 以获取 ID 值和替换状态**

- **对于复制目标 BPMN，需参照 `documentation` 中 `PROCESS_KEY_META` 的值。**
  - `PROCESS_KEY_META` 的格式及嵌入处理详情以 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 为准。


### Step 2：确认现有 ID
- 将 Step 1 中获取的结果按流程逐一比较，以此决定后续处理。
  | 类别 | `输入源BPMN` | `要探讨事项` | `复制目标BPMN` |
  |------|-----|-----|-----|
  | 替换前定义键 | processId | 原流程定义键 | originalProcessKey |
  | 替换后定义键 | 无 | 替换后流程定义键 | processKey（或 processId）|

- 无需提出 ID 替换方案，可将处理流程视为结束的情形。
  - `输入源BPMN`、`要探讨事项`、`复制目标BPMN` 各流程的「替换前定义键」一致，且 `要探讨事项` 与 `复制目标BPMN` 各流程的「替换后定义键」一致时。
  - `复制目标BPMN` 的「替换后定义键」未定义，且 `输入源BPMN` 与 `要探讨事项` 的「替换前定义键」一致时。
- Step 3：判定为首次编号的情形
  - 不存在 `<BPM流程名>-prompt` 目录时
  - `要探讨事项` 中未记载 ID 替换方案，且 `复制目标BPMN` 的「替换后定义键」未定义时。
- Step 4：判定为追加编号的情形
  - `输入源BPMN`、`要探讨事项`、`复制目标BPMN` 中已有流程的各定义键一致，但 `输入源BPMN` 中存在新的「替换后定义键」时。
- Step 5：判定为要探讨事项订正的情形
  - `要探讨事项` 与 `复制目标BPMN` 的「替换前定义键」一致，但「替换后定义键」不同时。
- Step 6：判定为需要确认的情形
  - `输入源BPMN`、`要探讨事项`、`复制目标BPMN` 之间存在定义键不一致的情形。但排除 Step3～Step5 所涵盖的情形。

### Step 3：首次编号
- 依据**编号规则**提出 ID 替换方案并记载到要探讨事项中。同时也输出到 `spec-to-bpmn-fixes.json`（参见「输出到 `spec-to-bpmn-fixes.json`」）。记载完成后，本处理流程结束。

### Step 4：追加编号
- 针对新增部分的 ID，依据**编号规则**提出 ID 替换方案并追记到要探讨事项中。同时也追记到 `spec-to-bpmn-fixes.json`。记载完成后，本处理流程结束。

### Step 5：要探讨事项订正
- 报告复制目标 BPMN 与要探讨事项中的替换后 ID 不一致。确认后，以复制目标 BPMN 的替换后 ID 为准订正要探讨事项的记载。`spec-to-bpmn-fixes.json` 中对应条目也订正为相同的值。订正完成后，本处理流程结束。
- ※由于流程定义键（替换后 ID）是在 IM-BPM 上标识 BPM 的唯一键，故以复制目标 BPMN 一侧为准。

### Step 6：需要确认
- 报告存在 ID 不一致的情况，并请示 ID 编号方针的应对指示。

**编号规则**
- 替换后的键须为「与原始 BPMN 文件・流程相关联的 ID」，且不超过 44 个字符。
- 键的格式推荐采用 `<processSlug>_<serial>`。
  - `processSlug`：将流程名或原 process id 规范化后的标识符（仅限英数字、`_`、`-`、`.`，开头须为英文字母或 `_`）
  - `serial`：4 位以上的连续编号（例：`0001`、`0002`……）
- 示例：`vehicle_purchase_0001`、`daily_check_0001`、`expense_approval_0001`

## 记载到要探讨事项

### 将替换方案记载到要探讨事项
在规格书制作阶段，需将以下信息作为**替换方案**记载到 `to-be-discussed.md` 的「2. 流程定义键替换履历」一节中。（格式参见流程定义键替换履历记载模板）

- 目标流程
- 原 process id
- 候选替换 process id
- 提案日期

### 流程定义键替换履历记载模板

#### 替换方案（<目标流程名>）

| 项目 | 值 |
|------|-----|
| 目标流程 | <流程名>（如有需要可补充 ID） |
| 原流程定义键 | <originalProcessDefinitionKey> |
| 替换后流程定义键 | <processDefinitionKey> |
| 提案日期 | <YYYY-MM-DD> |
| 反映日期 | <YYYY-MM-DD 或 未反映> |


**记述流程定义键替换履历时的注意事项**
- 面向最终用户时，不得记载 `status` / `errors` / `none` 等内部判定值。
- 在规格书制作阶段，需记载为「替换方案（候选）」，不得断定为已经实施。
- 在规格书制作阶段，`反映日期` 应记载为字面值「未反映」。
- 若在 BPMN 反映阶段实施了替换，需将 `反映日期` 更新为实施日期。
- 不得记载表格外的独立文本，例如 `反映日期: YYYY-MM-DD`（必须作为表格内的一行记载）。
- 需为每个替换流程创建独立的子章节。
- 若有多个流程为替换对象，需分别记载。
- 原键与替换后的键必须成对明确记载，禁止仅记载其中一方。

### 输出到 `spec-to-bpmn-fixes.json`

在 Step 3～Step 5 中确定的替换方案（from-to），需在记载到 `to-be-discussed.md` 的同一时间点，也输出到 `doc/<BPM流程名>-prompt/spec-to-bpmn-fixes.json` 中。条目结构、命名规则、`operation` 受控词汇以 `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 的「`spec-to-bpmn-fixes.json` 的格式」为准，本节仅说明 process id 替换特有的指定内容。

```json
{
  "fixId": "PID-001",
  "reflectStatus": "ready",
  "operation": "replace-process-id",
  "targets": [
    { "elementId": "<原process id（fromId）>", "elementType": "bpmn:Process" }
  ],
  "params": {
    "fromId": "<原process id>",
    "toId": "<替换后的process id>"
  },
  "requiresApproval": true,
  "reflectedDate": "未反映"
}
```

- `fixId` 应为 `PID-<3位以上连续编号>`（参见 `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 的命名规则）。
- `params.fromId` 用于确定替换对象，`params.toId` 为被反映的替换值。两者必须成对指定。
- 仅在反映后允许 `fromId` 保留的情形（例如不存在 `<participant processRef>` 的结构等）下，才附加 `params.allowFromIdExists: true`。
- `requiresApproval` 始终为 `true`（因为这是破坏性操作）。审批在 BPMN 反映阶段（执行 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 时）进行。
- 若在 Step 5（要探讨事项订正）中订正了 `to-be-discussed.md` 的记载，也需将对应的 `spec-to-bpmn-fixes.json` 条目中的 `params.toId` 订正为相同的值。
- `reflectedDate` 应保持输出为字面值「未反映」，实际的反映日期时间由 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 在反映后更新（本步骤不进行更新）。

**关于将 ID 替换方案反映到 BPMN 文件**
- 反映时对既有键的复用、异常情况的处理、记录的更新，以 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 为准。
