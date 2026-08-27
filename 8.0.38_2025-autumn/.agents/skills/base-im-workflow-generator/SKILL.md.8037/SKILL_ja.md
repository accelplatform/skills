---
name: base-im-workflow-generator
description: IM-Workflow のインポート用 XML 定義ファイルを新規生成する。プロンプトの指示（ワークフロー名、ルートパターン、承認ノード構成）から、contents/route/flow セクションを含むインポート XML を出力する。「ワークフロー定義を生成」「WF インポート XML を作成」「ワークフロー定義ファイル」と言及されたときに使用。ワークフローのプログラム（アクション処理・画面）は、JSSP 実装なら jssp-im-workflow-usage、Java（JavaEE 開発モデル）実装なら java-im-workflow-usage を使うこと。
---

# IM-Workflow インポート XML 生成スキル

## 目的

IM-Workflow のインポート用 XML 定義ファイルを、プロンプトの指示からゼロ生成するためのスキル。
生成された XML は IM-Workflow 管理画面のインポート機能で取り込み可能。

## 参照すべき規約

本スキルは **XML 定義ファイル**（`.xml`）のみを生成し、`.js` / `.html` の実装は行わない（実装は `jssp-im-workflow-usage` の責務）。そのため参照すべき規約は最小限。全体像は `.agents/requirements/README.md` 参照。

| 規約 | 取り扱い |
|------|---------|
| `jssp-file-structure.md` | 🟢 必読 — XML の出力先（`src/main/storage/public/im_workflow/`） |
| `jssp-naming.md` | 🟢 必読 — workflowName / shortName 等の命名 |
| `jssp-function-container.md` / `jssp-presentation-page.md` / `jssp-code-style.md` 等 | 🔴 **本スキル単独では不要**（XML 生成のみ。`.js` / `.html` の実装は `jssp-im-workflow-usage` の責務） |
| `jssp-2way-sql.md` / `jssp-accessibility.md` / `jssp-logging.md` 等 | 🔴 **本スキル単独では不要** |

## 生成対象

- **contents**（コンテンツ定義）- 画面パス（申請/承認/確認/詳細 等 8 種）+ ルール紐付け
- **route**（ルート定義）- ノード構成（Start/Apply/Approve/Branch/End 等）と接続
- **flow**（フロー定義）- コンテンツとルートの紐付け、フロー設定
- **matter_property**（案件プロパティ）- 業務データ項目（金額等、分岐条件に使用）
- **rule**（分岐ルール）- 案件プロパティの条件判定ルール

## 対応ルートパターン

| パターン | テンプレート | 説明 |
|---------|------------|------|
| 直線ルート | `assets/template-straight.md` | Start → Apply → Approve（N個） → End |
| 分岐ルート | `assets/template-branch.md` | 条件分岐（Branch_Start / Branch_End） |
| 同期ルート | `assets/template-sync.md` | 並列処理・全パス完了待ち（Sync_Start / Sync_End） |
| 横配置ルート | `assets/template-parallel.md` | 順次承認（nodeTyp_Horizontal）— 配置順に1人ずつ |
| 縦配置ルート | `assets/template-vertical.md` | 並列承認（nodeTyp_Vertical）— 全員に同時到達・順不同 |

### 「順不同」の承認者が複数いる場合のノード選択

複数の承認者が**順不同**（どちらが先でもよい）で**全員の承認が必要**な場合、**同期ノード（Sync_Start / Sync_End）** または **縦配置ノード（nodeTyp_Vertical）** を使用する。
横配置ノード（nodeTyp_Horizontal）は順次処理のため使用しないこと。

| ノード種別 | 用途 | 承認者の指定方法 |
|-----------|------|----------------|
| 同期ノード | 各承認者を個別の Approve ノードとして並列パスに配置。全パス完了まで待機 | ルート定義時に承認者を静的に指定（推奨） |
| 縦配置ノード | 1つのノード内に複数の承認者を動的に配置。全員に同時到達し順不同で承認 | フロー設定で承認者数を設定 |
| ~~横配置ノード~~ | ~~順次承認（配置順に1人ずつ）~~ | **順不同の承認には不適切。使用しないこと** |

### 動的承認フロー（条件付き多段承認）の選択指針

案件データの条件で承認者を増減させる多段承認は、**`matterProperties` + `rules` + `branch_start` ノード（分岐ルート）** がデフォルト。判断フロー・典型例（取得価格 10 万円以上で部門マネージャの追加承認）・他の実現方法（案件開始処理 / カスタムプラグイン）との使い分けは [reference/dynamic-approval-flow.md](reference/dynamic-approval-flow.md) を参照。

## ファイル構成

```
base-im-workflow-generator/
├── SKILL.md
├── scripts/
│   ├── build-workflow.js          # spec.json → インポート XML 生成（UTF-16LE 出力）
│   ├── validate-workflow.js       # 生成済み XML のバリデータ
│   ├── validate-xml-encoding.js   # UTF-16LE エンコーディング検証・修復
│   └── validate-xsd.js            # XSD 構造検証
├── reference/
│   ├── xml-structure.md        # XML 全体構造・型属性・バージョン規則・ロケール
│   ├── node-types.md           # ノード種別・AttributeType・AttributeKey 仕様
│   ├── authority-plugins.md    # 権限プラグイン仕様（サフィックス・targetType）
│   ├── default-notification.md # 通知テンプレート仕様
│   ├── validate-xml-encoding.md # UTF-16LE エンコーディング検証スクリプト
│   ├── validate-xsd.md         # XSD 構造検証手順
│   ├── import-xml-checklist.md # セルフチェックリスト
│   └── im_workflow-import.xsd  # XSD スキーマ
├── mcp-spec/                   # MCP エンドポイント仕様
│   ├── endpoints.md            # MCP エンドポイント仕様（処理対象者プラグイン）
│   └── schemas/
│       └── mcp__im_workflow__list_authority_plugins.response.json
├── examples/
│   ├── straight.spec.json    # 直線ルートの spec サンプル
│   └── branch.spec.json      # ネスト分岐ルートの spec サンプル
└── assets/
    ├── sample-complete-branch.md # 完全版 XML サンプル（構造の参考用）
    ├── template-straight.md      # 直線ルートの spec 設計参考
    ├── template-branch.md        # 分岐ルートの spec 設計参考
    ├── template-sync.md          # 同期ルートの spec 設計参考
    ├── template-parallel.md      # 横配置ルートの spec 設計参考
    └── template-vertical.md      # 縦配置ルートの spec 設計参考
```

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「ワークフロー定義を作って」
- 「ワークフローのインポートデータ（XML）を生成して」
- 「WF のインポートファイルを作成して」
- 「申請→承認のフローを XML で定義して」

## 生成手順

### 1. ヒアリング

以下の情報をユーザから確認する:

| 項目 | 必須 | 例 |
|------|------|-----|
| ワークフロー名（英語ID用） | YES | `purchase`, `expense` |
| フロー名（日本語） | YES | `購買申請`, `経費申請` |
| フロー名（英語） | YES | `Purchase Request` |
| ルートパターン | YES | 直線 / 分岐 / 同期 / 横配置 / 縦配置 |
| 承認ノード構成 | YES | 課長→部長 / 条件分岐あり（※下記「承認者の解釈ルール」参照） |
| 画面パスのベース | YES | `sample/purchase/workflow` |

### 承認者の解釈ルール（権限プラグイン選択）

ユーザーが承認者を指示した際、**指示の具体度**に応じて使用する権限プラグインを選択する。
詳細は `reference/authority-plugins.md` の「承認者指示のデフォルト解釈ルール」セクションを参照。

| ユーザーの指示例 | 解釈 | サフィックス |
|---------------|------|------------|
| 「課長」「部長」（役職名のみ） | 申請者の所属組織＋役職 | `.apply_user_department_and_post` |
| 「営業部の課長」（組織＋役職） | 特定組織＋役職 | `.department_and_post` |
| 「申請者の上位組織の部長」 | 申請者の上位組織＋役職 | `.apply_user_one_step_upper_department_and_post` |
| 「前の承認者の部長」 | 前処理者の所属組織＋役職 | `.before_user_department_and_post` |
| 「WF管理者」（ロール名のみ） | ロール直接指定（組織で絞らない） | `.role` |
| 「営業部のWF担当者」（組織＋ロール） | 特定組織＋ロール | `.department_and_role` |
| 「田中さん」（個人名） | ユーザ直接指定 | `.user` |
| 「経理部」（組織名のみ） | 組織指定 | `.department` |
| 「IM-LogicDesignerで取得」「フローIDで動的決定」 | IM-LogicDesigner フロー連携 | `.logic_flow_user` |

**重要:**
- **apply ノード**（申請権限）では `.role`（例: `im_workflow_user`）を使用すること。`apply_user_*` 系の動的プラグインは apply 拡張ポイントでは使用できない。
- 役職名のみの指示（「課長」「部長」等）では `.post`（直接指定）を使用しないこと。`.post` は組織を絞らないため全組織の該当役職者が対象になり、業務上の意図と合わない。デフォルトは **`.apply_user_department_and_post`**（申請者の所属組織＋役職）を使用する。
- ロール名のみの指示（「WF管理者」等）では `.role`（直接指定）を使用する。ロールはシステム管理・機能権限の性質が強く、組織で絞ると承認者不在になるリスクがある。
- 上記はサフィックスの選択ルール。拡張ポイント（`approve` vs `approve.static`）は直前ノードの種類で別途決まる。直前が人間ノード → `approve.{サフィックス}`、直前がシステムノード → `approve.static.{サフィックス}`。両方の判断を必ず適用すること。
- 上記いずれにも合致しない指示（例: 「2026/10/01以降に入社したユーザ」等のカスタム条件）は、`mcp__im_workflow__list_authority_plugins` でキーワード検索してカスタムプラグインを探す。詳細は [mcp-spec/endpoints.md](mcp-spec/endpoints.md) 参照。
- **`.logic_flow_user`** を使用する場合、`targetCode` は JSON オブジェクトで渡してよい（`build-workflow.js` が自動的に JSON 文字列に変換する）。`targetType` の明示指定も不要（`logic_flow_user` と自動推論される）。
  ```jsonc
  // approve / confirm ノードで IM-LogicDesigner フロー連携
  { "id": "01", "type": "approve", "name": "Approver",
    "plugin": { "suffix": "logic_flow_user",
                "targetCode": { "flowId": "my_authority_flow", "version": null, "versionDecide": false } } }
  ```

#### targetCode に渡す値の取得方法

上記の例で示している `ps003`、`comp_sample_01^comp_sample_01^ps003` 等は intra-mart 標準サンプルテナント（`comp_sample_01`）の値であり、**実プロジェクトでは異なるコード体系**が使われる。実コードの取得元は以下の優先順位で確認すること:

1. **プロジェクト仕様書・設計書**に明記されている場合 → そのコードを使用する（最優先）
2. **`mcp__im_workflow__list_authority_plugins`** でプラグインを特定し、`parameterHint` を参考に必要なコード値をユーザに確認する
3. 上記いずれも得られない場合 → サンプル値を仮置きし、**ユーザに「実コードを確認してください」と必ず明示確認する**（サンプル値のまま納品しない）

役職コード・組織コード・ロールID 等のサンプル一覧は `reference/authority-plugins.md` の「サンプルデータ」セクション参照（**学習教材としての参照用途のみ**。実コードとして転記しない）。

### 2. spec.json を組み立てる

ヒアリング結果から spec.json を作成する。コーディングエージェントが書くのはこの spec のみ。
サンプル: [examples/straight.spec.json](examples/straight.spec.json)（直線）、[examples/branch.spec.json](examples/branch.spec.json)（ネスト分岐）
XML の構造（3ロケール展開・2バージョン・プラグイン二重登録等）は `build-workflow.js` が自動生成する。

```jsonc
{
  "workflowName": "purchase_request",         // 英語 ID（スネークケース）
  "shortName": "pur_req",                     // プラグインID用短縮名
  "names": {
    "en": "Purchase Request",
    "ja": "購買申請",
    "zh_CN": "采购申请"
  },
  "screenBasePath": "purchase/workflow",       // 画面パスのベース（デフォルトパス生成用）
  "screens": {                                 // 画面パスの個別指定（省略時は screenBasePath から自動生成）
    "apply": "purchase/workflow/apply/index",   //   申請画面（pageType=0）
    "tempSave": null,                          //   一時保存画面（pageType=1, null=申請画面と共用）
    "applyTask": null,                         //   申請タスク画面（pageType=2）
    "reapply": "purchase/workflow/apply/index", //   再申請画面（pageType=3, 申請画面と共用可）
    "process": "purchase/workflow/approve/index", // 処理画面（pageType=4）
    "confirm": null,                           //   確認画面（pageType=5）
    "processDetail": "purchase/workflow/detail/index", // 処理詳細画面（pageType=6）
    "referDetail": "purchase/workflow/detail/index"    // 参照詳細画面（pageType=7, 処理詳細と共用可）
  },
  "pattern": "straight",                       // straight / branch / sync / horizontal / vertical
  "generationDate": "2026/04/10",             // バージョン切替日

  "nodes": [
    { "id": "start",  "type": "start" },
    { "id": "apply",  "type": "apply",   "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } },
    { "id": "01",     "type": "approve", "name": "Manager",  "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps002" } },
    { "id": "02",     "type": "approve", "name": "Director", "plugin": { "suffix": "role", "targetCode": "im_workflow_user" } },
    { "id": "end",    "type": "end" }
  ],

  // straight の場合 edges は省略可（nodes 順に自動接続）
  // branch/sync の場合は明示する:
  "edges": [
    { "from": "start", "to": "apply" },
    { "from": "apply", "to": "01" }
  ],

  // 分岐パターンのみ:
  "matterProperties": [
    { "key": "unitPrice", "type": "numeric", "names": { "en": "Unit Price", "ja": "単価", "zh_CN": "单价" } }
  ],
  // 単一条件（旧形式・後方互換）
  "rules": [
    { "id": "01", "property": "unitPrice", "operator": "<", "value": "20000",
      "names": { "en": "UnitPrice less than 20000", "ja": "単価20000未満", "zh_CN": "单价不足20000" } }
  ]

  // 複数条件（新形式）: AND / OR どちらも指定可
  // "rules": [
  //   {
  //     "id": "02",
  //     "unionCondition": "and",   // "and"（省略時デフォルト）または "or"
  //     "conditions": [
  //       { "property": "amount",     "operator": ">=", "value": "20000" },
  //       { "property": "item_total", "operator": ">=", "value": "100000" }
  //     ],
  //     "names": { "en": "...", "ja": "金額20000以上 かつ 合計金額100000以上", "zh_CN": "..." }
  //   }
  // ]
}
```

**画面パス（screens）の指定ルール:**
- `screens` で個別指定した画面パスが優先される。省略したキーは `screenBasePath` からデフォルト生成される
- **画面ファイルは `{機能名}/{画面種別}/index.js` + `index.html` の命名が標準**。`apply/apply` のような冗長パスにしない
- 申請画面と再申請画面で同一画面を共用する場合は、両方に同じパスを指定する（例: `"apply": "leave/apply/index", "reapply": "leave/apply/index"`）
- 処理詳細画面と参照詳細画面も同様に共用可能
- **`screens` を省略した場合のデフォルトパス**: `{screenBasePath}/apply/index`、`{screenBasePath}/process/index` 等

**ノード名（name）の言語:**
- `nodeName` は多言語化できない。**全ロケールで同一の英語名**を使用すること。
- ノード名は一般ユーザも見る場所であるため、プロンプトの言語に関わらず英語で統一することを推奨する。

**ノードの type 一覧:**

| type | nodeType | 説明 |
|------|----------|------|
| `start` | nodeTyp_Start | 開始 |
| `end` | nodeTyp_End | 終了 |
| `apply` | nodeTyp_Apply | 申請 |
| `approve` | nodeTyp_Approve | 承認 |
| `confirm` | nodeTyp_Confirm | 確認（閲覧のみ・承認権限なし）。**メインフローとは別の終端枝**として承認ノード等にぶら下げる。直線ルート（straight）で nodes に並べると次ノードに自動接続されてバリデーターエラーになるため、**必ず `edges` を明示して確認ノードへの接続のみを記述し、確認ノードからの outgoing edge は書かない**こと。 |
| `branch_start` | nodeTyp_Branch_Start | 分岐開始 |
| `branch_end` | nodeTyp_Branch_End | 分岐終了 |
| `sync_start` | nodeTyp_Sync_Start | 同期開始 |
| `sync_end` | nodeTyp_Sync_End | 同期終了 |
| `horizontal` | nodeTyp_Horizontal | 横配置（順次承認） |
| `vertical` | nodeTyp_Vertical | 縦配置（並列承認） |

**ノードのアクション処理（actionProcess）:**

apply / approve ノードに `actionProcess` フィールドでアクション処理のスクリプトパスを指定する。
**`actionProcess` を指定しないノードにはアクション処理プラグインが登録されない。**

```jsonc
{
  "id": "apply", "type": "apply",
  "actionProcess": "leave/action/ActionProcess1"  // アクション処理のスクリプトパス
},
{
  "id": "01", "type": "approve", "name": "Manager"
  // actionProcess 未指定 → アクション処理なし（プラグイン未登録）
},
{
  "id": "02", "type": "approve", "name": "HR",
  "actionProcess": "leave/action/ActionProcess2"  // 承認終了時に残日数減算
},
{
  "id": "03", "type": "approve", "name": "Director",
  "actionProcess": "jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess",
  "actionProcessImpl": "java"  // Java クラス実行（JavaEE 開発モデル）。省略時は "jssp"（スクリプト実行）
}
```

注意:
- パスには `.js` 拡張子を含めない（IM-Workflow が自動補完する）
- アクション処理が不要なノードには `actionProcess` を指定しないこと（指定すると存在しないファイルを参照してエラーになる）
- `actionProcessImpl: "java"` を指定した場合、`actionProcess` には JSSP ファイルパスではなく **実装クラスの完全修飾名（FQCN）** を指定する（実装は `java-im-workflow-usage` スキルを使用）。`pluginId` は `{exPointId}.pluginJavaExecutor` になる（[reference/java-class-registration.md](reference/java-class-registration.md) 参照）

**案件終了処理（matterEndProcess）:**

spec のトップレベルに `matterEndProcess` フィールドで案件終了処理のスクリプトパスを指定する。
指定すると、コンテンツ定義の `plugins` に案件終了処理プラグインが自動登録される。

```jsonc
{
  "workflowName": "leave_request",
  // ...
  "matterEndProcess": "leave/action/MatterEndProcess",  // 案件終了処理のスクリプトパス（拡張子なし）
  "matterEndProcessNoTransaction": false,  // true にするとトランザクションなし版を使用（省略時: false）
  "matterEndProcessImpl": "jssp"  // "java" を指定すると Java クラス実行（JavaEE 開発モデル）。省略時は "jssp"
}
```

| フィールド | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `matterEndProcess` | No | なし | JSSP 実装: スクリプトパス（拡張子なし） / Java 実装: 実装クラスの完全修飾名（FQCN）。省略時はプラグイン未登録 |
| `matterEndProcessNoTransaction` | No | `false` | `true` の場合、トランザクションなし版の拡張ポイントを使用 |
| `matterEndProcessImpl` | No | `"jssp"` | `"java"` を指定すると Java クラス実行（`pluginId` が `.pluginJavaExecutor` になる）。実装は `java-im-workflow-usage` スキルを使用 |

- トランザクションあり: `jp.co.intra_mart.workflow.plugin.event.matter.end.process`
- トランザクションなし: `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`

**その他のプラグイン系フィールド（到達処理・案件開始処理・案件退避処理・案件削除リスナー）:**

`actionProcess` / `matterEndProcess` と同じパターンで、到達処理（ノード単位の `arriveProcess`）・案件開始処理（`matterStartProcess`）・案件退避処理（`matterArchiveProcess`）・未完了/完了/過去案件削除リスナー（`activeMatterDeleteProcess` 等）も JSSP/Java 両実装で自動登録できる。フィールド一覧・spec.json 記法・未対応項目（分岐条件のユーザプログラム方式・処理対象者プラグインのカスタム実装）は [reference/lifecycle-plugin-fields.md](reference/lifecycle-plugin-fields.md) を参照。

**分岐ノード（branch_start）の追加フィールド:**

```jsonc
{
  "id": "brs1", "type": "branch_start", "name": "Start branch",
  "branchMethod": "rule",    // "rule" | "user_select" | "program"
  "paths": [
    { "condition": { "ruleId": "01", "property": "unitPrice", "operator": "<", "value": "20000" },
      "nodes": ["prs1"] },   // このパスの先頭ノード ID
    { "condition": { "ruleId": "02", ... },
      "nodes": ["dir"] }
  ]
}
```

**フロー機能設定（flowSettings）:**

spec の `flowSettings` オブジェクトで IM-Workflow のフロー定義の機能設定（一括処理・添付ファイル・自動処理・自動催促等）を制御する。省略時はデフォルト値が適用される。フィールド一覧・XML タグ対応表・管理画面で手動設定が必要な項目は [reference/flow-settings.md](reference/flow-settings.md) を参照。

### 3. build-workflow.js を実行

```bash
node .agents/skills/base-im-workflow-generator/scripts/build-workflow.js \
     /tmp/<workflowName>.spec.json
```

`--out` 省略時は `src/main/storage/public/im_workflow/im_workflow-<workflowName>-import.xml` に出力。

build-workflow.js が自動で行うこと:
- 3ロケール（en/ja/zh_CN）× 2バージョン（blank + active）の全展開
- 8ページタイプの多言語ページ名生成
- ノードID の組み立て（`<shortName>_<id>`）
- ノード間接続の解決（straight は自動、それ以外は edges から）
- プラグインの extensionPointId 自動判定（直前ノードの種類で approve / approve.static を切替）
- プラグイン二重登録（ノード内 + ルートレベル）
- 座標計算
- 分岐ノードの flowDetails / flowUnions / flowAttributes 生成
- UTF-16LE（BOM付き）変換

### 4. validate-workflow.js で検証

```bash
node .agents/skills/base-im-workflow-generator/scripts/validate-workflow.js \
     <出力された.xml>
```

検証項目:
- BOM 付き UTF-16LE エンコーディング
- XML 宣言 + `<data>` ルート
- contents / route / flow セクションの存在
- 3ロケール展開
- 2バージョン（blank + active）
- ルートノード接続整合（prev/next 参照先の存在）
- プラグイン二重登録
- フロー定義ノードに Start/End が含まれていないこと
- 分岐ルール参照整合
- ページタイプ 0-7 の存在
- nodeName が全ロケールで同一か

### 5. XSD 検証（任意）

`reference/validate-xsd.md` の手順で `reference/im_workflow-import.xsd` による構造検証を行う。

## 注意事項

- **生成時の注意事項・よくある誤りは `reference/import-xml-checklist.md` にチェックリスト化されている。** XML 生成後は必ず全項目を確認すること
- **出力先は `src/main/storage/public/im_workflow/` から変更してはならない。** このディレクトリは IM-Workflow インポート資材の固定の格納場所であり、`--out` で `spec/` 等の別の場所に出力した場合、テナント環境セットアップ（Importer / `jssp-tenant-setup-generator` の連携処理）から参照されず取り込まれない
- このスキルはワークフロー**定義ファイル**の生成専用。ワークフロー連携**プログラム**（アクション処理・申請画面・承認画面）は、JSSP 実装なら `jssp-im-workflow-usage`、Java（JavaEE 開発モデル）実装なら `java-im-workflow-usage` スキルを使うこと
- **`actionProcess` / `matterEndProcess` に Java クラスの FQCN を登録したい場合**は [reference/java-class-registration.md](reference/java-class-registration.md) を参照。現状 `build-workflow.js` は JSSP スクリプトパスの登録のみを自動生成する（Java クラス実行の `pluginId` は実機確認が必要なため未自動化）

## 他スキルとの境界・整合性責務

XML が参照する `scriptPath`（画面パス）と、`jssp-im-workflow-usage` が生成する実ファイル配置は**両スキルで整合させる必要がある**。責務範囲は以下のとおり:

| 責務 | 担当スキル |
|------|-----------|
| spec.json の `screens` で各 pageType の画面パスを決定 | **本スキル（generator）** |
| XML 内の `<scriptPath>` 出力 | **本スキル（generator）** |
| 上記パスに対応する `.js` / `.html` ファイルを実体として配置 | `jssp-im-workflow-usage` |
| パス整合の検証（XML 参照先 JS が存在するか） | `jssp-im-workflow-usage/scripts/validate-workflow-code.js` の `WF-XML-001` |

### pageType と usage の慣例ディレクトリの対応表

`spec.json` で `screens` を省略した場合のデフォルト挙動は、`jssp-im-workflow-usage` の慣例ディレクトリ名と、IM-Workflow の一般的な業務パターンに揃えてある。**新規プロジェクトでは原則 `screens` 省略で OK**。

| pageType | キー | デフォルト挙動 | 用途 |
|---|---|---|---|
| 0 | `apply` | `apply/index` を生成 | 申請画面（**必須**） |
| 1 | `tempSave` | **`apply` と共用**（同じ申請画面が一時保存も兼ねる） | 一時保存画面。専用画面が必要なときのみパスを明示。`false` 指定で省略可 |
| 2 | `applyTask` | **デフォルトで省略**（XML に出力されない） | 申請（起票案件）画面。月報や期首目標設定など定期申請パターン（ジョブで自動起票）でのみ使用。明示的にパスを指定した場合のみ XML に出力（`reapply` と同様、申請画面 `apply` と共用する場合は同じパスを指定） |
| 3 | `reapply` | **`apply` と共用**（同じパス）でデフォルト出力 | 再申請画面。差戻し運用がなくとも申請者の「引戻し」操作のため必要 |
| 4 | `process` | **`approve/index`** を生成 | **処理画面（承認/差戻し/否認の選択）（必須）** |
| 5 | `confirm` | `confirm/index` を生成 | 確認画面。`false` 指定で省略可 |
| 6 | `processDetail` | `process_detail/index` を生成 | 処理詳細画面（処理画面とは別実装が無難。表示内容や編集可否が異なる場合がある） |
| 7 | `referDetail` | **`processDetail` と共用**（同じパス）でデフォルト出力 | 参照詳細画面。仕様書で差分が大きい場合のみ別パス指定 |

**`pageType=4`（処理画面）の注意:** IM-Workflow 公式用語は `process` だが、本プロジェクトでは usage が「承認画面」（`approve/`）として実装する慣例のため、デフォルト suffix は `approve/index` に揃えている。

### `screens` フィールドと整合性検証

`spec.json` の `screens` は各 pageType の出力を細かく制御できる（文字列 = パス指定 / `false` = 除外 / 未記載 = デフォルト）。具体的な指定方法、画面省略・共用パターンの典型例（A: 最小構成、B: 標準構成、C: 起票運用、D: 詳細画面別実装）、`validate-workflow-code.js` を用いた整合性検証フロー（`WF-XML-001` 警告の対応）は [reference/screens-and-script-paths.md](reference/screens-and-script-paths.md) を参照。

## 棲み分け

| スキル | 用途 |
|--------|------|
| **base-im-workflow-generator**（本スキル） | WF 定義 XML（contents/route/flow）の生成。JSSP・Java どちらの実行方式にも対応（Java は [reference/java-class-registration.md](reference/java-class-registration.md) 参照） |
| jssp-im-workflow-usage | WF 連携プログラム（.js/.html、スクリプト開発モデル）の生成 |
| java-im-workflow-usage | WF 連携プログラム（.java、JavaEE 開発モデル）の生成。画面は対象外 |
| jssp-page-generator | 一般的な画面・ファンクションコンテナの生成 |
