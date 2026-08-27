# 分岐ルート XML テンプレート

## 概要

条件によって承認経路が分かれるワークフロー定義。
`Branch_Start` / `Branch_End` ノードで分岐区間を囲み、複数の承認パスを定義する。
分岐の前後に共通の直線ノードを配置できる。分岐のネスト（入れ子）も可能。

### 分岐方式

分岐の評価方式は 3 種類ある。Branch_Start ノードの `attributes`（`attributeType=7`）で切り替える。

| attributeType=7 の value | 分岐方式 | 説明 |
|--------------------------|---------|------|
| `1` | **ルール自動判定** | 案件プロパティの値を `rule` で自動評価し、条件に合致するパスに進む。`matter_property` と `rule` の定義が必要 |
| `0` | **処理者選択** | 指定されたノードの処理者（申請者・承認者）が、処理時に分岐先を画面上で選択する。`rule` / `matter_property` は不要 |
| `2` | **ユーザプログラム** | サーバサイドJS（分岐条件プログラム）が `true`/`false` を返して分岐先を決定する。contents の `plugins` にプログラムを登録し、flow の `details` で紐付ける |

## ルート図

### 基本形

```
                              ┌─ [Approve_A] ─────────────────┐
[Start] → [Apply] → [Branch_Start] ─ [Approve_B] → [Approve_C] → [Branch_End] → [End]
                              └─（デフォルト: 直結）──────────┘
```

### 分岐前に共通ノードを配置

全パスで共通の承認者は分岐の手前に出せる。

```
[Start] → [Apply] → [Approve_共通] → [Branch_Start] ─┬─ ... ─ [Branch_End] → [End]
                                                       └─ ... ─┘
```

### ネスト分岐

分岐パス内にさらに分岐を配置できる。Branch_Start / Branch_End は必ず対で使用する。

```
[Start] → [Apply] → [Approve_A] → [Branch_Start_01] ─┬─(直行)─────────────────── [Branch_End_01] → [End]
                                                       └─ [Approve_B] → [Branch_Start_02] ─┬─(直行)── [Branch_End_02] ┘
                                                                                            └─ [Approve_C] ────────────┘
```

## 使用例

### ルール自動判定方式

- 「経費申請ワークフロー。10万円未満は課長承認のみ、10万円以上は課長→部長の順で承認」
- 「全件課長承認後、50万円以上は部長承認、100万円以上は部長→本部長の順で承認」（ネスト分岐）

### 処理者選択方式

- 「申請者が分岐先を選択する」
- 「課長承認時に、次の経路を課長が選ぶ」
- 「申請時と上長承認時のどちらでも分岐先を選べるようにする」

### ユーザプログラム方式

- 「サーバサイドのプログラムで分岐先を判定する」
- 「DBの値に基づいてプログラムで分岐を制御する」
- 「外部システムの状態に応じて分岐条件をJSで実装する」

## 複合条件（AND）の実現方法

複数の条件を AND で組み合わせる方法は、**分岐パスの数** によって使い分ける。

### 2 択の場合: AND ルール 1 つ（ネスト分岐不要）

「条件を満たせば追加承認、満たさなければスキップ」のような **2 択** の場合は、`ruleUnionCondition=0`（AND 結合）のルール 1 つで判定できる。ネスト分岐は不要。

```
Branch_Start
  ├─ 条件A AND 条件B → 承認者X → Branch_End
  └─ (直行: 条件を満たさない) → Branch_End
Branch_End → ...
```

例: `unitPrice > 20000 AND totalAmount > 100000` の場合のみ部長承認を追加

### 3 択以上の場合: ネスト分岐（条件ごとに分岐ノードを分ける）

条件の組み合わせで **3 つ以上の異なるパス** に分かれる場合は、ネスト分岐を使用する。
AND ルールで全パターン分のルールを列挙するのは保守性が悪いため、各分岐ノードを単条件にしてネスト構造で組み合わせる。

```
Branch1_Start (条件A で分岐)
  ├─ 条件A=true → Branch2_Start (条件B で分岐)
  │   ├─ 条件B=true → 承認者X → Branch2_End
  │   └─ 条件B=false → (直行) → Branch2_End
  │ Branch2_End → Branch1_End
  └─ 条件A=false → (別の処理) → Branch1_End
Branch1_End → ...
```

- 各ルールは**単条件**（1 つの案件プロパティに対する 1 つの比較）にする
- 条件の組み合わせはネスト分岐の構造で表現する
- ルールを複数の分岐ノードで共有できる（例: 同じ `totalAmount >= 100000` ルールを Branch2 と Branch3 で使用）

完全版サンプルは `assets/sample-complete-branch.md` を参照。

### 判断基準まとめ

| 分岐パス数 | 方式 | ルール設計 |
|-----------|------|-----------|
| 2 択（条件合致 or スキップ） | 単一分岐 | AND ルール 1 つ |
| 3 択以上（条件の組み合わせで異なる処理） | ネスト分岐 | 各分岐は単条件ルール |

## パラメータ

template-straight.md のパラメータに加え:

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| branches | YES | 分岐パスの配列 | 下記参照 |

### branches 定義

```
[
  {
    name: "path_a",         // パス名（ID 生成用）
    nodes: [                // パス内の承認ノード配列
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" }
    ]
  },
  {
    name: "path_b",
    nodes: [
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
      { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
    ]
  }
]
```

**注意:** `nodeName` は全ロケールで共通の英語名を使用する（多言語対応しない）。

## contents セクション

直線ルートと同一。
template-straight.md を参照。

## route セクション（分岐固有部分）

### ノード構成

直線ルートの route テンプレートをベースに、Apply → End の間を以下のノードで置き換える。

#### ノード定義（分岐区間）

XML の全体構造は `sample-complete-branch.md` に従う。以下は分岐固有のノード仕様。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_branch_s` | Start branch | nodeTyp_Branch_Start | system | Apply | 各パス先頭ノード | 空 |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | 前ノード（先頭は Branch_Start） | 次ノード（最終は Branch_End） | 承認権限 |
| `{{name}}_branch_e` | End branch | nodeTyp_Branch_End | system | 各パス最終ノード | End | 空 |

- Apply の nextNodeIds を `{{name}}_branch_s` に変更、End の previousNodeIds を `{{name}}_branch_e` に変更
- Branch_Start / Branch_End の traceId: `{{BRANCH_TRACE_PREFIX}}-0.0`
- パスノードの traceId: `{{BRANCH_TRACE_PREFIX}}-{パス番号}.{ノード番号}`（パス番号は 1 から、ノード番号も 1 から）
- パスA の y = 110、パスB の y = 200
- 全ノード共通: `startNodeFlag=false`, `endNodeFlag=false`, `routeTemplateId=null`, `routeTemplateName=null`, `parentNode=null`

### BRANCH_TRACE_PREFIX の算出

`BRANCH_TRACE_PREFIX` は Branch_Start の直前ノードの traceId 連番の次の値。

| パターン | 直前ノードの traceId | BRANCH_TRACE_PREFIX |
|---------|---------------------|---------------------|
| Apply → Branch_Start | `0.1` | `0.2` |
| Approve(0.2) → Branch_Start | `0.2` | `0.3` |
| ネスト: 外側パス2のノード1(0.3-2.1) → 内側 Branch_Start | `0.3-2.1` | `0.3-2.2` |

### 座標計算式（分岐ルート）

| ノード | x 座標 | y 座標 |
|--------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| 分岐前の共通ノード | 160 + N * 110 | 50 |
| Branch_Start | 前ノード.x + 110 | 50 |
| パスA ノード | Branch_Start.x + 180 + (n-1)*130 | 110 |
| パスB ノード | Branch_Start.x + 110 + (n-1)*130 | 200 |
| Branch_End | max(全分岐ノード.x) + 120 | 50 |
| End | Branch_End.x + 80 | 50 |

座標の折り返し規則は template-straight.md を参照（ルートデザイナ: 10000 x 5000 px、x > 9500 で折り返し）。

### nextNodeIds の順序規則

`Branch_Start` の `nextNodeIds`:
1. パスA の先頭ノード
2. パスB の先頭ノード
3. ...（パスが増える場合）
4. **「承認不要で即終了」パスがある場合のみ** `Branch_End` を追加

`Branch_End` の `previousNodeIds`:
1. 各分岐パスの最終ノード
2. **「承認不要で即終了」パスがある場合のみ** `Branch_Start` を追加

**判断基準:** すべての分岐パスに最低1つの承認ノードがある場合、`Branch_Start` → `Branch_End` の直結パスは不要。
「条件に合致しない場合は承認なしで通過」のようなパスがある場合のみ直結パスを含める。

## flow セクション（分岐固有部分）

直線ルートと同様の構造をベースに、**Branch_Start ノードと Branch_End ノードもフローの `nodes` に含める**。
Branch_Start ノードには `details`（ルール紐付け）、`unions`（分岐先紐付け）、`attributes` を設定する。

### Branch_Start ノードのフロー設定

```xml
<value type="object">
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <nodeType type="string">9</nodeType>
  <lumpProcessFlag type="null" />
  <attachFileFlag type="null" />
  <autoProcessFlag type="null" />
  <autoProcessLimitDay type="null" />
  <autoProcessLimitType type="null" />
  <autoPressFlag type="null" />
  <autoPressLimitDay type="null" />
  <localeId type="string">{{localeId}}</localeId>
  <!-- details: ルールと分岐の対応付け（分岐パス数ぶん繰り返す） -->
  <details type="array">
    {{BRANCH_DETAILS}}
  </details>
  <!-- attributes: 分岐ノード属性 -->
  <attributes type="array">
    <!-- attributeType=7: 分岐方式（1=ルール自動判定 / 0=処理者選択） -->
    <value type="object">
      <no type="string">{{uniqueNo_attr}}</no>
      <flowId type="string">flow_{{name}}</flowId>
      <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
      <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
      <routeVersionId type="string">route_{{name}}_1</routeVersionId>
      <nodeId type="string">{{name}}_branch_s</nodeId>
      <localeId type="string">{{localeId}}</localeId>
      <attributeType type="string">7</attributeType>
      <attributeKey type="string">NoSetting</attributeKey>
      <value type="string">1</value>
    </value>
    <!-- 処理者選択方式の場合のみ: attributeType=11 エントリを選択可能ノード数ぶん追加 -->
    {{BRANCH_SELECT_NODE_ATTRIBUTES}}
  </attributes>
  <!-- unions: ルールと分岐先ノードの対応付け（分岐パス数ぶん繰り返す） -->
  <unions type="array">
    {{BRANCH_UNIONS}}
  </unions>
  <routeNode type="null" />
</value>
```

### details 要素

各 details 要素は「どの条件が成立したとき」を定義する。
分岐方式によって `cooperationType` と `cooperationId` が異なる。

#### ルール自動判定方式（cooperationType=19）— 1 分岐パスにつき 1 つ

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">19</cooperationType>
  <cooperationClassify type="string">2</cooperationClassify>
  <cooperationId type="string">{{ruleId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| no | ランダムID（15桁、`[0-9A-Za-z]`） | 一意ID（unions の `branchUnionId` と対応させる） |
| cooperationType | `19` | 分岐ルール種別（固定値） |
| cooperationClassify | `2` | ルール分類（固定値） |
| cooperationId | `rule_xxx` | **紐付ける rule セクションの ruleId** |
| emptyFlag | `0` | 空フラグ（固定値） |

#### ユーザプログラム方式（cooperationType=4）— 1 プログラムにつき 1 つ

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">4</cooperationType>
  <cooperationClassify type="string">0</cooperationClassify>
  <cooperationId type="string">{{contentsPluginId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| no | ランダムID（15桁、`[0-9A-Za-z]`） | 一意ID（unions の `branchUnionId` と対応させる） |
| cooperationType | `4` | **ユーザプログラム種別** |
| cooperationClassify | `0` | プログラム分類 |
| cooperationId | `{{contentsPluginId}}` | **contents の plugins に登録した分岐条件プラグインの `contentsPluginId`** |
| emptyFlag | `0` | 空フラグ（固定値） |

### unions 要素（1 分岐パスにつき 1 つ）

各 unions 要素は「ルールが成立したときどのパスに進むか」を定義する。

```xml
<value type="object">
  <branchUnionId type="string">{{uniqueNo_detail}}</branchUnionId>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <branchUnionGroupId type="string">{{uniqueNo_group}}</branchUnionGroupId>
  <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
  <countTrue type="string">1</countTrue>
  <countTargetNodeId type="string">{{pathFirstNodeId}}</countTargetNodeId>
</value>
```

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| branchUnionId | details の `no` と**同じ値** | details との紐付けキー |
| branchUnionGroupId | ランダムID（15桁、`[0-9A-Za-z]`） | グループID（各 union ごとに異なる一意値） |
| branchUnionGroupClassify | `0` | グループ分類（固定値） |
| countTrue | `1` | カウント条件（固定値） |
| countTargetNodeId | `expense_a_01` 等 | **分岐先パスの先頭ノードID** |

### details と unions の紐付け関係

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationId      = rule_01（ルールID）
unions[0].countTargetNodeId   = expense_a_01（パスA 先頭ノード）

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationId      = rule_02（ルールID）
unions[1].countTargetNodeId   = expense_b_01（パスB 先頭ノード）
```

**重要:** `details[n].no` と `unions[n].branchUnionId` を同じ値にすることで、「ルール → 分岐先」の対応が成立する。

### attributes の仕様

Branch_Start ノードの attributes には以下の属性を設定する。

#### attributeType=7（attrTyp_branchCondition: 分岐条件）— 必須・1 エントリ

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| attributeType | `7` | 分岐条件 |
| attributeKey | `NoSetting` | 固定値 |
| value | `1` = ルール自動判定 / `0` = 処理者選択 / `2` = ユーザプログラム | 分岐の評価方式 |

#### attributeType=11（attrTyp_branchSettableNodePlural: 分岐先設定可能ノード）— 処理者選択方式のみ

処理者選択方式（`attributeType=7` の `value=0`）の場合に追加する。
分岐先を選択させたいノードの数だけエントリを繰り返す。

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| attributeType | `11` | 分岐先設定可能ノード（複数） |
| attributeKey | `NoSetting` | 固定値 |
| value | ノードID（例: `expense_apply`） | **分岐先を選択可能にするノードの nodeId** |

AttributeType / AttributeKey の全コード一覧は `reference/node-types.md` の「AttributeType（属性種別）」を参照。

```xml
<!-- 処理者選択方式の場合の attributes 例 -->
<attributes type="array">
  <!-- 分岐方式: 処理者選択 -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_1}}</no>
    ...（flowId/flowVersionId/contentsVersionId/routeVersionId/nodeId/localeId は共通）
    <attributeType type="string">7</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">0</value>
  </value>
  <!-- 選択可能ノード 1: 申請ノード -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_2}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_apply</value>
  </value>
  <!-- 選択可能ノード 2: 直前の承認ノード -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_3}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_approve_1</value>
  </value>
</attributes>
```

#### no の採番規則

`no` はランダムID（15桁、`[0-9A-Za-z]`）で、ロケール間で共有する（details/unions の `no` とは別の値）。
attributeType=7 のエントリと各 attributeType=11 のエントリはそれぞれ異なる `no` を持つ。

### Branch_End ノードのフロー設定

Branch_End ノードはフローの `nodes` に含めるが、details / unions / attributes はすべて空配列。

| nodeId | nodeType | フラグ類 | details | attributes | unions |
|--------|----------|---------|---------|------------|--------|
| `{{name}}_branch_e` | `10` | 全て null | 空配列 | 空配列 | 空配列 |

「フラグ類」= lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay（全て `type="null"`）

### フロー nodes の記述順

```
1. Apply ノード（nodeType=2）
2. Branch_Start ノード（nodeType=9）— details/unions/attributes あり
3. 各承認ノード（nodeType=3）— パスA, パスB, ... の順に列挙
4. Branch_End ノード（nodeType=10）— details/unions/attributes は空
```

---

## matter_property / rule との連携（ルール自動判定方式のみ）

**ルール自動判定方式**（`attributeType=7` の `value=1`）では、案件プロパティの値に応じてどのパスに進むかを `rule` で制御する。
`matter_property` と `rule` は `<data>` 直下に contents / route / flow と並列で配置する。

**処理者選択方式**（`attributeType=7` の `value=0`）では `matter_property` / `rule` / `details` / `unions` は不要。
ただし、`details` と `unions` は空配列ではなく、分岐パス数ぶんのエントリを引き続き設定すること（ルールIDは任意の値でよい）。

### 使用例: 金額による分岐

プロンプト: 「10万円未満は課長承認のみ、10万円以上は課長→部長の順で承認」

必要な定義:
1. **matter_property**: `item_total`（合計金額、数値型）
2. **rule_01**: 合計金額 < 100000（パスA: 課長のみ）
3. **rule_02**: 合計金額 >= 100000（パスB: 課長→部長）

matter_property / rule の XML 構造は `sample-complete-branch.md` に従う。以下は設定値のみ示す。

#### matter_property 定義

| matterPropertyKey | matterPropertyName (ja/en/zh_CN) | matterPropertyModelType | matterPropertyTypeRule |
|-------------------|----------------------------------|------------------------|----------------------|
| `item_total` | 合計金額 / Total amount / 合计金额 | `1`（数値） | `1`（ルール条件で使用） |

他のプロパティ（matterPropertyTypeListPattern 等）はサンプルと同一のデフォルト値。

#### rule 定義

| ruleId | ruleName (ja) | compareRuleId | compareVariable | conditionValue |
|--------|--------------|---------------|-----------------|---------------|
| `rule_01` | 合計金額：100000未満 | `8`（less than） | `item_total` | `100000` |
| `rule_02` | 合計金額：100000以上 | `7`（greater or equal） | `item_total` | `100000` |

- `ruleUnionCondition`: `0`（AND 結合）
- `conditionValueType`: `0`（固定値）
- `ruleDetailModel.no`: `{ruleId}_1` 形式
- en / zh_CN の `ruleName` もローカライズすること

### 注意事項

- `matter_property` の `matterPropertyTypeRule` を `1` にしないとルールの条件変数として使えない
- `compareVariable` は `matter_property` の `matterPropertyKey` と一致させること
- ルールとパスの紐付けは**フロー定義の Branch_Start ノード**（`details` + `unions`）で行う。XML インポートだけで完結するため、管理画面での手動設定は不要
- 数値比較の場合 `matterPropertyModelType` は `1`（数値）にする

---

## ユーザプログラム方式の追加設定（attributeType=7 の value=2）

**ユーザプログラム方式**では、サーバサイドJS（分岐条件プログラム）で分岐先を判定する。
プログラムの実装は `jssp-im-workflow-usage` の `simple-rule-condition.md` を参照。
プログラムの `execute(parameter)` が `data: true` を返したパスに遷移する。

### 1. contents の plugins に分岐条件プラグインを登録

contents の**有効バージョン**の `plugins` 配列に、分岐条件プログラムごとに 1 エントリ追加する。

```xml
<plugins type="array">
  <!-- 既存のアクション処理プラグイン（あれば） -->
  ...
  <!-- 分岐条件プログラム 1 -->
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId_rule1}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
    <pluginName type="string">{{pluginName}}</pluginName>
    <parameter type="string">{{ruleScriptPath}}</parameter>
    <nodeType type="string" />
    <defaultFlag type="string">0</defaultFlag>
    <executeOrder type="string">{{executeOrder}}</executeOrder>
    <note type="string" />
  </value>
  <!-- 分岐条件プログラム 2（複数パスの場合） -->
  ...
</plugins>
```

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| contentsPluginId | ランダムID（15桁、`[0-9A-Za-z]`） | 一意ID。flow の details で `cooperationId` として参照される |
| exPointId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | **分岐条件プラグインの拡張ポイント** |
| pluginId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` | **スクリプト実行プラグイン** |
| pluginName | 任意の名前 | プラグイン表示名 |
| parameter | JSSP ファイルパス（拡張子なし） | 分岐条件プログラムのパス（例: `wf_expense/rule/rule01`） |
| nodeType | 空文字列 | 分岐条件プラグインではノード種別を指定しない |
| defaultFlag | `0` | デフォルトフラグ（`0` 固定） |
| executeOrder | `0`, `1`, ... | 実行順序（0始まり、プラグインごとに連番） |

### 2. flow の details に cooperationType=4 で紐付け

Branch_Start ノードの `details` に、分岐条件プログラムごとに `cooperationType=4` のエントリを追加する。
`cooperationId` には contents の `contentsPluginId` を指定する。

### 3. flow の unions でパスを紐付け

`cooperationType=4` の details エントリに対応する unions エントリで、プログラムが `true` を返したときの遷移先ノードを指定する。

### details と unions の紐付け関係（ユーザプログラム方式）

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationType    = 4（ユーザプログラム）
details[0].cooperationId      = {{contentsPluginId_rule1}}（contents プラグインID）
unions[0].countTargetNodeId   = expense_president（パスA 先頭ノード）

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationType    = 4（ユーザプログラム）
details[1].cooperationId      = {{contentsPluginId_rule2}}（contents プラグインID）
unions[1].countTargetNodeId   = expense_branch_e（パスB = 承認不要で直結）
```

## 生成チェックリスト

### 共通（両方式）

- [ ] template-straight.md のチェックリストすべて
- [ ] Branch_Start の nextNodeIds に全パスの先頭ノードが含まれている
- [ ] Branch_End の previousNodeIds に全パスの最終ノードが含まれている
- [ ] 分岐パスのノード同士の接続が正しい（パス内で直列）
- [ ] 各パスの Y 座標が異なっている（重ならない）
- [ ] traceId のパス番号が分岐ごとにユニーク
- [ ] Branch_Start と Branch_End の traceId が同じ値（対の特定）
- [ ] ネスト分岐がある場合、内側の traceId プレフィックスが外側のパス内連番の続きになっている
- [ ] フローの nodes に Branch_Start（nodeType=9）と Branch_End（nodeType=10）が含まれている
- [ ] Branch_Start の details 数 = unions 数 = 分岐パス数
- [ ] details の `no` と unions の `branchUnionId` が 1:1 で対応している
- [ ] unions の `countTargetNodeId` が各パスの先頭ノードIDを参照している
- [ ] attributes に `attributeType=7` のエントリが 1 つある

### ルール自動判定方式（attributeType=7 の value=1）追加チェック

- [ ] details の `cooperationId` が正しい ruleId を参照している
- [ ] matter_property の matterPropertyTypeRule が `1` になっている
- [ ] rule の compareVariable が matter_property の key と一致している
- [ ] rule が 3 ロケール分揃っている
- [ ] contents の rules 配列に使用する全 ruleId が登録されている

### 処理者選択方式（attributeType=7 の value=0）追加チェック

- [ ] attributes に `attributeType=11` のエントリが、分岐先を選択させたいノード数ぶんある
- [ ] `attributeType=11` の `value` が正しいノードID（Apply/Approve）を参照している
- [ ] 指定されたノードが Branch_Start より前のノードである

### ユーザプログラム方式（attributeType=7 の value=2）追加チェック

- [ ] contents の plugins に分岐条件プログラムが登録されている（`exPointId` = `jp.co.intra_mart.workflow.plugin.event.node.branch.rule`）
- [ ] plugins の `contentsPluginId` がロケール間で共有されている
- [ ] flow の details に `cooperationType=4` のエントリが、分岐条件プログラム数ぶんある
- [ ] details の `cooperationId` が contents plugins の `contentsPluginId` と一致している
- [ ] unions の `countTargetNodeId` が各プログラムに対応する分岐先ノードIDを参照している
- [ ] 分岐条件プログラム（.js）の実装が `jssp-im-workflow-usage` の `simple-rule-condition.md` に準拠している
