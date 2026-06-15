---
name: jssp-im-logic-generator
description: intra-mart IM-LogicDesigner 用の flow_definition.json をプロンプトから生成する。ユーザーが日本語で「○○を行うロジックフローを作って」と要求したときに使用。タスクパレットは task-templates/ に定義済み（順次拡張可）。
allowed-tools: Bash, Read, Write, Glob
---

# jssp-im-logic-generator

intra-mart の **IM-LogicDesigner ロジックフロー定義 JSON** をプロンプトから組み立てるスキル。

## 使うタイミング

- 「IM-LogicDesigner のフローを作って」「ロジックフロー定義 JSON を生成して」といった要求
- 既存 `flow_definition.json` の構造に準拠した JSON が必要なとき

## 構成

```
jssp-im-logic-generator/
├── SKILL.md                  # このファイル
├── reference/
│   ├── structure.md          # flow_definition.json の構造仕様
│   ├── source-paths.md       # mappingRules.source の path 規約
│   ├── el-expressions.md     # EL式の書き方
│   ├── data-types.md         # データ型（タイプID）の全量リファレンス
│   ├── user-definitions.md   # ユーザ定義タスクのリファレンス
│   ├── mapping-functions.md  # マッピング関数の基本（52件）リファレンス
│   ├── spec.schema.json      # spec.json の JSON Schema
│   └── flow_definition.schema.json  # flow_definition.json の JSON Schema
├── task-templates/           # タスク種別ごとの雛形（135ファイル）
│   ├── im_start.json / im_end.json / im_errorEnd.json / im_gateway.json / im_sequence.json
│   ├── im_authorizeAuthz.json / im_logger.json / im_callFlow.json / ...
│   ├── im_repositorySearchEntityCount.json / im_repositorySearchEntityData.json / ...
│   ├── im_sendTextMail.json / im_sendHtmlMail.json / ...
│   ├── im_addAccount.json / im_updateAccount.json / im_deleteAccount.json / ...
│   ├── im_immGetCompany.json / im_immGetProfile.json / ...   # 共通マスタ系
│   ├── user_javascript.json / user_rest.json / user_sql.json  # ユーザ定義
│   ├── user_db_fetch.json / user_db_fetch_end.json            # Database Fetch
│   ├── user_csv_fetch.json / user_csv_fetch_end.json          # CSV Fetch
│   ├── user_template.json / user_stored.json                  # テンプレート / ストアドプロシージャ
│   ├── user_csv_output.json                                   # CSV 出力
│   ├── user_excel_input.json / user_excel_output.json         # Excel 入力 / 出力
│   ├── user_xml_parse.json / user_html_parse.json             # XML 解析 / HTML 解析
│   └── ...（全125タスク種別 + im_sequence + ユーザ定義12種）
├── scripts/
│   ├── build-flow.js         # spec.json → flow_definition.json 生成器
│   └── validate-flow.js      # flow_definition.json のバリデータ
├── mcp-spec/                 # MCP エンドポイント仕様
│   ├── endpoints.md          # エンドポイント仕様（5本: タスク/エンティティ/関数）
│   └── schemas/              # レスポンス JSON Schema
│       ├── imLogicListTaskTypes.response.json
│       ├── imLogicGetTaskTemplate.response.json
│       ├── imLogicResolveEntitySchema.response.json
│       ├── imLogicListMappingFunctions.response.json
│       └── imLogicGetMappingFunction.response.json
└── examples/
    └── article_count.spec.json  # 最小サンプル spec
```

**注意:**
- **タスク種別の追加**: `task-templates/<keyId>.json` を 1 件追加するだけで `build-flow.js` が認識する。雛形の作り方は [reference/structure.md](reference/structure.md) 参照。

## 生成手順

ユーザー要求を受けたら以下の順で進める。

### 1. 要求を整理し、不足を確認する

ユーザーから以下の情報を引き出す。不足があれば質問する：

- **flowId** / **flowName** / **categoryId**
  - `categoryId` は **テンプレートに登場するもの（`imprtl_portlet_info` 等）を絶対に流用しない**こと。新しいフローには新しいカテゴリ ID を付与する（例: `sample_authz`）。必要なら `flowCategories` で新規定義する。
- **入力データ** (`inputDataDefinition`) — どんな引数を受け取るか
- **出力データ** (`outputDataDefinition`) — 何を返すか
- **処理フロー** — どのタスクをどの順で呼び、どこで分岐するか
- **エンティティID** — リポジトリ系タスクで使う `entityId`（IM-Repository 連携）
  - ※ 別途 IM-Repository 解決機構を整備予定。当面はユーザーから受け取る。

### タスク名（label）の言語

タスクの `label` は多言語化できない。プロンプトの言語に合わせて設定すること：

- 日本語プロンプト → 日本語ラベル（例: `"認可判断"`）
- 英語プロンプト → 英語ラベル（例: `"Authorization Check"`）

### タスクのコメント（comment）

**各タスクには `comment` でそのタスクの目的を簡潔に記述すること。**
レビュー時にフローの意図を把握しやすくなる。`label` が「何をするか」、`comment` が「なぜそうするか」を表す。

```jsonc
{
  "type": "user_sql",
  "label": "対象件数取得",
  "comment": "DB Fetch 前に件数を確保し、処理完了後の出力に使用する",
  ...
}
```

- `im_start` / `im_end` にはコメント不要
- それ以外の全タスクに付与する
- 言語は `label` と同じ（プロンプトの言語に合わせる）

### 2. 中間表現「spec」を author する

[examples/article_count.spec.json](examples/article_count.spec.json) と同じ形式で spec を組み立てる。

主要フィールド:

```jsonc
{
  "flowCategories": [ /* 省略可。新規カテゴリを定義する場合のみ */ ],
  "flows": [
    {
      "flowId": "...",
      "flowName": "...",
      "categoryId": "...",
      "version": 1,
      "transaction": true,
      "constants": [],                       // 定数定義（省略可）
      "variablesDataDefinition": { ... },    // 省略時は空 root
      "inputDataDefinition":  { ... },       // 省略時は空 root
      "outputDataDefinition": { ... },       // 省略時は空 root
      "tasks": [
        // 順序は問わない（edges で接続する）
        { "type": "im_start" },
        { "type": "im_repositorySearchEntityCount",
          "label": "件数取得",
          "properties": { "entityId": "..." } },
        { "type": "im_gateway",
          "label": "存在チェック",
          "defaultRoot": "im_gateway1->im_errorEnd1" },
        { "type": "im_end",
          "mappingRules": [
            { "target": "$output/data/articleCount",
              "source": { "type":"value", "name":null,
                          "path":"im_repositorySearchEntityCount1/count",
                          "arguments":null } }
          ]
        }
      ],
      "edges": [
        { "from": "im_start", "to": "im_repositorySearchEntityCount1" },
        { "from": "im_repositorySearchEntityCount1", "to": "im_gateway1" },
        { "from": "im_gateway1", "to": "im_end1",
          "condition": "${!isEmpty(im_repositorySearchEntityCount1.count)}" },
        { "from": "im_gateway1", "to": "im_errorEnd1" }
      ]
    }
  ]
}
```

**executeId 自動採番ルール**（spec で明示しない場合）:
- `im_start` → `im_start`
- `im_end` → `im_end1`（同一フロー内に複数なら `im_end2`...）
- それ以外 → `<key.id><連番>`（例: `im_repositorySearchEntityCount1`）
- sequence の executeId → `<from>_<to>`

明示したい場合は `executeId` フィールドを指定する。

### 3. spec を一時ファイルに書き出して build-flow.js を実行

```bash
node .claude/skills/jssp-im-logic-generator/scripts/build-flow.js \
     /tmp/<flowId>.spec.json \
     --zip
```

オプション:

| オプション | 動作 |
|---|---|
| `--zip` | `<workspace>/src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip` を生成。zip 内には `flow_definition.json` を含む。spec に `routes` がある場合は `flow_route.json` も含まれる。**通常はこれを使う。** |
| `--zip-dir <dir>` | zip 出力先ディレクトリを上書き |
| `--out <file>` | 整形 JSON を別途ファイル保存 |
| 何も指定なし | 整形 JSON を標準出力 |

**`featureName` は spec トップレベルに必須**（zip 出力時）。
例: `"featureName": "article-count"` → `im-logicdesigner-data-article-count.zip`。
省略時は最初のフローの `flowId` がフォールバックで使われる。

**注意:**
- ※ `zip` コマンドが必要（dev container には標準で入っている想定）

### 4. 出力を確認

build-flow.js が生成するのは:

**flow_definition.json**（常に生成）:
```json
{
  "flowCategories": [...],
  "flowDefinitions": [ "<エスケープされたフロー定義 JSON 文字列>", ... ]
}
```

これは元の `flow_definition.json` と同じトップ構造で、IM-LogicDesigner にインポート可能。

**flow_route.json**（spec に `routes` がある場合のみ生成）:
```json
[
  {
    "route": "my_app/get_user",
    "method": "GET",
    "flowId": "my_app_get_user",
    "version": -1,
    "authentication": "IMAuthentication",
    "authenticationParam": null,
    "authzUri": "im-logic-rest://my_app_get_user",
    "secured": true,
    "responseType": "imJsonResponse",
    "responseHeader": {}
  }
]
```

ルーティング定義により `<BASE-URL>/logic/api/<route>` でフローを HTTP 実行できる。
`authzUri` は省略時に `im-logic-rest://<flowId>` が自動補完される。

**spec での routes 記法例:**

```jsonc
{
  "flows": [ ... ],
  "routes": [
    {
      "route": "sample/ajax/execute",   // 必須: URLパス (<BASE-URL>/logic/api/<route>)
      "flowId": "sample_ajax_execute",  // 必須: 実行するフローの flowId
      "method": "POST",                // 省略時: GET
      "responseType": "imTextResponse", // 省略時: imJsonResponse
      "secured": true,                  // 省略時: false（ただし下記ルール参照）
      "authentication": "IMAuthentication" // 省略時: IMAuthentication
    }
  ]
}
```

**`secured` の設定ルール:** ユーザから特に指示がない限り、`secured: true` を明示的に設定すること。
CSRF 対策としてセキュアトークンの使用を推奨するため。

**`secured: true` の場合のクライアント側要件:**
セキュアトークンをリクエストヘッダーに含める必要がある。

```javascript
fetch('logic/api/sample/ajax/execute', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': document.querySelector('meta[name=im_secure_token]').content
  }
});
```

画面側 HTML には `<meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">` を埋め込むこと。

**重要:** `responseType` に応じてフローの `outputDataDefinition` に定義すべきプロパティが異なる。
ルーティングを生成する場合は [routing-response.md](reference/routing-response.md) を必ず参照し、フローの出力定義を適切に設定すること。

### 5. validate-flow.js で検証

build-flow.js の出力を自動検証する。**生成後は必ず実行すること。**

```bash
node .claude/skills/jssp-im-logic-generator/scripts/validate-flow.js \
     <flow_definition.json または .zip>
```

検証項目:

- `flowElements` に **start / end / 全タスク / 全 sequence** が揃っているか
- sequence の `startPoint` / `endPoint` が実在するタスクを指しているか
- `additional.ui` 内の **cells / dataMap / optionMap が同期している**か
  - dataMap・optionMap のキーは cell の UUID（link cell は除く）
  - cell の `attrs."text.title".text` は executeId
  - dataMap の `common.executeId` がセルの text.title と一致
- **`dataMap[cellId].mapping.json.connectors` と `flowElements[].mappingDefinition.mappingRules` が同期している**か
  - 出力 connector の `id` が mappingRule の `id` と一致
  - 出力 connector 数 = mappingRule 数
  - path 区切りが TAB（`\t`）になっている（`/` ではない）
  - 関数引数 connector（target.type = 関数名）は別途存在を許容
- gateway の `defaultRoot` が実在する sequence の executeId を指しているか
- ユーザ定義タスク（`key.type = "localUserDefinition"`）の検証:
  - `properties.definition` に `definitionId` / `definitionType` / `definitionData` / `elementId` が存在するか
  - Database Fetch の開始/終了ペア（`$<definitionId>$`）が揃っているか

## ユーザ定義タスクの使い方

通常タスク（`key.type = "application"`）に加え、ユーザが自由に入出力とロジックを定義できる **ユーザ定義タスク** を spec に記述できる。
詳細は [reference/user-definitions.md](reference/user-definitions.md) 参照。

### spec での記述

```jsonc
{
  "type": "user_javascript",       // user_javascript | user_rest | user_sql | user_db_fetch | user_template | user_stored | user_csv_fetch | user_csv_output | user_excel_input | user_excel_output | user_xml_parse | user_html_parse
  "label": "メール送信処理",
  "userDefinition": {
    "definitionId": "mail_sender",  // → executeId および key.id になる
    "definitionType": "javascript",
    "definitionName": "mail sender",
    "localize": { "ja": "メール送信処理" },
    "elementProperties": {
      "script": "function run(input) { ... }"
    },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... }
  },
  "mappingRules": [ ... ]
}
```

### 種別ごとの type 名

| spec の `type` | `definitionType` | 用途 |
|---|---|---|
| `user_javascript` | `javascript` | 自由な JavaScript 処理（Rhino） |
| `user_rest` | `rest` | HTTP/HTTPS リクエスト |
| `user_sql` | `sql` | 任意の SQL 実行（2WaySQL） |
| `user_db_fetch` | `db_fetch` | SELECT を 1 行ずつ繰り返し処理 |
| `user_template` | `template` | FreeMarker テンプレートでテキスト生成 |
| `user_stored` | `stored` | ストアドプロシージャ／ファンクション呼び出し（IN/OUT パラメータ） |
| `user_csv_fetch` | `csv_fetch` | ストレージ上の CSV を 1 行ずつ繰り返し処理（開始/終了ペア） |
| `user_csv_output` | `csv_output` | レコードのリストを CSV ファイルに出力（単体） |
| `user_excel_input` | `excel_in` | Excel ファイルからセル値・表データを読み取り（単体） |
| `user_excel_output` | `excel_out` | データを Excel ファイルのセル・表に書き込み（単体） |
| `user_xml_parse` | `xmlparser` | XML データから XPath で値を取り出し（単体） |
| `user_html_parse` | `htmlparser` | HTML データから CSS セレクタで値を取り出し（単体） |

### Database Fetch / CSV フェッチの注意

ペア型ユーザ定義（`user_db_fetch` / `user_csv_fetch`）に共通する注意点。

- **終了要素は自動生成される**。spec の `tasks` に `user_db_fetch_end` / `user_csv_fetch_end` を書く必要はない
- edges では `$<definitionId>$` で終了要素を参照する
- ループ内処理のタスクを開始と終了の間に挟む

```jsonc
"edges": [
  { "from": "im_start", "to": "my_db_fetch" },
  { "from": "my_db_fetch", "to": "im_logger1" },        // ループ内処理
  { "from": "im_logger1", "to": "$my_db_fetch$" },       // ループ終了
  { "from": "$my_db_fetch$", "to": "im_end1" }
]
```

### im_logger（ログ出力タスク）

ユーザ定義ではないが、よくループ内処理で使われる通常タスク。

```jsonc
{
  "type": "im_logger",
  "label": "ログ出力",
  "properties": { "level": "INFO" },
  "mappingRules": [
    { "target": "im_logger1",
      "source": { "type": "value", "path": "my_db_fetch/item/column1" } }
  ]
}
```

`properties.level`: `"DEBUG"` / `"INFO"` / `"WARN"` / `"ERROR"`

## 複数フローを 1 ファイルにまとめる場合

要求が複雑で 1 フローに収まらない場合は `flows: [ ... ]` に複数フロー分の spec を並べる。
`build-flow.js` がそれぞれを個別の JSON 文字列にして `flowDefinitions` 配列にまとめる。

## 重要な制約

- **`additional.ui` は必須**。空にできない。`build-flow.js` は task-templates の cell 雛形から自動生成する。
- **executeId と cell の同期は build-flow.js が保証する**。手で JSON を編集する場合は両側を必ず一致させる。
- **タスク種別が未対応**な場合、`task-templates/<keyId>.json` を追加するまでスキルは生成できない。`reference/structure.md` の手順で雛形を作る。
- **レイアウト**: セルは edges のルート順（`im_start` から深さ優先）に縦配置される。縦間隔 120px。デザイナの最大サイズ（横 3840px / 縦 2880px）を超える場合は右に 340px 折り返す。1列あたり最大 23 タスク。

## SQL 定義タスクの注意事項

### SQL の可読性

`user_sql` / `user_db_fetch` タスクの `query` は `\n` で適切に改行すること。
1 行にまとめると IM-LogicDesigner 上で視認性が悪くなる。

```jsonc
// NG: 1行にまとめない
"query": "SELECT id, name FROM your_table WHERE id = /*param*/'dummy' ORDER BY id ASC"

// OK: キーワードごとに改行
"query": "SELECT\n    id\n  , name\nFROM\n    your_table\nWHERE\n    id = /*param*/'dummy'\nORDER BY\n    id ASC"
```

### LIKE 検索のセキュリティ

LIKE 演算子を使用する場合、**LIKE パターンインジェクション対策**が必須。
詳細は [reference/user-definitions.md](reference/user-definitions.md) の「LIKE 検索時の注意」を参照。

- SQL に `ESCAPE '\'` 句を付与する
- `user_javascript` タスクで LIKE 特殊文字（`\`、`%`、`_`）をエスケープしてからワイルドカードを付与する
- **クライアント（ブラウザ）から `%keyword%` を送信してはならない**

## 参照

- [reference/structure.md](reference/structure.md) — JSON 構造、テンプレート追加方法
- [reference/source-paths.md](reference/source-paths.md) — mappingRules.source.path の起点一覧
- [reference/el-expressions.md](reference/el-expressions.md) — EL式の使い方
- [reference/data-types.md](reference/data-types.md) — データ型（タイプID）の全量と選び方
- [reference/user-definitions.md](reference/user-definitions.md) — ユーザ定義タスクの詳細仕様
- [reference/mapping-functions.md](reference/mapping-functions.md) — マッピング関数の基本（52件）と使い方
- [examples/article_count.spec.json](examples/article_count.spec.json) — 最小 spec サンプル
