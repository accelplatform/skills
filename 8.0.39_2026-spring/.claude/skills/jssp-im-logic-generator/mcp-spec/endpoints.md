# MCP サーバ エンドポイント仕様

IM-LogicDesigner タスク定義を提供する MCP サーバのエンドポイント仕様。

ツール名は他の MCP サーバとの混同を避けるため、すべて `imLogic` プレフィックスを付与する。

---

## 1. `imLogicListTaskTypes`

タスク種別の一覧を返す。
300件以上のタスクから目的のものを特定するために使用する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`keyId` / `label` / `description` / `category` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（完全一致） |
| `keyType` | string | No | タスク種別でフィルタ。`application`（通常タスク） / `userDefinition`（ユーザ定義タスク） |
| `definitionType` | string | No | ユーザ定義タスクの種別でフィルタ。`javascript` / `rest` / `sql` / `db_fetch` / `template`。`keyType = userDefinition` を暗黙に指定する |

### レスポンス

[imLogicListTaskTypes.response.json](schemas/imLogicListTaskTypes.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "imLogicListTaskTypes", "params": {} }

// キーワード検索
{ "method": "imLogicListTaskTypes", "params": { "query": "認可" } }

// カテゴリフィルタ
{ "method": "imLogicListTaskTypes", "params": { "category": "リポジトリ" } }

// ユーザ定義タスクのみ取得
{ "method": "imLogicListTaskTypes", "params": { "keyType": "userDefinition" } }

// テンプレート種別のユーザ定義タスクのみ取得
{ "method": "imLogicListTaskTypes", "params": { "definitionType": "template" } }
```

### 備考

- 全件取得時でも概要のみのため数十KB程度に収まる想定
- `hasEntityId: true` のタスクは、spec 作成時に `imLogicResolveEntitySchema` の追加呼び出しが必要（ユーザ定義タスクでは常に `false`）
- 通常タスク（`keyType = "application"`）に加え、テナント環境に登録済みのユーザ定義タスク（`keyType = "userDefinition"`）も含まれる。ユーザ定義は `definitionType`（`javascript` / `rest` / `sql` / `db_fetch` / `template`）で区別される。ユーザ定義タスクの構造は [reference/user-definitions.md](../reference/user-definitions.md) を参照

---

## 2. `imLogicGetTaskTemplate`

指定したタスク種別の完全なテンプレートを1件返す。
`build-flow.js` が消費する全情報を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `keyId` | string | Yes | タスク種別ID。通常タスクはタスク種別ID（例: `im_authorizeAuthz`）、ユーザ定義タスクは `definitionId`（例: `mail_sender`） |
| `keyType` | string | Yes | タスク種別でフィルタ。`application`（通常タスク） / `userDefinition`（ユーザ定義タスク） |

### レスポンス

[imLogicGetTaskTemplate.response.json](schemas/imLogicGetTaskTemplate.response.json) 参照。

### 呼び出し例

```jsonc
// 通常タスク
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "im_authorizeAuthz" } }

// ユーザ定義タスク（definitionId を指定）
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "mail_sender" } }
```

### 備考

- エンティティ系タスク（`hasEntityId: true`）の場合、`dataMapMetadata.inputDataDefinition` / `outputDataDefinition` はエンティティ未指定時のデフォルト（空 or 汎用スキーマ）を返す。実際のエンティティに基づく型は `imLogicResolveEntitySchema` で取得して上書きすること
- `cellSample` の `id` / `position` / `z` は build-flow.js が上書きするため、テンプレート内の値はプレースホルダ
- `optionMap` の `title` / `label` も同様に上書きされる
- ユーザ定義タスク（`keyType = "userDefinition"`）の場合、`flowElementSample.properties` は `{ definition: { definitionId, definitionType, definitionData: { elementId, elementProperties, inputDataDefinition, outputDataDefinition }, localize, ... }, continueOnError }` 構造を持つ。`elementProperties` の中身は `definitionType` ごとに形が異なる（`javascript`: `{ script }`、`sql`: `{ query, queryType, ... }` 等）。詳細は [reference/user-definitions.md](../reference/user-definitions.md) を参照
- ユーザ定義タスクの `inputDataDefinition` / `outputDataDefinition` はユーザがテナント側で自由に定義したもので、`imLogicResolveEntitySchema` での上書きは不要

---

## 3. `imLogicListEntities`

IM-Repository エンティティの一覧を返す。
エンティティを入力／出力に使うフローや、エンティティ系タスクで使う `entityId` を特定するために使用する。
**`imLogicResolveEntitySchema` は実在しない `entityId` を渡すとハングし得るため、まず本エンドポイントで実在する `entityId` を特定してから渡すこと。**

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`entityId` / `entityName` / `category` / `description` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（完全一致） |
| `dataSourceType` | string | No | データソース種別でフィルタ。`table` / `view` / `query` / `static` / `webservice` |

### レスポンス

[imLogicListEntities.response.json](schemas/imLogicListEntities.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "imLogicListEntities", "params": {} }

// キーワード検索（表示名・IDの部分一致）
{ "method": "imLogicListEntities", "params": { "query": "リッチテキスト" } }

// カテゴリフィルタ
{ "method": "imLogicListEntities", "params": { "category": "ポートレット" } }
```

### 備考

- フィールド（カラム）定義は含まない軽量サマリ。フィールド定義は `imLogicResolveEntitySchema` で取得する（`imLogicListTaskTypes` ⇒ `imLogicGetTaskTemplate` と同じ二段構え）
- `entityId` と `entityName` は必須。`category` / `dataSourceType` / `description` は省略される場合がある
- 全件取得でも概要のみのため軽量に収まる想定

---

## 4. `imLogicResolveEntitySchema`

エンティティIDに基づく、タスクの入出力フィールド定義を動的に解決して返す。
IM-Repository からエンティティのスキーマを取得し、タスク種別に応じた `inputDataDefinition` / `outputDataDefinition` を構築する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `keyId` | string | Yes | タスク種別ID（例: `im_repositorySearchEntityData`） |
| `entityId` | string | Yes | エンティティID（例: `imprtl_portlet_info_tables_imprtl_portlet_info`） |

### レスポンス

[imLogicResolveEntitySchema.response.json](schemas/imLogicResolveEntitySchema.response.json) 参照。

### 呼び出し例

```jsonc
{
  "method": "imLogicResolveEntitySchema",
  "params": {
    "keyId": "im_repositorySearchEntityData",
    "entityId": "imprtl_portlet_info_tables_imprtl_portlet_info"
  }
}
```

### 備考

- 返される `inputDataDefinition` / `outputDataDefinition` は `imLogicGetTaskTemplate` で取得したテンプレートの `dataMapMetadata` 内の同フィールドを上書きして使用する
- エンティティが見つからない場合はサーバ側で例外をスローしてツール実行が失敗する（詳細は末尾「エラー時の挙動」を参照）。実在する `entityId` のみを渡すこと

---

## 5. `imLogicListMappingFunctions`

マッピングで使用可能な関数の一覧を返す。
変数間マッピングで値の変換・加工が必要な場合に使用する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`name` / `label` / `description` / `category` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（完全一致） |

### レスポンス

[imLogicListMappingFunctions.response.json](schemas/imLogicListMappingFunctions.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "imLogicListMappingFunctions", "params": {} }

// キーワード検索
{ "method": "imLogicListMappingFunctions", "params": { "query": "配列" } }

// カテゴリフィルタ
{ "method": "imLogicListMappingFunctions", "params": { "category": "文字列操作" } }
```

### 備考

- 現状約50件。全件取得でも軽量（数KB）
- `argCount` でおおまかな引数の数がわかる。詳細は `imLogicGetMappingFunction` で取得

---

## 6. `imLogicGetMappingFunction`

指定した関数の完全定義を返す。
引数スキーマ・戻り値型・使用例を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | Yes | 関数名（例: `im_array_size`） |

### レスポンス

[imLogicGetMappingFunction.response.json](schemas/imLogicGetMappingFunction.response.json) 参照。

### 呼び出し例

```jsonc
{ "method": "imLogicGetMappingFunction", "params": { "name": "im_array_size" } }
```

### 備考

- `arguments[]` の順序は `mappingRules.source.arguments[]` のインデックスに対応
- `examples[]` に使用例を含む。コーディングエージェントが正しい `source` 構造を組み立てる材料になる
- 関数のネスト（引数に別の関数を渡す）は `mappingSource` の再帰構造で表現可能

---

## 利用フロー

1. `imLogicListTaskTypes(query?, keyType?, definitionType?)` ⇒ `imLogicGetTaskTemplate(keyId)`
   - 目的に合うタスクの `keyId` を特定（通常タスク or ユーザ定義タスク）
   - テンプレート取得（`build-flow.js` の `task-templates/*.json` 相当）
   - ユーザ定義タスクは `keyType = userDefinition` または `definitionType` でフィルタ可能

2. `imLogicListEntities(query?, category?)` ⇒ `imLogicResolveEntitySchema(keyId, entityId)`  ※ エンティティを使う場合のみ
   - `imLogicListEntities` で実在する `entityId` を特定（`hasEntityId: true` のタスク、またはエンティティを入出力に使うフロー）
   - `imLogicResolveEntitySchema` でエンティティ固有の入出力型定義を取得
   - テンプレートの `dataMapMetadata.inputDataDefinition` / `outputDataDefinition` を上書き（フロー入出力に使う場合は型定義として転用）
   - **`imLogicResolveEntitySchema` に推測の `entityId` を渡さない**（ハング回避。必ず `imLogicListEntities` で特定した値を渡す）
   - ユーザ定義タスクでは不要

3. `imLogicListMappingFunctions(query?)` ⇒ `imLogicGetMappingFunction(name)`  ※ 値の変換・加工が必要な場合のみ
   - マッピングで使う関数の名前・引数定義を取得

4. `spec.json` を組み立てて `build-flow.js` を実行

## エラー時の挙動

全エンドポイント共通。

存在しない `keyId` / `name` / `entityId` 等を指定した場合、サーバは **構造化されたエラーレスポンス（JSON）を返さず、サーバ側で例外をスローしてツール実行自体を失敗させる**。

サーバログには以下のように出力される。

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] ツールの実行に失敗しました。
java.lang.IllegalArgumentException: Task type not found. keyId=im_no_such_task, keyType=application
```

**注意（コーディングエージェント向け）:**

- ツール実行が失敗（例外）すると、呼び出し側（MCP クライアント）はレスポンスを受け取れず **待ち状態（ハング）になることがある**。
- そのため、`imLogicGetTaskTemplate` / `imLogicGetMappingFunction` / `imLogicResolveEntitySchema` を呼ぶ際は、存在しない ID を推測で渡さないこと。
- まず一覧系（`imLogicListTaskTypes` / `imLogicListMappingFunctions`）で実在する `keyId` / `name` を特定し、その値のみを詳細取得系に渡すこと。
- エンティティ（`hasEntityId: true`）についても、`imLogicResolveEntitySchema` には実在する `entityId` のみを渡すこと。
