# 認可ポリシー XML 仕様

「誰が、何のリソースに対して、どのアクションを実行できるか」を定義する。**多言語版は持たない**。

## 名前空間

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/policy">
  ...
</root>
```

## 構造

```xml
<authz-policy resource="any-app-content-maintenance"
              type="service"
              action="execute"
              subject="S(b_m_role:tenant_manager)">PERMIT</authz-policy>
```

| 属性 | 必須 | 内容 |
|------|------|------|
| `resource` | YES | リソース ID（`authz-resource` で定義した `id` 属性）または、リソースのハッシュ値 |
| `type` | YES | リソース種別。下表参照 |
| `action` | YES | アクション名。下表参照 |
| `subject` | YES | 対象主体の式（次節） |
| 要素本文 | YES | `PERMIT`（許可）または `DENY`（拒否） |

### type と action の対応

本プロジェクトで使用する type は以下のとおり。

| type | 用途 | 典型的な action |
|------|------|----------------|
| `service` | 画面・API・ジョブ等の HTTP / 内部サービス（authz-resource で URI を `service://...` で定義） | `execute` |
| `im-menu-group` | メニューグループ（resource にはメニューグループ ID のハッシュ値を指定） | `read` |
| `im-logic-rest` | IM-LogicDesigner のルーティング（REST API エンドポイント）。`flow_route.json` の `authzUri`（例: `im-logic-rest://<flowId>`）に対する認可。resource には authzUri 文字列の **SHA-256 ハッシュ（16 進 lowercase）** を指定する。詳細は [logic-import.md](logic-import.md#ルーティング向け認可ポリシーの投入順序) を参照 | `execute` |

## subject 式の書式

基本形:

```
S(<provider>:<value>)
```

論理演算子で組合せ可能（関数呼び出し風シンタックス）:

```
AND(S(...), S(...), ...)   論理積
OR(S(...), S(...), ...)    論理和
NOT(S(...))                否定
```

ネスト可。例: `AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))`

### provider 一覧

| provider | 値の形式（引数数） | 例 |
|----------|------------------|-----|
| `im_authz_meta_subject` | メタ識別子（1） | `S(im_authz_meta_subject:authenticated)`（認証済みユーザ）<br>`S(im_authz_meta_subject:anonymous)`（ゲストユーザ） |
| `b_m_role` | ロール ID（1） | `S(b_m_role:tenant_manager)` |
| `imm_user` | IM-共通マスタのユーザコード（1） | `S(imm_user:aoyagi)` |
| `imm_department` | IM-共通マスタの組織（4）<br>`<会社> <組織セット> <組織> <カテゴリ>` | `S(imm_department:comp_sample_01 comp_sample_01 dept_other_11 le)` |
| `imm_company_post` | IM-共通マスタの会社役職（4）<br>`<会社> <組織セット> <役職> <カテゴリ>` | `S(imm_company_post:comp_sample_01 comp_sample_01 ps001 eq)` |
| `imm_public_grp` | IM-共通マスタのパブリックグループ（3）<br>`<パブリックグループセット> <パブリックグループ> <カテゴリ>` | `S(imm_public_grp:sample_public public_group_a eq)` |
| `imm_public_grp_role` | パブリックグループ内ロール（3）<br>`<パブリックグループセット> <ロールID> <カテゴリ>` | `S(imm_public_grp_role:sample_public 8hys58zblgeo1qh eq)` |

### カテゴリ値（最終引数の比較演算子）

`imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role` の最終引数は、組織階層に対する比較演算子:

| 値 | 意味 |
|---|---|
| `eq` | equal（指定組織と一致するもののみ） |
| `lt` | less than（上位組織、自身を除く） |
| `le` | less than or equal（上位組織 + 自身） |
| `gt` | greater than（下位組織、自身を除く） |
| `ge` | greater than or equal（下位組織 + 自身） |

例: 部署 `dept_other_11` 配下の全員を対象としたい場合は `ge`、自身のみは `eq`、配下のみ（自身は除く）は `gt`。

### 「会社」単位の subject 指定

intra-mart の組織体系では「会社」は組織ツリーのトップレベルとして扱われる。会社全体を対象とした subject 式は専用 provider ではなく、`imm_department` で表現する:

```
S(imm_department:<会社コード> <会社コード> <会社コード> le)
```

第 2 引数（組織セットコード）と第 3 引数（組織コード）に会社コードと同じ値を入れ、カテゴリ `le` で「指定組織 + 上位」を表す（会社はトップなので、結果として会社配下の全組織が対象）。

実例:

```
S(imm_department:comp_sample_01 comp_sample_01 comp_sample_01 le)   # サンプル会社
S(imm_department:comp_other_01 comp_other_01 comp_other_01 le)      # その他会社
```

### 複合式の実例

```
# account_manager ロール持ちで、ユーザ aoyagi を除外
AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))

# ueda または aoyagi のいずれか
OR(S(imm_user:ueda), S(imm_user:aoyagi))

# 組織階層の複合条件（上位～下位を AND で組合せ）
AND(
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 lt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 le),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 gt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 ge)
)
```

### intra-mart 標準で登録済みのロール（`b_m_role`）

テナント環境セットアップ時にデフォルトで存在し、追加定義なしで subject 式に使えるロール。

| ロール ID | 用途 |
|---|---|
| `tenant_manager` | テナント管理者（全権限） |
| `authz_manager` | 認可 管理者 |
| `menu_manager` / `menu_operator` | メニュー 管理者 / 運用管理者 |
| `account_manager` | アカウント管理者 |
| `role_manager` | ロール管理者 |
| `calendar_manager` | カレンダー管理者 |
| `job_sche_manager` | ジョブスケジューラ管理者 |
| `im_master_manager` / `im_master_operator` | IM共通マスタ 管理者 / 運用管理者 |
| `portal_manager` / `imprtl_manager` / `imprtl_prlt_manager` | ポータル系管理者 |
| `im_workflow_manager` / `im_workflow_operator` / `im_workflow_auditor` / `im_workflow_user` | IM-Workflow 系 |
| `imld_manager` | IM-LogicDesigner 管理者 |
| `imbm_manager` | IM-BloomMaker 管理者 |
| `imr_manager` / `imr_log_manager` | IM-Repository 系 |
| `viewcreator_manager` / `tablemainte_manager` / `file_exc_manager` | ユーティリティ系 |
| `accel_studio_manager` | Accel Studio 管理者 |
| その他: `ticket_manager`, `im_knowledge_manager`, `im_knowledge_user`, `forma_app_manager`, `forma_app_creator`, `bis_manager`, `bis_business_manager`, `bis_auditor`, `bis_user`, `bis_ws_imw_user`, `forma_ws_imw_user` | 製品固有ロール |

これらは `<key>-role.xml` で定義しなくてもそのまま subject 式に使える。新規ロール（例: `equip_admin`）を使う場合は `<key>-role.xml` で定義が必要。

## spec.json での記述

```json
"authzPolicies": [
  {
    "resource": "any-app-content-maintenance",
    "type": "service",
    "action": "execute",
    "subject": "S(b_m_role:tenant_manager)",
    "effect": "PERMIT"
  },
  {
    "resource": "any-app-search-master",
    "type": "service",
    "action": "execute",
    "subject": "S(im_authz_meta_subject:authenticated)",
    "effect": "PERMIT"
  }
]
```

`effect` 省略時は `PERMIT` 扱い。

## 既定ポリシー（テナント管理者の自動付与）

**テナント管理者（`tenant_manager`）は暗黙のデフォルトとして、全 service リソースと全メニューグループに必ず PERMIT で許可される。**

`build-setup-import.js` が以下を**自動付与**する（生成 XML 末尾に `<!-- 既定ポリシー: ... -->` コメント付きで出力）。

| 対象 | 自動付与されるポリシー |
|------|----------------------|
| `spec.authzResources` の各 service リソース | `type="service" action="execute" subject="S(b_m_role:tenant_manager)"` PERMIT |
| `spec.menuGroups` の各メニューグループ | `type="im-menu-group" action="read" subject="S(b_m_role:tenant_manager)"` PERMIT（`resource` はメニューグループ ID のハッシュ） |

- そのため `authzPolicies` に `tenant_manager` を**明示的に書く必要はない**（service・メニューグループとも）。書いても同一 (resource, type, tenant_manager) は二重出力されない。
- `tenant_manager` 以外のロール／ユーザは、**設計書・プロンプトで明示された場合のみ** `authzPolicies` に記述して付与する。
- 運用上、テナント管理者がトラブル時に常に介入できる状態を保証するための規約である。

## メニューグループへの認可

`type="im-menu-group"` の場合、`resource` には **メニューグループ ID のハッシュ値** を指定する。intra-mart の認可リソース ID は以下のロジックで計算される:

```
SHA-256("im-menu-group://menugroups/" + <menu-group-data の id>)
```

例: `equip_sm-pc` の場合 → SHA-256(`"im-menu-group://menugroups/equip_sm-pc"`) = `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

```xml
<authz-policy resource="df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

### spec.json での自動化

build スクリプトは以下のプレースホルダを認識し、自動でハッシュ値に展開する:

| プレースホルダ | 動作 |
|---|---|
| `REPLACE_WITH_MENU_GROUP_HASH` | `spec.menuGroups[0].id` から自動計算 |
| `REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>` | 明示指定の id から計算（複数メニューグループ対応） |

```jsonc
"authzPolicies": [
  { "resource": "REPLACE_WITH_MENU_GROUP_HASH", "type": "im-menu-group", "action": "read",
    "subject": "S(b_m_role:equip_admin)", "effect": "PERMIT" }
]
```

## IM-LogicDesigner ルーティングへの認可

`type="im-logic-rest"` の場合、`resource` には **ルーティング `authzUri` 文字列の SHA-256 ハッシュ（16 進 lowercase）** を指定する。

```
SHA-256(<flow_route.json の authzUri>)
```

例: `flow_route.json` に `"authzUri": "im-logic-rest://sample_simple"` がある場合 → SHA-256(`"im-logic-rest://sample_simple"`) = `d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62`

```xml
<authz-policy resource="d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
              type="im-logic-rest" action="execute"
              subject="S(im_authz_meta_subject:authenticated)">PERMIT</authz-policy>
```

`type` を `service` にすると、リソースが `im-logic-rest` 名前空間に登録されているためポリシーが実リソースに紐付かず、**Importer 実行時にサイレントに無視される**（エラーは出ないが認可が効かない）ので注意。

なお、このリソースは `logicImport` の拡張インポート JS が走った時点で初めて登録されるため、**同じ config-N.xml の `<authz-policy-file>` で参照するとリソース未登録のまま投入されて無効化される**。ルーティング向けポリシーは別 `configNumber` に分離する必要がある。運用手順は [logic-import.md](logic-import.md#ルーティング向け認可ポリシーの投入順序) を参照。

## ベストプラクティス

- 単純なケース（特定ロールへの許可）は 1 リソース 1 行ずつ列挙する。`AND` / `OR` / `NOT` は **複雑な条件（特定ユーザの除外、組織階層フィルタ等）の場合のみ** 使う
- `tenant_manager` は全 service リソース・全メニューグループに自動付与される（前節「既定ポリシー」参照）。`authzPolicies` に明示的に書く必要はなく、**それ以外の対象ロール／ユーザのみを記述**する
- `authenticated`（認証済全ユーザ）に許可するのは、検索系・選択系の軽量サービスに限定する
- 組織階層を対象に絞り込む場合、`ge`（自身+配下）の使用が最も一般的。階層の境界条件（含む/含まない）を意識して `eq` / `lt` / `le` / `gt` / `ge` を使い分ける

## 制限事項

以下は intra-mart の認可サブジェクト DSL の制限事項として把握しておくこと:

- **サブジェクトグループの参照不可**: `authz-subject-group.xml` で定義したグループ自体を subject 式で参照することはできない。同じ条件を複数の認可ポリシーで使いたい場合も、各 `authz-policy` の `subject` に `S(...)` 式を **毎回そのまま書く** 必要がある（DRY 違反だが仕様）
- **IM-共通マスタ系 provider は固定**: provider 一覧（`imm_user` / `imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role`）以外の IM-共通マスタを subject 式で指定する手段は **存在しない**。例えば「特定の職位コードを直接指定」「兼任関係を条件にする」等は不可
- **会社単位の指定は専用 provider なし**: 会社全体を対象にする場合は `imm_department` で `<会社コード> <会社コード> <会社コード> le` の形を使う（前節「『会社』単位の subject 指定」参照）。`imm_company` のような専用 provider は無い
