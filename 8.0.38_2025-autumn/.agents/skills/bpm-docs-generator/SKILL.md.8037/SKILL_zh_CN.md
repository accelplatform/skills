---
name: bpm-docs-generator
description: 解析 bpmn(xml) 并生成规格书。同时，将已生成的规格书转换为可导入 intra-mart Knowledge 的 zip 文件。规格书的构成・转换规格遵循本技能的规格。
---

# BPMN 规格书生成技能

## 目的

一个解析 BPMN 格式 XML 并生成规格书的技能集。
从 BPMN 的流程定义中提取流程概要、流程说明、任务详情、条件分支逻辑等，并基于工件（artifact）和备注中记载的内容，以 Markdown 方式生成规格书。
通过本技能生成的规格书，也用作生成脚本开发模型（JSSP）时的输入提示（prompt）。

## 使用时机（创建规格书）
当用户提出以下请求时：
- 「为这个 BPMN 创建规格书」
- 「为这个流程生成文档」
- 「从这个 XML 输出流程说明」

## 使用时机（创建面向 IM-Knowledge 的导入文件）
当用户提出以下请求时：
- 「将 `doc/<BPM流程名>-prompt/` 的规格书转换为可导入 Knowledge 的 zip」
- 「将 BPM 规格书转换为 Knowledge 格式」
- 「创建用于 Knowledge 的 zip」
- 「转换为可导入 Knowledge 的 zip」
- 「将规格书转换为 Knowledge 格式」


## 生成的规格书文件结构
```
doc                           ...  目录
 └─ <BPM流程名>-prompt        ...  目录
      ├─ specification.md     ...  记载 BPM 流程的概要及整体概览
      ├─ <BPM流程名>.bpmn      ...  XML 格式的 BPMN 文件，复制自源 bpmn 文件
      ├─ business-data.md     ...  业务数据定义（表结构，可定义多个）
      ├─ to-be-discussed.md   ...  记载要探讨事项
      ├─ spec-to-bpmn-fixes.json ... 用于将规格书内容反映到 BPMN 的机器可读数据（供 bpm-xml-reflector 反映使用。除 to-be-discussed.md 的错误订正方案外，还包含角色ID・任务颜色・流程变量・信号・消息・流程定义键替换・调用活动（call activity）调用目标替换等业务需求反映内容）
      ├─ supplement.md        ...  记载规格采用方针及补充事项
      ├─ interactive-log.md   ...  记载对话历史、结果报告等（结果报告应记载于此文件，不得显示在控制台）
      └─ ＜功能目录＞          ...  存放与 BPM 任务相关联的功能规格书的目录（可定义多个）
           ├─ <功能名>-screen.md   ...  画面定义（按功能）
           └─ <功能名>-logic.md    ...  逻辑（按功能）
```

  - **规格书的构成如上所述，但可根据需要追加文件或目录。**

## 规格书样式指南
- 术语统一：在说明 BPMN 要素（任务、网关、事件等）时，应使用 BPMN 规范中定义的正式术语。
- 格式规约：规格书的各章节应以标题分隔，并善用条目和表格整理信息。
- 善用示例：对于复杂的流程或条件分支说明，应举出具体示例以便于理解。
- 简洁表达：规格书应重视可读性，避免冗长表达，简洁地传达要点。
- 技术细节应归纳在适当的章节中，避免妨碍整体流程的说明。
- 规格书的内容应忠实于 BPMN XML 的结构。应准确反映 XML 要素，避免引起误解的表达。
- 规格书的内容应涵盖理解 BPMN 流程定义所需的信息。应无遗漏地说明重要的流程、任务、条件分支等。
- 规格的采用方针应汇总记载于 `<BPM流程名>-prompt/supplement.md`。
- 要素识别应以「要素名」为第一关键字，禁止仅通过 ID 单独识别要素。
- 若仅凭要素名难以识别，应补充要素类型・泳道名・前后要素名等信息。
- 原则上不应在正文中出现 ID，仅在必要时以括号形式补充说明（例如：要素名（ID: xxx））。

> **关于禁止记载事项・表达规则的详情：** 请参见 `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md` 中的「输出失败判定」及「专业术语的禁止与替换」。

## 各规格生成指南
| 文件 | 内容 |
|---------|------|
| `.agents/skills/bpm-docs-generator/reference/guide-specification.md` | 规格书的构成 |
| `.agents/skills/bpm-docs-generator/reference/guide-business-data.md` | 业务数据定义的注意事项 |
| `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` | BPMN 语法・引用完整性验证的具体步骤和记载规则 |
| `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation-rules.md` | 传递给 `validate-bpmn.js` 的 `--rules <rules.json>` 的输入规则定义（rules.json）规格 |
| `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md`  | 要探讨事项说明 |
| `.agents/skills/bpm-docs-generator/reference/guide-screen.md` | 画面定义主要要素的构成与说明 |
| `.agents/skills/bpm-docs-generator/reference/guide-logic.md` | 逻辑主要要素的构成与说明 |
| `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` | 流程定义键（process 的 id）的替换规则 |

## 辅助功能细则
| 文件 | 内容 |
|---------|------|
| `.agents/skills/bpm-docs-generator/reference/docs-to-knowledge-zip.md` | 将 BPM 规格书转换为可导入 intra-mart Knowledge 的 zip 文件 |


**注意事项**
- **BPMN 的备注・注释应作为规格的重要输入信息处理，不得跳过不读。**
- **即使内容可以通过 IM-Workflow 实现，也应基于 IM-BPM 的流程定义生成规格书。**


## 从 BPMN 创建规格书的流程

按照以下流程进行作业。

## step.1 确认创建方式（必须获得用户回答）
- 列出现有的规格书目录，向用户询问是采用差异反映还是新建。
- **在获得用户回答之前，不得执行包含目录创建在内的 step.2 及以后的步骤。**
  - 若选择现有的规格书目录，则将 BPMN 的内容以差异形式反映到该规格书中。
  - 若选择新建，则在确认目录名后新建规格书。

## step.2 复制 BPMN
- 将 `<BPM流程名>.bpmn` 复制到 prompt 目录下。
- **`<BPM流程名>.bpmn` 的复制必须使用 .agents/skills/bpm-docs-generator/scripts/bpmn-transform.js 进行。**
  - {{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/bpmn-transform.js <源 BPMN> <<BPM流程名>-prompt/<BPM流程名>.bpmn>
- **此转换会去除 ixbpmn:/igx: 等 iGrafx 专有命名空间要素・属性。** 因此，iGrafx 专有要素的检测（`reference/guide-specification.md` 中「参照的 BPMN 为 iGrafx 制作时必须执行」）应**直接使用 Read 工具参照源 BPMN（转换前的原始文件）**进行，而不是转换后的 `<BPM流程名>.bpmn`。源 BPMN 不得复制，仅可参照，禁止变更・覆盖其内容。
- 由于后续步骤（尤其是 step.4）也需要参照源 BPMN 的路径，应在 `interactive-log.md` 中记录一行以免遗忘（例如：`原始 BPMN: <源 BPMN 的路径>`）。文件本体不进行复制。


## step.3 BPMN 语法・引用完整性验证
- 在读取复制后的 BPMN 文件之后，应立即按照 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 的定义执行一次验证，并将结果反映到规格书中。**若未执行或未反映，则不得进入 step.4。**

## step.4 创建规格书
- 按照本技能集创建规格书。
- **iGrafx 专有要素的检测**（`.agents/skills/bpm-docs-generator/reference/guide-specification.md` 中「参照的 BPMN 为 iGrafx 制作时必须执行」）应直接使用 Read 工具参照记录在 `interactive-log.md` 中的源 BPMN（转换前的原始文件）进行判定。转换后的 `<BPM流程名>-prompt/<BPM流程名>.bpmn` 由于 ixbpmn:/igx: 要素已被去除，不得用于该判定。禁止对源 BPMN 进行写入・变更（仅可参照）。
  - 若源 BPMN 已不存在・已被移动等无法参照的情况，应作为 `to-be-discussed.md` 中的要探讨事项向用户重新确认。
  - 判定结果除记载于 `specification.md` 的流程详情外，还应在同一时机反映到 `to-be-discussed.md` 的第 1 章「iGrafx 特有要素兼容性检查」（验证结果，重要度固定为「高」）和第 6 章「BPMN 改进方案」（应对方案）中。不输出到 `spec-to-bpmn-fixes.json`（因为此项由 iGrafx 侧修正并重新导入）。
- **流程定义键（process id）仅进行「判定与提案」（禁止实际执行替换）。**
  - 判定结果的解释・记载格式以 `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` 为准。
- `to-be-discussed.md` 的章节结构・标题编号・失败判定条件**必须遵循** `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md`。若存在违反，应视为输出失败并修正后重新输出。
- 输出 `to-be-discussed.md` 前，应确认 `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md` 的**「输出失败判定」**，若存在符合项应修正后再输出。
- **需要反映到 BPMN 的确定事项（validate-bpmn.js 的错误订正方案、角色ID・任务颜色・流程变量・信号・消息、流程定义键替换、调用活动调用目标替换）应在记载到 `to-be-discussed.md`/`specification.md` 的同一时机输出到 `spec-to-bpmn-fixes.json`。** 不进行对 BPMN 的实际反映（实际执行交由 `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 的 `reflectFixes()` 负责）。条目结构・命名规则以 `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 为准。

## Step.5 记录对话历史
- 将对提示（prompt）的请求内容及生成结果的报告记载于 `doc/<BPM流程名>-prompt/interactive-log.md`。若 `interactive-log.md` 中已有记录，则追加记载。
  - 用户请求的指示内容应原样记录。
  - 对指示内容的回答也应原样记录。
