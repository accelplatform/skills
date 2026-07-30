# BPM 规格书 → intra-mart Knowledge zip 转换技能

## 概要

将 bpm-docs-generator 生成的规格书（`doc/<BPM流程名>-prompt/` 下）转换为可导入 intra-mart Knowledge 的 zip 文件（`commons/groups/*.json` 与 `wiki/<contentsId>/...` 结构）。

作为输入的规格书为 Markdown 格式・目录层级结构，输出则是对应 Knowledge 的「组／内容／Wiki 页面／附件」模型的一组 JSON 与 zip 包。

## 输入

`doc/<BPM流程名>-prompt/` 目录。遵循 `bpm-docs-generator` 生成物的构成：

```
<BPM流程名>-prompt/
├─ specification.md           流程整体规格
├─ <BPM流程名>.bpmn           原 BPMN 文件（附件）
├─ business-data.md           业务数据定义
├─ to-be-discussed.md         待讨论事项
├─ supplement.md              记载规格采用方针与补充事项
├─ interactive-log.md         记载对话履历、结果报告等
└─ <功能目录>/                 （多个）
   ├─ <功能名>-screen.md       画面定义
   └─ <功能名>-logic.md        逻辑定义
```

## 输出

`im_knowledge_<YYYYMMDD>_<HHMM>.zip`（文件名可任意）。

zip 根下的目录结构如下：

```
<im_knowledge_xxx>.zip
├─ commons/
│  └─ groups/
│     └─ im_bpm_specifications.json
└─ wiki/
   └─ <contentsId>/
      ├─ <contentsId>.json
      ├─ <rootPageCd>/
      │  ├─ <rootPageCd>.json
      │  └─ attachment/
      │     └─ <fileCd>            ← BPMN 等附件本体（无扩展名）
      ├─ <pageCd>/
      │  └─ <pageCd>.json
      └─ …（按页面数）
```

- `<contentsId>` … 半角英数字以连字符分隔（kebab-case）
- `<rootPageCd>` / `<pageCd>` / `<fileCd>` … 各自唯一的 12～15 字符小写英数字 ID（参见 [ID 生成](#id-生成规则)）

## 整体映射表

| 输入（`<BPM流程名>-prompt/` 下） | 输出（zip 内） | parentWikiPageCd | sortKey | 备注 |
|---|---|---|---|---|
| （流程名本身） | `wiki/<contentsId>/<rootPageCd>/<rootPageCd>.json` | `null` | `"0"` | 根页面。title = 流程名 |
| `<BPM流程名>.bpmn` | `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>` | - | - | 作为根页面的附件登录 |
| `specification.md` | 规格书页面 | rootPageCd | `"1"` | title =「规格书」 |
| `business-data.md` | 业务数据定义页面 | rootPageCd | `"2"` | title =「业务数据定义」 |
| `to-be-discussed.md` | 待讨论事项页面 | rootPageCd | `"8"` | title =「待讨论事项」 |
| `supplement.md` | 规格采用方针・补充事项页面 | rootPageCd | `"9"` | title =「规格采用方针与补充事项」 |
| `interactive-log.md` | 对话履历页面 | rootPageCd | `"10"` | title =「对话履历」 |
| `<功能目录>/` | 功能文件夹页面 | rootPageCd | `"11"` 及之后 | title =「[<功能名>]功能」。正文为 `# 功能定义\n\n{{child_pages}}` |
| `<功能目录>/<功能名>-screen.md` | 画面定义页面 | 功能文件夹 pageCd | `"0"` | title =「[<功能名>]画面定义」 |
| `<功能目录>/<功能名>-logic.md` | 逻辑定义页面 | 功能文件夹 pageCd | `"1"` | title =「[<功能名>]逻辑定义」 |

> **sortKey 的编号方针**
> - 根目录下的固定页面，前半部分配置规格书(1)→业务数据(2)，后半部分配置待讨论事项(8)・补充(9)
> - 功能文件夹从 11 开始。
> - 功能文件夹内固定为 screen=0、logic=1

## 文件规格

### 1. 组定义 `commons/groups/im_bpm_specifications.json`

将所有 BPM 规格书（内容）配置在固定的单一组「IM-BPM 规格书」下。将其他 BPM 规格书导入同一 Knowledge 时也共用此 groupId。

```json
{
  "groupId": "im_bpm_specifications",
  "groupName": "IM-BPM 规格书",
  "description": "",
  "localizes": {
    "zh_CN": {"groupId":"im_bpm_specifications","locale":"zh_CN","groupName":"IM-BPM 规格书","description":""},
    "en":    {"groupId":"im_bpm_specifications","locale":"en",   "groupName":"IM-BPM 规格书","description":""},
    "ja":    {"groupId":"im_bpm_specifications","locale":"ja",   "groupName":"IM-BPM 规格书","description":""}
  },
  "createUserCd": "tenant",
  "createDate": <epochMillis>,
  "recordUserCd": "tenant",
  "recordDate": <epochMillis>
}
```

- `createDate` / `recordDate` … 生成时刻的 Unix 纪元毫秒（13 位数值）
- localizes 必须包含 3 种语言（zh_CN / en / ja）。不进行多语言对应时使用相同文本亦可

### 2. 内容定义 `wiki/<contentsId>/<contentsId>.json`

对应各 BPM 流程的内容单位的元信息。

```json
{
  "contentsId": "<contentsId>",
  "groupId": "im_bpm_specifications",
  "contentsType": "wiki",
  "contentsName": "<BPM流程名>",
  "description": null,
  "contents": null,
  "thumbnail": "data:image/png;base64,<base64编码>",
  "tagIds": [],
  "mainPageCd": "<rootPageCd>"
}
```

- `mainPageCd` … 根页面的 `wikiPageCd`（必填・须为准确的引用）
- `thumbnail` … 可选。嵌入将 BPMN 的缩略图 PNG 进行 base64 编码后的 data URL。省略时按示例设为空字符串或默认图像
- `tagIds` … 使用空数组即可

### 3. Wiki 页面 `wiki/<contentsId>/<wikiPageCd>/<wikiPageCd>.json`

目录名・JSON 文件名须与 `wikiPageCd` 完全一致。

```json
{
  "wikiPageCd": "<wikiPageCd>",
  "title": "<页面标题>",
  "parentWikiPageCd": "<父 pageCd 或 null>",
  "sortKey": "<数值字符串>",
  "formatType": "MARKDOWN",
  "contents": "<Markdown 正文>",
  "comment": "",
  "attachmentFileInfo": [
    {
      "fileCd": "<fileCd>",
      "fileName": "<原文件名（含扩展名）>",
      "createDate": <epochMillis>,
      "comment": ""
    }
  ]
}
```

- `parentWikiPageCd` … 仅根页面为 `null`，其余为父页面的 `wikiPageCd`
- `sortKey` … 以**字符串**形式存放（例：`"1"`）。因设想为数值排序，不进行 `"01"` 这样的补零
- `formatType` … 始终为 `"MARKDOWN"`
- `attachmentFileInfo` … 无附件时为 `[]`（空数组）

### 4. 附件 `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`

- 文件名仅为 `<fileCd>`，**不添加扩展名**
- 内容为原文件的二进制本身（BPMN 为 UTF-8 / CRLF 的 XML）
- 须与页面 JSON 的 `attachmentFileInfo[].fileCd` 完全一致

### 5. 根页面正文的规约

根页面的 `contents` 采用固定模式：

```markdown
# 规格

{{child_pages}}

# BPMN
{{attachment(<BPMN文件名>.bpmn)}}
```

- `{{child_pages}}` … Knowledge 自动展开其下的子页面一览
- `{{attachment(...)}}` … 将附件嵌入正文中。括号内与 `attachmentFileInfo[].fileName` 一致

### 6. 功能文件夹页面的正文

作为汇集子页面的轻量文件夹页面，使用固定正文：

```markdown
# 功能定义

{{child_pages}}
```

## ID 生成规则

`wikiPageCd` / `fileCd` 须为 zip 内唯一的 12～15 字符小写英数字（类 base36）。示例实例：

- `012ii53f4f4b6c`（14 字符）
- `8i0vb6rdl34z2kc`（15 字符）

推荐实现：以 `Math.random().toString(36).slice(2, 16)` 等方式生成，并在检查重复后使用。`contentsId` 采用人类可读的 kebab-case。

## Markdown 内链接的转换

规格书 Markdown 内的本地相对链接（例：`[business-data.md](business-data.md)`）需替换为 Knowledge 的 URL 格式。

### 替换规则

| 原链接（例） | 替换后 |
|---|---|
| `[业务数据](business-data.md)` | `[业务数据](./knowledge/contents/wiki/<contentsId>/业务数据定义)` |
| `[待讨论事项](to-be-discussed.md)` | `[待讨论事项](./knowledge/contents/wiki/<contentsId>/待讨论事项)` |
| `[<功能名>](<功能目录>/)` | `[<功能名>](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5D功能)` |
| `[<功能名>画面](<功能目录>/<功能名>-screen.md)` | `[<功能名>画面](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5D画面定义)` |
| `[<功能名>逻辑](<功能目录>/<功能名>-logic.md)` | `[<功能名>逻辑](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5D逻辑定义)` |

### 转换步骤

1. 从链接目标的本地路径（相对路径）反查对应的**页面标题**
2. 将路径的末尾要素替换为「对页面标题进行 URL 编码后的字符串」
3. URL 的前缀统一为 `./knowledge/contents/wiki/<contentsId>/` 或 `/imart/knowledge/contents/wiki/<contentsId>/` 之一（在同一份规格书内保持一致）

### URL 编码规约

- 半角 `[` → `%5B`、半角 `]` → `%5D`、半角空格 → `%20`
- 中日文字符・全角括号（`（` `）`）保持原样（即使不编码，Knowledge 侧也能进行路由）
- 保留哈希片段（`#section`）

## 纪元毫秒（时间戳）

- `commons/groups/*.json` 的 `createDate`／`recordDate`
- 持有 `wiki/.../attachment` 的页面的 `attachmentFileInfo[].createDate`

这些全部为 Unix 纪元毫秒的数值（例：`1779423192916`）。统一填入生成时刻即可。

## 转换步骤（实现流程）

1. **输入验证** … 确认 `doc/<BPM流程名>-prompt/` 正下方的必需文件（`specification.md`／`business-data.md`／`supplement.md`／`to-be-discussed.md`／`*.bpmn`）是否存在
2. **元信息提取**
   - BPM 流程名 … 从 `specification.md` 开头的 `# <名称> 规格书` 中提取
   - `contentsId` … BPM 流程的英文名（kebab-case）。也可从 BPMN 文件名派生
   - 各功能目录的功能名 … 从其下 `*-screen.md` 开头的标题中提取
3. **页面 ID 采番** … 按根／固定页面／功能文件夹／画面／逻辑的顺序采番 `wikiPageCd`。BPMN 附件的 `fileCd` 同样采番
4. **JSON 构建**
   - 生成 `commons/groups/im_bpm_specifications.json`
   - 生成 `wiki/<contentsId>/<contentsId>.json`（在 `mainPageCd` 中设置根页面的 `wikiPageCd`）
   - 从各 Markdown 文件生成 Wiki 页面 JSON（[文件规格](#文件规格) §3）
5. **Markdown 正文的转换**
   - 读取各页面的正文，将链接替换为 Knowledge URL 格式（[Markdown 内链接的转换](#markdown-内链接的转换)）
   - 换行为 `\n`，且须已在 JSON 内作为字符串完成转义（双引号・反斜杠等）
6. **附件配置** … 将 BPMN 文件以二进制原样复制到 `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`（无扩展名）
7. **zip 化** … 将上述目录结构原样进行 zip 压缩。zip 文件名推荐 `im_knowledge_<YYYYMMDD>_<HHMM>.zip`

## 输出示例（最小构成的布局）

```
im_knowledge_<YYYYMMDD>_<HHMM>.zip
├─ commons/groups/im_bpm_specifications.json
└─ wiki/<contentsId>/
   ├─ <contentsId>.json                                    （contentsId.json, mainPageCd=<root>）
   ├─ <root>/<root>.json                                   （title=<BPM流程名>, parent=null, sortKey="0"）
   │     └─ attachment/<bpmnFileCd>                        （<BPMN文件名>.bpmn 的二进制）
   ├─ <pageA>/<pageA>.json                                 （title=规格书, parent=<root>, sortKey="1"）
   ├─ <pageB>/<pageB>.json                                 （title=业务数据定义, parent=<root>, sortKey="2"）
   ├─ <pageC>/<pageC>.json                                 （title=待讨论事项, parent=<root>, sortKey="8"）
   ├─ <pageD>/<pageD>.json                                 （title=补充事项, parent=<root>, sortKey="9"）
   ├─ <pageE>/<pageE>.json                                 （title=对话履历, parent=<root>, sortKey="10"）
   ├─ <folderF>/<folderF>.json                             （title=[<功能名>]功能, parent=<root>, sortKey="11"）
   ├─ <pageF1>/<pageF1>.json                               （title=[<功能名>]画面定义, parent=<folderF>, sortKey="0"）
   ├─ <pageF2>/<pageF2>.json                               （title=[<功能名>]逻辑定义, parent=<folderF>, sortKey="1"）
   └─ …（按功能文件夹数量。sortKey 依次为 11, 12, …）
```

## 注意事项

- **JSON 以单行输出**（示例 zip 已 minify）。无需为可读性添加缩进
- **JSON 为 UTF-8 / 无 BOM**。非 ASCII 字符不转义，直接以原样嵌入（`"contentsName":"车辆管理"`）
- **JSON 文件名・目录名与 `wikiPageCd`／`contentsId`／`fileCd` 须完全一致**。若有拼写错误，Knowledge 侧导入时关联会被破坏
- **严格保持 `parentWikiPageCd` 的一致性**。引用不存在父级的 `wikiPageCd` 会导致导入失败
- **`mainPageCd` 必须指向根页面的 `wikiPageCd`**
- **附件须以无扩展名保存**，并通过 `attachmentFileInfo[].fileName` 保留原文件名
- **`{{child_pages}}` / `{{attachment(...)}}` 占位符**为 Knowledge 标准语法。`{{attachment(name)}}` 的 `name` 须与 `attachmentFileInfo[].fileName` 准确一致
- **不要残留 Markdown 内的相对链接**（若有转换遗漏会导致链接失效）
- groupId 采用固定值，**以便同一 groupId（`im_bpm_specifications`）的 zip 多次导入也不会产生问题**
- **不要推荐将 BPMN 文件名改为半角英数字**。Knowledge 也能处理非 ASCII 文件名，只要 `{{attachment(...)}}` 内书写的名称与 `fileName` 一致即可正常工作
- **页面标题中不得包含斜杠**。

## 参照

- 输入规格：`.claude/skills/bpm-docs-generator/SKILL.md`（规格书目录构成）
