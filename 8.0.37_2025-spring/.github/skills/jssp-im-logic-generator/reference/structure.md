# flow_definition.json 構造リファレンス

## トップレベル

```jsonc
{
  "flowCategories": [ /* カテゴリ定義 */ ],
  "flowDefinitions": [
    "<フロー定義1 を JSON.stringify した文字列>",
    "<フロー定義2 を JSON.stringify した文字列>"
  ]
}
```

`flowDefinitions` の各要素は **文字列にエスケープされたフロー定義 JSON**。
読むときは `JSON.parse` が必要。

## flowCategories の要素

```jsonc
{
  "categoryId": "imprtl_portlet_info",
  "categoryName": "Information Portlet",
  "sortNumber": 0,
  "localizes": {
    "ja":   { "locale":"ja",    "categoryName":"お知らせポートレット" },
    "en":   { "locale":"en",    "categoryName":"Information Portlet" },
    "zh_CN":{ "locale":"zh_CN", "categoryName":"门户组件" }
  },
  "parentId": "imprtl_portlet",
  "displayName": "お知らせポートレット"
}
```

## フロー定義（パース後）の構造

```jsonc
{
  "flowId": "...",
  "version": 1,
  "categoryId": "...",
  "flowName": "...",
  "localizes": {},
  "notes": "",
  "versionComment": null,
  "transaction": true,
  "validateRepositoryData": false,
  "mappingOrder": "SOURCE_HIERARCHY",
  "constants": [
    { "name":"ERROR_NO_ARTICLE_FOUND_JA", "value":"...", "typeId":"string", "description":"", "common":false }
  ],
  "variablesDataDefinition": { /* 型定義（後述） */ },
  "flowElements": [ /* タスク or sequence の配列 */ ],
  "inputDataDefinition":  { /* 型定義 */ },
  "outputDataDefinition": { /* 型定義 */ },
  "additional": {
    "ui": "<JointJSグラフを JSON.stringify した文字列>"
  }
}
```

## 型定義（input/output/variables 共通）

```jsonc
{
  "entrypoint": {
    "typeId": "root",          // typeDefinitions[].id を参照
    "basic": false,
    "required": false,
    "listingType": "none"      // "none" | "list" | "array"
  },
  "typeDefinitions": [
    {
      "id": "root",
      "properties": [
        { "typeId":"string",  "name":"foo", "listingType":"none", "required":true,  "basic":true },
        { "typeId":"imrepo_entity_xxx", "name":"input", "listingType":"none", "required":false, "basic":false }
      ]
    },
    { "id": "string",  "properties": [] },
    { "id": "integer", "properties": [] },
    { "id": "imrepo_entity_xxx", "properties": [ /* エンティティのフィールド */ ] }
  ]
}
```

- **basic** = プリミティブなら `true`、複合型なら `false`
- **listingType** = `"none"` / `"list"` / `"array"`（選定条件は [data-types.md](data-types.md#listingtype) 参照）
- **typeId** にはプリミティブ（`string` / `integer` / `boolean` / `long` / `double` / `bigdecimal` / `date` / `imdatetime` 等）や、エンティティ参照型（`imrepo_entity_*`）、フロー内ローカル型（`im_logic_object_*`）を指定。全量は [data-types.md](data-types.md) 参照

## flowElements

2 種類の要素が混在する。

### タスク要素

`key.type` は通常タスクが `"application"`、ユーザ定義タスクが `"localUserDefinition"`。

```jsonc
{
  "executeId": "im_repositorySearchEntityCount1",
  "alias": null,
  "key": { "type":"application", "id":"im_repositorySearchEntityCount", "version": null },
  "label": "エンティティデータ件数の取得",
  "comment": "",
  "properties": { "continueOnError": false, "entityId": "..." },
  "mappingDefinition": {
    "mappingRules": [
      { "id":"<uuid>", "target":"<path>", "source": { /* 後述 */ } }
    ]
  }
}
```

### sequence 要素（接続線）

```jsonc
{
  "executeId": "im_start_im_repositorySearchEntityCount1",
  "alias": null,
  "key": { "type":"application", "id":"im_sequence", "version": null },
  "label": null,
  "comment": null,
  "properties": {
    "startPoint": "im_start",
    "endPoint": "im_repositorySearchEntityCount1",
    "condition": "${...}"   // 任意。gateway からの分岐条件
  },
  "mappingDefinition": null
}
```

## mappingRules.source の type

- **`value`**: 値参照
  ```jsonc
  { "type":"value", "name":null, "path":"$input/foo/bar", "arguments":null }
  ```
- **`function`**: 関数呼び出し（再帰的に source を arguments に持つ）
  ```jsonc
  {
    "type":"function",
    "name":"im_array_size",
    "path":null,
    "arguments":[
      { "type":"value", "name":null, "path":"im_repositorySearchEntityData1", "arguments":null }
    ]
  }
  ```

`path` の起点規約は [source-paths.md](source-paths.md) を参照。

## additional.ui（JointJS グラフ）

```jsonc
{
  "version": 2,
  "graph": {
    "cells": [
      { "type":"devs.StartModel", /* ... */ },
      { "type":"devs.ProcModel",  /* ... */ },
      { "type":"devs.EndModel",   /* ... */ },
      { "type":"link", /* sequence と対応 */ }
    ]
  },
  "dataMap":   { "<cellUuid>": { /* metadata, common, typical, mapping, (elementId) */ } },
  "optionMap": { "<cellUuid>": { "title":"...", "label":"...", "inNum":1, "outNum":1 } }
}
```

### 同期ルール（必須）

- 各タスク要素 `flowElements[i]` に対応する **task cell** が `graph.cells[]` に存在
- task cell の **`id`** は UUID（`build-flow.js` が決定論的に生成）
- task cell の **`attrs."text.title".text`** は executeId に一致
- **`dataMap`・`optionMap` は cell.id（UUID）でキー付け**（link cell は対象外）
- 各 sequence 要素には **link cell** が対応（`source.id` / `target.id` は両端 task cell の UUID）
- **`flowElements[].mappingDefinition.mappingRules` と `dataMap[cellId].mapping.json.connectors` は同期必須**（後述）

`build-flow.js` はこの同期を自動で保証する。

### ユーザ定義タスクの dataMap 追加フィールド

ユーザ定義タスク（`key.type = "localUserDefinition"`）は、通常タスクとは異なる `dataMap` 構造を持つ:

- **`metadata.key`**: `{ "type": "localUserDefinition", "id": "<definitionId>" }` — テンプレートのサンプル ID ではなく、実際の `definitionId` が入る
- **`metadata.inputDataDefinition` / `outputDataDefinition`**: `properties.definition.definitionData` 内の型定義と同期される
- **`metadata.pairElementKey`**: Database Fetch の開始/終了ペアを指す。開始要素（`<definitionId>`）は終了要素 `$<definitionId>$` を、終了要素（`$<definitionId>$`）は開始要素 `<definitionId>` を参照
- **`metadata.iconId`**: タスクのアイコン ID（例: `"im_generic"`）
- **`elementId`（トップレベル）**: 内部タスク ID。IM-LogicDesigner がメタデータを解決するのに**必須**

```jsonc
{
  "metadata": {
    "key": { "type": "localUserDefinition", "id": "my_js_task" },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... },
    "pairElementKey": { ... },   // Database Fetch のみ
    "iconId": "im_generic"
  },
  "common": { ... },
  "typical": { ... },             // ユーザ定義: flowElement.properties のコピー
  "mapping": { ... },
  "elementId": "im_scriptExecutor" // ★ トップレベル。IM-LogicDesigner が参照
}
```

| definitionType | elementId |
|---|---|
| javascript | `im_scriptExecutor` |
| rest | `im_httpclient` |
| sql | `im_queryExecutor` |
| db_fetch | `im_startDbFetch` |
| template | `im_templateProcessor` |
| stored | `im_storedExecutor` |
| csv_fetch | `im_startCsvFetch` |
| csv_output | `im_csvOutput` |
| excel_in | `im_excelInput` |
| excel_out | `im_excelOutput` |
| xmlparser | `im_xmlparser` |
| htmlparser | `im_htmlparser` |

### dataMap[cellId].mapping.json — UI上のマッピング情報

**IM-LogicDesigner は `flowElements[].mappingDefinition.mappingRules` ではなく、こちらを読んで UI のマッピング線を描画・保存する。**
両者は必ず一致させる必要がある。

```jsonc
{
  "inputKeys": ["$input","$variable","$const","$account_context","im_xxx1"],
  "additionalKeys": [],
  "json": {
    "version": 1,
    "attrs": {},
    "connectors": [
      {
        "id": "<mappingRule.id と同じ UUID>",
        "source": {
          "id": "<port UUID>",
          "type": "$input",                 // 固定（JointJSのポート種別）
          "path": "$input\tresourceURI",    // ★ 区切り文字は TAB ("\t")
          "port": "out"
        },
        "target": {
          "id": "<port UUID>",
          "type": "$output",                // 固定
          "path": "im_authorizeAuthz1\tresourceURI",  // ★ TAB 区切り
          "port": "in"
        }
      }
    ],
    "size": { "width": 400, "height": 500 }
  }
}
```

ポイント:

- **path 区切りは TAB (`\t`)** — `mappingRules.source.path` の `/` 区切りとは別形式。`build-flow.js` は自動変換する。
- **connector の `id` は `mappingRule.id` と一致** させる
- **`inputKeys`** には `mappingRules` で参照した全ルート（`$input` / `$account_context` / `<上流タスク executeId>` 等）を含める。標準は `$input` / `$variable` / `$const`。
- **`source.type` / `target.type`** は JointJS 内部のポート種別。常に `"$input"` / `"$output"` 固定（実際のデータ起点ではない）。

`build-flow.js` は `mappingRules` から自動的にこの構造を生成する。

### function source の connector / attrs 表現

`source.type === "function"` の場合、関数は **マッピングエディタ上のノード**として表現される。
値マッピング（fixed な入出力ツリー）と違い、関数ノードは可動要素なので **`mapping.json.attrs` にインスタンスとして登録**し、connector はそのインスタンスを参照する。

**最重要ルール（同名関数の衝突回避）:**

1. **1 つの関数インスタンス = 1 つの UUID（nodeId）**。
   その関数の **すべてのポート（in1 / in2 / … / out）は connector 上で同一の `id`（= nodeId）を共有**し、ポートの区別は `port` フィールドのみで行う。
2. **nodeId は `mapping.json.attrs` にキーとして登録**し、値は描画位置 `{ "x": <n>, "y": <n> }`。
   attrs に無い関数ノードはエディタが復元できず、**同名関数が 1 ノードに統合され自己ループ**になる（concat の入れ子等で顕在化）。
3. **値（value）側のポートは connector ごとに一意な UUID** を振り、attrs には登録しない。

例: `result = concat( concat($input/a, $const/SEP), $input/b )`（inner / outer の 2 インスタンス）

```jsonc
"attrs": {
  "<innerNodeId>": { "x": 250, "y": 70 },   // ネストが深いほど左
  "<outerNodeId>": { "x": 370, "y": 20 }    // ルート（出力に最も近い）は右
},
"connectors": [
  // 1) $input/a → inner.in1
  { "id":"<uuid>", "source":{ "id":"<valUuid>", "type":"$input", "path":"$input\ta",       "port":"out" },
                   "target":{ "id":"<innerNodeId>", "type":"im_string_concat", "port":"in1" } },
  // 2) $const/SEP → inner.in2
  { "id":"<uuid>", "source":{ "id":"<valUuid>", "type":"$input", "path":"$const\tSEP",      "port":"out" },
                   "target":{ "id":"<innerNodeId>", "type":"im_string_concat", "port":"in2" } },
  // 3) inner.out → outer.in1（関数 → 関数。両端とも nodeId を共有）
  { "id":"<uuid>", "source":{ "id":"<innerNodeId>", "type":"im_string_concat", "port":"out" },
                   "target":{ "id":"<outerNodeId>", "type":"im_string_concat", "port":"in1" } },
  // 4) $input/b → outer.in2
  { "id":"<uuid>", "source":{ "id":"<valUuid>", "type":"$input", "path":"$input\tb",        "port":"out" },
                   "target":{ "id":"<outerNodeId>", "type":"im_string_concat", "port":"in2" } },
  // 5) outer.out → $output/result（この出力 connector の id だけ mappingRule.id と一致させる）
  { "id":"<mappingRule.id>", "source":{ "id":"<outerNodeId>", "type":"im_string_concat", "port":"out" },
                             "target":{ "id":"<uuid>", "type":"$output", "path":"$output\tresult", "port":"in" } }
]
```

- **`source.type` / `target.type`** = 関数ポートなら関数名、値側なら `$input`、出力先なら `$output`。
- **`source.path`** = 関数ポートには無し。値ポートのみ TAB 区切りパス。
- **`port`** = 関数の入力は `in1` / `in2` / …、出力は `out`。値側・出力先は通常 `in` / `out`。
- **同一マッピングパネルに同名関数を複数置く場合も、上記の nodeId 共有 + attrs 登録で正しく別インスタンスになる**（`build-flow.js` が自動生成する）。
- バリデータは「`target.type === "$output"` の connector」だけを mappingRule と数・id 照合する。関数引数 connector（`target.type` = 関数名）は別枠で許容される。

## task-templates の追加方法

`task-templates/<keyId>.json` を新規追加する。
形式は既存ファイル参照。
最低限必要なフィールド:

```jsonc
{
  "kind": "task",
  "keyId": "im_xxx",
  "flowElementSample": {
    /* タスク要素の雛形（executeId は連番で上書きされるのでサンプル値でOK） */
    "executeId": "im_xxx1",
    "alias": null,
    "key": { "type":"application", "id":"im_xxx", "version":null },
    "label": "...",
    "comment": "",
    "properties": { /* デフォルト properties */ },
    "mappingDefinition": { "mappingRules": [] }
  },
  "cellSample": {
    /* JointJS の devs.ProcModel cell 雛形（id, position, z は上書きされる） */
    "type": "devs.ProcModel",
    "size": { "width": 280, "height": 50 },
    "inPorts": ["in"],
    "outPorts": ["out"],
    "position": { "x": 0, "y": 0 },
    "id": "placeholder",
    "z": 1,
    "attrs": { /* ... text.title, text.label, ports ... */ }
  },
  "dataMapMetadata": {
    /* dataMap[cellId].metadata の中身（key, elementProperties, inputDataDefinition, outputDataDefinition） */
  },
  "dataMapTypical": { /* properties のデフォルト */ },
  "dataMapMappingDefaults": { "inputKeys": [...], "additionalKeys": [], "json": {} },
  "optionMap": { "title":"im_xxx1", "label":"...", "inNum":1, "outNum":1 }
}
```

既存テンプレートは IM-LogicDesigner で実際に保存した `flow_definition.json` から抽出したもの。
新タスクを追加するときも、IM-LogicDesigner で 1 度 export してから抽出するのが確実。
