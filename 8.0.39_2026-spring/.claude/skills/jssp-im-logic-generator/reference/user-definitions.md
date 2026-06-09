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

LIKE 演算子を使用する場合、`jssp-2way-sql.md` の「LIKE 検索時のエスケープ」と同じ対策が必要。

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
