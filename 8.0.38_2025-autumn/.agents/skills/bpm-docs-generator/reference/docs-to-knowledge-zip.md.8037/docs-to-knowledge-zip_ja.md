# BPM 仕様書 → intra-mart Knowledge zip 変換スキル

## 概要

bpm-docs-generator が生成した仕様書（`doc/<BPMプロセス名>-prompt/` 配下）を、intra-mart Knowledge へインポート可能な zip ファイル（`commons/groups/*.json` と `wiki/<contentsId>/...` 構造）に変換する。

入力となる仕様書は Markdown 形式・ディレクトリ階層構造であり、出力は Knowledge の「グループ／コンテンツ／Wiki ページ／添付ファイル」モデルに対応した JSON 群と zip パッケージとなる。

## 入力

`doc/<BPMプロセス名>-prompt/` ディレクトリ。`bpm-docs-generator` 生成物の構成に従う：

```
<BPMプロセス名>-prompt/
├─ specification.md           プロセス全体仕様
├─ <BPMプロセス名>.bpmn       元の BPMN ファイル（添付）
├─ business-data.md           業務データ定義
├─ to-be-discussed.md         要検討事項
├─ supplement.md             仕様採用方針と補足事項を記載
├─ interactive-log.md        対話履歴、結果報告などを記載
└─ <機能ディレクトリ>/         （複数）
   ├─ <機能名>-screen.md      画面定義
   └─ <機能名>-logic.md       ロジック定義
```

## 出力

`im_knowledge_<YYYYMMDD>_<HHMM>.zip` （ファイル名は任意）。

zip 直下のディレクトリ構造は以下：

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
      │     └─ <fileCd>            ← BPMN 等の添付ファイル本体（拡張子なし）
      ├─ <pageCd>/
      │  └─ <pageCd>.json
      └─ ...（ページ数分）
```

- `<contentsId>` … 半角英数ハイフン区切り（kebab-case）
- `<rootPageCd>` / `<pageCd>` / `<fileCd>` … 各々ユニークな 12〜15 文字の小文字英数 ID（[ID 生成](#id-生成ルール) 参照）

## 全体マッピング表

| 入力（`<BPMプロセス名>-prompt/` 配下） | 出力（zip 内） | parentWikiPageCd | sortKey | 備考 |
|---|---|---|---|---|
| （プロセス名そのもの） | `wiki/<contentsId>/<rootPageCd>/<rootPageCd>.json` | `null` | `"0"` | ルートページ。title=プロセス名 |
| `<BPMプロセス名>.bpmn` | `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>` | - | - | ルートページの添付として登録 |
| `specification.md` | 仕様書ページ | rootPageCd | `"1"` | title=「仕様書」 |
| `business-data.md` | 業務データ定義ページ | rootPageCd | `"2"` | title=「業務データ定義」 |
| `to-be-discussed.md` | 要検討事項ページ | rootPageCd | `"8"` | title=「要検討事項」 |
| `supplement.md` | 仕様採用方針・補足事項ページ | rootPageCd | `"9"` | title=「仕様採用方針と補足事項を記載」 |
| `interactive-log.md` | 対話履歴ページ | rootPageCd | `"10"` | title=「対話履歴」 |
| `<機能ディレクトリ>/` | 機能フォルダページ | rootPageCd | `"11"` 以降 | title=「[<機能名>]機能」。本文は `# 機能定義\n\n{{child_pages}}` |
| `<機能ディレクトリ>/<機能名>-screen.md` | 画面定義ページ | 機能フォルダ pageCd | `"0"` | title=「[<機能名>]画面定義」 |
| `<機能ディレクトリ>/<機能名>-logic.md` | ロジック定義ページ | 機能フォルダ pageCd | `"1"` | title=「[<機能名>]ロジック定義」 |

> **sortKey の付番方針**
> - ルート直下の固定ページは仕様書(1)→業務データ(2)を前半、検討事項(8)・補足(9)を後半に配置
> - 機能フォルダは 11 以降。
> - 機能フォルダ内は screen=0, logic=1 で固定

## ファイル仕様

### 1. グループ定義 `commons/groups/im_bpm_specifications.json`

固定の単一グループ「IM-BPM 仕様書」配下にすべての BPM 仕様書（コンテンツ）を配置する。他の BPM 仕様書を同じ Knowledge へインポートする際もこの groupId を共有する。

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

- `createDate` / `recordDate` … 生成時刻の Unix エポックミリ秒（13 桁数値）
- localizes は 3 言語分（zh_CN / en / ja）を必ず含める。多言語対応しない場合も同一テキストでよい

### 2. コンテンツ定義 `wiki/<contentsId>/<contentsId>.json`

各 BPM プロセスに対応するコンテンツ単位のメタ情報。

```json
{
  "contentsId": "<contentsId>",
  "groupId": "im_bpm_specifications",
  "contentsType": "wiki",
  "contentsName": "<BPMプロセス名>",
  "description": null,
  "contents": null,
  "thumbnail": "data:image/png;base64,<base64エンコード>",
  "tagIds": [],
  "mainPageCd": "<rootPageCd>"
}
```

- `mainPageCd` … ルートページの `wikiPageCd`（必須・正確な参照）
- `thumbnail` … 任意。BPMN のサムネイル PNG を base64 エンコードした data URL を埋め込む。省略時はサンプルに合わせ空文字または既定画像とする
- `tagIds` … 空配列で問題ない

### 3. Wiki ページ `wiki/<contentsId>/<wikiPageCd>/<wikiPageCd>.json`

ディレクトリ名・JSON ファイル名は `wikiPageCd` と完全一致させる。

```json
{
  "wikiPageCd": "<wikiPageCd>",
  "title": "<ページタイトル>",
  "parentWikiPageCd": "<親pageCd or null>",
  "sortKey": "<数値文字列>",
  "formatType": "MARKDOWN",
  "contents": "<Markdown本文>",
  "comment": "",
  "attachmentFileInfo": [
    {
      "fileCd": "<fileCd>",
      "fileName": "<元のファイル名（拡張子付き）>",
      "createDate": <epochMillis>,
      "comment": ""
    }
  ]
}
```

- `parentWikiPageCd` … ルートページのみ `null`、それ以外は親ページの `wikiPageCd`
- `sortKey` … **文字列**として格納（例: `"1"` ）。数値ソート想定なので `"01"` のようなゼロ詰めは行わない
- `formatType` … 常に `"MARKDOWN"`
- `attachmentFileInfo` … 添付がない場合は `[]`（空配列）

### 4. 添付ファイル `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`

- ファイル名は `<fileCd>` のみで **拡張子を付けない**
- 中身は元ファイルのバイナリそのまま（BPMN は UTF-8 / CRLF の XML）
- ページ JSON の `attachmentFileInfo[].fileCd` と完全一致させる

### 5. ルートページ本文の規約

ルートページの `contents` は固定パターンとする：

```markdown
# 仕様

{{child_pages}}

# BPMN
{{attachment(<BPMNファイル名>.bpmn)}}
```

- `{{child_pages}}` … 配下の子ページ一覧を Knowledge が自動展開
- `{{attachment(...)}}` … 添付ファイルを本文中に埋め込み。括弧内は `attachmentFileInfo[].fileName` と一致

### 6. 機能フォルダページの本文

子ページ集約用の薄いフォルダページとして、固定本文：

```markdown
# 機能定義

{{child_pages}}
```

## ID 生成ルール

`wikiPageCd` / `fileCd` は zip 内で一意な 12〜15 文字の小文字英数（base36 風）とする。サンプル実例:

- `012ii53f4f4b6c` （14 文字）
- `8i0vb6rdl34z2kc` （15 文字）

推奨実装: `Math.random().toString(36).slice(2, 16)` などで生成し、重複チェックして使用する。`contentsId` は人間可読な kebab-case を採用する。

## Markdown 内リンクの変換

仕様書 Markdown 内のローカル相対リンク（例: `[business-data.md](business-data.md)`）は、Knowledge の URL 形式に置換する必要がある。

### 置換ルール

| 元リンク（例） | 置換後 |
|---|---|
| `[業務データ](business-data.md)` | `[業務データ](./knowledge/contents/wiki/<contentsId>/業務データ定義)` |
| `[要検討事項](to-be-discussed.md)` | `[要検討事項](./knowledge/contents/wiki/<contentsId>/要検討事項)` |
| `[<機能名>](<機能ディレクトリ>/)` | `[<機能名>](./knowledge/contents/wiki/<contentsId>/%5B<機能名>%5D機能)` |
| `[<機能名>画面](<機能ディレクトリ>/<機能名>-screen.md)` | `[<機能名>画面](./knowledge/contents/wiki/<contentsId>/%5B<機能名>%5D画面定義)` |
| `[<機能名>ロジック](<機能ディレクトリ>/<機能名>-logic.md)` | `[<機能名>ロジック](./knowledge/contents/wiki/<contentsId>/%5B<機能名>%5Dロジック定義)` |

### 変換手順

1. リンク先のローカルパス（相対パス）から対応する **ページタイトル** を逆引きする
2. パスの末尾要素を「ページタイトルを URL エンコードした文字列」に置換する
3. URL の前置きは `./knowledge/contents/wiki/<contentsId>/` または `/imart/knowledge/contents/wiki/<contentsId>/` のいずれかに統一する（同一仕様書内では揃える）

### URL エンコード規約

- 半角 `[` → `%5B`、半角 `]` → `%5D`、半角スペース → `%20`
- 日本語文字・全角括弧（`（` `）`）はそのまま（エンコードしなくても Knowledge 側でルーティングされる）
- ハッシュフラグメント（`#section`）は維持する

## エポックミリ秒（タイムスタンプ）

- `commons/groups/*.json` の `createDate`／`recordDate`
- `wiki/.../attachment` を持つページの `attachmentFileInfo[].createDate`

これらはすべて Unix エポックミリ秒の数値（例: `1779423192916`）。生成時刻を統一して埋めれば十分。

## 変換手順（実装フロー）

1. **入力検証** … `doc/<BPMプロセス名>-prompt/` 直下の必須ファイル（`specification.md`／`business-data.md`／`supplement.md`／`to-be-discussed.md`／`*.bpmn`）の存在を確認する
2. **メタ情報抽出**
   - BPM プロセス名 … `specification.md` の冒頭 `# <名称> 仕様書` から抽出
   - `contentsId` … BPM プロセス英語名（kebab-case）。BPMN ファイル名から派生させても良い
   - 各機能ディレクトリの機能名 … 配下の `*-screen.md` 冒頭ヘッダから抽出
3. **ページ ID 採番** … ルート／固定ページ／機能フォルダ／画面／ロジック の順に `wikiPageCd` を採番。BPMN 添付の `fileCd` も同様に採番
4. **JSON 構築**
   - `commons/groups/im_bpm_specifications.json` を生成
   - `wiki/<contentsId>/<contentsId>.json` を生成（`mainPageCd` にルートページの `wikiPageCd` を設定）
   - 各 Markdown ファイルから Wiki ページ JSON を生成（[ファイル仕様](#ファイル仕様) §3）
5. **Markdown 本文の変換**
   - 各ページの本文を読み込み、リンクを Knowledge URL 形式に置換（[Markdown 内リンクの変換](#markdown-内リンクの変換)）
   - 改行は `\n`、JSON 内で文字列としてエスケープ済みであること（ダブルクォート・バックスラッシュなど）
6. **添付ファイル配置** … BPMN ファイルをバイナリのまま `wiki/<contentsId>/<rootPageCd>/attachment/<fileCd>`（拡張子なし）にコピー
7. **zip 化** … 上記ディレクトリ構造をそのまま zip 圧縮。zip ファイル名は `im_knowledge_<YYYYMMDD>_<HHMM>.zip` を推奨

## 出力例（最小構成のレイアウト）

```
im_knowledge_<YYYYMMDD>_<HHMM>.zip
├─ commons/groups/im_bpm_specifications.json
└─ wiki/<contentsId>/
   ├─ <contentsId>.json                                    （contentsId.json, mainPageCd=<root>）
   ├─ <root>/<root>.json                                   （title=<BPMプロセス名>, parent=null, sortKey="0"）
   │     └─ attachment/<bpmnFileCd>                        （<BPMNファイル名>.bpmn のバイナリ）
   ├─ <pageA>/<pageA>.json                                 （title=仕様書, parent=<root>, sortKey="1"）
   ├─ <pageB>/<pageB>.json                                 （title=業務データ定義, parent=<root>, sortKey="2"）
   ├─ <pageC>/<pageC>.json                                 （title=要検討事項, parent=<root>, sortKey="8"）
   ├─ <pageD>/<pageD>.json                                 （title=補足事項, parent=<root>, sortKey="9"）
   ├─ <pageE>/<pageE>.json                                 （title=対話履歴, parent=<root>, sortKey="10"）
   ├─ <folderF>/<folderF>.json                             （title=[<機能名>]機能, parent=<root>, sortKey="11"）
   ├─ <pageF1>/<pageF1>.json                               （title=[<機能名>]画面定義, parent=<folderF>, sortKey="0"）
   ├─ <pageF2>/<pageF2>.json                               （title=[<機能名>]ロジック定義, parent=<folderF>, sortKey="1"）
   └─ ...（機能フォルダ数分。sortKey は 11, 12, ... と続く）
```

## 注意事項

- **JSON は単一行で出力する**（サンプル zip は minify 済み）。可読性のためのインデントは不要
- **JSON は UTF-8 / BOM なし**。日本語文字はエスケープせず生のまま埋め込む（`"contentsName":"車両管理"`）
- **JSON ファイル名・ディレクトリ名と `wikiPageCd`／`contentsId`／`fileCd` は完全一致**させる。タイポすると Knowledge 側のインポートで関連が壊れる
- **`parentWikiPageCd` の整合性**を厳密に保つ。親が存在しない `wikiPageCd` を参照するとインポート失敗する
- **`mainPageCd` はルートページの `wikiPageCd`** を必ず指す
- **添付ファイルは拡張子なしで保存**し、`attachmentFileInfo[].fileName` で元ファイル名を保持する
- **`{{child_pages}}` / `{{attachment(...)}}` プレースホルダ** は Knowledge 標準の構文。`{{attachment(name)}}` の `name` は `attachmentFileInfo[].fileName` と正確に一致させる
- **Markdown 内の相対リンクを残さない**こと（変換漏れがあるとリンク切れになる）
- **同一の groupId（`im_bpm_specifications`）の zip を複数回インポートしても問題ない**ように、groupId は固定値とする
- **BPMN ファイル名は半角英数化を推奨**しないこと。Knowledge は日本語ファイル名も扱えるが、`{{attachment(...)}}` 内に書く名前と `fileName` が一致してさえいれば動作する
- **ページタイトルにスラッシュを含めない**こと。

## 参照

- 入力仕様: `.agents/skills/bpm-docs-generator/SKILL.md`（仕様書ディレクトリ構成）
