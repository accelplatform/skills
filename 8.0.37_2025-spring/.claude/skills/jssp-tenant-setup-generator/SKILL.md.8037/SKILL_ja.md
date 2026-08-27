---
name: jssp-tenant-setup-generator
description: intra-mart Accel Platform のテナント環境セットアップ（Importer）用資材一式を新規生成する。Importer 形式の config XML、ロール、認可（ポリシー / リソース / リソースグループ / サブジェクトグループ）、メニューグループ、ジョブスケジューラ、拡張インポート JS、DDL/DML SQL スケルトン、ポートレット登録 DML（JSSP プレゼンテーションページをポータルのポートレットとして登録する b_m_portlet_* テーブルへの DML 生成）、IM-Workflow インポート連携（storage/public の WF 定義 XML を storage/system にコピーし、DataImportExecutor で取り込む拡張インポート JS を生成）、IM-LogicDesigner インポート連携（storage/public のロジックフロー ZIP を storage/system にコピーし、LogicFlowImporter で取り込む拡張インポート JS を生成）を spec.json から多言語展開（ja/en/zh_CN）で一括生成する。「テナント初期セットアップ資材を作って」「Importer インポート資材を作って」「初期データインポート用 XML を作って」「セットアップ XML を作って」「ポートレットを登録するDMLを作って」「ポータルのポートレットをテナント環境セットアップに含めたい」「IM-Workflow をテナント環境セットアップで取り込みたい」「ワークフロー定義のインポートをセットアップに組み込んで」「IM-LogicDesigner のロジックフローをテナント環境セットアップで取り込みたい」と言及されたときに使用。
allowed-tools: Bash, Read, Write, Glob
---

# テナント環境セットアップ資材生成スキル

## 目的

intra-mart Accel Platform の **Importer**（テナント環境セットアップ資材）に必要なファイル一式を、プロンプトの指示からゼロ生成するためのスキル。
生成された資材は、テナント環境管理（テナント環境セットアップ）から取り込み可能。

## 生成対象

| カテゴリ | 出力ファイル | 多言語 |
|---------|-------------|--------|
| インポート設定 | `import-<artifactId>-config-1.xml` | - |
| データベース | `<key>-ddl.sql` / `<key>-dml.sql` | - |
| ポートレット登録 | `<key>_sample-dml.sql`（`b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` への実 INSERT） | - |
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
jssp-tenant-setup-generator/
├── SKILL.md                       # このファイル
├── scripts/
│   └── build-setup-import.js      # spec.json → 各 XML/JS/SQL を一括生成
├── reference/
│   ├── import-config.md           # import-<artifactId>-config-1.xml の構造
│   ├── role.md                    # ロール定義 XML 仕様
│   ├── authz-policy.md            # 認可ポリシー XML 仕様
│   ├── authz-resource.md          # 認可リソース・リソースグループ XML 仕様
│   ├── authz-subject-group.md     # 認可サブジェクトグループ XML 仕様
│   ├── menu-group.md              # メニューグループ XML 仕様
│   ├── job-scheduler.md           # ジョブスケジューラ XML 仕様
│   ├── extends-import.md          # 拡張インポートクラス（doImport）仕様
│   ├── workflow-import.md         # IM-Workflow インポート（workflowImport）仕様
│   ├── logic-import.md            # IM-LogicDesigner インポート（logicImport）仕様
│   ├── imw-logic-plugin-import.md # IMW ロジックフロープラグイン登録（doImport + WorkflowLogicFlowManager）仕様
│   ├── multi-config.md            # 複数 config 運用（バージョンアップ / 同一バージョン内 config 追加）
│   ├── database-sql.md            # DDL/DML スケルトン仕様
│   └── checklist.md               # 生成後のセルフチェックリスト
└── examples/
    └── any_app.spec.json          # 架空アプリ "any_app" を spec で表現したサンプル
```

## 出力先

build スクリプトは下記 2 ヶ所に分けて出力する。

| 種別 | 出力先 |
|------|--------|
| `import-<artifactId>-config-<N>.xml` | `src/main/conf/products/import/basic/<artifactId>/` |
| 各種 XML / SQL | `src/main/storage/system/products/import/basic/<key>/<version>/` |
| 拡張インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js` |
| IM-Workflow インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| IM-Workflow インポート XML（コピー） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| IM-LogicDesigner インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| IM-LogicDesigner インポート ZIP（コピー） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |

`<version>` は以下の優先順位で決定する:

1. **spec.json の `"version"` フィールド** が指定されていればそれを使用
2. プロジェクトルートに **`module.xml`**（または `src/main/jssp/module.xml`）があれば、その `<version>` タグの値
3. プロジェクトルートに **`pom.xml`** があれば、その `<version>` タグの値（`<parent>` 内の version は除外）
4. 上記いずれもなければ **`1.0.0`**

`<N>` は spec.json の `"configNumber"` フィールドで指定する。**AI はヒアリング段階で必ずユーザに `configNumber` を確認すること**（自動推定はしない。詳細は「### 1. ヒアリング」の補足を参照）。複数 config を扱う運用は後述「複数 config 運用」を参照。

`<N> >= 2` の場合、各種 XML / SQL / JS のファイル名末尾に `-<N>` サフィックスが付与される（例: `equip-authz-policy-2.xml`、`equip_import-2.js`）。これは同一 `<version>` 内に複数 config を共存させたときの衝突回避用で、同一バージョン内でインポート順序を制御したい運用（例: LogicDesigner ルーティングと認可ポリシーの実行順序制御）で利用する。挿入位置の詳細とユースケースは [reference/import-config.md](reference/import-config.md#configNumber--1-のファイル名サフィックス) および [reference/logic-import.md](reference/logic-import.md#ルーティング向け認可ポリシーの投入順序) を参照。

`<artifactId>` は **セットアップ XML の格納ディレクトリ名 兼 ファイル名（`import-<artifactId>-config-<N>.xml`）**。intra-mart テナント環境セットアップの仕様で、プロジェクトの `pom.xml` の `<artifactId>` と一致させる必要がある。解決順序:

1. **spec.json の `"artifactId"` フィールド**（明示指定）
2. プロジェクトルートの **`pom.xml`** の `<artifactId>`（`<parent>` 内は除外）
3. プロジェクトルートの **`module.xml`**（または `src/main/jssp/module.xml`）の `<id>` の **ドット区切り末尾セグメント**（例: `mypackage.hoge` → `hoge`）
4. **spec.key（フォールバック）** — 上記のいずれもなければ spec.key で代用

`<artifactId>` は `<key>` と異なってよい（例: `<key>="equip"`、`<artifactId>="equipment-lending-system"`）。中の参照パス（`<*-file>`）には `<key>` が使われ、**Importer 設定 XML のディレクトリ名とファイル名（`import-<artifactId>-config-<N>.xml`）にだけ** `<artifactId>` が使われる。

config-1.xml 内の `<role-file>`・`<authz-*-file>`・`<create-file>`・`<insert-file>` は
`src/main/storage/system` からの相対パスで記述する（例: `products/import/basic/<key>/<version>/<key>-role.xml`）。
`<extends-import-class>` は `src/main/jssp/src` からの相対パスで記述する（例: `<key>/initialize/<version>/<key>_import.js`）。

## DDL / サンプル DML 配置の意義

**テナント環境セットアップで投入される SQL ファイル**（`CREATE TABLE` 等の DDL、および**サンプル初期データ投入用の DML（`<key>_sample-dml.sql`）**）は、本スキルを直接使うかどうかに関わらず、必ず以下のパスに配置すること。

```
src/main/storage/system/products/import/basic/<key>/<version>/
```

**理由**: DDL とサンプル初期 DML は intra-mart の **テナント環境セットアップ（Importer）で一括投入される運用が前提**である。インポート画面からユーザが個別に投入できないため、テナント環境セットアップ資材として `storage/system` 配下に配置する必要がある。`jssp-page-generator` や `jssp-im-workflow-usage` などの他スキルが DDL/サンプル DML を生成する場合も、ここに集約する。

### スコープ外: ファンクションコンテナのランタイム SQL

ファンクションコンテナから `db.executeByTemplate` / `db.execute` で **実行時に呼び出す業務 SQL**（SELECT / INSERT / UPDATE / DELETE 等の 2WaySQL テンプレート）は本セクションのスコープ外。
これらは `src/main/jssp/src/{機能名}/sql/` に配置する（詳細は `.claude/rules/jssp-2way-sql.md`）。

### `storage/system` 配下 vs `storage/public` 配下の使い分け

| 配置先 | 主な格納物 | 投入経路 |
|--------|----------|---------|
| `src/main/storage/system/products/import/basic/<key>/<version>/` | DDL / サンプル DML、ロール XML、認可 XML、メニュー XML、ジョブスケジューラ XML、拡張インポート JS 等 | **テナント環境セットアップ（Importer）でのみ投入**。インポート画面から個別投入不可 |
| `src/main/storage/public/im_workflow/` | IM-Workflow インポート XML | **ユーザがインポート画面から手動投入可能**（本スキル使用時は、ここから storage/system にコピーされて自動投入される） |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner インポート ZIP | 同上 |

つまり、**ユーザがインポート画面から個別投入できる資材は `storage/public` 配下**、**できない資材は `storage/system` 配下**、と覚えるとよい。DDL とサンプル DML は後者のため、必ず `storage/system` 配下に配置する。

## デフォルトポリシー: 拡張インポート（IM-Workflow / IM-LogicDesigner）は OFF

spec.json の `workflowImport` / `logicImport` セクションは、**ユーザがプロンプトで IM-Workflow / IM-LogicDesigner のインポートを明示的に指示した場合のみ** 追加する。

- **明示指定の例**: 「IM-Workflow をテナント環境セットアップで取り込みたい」「ワークフロー定義のインポートをセットアップに組み込んで」「IM-LogicDesigner のロジックフローをテナント環境セットアップで取り込みたい」「`workflowImport` を含めて」等、IM-Workflow / IM-LogicDesigner / `workflowImport` / `logicImport` のいずれかの語を含む依頼
- **NG（暗黙的・推測ベースで追加しない）**: 「テナント初期セットアップ資材を作って」「Importer インポート資材を作って」のような汎用依頼では、`storage/public/im_workflow/` や `storage/public/im_logic/` にファイルがあっても **spec.json に `workflowImport` / `logicImport` を追加しないこと**
- **ヒアリングしない**: AI 側から「ワークフロー / LogicDesigner のインポートはありますか？」と確認することは禁止。ユーザが先に言及した場合のみ詳細を確認する

## 使用タイミング

ユーザが以下のような依頼をした場合:

- 「テナント初期セットアップ資材を作って」
- 「Importer のインポート XML を一式作って」
- 「テナント環境セットアップ用の認可リソース・ロール定義を作って」
- 「初期データインポートのスケルトンを生成して」
- 「JSSP 画面をポートレットとしてテナント環境セットアップに登録したい」（`portletImport` を含める場合）
- 「IM-Workflow のインポートをテナント環境セットアップで取り込みたい」（`storage/public/im_workflow/` に WF 定義 XML がある場合）★ 明示指定時のみ
- 「IM-LogicDesigner のインポートをテナント環境セットアップで取り込みたい」（`storage/public/im_logic/` にロジックフロー ZIP がある場合）★ 明示指定時のみ
- 「IM-LogicDesigner のフローを IM-Workflow の処理対象者プラグインとして登録したい」★ 明示指定時のみ
- 「LD フローを WF プラグインとして自動登録したい」★ 明示指定時のみ

## 生成手順

### 1. ヒアリング

以下の情報をユーザから確認する。

| 項目 | 必須 | 例 |
|------|------|-----|
| アプリケーションキー（英語ID） | YES | `any_app`, `expense_app` |
| バージョン番号 | NO | `1.0.0`（省略時は `module.xml` / `pom.xml` の `<version>` を自動検出、それもなければ `1.0.0`） |
| config 番号（configNumber） | YES | `1`（初回セットアップ）／`2`, `3`, ...（既存テナントへの差分追加）。**自動判定せず必ずユーザに確認すること**（既存テナントに再投入する運用かどうかは AI 側からは判別できないため） |
| artifactId（セットアップ XML 格納ディレクトリ名） | NO | 省略時は `pom.xml` の `<artifactId>` → `module.xml` の `<id>` のドット区切り末尾 → `<key>` の順で自動解決 |
| 短縮名（プラグイン ID 用） | YES | `app`, `exp` |
| 表示名（日本語 / 英語 / 中国語） | YES | `Any App` / `Any App` / `Any App` |
| ロール構成 | YES | `app_manager`（管理者）など |
| 認可リソース構成（サービス URI） | YES | `service://any_app/maintenance/content` 等 |
| 認可ポリシー（誰が何にアクセスできるか） | YES | tenant_manager / app_manager / authenticated 等 |
| ジョブスケジューラ（任意） | NO | 定期バッチがあれば |
| メニューグループ（任意） | NO | メニュー登録があれば |
| DDL/DML テーブル（任意） | NO | 独自テーブルがあれば |
| ポートレット定義（任意） | NO | JSSP 画面をポータルのポートレットとして登録したい場合（`portlet_cd`・表示するページパス・タイトル 3 言語） |
| 拡張インポート処理（任意） | NO | doImport(tenantId) で初期化処理がある場合 |

> **configNumber のヒアリングについて**
> `configNumber` は `module.xml` / `pom.xml` の `<version>` 変化や既存ファイル有無から自動推定**しない**。新規アプリの初版なら `1`、既にテナントにインポート済みの既存セットアップに対する差分追加なら `2` 以上、と運用判断が必要なため、AI は spec.json を組み立てる前に必ずユーザに次の質問を投げること:
> - 「このセットアップは新規アプリの初版（configNumber=1）ですか、それとも既に投入済みのテナントに対する差分追加（configNumber=2 以上）ですか？」
> - 差分追加の場合は、現行の最大 N を確認した上で `N+1` を指定する。

### 2. spec.json を組み立てる

ヒアリング結果から spec.json を組み立てる。コーディングエージェントが書くのは spec のみで、XML の多言語 3 ファイル展開やネームスペース付与は build スクリプトが自動で行う。

サンプル: [examples/any_app.spec.json](examples/any_app.spec.json)

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",                          // バージョン番号。省略時は module.xml / pom.xml の <version> を自動検出、それもなければ "1.0.0"
  "configNumber": 1,                           // import-<artifactId>-config-<N>.xml の N。初回セットアップは 1、既存テナントへの差分追加は 2, 3, ...。AI はヒアリングでユーザに必ず確認し、勝手にデフォルト 1 で進めない
  "artifactId": "any-app",                     // セットアップ XML 格納ディレクトリ名。省略時は pom.xml の <artifactId> → module.xml の <id> のドット末尾 → "key" の順でフォールバック
  "shortName": "app",
  "displayNames": {
    "ja": "Any App",
    "en": "Any App",
    "zh_CN": "Any App"
  },

  // 1. ロール定義
  "roles": [
    {
      "id": "app_manager",                    // ロール ID（短い英数字）
      "name": "any_app_manager",              // ロール名（システム内部名）
      "category": "any_app",                  // ロールカテゴリ
      "displayNames": {
        "ja": "Any App 管理者",
        "en": "Any App Manager",
        "zh_CN": "Any App 管理者"
      }
    }
  ],

  // 2. 認可リソースグループ
  "authzResourceGroups": [
    { "id": "any-app-content-root", "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." } },
    { "id": "any-app-http-services", "parentGroup": "http-services",
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } }
  ],

  // 3. 認可リソース
  "authzResources": [
    {
      "id": "any-app-content-maintenance",
      "uri": "service://any_app/maintenance/content",
      "parentGroup": "any-app-http-services",
      "displayNames": {
        "ja": "Any App コンテンツ管理",
        "en": "Any App Content Maintenance",
        "zh_CN": "Any App 内容管理"
      }
    }
  ],

  // 4. 認可ポリシー（多言語不要）
  //    ※ tenant_manager は全 service リソース・全メニューグループに自動付与されるため記述不要。
  //      それ以外の対象ロール／ユーザのみを記述する（詳細は reference/authz-policy.md「既定ポリシー」）。
  "authzPolicies": [
    { "resource": "any-app-content-maintenance", "type": "service", "action": "execute",
      "subject": "S(b_m_role:app_manager)", "effect": "PERMIT" }
  ],

  // 5. 認可サブジェクトグループ
  "authzSubjectGroups": [
    {
      "sortKey": 900,
      "expression": "S(b_m_role:app_manager)",
      "displayNames": { "ja": "Any App 管理者", "en": "Any App Manager", "zh_CN": "Any App 管理者" }
    }
  ],

  // 6. メニューグループ（任意） — menu-items を items 配列で階層的に記述できる
  "menuGroups": [
    {
      "id": "any_app_sm-pc",                  // 慣例: <key>_sm-pc（サイトマップ PC）
      "sortNumber": 2000,                     // トップフォルダの表示順
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
      "items": [
        { "id": "any_app_home_sm-pc",  "sortNumber": 10, "url": "any_app/home",
          "displayNames": { "ja": "ホーム", "en": "Home", "zh_CN": "首页" } },
        { "id": "any_app_admin_sm-pc", "sortNumber": 100, "type": "folder",
          "displayNames": { "ja": "管理", "en": "Admin", "zh_CN": "管理" },
          "items": [
            { "id": "any_app_admin_users_sm-pc", "sortNumber": 10, "url": "any_app/admin/users",
              "displayNames": { "ja": "ユーザ管理", "en": "User Management", "zh_CN": "用户管理" } }
          ]
        }
      ]
    }
  ],

  // 7. ジョブスケジューラ（任意）
  "jobScheduler": {
    "jobCategory":    { "id": "app-job-category",    "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobnetCategory": { "id": "app-jobnet-category", "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobs": [
      {
        "id": "app-job-sample-batch",
        "type": "JAVA",
        "path": "com.example.any_app.job.SampleBatchJob",
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ],
    "jobnets": [
      {
        "id": "app-jobnet-sample-batch",
        "disallowConcurrent": true,
        "jobs": ["app-job-sample-batch"],
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ]
  },

  // 8. データベース（任意）— DDL は常に 3 方言別、DML は dmlPerDialect で切替
  "database": {
    "tables": [
      { "name": "any_app_data", "comment": "サンプルデータ" }
    ],
    "dmlPerDialect": false                     // false（デフォルト）: DML 一本化 / true: 3 方言別
  },

  // 9. 拡張インポート（任意） — true なら doImport(tenantId) のスケルトン JS を生成
  "extendsImport": true,

  // 9.5. ポートレット登録（任意） — JSSP 画面をポータルのポートレットとして登録する
  //      b_m_portlet_info / b_m_portlet_mode / b_m_portlet_title_info への実 INSERT 文を
  //      <key>_sample-dml.sql に生成する（database が無くてもこれだけで DML ファイルが出力される）
  //      詳細は reference/portlet-import.md 参照
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

  // 10. IM-Workflow インポート（任意） — files に列挙した XML を storage/public/im_workflow/
  //     から storage/system 配下にコピーし、取り込み用の <key>_workflow_import.js を生成
  "workflowImport": {
    "files": [
      "im_workflow-simple_approval-import.xml"
    ]
  },

  // 11. IM-LogicDesigner インポート（任意） — files に列挙した ZIP を storage/public/im_logic/
  //     から storage/system 配下にコピーし、LogicFlowImporter で取り込む <key>_logic_import.js を生成
  "logicImport": {
    "files": [
      "im-logicdesigner-data-sample-simple.zip"
    ]
  }
}
```

各セクションの詳細は `reference/` 配下を参照。

| reference ファイル | 内容 |
|------------------|------|
| [reference/import-config.md](reference/import-config.md) | `import-<artifactId>-config-1.xml` の構造・参照規則 |
| [reference/role.md](reference/role.md) | ロール定義 XML（基底 + 言語別） |
| [reference/authz-policy.md](reference/authz-policy.md) | 認可ポリシー XML（subject の書式・effect） |
| [reference/authz-resource.md](reference/authz-resource.md) | 認可リソース・リソースグループ XML（parent-group, uri） |
| [reference/authz-subject-group.md](reference/authz-subject-group.md) | 認可サブジェクトグループ XML（sort-key, expression） |
| [reference/menu-group.md](reference/menu-group.md) | メニューグループ XML の最小構造 |
| [reference/job-scheduler.md](reference/job-scheduler.md) | ジョブ・ジョブネット定義 XML |
| [reference/extends-import.md](reference/extends-import.md) | `doImport(tenantId)` の実装規約 |
| [reference/portlet-import.md](reference/portlet-import.md) | ポートレット登録（`portletImport.portlets`、`b_m_portlet_*` への DML 生成、対象外項目） |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow インポートの仕組み（`workflowImport.files`、生成 JS の構造、依存順序） |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner インポートの仕組み（`logicImport.files`、`LogicFlowImporter` の Java 直接アクセス） |
| [reference/multi-config.md](reference/multi-config.md) | 複数 config 運用（バージョンアップ / 同一バージョン内 config 追加）の手順・サンプル |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML SQL スケルトンのフォーマット |
| [reference/checklist.md](reference/checklist.md) | 生成後セルフチェック |

### 3. build-setup-import.js を実行

```bash
node .claude/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js \
     <spec.json のパス>
```

`--out` を省略すると、出力先は SKILL.md に記載のデフォルトパスになる。

build-setup-import.js が自動で行うこと:

- 3 ロケール（en / ja / zh_CN）× 各 XML の自動展開
- 名前空間 (`xmlns`) の自動付与
- ロール ID / 認可リソース ID 等の参照整合性チェック（spec 内部で参照されていない ID は警告）
- DDL/DML のスケルトン SQL 生成（テーブル名にコメントのみ）
- `portletImport.portlets` から `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` への実 INSERT 文生成（コメントのみのスケルトンではなく、そのままテナント環境セットアップで投入可能な DML）
- 拡張インポート JS スケルトン生成（`doImport(tenantId)` を空関数で出力）
- IM-Workflow インポート XML のコピー（`storage/public/im_workflow/` → `storage/system/products/import/basic/<key>/<version>/`）と専用 JS（`<key>_workflow_import.js`）生成
- IM-LogicDesigner インポート ZIP のコピー（`storage/public/im_logic/` → `storage/system/products/import/basic/<key>/<version>/`）と専用 JS（`<key>_logic_import.js`）生成（`Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider` 経由）
- `import-<artifactId>-config-1.xml` の自動組み立て（実在する出力ファイルのみ参照、`<extends-import>` には `<extends-import-class>` を複数並べる）

### 4. セルフチェック

生成後は [reference/checklist.md](reference/checklist.md) のセルフチェックリストに沿って確認する。

## 複数 config 運用

`import-<artifactId>-config-N.xml` を 2 つ以上に分けるケースは 2 パターンある。

| パターン | 用途 |
|---|---|
| **(I) バージョンアップ** | `spec.version` を上げて新バージョンディレクトリに差分を追加 |
| **(II) 同一バージョン内 config 追加** | `spec.version` 据え置きで `configNumber` だけ増やし、ファイル名末尾に `-<N>` サフィックスを付与 |

いずれも **既存の config-N.xml には触れず** 新 config を追加する。手順・具体例・差分 spec.json サンプルは [reference/multi-config.md](reference/multi-config.md) を参照。

## 注意事項

- このスキルは **新規アプリのインポート資材一式の生成専用**。既存資材への追記（authz-policy へのエントリ追加など）には向かない（手動編集を推奨）。
- メニューグループ XML の詳細仕様（メニュー項目の階層・リンク種別等）は intra-mart Accel Platform のドキュメントを参照すること。本スキルは最小構造の枠だけ生成する。
- 認可ポリシーの `subject` 式（`S(b_m_role:...)` 等）は **build スクリプトが内容検証を行わない**。spec.json に書いた文字列がそのまま出力される。書式は [reference/authz-policy.md](reference/authz-policy.md) を必ず確認すること。
- 拡張インポート JS（`doImport(tenantId)`）の中身は空スケルトン。実装内容はユーザが個別に追記する。実装規約は [reference/extends-import.md](reference/extends-import.md) 参照。

## 棲み分け

| スキル | 用途 |
|--------|------|
| **jssp-tenant-setup-generator**（本スキル） | テナント環境セットアップ資材一式（Importer 形式）の生成 |
| jssp-im-workflow-generator | IM-Workflow のワークフロー定義 XML の生成 |
| jssp-im-logic-generator | IM-LogicDesigner のフロー定義 JSON の生成 |
| jssp-page-generator | 画面・ファンクションコンテナの生成 |
| jssp-im-job-generator | ジョブプログラム（バッチ処理）本体の実装 |

**ジョブスケジューラに関する棲み分け:**
本スキルが生成するのは `<key>-job-scheduler.xml`（ジョブ・ジョブネットの定義 XML）のみ。
ジョブの**実装本体**（`jp.co...` の Java クラスや、`.js` のジョブプログラム）は `jssp-im-job-generator` を使うこと。
