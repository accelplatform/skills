---
name: test-spec-generator
description: spec/ 配下の仕様書（ビジネス要件・受け入れ基準）から、xlsx 形式（officecli 使用）または HTML 形式（officecli 不要）の試験観点一覧・試験項目書を生成する。既存の試験項目書テンプレート（xlsx）のシート構成・列レイアウト・書式（ヘッダ色・罫線・フォント）を分析して踏襲し、新規機能の試験資材を作成する。出力は既定で docs/test-specs/xlsx/ または docs/test-specs/html/ 配下に保存する。「試験項目書を作って」「試験観点一覧を作って」「xlsxでテストケースを作成して」「officecliで試験資材を作って」「Excelの試験項目書をテンプレートから作って」「試験項目書をHTMLで作って」「officecliが無い環境向けにテスト仕様書を作って」と言及されたときに使用。
allowed-tools: Bash, Read, Write, Glob
---

# 試験項目書生成スキル (test-spec-generator)

## 目的

`spec/` 配下の仕様書の受け入れ基準（AC-\* 等）から、

1. **試験観点一覧** — 全機能の受け入れ基準を機能・画面・優先度付きで網羅した一覧シート
2. **試験項目書** — 画面単位の詳細な操作/期待結果を記載したシート（既存テンプレートの「コンテナ」型レイアウトを踏襲）

を生成する。出力形式は2種類あり、**同じ spec.json から両方生成できる**。

| 形式 | 生成スクリプト | 必要ツール | 用途 |
|---|---|---|---|
| xlsx | `scripts/build-test-spec.js` | officecli | Excel でそのまま開いて配布・記入する運用 |
| HTML | `scripts/build-test-spec-html.js` | 不要（Node のみ） | officecli を導入できない環境向け。ブラウザで閲覧する運用 |

既存の試験項目書 xlsx がある場合は、それをテンプレートとしてシート構成・書式を分析し、同じ見た目で新規機能分を作成する（xlsx 出力の場合のみ。HTML 出力は officecli を使わないため、テンプレートの罫線・厳密な色までは再現しない）。

出力先は既定で **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** 配下（形式別ディレクトリ、ファイル名は `<機能ID>-test.xlsx` / `<機能ID>-test.html`）。詳細は [reference/spec-schema.md](reference/spec-schema.md) の `outputFile` / `outputFileHtml` / `key` を参照。

## 前提条件

- xlsx 出力: officecli がインストール済みであること（`which officecli` で確認）。未インストールの場合はユーザに導入を依頼するか、HTML 出力に切り替える。
- HTML 出力: Node.js のみで動作する（追加ツール不要）。

## 使用タイミング

- 「〇〇機能の試験項目書を作って」「試験観点一覧を作って」
- 「このxlsxをテンプレートに、△△の試験資材を作って」（既存テンプレートを渡された場合）
- 「officecliでExcelのテストケースを作成して」
- 「officecliが無い環境でも見られるように、試験項目書をHTMLで作って」

## 生成手順

### 1. 出力形式をユーザに確認する（未指定の場合は必須）

ユーザの依頼文に xlsx / HTML のどちらかが明示されている場合（例:「xlsxで」「officecliで」「HTMLで」「officecliが無い環境向けに」）はそれに従い、確認不要。

明示されていない場合は、生成を始める前に **必ず** AskUserQuestion 等でユーザに以下を確認する。

- **xlsx 形式**（officecli 使用、Excel でそのまま開いて配布・記入する運用）
- **HTML 形式**（officecli 不要、ブラウザで閲覧する運用）
- 両方

officecli が未インストールの環境（`which officecli` で未検出）であれば、その旨を伝えた上で HTML 形式を推奨してよいが、それでも最終判断はユーザに委ねる（無許可で片方に決め打ちしない）。

### 2. テンプレート分析（既存の試験項目書 xlsx がある場合）

```bash
officecli view <template.xlsx> text                      # 内容を一覧（まずこれで全体像を掴む）
officecli get <template.xlsx> "/<シート>/<セル>" --json   # セル単位の書式取得
```

**重要**: `get` が返す `fill` はテーマ色 + tint（明度調整）を単純化して `"dk2"` のような名前だけを返し、tint 値を落とす。これをそのまま `set` の `fill`（6桁HEX必須）に使うと元ファイルと全く違う色になる。ヘッダ色などを正確に再現する必要がある場合は、必ず [reference/officecli-fill-color.md](reference/officecli-fill-color.md) の手順で `raw` から実HEXを計算すること。**「元ファイルと見た目が違う」と指摘されたら、まずここを疑う。**

officecli コマンド全般は [reference/officecli-cheatsheet.md](reference/officecli-cheatsheet.md) を参照。

テンプレートがない場合は、既定のシート構成・書式（後述）でゼロから生成する。

### 3. spec/ の仕様書を読み込む

対象機能の `spec/<機能ID>/` 配下（`business-requirements.md` の受け入れ基準表、`system-requirements.md` の画面一覧・機能要件、`detailed-design.md`）を読み込む。受け入れ基準表がない場合は、`README.md` 等から対象ドキュメントの場所を確認する。

### 4. スコープをユーザに確認する（必須）

仕様書の画面数が多い場合、全画面を同じ粒度で試験項目書化すると非常に大部数になる。**必ず** AskUserQuestion 等でユーザに確認してから生成すること。

- 試験観点一覧（受け入れ基準の網羅）は比較的軽量なので、基本的に全件生成してよい
- 試験項目書（画面単位の詳細操作項目）は、代表画面のみの試作か、全画面のフル生成かをユーザに選ばせる

判断を勝手に行わない（全画面を無許可でフル生成しない、逆に代表画面だけに絞って「網羅した」と報告しない）。

### 5. spec.json を組み立てる

[reference/spec-schema.md](reference/spec-schema.md) の形式で spec.json を組み立てる。受け入れ基準1件が複数の試験項目に分解されることが多い点、備考欄に元の受け入れ基準IDを必ず記録する点（トレーサビリティ確保）に注意する。

**`itemSheets[].items[].action`（アクション）は、必ず試験実施者がそのまま作業できる具体的な操作手順で書くこと。** 「検索・選択」「クリック」のような抽象的なラベルだけで済ませない。1操作1行として `\n` 区切りで「1. 」「2. 」...のように項番を付けて複数行に分割する（xlsx・HTML とも `\n` はセル内改行としてそのまま表示される。詳細・具体例は [reference/spec-schema.md](reference/spec-schema.md#試験項目書画面単位の作り方原則) 参照）。

サンプル: [examples/equip-001.spec.json](examples/equip-001.spec.json)（社内備品貸出システムの試験観点一覧68件+代表3画面の試験項目書を実際に生成した spec。`action` フィールドが番号付き複数行の実例になっている）

### 6. 生成スクリプトを実行

xlsx（officecli が使える場合）:

```bash
node .claude/skills/test-spec-generator/scripts/build-test-spec.js <spec.jsonのパス> [--out <output.xlsx>]
```

このスクリプトが行うこと:

- `officecli create` で新規 xlsx を作成（既存ファイルがあれば上書きせず追記モードで batch を実行）
- 前提条件・集計・試験観点一覧・試験項目書_\* の各シートを追加
- CSV 一括インポート（`officecli import`）と、ヘッダ/データセルへの書式一括適用（`officecli batch` の `set` コマンド群）
- 試験項目書_\* シートの A列（確認）には、データ入力規則（`officecli add ... --type validation`、`type: list`、選択肢「✓ / 空欄」）でドロップダウンを設定する。Excel はネイティブのチェックボックス（フォームコントロール）を officecli 経由で扱えないため、この方式で代替している
- `officecli save` で保存し、`officecli close` で常駐プロセスを終了
- 出力先は spec.json の `outputFile` を優先し、未指定なら `docs/test-specs/xlsx/<spec.key>-test.xlsx`

失敗コマンドがあれば標準エラーに出力して非ゼロ終了する（`/Sheet1` の remove 失敗のみは無害なため無視される）。

HTML（officecli が無い環境向け）:

```bash
node .claude/skills/test-spec-generator/scripts/build-test-spec-html.js <spec.jsonのパス> [--out <output.html>]
```

- 同じ spec.json をそのまま渡せる（xlsx 版と入力互換）
- officecli を使わず、Node.js の `fs` のみで自己完結した単一 HTML ファイルを生成する
- 前提条件シートは `<table>` ではなく `<ol>`/`<ul>` の階層リストとして出力する（セルの位置＝先頭からの空セル数をインデント階層とみなして変換。同じ階層の項目が全て「1)」等の番号接頭辞を持つ場合は `<ol>` にして接頭辞を除去、それ以外は `<ul>` にして先頭の「・」を除去する。マーカーと元テキストの二重表示を避けるため。詳細は [reference/spec-schema.md](reference/spec-schema.md) の変換ルール参照）。それ以外のシート（集計・試験観点一覧・試験項目書_\*）は表形式が読みやすいため `<table>` のまま
- 試験項目書_\* シートには、実施者が読みながら確認状況を記録するための「確認」列を1列目（A列）に持つ（xlsx・HTML共通のレイアウト。以前はここが xlsx 側の空きスペーサー列だったが、この列自体を確認用に転用した）。HTML では `<select>`（未確認「-」 / OK / NG の3択）を配置する。チェックボックスにしなかったのは「確認してOK」と「確認してNG」の区別がつかないため。**NG を選んだ行は背景を赤くハイライトする**（`change` イベントで対象 `<tr>` に `confirm-ng` クラスを付け外しする、CSSの `:has()` だけでは `<select>` の選択値をライブに反映できないため）。**OK/NG を選ぶと「試験日」列のセルに本日の日付（`YYYY-MM-DD`）を自動入力する**（値を変更するたびに日付は再取得される）。選択状態・試験日はブラウザの `localStorage` に保存され、ページを再読み込みしても保持される（サーバ・officecliを一切使わないため保存先はブラウザ内のみ。他の端末・他のユーザとは共有されない。日付はブラウザのローカル時刻を使うため、実施者の端末設定に依存する）。なお「結果」「確認者」「確認日」列は、この「確認」列（OK/NG）と「試験日」列の自動入力に役割が重複するため廃止した。正式な確認記録（誰が確認したか）が別途必要な場合は、試験管理台帳等を使うこと。集計・試験観点一覧シートにはこの確認列が無いため対象外
- 目次・シート別見出し・ライト/ダークテーマ対応の CSS を含む1ファイルとして出力する
- 出力先は spec.json の `outputFileHtml` を優先し、未指定なら `docs/test-specs/html/<spec.key>-test.html`

両方生成したい場合は、同じ spec.json に対して両方のスクリプトを実行すればよい（`outputFile` と `outputFileHtml` を両方指定しておくと衝突しない）。

### 7. 検証

```bash
officecli view <output.xlsx> text   # xlsx の場合
```

xlsx はテキストビューで内容を確認する。ヘッダ色やフォントなど見た目を厳密に確認したい場合は `officecli get <output.xlsx> "/<シート>/<セル>" --json` でテンプレートの同じセルと比較する。

HTML はブラウザで直接開くか、生成された `<table>` の行数・列見出しを `grep`/Read で確認する。

## 出力構造（シート構成）

| シート | 内容 | 生成元 |
|---|---|---|
| 前提条件 | テスト概要・試験環境・必要マスタ・注意事項 | 仕様書のビジネス要件・共通定義から手動作成 |
| 集計 | 各シートの項目数集計 | build-test-spec.js が自動集計 |
| 試験観点一覧 | 受け入れ基準（AC-\*）を機能・画面・優先度付きで一覧化 | business-requirements.md の受け入れ基準表を変換 |
| 試験項目書_\<画面名\> | 画面単位の詳細操作/期待結果（コンテナ型: カテゴリ/画面は各ブロック先頭行のみ記載） | system-requirements.md の画面一覧 + 受け入れ基準を画面ごとに詳細化 |

列構成の詳細・spec.json の全フィールドは [reference/spec-schema.md](reference/spec-schema.md) を参照。

## ファイル構成

```
test-spec-generator/
├── SKILL.md                          # このファイル
├── scripts/
│   ├── lib/
│   │   └── spec-tables.js            # spec.json → 表データへの変換ロジック（xlsx版・HTML版で共有）
│   ├── build-test-spec.js            # spec.json → xlsx を一括生成（officecli 使用）
│   ├── build-test-spec-html.js       # spec.json → 自己完結HTMLを一括生成（officecli 不要）
│   └── theme-tint.js                 # テーマ色+tint → 実HEX変換ユーティリティ
├── reference/
│   ├── spec-schema.md                # 両スクリプトに共通の spec.json 全フィールド
│   ├── officecli-cheatsheet.md       # officecli コマンド早見表・トラブルシューティング
│   └── officecli-fill-color.md       # テーマ色+tint の罠と実HEX計算手順
└── examples/
    └── equip-001.spec.json           # 実際に生成した spec の実例（社内備品貸出システム）
```

## 出力先の既定ディレクトリ

生成物は既定で **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** 配下に、形式別ディレクトリで保存する（プロジェクトルート直下）。ファイル名は spec.json のトップレベルフィールド `spec.key`（機能ID、例: `equip-001`）から `<spec.key>-test.<拡張子>` を組み立てる。

```
docs/test-specs/
├── xlsx/
│   └── <機能ID>-test.xlsx   # xlsx出力（build-test-spec.js、spec.outputFile が優先）
└── html/
    └── <機能ID>-test.html   # HTML出力（build-test-spec-html.js、spec.outputFileHtml が優先）
```

同じ機能について xlsx・HTML の両方を生成した場合、`docs/test-specs/xlsx/equip-001-test.xlsx` と `docs/test-specs/html/equip-001-test.html` のように形式ごとのディレクトリに分かれて置かれる（機能ID単位のフォルダは作らない）。

spec.json に `outputFile` / `outputFileHtml` を明示すればこの既定を上書きできる（`--out` 引数はさらに優先）。過去バージョンのこのスキルは `test/` 配下、その後 `docs/test-specs/<機能ID>/<機能ID>.xxx` に出力していたが、パス中に機能IDが重複して冗長だったため、形式別ディレクトリ + `<機能ID>-test.<拡張子>` の構成に変更した。

## 禁止事項: Artifact（claude.ai の外部公開機能）に出力しない

**生成した試験観点一覧・試験項目書を、Artifact ツール（claude.ai 上に HTML/Markdown を公開する機能）や、その他リポジトリ外の外部ホスティングサービスに出力・公開してはならない。**

- 試験項目書は業務システムの仕様・受け入れ基準を含む社内資料であり、社外に公開してよい情報とは限らない。プロジェクトの方針として、資料を安易に外部サーバへ置くことは禁止されている
- Artifact は既定では非公開（作成したユーザのみ閲覧可）だが、共有メニューから第三者に共有可能な状態になる、URLが発行される等、**リポジトリの外に成果物のコピーが生成される**こと自体がこのプロジェクトの方針に反する
- 生成結果をユーザに見せたい場合は、Artifact 化・スクリーンショット化・外部サービスへのアップロードをせず、**リポジトリ内のファイルパス（`docs/test-specs/html/<機能ID>-test.html` 等）を案内し、ローカルで開いてもらう**か、`officecli view`/Read ツールでテキスト内容を提示すること
- 誤って Artifact 化してしまった場合、Artifact ツールに削除（unpublish）機能は無いため、ユーザ自身に `claude.ai/code/artifacts` から手動削除してもらう必要がある（AI側では取り消せない）。実行前に必ず踏みとどまること

## 注意事項

- **既存資材の上書き**: `outputFile`/`outputFileHtml` に既存ファイルを指定した場合、両スクリプトとも既存ファイルを上書きする（`build-test-spec.js` は `officecli create` をスキップして既存ファイルに `batch` を再実行、`build-test-spec-html.js` は単純に上書き）。既存の手動編集内容を壊す可能性があるため、既存ファイルを対象にする場合はユーザに確認すること。
- **`build-test-spec.js` を既存 xlsx に対して再実行するとデータ入力規則の重複エラーになることがある**: 試験項目書_\* シートの確認列（A列）に付与するデータ入力規則（`add ... --type validation`）は `set` と違って冪等ではなく、同じセル範囲に既に規則がある状態で再度 `add` すると `DataValidation sqref '...' overlaps existing validation` エラーになり、バッチ全体が失敗として扱われる。spec.json の内容（前提条件の行構成など）を変更して再生成する場合は、**対象の xlsx を一度削除してから実行する**か、別ファイル名で出力すること。
- **列幅・書式の完全一致は保証しない**: `officecli` の read/write は完全な round-trip を保証しない（特に fill の tint、罫線色の微妙な違い等）。見た目の厳密な一致が求められる場合は、生成後に必ずテンプレートと1セルずつ比較すること。HTML 出力はそもそも xlsx の罫線・厳密な書式を再現する設計ではない（表の構造とヘッダ色のみ踏襲、前提条件は表ではなくリストに変換）。
- **前提条件のリスト変換はヒューリスティック**: `prerequisiteRows` は元々 xlsx のセル位置合わせ用データのため、HTML 変換時は「先頭からの空セル数」をインデント階層とみなして `<ol>`/`<ul>` に変換している。同じ階層の連続する項目が全て `1)` `2)` ... のような番号接頭辞を持つ場合のみ `<ol>` として接頭辞を除去し、それ以外は `<ul>` として先頭の `・` を除去する（一部だけ番号付き・大半が番号無しのような混在ブロックがあると `<ul>` 側に倒れて番号接頭辞が残ったまま表示される）。また1行に複数の非空セルがある場合は `ラベル: 値` 形式に結合するため、表形式（例: モジュール一覧のヘッダ行）を意図した行は不自然な文字列になることがある。生成後に前提条件セクションを目視確認し、不自然な箇所があれば `prerequisiteRows` の行内容自体を調整すること。
- **spec.json は多言語対応していない**: 生成される xlsx/HTML は日本語のみ。多言語の試験項目書が必要な場合は、spec.json ごと言語別に用意して複数回実行する。

## 棲み分け

| スキル | 用途 |
|---|---|
| **test-spec-generator**（本スキル） | xlsx 形式の試験観点一覧・試験項目書の生成 |
| `jssp-playwright-test` | 実際に動く JSSP 画面（html + js）に対する E2E テストコードの生成 |
| `jssp-jest-test` | ファンクションコンテナ（js）の単体テストの生成 |

試験項目書は「人間が手動で実施する試験の手順書」であり、`jssp-playwright-test` / `jssp-jest-test` が生成する自動テストコードとは別物。両方が必要な場合は組み合わせて使う（試験観点一覧を先に作り、それを元に自動テストのケース網羅性を確認する、等）。
