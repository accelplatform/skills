# ユーザ定義タスク リファレンス

IM-LogicDesigner には通常タスク（`key.type = "application"`）に加えて、ユーザが自由に入出力とロジックを定義できる **ユーザ定義タスク**（`key.type = "localUserDefinition"`）がある。

## 通常タスクとの違い

| 項目 | 通常タスク | ユーザ定義タスク |
|---|---|---|
| `key.type` | `"application"` | `"localUserDefinition"` |
| `key.id` | 固定（`im_repositorySearchEntityData` 等） | ユーザ指定の `definitionId` |
| properties | タスク固有の単純プロパティ | `definition` オブジェクト内に全情報を内包 |
| 入出力定義 | dataMap の metadata 内（テンプレート固定 or MCP 解決） | `properties.definition.definitionData` 内（自由定義） |

## properties.definition の共通構造

```jsonc
{
  "definition": {
    "definitionId": "<一意なID>",
    "version": 1,
    "categoryId": "",
    "definitionType": "javascript",   // "javascript" | "rest" | "sql" | "db_fetch"
    "definitionName": "<表示名（英語）>",
    "sortNumber": 100,
    "definitionData": {
      "elementId": "<内部タスクID>",
      "iconId": null,
      "elementProperties": { ... },   // 種別固有の設定（後述）
      "inputDataDefinition": { ... }, // 入力型定義（自由定義）
      "outputDataDefinition": { ... } // 出力型定義（自由定義）
    },
    "localize": {
      "ja": "<日本語名>"
    }
  },
  "continueOnError": false
}
```

## 種別一覧

### 1. JavaScript 定義（`definitionType: "javascript"`）

ユーザが自由に JavaScript を組めるタスク。
Rhino で動作し、ファンクションコンテナと同じコーディング規約。

| 項目 | 値 |
|---|---|
| `elementId` | `im_scriptExecutor` |
| 主要プロパティ | `script`（Rhino JavaScript コード） |

**`elementProperties`:**

```jsonc
{
  "script": "function run(input) {\n  // input から値を取得し、処理結果を return\n  return { message: 'hello' };\n}"
}
```

- `run(input)` 関数が実行される
- `input` は `inputDataDefinition` で定義したフィールドを持つ
- 戻り値は `outputDataDefinition` で定義した構造に合致させる

**使用不可 API:**

IM-LogicDesigner の JavaScript 定義では JSSP の各 API が使用できるが、以下の API は使用できない。

| カテゴリ | 使用不可 API |
|---|---|
| Java 連携 | `java`, `Packages`, `loadClass` |
| ファイル・URL | `readFile`, `readUrl` |
| ランタイム制御 | `seal`, `serialize`, `spawn`, `sync`, `version` |
| リクエスト制御 | `execute`, `forward`, `include`, `load`, `redirect`, `secureRedirect`, `transmission` |
| ファイル・コンテンツ | `Content`, `File` |
| ユーティリティ | `ImAjaxUtil`, `LicenseRegister`, `Web`, `Transfer`, `Module`, `Procedure` |
| DB | `SystemDatabase` |
| ストレージ | `SystemStorage` |
| マネージャ | `PageManager`, `AdministratorManager`, `TenantInfoManager`, `WorkManager`, `PluginManager`, `VirtualTenantSwitcher` |
| セッション・クライアント | `Client`, `Permanent` |
| テナント・ライセンス | `TenantLicense`, `CustomerSuccessLicense`, `ImServiceRestrictor` |
| その他 | `Imart`, `garbageCollector` |
| v7.2 互換（非サポート） | `BatchManager`, `BatchServer`, `System`, `DataSourceMappingConfigurater`, `JsTestSuite`, `JsUnit`, `ResinDataSourceConfigurater`, `Batch`, `AccessSecurityManager`, `ActiveSessionManager`, `DuplicateLoginManager`, `LicenseManager`, `LoginBlockManager`, `LoginGroupManager`, `AdminMenuManager`, `AdminUserManager`, `ShortCutManager`, `WSAccessManager` |

これらを使用した場合、実行時にエラーとなる。代替手段として、REST 定義タスクや SQL 定義タスクで外部連携を行うこと。

### 2. REST 定義（`definitionType: "rest"`）

任意の HTTP/HTTPS リクエストを行うタスク。
ブラウザの fetch に相当する。

| 項目 | 値 |
|---|---|
| `elementId` | `im_httpclient` |

**`elementProperties`:**

```jsonc
{
  "endpointExpression": "https://api.example.com/items",
  "requestMethod": "GET",                  // "GET" | "POST" | "PUT" | "DELETE" 等
  "requestType": "x-www-form-urlencoded",  // "x-www-form-urlencoded" | "json" 等
  "requestHeaderNames": ["User-Agent"],
  "requestHeaderExpressions": ["MyApp/1.0"],
  "requestEncoding": "UTF-8",
  "requestFormKeys": ["Param1"],
  "requestFormValueExpressions": ["${param1}"],  // EL式で入力値を参照
  "followRedirect": true,
  "requestTimeoutInSeconds": 30,
  "responseType": "text",                  // "text" | "binary"
  "responseEncoding": "UTF-8",
  "checkStatusCode": true
}
```

- `requestFormValueExpressions` で `${<入力フィールド名>}` を使い、入力値をパラメータに埋め込む（PathVariables）
- `requestHeaderNames` / `requestHeaderExpressions` でヘッダを自由に指定

**標準の出力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `status.statusCode` | integer | HTTPステータスコード |
| `status.statusMessage` | string | HTTPステータスメッセージ |
| `headers` | map | レスポンスヘッダ |
| `body` | string | レスポンスボディ |

### 3. SQL 定義（`definitionType: "sql"`）

任意のSQLを実行するタスク。
2way-sql を使用する。

| 項目 | 値 |
|---|---|
| `elementId` | `im_queryExecutor` |

**`elementProperties`:**

```jsonc
{
  "query": "SELECT\n    id\n  , name\n  , status\nFROM\n    your_table\nWHERE\n    id = /*param1*/'dummyId'\nORDER BY\n    id ASC",
  "queryType": "SELECT",         // "SELECT" | "INSERT" | "UPDATE" | "DELETE"
  "databaseType": "TENANT",      // "TENANT" | "SHARED"
  "connectId": "default",
  "limitation": false
}
```

- `query` 内の `/*<入力フィールド名>*/` で入力値をバインド（2way-sql 構文）
- jssp の 2way-sql 規約と同様の仕組み
- **`query` は `\n` で適切に改行する** — 1 行にまとめず、SELECT / FROM / WHERE / ORDER BY 等のキーワードごとに改行して可読性を確保する

#### LIKE 検索時の注意（LIKE パターンインジェクション対策）

LIKE 演算子を使用する場合、`jssp-2way-sql.instructions.md` の「LIKE 検索時のエスケープ」と同じ対策が必要。

1. **SQL に `ESCAPE '\'` 句を必ず付与する**
2. **LIKE 特殊文字（`\`、`%`、`_`）のエスケープとワイルドカード付与はサーバサイドで行う** — クライアントから `%keyword%` を送信してはならない
3. **ロジックフローでは `user_javascript` タスクでエスケープ処理を行う**（SQL タスクの前に配置）

```jsonc
// user_javascript タスクの script 例
{
  "script": "function run(input) {\n  let keyword = input.keyword || '';\n  let escaped = keyword\n    .replace(/\\\\/g, '\\\\\\\\')\n    .replace(/%/g, '\\\\%')\n    .replace(/_/g, '\\\\_');\n  return { keyword: '%' + escaped + '%' };\n}"
}
```

```
フロー構成: im_start → [JS: エスケープ処理] → [SQL: LIKE検索] → im_end
```

**SELECT 時の標準出力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `records` | list | 結果レコードの配列 |
| `count` | integer | 件数 |
| `query` | string | 実行されたSQL文 |

### 4. Database Fetch 定義（`definitionType: "db_fetch"`）

SELECT 専用で 1 行ずつデータを取り出して繰り返すタスク。
大量レコードを扱う場合に SQL 定義より省メモリ。

| 項目 | 値 |
|---|---|
| `elementId`（開始） | `im_startDbFetch` |

**`elementProperties`:**

```jsonc
{
  "query": "SELECT * FROM your_table WHERE id = /*param1*/'dummyId' ORDER BY id ASC",
  "databaseType": "TENANT",
  "connectId": "default",
  "fetchSize": "10",
  "limitation": false
}
```

- `fetchSize` でフェッチ行数を指定

#### 開始/終了ペア構造

Database Fetch は **2 つの flowElement** で構成される:

| 要素 | key.id | 役割 |
|---|---|---|
| 開始 | `<definitionId>`（例: `sample-db-fetch`） | ループ開始・SQL 実行 |
| 終了 | `$<definitionId>$`（例: `$sample-db-fetch$`） | ループ終了 |

終了要素の `properties`:
```jsonc
{ "startPoint": "sample-db-fetch" }
```

**フロー構造:**
```
→ sample-db-fetch → [ループ内処理] → $sample-db-fetch$ →
```

ループ内処理では、開始要素の出力から `item`（1行分のデータ）を参照できる。

**出力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `item.<カラム名>` | 各カラムの型 | 現在行のデータ |

### 5. テンプレート定義（`definitionType: "template"`）

FreeMarker テンプレートエンジンを使い、入力データからテキストを生成するタスク。
メール本文やレポートの生成に使用する。

| 項目 | 値 |
|---|---|
| `elementId` | `im_templateProcessor` |

**`elementProperties`:**

```jsonc
{
  "defaultTemplate": "<#setting url_escaping_charset=\"UTF-8\">\nHello, ${userName}.\n...",
  "localizedTemplate": {
    "ja": "",      // ロケール別テンプレート（空文字の場合は defaultTemplate を使用）
    "en": "",
    "zh_CN": ""
  }
}
```

- `defaultTemplate` に FreeMarker 構文のテンプレートを記述
- `localizedTemplate` でロケール別に上書き可能（空文字 = defaultTemplate を使用）
- テンプレート内で入力データの `data` オブジェクトのフィールドを `${フィールド名}` で参照

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `locale` | locale | テンプレート選択用ロケール |
| `data` | object | テンプレートに渡すデータ（自由定義） |

**出力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `output` | string | テンプレート処理結果の文字列 |

### 6. ストアドプロシージャ定義（`definitionType: "stored"`）

データベースのストアドプロシージャ／ファンクションを呼び出すタスク。
CallableStatement に相当し、IN / OUT パラメータと結果セットを扱える。

| 項目 | 値 |
|---|---|
| `elementId` | `im_storedExecutor` |

**`elementProperties`:**

```jsonc
{
  "sql": "{ /*param3*/ = call my_func(/*param1*/, /*param2*/) }",
  "databaseType": "TENANT",   // "TENANT" | "SHARED"
  "connectId": "default"
}
```

- `sql` は JDBC の CallableStatement エスケープ構文（`{ call ... }` / `{ ?= call ... }`）で記述する
- プレースホルダは 2way-sql 構文の `/*<入力フィールド名>*/` を使う
  - **IN パラメータ**: `inputDataDefinition` で定義した入力フィールド名を `/*param1*/` のように指定
  - **OUT パラメータ（戻り値含む）**: `outputDataDefinition` の `outParameters` 配下に定義したフィールド名を `/*param3*/` のように指定
- `databaseType` / `connectId` は SQL 定義と同様（接続先データベースの指定）

**標準の出力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `outParameters.<名前>` | 各 OUT パラメータの型 | OUT パラメータ／戻り値（例: `param3` を `bigdecimal` で受ける） |
| `resultSets` | object | プロシージャが返す結果セット（返さない場合は空） |

- `outParameters` には OUT パラメータ／戻り値を定義する。型は呼び出すプロシージャの定義に合わせる（数値なら `bigdecimal` 等）
- 結果セットを返すプロシージャの場合は `resultSets` 配下にカラム構造を定義する

### 7. CSV フェッチ定義（`definitionType: "csv_fetch"`）

ストレージ上の CSV ファイルを 1 行ずつ読み取って繰り返すタスク。
Database Fetch と同様の**開始/終了ペア構造**を持ち、大きな CSV を省メモリで逐次処理できる。

| 項目 | 値 |
|---|---|
| `elementId`（開始） | `im_startCsvFetch` |

**`elementProperties`:**

```jsonc
{
  "encoding": "UTF-8",          // ファイルエンコーディング
  "quoteCharacter": "\"",       // 囲み文字
  "delimiterCharacter": ",",    // 区切り文字
  "endOfLineSymbols": "\n",     // 改行コード
  "skipHeader": true,            // 先頭行（ヘッダ）を読み飛ばすか
  "mismatchOnError": false       // 列数不一致時にエラーとするか
}
```

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `file` | storage | 読み込む CSV ファイル（ストレージ上のファイル） |

**出力型（ループ内で参照）:**

| フィールド | 型 | 説明 |
|---|---|---|
| `string1` / `string2` / ... | string | 現在行の各カラム値（列数に応じて定義） |

#### 開始/終了ペア構造

CSV フェッチは Database Fetch と同じく **2 つの flowElement** で構成される:

| 要素 | key.id | properties | 役割 |
|---|---|---|---|
| 開始 | `<definitionId>`（例: `sample-csv-fetch`） | `{ definition, endPoint }` | ループ開始・CSV 読み込み |
| 終了 | `$<definitionId>$`（例: `$sample-csv-fetch$`） | `{ startPoint }` | ループ終了 |

**フロー構造:**
```
→ sample-csv-fetch → [ループ内処理] → $sample-csv-fetch$ →
```

- spec の `tasks` に終了要素（`user_csv_fetch_end`）を書く必要はない。`build-flow.js` が自動生成する
- ループ内処理では開始要素の出力（`string1` 等）を参照できる

### 8. CSV 出力定義（`definitionType: "csv_output"`）

入力されたレコードのリストを CSV ファイルとしてストレージに出力するタスク。
CSV フェッチと異なり**単体タスク**（ペア構造ではない）で、列のラベル・データ型・フォーマットを定義できる。

| 項目 | 値 |
|---|---|
| `elementId` | `im_csvOutput` |

**`elementProperties`:**

```jsonc
{
  "encoding": "UTF-8",          // ファイルエンコーディング
  "quoteCharacter": "\"",       // 囲み文字
  "delimiterCharacter": ",",    // 区切り文字
  "endOfLineSymbols": "\n",     // 改行コード
  "addHeader": true,             // ヘッダ行（labelName）を出力するか
  "withBom": false,              // BOM を付与するか
  "cols": [                       // 出力列の定義（records の各フィールドに対応）
    { "paramName": "param1", "labelName": "PARAM1", "dataType": "STRING", "format": "" },
    { "paramName": "param2", "labelName": "PARAM2", "dataType": "STRING", "format": "" }
  ]
}
```

- `cols` で出力する列を定義する
  - `paramName`: `records` の各レコードが持つフィールド名
  - `labelName`: ヘッダ行に出力する列名（`addHeader: true` のとき）
  - `dataType`: `STRING` / `NUMBER` / `DATETIME` 等
  - `format`: 日付・数値のフォーマット（`dataType` に応じて指定。不要なら空文字）

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `outputFile` | storage | 出力先 CSV ファイル（ストレージ上のファイル） |
| `targetTimezone` | timezone | 日時項目の出力に使うタイムゾーン |
| `records` | list | 出力するレコードの配列（各レコードのフィールドが `cols.paramName` に対応） |

**出力型:**

出力データは無し（空の root）。出力先ファイル（`outputFile`）に CSV が書き込まれる。

### 9. Excel 入力定義（`definitionType: "excel_in"`）

ストレージ上の Excel ファイル（xlsx 等）からセル値や表データを読み取るタスク。
**単体タスク**で、単一セルの読み取り（`cells`）と表形式の読み取り（`tables`）を組み合わせて定義できる。

| 項目 | 値 |
|---|---|
| `elementId` | `im_excelInput` |

**`elementProperties`:**

```jsonc
{
  "selectSheetType": "NAME",      // シート指定方法（"NAME": シート名 / "INDEX": シート番号）
  "cells": [                       // 単一セルの読み取り定義
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                      // 表形式の読み取り定義
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",  // 出力先の配列フィールド名
      "startCol": "A",             // 読み取り開始列
      "endCol": "B",               // 読み取り終了列
      "startRow": "1",             // 読み取り開始行
      "cols": [                     // 各列の定義
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "inputEndCondition": "ALL_EMPTY",  // 読み取り終了条件（後述）
      "notReadLastRow": false,            // 終了条件に合致した最終行を読まないか
      "useBeforeValue": false             // 空セルに直前の値を引き継ぐか
    }
  ],
  "dataTypeLenient": true          // データ型変換を寛容に行うか
}
```

**`cells` / `tables.cols` の各項目:**

- `sheet`: シート名（`selectSheetType: "NAME"` のとき）またはシート番号（`"INDEX"` のとき）
- `address`: セルアドレス（`cells` のみ。例: `A1`）
- `name`: 列（`tables.cols` のみ。列記号。例: `A`）
- `paramName`: 出力先のフィールド名
- `dataType`: `STRING` / `NUMERIC` / `DATETIME` 等
- `disuse`（`tables.cols` のみ）: その列を読み飛ばすか

**`inputEndCondition`（表の読み取り終了条件）の 3 モード:**

| 値 | 説明 | 追加プロパティ |
|---|---|---|
| `ALL_EMPTY` | 全列が空の行に達したら終了 | なし |
| `SPECIFY_ROWS` | 指定した行数だけ読み取る | `specifiedRows`（例: `"5"`） |
| `CELL_EMPTY` | 指定列のセルが空になったら終了 | `specifiedEmptyCol`（例: `"A"`） |

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `file` | storage | 読み込む Excel ファイル（ストレージ上のファイル） |
| `targetTimezone` | timezone | 日時セルの読み取りに使うタイムゾーン |
| `password` | string | パスワード付きブックを開くためのパスワード（不要なら空） |

**出力型:**

`cells` の各 `paramName`（単一値）と、`tables` の各 `arrParamName`（レコードの配列）が出力される。
数値セル（`dataType: "NUMERIC"`）は `double` 型で出力される。

### 10. Excel 出力定義（`definitionType: "excel_out"`）

入力データを Excel ファイル（xlsx 等）のセルや表に書き込んで出力するタスク。
**単体タスク**で、テンプレート Excel（`inputFile`）を読み込み、データを書き込んで出力先（`outputFile`）に保存する。

| 項目 | 値 |
|---|---|
| `elementId` | `im_excelOutput` |

**`elementProperties`:**

```jsonc
{
  "selectSheetType": "NAME",          // シート指定方法（"NAME": シート名 / "INDEX": シート番号）
  "setFormulaRecalculation": false,    // 出力時に数式を再計算するか
  "cells": [                           // 単一セルへの書き込み定義
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                          // 表形式の書き込み定義
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",      // 書き込むレコード配列のフィールド名
      "startCol": "A",                 // 書き込み開始列
      "endCol": "B",                   // 書き込み終了列
      "startRow": "1",                 // 書き込み開始行
      "cols": [                         // 各列の定義
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "outputEndCondition": "ALL_DATA_WRITEN"  // 書き込み終了条件（後述）
    }
  ]
}
```

- `cells` / `tables` の各項目は **Excel 入力定義と同じ**（`sheet` / `address` / `name` / `paramName` / `dataType` / `disuse`）
- Excel 入力定義と異なり、`setFormulaRecalculation` を持ち、`dataTypeLenient` は持たない

**`outputEndCondition`（表の書き込み終了条件）の 2 モード:**

| 値 | 説明 | 追加プロパティ |
|---|---|---|
| `ALL_DATA_WRITEN` | 入力レコードを全件書き込む | なし |
| `SPECIFY_ROWS` | 指定した行数だけ書き込む | `specifiedRows`（例: `"5"`） |

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `outputFile` | storage | 出力先 Excel ファイル（ストレージ上のファイル） |
| `inputFile` | storage | テンプレートとして読み込む Excel ファイル |
| `targetTimezone` | timezone | 日時セルの書き込みに使うタイムゾーン |
| `password` | string | パスワード付きブックを開くためのパスワード（不要なら空） |
| `param1` 等 | （`cells` に対応） | 単一セルに書き込む値 |
| `records1` 等 | list（`tables` に対応） | 表に書き込むレコードの配列 |

**出力型:**

出力データは無し（空の root）。出力先ファイル（`outputFile`）に Excel が書き込まれる。

### 11. XML 解析定義（`definitionType: "xmlparser"`）

XML データを解析し、XPath で指定した値を取り出すタスク。
**単体タスク**で、入力された XML（バイナリ）から複数の XPath 式で値を抽出して出力フィールドにマッピングする。

| 項目 | 値 |
|---|---|
| `elementId` | `im_xmlparser` |

**`elementProperties`:**

```jsonc
{
  "paths": [                          // 抽出する値の定義（XPath → 出力フィールド）
    { "paramName": "string1", "xpath": "/root/string1" },
    { "paramName": "string2", "xpath": "//string2" }
  ]
}
```

- `paths` の各項目で、`xpath` で指定したノードの値を `paramName` の出力フィールドに取り出す
  - `paramName`: 出力先のフィールド名（`outputDataDefinition` の各フィールドに対応）
  - `xpath`: XPath 式（絶対パス `/root/...` や相対パス `//...` 等）

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `xml` | binary | 解析対象の XML データ（バイナリ） |

**出力型:**

`paths` の各 `paramName` が `string` 型で出力される（XPath で取り出した値）。

### 12. HTML 解析定義（`definitionType: "htmlparser"`）

HTML データを解析し、CSS セレクタで指定した要素の値を取り出すタスク。
**単体タスク**で、XML 解析定義と似ているが、XPath ではなく **CSS セレクタ** で要素を指定する。

| 項目 | 値 |
|---|---|
| `elementId` | `im_htmlparser` |

**`elementProperties`:**

```jsonc
{
  "paths": [                          // 抽出する値の定義（CSS セレクタ → 出力フィールド）
    { "paramName": "string1", "selector": "body>h1" },
    { "paramName": "string2", "selector": ".input-label span" }
  ]
}
```

- `paths` の各項目で、`selector` で指定した要素の値を `paramName` の出力フィールドに取り出す
  - `paramName`: 出力先のフィールド名（`outputDataDefinition` の各フィールドに対応）
  - `selector`: CSS セレクタ（例: `body>h1`、`.input-label span`、`#id` 等）

**標準の入力型:**

| フィールド | 型 | 説明 |
|---|---|---|
| `html` | binary | 解析対象の HTML データ（バイナリ） |
| `charset` | string | HTML の文字エンコーディング（例: `UTF-8`。不要なら空） |

**出力型:**

`paths` の各 `paramName` が `string` 型で出力される（CSS セレクタで取り出した値）。

## spec.json でのユーザ定義タスクの書き方

```jsonc
{
  "type": "user_javascript",         // テンプレート名
  "label": "メール送信処理",
  "userDefinition": {
    "definitionId": "mail_sender",
    "definitionType": "javascript",
    "definitionName": "mail sender",
    "localize": { "ja": "メール送信処理" },
    "elementProperties": {
      "script": "function run(input) { ... }"
    },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... }
  }
}
```

`userDefinition` フィールドに定義内容を記述する。
`build-flow.js` が `properties.definition` 構造に変換する。

## SQL 定義と Database Fetch 定義の使い分け

| 場面 | 推奨 |
|---|---|
| 結果全件を配列で取得したい | SQL 定義 |
| 件数が少ない（数百件以下） | SQL 定義 |
| 件数が大規模（数千件以上） | Database Fetch 定義 |
| 1 行ずつ逐次処理したい | Database Fetch 定義 |
| INSERT / UPDATE / DELETE | SQL 定義（Database Fetch は SELECT 専用） |
| ストアドプロシージャ／ファンクションを呼び出したい | ストアドプロシージャ定義 |
| OUT パラメータ／戻り値を受け取りたい | ストアドプロシージャ定義 |
| ストレージ上の CSV を 1 行ずつ処理したい | CSV フェッチ定義 |
| レコードのリストを CSV ファイルに出力したい | CSV 出力定義 |
| Excel ファイルからセル値・表データを読み取りたい | Excel 入力定義 |
| データを Excel ファイルのセル・表に書き込みたい | Excel 出力定義 |
| XML データから XPath で値を取り出したい | XML 解析定義 |
| HTML データから CSS セレクタで値を取り出したい | HTML 解析定義 |
