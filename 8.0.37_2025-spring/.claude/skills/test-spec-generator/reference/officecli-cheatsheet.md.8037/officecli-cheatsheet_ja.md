# officecli コマンドチートシート（本スキルで使う範囲）

officecli は xlsx/docx/pptx を CLI から読み書きできるツール。本スキルで使うのは主に以下。

## 読み取り

```bash
# シート内容をテキストで一覧表示（セル座標付き）。まずはこれで全体像を掴む
officecli view <file.xlsx> text

# 特定セル・行・シートの詳細書式を取得（フォント・fill・罫線・結合等）
officecli get <file.xlsx> "/<シート名>/<セル番地>" --json
officecli get <file.xlsx> "/<シート名>" --json          # シート全体（行・セルを再帰的に含む）
officecli get <file.xlsx> "/" --json                     # ワークブック全体（シート一覧・テーマカラー）

# raw XML（styles.xml, sheetN.xml 等）。fill の theme+tint 等、get で失われる情報の確認用
officecli raw <file.xlsx> "/xl/styles.xml"
officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"
officecli raw <file.xlsx> "/xl/workbook.xml"              # シート名 → sheetN.xml の対応確認
```

**セルのアドレス指定**: `/<シート名>/A1` のような Excel 記法。`/<シート名>/row[2]/cell[1]` のような添字記法は使えない場合がある（`Element not found` エラーになる）ので、まず `get` の `--json` 出力で実際に使われているパス形式（`/コンテナ/A2` 等）を確認してから使うこと。

## 書き込み

```bash
# 新規ファイル作成（常駐プロセスがバックグラウンドで起動し、以降のコマンドが高速化される）
officecli create <file.xlsx> --json

# シート追加（ifExists: "use" で既存シートがあれば再利用、エラーにしない）
officecli add <file.xlsx> "/" --type sheet --prop name=<シート名> --prop ifExists=use

# CSV/TSVを一括インポート（セルを1つずつ set するより大幅に高速）
officecli import <file.xlsx> "/<シート名>" --prop start-cell=A1 < data.csv

# セル書式の変更（fill は6桁HEX必須、テーマ名は不可。詳細は officecli-fill-color.md）
officecli set <file.xlsx> "/<シート名>/A1" --prop fill=#D6DCE5 --prop font.bold=true

# 複数コマンドを1回のプロセス起動でまとめて実行（本スキルの主な使い方）
officecli batch <file.xlsx> --input <batch.json> --json

# 変更をディスクへ反映（常駐プロセスは維持したまま）
officecli save <file.xlsx> --json

# 常駐プロセスを終了（他プロセスからファイルを読む前には save または close が必要）
officecli close <file.xlsx> --json
```

## `batch` コマンドの形式

`--input <file>` で渡す JSON は、以下の形の配列。

```json
[
  { "command": "add", "parent": "/", "type": "sheet", "props": { "name": "前提条件", "ifExists": "use" } },
  { "command": "import", "parent": "/前提条件", "props": { "start-cell": "A1" }, "text": "A1,B1\nA2,B2" },
  { "command": "set", "path": "/前提条件/A1", "props": { "font.bold": "true" } },
  { "command": "remove", "path": "/Sheet1" }
]
```

- `command` は `add` / `set` / `get` / `query` / `remove` / `move` / `swap` / `import` のいずれか
- 1コマンドが失敗しても後続コマンドは実行される（`--json` の結果に `summary.failed` として集計される）。失敗要因を確認してから修正・再実行すること
- **べき等性**: `add ... ifExists:"use"` は既存シートを再利用するため再実行しても安全。`import` は同じ開始セルへ再インポートすれば内容が上書きされる。`set` は差分マージなので、一度設定した値を「消す」には明示的に別の値で上書きする必要がある（[officecli-fill-color.md](officecli-fill-color.md) 参照）
- `/Sheet1` の `remove` は、既に削除済みだと `Sheet not found` エラーになるが無害。本スキルの `build-test-spec.js` は再実行時にこのエラーだけは握りつぶす

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `Invalid color value: 'dk2'` | `set` の `fill`/`font.color` にテーマ色名を渡した | 6桁HEXに変換する。[officecli-fill-color.md](officecli-fill-color.md) 参照 |
| `Element not found: row[2]/cell[1]` | セルパスの添字記法が間違っている | `get --json` の実際のパス（`/シート名/A2` 形式）を確認してから使う |
| ヘッダの色・フォントが元ファイルと違う | tint の見落とし、または `font.name` 未指定でCalibri既定になっている | `officecli get <file> "/<シート>/<セル>" --json` で自分が生成したファイルの実際の書式を確認し、テンプレート側と1セルずつ比較する |
| `Sheet not found: "Sheet1"` | 既に削除済みの `Sheet1` を再度 remove しようとした | 無害。再実行時は無視してよい |
| 生成後にファイルの中身が反映されていないように見える | `save`/`close` 前に別プロセスから読んだ | `batch` 実行後は必ず `save`（常駐継続）または `close`（常駐終了）を呼ぶ |
