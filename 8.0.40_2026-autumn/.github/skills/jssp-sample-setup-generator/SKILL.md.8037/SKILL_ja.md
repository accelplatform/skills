---
name: jssp-sample-setup-generator
description: intra-mart Accel Platform のサンプルデータセットアップ（Importer）用資材一式を新規生成する。Importer 形式の config XML、ロール、認可（ポリシー / リソース / リソースグループ / サブジェクトグループ）、メニューグループ、ジョブスケジューラ、拡張インポート JS、DDL/DML SQL スケルトン、ポートレット登録 DML（JSSP プレゼンテーションページをポータルのポートレットとして登録する b_m_portlet_* テーブルへの DML 生成）、IM-Workflow インポート連携（storage/public の WF 定義 XML を storage/system にコピーし、DataImportExecutor で取り込む拡張インポート JS を生成）、IM-LogicDesigner インポート連携（storage/public のロジックフロー ZIP を storage/system にコピーし、LogicFlowImporter で取り込む拡張インポート JS を生成）を spec.json から多言語展開（ja/en/zh_CN）で一括生成する。「サンプルデータセットアップ資材を作って」「サンプルデータの投入資材を作って」「試用環境用のサンプルデータを作って」「import-％ショートモジュールID％-config.xml を作って」「サンプルのポートレットを登録するDMLを作って」「IM-Workflow をサンプルデータセットアップで取り込みたい」「IM-LogicDesigner のロジックフローをサンプルデータセットアップで取り込みたい」と言及されたときに使用。テナント環境セットアップ（モジュールの動作前提の構築）は jssp-tenant-setup-generator を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# サンプルデータセットアップ資材生成スキル

## 目的

intra-mart Accel Platform の **サンプルデータセットアップ**（Importer）に必要なファイル一式を、プロンプトの指示からゼロ生成するためのスキル。
生成された資材は、テナント環境管理（サンプルデータセットアップ）から取り込み可能。

サンプルデータセットアップは、デプロイされた各モジュールを **試用するためのサンプルデータを投入する処理**。本番環境では実施しない。

## jssp-tenant-setup-generator との関係

スキーマ（`import-data-config.xsd`）と投入できる資材はテナント環境セットアップと同一。**各 XML の仕様・実装テンプレートは `jssp-tenant-setup-generator` を参照すること。**

| 内容 | 参照先 |
|---|---|
| ロール定義 XML | `.github/skills/jssp-tenant-setup-generator/reference/role.md` |
| 認可ポリシー XML | `.github/skills/jssp-tenant-setup-generator/reference/authz-policy.md` |
| 認可リソース・リソースグループ XML | `.github/skills/jssp-tenant-setup-generator/reference/authz-resource.md` |
| 認可サブジェクトグループ XML | `.github/skills/jssp-tenant-setup-generator/reference/authz-subject-group.md` |
| メニューグループ XML | `.github/skills/jssp-tenant-setup-generator/reference/menu-group.md` |
| ジョブスケジューラ XML | `.github/skills/jssp-tenant-setup-generator/reference/job-scheduler.md` |
| DDL の型マッピング | `.github/skills/jssp-tenant-setup-generator/reference/database-sql.md` |

**参照時の読み替え:**

| テナント側の記述 | 本スキルでの読み替え |
|---|---|
| `conf/products/import/basic/％ショートモジュールID％/` | `conf/products/import/sample/`（ショートモジュール ID ディレクトリなし） |
| `import-％ショートモジュールID％-config-％スキーマバージョン％.xml` | `import-％ショートモジュールID％-config.xml` |
| `products/import/basic/<key>/<version>/` | `products/import/sample/<key>/`（`<version>` ディレクトリなし） |
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js` |
| `configNumber` / `-<N>` サフィックス / 複数 config 運用 | 存在しない |
| `build-setup-import.js` | `build-sample-setup-import.js` |

## テナント環境セットアップとの主な差分

いずれも「毎回実行される」「設定ファイルが 1 つ」であることに起因する。各資材の仕様は前掲の `jssp-tenant-setup-generator` を参照。

| 観点 | サンプルデータセットアップ（本スキル） |
|---|---|
| スキーマバージョン管理 / 複数 config（`configNumber`） | **対象外**。設定ファイルは 1 モジュールにつき最大 1 つ（`spec.version` / `spec.configNumber` は指定不可。build スクリプトがエラーで停止する） |
| 再実行 | **毎回全モジュールが実行される** → DDL・DML・拡張インポートはべき等必須（素の `CREATE TABLE` / `INSERT` は 2 回目でエラーになる。[reference/database-sql.md](reference/database-sql.md)） |
| 例外発生時 | **後続処理を継続実行** → `Logger` 出力必須。完了表示だけでは成否が分からない |
| 実行順序制御 | config 分割不可。`<extends-import>` 内の記述順のみ |
| DDL | **サンプルデータセットアップ専用テーブルのみ**（`tables[].ddl: true`） |

## 生成対象

| カテゴリ | 出力ファイル | 多言語 |
|---------|-------------|--------|
| インポート設定 | `import-<artifactId>-config.xml` | - |
| データベース | `<key>-ddl.sql` / `<key>-dml.sql` | - |
| ポートレット登録 | `<key>-dml.sql`（`b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` への実 DELETE + INSERT） | - |
| ロール | `<key>-role.xml` | ja / en / zh_CN |
| 認可リソースグループ | `<key>-authz-resource-group.xml` | ja / en / zh_CN |
| 認可リソース | `<key>-authz-resource.xml` | ja / en / zh_CN |
| 認可サブジェクトグループ | `<key>-authz-subject-group.xml` | ja / en / zh_CN |
| 認可ポリシー | `<key>-authz-policy.xml` | - |
| メニューグループ | `<key>-menu-group.xml` | ja / en / zh_CN |
| ジョブスケジューラ | `<key>-job-scheduler.xml` | ja / en / zh_CN |
| 拡張インポート JS | `<key>/initialize/<key>_import.js` | - |
| IM-Workflow インポート JS | `<key>/initialize/<key>_workflow_import.js` | - |
| IM-Workflow インポート XML | `storage/system` 配下にコピー | - |
| IM-LogicDesigner インポート JS | `<key>/initialize/<key>_logic_import.js` | - |
| IM-LogicDesigner インポート ZIP | `storage/system` 配下にコピー | - |
| IMW ロジックフロープラグイン登録 JS | `<key>/initialize/<key>_import.js`（`doImport` で `WorkflowLogicFlowManager` を使用） | - |

## ファイル構成

```
jssp-sample-setup-generator/
├── SKILL.md                        # このファイル
├── scripts/
│   └── build-sample-setup-import.js # spec.json → 各 XML/JS/SQL を一括生成
├── reference/
│   ├── import-config.md            # import-<artifactId>-config.xml の構造
│   ├── database-sql.md             # DDL/DML スケルトン仕様・再インポート時の存在チェック
│   ├── extends-import.md           # 拡張インポートクラス（doImport）仕様
│   ├── portlet-import.md           # ポートレット登録（portletImport）仕様
│   ├── workflow-import.md          # IM-Workflow インポート（workflowImport）仕様
│   ├── logic-import.md             # IM-LogicDesigner インポート（logicImport）仕様
│   ├── imw-logic-plugin-import.md  # IMW ロジックフロープラグイン登録仕様
│   └── checklist.md                # 生成後のセルフチェックリスト
└── examples/
    └── any_app.spec.json           # 架空アプリ "any_app" を spec で表現したサンプル
```

## 出力先

build スクリプトは下記に分けて出力する。

| 種別 | 出力先 |
|------|--------|
| `import-<artifactId>-config.xml` | `src/main/conf/products/import/sample/` |
| 各種 XML / SQL | `src/main/storage/system/products/import/sample/<key>/` |
| 拡張インポート JS | `src/main/jssp/src/<key>/initialize/<key>_import.js` |
| IM-Workflow インポート JS | `src/main/jssp/src/<key>/initialize/<key>_workflow_import.js` |
| IM-Workflow インポート XML（コピー） | `src/main/storage/system/products/import/sample/<key>/<file>.xml` |
| IM-LogicDesigner インポート JS | `src/main/jssp/src/<key>/initialize/<key>_logic_import.js` |
| IM-LogicDesigner インポート ZIP（コピー） | `src/main/storage/system/products/import/sample/<key>/<file>.zip` |

`<artifactId>` は **セットアップ設定ファイル名にのみ** 使う（格納ディレクトリ名には使わない）。解決順序:

1. **spec.json の `"artifactId"` フィールド**
2. プロジェクトルートの **`pom.xml`** の `<artifactId>`（`<parent>` 内は除外）
3. **`module.xml`**（または `src/main/jssp/module.xml`）の `<id>` の **ドット区切り末尾セグメント**（例: `mypackage.hoge` → `hoge`）
4. **spec.key（フォールバック）**

`<artifactId>` は `<key>` と異なってよい。ストレージ配下の参照パスには `<key>` が使われる。

config 内の `<role-file>`・`<authz-*-file>`・`<create-file>`・`<insert-file>` は
`src/main/storage/system` からの相対パスで記述する（例: `products/import/sample/<key>/<key>-role.xml`）。
`<extends-import-class>` は `src/main/jssp/src` からの相対パスで記述する（例: `<key>/initialize/<key>_import.js`）。

資材の配置に `<version>` ディレクトリは設けない。サンプルデータはモジュールの最新バージョンに合わせて常に最新状態を維持する運用のため、更新は既存ファイルの上書き（`--force`）で行う。

### DDL の責務分担

DDL は **サンプルデータセットアップでしか使わないテーブル**のみを対象とする。`spec.database.tables[].ddl: true` を指定したテーブルだけが生成される。

| テーブルの性質 | DDL を作る場所 |
|---|---|
| モジュールが動作するために必要 | テナント環境セットアップ（`src/main/storage/system/products/import/basic/<key>/<version>/`） |
| サンプルデータセットアップ専用 | **サンプルデータセットアップ（`src/main/storage/system/products/import/sample/<key>/`）** |

既存テーブル（テナント環境セットアップで作成済み）へ INSERT するだけなら `ddl` を指定しない。DML のスケルトンにのみ現れる。

### `storage/system` 配下 vs `storage/public` 配下の使い分け

| 配置先 | 主な格納物 | 投入経路 |
|--------|----------|---------|
| `src/main/storage/system/products/import/sample/<key>/` | DDL / DML、ロール XML、認可 XML、メニュー XML、ジョブスケジューラ XML | **サンプルデータセットアップ（Importer）でのみ投入**。インポート画面から個別投入不可 |
| `src/main/storage/public/im_workflow/` | IM-Workflow インポート XML | **ユーザがインポート画面から手動投入可能**（本スキル使用時は、ここから storage/system にコピーされて自動投入される） |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner インポート ZIP | 同上 |

## デフォルトポリシー: 拡張インポート（IM-Workflow / IM-LogicDesigner）は OFF

spec.json の `workflowImport` / `logicImport` セクションは、**ユーザがプロンプトで IM-Workflow / IM-LogicDesigner のインポートを明示的に指示した場合のみ** 追加する。

- **明示指定の例**: 「IM-Workflow をサンプルデータセットアップで取り込みたい」「IM-LogicDesigner のロジックフローをサンプルデータセットアップで取り込みたい」「`workflowImport` を含めて」等、IM-Workflow / IM-LogicDesigner / `workflowImport` / `logicImport` のいずれかの語を含む依頼
- **NG（暗黙的・推測ベースで追加しない）**: 「サンプルデータセットアップ資材を作って」のような汎用依頼では、`storage/public/im_workflow/` や `storage/public/im_logic/` にファイルがあっても **spec.json に `workflowImport` / `logicImport` を追加しないこと**
- **ヒアリングしない**: AI 側から「ワークフロー / LogicDesigner のインポートはありますか？」と確認することは禁止。ユーザが先に言及した場合のみ詳細を確認する

## 使用タイミング

ユーザが以下のような依頼をした場合:

- 「サンプルデータセットアップ資材を作って」
- 「サンプルデータの投入資材を一式作って」
- 「試用環境用のサンプルデータを作って」
- 「`import-％ショートモジュールID％-config.xml` を作って」
- 「JSSP 画面をサンプルのポートレットとして登録したい」（`portletImport` を含める場合）
- 「IM-Workflow のインポートをサンプルデータセットアップで取り込みたい」（`storage/public/im_workflow/` に WF 定義 XML がある場合）★ 明示指定時のみ
- 「IM-LogicDesigner のインポートをサンプルデータセットアップで取り込みたい」（`storage/public/im_logic/` にロジックフロー ZIP がある場合）★ 明示指定時のみ

テナント環境セットアップ（モジュールの動作前提の構築）は `jssp-tenant-setup-generator` を使うこと。

## 生成手順

### 1. ヒアリング

以下の情報をユーザから確認する。

| 項目 | 必須 | 例 |
|------|------|-----|
| アプリケーションキー（英語ID） | YES | `any_app`, `expense_app` |
| artifactId（ショートモジュール ID） | NO | 省略時は `pom.xml` の `<artifactId>` → `module.xml` の `<id>` のドット区切り末尾 → `<key>` の順で自動解決 |
| 短縮名（プラグイン ID 用） | YES | `app`, `exp` |
| 表示名（日本語 / 英語 / 中国語） | YES | `Any App` / `Any App` / `Any App` |
| ロール構成 | YES | `app_manager`（管理者）など |
| 認可リソース構成（サービス URI） | YES | `service://any_app/maintenance/content` 等 |
| 認可ポリシー（誰が何にアクセスできるか） | YES | tenant_manager / app_manager / authenticated 等 |
| ジョブスケジューラ（任意） | NO | 定期バッチがあれば |
| メニューグループ（任意） | NO | メニュー登録があれば |
| DML テーブル（任意） | NO | サンプルデータを投入するテーブル |
| DDL テーブル（任意） | NO | サンプルデータセットアップでしか使わないテーブルがあれば。`tables[].ddl: true` を指定する |
| ポートレット定義（任意） | NO | JSSP 画面を試用用のポートレットとしてポータルに登録したい場合（`portlet_cd`・表示するページパス・タイトル 3 言語） |
| 拡張インポート処理（任意） | NO | doImport(tenantId) で初期化処理がある場合 |

> **`configNumber` / `version` はヒアリングしないこと**
> サンプルデータセットアップはスキーマバージョン管理の対象外で、設定ファイルは 1 モジュールにつき最大 1 つしか作られない。**本スキルでは両フィールドとも指定できない**（build スクリプトがエラーで弾く）。

### 2. spec.json を組み立てる

ヒアリング結果から spec.json を組み立てる。コーディングエージェントが書くのは spec のみで、XML の多言語 3 ファイル展開やネームスペース付与は build スクリプトが自動で行う。

サンプル: [examples/any_app.spec.json](examples/any_app.spec.json)

spec.json の各フィールドはテナント環境セットアップと同一。前掲の対応表から各 reference を参照すること。本スキル固有の差分は以下のみ。

```jsonc
{
  "key": "any_app",
  // "version" と "configNumber" は指定できない（build スクリプトがエラーで停止する）
  "artifactId": "any-app",
  "shortName": "app",
  "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },

  // roles / authzResourceGroups / authzResources / authzPolicies /
  // authzSubjectGroups / menuGroups / jobScheduler はテナント環境セットアップと同一

  "database": {
    "tables": [
      // ddl 未指定 = DML のみ（テナント環境セットアップで作成済みのテーブル）
      { "name": "any_app_data", "comment": "サンプルデータ" },
      // ddl: true = サンプルデータセットアップ専用テーブル。DDL を 3 方言別に生成する
      { "name": "any_app_demo", "comment": "デモ用テーブル", "ddl": true }
    ],
    "dmlPerDialect": false                     // false（デフォルト）: DML 一本化 / true: 3 方言別
  },

  // JSSP 画面を試用用のポートレットとしてポータルに登録する（任意）。
  // b_m_portlet_info / b_m_portlet_mode / b_m_portlet_title_info への
  // DELETE → INSERT（洗い替え）を <key>-dml.sql に生成する。
  // database が無くてもこれだけで DML ファイルが出力される。
  // 詳細は reference/portlet-import.md 参照
  "portletImport": {
    "portlets": [
      {
        "portletCd": "any_app_summary",
        "path": "any_app/portlet/summary_view/index",
        "editable": false,
        "titles": {
          "name": { "ja": "Any App サマリ", "en": "Any App Summary", "zh_CN": "Any App 摘要" },
          "application": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
          "description": { "ja": "Any App の概要を表示します。", "en": "Displays an overview of Any App.", "zh_CN": "显示 Any App 的概览。" }
        }
      }
    ]
  },

  "extendsImport": true,
  "workflowImport": { "files": ["im_workflow-simple_approval-import.xml"] },
  "logicImport": { "files": ["im-logicdesigner-data-sample-simple.zip"] }
}
```

| reference ファイル | 内容 |
|------------------|------|
| [reference/import-config.md](reference/import-config.md) | `import-<artifactId>-config.xml` の構造・参照規則 |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML スケルトンのフォーマット、**再インポート時の存在チェック** |
| [reference/extends-import.md](reference/extends-import.md) | `doImport(tenantId)` の実装規約 |
| [reference/portlet-import.md](reference/portlet-import.md) | ポートレット登録（`portletImport.portlets`、`b_m_portlet_*` への DML 生成、べき等な洗い替え、対象外項目） |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow インポートの仕組み |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner インポートの仕組み |
| [reference/imw-logic-plugin-import.md](reference/imw-logic-plugin-import.md) | IMW ロジックフロープラグイン登録仕様 |
| [reference/checklist.md](reference/checklist.md) | 生成後セルフチェック |

### 3. build-sample-setup-import.js を実行

```bash
node .github/skills/jssp-sample-setup-generator/scripts/build-sample-setup-import.js \
     <spec.json のパス>
```

`--out` を省略すると、出力先は SKILL.md に記載のデフォルトパスになる。

build-sample-setup-import.js が自動で行うこと:

- 3 ロケール（en / ja / zh_CN）× 各 XML の自動展開
- 名前空間 (`xmlns`) の自動付与
- ロール ID / 認可リソース ID 等の参照整合性チェック（spec 内部で参照されていない ID は警告）
- `spec.version` / `spec.configNumber` を検出したらエラーで停止
- `type="im-logic-rest"` の認可ポリシーがあれば警告（[reference/logic-import.md](reference/logic-import.md) 参照）
- DDL（`tables[].ddl: true` のみ、3 方言別）/ DML のスケルトン SQL 生成
- `portletImport.portlets` から `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` への実 DELETE + INSERT 文生成（コメントのみのスケルトンではなく、そのままサンプルデータセットアップで投入可能な DML。毎回実行に耐えるよう DELETE → INSERT の洗い替えで出力し、SQL コメントは付けない）
- 拡張インポート JS スケルトン生成（`doImport(tenantId)` を空関数で出力）
- IM-Workflow インポート XML のコピー（`storage/public/im_workflow/` → `storage/system/products/import/sample/<key>/`）と専用 JS（`<key>_workflow_import.js`）生成
- IM-LogicDesigner インポート ZIP のコピー（`storage/public/im_logic/` → `storage/system/products/import/sample/<key>/`）と専用 JS（`<key>_logic_import.js`）生成（`Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider` 経由）
- `import-<artifactId>-config.xml` の自動組み立て（実在する出力ファイルのみ参照、`<extends-import>` には `<extends-import-class>` を複数並べる）

既存ファイルがあるとエラーで停止する。資材を更新する場合は `--force` を指定する。

### 4. セルフチェック

生成後は [reference/checklist.md](reference/checklist.md) のセルフチェックリストに沿って確認する。

## 注意事項

- このスキルは **新規アプリのサンプルデータ資材一式の生成専用**。既存資材への追記（authz-policy へのエントリ追加など）には向かない（手動編集を推奨）。
- **テナント環境セットアップ側で定義済みのロール・認可・メニュー・ジョブ・ポートレットを再定義しない**（二重投入になる。ポートレットは洗い替えでテナント側の登録内容を上書きする）。
- 認可ポリシーの `subject` 式（`S(b_m_role:...)` 等）は **build スクリプトが内容検証を行わない**。書式は `.github/skills/jssp-tenant-setup-generator/reference/authz-policy.md` を必ず確認すること。
- 拡張インポート JS（`doImport(tenantId)`）の中身は空スケルトン。実装内容はユーザが個別に追記する。実装規約は [reference/extends-import.md](reference/extends-import.md) 参照。

## 棲み分け

| スキル | 用途 |
|--------|------|
| **jssp-sample-setup-generator**（本スキル） | サンプルデータセットアップ資材一式（Importer 形式）の生成 |
| jssp-tenant-setup-generator | テナント環境セットアップ資材一式の生成（モジュールの動作前提の構築） |
| base-im-workflow-generator | IM-Workflow のワークフロー定義 XML の生成 |
| jssp-im-logic-generator | IM-LogicDesigner のフロー定義 JSON の生成 |
| jssp-page-generator | 画面・ファンクションコンテナの生成 |
| jssp-im-job-generator | ジョブプログラム（バッチ処理）本体の実装 |

**ジョブスケジューラに関する棲み分け:**
本スキルが生成するのは `<key>-job-scheduler.xml`（ジョブ・ジョブネットの定義 XML）のみ。
ジョブの**実装本体**（`jp.co...` の Java クラスや、`.js` のジョブプログラム）は `jssp-im-job-generator` を使うこと。
