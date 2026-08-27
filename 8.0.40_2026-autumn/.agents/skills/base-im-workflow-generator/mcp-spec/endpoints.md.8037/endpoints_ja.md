# MCP サーバ エンドポイント仕様

IM-Workflow の処理対象者（権限プラグイン）定義を提供する MCP サーバのエンドポイント。
標準プラグインはスキルセットの `reference/authority-plugins.md` に定義済み。
ユーザ拡張プラグインや、標準プラグインでカバーできない複雑な条件は MCP で解決する。

ツール名は `mcp__im_workflow__<操作名>` 形式（snake_case）。

---

## 1. `mcp__im_workflow__list_authority_plugins`

利用可能な権限プラグインの一覧を返す。
標準プラグイン + ユーザ拡張プラグインの両方を含む。

### パラメータ

| 名前 | 型 | 必須 | 説明 |
|---|---|---|---|
| `query` | string | No | キーワード検索。`suffix` / `label` / `description` を対象に部分一致。省略時は全件返却 |
| `category` | string | No | カテゴリでフィルタ（`direct` / `combination` / `dynamic` / `custom`） |

### レスポンス

[mcp__im_workflow__list_authority_plugins.response.json](schemas/mcp__im_workflow__list_authority_plugins.response.json) 参照。

### 呼び出し例

```jsonc
// 全件取得
{ "method": "mcp__im_workflow__list_authority_plugins", "params": {} }

// キーワード検索
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "query": "入社日" } }

// カスタムプラグインのみ
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "category": "custom" } }
```

### 備考

- 標準プラグイン（`reference/authority-plugins.md` に記載済みの約37パターン）も返される
- ユーザ拡張プラグインは `category: "custom"` で区別可能
- `extensionPointId` は直前ノードの種類で決まるため、レスポンスには含まない（build-workflow.js が自動判定）
- `description` にはパラメータのヒントも含む。確定値ではないため、実際のコード値はプロジェクト仕様書またはユーザへの確認で取得すること

---

## 利用フロー

1. ヒアリングで処理対象者の指示を受ける
   - 標準パターンに合致 → `reference/authority-plugins.md` のルールで解決（MCP 不要）
   - 標準パターンに合致しない → `mcp__im_workflow__list_authority_plugins(query?)` でカスタムプラグインを検索

2. 解決したプラグインの `pluginId` と `description` を参照し、spec.json の `plugin` フィールドを設定

```jsonc
// 標準プラグイン（MCP 不要）
{ "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } }

// MCP で特定したカスタムプラグイン
{
  "plugin": {
    "suffix": "custom_hire_date_filter",
    "pluginId": "jp.co.example.workflow.plugin.authority.hire_date_filter",
    "parameter": "2026/10/01",
    "targetType": "",
    "targetCode": ""
  }
}
```

build-workflow.js は `plugin` に `pluginId` / `extensionPointId` が明示されていればそれを使用し、なければ標準ルール（suffix + 直前ノード種別）で自動判定する。

## エラー時の挙動

全エンドポイント共通。

存在しない条件を指定した場合、サーバは **構造化されたエラーレスポンス（JSON）を返さず、サーバ側で例外をスローしてツール実行自体を失敗させる**。

サーバログには以下のように出力される。

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] ツールの実行に失敗しました。
java.lang.IllegalArgumentException: No matching authority plugin found for the given description
```

**注意（コーディングエージェント向け）:**

- ツール実行が失敗（例外）すると、呼び出し側（MCP クライアント）はレスポンスを受け取れず **待ち状態（ハング）になることがある**。
- まず `query` パラメータで候補を絞り込み、実在するプラグインであることを確認してから利用すること。
