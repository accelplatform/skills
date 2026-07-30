# サンプルデータセットアップ資材 生成後セルフチェックリスト

build-sample-setup-import.js を実行した後、以下を確認すること。

多言語ファイル・参照整合性・ジョブスケジューラ・メニューグループの各セクションは
`.claude/skills/jssp-tenant-setup-generator/reference/checklist.md` を参照する（読み替えは SKILL.md の「参照時の読み替え」）。

以下はサンプルデータセットアップ固有の項目。

## ファイル構成

- [ ] `src/main/conf/products/import/sample/import-<artifactId>-config.xml` が出力されている
  - **ショートモジュール ID ディレクトリを挟まない**（`conf/products/import/sample/` 直下）
  - **ファイル名にスキーマバージョンが付いていない**（`-config-1.xml` ではなく `-config.xml`）
- [ ] `src/main/storage/system/products/import/sample/<key>/` 配下に各 XML / SQL が出力されている
  - **`<version>` ディレクトリを挟まない**
  - ショートモジュール ID ディレクトリ（`<key>/`）は **ある**（設定ファイル側と混同しないこと）
- [ ] 拡張インポート JS が `src/main/jssp/src/<key>/initialize/` 直下にある（**`<version>` ディレクトリなし**）
- [ ] 全 XML ファイルが UTF-8（BOM なし）でエンコードされている

## 固有チェック（最重要）

- [ ] **`spec.version` / `spec.configNumber` を指定していない**（指定すると build スクリプトがエラーで停止する）
- [ ] **`ddl: true` を指定したのはサンプルデータセットアップ専用テーブルだけ**。モジュール本体のテーブルはテナント環境セットアップ側で作成する
- [ ] **べき等性を確認した**（毎回全モジュール分が実行される）
  - [ ] DDL の CREATE TABLE がテーブル作成済みの状態でエラーにならない（存在チェック付き）
  - [ ] DML の INSERT が二重投入で一意制約違反にならない（`WHERE NOT EXISTS` / `DELETE` してから `INSERT` 等）
  - [ ] 拡張インポート `doImport()` が再実行しても同じ結果になる（洗い替え推奨）
  - [ ] `logicImport` の JS が `importData(inputStream, true)`（上書きあり）になっている
- [ ] **ログ出力が入っている**（例外が出ても後続を継続するため、ログがないと失敗を見逃す）
- [ ] `<extends-import-class>` の順序制御が必要な場合、**同一ファイル内の記述順で** 制御している（config 分割はできない）
- [ ] `type="im-logic-rest"` の認可ポリシーを含めていない（投入できない。build スクリプトが警告を出す）
- [ ] **テナント環境セットアップ側で既に定義されているロール / 認可リソース / メニューグループ / ジョブを再定義していない**（二重投入になる）
- [ ] サンプル側で新規に定義した ID がテナント環境セットアップ側と衝突していない（同じ `<key>` に対して両方のセットアップが資材を投入するため）。認可サブジェクトグループの `sort-key`・メニューグループの `sortNumber` もテナント側と別の値帯にする
- [ ] `ddl` を指定していないテーブルが、テナント環境セットアップの DDL で作成済みである

## XSD 構造

- [ ] `<import-data-config>` 直下が **`database` → `tenant-master` → `extends-import`** の順（XSD の sequence）
- [ ] `<database>` 内が **`create-file` → `insert-file`** の順
- [ ] `<tenant-master>` 内が依存順（ロール → 認可リソースグループ → 認可リソース → 認可サブジェクトグループ → メニューグループ → **認可ポリシー** → ジョブスケジューラ）

## DDL（`tables[].ddl: true` 指定時）

- [ ] CREATE TABLE のスケルトンに実テーブル定義を追記している（コメントのままでは何も作られない）
- [ ] **コメント行を削除している**（仕様上 SQL 文中のコメントは未対応）
- [ ] **3 方言すべて**（`_postgre` / `_oracle` / `_sqlserver`）に方言固有の型・構文で記述している
- [ ] **存在チェックなしの `DROP` / `CREATE` を先頭に置いていない**（初回に失敗すると同じファイルの残り全文がスキップされ、テーブル未作成のまま「成功」扱いになる → [database-sql.md](database-sql.md#importer-の-sql-実行挙動重要)）
- [ ] **テーブル作成済みの状態で再実行してもエラーにならない**（[database-sql.md](database-sql.md#テーブル作成済みの状態での再インポート)）
  - [ ] PostgreSQL: `CREATE TABLE IF NOT EXISTS`
  - [ ] SQL Server: `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '<table>') CREATE TABLE ...`
  - [ ] Oracle 23ai 以降: `CREATE TABLE IF NOT EXISTS`
  - [ ] **Oracle 23ai 未満**: 存在チェック（PL/SQL）は分割で壊れるため使えない。素の `CREATE TABLE` のみ（`DROP` を混ぜない）か、拡張インポートで作成する（[database-sql.md](database-sql.md#oracle-23ai-未満は存在チェックを書けない)）
- [ ] `DROP` → `CREATE` 方式を選んだ場合、`DROP TABLE IF EXISTS`（PostgreSQL / SQL Server）を使い、**試用中のデータが消える**ことを許容できるか確認した。**Oracle 23ai 未満では使わない**

## DML

- [ ] INSERT 文のスケルトンに実データを追記している
- [ ] **コメント行を削除している**
- [ ] SQL 文の終端にセミコロン `;` が付いている
- [ ] **べき等**である（`WHERE NOT EXISTS` / `DELETE` してから `INSERT` 等）
- [ ] 業務トランザクションのデータを含めていない（マスタ系のみ）
- [ ] `dmlPerDialect: false` の場合、INSERT が標準 SQL の範囲で書かれている

## ポートレット登録（`portletImport` 指定時）

- [ ] `<key>-dml.sql` に `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` への DELETE + INSERT が出力されている
- [ ] **ポートレット DML にコメント行が混ざっていない**（`spec.database` を併用した場合、独自テーブルのスケルトンコメントを削除する。`SQLFileImporter` は `;` で機械分割するため、コメント内の `;` や末尾コメントは実行時エラーになる）
- [ ] `portletCd` が **テナント環境セットアップ側で登録済みのポートレットと重複していない**（洗い替えで上書きしてしまう）
- [ ] `path` が実在する JSSP プレゼンテーションページを指している（`src/main/jssp/src/` からの相対パス、拡張子なし）
- [ ] ポートレット用ページに **ルーティング設定・ルーティング認可を作っていない**（ポータルから直接呼ばれるため不要）
- [ ] `editable` の指定が意図どおり（`false`: 表示のみ / `true`: 表示・編集可）で、`<key>-authz-policy.xml` に対応する `im-portal-portlet` / `im-portal-portlet-editmode` のポリシーが出力されている
- [ ] **2 回連続で実行してもエラーにならないことを確認した**（DELETE → INSERT の洗い替え）
- [ ] ポータルへの配置（`b_m_portlet_layout`）は対象外であることを理解している。試用時はポータル管理画面から手動配置する

## 拡張インポート JS

- [ ] `doImport(tenantId)` 内に try/catch でラップした初期化処理が記述されている
- [ ] Logger による開始 / 完了 / 例外のログ出力がある
- [ ] `.claude/rules/jssp-code-style.md` に準拠している（変数宣言は `let`、`var` 不使用、文字列はシングルクォート）
- [ ] Tenant Database アクセスがあれば、`Transaction.begin` で制御し `isSuccess()` をチェックしている
- [ ] **べき等**である（洗い替え方式を推奨）

## ジョブスケジューラ

- [ ] トリガーを付けた場合、サンプル用ジョブが勝手に動き出さないよう `enable: false` になっている

## IM-Workflow インポート（`workflowImport` 指定時）

- [ ] ユーザが **明示的に** 指示した（推測ベースで追加していない）
- [ ] **2 回目の実行時の挙動を検証した**（毎回実行される。更新扱いになるか / エラーを許容するか）
- [ ] `<key>.workflow_import` ロガーに「workflow import completed.」が出ている
- [ ] 実行後に `storage/public/tmp/<key>_*_*.xml` 等の一時ファイルが残っていない
- [ ] 詳細は [workflow-import.md](workflow-import.md) を参照

## IM-LogicDesigner インポート（`logicImport` 指定時）

- [ ] ユーザが **明示的に** 指示した（推測ベースで追加していない）
- [ ] 生成 JS が `importer.importData(inputStream, true)`（**上書きあり**）になっている
- [ ] ルーティング定義（`flow_route.json`）が含まれる場合、**対応する認可ポリシーをサンプルデータセットアップ側に書いていない**（テナント環境セットアップ側で投入すること）
- [ ] `<key>.logic_import` ロガーに「logic import completed.」が出ている
- [ ] 詳細は [logic-import.md](logic-import.md) を参照

## IMW ロジックフロープラグイン登録

- [ ] `<extends-import-class>` が **以下の順序** で並んでいる（ビルドスクリプトは逆順で生成するため、**生成後に手動で並べ替えること**。config 分割による順序制御はできない）:
  1. `<key>_logic_import.js`
  2. `<key>_workflow_import.js`
  3. `<key>_import.js`
- [ ] 洗い替え方式（`deleteLogicFlow` → `createLogicFlow`）になっている
- [ ] IM-Workflow 管理画面「ロジックフロー一覧」に対象フローが登録されている

## 動作確認（テナント環境で）

- [ ] テナント環境セットアップを先に実行し、正常完了している（モジュール本体のテーブル・必須マスタが揃っていること）
- [ ] サンプルデータセットアップを実行し、エラーなく完了することを確認
- [ ] `ddl: true` のテーブルが作成され、サンプルデータが投入されていることを確認
- [ ] 投入されたサンプルデータが画面から参照できることを確認
- [ ] **2 回連続で実行し、2 回目もエラーなく完了することを確認**（べき等性の実証。最重要）
  - [ ] 2 回目で `CREATE TABLE` がエラーになっていない
  - [ ] 2 回目で INSERT が一意制約違反になっていない
  - [ ] `DROP` → `CREATE` 方式でない場合、1 回目に入れたデータが 2 回目の実行後も残っている
- [ ] セットアップログを確認し、例外が握りつぶされていないことを確認（**例外が出ても後続処理は継続実行されるため、完了表示だけでは成功したか分からない**）

## 資材更新時

- [ ] 既存資材の更新は **`--force` での上書き** で行っている（バージョンディレクトリを増やす運用は行わない）
- [ ] 更新後の資材が、モジュールの最新バージョンに整合している（サンプルデータは常に最新状態を維持する）
- [ ] 削除された資材がある場合、`import-<artifactId>-config.xml` の参照行と実ファイルの両方を消している（build スクリプトは不要になったファイルを自動削除しない）
