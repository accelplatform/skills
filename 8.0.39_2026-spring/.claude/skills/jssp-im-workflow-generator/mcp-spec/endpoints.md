# MCP サーバ エンドポイント仕様

IM-Workflow の処理対象者（権限プラグイン）定義を提供する MCP サーバのエンドポイント。
標準プラグインはスキルセットの `reference/authority-plugins.md` に定義済み。
ユーザ拡張プラグインや、標準プラグインでカバーできない複雑な条件は MCP で解決する。

---

## 1. `listAuthorityPlugins`

利用可能な権限プラグインの一覧を返す。
標準プラグイン + ユーザ拡張プラグインの両方を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`suffix` / `label` / `description` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（`direct` / `combination` / `dynamic` / `custom`） |

### レスポンス

[listAuthorityPlugins.response.json](schemas/listAuthorityPlugins.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "listAuthorityPlugins", "params": {} }

// キーワード検索
{ "method": "listAuthorityPlugins", "params": { "query": "入社日" } }

// カスタムプラグインのみ
{ "method": "listAuthorityPlugins", "params": { "category": "custom" } }
```

### 備考

- 標準プラグイン（`reference/authority-plugins.md` に記載済みの約37パターン）も返される
- ユーザ拡張プラグインは `category: "custom"` で区別可能
- `extensionPointId` は直前ノードの種類で決まるため、レスポンスには含まない（build-workflow.js が自動判定）

---

## 2. `resolveAuthority`

処理対象者の自然言語記述から、具体的なプラグイン設定を解決して返す。
標準プラグインでは表現できない条件（例: 「2026/10/01以降に入社したユーザ」）を解決する。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `description` | string | Yes | 処理対象者の自然言語記述（例: `"2026/10/01以降に入社したユーザ"`） |
| `nodeType` | string | No | 適用先ノード種別（`apply` / `approve` / `confirm` / `handle` / `dynamic`）。省略時は `approve` |
| `prevNodeType` | string | No | 直前ノードの種別（`human` / `system`）。extensionPointId の判定に使用。省略時は build-workflow.js が自動判定 |

### レスポンス

[resolveAuthority.response.json](schemas/resolveAuthority.response.json) 参照。

### 呼び出し例

```jsonc
// カスタム条件の解決
{
  "method": "resolveAuthority",
  "params": {
    "description": "2026/10/01以降に入社したユーザ",
    "nodeType": "approve"
  }
}

// 標準プラグインの解決（MCPサーバ側で標準マッピングも対応可）
{
  "method": "resolveAuthority",
  "params": {
    "description": "申請者の所属組織の課長"
  }
}
```

### 備考

- レスポンスの `extensionPointId` / `pluginId` は `prevNodeType` が指定された場合のみ確定値を返す。省略時はサフィックスのみ返し、build-workflow.js が extensionPointId を判定する
- 解決できない場合はエラーレスポンスを返す
- ユーザ拡張プラグインの場合、`pluginId` のフォーマットが標準と異なる場合がある

---

## 利用フロー

1. ヒアリングで処理対象者の指示を受ける
   - 標準パターンに合致 → `reference/authority-plugins.md` のルールで解決（MCP 不要）
   - 標準パターンに合致しない → `resolveAuthority(description)` で MCP に問い合わせ

2. 必要に応じて `listAuthorityPlugins(query?)` で利用可能なプラグイン候補を検索

3. 解決結果を spec.json の `plugin` フィールドに設定

```jsonc
// 標準プラグイン（MCP 不要）
{ "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } }

// MCP で解決したカスタムプラグイン
{ "plugin": {
    "suffix": "custom_hire_date_filter",
    "extensionPointId": "jp.co.intra_mart.workflow.plugin.authority.node.approve",
    "pluginId": "jp.co.example.workflow.plugin.authority.hire_date_filter",
    "parameter": "2026/10/01",
    "targetType": "",
    "targetCode": ""
  }
}
```

build-workflow.js は `plugin` に `pluginId` / `extensionPointId` が明示されていればそれを使用し、なければ標準ルール（suffix + 直前ノード種別）で自動判定する。

## エラーレスポンス

全エンドポイント共通。

```jsonc
{
  "error": {
    "code": "NOT_FOUND",           // NOT_FOUND | INVALID_PARAMS | INTERNAL_ERROR
    "message": "No matching authority plugin found for the given description"
  }
}
```
