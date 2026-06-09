# 動的承認フロー（条件付き多段承認）の選択指針

「カテゴリ A は課長承認のみ、B は課長＋部長」「取得価格 10 万円以上は追加で部門マネージャ承認」のように、**案件データの条件で承認者を増減させる多段承認**は、**`matterProperties` + `rules` + `branch_start` ノード**で表現するのが**デフォルト**（仕様書で別途明示がない限りこの方式）。

| 実現方法 | 用途 | 推奨度 |
|---------|------|--------|
| **`matterProperties` + `rules` + `branch_start`**（分岐ルート） | 案件データ（金額・カテゴリ等）の条件で承認パスを切り替え | **デフォルト（指示がなければこれ）** |
| 案件開始処理 (`matter.start.process`) で承認者を動的に切り替え | matter_property に表現しづらい複雑な業務ロジック（外部システム連携等）でのみ | 限定用途。仕様書で明示指示があった場合のみ |
| 承認者プラグインの自作（MCP `resolveAuthority`） | 「2026/10/01 以降に入社したユーザ」等、組織/役職/ロールの組み合わせで表現できないカスタム条件 | 限定用途 |

## 判断フロー

1. 条件が「案件入力データ（金額・カテゴリ・区分等）」で表現できるか → Yes → **分岐ルート（matterProperties + rules）** を採用
2. 条件が「組織・役職・ロール・パブリックグループ」で表現できる承認者ロジックか → Yes → 通常の承認ノードに権限プラグインで指定（分岐不要）
3. 上記いずれも該当しない → 案件開始処理 or カスタムプラグイン

## 典型例（取得価格 10 万円以上で部門マネージャの追加承認）

```jsonc
{
  "pattern": "branch",
  "nodes": [
    { "id": "start", "type": "start" },
    { "id": "apply", "type": "apply",
      "plugin": { "suffix": "role", "targetCode": "im_workflow_user" } },
    { "id": "01", "type": "approve", "name": "Manager",
      "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps002" } },
    { "id": "brs1", "type": "branch_start", "name": "BranchByAmount",
      "branchMethod": "rule",
      "paths": [
        { "condition": { "ruleId": "01" }, "nodes": ["02"] },   // 10 万円以上: 部門マネージャの追加承認あり
        { "condition": { "ruleId": "02" }, "nodes": [] }        // 10 万円未満: 追加承認なし
      ] },
    { "id": "02", "type": "approve", "name": "DepartmentManager",
      "plugin": { "suffix": "apply_user_one_step_upper_department_and_post", "targetCode": "ps002" } },
    { "id": "bre1", "type": "branch_end" },
    { "id": "end", "type": "end" }
  ],
  "matterProperties": [
    { "key": "purchasePrice", "type": "numeric",
      "names": { "en": "Purchase Price", "ja": "取得価格", "zh_CN": "采购价格" } }
  ],
  "rules": [
    { "id": "01", "property": "purchasePrice", "operator": ">=", "value": "100000",
      "names": { "en": "Price >= 100000", "ja": "取得価格10万円以上", "zh_CN": "采购价格不少于10万" } },
    { "id": "02", "property": "purchasePrice", "operator": "<",  "value": "100000",
      "names": { "en": "Price < 100000",  "ja": "取得価格10万円未満", "zh_CN": "采购价格不足10万" } }
  ]
}
```

サンプル: [examples/branch.spec.json](../examples/branch.spec.json) も参照。
