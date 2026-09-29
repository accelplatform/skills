# BPMN 语法・引用完整性验证指南

定义在读取 BPMN 文件后立即执行的「BPMN 语法・引用完整性验证」的具体步骤与记载规则。

## 目的
及早发现 BPMN 2.0 XML 中的记法缺陷、引用失效、与图形信息对应不一致等问题，并判断是否可以进入规格书创建（step.4）阶段。

## 执行步骤（必需）

**使用脚本：** `.claude/skills/bpm-docs-generator/scripts/validate-bpmn.js`

```sh
# 基本
{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules .claude/skills/bpm-docs-generator/scripts/rules-validate-default.json
# 指定附加规则时
{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules <rules.json>
```

**退出代码：** 0 = 成功（仅有 warning 或无）／ 1 = 失败（存在 error）

**`--rules <rules.json>` 的使用场合：**
- 除标准的语法・引用完整性检查外，若希望追加验证业务特有的规则（例如：根据 `activiti:type` 不同而必填项目・格式各异的 `ServiceTask`（邮件任务・工作流启动任务等）的字段验证），可指定此参数。
- 若存在 `doc/rules-validate.json`，则优先使用该文件；不存在时使用 `scripts/rules-validate-default.json`。新增验证观点时，应严格按照 `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation-rules.md` 的规格创建・更新 `doc/rules-validate.json`。
- 基于 `rules.json` 的验证结果同样是 validate-bpmn.js 的直接输出，因此应与本指南的 ERROR/WARN 记载规则同等处理（在保留 `[input(<id>)]` 上下文信息的前提下整理）。


**执行顺序（读取 BPMN 文件后必须立即执行）：**
1. 执行 validate-bpmn.js。
   - 验证观点：命名空间一致性（`xmlns:bpmn`, `xmlns:bpmndi`）・连接源/连接目标一致性・与图形配置的对应一致性・startEvent/endEvent 的存在性
2. 对验证结果进行详细分析。
   - **执行错误分类**
     - 不要仅凭查看各条错误就试图判断其为「实际问题」还是「工具误检测」。
     - 确认以下信息后再进行判断：
       - BPMN XML 中相应要素的实现状况（输出示例：是否存在 `<bpmn:startEvent id="...">`）
   - **执行重要度判定**
     - 仅分类为「错误」「警告」是不够的。
     - 需确认是否实际影响 IM-BPM 导入或流程执行。
     - 即使没有影响，也应从运营・可维护性的角度重新评估重要度。
   - **深入挖掘原因候选**
     - 确认工具输出规格（若为 iGrafx，需确认版本・导出设置）
     - 与类似流程进行比较（同样的错误是否存在于其他流程中）
   - **执行影响分析**
     - 重视「是否影响规格书创建」。
     - 也应考虑对实现・测试阶段的潜在影响。
     - 即使判断为「可以忽略」，也应明确记载理由。
3. 将验证结果反映到 to-be-discussed.md 中。
4. 判断是否可以进入 step.4。

**注意事项**
- validate-bpmn.js 中未实现的观点，不得记载于 BPMN 语法・引用完整性验证结果中。
- 不得执行 validate-bpmn.js 中不存在的新语法检查、引用检查、标准合规性检查等。
- 此外，对于 validate-bpmn.js 中不存在的检查，不得执行本指南所述的详细分析。
- 不应仅是转录错误日志，而应记载使使用者能够理解接下来应采取何种应对的内容。

### 详细分析的指导方针

#### 重要度判定基准
应根据以下基准对各错误赋予重要度（高/中/低）。

| 重要度 | 判定基准 | 判定示例 | 输出方针 |
|--------|---------|--------|----------|
| **高** | 直接对流程执行产生不良影响、IM-BPM 导入失败的可能性高、业务流程本身无法成立 | 开始/结束事件不足、无效引用、死锁结构 | **单独起票** |
| **中** | 导入成功但流程执行时会出现警告/错误、实现时需要额外工作 | 非标准记法、属性值含糊不清 | **单独起票** |
| **低** | 对规格化・实现・运营无直接影响，仅从未来可维护性提升角度建议改进 | 工具误检测、未使用的资源定义、非正式的关联 | **仅计入汇总件数，不单独起票** |


#### 根本原因分析的指导方针
应从以下角度对各错误推测根本原因，并提出多个方案。

1. **设计阶段的错误**
   - 对 BPMN 规范理解不足
   - 对需求或业务流程理解有误
   - 工具操作失误

2. **编辑・反映阶段的错误**
   - 局部修改时遗漏更新引用
   - 复制/粘贴后遗漏指定引用目标
   - 合并/重构时遗漏要素对应关系

3. **工具生成规格的限制**
   - BPMN 编辑工具（iGrafx 等）输出规格的限制
   - 版本依赖的记法差异
   - 导出时的非标准输出

4. **解析器/验证工具的实现局限**
   - 要素类型识别不支持
   - 引用检查范围的限制
   - 嵌套结构处理的遗漏

#### 影响分析的指导方针
应从以下角度对各错误分析其影响。

| 观点 | 分析要点 |
|------|------------|
| **流程执行** | 流程执行时是否发生错误/警告、是否会死锁、是否影响执行结果 |
| **IM-BPM 导入** | 是否导致导入失败、是否仅为警告、是否可忽略后继续进行 |
| **规格化** | 是否影响规格书创建、说明是否会变得含糊、是否存在误解的可能性 |
| **实现** | 脚本实现时是否需要额外工作、测试时是否会出现问题 |
| **运营** | 运营时的维护是否变得困难、是否需要用户支持 |

#### 详细分析的限制
- 详细分析仅用于将 validate-bpmn.js 的输出分类为「实际 BPMN 的问题」或「验证工具实现局限导致的误检测」，并据此补充重要度・原因候选・影响・应对方针。

## 验证结果的记载规则

### BPMN 记法错误
- **定义：** 指 XML 语法缺陷、引用失效、命名空间不一致、图形引用不一致等，可通过 BPMN 规范・引用完整性客观判定的问题。
- **VAL 系 ID 的赋予条件：** 仅赋予与 validate-bpmn.js 的 ERROR / WARN 一一对应、或将同一原因的同类日志汇总整理后的结果。
- **进一步细分：**
  - **实际 BPMN 的问题（需要应对）**：对流程执行产生不良影响、或在 IM-BPM 导入时很可能出错的问题。
    - 例如：开始/结束事件不足、必需属性缺失、无效引用、流程结构矛盾
  - **验证工具实现局限导致的误检测（可忽略）**：实际 BPMN XML 本身是正确的，但验证工具无法识别该要素。
    - 例如：工具已知集合（known set）中不存在的要素类型的引用检查失败、解析器限制导致的误检测
- **应对方针：**
  - 实际 BPMN 的问题（重要度「高」或「中」）：明确可机械修正的范围，并具体记载修正步骤或修正候选方案。
  - 实际 BPMN 的问题（重要度「低」）：不单独起票，仅计入汇总件数。
  - 验证工具误检测：不单独起票。仅计入汇总中的「工具实现局限导致的误检测」件数。
- **禁止事项：** 不得将 validate-bpmn.js 中不存在的自定义检查结果作为 VAL-ERR / VAL-WARN 起票。
  - 但 iGrafx 特有要素兼容性检查（参见 `.claude/skills/bpm-docs-generator/reference/guide-specification.md` 「参照的 BPMN 为 iGrafx 制作时必须执行」）并非源自 validate-bpmn.js，因此可赋予 `IGX-<连号>`，作为独立于 VAL 系的另一类别记载于第 1 章。


## to-be-discussed.md 的记载模板

### 错误 ID
 - 对于 validate-bpmn.js 直接输出的 ERROR / WARN，赋予 VAL-ERR-＜连号＞ / VAL-WARN-＜连号＞。

### 「BPMN 语法・引用完整性验证」用模板结构
```md
### <章节名>

#### <错误ID>. <种类>: <对象要素名>

- **对象要素**: <要素名>（<要素类型> / <泳道名> / <前后要素名等>）
- **重要度**: 高|中|低
- **问题内容**: <将验证结果的错误类型用通俗易懂的方式记载>
- **原因候选**:
  1. 可能是<原因候选1>。
  2. 可能是<原因候选2>。
  3. 可能是<原因候选3>。
- **影响**: <按观点分别记载对规格化・实现・运营的影响>
- **应对方针**: <具体的修正步骤或改进方案>
- **订正方案**: 参见 `spec-to-bpmn-fixes.json`（reflectStatus: <ready|pending-confirmation|not-applicable>）
```

#### 关于「应对方针」
- 「应对方针」最终必须归结为以下之一：
  - ✅ **可立即修正**：明确记载修正步骤
  - ❓ **需要确认需求**：明确记载确认问题
  - ⏭️ **导入后处理**：明确记载导入时点的处理方式，并说明搁置理由

#### 关于订正方案（机器可读）
- 订正方案的机器可读数据不应嵌入 `to-be-discussed.md` 正文，而应输出到同一 `<BPM流程名>-prompt/` 目录下的 **`spec-to-bpmn-fixes.json`** 中。
  - `to-be-discussed.md` 正文中仅记载上述模板中的「订正方案」行（指向 `spec-to-bpmn-fixes.json` 的引用 + 当前的 `reflectStatus`）。
  - 对于单独起票的错误（重要度「高」或「中」），必须在 `spec-to-bpmn-fixes.json` 中添加相应条目。重要度「低」・验证工具误检测则不添加。
  - `to-be-discussed.md` 与 `spec-to-bpmn-fixes.json` 应在同一生成时机同时输出，以避免 `fixId` 的对应遗漏或错位。
- `spec-to-bpmn-fixes.json` 是供 `.claude/skills/bpm-xml-reflector` 的脚本机械化读写、用于管理是否可反映到 BPMN、反映内容及反映结果的文件。`to-be-discussed.md` 正文中「禁止仅以 ID 单独识别」的规则不适用于此文件，此文件中必须记载 `elementId`（BPMN 的实际 ID）。
- **`spec-to-bpmn-fixes.json` 并非仅供本节错误订正方案专用的文件。** 角色ID・任务颜色・可选性・流程变量・信号・消息・流程定义键替换・调用活动调用目标替换等规格书中记载的业务需求反映内容，也应以相同格式输出到同一文件中（详情参见 `.claude/skills/bpm-docs-generator/reference/guide-specification.md`、`.claude/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`）。对 BPMN 的反映由 `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 以此文件为唯一输入机械化执行。

##### `spec-to-bpmn-fixes.json` 的格式

- 格式：JSON 数组。每 1 个反映单位（1 个错误 ID，或 1 项业务需求反映事项）对应 1 个条目。
- 输出位置：`doc/<BPM流程名>-prompt/spec-to-bpmn-fixes.json`
- 条目结构：
```json
[
  {
    "fixId": "<遵循下述命名规则的 ID>",
    "reflectStatus": "ready | pending-confirmation | not-applicable",
    "operation": "<从下表的受控词汇表中选择。若无自动反映手段则使用 manual>",
    "targets": [
      { "elementId": "<对象要素的实际 ID>", "elementType": "<BPMN 要素类型（例如：bpmn:ServiceTask）>" }
    ],
    "params": {},
    "requiresApproval": true,
    "reflectedDate": "未反映"
  }
]
```

- `fixId` 的命名规则：
  - `validate-bpmn.js` 的错误订正方案：直接使用验证工具输出的错误 ID（连号）。
  - 业务需求反映（不与 validate-bpmn.js 的错误关联的条目）：采用 `<类别前缀>-<3位以上连号>` 的格式。类别前缀如下所示。

    | 类别前缀 | 对应 operation |
    |---|---|
    | `ROLE-` | `set-role-starter-groups` / `set-lane-candidate-groups` / `set-usertask-candidate-groups` |
    | `COLOR-` | `set-task-color` |
    | `VAR-` | `add-data-object` |
    | `SIG-` | `add-signal` |
    | `MSG-` | `add-message` |
    | `PID-` | `replace-process-id` |
    | `CALLEE-` | `replace-callee-process` |

- `reflectStatus` 必须与「应对方针」的分类严格对应。各值的含义及反映可否如下所示。

  | 应对方针 | reflectStatus | 反映可否 |
  |---|---|---|
  | ✅ 可立即修正 | `ready` | 当前为反映对象（破坏性操作仍需另行获得用户批准） |
  | ❓ 需要确认需求 | `pending-confirmation` | 不可反映。待需求确认的回答确定后更新为 `ready` |
  | ⏭️ 导入后处理 | `not-applicable` | 当前不作为反映对象（不自动反映） |

  业务需求反映（角色ID・信号・消息等）也应同样对应处理。特别是当信号・消息的 ID 在规格书中尚未定义时，不应创建该条目本身（不应作为 `pending-confirmation` 写出空的 `params.id`，而应在确定后再添加）。

- `operation` 应从以下受控词汇表中选择。若不存在对应的反映处理，则必须设为 `manual`，并保持 `requiresApproval` 为 `true`（`params` 可省略）。

  | operation | 说明 | 主要 `params` |
  |---|---|---|
  | `set-attribute` | 对现有要素追加・更新属性 | `attrName`, `attrValue` |
  | `set-eventdef-ref` | 为事件定义设置 `messageRef`/`signalRef`/`errorRef` | `refType`, `refId` |
  | `set-service-task-field` | 设置服务任务的 `activiti:field` 值（`flowId`/`version`/`to`/`text` 等） | `fieldName`, `fieldValue` |
  | `set-timer-definition` | 设置 `timerEventDefinition` 的周期・日期时间・期间（`timeCycle`/`timeDate`/`timeDuration`）及 `activiti:businessCalendarName` | `timeCycle` / `timeDate` / `timeDuration`（三选一）, `businessCalendarName`（可选） |
  | `set-condition-expression` | 为分支流程添加条件表达式 | `expression` |
  | `set-role-starter-groups` | 为流程设置角色 ID（`candidateStarterGroups`） | `roleId` |
  | `set-lane-candidate-groups` | 为泳道设置角色 ID（`candidateGroups`） | `roleId` |
  | `set-usertask-candidate-groups` | 为用户任务设置角色 ID・可选性 | `roleId`, `isOptional`（可选） |
  | `set-task-color` | 为任务设置背景色 | `taskType` |
  | `add-data-object` | 新增流程变量（`dataObject`）（`targets.elementId` 为对象 process 的 id。若同一文件内存在该 process 的 `replace-process-id`，应指定替换后的值 `toId`。若指定替换前的值将被静默跳过） | `variables: [{ id, name, type }]` |
  | `add-signal` | 新增信号定义（规格书中 ID 未定义时不创建条目） | `id`, `name` |
  | `add-message` | 新增消息定义（规格书中 ID 未定义时不创建条目） | `id`, `name` |
  | `replace-process-id` | 替换流程定义键（process id）。以 `fromId` 确定对象，反映 `toId` | `fromId`, `toId`, `allowFromIdExists`（可选） |
  | `replace-callee-process` | 替换调用活动的调用目标流程 | `fromId`, `toId` |
  | `convert-event-type` | 转换事件类型（例如：中间捕获事件→开始事件） | `fromTag`, `toTag` |
  | `delete-element` | 删除不需要的要素（同时删除模型要素及图形信息） | - |
  | `manual` | 不存在自动反映手段（需要人工处理） | - |

- `requiresApproval` 的默认值为 `true`。`delete-element` / `convert-event-type` / `replace-process-id` / `replace-callee-process` 等破坏性操作应始终保持为 `true`，不允许更改为 `false`。
- `reflectedDate` 应记载反映实施日期（`YYYY-MM-DD`）或「未反映」，仅在 `.claude/skills/bpm-xml-reflector/SKILL.md` 完成反映后才更新。`reflectStatus` 本身为保留判定依据，反映后也不作变更。同时应同步更新 `to-be-discussed.md` 一侧「订正方案」行中显示的 `reflectStatus`。

##### 设计上的限制（不以完全清除 validate-bpmn.js 为目标）

`.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 仅自动反映上表受控词汇表所对应的属性・字段值・要素的追加/更新。以下所述错误即使被赋予 `reflectStatus: ready`，也不会被自动反映（作为 `operation: manual`，交由人工处理或另行分步处理）。

| 相应错误 | 原因 |
|---|---|
| 开始/结束事件缺失、ID 重复、SequenceFlow 的 source/target 不正确、跨越子流程边界、网关缺少输出流程 | 需要追加・删除要素或重新连线（`add-element`/`add-sequence-flow` 等 operation 尚未定义） |
| DI 完整性错误（未知的 `bpmnElement` 引用、waypoint 不足） | 需要追加・删除图形要素（`delete-element` 虽存在于 operation 词汇表中，但 `reflectFixes()` 尚未实现） |
| Message/Signal 未解决引用中，引用目标定义本身在规格书中也尚未确定的情形 | `add-signal`/`add-message` 仅在 ID 确定后才会添加到 `spec-to-bpmn-fixes.json`，因此在未确定期间不会被反映 |

因此，即使 `spec-to-bpmn-fixes.json` 的所有条目均达到 `reflectStatus: ready`，只要上述任一相应错误仍然存在，`.claude/skills/bpm-docs-generator/scripts/validate-bpmn.js` 就会保持 FAIL 状态。这是有意为之的设计，符合 `reflectFixes()` 仅自动化可机械安全反映范围这一目的。要使 `.claude/skills/bpm-docs-generator/scripts/validate-bpmn.js` 通过（PASS），必须人工修正上述相应错误。

#### 关于单独起票的排列顺序
- 单独起票的错误（重要度「高」或「中」）应按重要度「高」→「中」的顺序汇总记载。同一重要度内应保持 validate-bpmn.js 的输出顺序（错误 ID 的连号顺序）。
- 若按重要度拆分章节，应在标题中明确注明重要度（例如：`### 重要度: 高` / `### 重要度: 中`）。即使不拆分，记载顺序也应以重要度优先。

### 验证结果的输出位置
应将验证结果输出到 `to-be-discussed.md` 的「1. BPMN 语法・引用完整性验证结果」中，具体如下。

- **验证结果汇总**
  ```
  ### 验证结果汇总

  执行 `validate-bpmn.js` 的结果（退出代码 X）。

  ERROR Y 件、WARN Z 件 → <PASS|FAIL>

  | 分类 | 件数 | 说明 |
  |------|------|------|
  | 实际 BPMN 的问题（需要应对） | n 件 | 具体内容 |
  | 工具实现局限导致的误检测 | m 件 | 具体内容 |
  ```

- **BPMN 记法错误**
  - 仅对重要度「高」或「中」的「实际 BPMN 问题」单独起票
  - 重要度「低」的项目及「工具误检测」不单独起票（仅计入汇总件数）
  - 此处记载的 VAL 系项目应限定为 validate-bpmn.js 的直接输出

- **iGrafx 特有要素兼容性检查**
  - 仅当对象 BPMN 为 iGrafx 制作时才记载。非 iGrafx 制作时，本小节应记为「不适用」。
  - 基于 `.claude/skills/bpm-docs-generator/reference/guide-specification.md` 「参照的 BPMN 为 iGrafx 制作时必须执行」中的 NG 要素判定表，以源 BPMN（转换前的原始文件）作为判定对象进行检测。
  - 错误 ID 使用 `IGX-<连号>`（独立于 VAL 系的编号）。全部条目重要度固定为「高」（因 IM-BPM 不支持，导入失败的可能性较高）。
  - 模板（原因候选・订正方案可省略。应对方针为固定措辞，改进方案记载 NG 要素判定表的「应对方案」列）：
    ```md
    #### <IGX错误ID>. <NG要素判定表的要素名>: <对象要素名>

    - **对象要素**: <要素名>（<要素类型> / <泳道名> / <前后要素名等>）
    - **重要度**: 高
    - **问题内容**: <将 NG 要素判定表的判定条件用通俗易懂的方式记载>
    - **影响**: 记载在 IM-BPM 导入时不受支持、或可能对流程执行产生不良影响的说明
    - **应对方针**: ⏭️ 在 iGrafx 上修正 BPMN 后重新导入。
    - **改进方案**: <将 NG 要素判定表的应对方案列用通俗易懂的方式记载>
    ```
  - 不输出到 `spec-to-bpmn-fixes.json`（因前提是在 iGrafx 侧修正后重新导入，故属于 `.claude/skills/bpm-xml-reflector/SKILL.md` 自动反映的范围之外）。

**反映到 `to-be-discussed.md` 的规则：**
- ERROR 行：必须反映到要探讨事项中。但重要度「低」（含工具误检测）仅将件数记载于汇总中，不单独起票。
- WARN 行：仅重要度「高」或「中」反映到要探讨事项中。重要度「低」不单独起票。
- 应在保留输出的 [input] / [model] / [flow] / [io] 上下文信息的前提下进行整理。
