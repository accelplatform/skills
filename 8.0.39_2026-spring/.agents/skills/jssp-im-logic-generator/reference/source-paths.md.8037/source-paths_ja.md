# mappingRules.source.path 起点リファレンス

`source.type` が `"value"` のとき、`path` は以下のいずれかの起点から始まる。

| 起点 | 用途 | 例 |
|---|---|---|
| `$input/...` | 入力データ（`inputDataDefinition` で定義した値） | `$input/input/portletId` |
| `$output/...` | 出力データへの書き込み（`target` 側で使用） | `$output/data/articleCount` |
| `$variable/...` | フロー変数（`variablesDataDefinition` で定義） | `$variable/tempCount` |
| `$const/<NAME>` | 定数（`constants[].name`） | `$const/ACTION_CONFIG` |
| `$session_properties/...` | システムセッション情報 | `$session_properties/systemDate` |
| `$account_context/...` | ログインユーザー情報 | `$account_context/userCd`, `$account_context/locale` |
| `<executeId>/<field>` | 直前タスクの出力 | `im_repositorySearchEntityCount1/count` |
| `<executeId>` | 直前タスクの出力（オブジェクト全体） | `im_repositorySearchEntityData1` |

## target 側

`mappingRules.target` も同じ起点規約を持つが、よく使うのは:

- `$output/...` — フロー出力への書き込み
- `$variable/...` — フロー変数への書き込み
- `<executeId>/<inputField>` — タスクの入力フィールドへのバインド
  - 例: `im_repositoryEntityDataUpdate1/portletId`

## マッピングの定義場所

mappingRules はデータを**受け取る側のタスク**に定義する。

| やりたいこと | mappingRules を定義するタスク | 例 |
|---|---|---|
| タスクへの入力値を設定 | そのタスク自身 | `im_repositorySearchEntityCount1` の mappingRules で `$input/entityId` → 入力 |
| フロー変数へ書き込み | 書き込みの直後のタスク | 次のタスクの mappingRules で `source` → `$variable/temp` |
| フロー出力（`$output`）へ書き込み | **`im_end`**（終了タスク） | `im_end` の mappingRules で `source` → `$output/body` |

**重要:** `$output/...` への書き込みは必ず `im_end` タスクの mappingRules に定義すること。
他のタスクに定義すると `MappingException: property ... not found` エラーが発生する。

## 区切り文字

- パス区切りは `/`
- ネストしたオブジェクトは `parent/child/grandchild`
- 配列要素は IM-LogicDesigner 内部で扱われ、通常の path には添字は出てこない（配列全体を渡す）
