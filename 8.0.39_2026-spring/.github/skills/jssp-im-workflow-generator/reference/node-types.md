# IM-Workflow ノード種別・プラグインリファレンス

## ノード種別一覧

### nodeType（ルート定義内）

| nodeType | 名称 | nodeVariety | 説明 |
|----------|------|-------------|------|
| nodeTyp_Start | 開始 | system | ルートの開始ノード |
| nodeTyp_End | 終了 | system | ルートの終了ノード |
| nodeTyp_Apply | 申請 | human | 申請ノード |
| nodeTyp_Approve | 承認 | human | 承認ノード（静的・動的） |
| nodeTyp_Dynamic | 動的承認 | human | 動的に承認者を決定するノード |
| nodeTyp_Confirm | 確認 | human | 確認ノード（閲覧のみ、承認権限なし） |
| nodeTyp_System | システム | system | システムノード |
| nodeTyp_Horizontal | 横配置 | human | 横並び承認ノード（順次処理 — 配置順に1人ずつ） |
| nodeTyp_Vertical | 縦配置 | human | 縦並び承認ノード（並列処理 — 全員に同時到達・順不同） |
| nodeTyp_Sync_Start | 同期開始 | system | 同期（並列処理）の開始ノード |
| nodeTyp_Sync_End | 同期終了 | system | 同期（並列処理）の終了ノード。全パスの完了を待って合流 |
| nodeTyp_Branch_Start | 分岐開始 | system | 分岐の開始ノード |
| nodeTyp_Branch_End | 分岐終了 | system | 分岐の終了ノード |
| nodeTyp_Template | テンプレート置換 | human | ルートテンプレートの展開ノード |
| nodeTyp_Template_Start | テンプレート開始 | system | テンプレート開始ノード |
| nodeTyp_Template_End | テンプレート終了 | system | テンプレート終了ノード |

### nodeType（数値コード）

フロー定義内・プラグイン内で使用する数値コード。
定義元: `d.ts/workflow/enum/im-ssjs-node-type.d.ts`

| 数値コード | 対応 nodeType | 説明 |
|-----------|--------------|------|
| 0 | nodeTyp_Start | 開始ノード |
| 1 | nodeTyp_End | 終了ノード |
| 2 | nodeTyp_Apply | 申請ノード |
| 3 | nodeTyp_Approve | 承認ノード |
| 4 | nodeTyp_Dynamic | 動的処理ノード |
| 5 | nodeTyp_System | システムノード |
| 6 | nodeTyp_Confirm | 確認ノード |
| 7 | nodeTyp_Sync_Start | 同期開始ノード |
| 8 | nodeTyp_Sync_End | 同期終了ノード |
| 9 | nodeTyp_Branch_Start | 分岐開始ノード |
| 10 | nodeTyp_Branch_End | 分岐終了ノード |
| 11 | nodeTyp_Horizontal | 横配置ノード |
| 12 | nodeTyp_Vertical | 縦配置ノード |
| 13 | nodeTyp_Template | テンプレート置換ノード |
| 14 | nodeTyp_Template_Start | テンプレート開始ノード |
| 15 | nodeTyp_Template_End | テンプレート終了ノード |

---

## 権限プラグイン

権限プラグインの拡張ポイント・サフィックス・targetType・parameter 形式・サンプルデータの詳細は
`reference/authority-plugins.md` を参照。

### よく使うパターン

**申請ノード（デフォルト）:**
```
extensionPointId: ...node.apply
pluginId: ...apply.role
parameter: im_workflow_user
targetType: role
```

**承認ノード（B-2: 直前が人間ノード）— 役職指定の例:**
```
extensionPointId: ...node.approve
pluginId: ...approve.post
parameter: comp_sample_01^comp_sample_01^ps003
targetType: post
```

**承認ノード（B-1: 直前がシステムノード）— 役職指定の例:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.post
parameter: comp_sample_01^comp_sample_01^ps001
targetType: post
```

**承認ノード（B-1）— ロール指定の例:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.role
parameter: tenant_manager
targetType: role
```

**承認ノード（B-1）— パブリックグループ指定の例:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.public_group
parameter: sample_public^public_group_a
targetType: publicGroup
```

**確認ノード（組織）:**
```
extensionPointId: ...node.confirm
pluginId: ...confirm.department
parameter: comp_sample_01^comp_sample_01^dept_sample_10
targetType: department
```

### プラグイン設定の注意点

1. **二重記述が必要**: 詳細は `reference/xml-structure.md` の plugins 仕様を参照
2. **申請ノードのデフォルト**: 特に指定がなければ `im_workflow_user` ロールを使用
3. **サフィックス・targetType の詳細**: `reference/authority-plugins.md` を参照
4. **routePluginId 命名**: `plg_{短縮名}_{連番}` の形式（**最大20バイト**）
5. **分岐ルートのノード命名**: 同一役職が複数パスに存在する場合、パス識別子を付与する（例: `Manager(A)`, `Manager(B)`）
6. **ノード名（nodeName）は全ロケールで同一の英語名を使用する**（多言語対応しない）

---

## ノード接続パターン

### 直線ルート

```
Start → Apply → Approve1 → Approve2 → ... → End
```

- 各ノードの `previousNodeIds` と `nextNodeIds` は1要素ずつ
- Approve の数は任意

### 分岐ルート

```
Start → Apply → Branch_Start ─┬─ Approve_A(A) ──────────── Branch_End → End
                               ├─ Approve_A(B) → Approve_B ┘
                               └─ Approve_A(C) → Approve_B → Approve_C ┘
```

- `Branch_Start` の `nextNodeIds` に各分岐パスの先頭ノードを列挙
- `Branch_End` の `previousNodeIds` に各分岐パスの最終ノードを列挙
- **「承認不要で即終了」パスがある場合のみ** `Branch_Start` → `Branch_End` の直結パスを含める（全パスに承認が必須の場合は含めない）
- 同一役職が複数パスに存在する場合、ノード名にパス識別子を付与（例: `Manager(A)`, `Manager(B)`）

### 同期ルート

```
Start → Apply → Sync_Start ─┬─ Approve_1 ─┬─ Sync_End → End
                             └─ Approve_2 ─┘
```

- `nodeTyp_Sync_Start` / `nodeTyp_Sync_End` ノードで並列区間を囲む
- 分岐ルートとの違い: **全パスの処理が完了するまで Sync_End で待機**（分岐は条件に合致した1パスのみ実行）
- 各パスに独立した承認ノードを配置
- Sync_Start / Sync_End は plugins なし（system ノード）
- traceId は分岐ルートと同じ規則（対で同じ値、パス内は `{prefix}-{パス番号}.{ノード番号}`）

### 横配置ルート（順次承認）

```
Start → Apply → Horizontal → End
                 承認者1 → 承認者2 → ... → 承認者N
```

- `nodeTyp_Horizontal`（nodeType=11）ノードを使用
- 承認者は配置順に**1人ずつ順番**に処理する
- 横配置ノード内の承認者はフローの `attributes` で設定

### 縦配置ルート（並列承認）

```
Start → Apply → Vertical → End
                 ├─ 承認者1
                 ├─ 承認者2（全員に同時到達・順不同）
                 └─ 承認者N
```

- `nodeTyp_Vertical`（nodeType=12）ノードを使用
- 全承認者に**同時に到達**し、**順不同**で処理する。全員の承認完了まで待機
- 縦配置ノード内の承認者はフローの `attributes` で設定
- **順不同で全員承認が必要な場合**は、同期ノード（Sync）またはこの縦配置ノードを使用すること

---

## traceId の規則

traceId の詳細な採番規則（ネスト分岐を含む）は `reference/xml-structure.md` の「traceId の規則」を参照。

基本パターンの早見表:

| パターン | 意味 | 例 |
|---------|------|-----|
| `0.0` | Start / End | Start, End |
| `0.{N}` | メインライン N 番目 | Apply = `0.1` |
| `0.{N}-0.0` | 分岐/横配置/縦配置ノード | Branch_Start/End, Horizontal, Vertical |
| `0.{N}-{M}.{K}` | 分岐パス内ノード | M=パス番号(1〜), K=ノード番号(1〜) |

---

## フローノードの attributes

分岐ルート内の承認ノードは、フロー定義の `nodes` で `attributes` を設定する必要がある。

```xml
<attributes type="array">
  <value type="object">
    <no type="string">{{uniqueNo}}</no>
    <flowId type="string">{{flowId}}</flowId>
    <flowVersionId type="string">{{flowVersionId}}</flowVersionId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <routeVersionId type="string">{{routeVersionId}}</routeVersionId>
    <nodeId type="string">{{nodeId}}</nodeId>
    <localeId type="string">{{localeId}}</localeId>
    <attributeType type="string">1</attributeType>
    <attributeKey type="string">5</attributeKey>
    <value type="string">0</value>
  </value>
</attributes>
```

### `no` フィールドの採番規則

`no` は半角英数字（`[0-9A-Za-z]`）15桁の一意識別子（例: `5hx2qt35p8oslxo`）。
詳細は `reference/xml-structure.md` の「ランダム ID 生成規則」を参照。
ロケール間で同じ `no` を共有する。
同一ノード内で複数の attributes エントリがある場合、各エントリは異なる `no` を持つ。

### AttributeType（属性種別）

公式リファレンス: https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html

| 値 | コード名 | 説明 |
|----|---------|------|
| 0 | attrTyp_procTypName | 処理種別名 |
| 1 | attrTyp_procEnable | 処理禁止（コード名は「処理許可」だが、実態は指定した処理種別を**禁止**する設定） |
| 2 | attrTyp_replaceRoute | 置換ルート |
| 3 | attrTyp_dispatchNodeMin | 割当可能ノード数（最小） |
| 4 | attrTyp_dispatchNodeMax | 割当可能ノード数（最大） |
| 5 | attrTyp_execUserSetNode | 処理対象者設定可能ノード |
| 6 | attrTyp_cnfmUserSetNode | 確認対象者設定可能ノード |
| 7 | attrTyp_branchCondition | 分岐条件 |
| 8 | attrTyp_unionCondition | 結合条件 |
| 9 | attrTyp_sendbackTargetNode | 差戻し先ノード |
| 10 | attrTyp_branchSettableNodeSingular | 分岐先設定可能ノード（単数） |
| 11 | attrTyp_branchSettableNodePlural | 分岐先設定可能ノード（複数） |
| 12 | attrTyp_dynamicNodeDeleteDisable | 動的承認ノード削除禁止 |
| 13 | attrTyp_pluginParameterDisable | プラグイン設定（表示禁止） |

### AttributeKey（属性キー）

attributeKey は attributeType によって異なる値を指定する。
具体的な値は、公式リファレンスおよびエクスポート XML を参照のこと。

指定が不要な場合は `NoSetting` を設定する。

| 値 | コード名 | 説明 |
|----|---------|------|
| NoSetting | attrKey_NoSetting | 設定なし（attributeKey の指定が不要な場合） |

`attributeType=0`（処理種別名）および `attributeType=1`（処理禁止）の場合:
attributeKey には処理種別（ProcessType）のコード値を指定する。

| 値 | コード名 | 説明 |
|----|---------|------|
| 0 | procTyp_drf | 起票 |
| 1 | procTyp_apy | 申請 |
| 2 | procTyp_rapy | 再申請 |
| 3 | procTyp_dct | 取止め |
| 4 | procTyp_apr | 承認 |
| 5 | procTyp_apre | 承認終了 |
| 6 | procTyp_deny | 否認 |
| 7 | procTyp_rsv | 保留 |
| 8 | procTyp_rsvc | 保留解除 |
| 9 | procTyp_pbk | 引戻し |
| 10 | procTyp_sbk | 差戻し |
| 11 | procTyp_cnfm | 確認 |
| 12 | procTyp_trans | 振替 |

### 標準設定

- `attributeType=1`（処理禁止）, `attributeKey=5`（承認終了）, `value=0` は、承認ノード（Approve/Horizontal/Vertical）の標準設定。承認終了を禁止する意味

### 横配置・縦配置ノードの組み合わせ

横配置・縦配置ノードは直線ルートの中間に配置することもできる:

```
[Start] → [Apply] → [Approve1] → [Horizontal or Vertical] → [Approve3] → [End]
```

この場合、Horizontal / Vertical を通常の承認ノードと同様に接続する。
