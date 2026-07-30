# 流程定义键（process id）置换指南

为避免源自 iGrafx 的 BPMN 中 process id 重复，定义面向 IM-BPM 导入的 process id 采番・管理机制。

**基本方针**：
- 在规格书创建阶段（bpm-docs-generator），仅进行置换状态的判定与置换方案的提示。
  - BPMN 的 ID 置换，在收到将规格书内容反映到 BPMN 的请求时，利用 bpm-xml-reflector 的技能集实施。
- 首次置换后复用既有的键。为防止错误的新采番，已置换信息将持久保存在规格书与 BPMN 中。

## 适用范围
- BPMN 文件生成时的 process id（= IM-BPM 的流程定义键）
- 置换对象**仅限 process id**，不变更流程要素 ID・顺序 ID・DI 要素 ID。

## 检查实现
BPMN 文件的 ID 值・置换状态检查与获取的实现，使用以下脚本。

- `.github/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- 执行示例：`{{RUNTIME}} .github/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn> --json`

之后的判定・一致性确认，原则上基于该脚本的输出进行。不得手动重新实现同等逻辑进行判定。


## 处理流程

### Step 1: 确认既有 ID
- 比较输入源 BPMN 文件（`doc/*.bpmn`）、规格书（`to-be-discussed.md`）、复制目标 BPMN 文件（`<BPM流程名>-prompt/*.bpmn`）的 ID，决定之后的处理。
  - 无需 ID 置换提案，可结束处理流程的情况。
    - 输入源 BPMN、规格书、复制目标 BPMN 的各 ID 一致时。
    - 复制目标 BPMN 中未反映置换 ID，且输入源 BPMN 与规格书的各 ID 一致时。
  - 判定为 Step 2：首次采番的情况
    - 不存在 `<BPM流程名>-prompt` 目录时
    - 存在规格书但未记载 ID 置换方案，且复制目标 BPMN 中未反映 ID 时。
  - 判定为 Step 3：追加采番的情况
    - 输入源 BPMN、规格书、复制目标 BPMN 的既有各 ID 一致，但输入源 BPMN 中存在新的 ID 时。
  - 判定为 Step 4：规格书订正的情况
    - 规格书与复制目标 BPMN 的既有各 ID 一致，但置换后 ID 不同时。
  - 判定为 Step 5：需确认的情况
    - 输入源 BPMN、规格书、复制目标 BPMN 之间的各 ID 存在不一致时。Step 2～Step 4 的情况除外。

**输入源 BPMN 文件与复制目标 BPMN 文件，应各自执行 validate-process-key-replacement.js 以获取 ID 值・置换状况**

**复制目标 BPMN 参照 `documentation` 的 `PROCESS_KEY_META` 中 `ORIGINAL_PROCESS_KEY` 的值。**

### Step 2: 首次采番
依据**采番规则**提示 ID 置换方案并记载至规格书。记载后，本处理流程结束。

### Step 3: 追加采番
对追加部分的 ID，依据**采番规则**提示 ID 置换方案并追记至规格书。记载后，本处理流程结束。

### Step 4: 规格书订正
报告复制目标 BPMN 与规格书的置换后 ID 不同。确认后，以复制目标 BPMN 的置换后 ID 订正规格书的记载。订正后，本处理流程结束。
※ 由于流程定义键（置换后 ID）是在 IM-BPM 上特定 BPM 的唯一键，因此判定以复制目标 BPMN 一侧为准。

### Step 5: 需确认
报告 ID 存在不一致，并请求关于 ID 采番方针的处理指示。


**采番规则**
- 置换后的键应为「与作为来源的 BPMN 文件・流程相关的 ID」。
- 推荐的键格式为 `<processSlug>_<serial>`。
  - `processSlug`：将流程名或原 process id 规范化后的标识符（仅限英数字・`_`・`-`・`.`，首字符为英文字母或 `_`）
  - `serial`：4 位以上的连号（例：`0001`、`0002`、…）
- 例：`vehicle_purchase_0001`、`daily_check_0001`、`expense_approval_0001`


## 记载至规格书

### 置换提案在待讨论事项中的记载
在规格书创建阶段，作为**置换提案**，在 `to-be-discussed.md` 的「2. 流程定义键置换履历」章节中记载以下信息。（格式参见流程定义键置换履历的记载模板）

- 对象流程
- 原 process id
- 置换候选的 process id
- 提案日

### 流程定义键置换履历的记载模板

#### 置换提案（<对象流程名>）

| 项目 | 值 |
|------|-----|
| 对象流程 | <流程名>（根据需要补充 ID） |
| 原流程定义键 | <originalProcessDefinitionKey> |
| 置换后的流程定义键 | <processDefinitionKey> |
| 提案日 | <YYYY-MM-DD> |
| 反映日 | <YYYY-MM-DD 或 未反映> |


**记述流程定义键置换履历时的注意事项**
- 面向最终用户，不得记载 `status` / `errors` / `warnings` / `none` 等内部判定值。
- 在规格书创建阶段，应作为「置换提案（候选）」记载，不可断定为已实施。
- 在规格书创建阶段，`反映日` 应记载为 `未反映`。
- 在 BPMN 反映阶段实施置换后，应将 `反映日` 更新为实施日。
- 不得记载如 `反映日: YYYY-MM-DD` 这样位于表外的独立文本（必须作为表内的行记载）。
- 应为各置换流程创建独立的子章节。
- 多个流程为置换对象时，应分开记载。
- 原键与置换后的键必须成对明确记载，禁止只记载其中一方。

**关于向 BPMN 文件反映 ID 置换方案**
- 反映时的既有键复用・例外时的处理・记录更新，以 bpm-xml-reflector 的 `.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 为准。
