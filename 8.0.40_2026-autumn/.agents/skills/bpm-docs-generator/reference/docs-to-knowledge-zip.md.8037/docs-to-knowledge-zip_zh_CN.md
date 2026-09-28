# BPM 规格书 → intra-mart Knowledge zip 转换技能

## 概要

将 bpm-docs-generator 生成的规格书（位于 `doc/<BPM流程名>-prompt/` 下）转换为可导入 intra-mart Knowledge 的 zip 文件（`commons/groups/*.json` 与 `wiki/<contentsId>/...` 结构）。

输入的规格书为 Markdown 格式・目录层级结构，输出则是与 Knowledge 的「组／内容／Wiki 页面／附件」模型对应的一组 JSON 文件及 zip 压缩包。

## 输入

`doc/<BPM流程名>-prompt/` 目录。遵循 `bpm-docs-generator` 生成物的结构：

```
<BPM流程名>-prompt/
├─ specification.md           流程整体规格
├─ <BPM流程名>.bpmn           原始 BPMN 文件（附件）
├─ business-data.md           业务数据定义
├─ to-be-discussed.md         要探讨事项
├─ supplement.md             记载规格采用方针及补充事项
├─ interactive-log.md        记载对话履历、结果报告等
└─ <功能目录>/                （多个）
   ├─ <功能名>-screen.md      画面定义
   └─ <功能名>-logic.md       逻辑定义
```

## 输出

`im_knowledge_<YYYYMMDD>_<HHMM>.zip`（文件名可任意指定）。

zip 根目录下的目录结构如下：

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
      │     └─ <fileCd>            ← BPMN 等附件文件本体（无扩展名）
      ├─ <pageCd>/
      │  └─ <pageCd>.json
      └─ ...（页面数量不等）
```

- `<contentsId>` … 以半角英数字连字符分隔（kebab-case）
- `<rootPageCd>` / `<pageCd>` / `<fileCd>` … 各自为唯一的 12～15 个字符的小写英数 ID（参见 [ID 生成规则](#id-生成规则)）

## 整体映射表

| 输入（`<BPM流程名>-prompt/` 下） | 输出（zip 内） | parentWikiPageCd | sortKey | 备注 |
|---|---|---|---|---|
| （流程名本身） | `wiki/<contentsId>/<rootPageCd>/<rootPageCd>.json` | `null` | `"0"` | 根页面。title=流程名 |
| `<BPM流程名>.bpmn` | `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>` | - | - | 作为根页面的附件登记 |
| `specification.md` | 规格书页面 | rootPageCd | `"1"` | title=「仕様書」 |
| `business-data.md` | 业务数据定义页面 | rootPageCd | `"2"` | title=「業務データ定義」 |
| `to-be-discussed.md` | 要探讨事项页面 | rootPageCd | `"8"` | title=「要検討事項」 |
| `supplement.md` | 规格采用方针・补充事项页面 | rootPageCd | `"9"` | title=「仕様採用方針と補足事項」 |
| `interactive-log.md` | 对话履历页面 | rootPageCd | `"10"` | title=「対話履歴」 |
| `<功能目录>/` | 功能文件夹页面 | rootPageCd | `"11"` 及以后 | title=「[<功能名>]機能」。正文为 `# 機能定義\n\n{{child_pages}}` |
| `<功能目录>/<功能名>-screen.md` | 画面定义页面 | 功能文件夹 pageCd | `"0"` | title=「[<功能名>]画面定義」 |
| `<功能目录>/<功能名>-logic.md` | 逻辑定义页面 | 功能文件夹 pageCd | `"1"` | title=「[<功能名>]ロジック定義」 |

> **sortKey 的编号方针**
> - 根目录下的固定页面中，规格书(1)→业务数据(2) 排在前半部分，要探讨事项(8)・补充事项(9) 排在后半部分
> - 功能文件夹从 11 开始。
> - 功能文件夹内固定为 screen=0、logic=1

## 文件规格

### 1. 组定义 `commons/groups/im_bpm_specifications.json`

在固定的单一组「IM-BPM 仕様書」下配置所有 BPM 规格书（内容）。将其他 BPM 规格书导入同一 Knowledge 时，也共享此 groupId。

```json
{
  "groupId": "im_bpm_specifications",
  "groupName": "IM-BPM 仕様書",
  "description": "",
  "localizes": {
    "zh_CN": {"groupId":"im_bpm_specifications","locale":"zh_CN","groupName":"IM-BPM 仕様書","description":""},
    "en":    {"groupId":"im_bpm_specifications","locale":"en",   "groupName":"IM-BPM 仕様書","description":""},
    "ja":    {"groupId":"im_bpm_specifications","locale":"ja",   "groupName":"IM-BPM 仕様書","description":""}
  },
  "createUserCd": "tenant",
  "createDate": <epochMillis>,
  "recordUserCd": "tenant",
  "recordDate": <epochMillis>
}
```

- `createDate` / `recordDate` … 生成时刻的 Unix 纪元毫秒数（13 位数值）
- `localizes` 须始终包含 3 种语言（zh_CN / en / ja）。即使不支持多语言，也可使用相同文本。

### 2. 内容定义 `wiki/<contentsId>/<contentsId>.json`

与各 BPM 流程对应的内容级元信息。

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

- `mainPageCd` … 根页面的 `wikiPageCd`（必须・准确引用）
- `thumbnail` … 可选。嵌入将 BPMN 缩略图 PNG 进行 base64 编码后的 data URL。省略时按示例设为空字符串或默认图像
- `tagIds` … 空数组即可

### 3. Wiki 页面 `wiki/<contentsId>/<wikiPageCd>/<wikiPageCd>.json`

目录名・JSON 文件名须与 `wikiPageCd` 完全一致。

```json
{
  "wikiPageCd": "<wikiPageCd>",
  "title": "<页面标题>",
  "parentWikiPageCd": "<父 pageCd 或 null>",
  "sortKey": "<数字字符串>",
  "formatType": "MARKDOWN",
  "contents": "<Markdown 正文>",
  "comment": "",
  "attachmentFileInfo": [
    {
      "fileCd": "<fileCd>",
      "fileName": "<原始文件名（含扩展名）>",
      "createDate": <epochMillis>,
      "comment": ""
    }
  ]
}
```

- `parentWikiPageCd` … 仅根页面为 `null`，其余为父页面的 `wikiPageCd`
- `sortKey` … 以**字符串**形式存储（例：`"1"`）。由于按数值排序，故不进行如 `"01"` 般的补零
- `formatType` … 始终为 `"MARKDOWN"`
- `attachmentFileInfo` … 无附件时为 `[]`（空数组）

### 4. 附件文件 `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`

- 文件名仅为 `<fileCd>`，**不附加扩展名**
- 内容为原始文件的二进制数据原样保存（BPMN 为 UTF-8 / CRLF 的 XML）
- 须与页面 JSON 的 `attachmentFileInfo[].fileCd` 完全一致

### 5. 根页面正文的规约

根页面的 `contents` 采用以下固定格式：

```markdown
# 仕様

{{child_pages}}

# BPMN
{{attachment(<BPMN 文件名>.bpmn)}}
```

- `{{child_pages}}` … 由 Knowledge 自动展开其下的子页面一览
- `{{attachment(...)}}` … 在正文中嵌入附件文件。括号内须与 `attachmentFileInfo[].fileName` 一致

### 6. 功能文件夹页面的正文

作为汇总子页面用的简易文件夹页面，使用以下固定正文：

```markdown
# 機能定義

{{child_pages}}
```

## ID 生成规则

`wikiPageCd` / `fileCd` 须为 zip 内唯一的 12～15 个字符的小写英数字（类 base36 风格）。示例：

- `012ii53f4f4b6c`（14 个字符）
- `8i0vb6rdl34z2kc`（15 个字符）

推荐实现方式：使用 `Math.random().toString(36).slice(2, 16)` 等方式生成，并检查是否重复后使用。`contentsId` 采用人类可读的 kebab-case。

## Markdown 内链接的转换

规格书 Markdown 内的本地相对链接（例：`[business-data.md](business-data.md)`）须替换为 Knowledge 的 URL 格式。

### 替换规则

| 原链接（示例） | 替换后 |
|---|---|
| `[業務データ](business-data.md)` | `[業務データ](./knowledge/contents/wiki/<contentsId>/業務データ定義)` |
| `[要検討事項](to-be-discussed.md)` | `[要検討事項](./knowledge/contents/wiki/<contentsId>/要検討事項)` |
| `[<功能名>](<功能目录>/)` | `[<功能名>](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5D機能)` |
| `[<功能名>画面](<功能目录>/<功能名>-screen.md)` | `[<功能名>画面](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5D画面定義)` |
| `[<功能名>ロジック](<功能目录>/<功能名>-logic.md)` | `[<功能名>ロジック](./knowledge/contents/wiki/<contentsId>/%5B<功能名>%5Dロジック定義)` |

### 转换步骤

1. 从链接目标的本地路径（相对路径）反查对应的**页面标题**
2. 将路径末尾的元素替换为「对页面标题进行 URL 编码后的字符串」
3. URL 的前缀须统一为 `./knowledge/contents/wiki/<contentsId>/` 或 `/imart/knowledge/contents/wiki/<contentsId>/` 其中之一（同一规格书内须保持一致）

### URL 编码规约

- 半角 `[` → `%5B`，半角 `]` → `%5D`，半角空格 → `%20`
- 日文字符・全角括号（`（` `）`）保持原样（无需编码，Knowledge 一侧会自动路由）
- 哈希片段（`#section`）保持不变

## 纪元毫秒数（时间戳）

- `commons/groups/*.json` 的 `createDate`／`recordDate`
- 拥有 `wiki/.../attachment` 的页面的 `attachmentFileInfo[].createDate`

以上均为 Unix 纪元毫秒数的数值（例：`1779423192916`）。只需统一填入生成时刻即可。

## 转换步骤（实现流程）

1. **输入验证** … 确认 `doc/<BPM流程名>-prompt/` 下的必需文件（`specification.md`／`business-data.md`／`supplement.md`／`to-be-discussed.md`／`*.bpmn`）是否存在
2. **元信息提取**
   - BPM 流程名 … 从 `specification.md` 开头的 `# <名称> 仕様書` 中提取
   - `contentsId` … BPM 流程的英文名（kebab-case）。也可从 BPMN 文件名派生
   - 各功能目录的功能名 … 从其下 `*-screen.md` 开头的标题中提取
3. **页面 ID 编号** … 按根页面／固定页面／功能文件夹／画面／逻辑的顺序编号 `wikiPageCd`。BPMN 附件的 `fileCd` 同样进行编号
4. **JSON 构建**
   - 生成 `commons/groups/im_bpm_specifications.json`
   - 生成 `wiki/<contentsId>/<contentsId>.json`（将根页面的 `wikiPageCd` 设为 `mainPageCd`）
   - 从各 Markdown 文件生成 Wiki 页面 JSON（参见[文件规格](#文件规格) §3）
5. **Markdown 正文的转换**
   - 读取各页面的正文，将链接替换为 Knowledge 的 URL 格式（参见 [Markdown 内链接的转换](#markdown-内链接的转换)）
   - 换行须为 `\n`，并作为字符串在 JSON 中正确转义（双引号、反斜杠等）
6. **附件文件的配置** … 将 BPMN 文件以二进制原样复制到 `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`（无扩展名）
7. **zip 打包** … 将上述目录结构原样压缩为 zip。zip 文件名推荐使用 `im_knowledge_<YYYYMMDD>_<HHMM>.zip`

## 输出示例（最小结构布局）

```
im_knowledge_<YYYYMMDD>_<HHMM>.zip
├─ commons/groups/im_bpm_specifications.json
└─ wiki/<contentsId>/
   ├─ <contentsId>.json                                    （contentsId.json，mainPageCd=<root>）
   ├─ <root>/<root>.json                                   （title=<BPM流程名>，parent=null，sortKey="0"）
   │     └─ attachment/<bpmnFileCd>                        （<BPMN 文件名>.bpmn 的二进制数据）
   ├─ <pageA>/<pageA>.json                                 （title=仕様書，parent=<root>，sortKey="1"）
   ├─ <pageB>/<pageB>.json                                 （title=業務データ定義，parent=<root>，sortKey="2"）
   ├─ <pageC>/<pageC>.json                                 （title=要検討事項，parent=<root>，sortKey="8"）
   ├─ <pageD>/<pageD>.json                                 （title=仕様採用方針と補足事項，parent=<root>，sortKey="9"）
   ├─ <pageE>/<pageE>.json                                 （title=対話履歴，parent=<root>，sortKey="10"）
   ├─ <folderF>/<folderF>.json                             （title=[<功能名>]機能，parent=<root>，sortKey="11"）
   ├─ <pageF1>/<pageF1>.json                               （title=[<功能名>]画面定義，parent=<folderF>，sortKey="0"）
   ├─ <pageF2>/<pageF2>.json                               （title=[<功能名>]ロジック定義，parent=<folderF>，sortKey="1"）
   └─ ...（按功能文件夹数量。sortKey 依次为 11, 12, ...）
```

## 注意事项

- **JSON 须以单行输出**（示例 zip 已经过压缩/minify）。无需为了可读性而添加缩进
- **JSON 须为 UTF-8／无 BOM**。日文字符无需转义，须原样嵌入（`"contentsName":"車両管理"`）
- **JSON 文件名・目录名须与 `wikiPageCd`／`contentsId`／`fileCd` 完全一致**。若出现拼写错误，将破坏 Knowledge 一侧导入时的关联
- **须严格保持 `parentWikiPageCd` 的一致性**。若引用了不存在的父 `wikiPageCd`，将导致导入失败
- **`mainPageCd` 须始终指向根页面的 `wikiPageCd`**
- **附件文件须以无扩展名的形式保存**，并通过 `attachmentFileInfo[].fileName` 保留原始文件名
- **`{{child_pages}}` / `{{attachment(...)}}` 占位符**为 Knowledge 标准语法。`{{attachment(name)}}` 中的 `name` 须与 `attachmentFileInfo[].fileName` 精确一致
- **不得残留 Markdown 内未转换的相对链接**（若有转换遗漏将导致链接失效）
- **须将 groupId（`im_bpm_specifications`）固定为同一值**，以便多次导入相同 groupId 的 zip 也不会出现问题
- **不推荐将 BPMN 文件名转换为半角英数字**。Knowledge 也能处理日文文件名，只要写在 `{{attachment(...)}}` 中的名称与 `fileName` 一致即可正常工作
- **页面标题中不得包含斜杠**。

## 参照

- 输入规格：`.agents/skills/bpm-docs-generator/SKILL.md`（规格书目录结构）
