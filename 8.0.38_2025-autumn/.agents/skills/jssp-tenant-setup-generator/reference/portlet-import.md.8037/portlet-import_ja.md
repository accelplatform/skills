# ポートレット登録（`portletImport`）

## 概要

JSSP のプレゼンテーションページをポータル画面のポートレット（部品）として登録するための、intra-mart 標準テーブル（`b_m_portlet_*`）への DML を生成する仕組み。

ポートレットの登録は通常ポータル管理画面から手動で行うが、その際に投入される DB レコードは以下の3テーブルに分散する。

| テーブル | 内容 |
|---------|------|
| `b_m_portlet_info` | ポートレット本体（表示するプレゼンテーションページのパス等） |
| `b_m_portlet_mode` | ポートレットの動作モード（`portlet_mode` は `EDIT` 固定。実際の表示・編集可否は `user_flag` で切り替える） |
| `b_m_portlet_title_info` | 表示名（`name`）・アプリケーション名（`application`）・説明（`description`）× ja/en/zh_CN |

`build-setup-import.js` は `spec.json` の `portletImport.portlets` からこれら3テーブルへの **実際に動作する INSERT 文**（`equip-ddl.sql` のようなコメントのみのプレースホルダではない）を生成し、`<key>_sample-dml.sql` に出力する。また、`editable`（後述）の値に応じて **テナント管理者への表示・編集権限の認可ポリシー**（`<key>-authz-policy.xml`）も自動生成する。

## スコープ外: ポータルへの配置・表示設定

以下の2テーブルは **対象外**。ポートレットを「どのポータルの何列何行目に、どんな表示（ウィンドウ状態）で置くか」という **ポータル運用側の設定**であり、ポートレット自体の定義とは性質が異なるため、テナント環境セットアップの一律 DML には含めない。

- `b_m_portlet_layout`（ポータルへの配置位置）
- `b_m_portlet_display_set`（ウィンドウ表示設定）

ポータルへの配置が必要な場合は、テナント環境セットアップ後にポータル管理画面から手動で行うこと。

## ポートレットにルーティング設定・ルーティング認可は不要

ポートレットとして表示する JSSP プレゼンテーションページは、`b_m_portlet_info.path` からポータル機能によって直接呼び出され、通常の画面のような `routing-jssp-config/` のルーティングテーブルを経由しない。そのため、`file-mapping` / `<authz uri="service://...">` によるルーティング設定・ルーティング認可は**作成しないこと**。アクセス制御は本 reference が扱う `im-portal-portlet` / `im-portal-portlet-editmode` の認可ポリシーのみで行う。詳細は `.agents/skills/jssp-page-generator/assets/simple-portlet.md` および `.agents/requirements/jssp-file-structure/AGENTS.md` の「ルーティングテーブル経由で呼ばれない画面の例外規約」を参照。

## spec.json の構造

```jsonc
"portletImport": {
  "portlets": [
    {
      "portletCd": "portlet_sample",              // ポートレット CD（英数字・アンダースコアの一意な ID。既存 CD と重複させない）
      "path": "portlet_sample/view/index",         // 表示するプレゼンテーションページ（src/main/jssp/src/ からの相対パス、拡張子なし）
      "pageParam": "test=1",                       // 任意。ポートレットに渡す固定パラメータ（page_param）。不要なら省略可
      "portletModeCd": "portlet_sample_mode",       // 任意。省略時は "<portletCd>_mode" を自動生成
      "editable": false,                            // 任意。false（既定）: 表示のみ / true: 表示・編集可（後述「表示・編集権限の切り替え」参照）
      "titles": {
        "name":        { "ja": "サンプルポートレット", "en": "Sample Portlet", "zh_CN": "示例 Portlet" },
        "application": { "ja": "サンプルアプリケーション", "en": "Sample Application", "zh_CN": "示例 Application" },
        "description": { "ja": "説明", "en": "Description", "zh_CN": "说明" }
      }
    }
  ]
}
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `portletCd` | YES | ポートレットの一意な CD。テナント内で重複しない英数字・アンダースコアの ID を指定する。**intra-mart 標準の `b_m_portlet_info.portlet_cd` は VARCHAR(20) のため 20 文字以内**にすること（超過するとテナント環境セットアップのインポート時に `値は型character varying(20)としては長すぎます` で失敗する。`build-setup-import.js` は超過時にビルド時点でエラーにする） |
| `path` | YES | ポートレットとして表示する JSSP プレゼンテーションページのパス（ルーティング設定の `page` 属性と同じ形式） |
| `pageParam` | NO | ポートレットの `init(request)` に渡す固定クエリパラメータ文字列。省略時は空文字列 |
| `portletModeCd` | NO | `b_m_portlet_mode` の CD。省略時は `<portletCd>_mode`。こちらも `b_m_portlet_mode.portlet_mode_cd` が VARCHAR(20) のため **20 文字以内**が必須（`<portletCd>_mode` は `_mode` の5文字が加わるため、`portletCd` は 15 文字以内にしておくと安全） |
| `editable` | NO | `false`（既定）: 表示のみ（作成者以外は編集不可） / `true`: 表示・編集可。詳細は「表示・編集権限の切り替え」を参照 |
| `titles.name` | YES（3ロケール） | ポートレットの表示名（ヘッダに表示されるタイトル） |
| `titles.application` | YES（3ロケール） | ポートレットのカテゴリ名（ポートレット追加ダイアログでの分類名） |
| `titles.description` | YES（3ロケール） | ポートレットの説明文 |

## 生成される DML の固定値

本仕組みは **JSSP プレゼンテーションページをそのまま表示するポートレット**（`imart.PresentationPagePortlet`）専用。以下の値は固定で出力され、spec.json からは変更できない。

| カラム | 固定値 | 備考 |
|--------|--------|------|
| `producer_id` | 空文字列 | |
| `page_kind` | `pagebase` | JSSP ページベース固定 |
| `menulinkset_cd` | 空文字列 | |
| `application_id` / `service_id` | 空文字列 | JavaEE フレームワークポートレット等、他タイプは対象外 |
| `sso_flag` | `0` | |
| `title_bar_flag` | `1` | タイトルバー表示 |
| `cache_config` | `0` | |
| `entity_id_prefix` | `imart\|PresentationPagePortlet` | |
| `open_flag` / `user_portal_flag` / `group_portal_flag` | `1` | ユーザポータル・グループポータル両方で使用可能 |
| `portlet_height` | `-1` | 自動調整 |
| `rec_user_cd` | `system` | |
| `rec_date` | ビルド実行時刻 | `build-setup-import.js` 実行時の日時。**`rec_date` は timestamp 型ではなく varchar 型で、`yyyy/MM/dd\|HH:mm:ss` 固定フォーマット**（標準 SQL の日時リテラルではない点に注意） |
| `portlet_mode`（`b_m_portlet_mode`） | `EDIT` | intra-mart 側の固定値 |
| `access_check_flag`（`b_m_portlet_mode`） | `0` | |

`user_flag`（`b_m_portlet_mode`）のみ `editable` から可変（詳細は次節）。

他タイプのポートレット（JavaEE フレームワークポートレット、RSS ポートレット等）や、ポータルへの配置まで含めた完全自動化が必要な場合は、本仕組みの対象外。手動で DML を追記するか、ユーザに個別相談すること。

## 表示・編集権限の切り替え（`editable`）

ポートレットの「誰が表示・編集できるか」は `b_m_portlet_mode.user_flag` と、認可ポリシー（`type="im-portal-portlet"` / `type="im-portal-portlet-editmode"`）の組み合わせで制御される。

認可ポリシー・認可リソース（`im-portal-portlet` / `im-portal-portlet-editmode` の両方）は **`editable` の値に関わらず常に生成される**。`editable` が左右するのは `b_m_portlet_mode.user_flag`（実際に編集操作自体が許可されるか）のみである。こうしておくことで、後から `editable` を `false` → `true` に切り替えても認可資材の再生成が不要になる（テナント管理者は最初から編集権限ポリシーを持っているが、`user_flag=0` の間はポートレット自体が表示専用モードのため編集操作がブロックされる）。

| `editable` | `user_flag` | 意味 | 生成される認可ポリシー・認可リソース |
|---|---|---|---|
| `false`（既定） | `0` | 表示のみ。ポートレット自体が編集不可モード | `im-portal-portlet` / `im-portal-portlet-editmode` の両方をテナント管理者に `PERMIT`（ただし `user_flag=0` のため編集操作は実行できない） |
| `true` | `1` | 表示・編集の両方が可能 | 同上（`im-portal-portlet` / `im-portal-portlet-editmode` の両方をテナント管理者に `PERMIT`） |

### 認可リソース ID（ハッシュ値）の計算方法

`im-portal-portlet` / `im-portal-portlet-editmode` の `resource` 属性は、ポートレット CD から計算される SHA-256 ハッシュ値であり、人間が読める ID ではない。intra-mart は内部で以下の base 文字列をハッシュ化している。

```
表示権限: sha256("im-portal-portlet://" + portletCd)
編集権限: sha256("im-portal-portlet-editmode://" + portletCd)
```

`build-setup-import.js` はこの計算を `computePortletViewHash(portletCd)` / `computePortletEditHash(portletCd)` として実装しており、`editable` の値に応じて `<key>-authz-policy.xml` に既定ポリシー（テナント管理者への `PERMIT`）として自動出力する（`spec.menuGroups` の既定ポリシー自動付与と同じ仕組み）。テナント管理者以外のロール・ユーザにも権限を与えたい場合は、`spec.authzPolicies` に `type: "im-portal-portlet"` または `type: "im-portal-portlet-editmode"`、`resource` に上記ハッシュ値を明示的に指定すること（ハッシュ値は `node -e "console.log(require('crypto').createHash('sha256').update('im-portal-portlet://' + '<portletCd>').digest('hex'))"` 等で計算できる）。

### 認可リソース（`<key>-authz-resource.xml`）の自動生成

`authz-policy` は id を持たず、`resource` 属性に上記ハッシュ値を直接書く方式のため、**そのままでは管理画面の認可リソースツリーにこのポートレットが表示されない**（ポリシーだけが宙に浮いた状態になる）。そのため `build-setup-import.js` は `portletImport.portlets` から、対応する `authz-resource` エントリも `<key>-authz-resource.xml`（+ 言語別ファイル）へ自動出力する。

- `id` 属性は `authz-policy` の `resource` 属性と**必ず同じハッシュ値**にする（人間可読な id にすると authz-policy 側と一致せず、リソースとポリシーが紐付かない）
- `uri` 属性は `im-portal-portlet://<portletCd>` / `im-portal-portlet-editmode://<portletCd>`
- `<parent-group>` は intra-mart 標準の組み込みグループ `im-portal-portlet` / `im-portal-portlet-editmode` を指定する（`authzResourceGroups` での事前定義は不要。`http-services` と同様に最初から存在する前提）
- 表示名は `titles.application` の値をそのまま使用し、編集モード側はロケールごとの接尾辞（`ja`: `（編集モード）` / `en`: ` (Edit Mode)` / `zh_CN`: `（编辑模式）`）を付与する
- `editable !== true` の場合は表示権限用のリソースのみ、`editable === true` の場合は編集権限用のリソースも追加で出力される
- `spec.authzResources` が空でも、`portletImport.portlets` があれば `<key>-authz-resource.xml`（+ 言語別ファイル）が生成され、`import-<artifactId>-config-1.xml` の `<tenant-master>` にも `<authz-resource-file>` として自動で組み込まれる

なお [reference/authz-resource.md](authz-resource.md) の「本プロジェクトでは `service://` のみ使用する」という制約は、`spec.authzResources`（ユーザが手で書く認可リソース）に対するものであり、この `portletImport` 由来の自動生成リソース（`im-portal-portlet(-editmode)://` スキーム）はその対象外の特例である。

## 出力ファイルへの統合

`portletImport` は既存の `database`（独自テーブルの DDL/DML）セクションと同じ `<key>_sample-dml.sql` に出力される。`spec.database` が無くても `portletImport` だけで DML ファイルが生成され、`import-<artifactId>-config-1.xml` の `<database><insert-file>` にも自動で組み込まれる。DDL（`<key>-ddl_*.sql`）は独自テーブル用の仕組みのため、`portletImport` のみの場合は生成されない。
