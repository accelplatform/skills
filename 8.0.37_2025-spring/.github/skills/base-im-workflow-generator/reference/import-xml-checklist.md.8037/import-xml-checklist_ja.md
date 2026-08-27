# IM-Workflow インポート XML チェックリスト

`base-im-workflow-generator` スキルで XML を生成する際のセルフチェックリスト。

### 生成前チェック（pre）

XML を 1 行でも書き始める前に完了すること。

- [ ] `assets/sample-complete-branch.md` の XML 部分を **Read ツールで実際に読み込んだ**（エージェントの要約や推測で代替しない）
- [ ] contents / route / flow / matter_property / rule の各セクションの先頭 50 行以上を確認した
- [ ] 出力先が `src/main/storage/public/im_workflow/` であることを確認した
- [ ] 出力ファイルが **1 つの XML** `im_workflow-{name}-import.xml` であることを確認した（5 分割にしない）
- [ ] XML のルートが `<data>` で、直下が `<contents id="...">`, `<route id="...">` 等であることを確認した

### 出力形式チェック（output）

- [ ] contents / route / flow / matter_property / rule が **1 つの `<data>` 要素内** に格納されている
- [ ] `<contents id="..."><value type="array"><value type="object">` のサンプル準拠構造になっている（独自タグ不可）
- [ ] XML 宣言が `<?xml version="1.0" encoding="UTF-16"?>` になっている
- [ ] Write ツールで UTF-8 書き出し → `iconv -f UTF-8 -t UTF-16LE` で変換済み
- [ ] `reference/validate-xml-encoding.md` の検証スクリプトを実行済み（`OK` または `FIXED` を確認）
- [ ] `reference/validate-xsd.md` の手順で XSD 検証を実行済み（`OK: ... is valid against the schema` を確認）。エラーが出た場合はメッセージから XML 側を修正し、再検証してパスさせる

### XML 構造チェック（structure）

#### contents（コンテンツ定義）

- [ ] 各ロケールの中に `<details type="array">` でバージョン（blank `_0` + active `_1`）が格納されている
- [ ] バージョン ID が `{contentsId}_0`（blank）と `{contentsId}_1`（active）の形式
- [ ] ページ定義に `pagePathId`, `localeId`, `contentsId`, `contentsVersionId`, `pageName`, `pageType`, `defaultFlag`, `pathType`, `scriptPath`, `applicationId`, `serviceId`, `pagePath` が含まれている
- [ ] コンテンツプラグインに `contentsPluginId`, `localeId`, `contentsId`, `contentsVersionId`, `exPointId`, `pluginId`, `pluginName`, `parameter`, `nodeType`, `defaultFlag`, `executeOrder`, `note` が含まれている
- [ ] コンテンツルール紐付けに `contentsRuleId`, `contentsId`, `contentsVersionId`, `ruleData` が含まれている
- [ ] 8 種類のページタイプ（0〜7）が定義されている

#### route（ルート定義）

- [ ] active バージョンに `routeFilePath` が含まれている（形式: `im_workflow/data/default/master/route/{routeId}/{routeVersionId}/route.xml`）
- [ ] `routeXmlFile` 内に `routeId`, `routeVersionId`, `routeType` が含まれている
- [ ] 各ノードに `nodeId`, `nodeName`, `nodeType`, `nodeVariety`, `previousNodeIds`, `nextNodeIds`, `plugins`, `x`, `y`, `startNodeFlag`, `endNodeFlag`, `traceId`, `routeTemplateId`, `routeTemplateName`, `parentNode` が含まれている
- [ ] ノード内プラグインに `routePluginId`, `routeId`, `routeVersionId`, `nodeId`, `nodeType`, `extensionPointId`, `pluginId`, `parameter`, `targetType`, `targetCode` が含まれている
- [ ] ルートレベルの `<plugins type="array">` にもノード内と同一のプラグインが重複記載されている
- [ ] `routeXmlFile` 内に `<comments type="array" />`, `<swimlanes type="array" />` が含まれている
- [ ] `previousNodeIds` と `nextNodeIds` が双方向で整合している
- [ ] 座標（x, y）は各テンプレート（`assets/template-*.md`）の計算式に従っている
- [ ] 権限プラグインの拡張ポイントが直前ノードの種類に応じて正しい — 直前が人間ノード（申請・承認等）→ `approve.{サフィックス}`、直前がシステムノード（分岐開始・同期開始等）→ `approve.static.{サフィックス}`
- [ ] 権限プラグインは直接指定系（`.department`, `.post`, `.role` 等）、組み合わせ指定系（`.department_and_post` 等）、動的指定系（`.apply_user_department_and_post` 等）のいずれかを使用している
- [ ] 直接指定系・組み合わせ指定系は `targetType` / `targetCode` に値を設定している（`reference/authority-plugins.md` の targetType 一覧を参照）
- [ ] 動的指定系は `targetType` / `targetCode` が空タグで、`parameter` がサフィックス末尾に応じた形式になっている: `_department` のみ → 空タグ、`_and_post` → `|{会社コード}^{組織セットコード}^{役職コード}`、`_and_role` → `|{ロールID}`

#### flow（フロー定義）

- [ ] フローノードに `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `nodeType`, `localeId` が含まれている
- [ ] 承認ノード（human）に `lumpProcessFlag`, `attachFileFlag`, `autoProcessFlag`, `autoProcessLimitDay`, `autoProcessLimitType`, `autoPressFlag`, `autoPressLimitDay` が含まれている
- [ ] システムノード（Branch_Start/End 等）では上記フラグが `type="null"` になっている
- [ ] 全ノードに `<details type="array" />`, `<attributes type="array">`, `<unions type="array">`, `<routeNode type="null" />` が含まれている
- [ ] 分岐ノードの details に `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `cooperationType`, `cooperationClassify`, `cooperationId`, `emptyFlag` が含まれている
- [ ] 分岐ノードの unions に `branchUnionId`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `branchUnionGroupId`, `branchUnionGroupClassify`, `countTrue`, `countTargetNodeId` が含まれている
- [ ] `details[n].no` と `unions[n].branchUnionId` が対応している
- [ ] 分岐ノードの attributes で `attributeKey` が `"NoSetting"`、`value` が `"1"`（ルール自動判定）になっている
- [ ] `handleUsers` 配列に参照者設定が含まれている
- [ ] フローの nodes に人間ノード（Apply/Approve/Horizontal/Vertical）に加え、Branch_Start/Branch_End/Sync_Start/Sync_End も含まれている（Start/End ノードは含めない）
- [ ] 分岐が 3 択以上の場合、各分岐を単条件にしてネスト分岐で組み合わせている（詳細: `assets/template-branch.md`「複合条件（AND）の実現方法」）

#### matter_property（案件プロパティ）

- [ ] `<matter_property id="{key}">` で各プロパティが独立したセクションになっている
- [ ] 各プロパティに `matterPropertyKey`, `localeId`, `matterPropertyName`, `matterPropertyModelType`, `matterPropertyTypeListPattern`, `matterPropertyTypeMailTemplate`, `matterPropertyTypeImBoxTpl`, `matterPropertyTypeRule`, `alignType`, `searchRangeType`, `commaSeparatedFlag`, `calendarFlag`, `note`, `updateCount` が含まれている
- [ ] 分岐条件で使用するプロパティは `matterPropertyTypeRule` が `"1"` になっている

#### rule（分岐ルール）

- [ ] `<rule id="{ruleId}">` で各ルールが独立したセクションになっている
- [ ] 各ルールに `ruleId`, `localeId`, `ruleName`, `ruleUnionCondition`, `updateCount`, `ruleDetailModel` が含まれている
- [ ] ルール条件に `no`, `ruleId`, `compareRuleId`, `compareVariable`, `conditionValue`, `conditionValueType` を使用している
- [ ] `compareVariable` に案件プロパティの `matterPropertyKey` を指定している（`matterPropertyKey` タグ名ではない）
- [ ] `conditionValue` に比較値を指定している（`compareValue` タグ名ではない）
- [ ] ルール名の英語表記に `<` `>` を含む場合、`&lt;` `&gt;` にエスケープされている

### ロケール・バージョンチェック（locale）

- [ ] en / ja / zh_CN の 3 ロケール分が全セクションに存在する
- [ ] 各ロケールに blank period（`versionStatus="9"`）と active（`versionStatus="1"`）の 2 バージョンが存在する
- [ ] blank period の `limitDate` が active の `startDate` の前日になっている
- [ ] `nodeName` が全ロケールで同一の英語名になっている（多言語対応しない）
- [ ] ロケール間で ID・構造が同一で、名称（`contentsName`, `pageName`, `routeName`, `flowName`, `ruleName`, `matterPropertyName`）のみ異なる
- [ ] 同一要素のランダム ID（`contentsPluginId`, `pagePathId`, `no` 等）が全ロケールで同一値になっている

### よくある誤りチェック（pitfall）

過去の失敗事例に基づくチェック。生成後に必ず確認すること。

- [ ] `src/main/conf/import/` 等の誤ったディレクトリに出力していない → 正: `src/main/storage/public/im_workflow/`
- [ ] contents.xml, route.xml ... と複数ファイルに分割していない → 正: 単一の `im_workflow-{name}-import.xml`
- [ ] `<contents type="array"><content type="object">` 等の独自タグを使っていない → 正: `<contents id="..."><value type="array"><value type="object">`
- [ ] `versionId` を使用していない → 正: `contentsVersionId` / `routeVersionId` / `flowVersionId`
- [ ] ノードから `startNodeFlag`, `endNodeFlag` 等を省略していない → サンプルの全プロパティを出力
- [ ] プラグインから `targetType`, `targetCode` を省略していない → サンプル通りに含める
- [ ] フローノードから `flowId`, `flowVersionId` 等を省略していない → サンプル通りに含める
- [ ] ルールで `matterPropertyKey`, `compareValue` タグを使っていない → 正: `compareVariable`, `conditionValue`, `conditionValueType`
- [ ] 分岐 `attributeKey` に `"0"` を指定していない → 正: `"NoSetting"`
- [ ] 動的指定系の `parameter` がサフィックス末尾と一致している → `_and_post` は `|{役職}` 形式、`_and_role` は `|{ロールID}` 形式、`_department` のみは空タグ（詳細: `reference/authority-plugins.md`）
- [ ] 分岐開始・同期開始等のシステムノード直後の承認ノードで `approve.{サフィックス}` を使っていない → 正: `approve.static.{サフィックス}`（詳細: `reference/authority-plugins.md`「静的承認（B-1）と動的承認（B-2）の使い分け」）
- [ ] 役職名のみの指示（「課長」等）で `.post`（直接指定）を使っていない → 正: `.apply_user_department_and_post`（詳細: `reference/authority-plugins.md`「承認者指示のデフォルト解釈ルール」）
- [ ] サンプルを Read ツールで読まずに生成していない → **必ずサンプルを読んでから生成**
- [ ] 動的指定系プラグインの `parameter` で会社コード・組織セットコードが二重になっていない → 例: `|comp_sample_01^comp_sample_01^comp_sample_01^comp_sample_01^ps003` は誤り。正: `|comp_sample_01^comp_sample_01^ps003`。`validate-workflow.js` の `[param]` チェックで自動検出される。**spec.json で動的プラグインの `targetCode` には役職コード等のみを指定し、会社コード・組織セットコードは含めないこと**（`build-workflow.js` が自動付与する）
- [ ] コンテンツ定義の画面パス（`scriptPath` / `pagePath`）がファイルシステム上の配置先と整合している → 画面パスは `{機能名}/workflow/...` 形式であり、ファイルは `src/main/jssp/src/{機能名}/workflow/...` に配置される。
- [ ] `ruleId` / `contentsRuleId` / `cooperationId` が **20 文字以内** に収まっている → IM-Workflow の DB カラムは VARCHAR(20)。`rule_${shortName}_${rule.id}` の形で生成されるため、`shortName` と `rule.id` の合計が長い場合に超過する。`validate-workflow.js` の `[len]` チェックで自動検出される。
