# パラメータクラス フィールド一覧（JavaEE 開発モデル）

intra-mart Accel Platform（IM-Workflow）のプラットフォーム API 実クラス定義（`im_workflow_core`）に基づく。**記憶や推測でフィールド／メソッドを追加しないこと。** ここに記載のないフィールドが必要な場合は、dev-knowledge（ソースコード検索 MCP）で該当クラスを確認してから使用する。

各フィールドは `getXxx()` / `setXxx()` の Getter/Setter でアクセスする（フィールドは `private`）。

---

## `ActionProcessParameter`

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.process.action`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| actFlag | String | 代理フラグ（0:本人処理 / 1:代理処理） |
| applyBaseDate | String | 申請基準日（`yyyy/MM/dd`） |
| authCompanyCode | String | 権限会社コード |
| authOrgzCode | String | 権限組織コード |
| authOrgzSetCode | String | 権限組織セットコード |
| authUserCd | String | 処理権限者コード |
| contentsId | String | コンテンツID |
| contentsVersionId | String | コンテンツバージョンID |
| execUserCd | String | 処理実行者コード |
| flowId | String | フローID |
| flowVersionId | String | フローバージョンID |
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID（テナントIDと同値） |
| matterName | String | 案件名 |
| matterNumber | String | 案件番号 |
| nodeId | String | ノードID |
| nextNodeIds | String[] | 移動先(次ノード)ノードID（差戻し・引戻し・案件操作時に設定） |
| parameter | String | パラメータ（登録された実装クラスの FQCN が入る。ビジネスロジックからは通常参照しない） |
| priorityLevel | String | 優先度 |
| processComment | String | 処理コメント |
| processDate | String | 処理日（`yyyy/MM/dd`） |
| resultStatus | String | 処理結果ステータス |
| routeId | String | ルートID |
| routeVersionId | String | ルートバージョンID |
| systemMatterId | String | システム案件ID |
| targetLocales | String[] | ターゲットロケールID |
| userDataId | String | ユーザデータID |
| lumpProcessFlag | String | 一括承認フラグ（0:一般承認 / 1:一括承認） |
| autoProcessFlag | String | 自動処理フラグ（0:一般処理 / 1:自動処理） |
| DCNodeConfigModels | DynamicAndCnfmNodeConfigModel[] | 動的・確認ノード設定情報 |
| HVNodeConfigModels | HorizontalAndVerticalNodeConfigModel[] | 横配置・縦配置ノード設定情報 |
| branchSelectModels | BranchSelectModel[] | 分岐先選択情報 |

## `ArriveProcessParameter`

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.process.arrive`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| actFlag | String | 代理フラグ |
| applyBaseDate | String | 申請基準日 |
| contentsId / contentsVersionId | String | コンテンツID／バージョンID |
| flowId / flowVersionId | String | フローID／バージョンID |
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID |
| matterName | String | 案件名 |
| matterNumber | String | 案件番号 |
| nodeId | String | 到達先ノードID |
| parameter | String | パラメータ |
| preNodeAuthCompanyCode | String | 前ノード処理権限会社コード |
| preNodeAuthOrgzCode | String | 前ノード処理権限組織コード |
| preNodeAuthOrgzSetCode | String | 前ノード処理権限組織セットコード |
| preNodeAuthUserCd | String | 前ノード処理権限者コード |
| preNodeExecUserCd | String | 前ノード処理実行者コード |
| preNodeId | String | 前ノードID |
| preNodeProcessComment | String | 前ノード処理コメント |

（他にも到達直前の状態に関するフィールドが存在する可能性がある。上記以外が必要な場合は dev-knowledge で `ArriveProcessParameter` を確認すること）

## `MatterStartProcessParameter`

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| applyBaseDate | String | 申請基準日 |
| contentsId / contentsVersionId | String | コンテンツID／バージョンID |
| flowId / flowVersionId | String | フローID／バージョンID |
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID |
| parameter | String | パラメータ |
| processDate | String | 処理日 |
| routeId | String | ルートID |
| routeVersionId | String | （フィールド一覧続きは dev-knowledge で `MatterStartProcessParameter` を確認。上記は先頭部分のみ抜粋） |
| systemMatterId | String | システム案件ID |
| targetLocales | String[] | ターゲットロケールID |
| userDataId | String | ユーザデータID |

## `MatterEndProcessParameter`

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| actFlag | String | 代理フラグ |
| applyBaseDate | String | 申請基準日 |
| contentsId / contentsVersionId | String | コンテンツID／バージョンID |
| flowId / flowVersionId | String | フローID／バージョンID |
| lastAuthUserCd | String | 最終処理権限者コード |
| lastExecUserCd | String | 最終処理実行者コード |
| lastProcessNodeId | String | 最終処理ノードID |
| lastResultStatus | String | 最終処理結果ステータス |
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID |
| parameter | String | パラメータ |
| processDate | String | 処理日 |
| mailIds | String[] | メールテンプレートIDの配列 |
| imBoxIds | String[] | IMBoxテンプレートIDの配列 |
| mailReplaceMap | Map\<MailReplaceId, String\> | メール置換文字列情報 |
| imBoxReplaceMap | Map\<ImBoxReplaceId, String\> | IMBox置換文字列情報 |

（メッセージ関連フィールド（`messageIds` 等）が続く可能性がある。詳細が必要な場合は dev-knowledge で `MatterEndProcessParameter` を確認すること）

## `RuleConditionParameter`

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.rule.condition`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| applyBaseDate | String | 申請基準日 |
| contentsId / contentsVersionId | String | コンテンツID／バージョンID |
| flowId / flowVersionId | String | フローID／バージョンID |
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID |
| nodeId | String | 分岐/結合ノードID |
| parameter | String | パラメータ |
| processDate | String | 到達日 |
| routeId / routeVersionId | String | ルートID／バージョンID |
| systemMatterId | String | システム案件ID |
| targetLocales | String[] | ターゲットロケールID |
| userDataId | String | ユーザデータID |

## `WorkflowAuthorityParameter`（処理対象者プラグイン用）

パッケージ: `jp.co.intra_mart.foundation.workflow.listener.param`（`WorkflowParameter` を継承）

継承元 `WorkflowParameter` のフィールド:

| フィールド | 型 | 説明 |
|-----------|-----|------|
| localeId | String | ロケールID |
| loginGroupId | String | ログイングループID |
| applyBaseDate | String | 申請基準日 |
| parameter | String | パラメータ |
| targetLocales | String[] | ターゲットロケールID |

`WorkflowAuthorityParameter` 固有のフィールド:

| フィールド | 型 | 説明 |
|-----------|-----|------|
| targetCodes | String[] | 対象コードのリスト（引戻し・差戻し・案件操作によるノード移動時に、当該ノードへ最後に処理したユーザコードが設定される。`null` の場合あり） |

## `WorkflowMatterParameter`（処理対象者プラグイン用・案件情報）

パッケージ: `jp.co.intra_mart.foundation.workflow.listener.param`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| contentsId / contentsVersionId | String | コンテンツID／バージョンID |
| routeId / routeVersionId | String | ルートID／バージョンID |
| flowId / flowVersionId | String | フローID／バージョンID |
| nodeId | String | ノードID |

## `UserDataModel`（処理対象者プラグインの戻り値要素）

パッケージ: `jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| localeId | String | 処理対象者のロケールID |
| userCode | String | 処理対象者のユーザコード |
| userName | String | 処理対象者のユーザ名 |
| userOrgzModels | OrgzDataModel[] | 処理対象者の所属組織情報（担当組織の選択肢になる） |

`OrgzDataModel` は会社名・組織名・会社コード・組織セットコード・組織コードを保持する（JSSP 版 `userOrgzModels` と同じ構造）。詳細フィールドが必要な場合は dev-knowledge で `OrgzDataModel` を確認すること。

---

## 案件削除リスナー・案件退避リスナーの引数

`Parameter` オブジェクトを使わず、個別の `String` 引数で渡される（[assets/matter-delete-listener.md](../assets/matter-delete-listener.md) / [assets/matter-archive-listener.md](../assets/matter-archive-listener.md) 参照）。

**未完了案件削除・完了案件削除・案件退避処理の共通引数（4引数）:**

| 引数名 | 型 | 説明 |
|--------|-----|------|
| loginGroupId | String | ログイングループID |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |

**過去案件削除（`IWorkflowArcMatterDeleteListener`）のみ引数が異なる（5引数）:**

| 引数名 | 型 | 説明 |
|--------|-----|------|
| loginGroupId | String | ログイングループID |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| archiveMonth | String | アーカイブ年月（`yyyyMM` 形式）。過去案件は年月単位でテーブルが分かれるため、削除対象特定に必要 |

**注意:** 過去案件削除だけ他の2種（未完了・完了）と異なり `archiveMonth` が末尾に追加される。4引数のまま実装すると `@Override` を付けていても抽象メソッド未実装のコンパイルエラーになる。詳細は [assets/matter-delete-listener.md](../assets/matter-delete-listener.md) を参照。
