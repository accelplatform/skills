---
name: bpm-docs-generator
description: 解析 bpmn(xml) 并生成规格书。此外，将已生成的规格书转换为可导入 intra-mart Knowledge 的 zip 文件。规格书的构成与转换规格遵循本技能的规格。
---

# BPMN 规格书生成技能

## 目的

解析 BPMN 格式的 XML 并生成规格书的技能集。
从 BPMN 的流程定义中提取流程概要、流程说明、任务详情、条件分支逻辑等，并基于制品（artifact）和备注中记载的内容，生成以 Markdown 方式撰写的规格书。
由本技能生成的规格书，也用作生成脚本开发模型（JSSP）时的输入提示。

## 使用时机（创建规格书）
当用户提出如下请求时：
- 「请创建此 BPMN 的规格书」
- 「请生成此流程的文档」
- 「请从此 XML 输出流程说明」

## 使用时机（创建面向 IM-Knowledge 的导入文件）
当用户提出如下请求时：
- 「请将 `doc/<BPM流程名>-prompt/` 的规格书转换为可导入 Knowledge 的 zip」
- 「请将 BPM 规格书转换为 Knowledge 格式」
- 「请制作用于知识库的 zip」
- 「请做成可导入 Knowledge 的 zip」
- 「请将规格书转换为 Knowledge 格式」


## 生成的规格书的文件构成
doc                          ...　目录
 └─ <BPM流程名>-prompt        ...　目录
      ├─ specification.md    ...  记载 BPM 流程的概要与整体图景
      ├─ <BPM流程名>.bpmn     ...  XML 格式的 BPMN 文件，复制作为来源的 bpmn 文件
      ├─ business-data.md    ...  业务数据定义（表构成　可定义多个）
      ├─ to-be-discussed.md  ...  记载待讨论事项
      ├─ supplement.md       ...  记载规格采用方针与补充事项
      ├─ interactive-log.md  ...  记载对话履历、结果报告等（结果报告记载于此文件，不要显示在控制台）
      └─ ＜功能目录＞          ...  存放与 BPM 任务关联的功能规格书的目录（可定义多个）
           ├─ <功能名>-screen.md   ...  画面定义（以功能为单位）
           └─ <功能名>-logic.md    ...  逻辑（以功能为单位）

※ 规格书的构成如上所述，但可根据需要追加文件或目录。

## 规格书样式指南
- 术语统一：说明 BPMN 的要素（任务、网关、事件等）时，应使用 BPMN 规格中定义的正式术语。
- 格式规约：规格书的各章节以标题分隔，并活用项目符号与表格整理信息。
- 活用示例：说明复杂的流程或条件分支时，应举出具体示例以便于理解。
- 简洁表达：规格书重视可读性，避免冗长表达，简洁地传达要点。
- 技术性细节应汇总在适当的章节中，以免妨碍整体的行文脉络。
- 规格书的内容应忠实于 BPMN XML 的结构。准确反映 XML 的要素，避免引起误解的表达。
- 规格书的内容应涵盖理解 BPMN 流程定义所需的信息。对重要的流程、任务、条件分支等无遗漏地进行说明。
- 规格的采用方针应汇总在 `<BPM流程名>-prompt/supplement.md` 中。
- 要素的特定以「要素名」为第一键，禁止仅凭 ID 特定要素。
- 仅凭要素名难以特定时，应补充要素种类、泳道名、前后要素名。
- ID 原则上不出现在正文中，仅在必要时以括号补充的形式使用（例：要素名（ID: xxx））。

> **禁止记载・表达规则详情：** 请参阅 `reference/guide-to-be-discussed.md` 的「输出失败门禁」及「专业术语的禁止与替换」。

## 各规格生成的指南
| 文件 | 内容 |
|---------|------|
| `reference/guide-specification.md` | 规格书的构成 |
| `reference/guide-business-data.md` | 业务数据定义的注意事项 |
| `reference/guide-bpmn-validation.md` | BPMN 语法・引用完整性验证的具体步骤与记载规则 |
| `reference/guide-to-be-discussed.md`  | 待讨论事项的说明 |
| `reference/guide-screen.md` | 画面定义主要要素的构成与说明 |
| `reference/guide-logic.md` | 逻辑主要要素的构成与说明 |
| `reference/guide-process-definition-key-replacement.md` | 流程定义键（process 的 id）的置换规则 |

## 支援功能的细则
| 文件 | 内容 |
|---------|------|
| `reference/docs-to-knowledge-zip.md` | 将 BPM 的规格书转换为可导入 intra-mart Knowledge 的 zip 文件 |


**注意事项**
- **BPMN 的备注・注释应作为规格的重要输入信息处理，不可跳读。**
- **即使是 IM-workflow 能够实现的内容，也应基于 IM-BPM 的流程定义生成规格书。**


## 从 BPMN 创建规格书的步骤

按照以下步骤进行作业。

## step.1 确认既有规格书
- 以列表显示既有的规格书目录，确认所读取的 BPMN 是要向既有规格进行差分反映，还是新建规格书。
  - 选择既有规格书目录后，将 BPMN 的内容差分反映到该规格书中。
  - 选择新建时，则新建规格书。

## step.2 BPMN 语法・引用完整性验证
- 【强制门禁】读取 BPMN 文件后应立即按照 `reference/guide-bpmn-validation.md` 的定义实施 1 次验证，并将结果反映到规格书中。**未实施・未反映的情况下，不得进入 step.3。**

## step.3 创建规格书
- 依照本技能集创建规格书。
- **流程定义键（process id）仅进行「判定与提案」（禁止实施置换）。**
  - 判定结果的解释・记载形式以 `reference/guide-process-definition-key-replacement.md` 为准。
- `to-be-discussed.md` 的章节构成・标题编号・失败处理条件**必须遵循** `reference/guide-to-be-discussed.md`。若存在违反，则视为输出失败，修正后重新输出。
- `to-be-discussed.md` 应确认 `reference/guide-to-be-discussed.md` 的 **「输出失败门禁」**，若存在相应项目则修正后再输出。
