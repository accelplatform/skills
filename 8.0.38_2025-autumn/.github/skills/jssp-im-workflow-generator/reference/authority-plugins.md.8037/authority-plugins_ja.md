# 権限プラグインリファレンス

## 概要

IM-Workflow の権限プラグインは、処理対象者（申請者・承認者・参照者等）を指定するための仕組みである。
pluginId は `{拡張ポイントID}.{サフィックス}` の形式で構成され、サフィックスで指定方法を切り替える。

## 拡張ポイント一覧

用途によって拡張ポイントIDが異なる。サフィックス部分は共通で使用できる。

| 用途 | 拡張ポイントID |
|------|--------------|
| 申請権限 | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| 承認権限（静的） | `jp.co.intra_mart.workflow.plugin.authority.node.approve.static` |
| 承認権限（動的） | `jp.co.intra_mart.workflow.plugin.authority.node.approve` |
| 動的承認・横配置・縦配置 | `jp.co.intra_mart.workflow.plugin.authority.node.dynamic` |
| 確認権限 | `jp.co.intra_mart.workflow.plugin.authority.node.confirm` |
| 参照者 | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |

### 静的承認（B-1）と動的承認（B-2）の使い分け

公式ドキュメント: https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/process_target/process_auth/detail_guide_38.html#id8

**直前のノードの種類**で、使用する拡張ポイントが決まる。

**B-1: `approve.static`（静的）** — 直前が以下のノードの場合:
- システムノード、同期開始/終了ノード、分岐開始/終了ノード
- 動的承認ノード、横配置ノード、縦配置ノード

**B-2: `approve`（動的）** — 上記以外（申請ノード、承認ノード等の人間ノード）の場合

| 拡張ポイント | パターン | 直前のノード |
|------------|---------|------------|
| `approve.static` | B-1 | Sync_Start/End, Branch_Start/End 等（システムノード） |
| `approve` | B-2 | 申請ノード、承認ノード等（人間ノード） |

## 承認者指示のデフォルト解釈ルール

ユーザーが承認者を曖昧に指示した場合、以下のルールでプラグインを選択する。

### 判断フローチャート

```
ユーザーの承認者指示
  │
  ├─ 個人名・ユーザコード → `.user`（直接指定）
  │
  ├─ 組織名のみ（「経理部」等） → `.department`（直接指定）
  │
  ├─ 役職名のみ（「課長」「部長」等）
  │    │
  │    └─ 組織の修飾がない → `.apply_user_department_and_post`（申請者の所属組織＋役職）
  │
  ├─ ロール名のみ（「WF管理者」「WFユーザ」等）
  │    │
  │    └─ 組織の修飾がない → `.role`（直接指定・組織で絞らない）
  │
  ├─ 組織＋役職（「営業部の課長」等） → `.department_and_post`（組み合わせ指定）
  │
  ├─ 組織＋ロール（「営業部のWF担当者」等） → `.department_and_role`（組み合わせ指定）
  │
  ├─ 「申請者の〜」で始まる修飾
  │    ├─ 「上位組織の部長」 → `.apply_user_one_step_upper_department_and_post`
  │    ├─ 「上位組織全ての部長」 → `.apply_user_all_step_upper_department_and_post`
  │    ├─ 「下位組織の課長」 → `.apply_user_one_step_lower_department_and_post`
  │    ├─ 「所属のWF担当者」 → `.apply_user_department_and_role`
  │    └─ 「上位組織のWF管理者」 → `.apply_user_one_step_upper_department_and_role`
  │
  ├─ 「前の承認者の〜」「前処理者の〜」で始まる修飾
  │    ├─ 「前処理者の課長」 → `.before_user_department_and_post`
  │    ├─ 「前処理者の上位組織の部長」 → `.before_user_one_step_upper_department_and_post`
  │    ├─ 「前処理者の上位組織全ての部長」 → `.before_user_all_step_upper_department_and_post`
  │    └─ 「前処理者のWF担当者」 → `.before_user_department_and_role`
  │
  └─ 「申請者本人」 → `.apply_user`
```

### デフォルト選択の根拠

**役職名のみの場合に `.post`（直接指定）ではなく `.apply_user_department_and_post`（動的指定）を使う理由:**

- `.post` は組織を絞らないため、**全組織の該当役職者**が承認対象になる
- 「課長に承認してもらう」という業務指示は、通常「自分（申請者）の所属組織の課長」を意味する
- `.apply_user_department_and_post` なら申請者の所属に応じて動的に承認者が決まり、汎用的に使える

**ロール名のみの場合は `.role`（直接指定）をそのまま使う理由:**

- ロールはシステム管理・機能権限（`im_workflow_manager` 等）を表し、特定組織に閉じない性質が強い
- 「WF管理者に承認してもらう」は「その権限を持つ誰か」であり、申請者の所属組織に限定する意図は薄い
- 組織で絞ると、申請者の所属にそのロールの人がいない場合に承認者不在になるリスクが高い
- 組織＋ロールで絞りたい場合は「営業部のWF担当者」のように組織を明示してもらう

### 拡張ポイントとの組み合わせ（重要）

上記フローチャートで決まるのは**サフィックス部分のみ**。
実際の pluginId は `{拡張ポイントID}.{サフィックス}` であり、拡張ポイントは**直前ノードの種類**で切り替わる（本ファイル冒頭の「静的承認（B-1）と動的承認（B-2）の使い分け」参照）。

| 直前ノード | 拡張ポイント | pluginId 例（サフィックス `.apply_user_department_and_post` の場合） |
|-----------|------------|------|
| 申請・承認等（人間ノード） | `approve`（動的） | `...node.approve.apply_user_department_and_post` |
| 分岐開始・同期開始等（システムノード） | `approve.static`（静的） | `...node.approve.static.apply_user_department_and_post` |

**サフィックスの選択（本セクション）と拡張ポイントの選択（B-1/B-2）は独立した判断であり、必ず両方を適用すること。**

### XML 出力例

```xml
<!-- 「課長」と指示 + 直前が申請ノード（人間ノード）→ approve（動的） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 「課長」と指示 + 直前が分岐開始ノード（システムノード）→ approve.static（静的） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 「営業部の課長」と指示 + 直前が申請ノード → approve（動的） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>
```

**注意:** 動的指定系（`apply_user_*`, `before_user_*`）は `targetType` / `targetCode` が空タグになる。
直接指定・組み合わせ指定とは構造が異なるため、混同しないこと。

## サフィックス一覧

### 直接指定系（parameter / targetCode にコード値を指定）

| サフィックス | targetType | parameter / targetCode の形式 | 説明 |
|------------|-----------|------|------|
| `.user` | `user` | `{ユーザコード}` | ユーザを直接指定 |
| `.department` | `department` | `{会社コード}^{組織セットコード}^{組織コード}` | 組織を指定 |
| `.post` | `post` | `{会社コード}^{組織セットコード}^{役職コード}` | 役職を指定 |
| `.role` | `role` | `{ロールID}` | ロールを指定 |
| `.public_group` | `publicGroup` | `{グループセットコード}^{グループコード}` | パブリックグループを指定 |
| `.public_group_role` | `publicGroupRole` | `{グループセットコード}^{役割コード}` | パブリックグループの役割を指定 |

**注意:** targetType は基本的にキャメルケース（`publicGroup`, `publicGroupRole`）。`user`, `department`, `post`, `role` は小文字のみのため見分けがつかないが、複合語は必ずキャメルケース。

### 組み合わせ指定系（実機エクスポートデータで検証済み）

parameter と targetCode は同一値。セパレータはパイプ `|`（キャレット `^` ではない）。

| サフィックス | targetType | parameter / targetCode の形式 | 説明 |
|------------|-----------|------|------|
| `.department_and_post` | `departmentAndPost` | `{会社コード}^{組織セットコード}^{組織コード}\|{会社コード}^{組織セットコード}^{役職コード}` | 組織＋役職 |
| `.department_and_role` | `departmentAndRole` | `{会社コード}^{組織セットコード}^{組織コード}\|{ロールID}` | 組織＋ロール |
| `.public_group_and_public_group_role` | `publicGroupAndPublicGroupRole` | `{グループセットコード}^{グループコード}\|{グループセットコード}^{役割コード}` | パブリックグループ＋役割 |
| `.public_group_and_role` | `publicGroupAndRole` | `{グループセットコード}^{グループコード}\|{ロールID}` | パブリックグループ＋ロール |

**注意:** targetType はキャメルケース（`departmentAndPost`, `publicGroupAndRole`）。

```xml
<!-- 例: 組織＋役職 -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>

<!-- 例: パブリックグループ＋ロール -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.public_group_and_role</pluginId>
<parameter type="string">sample_public^public_group_a|im_workflow_user</parameter>
<targetType type="string">publicGroupAndRole</targetType>
<targetCode type="string">sample_public^public_group_a|im_workflow_user</targetCode>
```

### 動的指定系（実機エクスポートデータで検証済み・全37パターン）

申請者または前処理者の所属組織等に基づいて承認者を動的に決定する。
`targetType` / `targetCode` は空タグにする。

**parameter の規則（サフィックス末尾で決まる）:**

| サフィックス末尾 | parameter | 形式 |
|---------------|-----------|------|
| `_department` のみ | 空タグ | `<parameter type="string" />` |
| `_and_post` | `\|{会社コード}^{組織セットコード}^{役職コード}` | 先頭パイプ `\|` + 役職コード |
| `_and_role` | `\|{ロールID}` | 先頭パイプ `\|` + ロールID |
| `apply_user`（本人） | 空タグ | `<parameter type="string" />` |

**XML 例:**

```xml
<!-- 組織のみ: parameter は空タグ -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department</pluginId>
<parameter type="string" />
<targetType type="string" />
<targetCode type="string" />

<!-- 組織＋役職: parameter は |{会社コード}^{組織セットコード}^{役職コード} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 組織＋ロール: parameter は |{ロールID} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_role</pluginId>
<parameter type="string">|im_workflow_user</parameter>
<targetType type="string" />
<targetCode type="string" />
```

#### 申請者系（apply_user_*）

| サフィックス | 説明 | parameter 例 |
|------------|------|-------------|
| `.apply_user` | 申請者本人 | 空タグ |
| `.apply_user_department` | 申請者の所属組織 | 空タグ |
| `.apply_user_department_and_post` | 申請者の所属組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_department_and_role` | 申請者の所属組織＋ロール | `\|im_workflow_user` |
| `.apply_user_one_step_upper_department` | 申請者の上位組織 | 空タグ |
| `.apply_user_one_step_upper_department_and_post` | 申請者の上位組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_upper_department_and_role` | 申請者の上位組織＋ロール | `\|im_workflow_user` |
| `.apply_user_all_step_upper_department` | 申請者の上位組織全て | 空タグ |
| `.apply_user_all_step_upper_department_and_post` | 申請者の上位組織全て＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_upper_department_and_role` | 申請者の上位組織全て＋ロール | `\|im_workflow_user` |
| `.apply_user_one_step_lower_department` | 申請者の下位組織 | 空タグ |
| `.apply_user_one_step_lower_department_and_post` | 申請者の下位組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_lower_department_and_role` | 申請者の下位組織＋ロール | `\|im_workflow_user` |
| `.apply_user_all_step_lower_department` | 申請者の下位組織全て | 空タグ |
| `.apply_user_all_step_lower_department_and_post` | 申請者の下位組織全て＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_lower_department_and_role` | 申請者の下位組織全て＋ロール | `\|im_workflow_user` |

#### 前処理者系（before_user_*）

| サフィックス | 説明 | parameter 例 |
|------------|------|-------------|
| `.before_user_department` | 前処理者の所属組織 | 空タグ |
| `.before_user_department_and_post` | 前処理者の所属組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_department_and_role` | 前処理者の所属組織＋ロール | `\|im_workflow_user` |
| `.before_user_one_step_upper_department` | 前処理者の上位組織 | 空タグ |
| `.before_user_one_step_upper_department_and_post` | 前処理者の上位組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_upper_department_and_role` | 前処理者の上位組織＋ロール | `\|im_workflow_user` |
| `.before_user_all_step_upper_department` | 前処理者の上位組織全て | 空タグ |
| `.before_user_all_step_upper_department_and_post` | 前処理者の上位組織全て＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_upper_department_and_role` | 前処理者の上位組織全て＋ロール | `\|im_workflow_user` |
| `.before_user_one_step_lower_department` | 前処理者の下位組織 | 空タグ |
| `.before_user_one_step_lower_department_and_post` | 前処理者の下位組織＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_lower_department_and_role` | 前処理者の下位組織＋ロール | `\|im_workflow_user` |
| `.before_user_all_step_lower_department` | 前処理者の下位組織全て | 空タグ |
| `.before_user_all_step_lower_department_and_post` | 前処理者の下位組織全て＋役職 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_lower_department_and_role` | 前処理者の下位組織全て＋ロール | `\|im_workflow_user` |

### 階層指定系（組織を起点に上位/下位を展開）

階層指定系は動的指定系と異なり、`targetType` / `targetCode` に値を設定する。
`parameter` と `targetCode` は同一値。

| サフィックス末尾 | targetType | parameter / targetCode の形式 |
|---------------|-----------|------|
| `_department` のみ | `department` | `{会社コード}^{組織セットコード}^{組織コード}` |
| `_and_post` | `departmentAndPost` | `{会社コード}^{組織セットコード}^{組織コード}\|{会社コード}^{組織セットコード}^{役職コード}` |
| `_and_role` | `departmentAndRole` | `{会社コード}^{組織セットコード}^{組織コード}\|{ロールID}` |

**注意:** 階層指定系のセパレータはパイプ `|`（先頭ではなく組織と役職/ロールの間）。

| サフィックス | 説明 | parameter 例 | targetType |
|------------|------|-------------|-----------|
| `.department_all_step_upper_department` | 組織＋上位全て | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_upper_department_and_post` | 組織＋上位全て＋役職 | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_upper_department_and_role` | 組織＋上位全て＋ロール | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |
| `.department_all_step_lower_department` | 組織＋下位全て | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_lower_department_and_post` | 組織＋下位全て＋役職 | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_lower_department_and_role` | 組織＋下位全て＋ロール | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |

## サンプルデータ

> ⚠️ **以下の値はすべて intra-mart 標準サンプルテナント `comp_sample_01` のデータ**です。
> 実プロジェクトでは異なるコード体系（独自の組織コード・役職コード・ロール命名等）が使われるため、これらを実コードとして転記してはなりません。
> spec.json を作成する際は、必ず以下のいずれかで実コードを取得してください:
>
> 1. **プロジェクト仕様書・設計書**（最優先）
> 2. **MCP `mcp__im_workflow__resolve_authority`** の解決結果から取得（自然言語の承認者記述を渡す）
> 3. 取得困難な場合 → サンプル値を仮置きし、**ユーザに「実コード確認要」と必ず明示**する
>
> 以下の表は **構造（セパレータ・コード桁数・形式）の理解と学習教材** としての参照用途に限ります。

### ユーザ

| ユーザコード | 氏名 |
|------------|------|
| `ueda` | 上田辰男 |
| `aoyagi` | 青柳辰巳 |
| `hayashi` | 林政義 |
| `maruyama` | 円山益男 |
| `sekine` | 関根千香 |
| `terada` | 寺田雅彦 |
| `yoshikawa` | 吉川一哉 |
| `ohiso` | 大磯博文 |
| `hagimoto` | 萩本順子 |
| `ikuta` | 生田一哉 |
| `katayama` | 片山聡 |
| `harada` | 原田浩二 |

### 組織

| parameter / targetCode | 説明 |
|----------------------|------|
| `comp_sample_01^comp_sample_01^comp_sample_01` | サンプル会社（トップ） |
| `comp_sample_01^comp_sample_01^dept_sample_10` | サンプル部門１０ |
| `comp_sample_01^comp_sample_01^dept_sample_11` | サンプル部門１１ |
| `comp_sample_01^comp_sample_01^dept_sample_12` | サンプル部門１２ |
| `comp_sample_01^comp_sample_01^dept_sample_20` | サンプル部門２０ |
| `comp_sample_01^comp_sample_01^dept_sample_21` | サンプル部門２１ |
| `comp_sample_01^comp_sample_01^dept_sample_22` | サンプル部門２２ |
| `comp_other_01^comp_other_01^comp_other_01` | その他会社（トップ） |
| `comp_other_01^comp_other_01^dept_other_10` | その他部門１０ |
| `comp_other_01^comp_other_01^dept_other_11` | その他部門１１ |

### 役職

| parameter / targetCode | 説明 |
|----------------------|------|
| `comp_sample_01^comp_sample_01^ps001` | 社長 |
| `comp_sample_01^comp_sample_01^ps002` | 部長 |
| `comp_sample_01^comp_sample_01^ps003` | 課長 |

### ロール

| ロールID | 説明 |
|---------|------|
| `accel_studio_manager` | Accel Studio 管理者 |
| `account_manager` | アカウント管理者 |
| `authz_manager` | 認可管理者 |
| `bis_auditor` | BIS 監査者 |
| `bis_business_manager` | BIS 業務管理者 |
| `bis_manager` | BIS 管理者 |
| `bis_user` | BIS 担当者 |
| `bis_ws_imw_user` | IM-Workflow (IM-BIS) WEB サービス ユーザ |
| `calendar_manager` | カレンダー管理者 |
| `file_exc_manager` | FileExchange 管理者 |
| `forma_app_creator` | Forma アプリ作成者 |
| `forma_app_manager` | Forma アプリ作成管理者 |
| `forma_ws_imw_user` | IM-Workflow (Forma) WEB サービス ユーザ |
| `im_knowledge_manager` | Knowledge グループ管理者 |
| `im_knowledge_user` | Knowledge コンテンツ利用者 |
| `im_master_manager` | IM-共通マスタ 管理者（マスタデータ管理者） |
| `im_master_operator` | IM-共通マスタ 運用管理者 |
| `im_workflow_auditor` | IM-Workflow 監査者 |
| `im_workflow_manager` | IM-Workflow 管理者（マスタデータ管理者） |
| `im_workflow_operator` | IM-Workflow 運用管理者 |
| `im_workflow_user` | IM-Workflow ユーザ |
| `imbm_manager` | IM-BloomMaker 管理者 |
| `imld_manager` | LogicDesigner 管理者 |
| `imprtl_manager` | ポータル（ローコード版） ポータル管理者 |
| `imprtl_prlt_manager` | ポータル（ローコード版） ポートレット管理者 |
| `imr_log_manager` | IM-Repository ログ管理者 |
| `imr_manager` | IM-Repository 管理者 |
| `job_sche_manager` | ジョブスケジューラ管理者 |
| `menu_manager` | メニュー管理者 |
| `menu_operator` | メニュー運用管理者 |
| `portal_manager` | ポータル管理者 |
| `role_manager` | ロール管理者 |
| `tablemainte_manager` | TableMaintenance 管理者 |
| `tenant_manager` | テナント管理者 |
| `ticket_manager` | チケット管理者 |
| `viewcreator_manager` | ViewCreator 管理者 |

### パブリックグループ

| parameter / targetCode | 説明 |
|----------------------|------|
| `sample_public^sample_public` | サンプルパブリックグループ（トップ） |
| `sample_public^public_group_a` | パブリックグループＡ |
| `sample_public^public_group_b` | パブリックグループＢ |
| `sample_public^public_group_c` | パブリックグループＣ |
| `sample_public^public_group_d` | パブリックグループＤ |
| `sample_public^public_team_a` | チームＡ |
| `sample_public^public_team_b` | チームＢ |

### 役割

サンプルデータなし。

---

## ロジックフロー指定系（IM-LogicDesigner 連携）（実機エクスポートデータで検証済み）

IM-LogicDesigner のロジックフローを実行して処理対象者を動的に決定する方式。
フロー内で DB 参照や外部 API 呼び出しなど複雑なロジックを実装できる。

### サフィックス

| サフィックス | targetType | parameter / targetCode の形式 | 説明 |
|------------|-----------|------|------|
| `.logic_flow_user` | `logic_flow_user` | `{"flowId" : "<フローID>", "version" : null, "versionDecide" : false}` | IM-LogicDesigner フローで処理対象者を決定 |

- `parameter` と `targetCode` は**常に同一の JSON 文字列**
- `version` : `null` = 最新版を使用。整数を指定すると固定バージョンを使用
- `versionDecide` : `false` = バージョンを自動決定（最新）。`true` = `version` フィールドの値で固定

### 使用可能な拡張ポイント（実機確認済み）

| 拡張ポイント | pluginId |
|------------|---------|
| `node.approve`（承認権限・動的） | `...node.approve.logic_flow_user` |
| `node.confirm`（確認権限） | `...node.confirm.logic_flow_user` |
| `administrator.flow.handle`（参照者） | `...administrator.flow.handle.logic_flow_user` |

> ⚠️ `node.apply`（申請権限）および `node.approve.static`（承認権限・静的）での `.logic_flow_user` は実機データ未確認。

### XML 例

```xml
<!-- 承認権限（動的）: 直前が申請ノード等の人間ノード -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>

<!-- 確認権限 -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.confirm</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.confirm.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>

<!-- 参照者 -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>
```

### フロー定義の作成

処理対象者として使用するフローは、以下の入出力仕様を満たす必要がある。
フロー定義の作成手順・spec.json テンプレートは `jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md` を参照。

**入力（Input）— すべて任意**

| プロパティ名 | 型 | 説明 |
|------------|---|------|
| `imwMatterInfo` | object | 案件情報 |
| `imwMatterInfo.applyBaseDate` | string | 申請基準日 |
| `imwMatterInfo.contentsId` | string | コンテンツID |
| `imwMatterInfo.contentsVersionId` | string | コンテンツバージョンID |
| `imwMatterInfo.flowId` | string | フローID |
| `imwMatterInfo.flowVersionId` | string | フローバージョンID |
| `imwMatterInfo.nodeId` | string | ノードID |
| `imwMatterInfo.routeId` | string | ルートID |
| `imwMatterInfo.routeVersionId` | string | ルートバージョンID |
| `imwMatterInfo.systemMatterId` | string | システム案件ID |
| `imwMatterInfo.userDataId` | string | ユーザデータID |
| `imwApplyAuthInfo` | object | 申請処理権限情報 |
| `imwApplyAuthInfo.userCd` | string | 申請者ユーザコード |
| `imwApplyAuthInfo.companyCd` | string | 申請者会社コード |
| `imwApplyAuthInfo.departmentSetCd` | string | 申請者組織セットコード |
| `imwApplyAuthInfo.departmentCd` | string | 申請者組織コード |
| `imwBeforeNodeAuthInfo` | object | 前ノード処理権限情報 |
| `imwBeforeNodeAuthInfo.userCd` | string | 前処理者ユーザコード |
| `imwBeforeNodeAuthInfo.companyCd` | string | 前処理者会社コード |
| `imwBeforeNodeAuthInfo.departmentSetCd` | string | 前処理者組織セットコード |
| `imwBeforeNodeAuthInfo.departmentCd` | string | 前処理者組織コード |
| `imwBeforeNodeAuthInfo.nodeId` | string | 前ノードID |

**出力（Output）— 必須**

| プロパティ名 | 型 | 説明 |
|------------|---|------|
| `userCds` | string[] (array) | 処理対象者のユーザコード配列。`null` を返すと権限者なし（展開しない） |

> 出典: [IM-Workflow 管理者操作ガイド - ロジックフローを使った処理対象者プラグインの実装](https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_administrator_guide/texts/basic_guide/logic_flow/authority_plugin.html)
