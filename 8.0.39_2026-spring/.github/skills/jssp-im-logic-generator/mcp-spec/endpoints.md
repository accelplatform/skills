# MCP サーバ エンドポイント仕様

IM-LogicDesigner タスク定義を提供する MCP サーバのエンドポイント仕様。

---

## 1. `listTaskTypes`

タスク種別の一覧を返す。
300件以上のタスクから目的のものを特定するために使用する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`keyId` / `label` / `description` / `category` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（完全一致） |

### レスポンス

[listTaskTypes.response.json](schemas/listTaskTypes.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "listTaskTypes", "params": {} }

// キーワード検索
{ "method": "listTaskTypes", "params": { "query": "認可" } }

// カテゴリフィルタ
{ "method": "listTaskTypes", "params": { "category": "リポジトリ" } }
```

### 備考

- 全件取得時でも概要のみのため数十KB程度に収まる想定
- `hasEntityId: true` のタスクは、spec 作成時に `resolveEntitySchema` の追加呼び出しが必要
- 通常タスク（`key.type = "application"`）に加え、ユーザ定義タスク（`key.type = "localUserDefinition"`）も含まれる。ユーザ定義は `definitionType`（`javascript` / `rest` / `sql` / `db_fetch`）で区別される

---

## 2. `getTaskTemplate`

指定したタスク種別の完全なテンプレートを1件返す。
`build-flow.js` が消費する全情報を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `keyId` | string | Yes | タスク種別ID（例: `im_authorizeAuthz`） |

### レスポンス

[getTaskTemplate.response.json](schemas/getTaskTemplate.response.json) 参照。

### 呼び出し例

```jsonc
{ "method": "getTaskTemplate", "params": { "keyId": "im_authorizeAuthz" } }
```

### 備考

- エンティティ系タスク（`hasEntityId: true`）の場合、`dataMapMetadata.inputDataDefinition` / `outputDataDefinition` はエンティティ未指定時のデフォルト（空 or 汎用スキーマ）を返す。実際のエンティティに基づく型は `resolveEntitySchema` で取得して上書きすること
- `cellSample` の `id` / `position` / `z` は build-flow.js が上書きするため、テンプレート内の値はプレースホルダ
- `optionMap` の `title` / `label` も同様に上書きされる

---

## 3. `resolveEntitySchema`

エンティティIDに基づく、タスクの入出力フィールド定義を動的に解決して返す。
IM-Repository からエンティティのスキーマを取得し、タスク種別に応じた `inputDataDefinition` / `outputDataDefinition` を構築する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `keyId` | string | Yes | タスク種別ID（例: `im_repositorySearchEntityData`） |
| `entityId` | string | Yes | エンティティID（例: `imprtl_portlet_info_tables_imprtl_portlet_info`） |

### レスポンス

[resolveEntitySchema.response.json](schemas/resolveEntitySchema.response.json) 参照。

### 呼び出し例

```jsonc
{
  "method": "resolveEntitySchema",
  "params": {
    "keyId": "im_repositorySearchEntityData",
    "entityId": "imprtl_portlet_info_tables_imprtl_portlet_info"
  }
}
```

### 備考

- 返される `inputDataDefinition` / `outputDataDefinition` は `getTaskTemplate` で取得したテンプレートの `dataMapMetadata` 内の同フィールドを上書きして使用する
- エンティティが見つからない場合はエラーレスポンスを返す

---

## 4. `listMappingFunctions`

マッピングで使用可能な関数の一覧を返す。
変数間マッピングで値の変換・加工が必要な場合に使用する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`name` / `label` / `description` / `category` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（完全一致） |

### レスポンス

[listMappingFunctions.response.json](schemas/listMappingFunctions.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "listMappingFunctions", "params": {} }

// キーワード検索
{ "method": "listMappingFunctions", "params": { "query": "配列" } }

// カテゴリフィルタ
{ "method": "listMappingFunctions", "params": { "category": "文字列操作" } }
```

### 備考

- 現状約50件。全件取得でも軽量（数KB）
- `argCount` でおおまかな引数の数がわかる。詳細は `getMappingFunction` で取得

---

## 5. `getMappingFunction`

指定した関数の完全定義を返す。
引数スキーマ・戻り値型・使用例を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | Yes | 関数名（例: `im_array_size`） |

### レスポンス

[getMappingFunction.response.json](schemas/getMappingFunction.response.json) 参照。

### 呼び出し例

```jsonc
{ "method": "getMappingFunction", "params": { "name": "im_array_size" } }
```

### 備考

- `arguments[]` の順序は `mappingRules.source.arguments[]` のインデックスに対応
- `examples[]` に使用例を含む。コーディングエージェントが正しい `source` 構造を組み立てる材料になる
- 関数のネスト（引数に別の関数を渡す）は `mappingSource` の再帰構造で表現可能

---

## 利用フロー

1. `listTaskTypes(query?)` ⇒ `getTaskTemplate(keyId)`
   - 目的に合うタスクの `keyId` を特定
   - テンプレート取得（`build-flow.js` の `task-templates/*.json` 相当）

2. `resolveEntitySchema(keyId, entityId)`  ※ `hasEntityId: true` の場合のみ
   - エンティティ固有の入出力型定義を取得
   - テンプレートの `dataMapMetadata.inputDataDefinition` / `outputDataDefinition` を上書き

3. `listMappingFunctions(query?)` ⇒ `getMappingFunction(name)`  ※ 値の変換・加工が必要な場合のみ
   - マッピングで使う関数の名前・引数定義を取得

4. `spec.json` を組み立てて `build-flow.js` を実行

## エラーレスポンス

全エンドポイント共通。

```jsonc
{
  "error": {
    "code": "NOT_FOUND",           // NOT_FOUND | INVALID_PARAMS | INTERNAL_ERROR
    "message": "Task type 'im_xxx' not found"
  }
}
```
