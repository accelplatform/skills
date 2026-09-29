# セットアップ資材 生成後セルフチェックリスト

build-setup-import.js を実行した後、以下を確認すること。

## ファイル構成

- [ ] `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml` が出力されている（ディレクトリ名・ファイル名ともに同じ `<artifactId>`。`<artifactId>` の解決優先順位: spec.json の `"artifactId"` → pom.xml の `<artifactId>` → module.xml の `<id>` のドット区切り末尾 → `<key>` フォールバック）
- [ ] `src/main/storage/system/products/import/basic/<key>/<version>/` 配下に各 XML / SQL が出力されている
- [ ] 拡張インポートを指定した場合、`src/main/jssp/src/<key>/initialize/<version>/<key>_import.js` が生成されている
- [ ] `workflowImport.files` を指定した場合、`storage/system/products/import/basic/<key>/<version>/<file>.xml` に元 XML がコピーされている
- [ ] `workflowImport.files` を指定した場合、`src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` が生成されている
- [ ] `logicImport.files` を指定した場合、`storage/system/products/import/basic/<key>/<version>/<file>.zip` に元 ZIP がコピーされている
- [ ] `logicImport.files` を指定した場合、`src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` が生成されている
- [ ] `<version>`（資材バージョン、例: `1.0.0`）が `spec.version` で指定した値になっている（省略時は `1.0.0`）
- [ ] `<N>`（config 番号、例: `2`）が `spec.configNumber` で指定した値になっている（省略時は `1`）
- [ ] `<N> >= 2` の場合、各ファイル名のベース部末尾に `-<N>` サフィックスが付与されている（例: `<key>-authz-policy-2.xml`、`<key>-role-2_ja.xml`、`<key>-ddl-2_postgre.sql`、`<key>_import-2.js`）。ロケール／DB 方言サフィックスの **直前** に挿入されること
- [ ] 全 XML ファイルが UTF-8（BOM なし）でエンコードされている

## 多言語ファイル

- [ ] role / authz-resource / authz-resource-group / authz-subject-group / menu-group / job-scheduler の各々で **基底 + 3 ロケール（ja / en / zh_CN）の 4 ファイル** が揃っている
- [ ] 言語別ファイルの ID / URI / sort-key + expression が基底とマッチしている（タイポ・大文字小文字を確認）
- [ ] 表示名に空文字や `null` が紛れていない

## 参照整合性

- [ ] `import-<artifactId>-config-1.xml` 内のすべての `<*-file>` 参照先ファイルが実在する（バージョンディレクトリ `<version>/` のパスが含まれていること）
- [ ] `<extends-import-class>` で参照する JS が実在する（拡張子 `.js` 含む、バージョンディレクトリ含む）
- [ ] `authz-policy.xml` の `resource` 属性が `authz-resource.xml` 側で定義されている（ハッシュ値の場合を除く）
- [ ] `authz-policy.xml` の `subject` 式で参照されるロール ID が `<key>-role.xml` に存在する
- [ ] `authz-resource.xml` の `<parent-group>` が `authz-resource-group.xml` か intra-mart 標準のグループにある
- [ ] `authz-subject-group.xml` の `<expression>` 式が `<key>-role.xml` のロール ID を参照している
- [ ] ルーティング（`routing-jssp-config` の `file-mapping`）や OAuth（`oauth-client-resources-config` の `client-resource`）で `<authz uri="service://..." action="execute" />` を指定した URI が、`authz-resource.xml` の `uri` に登録されている（`welcome-all` は使用しない前提のため、画面・API ごとに必ず対応する認可リソースが必要）
- [ ] テナント管理者（`tenant_manager`）は全 service リソース・全メニューグループに `build-setup-import.js` が PERMIT を自動付与する（`authzPolicies` への明示記述は不要）。**それ以外の対象ロール／ユーザ**が設計書・プロンプトの指示どおり `authzPolicies` に記述されている

## ジョブスケジューラ

- [ ] `<job-detail>` の `<category-id>` が `<job-category>` の ID と一致
- [ ] `<jobnet>` の `<category-id>` が `<jobnet-category>` の ID と一致
- [ ] `<serialize>` 内の `<job-id>` が `<job-detail>` の ID と一致
- [ ] `<job-path>` で指定した Java クラス / JSSP が実在する（インポート時にロード可能であること）

## メニューグループ

- [ ] `authz-policy.xml` で `type="im-menu-group"` の `resource` 属性に正しいハッシュ値が指定されている（`REPLACE_WITH_MENU_GROUP_HASH` プレースホルダが残っていない）
  - build スクリプトが `spec.menuGroups[].id` から `SHA-256("im-menu-group://menugroups/<id>")` を自動計算する
  - 生成された XML に対して `grep "REPLACE_WITH" authz-policy.xml` で残存を確認
- [ ] メニュー項目を追加する場合、`<menu-group>` 内に `<menu-items>` を手作業で追記している

## DDL / DML

- [ ] CREATE TABLE のスケルトンに実テーブル定義を追記している（コメントのままでは動かない）
- [ ] DDL の冪等性に注意（同テナントへの二重実行に対する考慮）
- [ ] 業務データを DML に含めていない（マスタ系のみ）

## 拡張インポート JS

- [ ] `doImport(tenantId)` 内に try/catch でラップした初期化処理が記述されている
- [ ] Logger による開始 / 完了 / 例外のログ出力がある
- [ ] var しか使っていない（let / const / アロー関数禁止）
- [ ] Tenant Database アクセスがあれば、エラー時に Importer 全体を失敗させるよう例外を再 throw している

## IM-Workflow インポート（`workflowImport` を指定した場合）

- [ ] 元の WF XML が **UTF-16** でエンコードされている（`<?xml version="1.0" encoding="UTF-16"?>`）
- [ ] WF XML の `<data>` 直下のセクション（`<contents>` / `<route>` / `<flow>` / `<matter_property>` / `<rule>`）が **2 スペースインデント** で記述されている（`extractTopLevelSections` の前提）。`<rule>` 等、同名タグが複数並ぶ場合も `extractTopLevelSections` が全ブロックを配列で取得するため個別の対応は不要
- [ ] `import-<artifactId>-config-<N>.xml` の `<extends-import>` に `<key>_workflow_import.js` を指す `<extends-import-class>` 行が含まれている（`extendsImport` 併用時は 2 行並列）
- [ ] 対象環境が **8.0.37 (2025 Spring) 以降** である（`DataImportExecutor` / `SystemStorage` / `TenantInfoManager` の要件）
- [ ] テナント環境セットアップ実行後、`<key>.workflow_import` ロガーに「workflow import completed.」が出ている
- [ ] 実行後に `storage/public/tmp/<key>_*_*.xml` 等の一時ファイルが残っていない（`finally` で削除される設計だが、Importer 異常終了時に残る可能性がある）
- [ ] 詳細は [workflow-import.md](workflow-import.md) のチェックポイントを参照

## IM-LogicDesigner インポート（`logicImport` を指定した場合）

- [ ] 元の ZIP が **IM-LogicDesigner のエクスポート形式** である（管理画面からエクスポートしたものと同じ形式）
- [ ] `import-<artifactId>-config-<N>.xml` の `<extends-import>` に `<key>_logic_import.js` を指す `<extends-import-class>` 行が含まれている（他の拡張インポートと並列）
- [ ] 対象環境が **8.0.37 (2025 Spring) 以降** である（`SystemStorage.getCanonicalPath()` の要件。`LogicFlowImporter` 自体は 8.0.0 以降）
- [ ] テナント環境セットアップ実行後、`<key>.logic_import` ロガーに「logic import completed.」が出ている
- [ ] 拡張インポート JS が **Java 直接アクセス（`Packages.***`）を使用** することを把握している（IM-LogicDesigner には汎用 SSJS API が存在しないため例外的に容認）
- [ ] ルーティング定義（`flow_route.json`）が含まれる場合、対応する認可ポリシーを **別 configNumber** に分離している（同じ config 内に `authzPolicies` で書くとリソース未登録のままポリシーが投入されサイレントに無視される）
- [ ] ルーティング向けポリシーの `type` は `im-logic-rest`（`service` ではない）、`resource` は `authzUri` 文字列の SHA-256（16 進 lowercase）になっている
- [ ] 詳細は [logic-import.md](logic-import.md) を参照

## IM-Workflow ロジックフロープラグイン登録（`extendsImport` + WF/LD 連携を組み合わせた場合）

- [ ] `import-<artifactId>-config-<N>.xml` の `<extends-import>` 内の `<extends-import-class>` が **以下の順序** で並んでいる（ビルドスクリプトは逆順で生成するため、**生成後に手動で並べ替えること**）:
  1. `<key>_logic_import.js` — IM-LogicDesigner フロー ZIP のインポート（最初）
  2. `<key>_workflow_import.js` — IM-Workflow 定義 XML のインポート（2 番目）
  3. `<key>_import.js` — LD フローを WF 処理対象者プラグインとして登録（最後）
- [ ] `<key>_import.js` に `WorkflowLogicFlowManager.createLogicFlow()` 呼び出しが含まれている
- [ ] `IMW_LOGIC_FLOW_PLUGINS` 配列の `logicFlowId` が IM-LogicDesigner に登録済みのフロー ID と一致している
- [ ] `resourceTypes` に登録する種別が要件に合致している（`authority_process` / `authority_confirm` / `authority_matter_handle`）
- [ ] テナント環境セットアップ実行後、IM-Workflow 管理画面「ロジックフロー一覧」に対象フローが登録されている

## 動作確認（テナント環境で）

- [ ] テナント環境セットアップから `import-<artifactId>-config-<N>.xml` を取り込み、エラーなく完了することを確認

## バージョンアップ時の追加チェック（configNumber >= 2 の場合）

- [ ] 既存の `import-<artifactId>-config-1.xml` ～ `config-(N-1).xml` には **一切変更を加えていない**
- [ ] 既存ファイル（suffix なしの `<key>-*.xml` 等）には **一切変更を加えていない**
- [ ] 新 spec.json には **差分のみ** を記述（既存ロール / 既存リソース ID 等は含めない）
- [ ] 新 config-N.xml の `<*-file>` 参照先がすべて意図したパスを指す:
  - **バージョン自体を上げた場合**（`1.1.0` 等、`spec.version` を変更）: 新バージョンディレクトリ（例: `1.1.0/`）配下の suffix なしファイルを参照
  - **同一バージョン内で config だけ増やした場合**（`spec.version` 据え置き）: 同じ `<version>/` 配下の `-<N>` サフィックス付きファイルを参照
- [ ] DDL で既存テーブルへ ALTER する場合、3 方言別ファイル（`_postgre` / `_oracle` / `_sqlserver`）すべてに方言固有構文で記述
- [ ] テナント環境で **`config-1.xml` から番号順に再実行** し、エラーなく完了することを検証（intra-mart Importer は全 config を番号順に実行）
