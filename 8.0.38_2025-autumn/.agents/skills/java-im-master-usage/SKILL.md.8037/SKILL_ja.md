---
name: java-im-master-usage
description: intra-mart 固有の IM-共通マスタ API（`UserManager`/`CompanyManager`/グループ系4クラス（`Public|Private|Company|Corporation`）/`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`、いずれも `jp.co.intra_mart.foundation.master.*`、`im_master-main` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。ユーザ・会社・組織・組織セット・役職・ユーザ組織所属、パブリック/プライベート/会社/法人グループ、法人・取引先・品目カテゴリ・品目・通貨（`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate` 含む）の取得・検索・新規登録・更新・削除、組織/パブリックグループ/品目カテゴリの階層（ツリー）取得、ユーザ分類・パブリックグループ分類・組織分類（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg` 等）の取得の実装パターンを提供する。Java でユーザ・会社・組織・グループ・法人・取引先・品目・通貨の基本情報を扱いたい、上記いずれかのManagerクラスを使いたい、JavaEE 開発モデルで IM-共通マスタの CRUD を実装したい、組織階層やグループ階層・品目カテゴリ階層を取得したい、と言及されたときに使用。ユーザプロファイル画像は `java-im-profile-usage`、ロール定義・ロール割当は `java-im-role-usage`/`java-im-account-usage`、認可は `java-im-authz-usage` を使うこと。
---

# intra-mart IM-共通マスタ API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの IM-共通マスタ API を使い、Java コードでユーザ・会社・組織・役職・パブリック/プライベート/会社/法人グループの基本情報を CRUD・検索するためのスキルセット。

## クラス構成（最重要）

**「会社」「組織」「役職」「ユーザの組織所属」は、すべて `CompanyManager` 1クラスが扱う。** `DepartmentManager`/`OrganizationManager` に相当する別クラスは存在しない（`jp.co.intra_mart.foundation.master.*` 配下の `*Manager` を全数確認して判明した事実）。一方、**グループ系はグループ種別ごとに専用のマネージャクラスが1つずつ存在する**（`CompanyManager` のように複数対象を1クラスが兼務する構造ではない）。

| 対象 | 担当クラス | パッケージ | モデルクラス |
|---|---|---|---|
| ユーザ情報 | `UserManager` | `jp.co.intra_mart.foundation.master.user` | `User`（+ 分類区分 `UserCtg`/`UserCtgItm`） |
| 会社 | `CompanyManager` | `jp.co.intra_mart.foundation.master.company` | `Company`（会社コード・ソートキーのみ。**多言語名称を持たない。Java API からは新規作成不可**） |
| 組織・組織セット | `CompanyManager` | 同上 | `Department`/`DepartmentSet`（+ 組織カテゴリ `DepartmentCtg`/`DepartmentCtgItm`） |
| 役職 | `CompanyManager` | 同上 | `CompanyPost` |
| ユーザの組織所属（主所属フラグ付き） | `CompanyManager`（`setUserAttach`/`removeUserAttach`） | 同上 | 専用モデルなし |
| パブリックグループ | `PublicGroupManager` | `jp.co.intra_mart.foundation.master.public_group` | `PublicGroup`（+ グループセット `PublicGroupSet`、分類 `PublicGroupCtg`/`PublicGroupCtgItm`、ロール `PublicGroupRole`） |
| プライベートグループ | `PrivateGroupManager` | `jp.co.intra_mart.foundation.master.private_group` | `PrivateGroup` |
| 会社グループ | `CompanyGroupManager` | `jp.co.intra_mart.foundation.master.company_group` | `CompanyGroup`（+ グループセット `CompanyGroupSet`） |
| 法人グループ | `CorporationGroupManager` | `jp.co.intra_mart.foundation.master.corporation_group` | `CorporationGroup`（+ グループセット `CorporationGroupSet`） |
| 法人 | `CorporationManager` | `jp.co.intra_mart.foundation.master.corporation` | `Corporation`（+ 取引先との所属関係）。**`CorporationGroupManager`（法人グループ）とは別クラス** |
| 取引先 | `CustomerManager` | `jp.co.intra_mart.foundation.master.customer` | `Customer`。CRUD・検索メソッド名がエンティティ名を含まない汎用名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`） |
| 品目カテゴリ | `ItemCategoryManager` | `jp.co.intra_mart.foundation.master.item_category` | `ItemCategory`（+ セット `ItemCategorySet`、階層ツリー、品目との所属関係）。メソッド名は `Category` 表記 |
| 品目 | `ItemManager` | `jp.co.intra_mart.foundation.master.item` | `Item`。`CustomerManager` と同型の汎用メソッド名 |
| 通貨 | `CurrencyManager` | `jp.co.intra_mart.foundation.master.currency` | `Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`（期間管理は `CurrencyRate` のみ） |

いずれのクラスも `im_master-main` モジュールに属し `AbstractManager` を継承する。「法人グループ」に相当する別名クラス（`HoldingGroup` 等）は存在せず、`CorporationGroupManager`/`CorporationGroup` が該当する。

**`Company`/`DepartmentSet` は `updateCompany`/`updateDepartmentSet` を持つが、これらは既存レコードの更新専用であり、`CompanyManager`（Java API）だけでは新規作成できない。** 標準実装は対象コードを条件とした SQL `UPDATE` のみを発行し、対象が存在しない場合は例外を送出せず何も更新せずに終了する。新規の会社・組織セットは `importData` またはテナントセットアップ資材経由での投入が前提となる。一方 `User`/`Department`/`CompanyPost`/ユーザ組織所属は、いずれも `set*` メソッド1つで「期間コード（`termCd`）の有無」により新規登録・更新を自動判定する共通パターンを採用しており、これらは Java API から新規登録できる。**新規作成の可否がエンティティによって異なる点を認識した上で実装すること。**

**グループ系4クラスの API 規模・機能範囲は大きく異なる。**

- **パブリックグループ（`PublicGroupManager`）が4クラス中で最大のAPI。** グループ本体・グループセットに加え、分類（カテゴリ・カテゴリ項目）・ロールの管理機能、および `getTree`/`getBranch`/`getChildren`/`getParent`/`getAbsoluteXxx` 系のツリー操作を持つ。他の3クラスにはカテゴリ・ロール管理機能は存在しない
- **会社グループ・法人グループ（`CompanyGroupManager`/`CorporationGroupManager`）は同系統の中規模API。** グループ・グループセットの CRUD・検索・期間操作（`moveTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`/`separateTerm*`）を持つ
- **法人グループのモデル（`CorporationGroup`/`ICorporationGroupBizKey` 等）は会社グループとほぼ同型だが、`companyCd`（会社コード）を追加で保持する点が差分。** `CorporationGroupManager#getCorporationGroupSetAll()` には引数なし版と `(String companyCd)` 版（指定会社に属するグループセットのみ取得）の2種類が存在する
- **プライベートグループ（`PrivateGroupManager`）が4クラス中で最も小規模なAPI。** カテゴリ・ロール・ツリー機能を持たず、グループ本体の CRUD・検索とユーザとの紐付け（`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` 系）が主眼

**法人・取引先・品目カテゴリ・品目・通貨の5クラスも、それぞれ独立した API 規模を持つ。**

- **品目カテゴリ（`ItemCategoryManager`）が5クラス中で最大のAPI。** カテゴリ本体・カテゴリセットに加え、`Department`/`CorporationGroup` と同型の階層（ツリー）操作、品目とのクロス検索群を持つ（`ItemCategoryManager.java` 単体で4,800行超）
- **法人（`CorporationManager`）・取引先（`CustomerManager`）・品目（`ItemManager`）は分類・ツリー機能を持たない単純な CRUD 構成。** 法人のみ取引先との所属関係（`setCorporationAttach` 等）を追加で持つ
- **取引先・品目は CRUD・検索メソッド名がエンティティ名を含まない汎用名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`）であり、`search`/`list`/`count`/`total` の第一引数が `companyCd`（会社スコープ）である。** `UserManager`/`CompanyManager` 等の命名規則と異なる点に注意
- **通貨（`CurrencyManager`）は4種のエンティティ（`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）を1クラスで扱う。** うち期間管理（`ITerm`）を持つのは `CurrencyRate` のみで、他の3種は `set*` が `void` を返す単純な upsert

分類区分（`UserCtg`/`UserCtgItm`・`PublicGroupCtg`/`PublicGroupCtgItm`・`DepartmentCtg`/`DepartmentCtgItm`）は、それぞれ `UserManager`/`PublicGroupManager`/`CompanyManager` に含まれる機能であり、独立したマネージャクラスは存在しない。`UserCtg`/`PublicGroupCtg` のビジネスキーは分類コードのみだが、**`DepartmentCtg`/`DepartmentCtgItm` のみ `companyCd` を含む（組織カテゴリは会社単位でスコープされる）**。

詳細な属性シグネチャ・全メソッド一覧は `reference/` 配下の各クラス専用リファレンスを必ず参照すること（記憶や推測で書かない。合計14クラス超の非常に大きな API のため、思い込みで実装しない）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.agents/requirements` 配下には IM-共通マスタ実装を定めた Java 向け専用規約は存在しない。例外処理・多言語情報の登録手順は `assets/user-master-basic-usage.md`、グループ系の例外処理・検索条件の組み立て方は `assets/group-master-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

`UserManager`/`CompanyManager` はいずれも `im_master-main` モジュールに属し、`AbstractManager` を継承する。コンストラクタは `UserManager()`/`CompanyManager()` を既定とし、更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値が使われる。両クラスの public メソッドはほぼすべて検査例外 `jp.co.intra_mart.foundation.exception.BizApiException` を宣言する。

グループ系4クラス（`PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager`）も同じく `im_master-main` モジュールに属し `AbstractManager` を継承する。共通して4種のコンストラクタ（`()` / `(String updateUserCd)` / `(String updateUserCd, Locale defaultLocale)` / `(String updateUserCd, Locale defaultLocale, String loginGroupId)`。4番目は `@Deprecated`）を持ち、引数省略時は「現在ログイン中のユーザ」の値が使われる。全メソッドがほぼ一貫して `BizApiException` を宣言する。**単体取得系（`get*`）はグループ系では対象が存在しない場合に例外を送出せず `null` を返す。** `count*`/`search*`/`list*` は `AppCmnSearchCondition`・基準日（`Date`）・`Locale` を条件として受け取る。`importData`/`exportData`/`getImportCategories`/`getExportCategories` を全グループクラスが持つ。

法人・取引先・品目カテゴリ・品目・通貨の5クラス（`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`）も同じ4種のコンストラクタパターン・`BizApiException` 宣言・`get*` の `null` 返却・`importData`/`exportData` を踏襲する。

詳細は `reference/` 配下の各リファレンスを参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| ユーザの取得 | `assets/user-master-basic-usage.md` パターン1 | `getUser` の呼び出し例 |
| ユーザの検索（キーワード・ページング） | `assets/user-master-basic-usage.md` パターン2 | `AppCmnSearchCondition`/`ImmUserColumn` を使った `listUser` |
| ユーザの新規登録・更新 | `assets/user-master-basic-usage.md` パターン3 | `setUser`（`termCd` 有無による自動判定、新規登録時の `startDate`/`endDate` 必須設定）、多言語情報の登録手順 |
| 会社の取得・更新 | `assets/user-master-basic-usage.md` パターン4 | `getCompany`/`updateCompany`（更新専用。新規作成は不可なことに注意） |
| 組織の新規登録・更新、階層取得 | `assets/user-master-basic-usage.md` パターン5 | `setDepartment`、`getTree`（`DepartmentSet` は事前に作成済みである必要あり） |
| ユーザの組織所属（主所属フラグ） | `assets/user-master-basic-usage.md` パターン6 | `setUserAttach`/`removeUserAttach`（`term` 引数に `null` 不可） |
| 役職の新規登録・更新 | `assets/user-master-basic-usage.md` パターン7 | `setCompanyPost`（新規登録時の `startDate`/`endDate` 必須設定） |
| パブリックグループの取得・検索 | `assets/group-master-basic-usage.md` パターン1 | `getPublicGroup`/`searchPublicGroup` の呼び出し例 |
| パブリックグループの階層（ツリー）取得 | `assets/group-master-basic-usage.md` パターン2 | `getTree`/`getBranch` |
| プライベートグループの新規登録・ユーザ紐付け | `assets/group-master-basic-usage.md` パターン3 | `setPrivateGroup`/`setUserAttach`/`removeUserAttach` |
| 会社グループの取得・検索 | `assets/group-master-basic-usage.md` パターン4 | `getCompanyGroup`/`searchCompanyGroup` |
| 法人グループの取得・検索（会社コード限定） | `assets/group-master-basic-usage.md` パターン5 | `getCorporationGroup`/`getCorporationGroupSetAll(companyCd)` |
| 法人の取得・新規登録、取引先との紐付け | `assets/business-master-basic-usage.md` パターン1〜2 | `getCorporation`/`setCorporation`/`setCorporationAttach` |
| 取引先の検索（会社コード限定・ページング） | `assets/business-master-basic-usage.md` パターン3 | `CustomerManager#search`（第一引数 `companyCd`） |
| 品目カテゴリの階層取得、品目との紐付け検索 | `assets/business-master-basic-usage.md` パターン4 | `getTree`/`getItemWithCategory` |
| 品目の新規登録 | `assets/business-master-basic-usage.md` パターン5 | `ItemManager#set`（`termCd` 有無による自動判定） |
| 通貨レートの登録・取得 | `assets/business-master-basic-usage.md` パターン6 | `setCurrencyRate`（期間管理あり）/`getCurrencyRate` |

### リファレンス

- `reference/user-manager-api-reference.md` — `UserManager`/`User`/`IUserBizKey`/`UserCtg`/`UserCtgItm` の全メソッド・シグネチャ
- `reference/company-manager-api-reference.md` — `CompanyManager`/`Company`/`Department`/`CompanyPost`/`DepartmentCtg`/`DepartmentCtgItm` の全メソッド・シグネチャ
- `reference/public-group-manager-api-reference.md` — `PublicGroupManager`/`PublicGroup`/`IPublicGroupBizKey`/`PublicGroupCtg`/`PublicGroupCtgItm` 等の全メソッド・シグネチャ
- `reference/private-group-manager-api-reference.md` — `PrivateGroupManager`/`PrivateGroup`/`IPrivateGroupBizKey` の全メソッド・シグネチャ
- `reference/company-group-manager-api-reference.md` — `CompanyGroupManager`/`CompanyGroup`/`ICompanyGroupBizKey` 等の全メソッド・シグネチャ
- `reference/corporation-group-manager-api-reference.md` — `CorporationGroupManager`/`CorporationGroup`/`ICorporationGroupBizKey` 等の全メソッド・シグネチャ
- `reference/corporation-manager-api-reference.md` — `CorporationManager`/`Corporation`/`ICorporationBizKey` の全メソッド・シグネチャ
- `reference/customer-manager-api-reference.md` — `CustomerManager`/`Customer`/`ICustomerBizKey` の全メソッド・シグネチャ
- `reference/item-category-manager-api-reference.md` — `ItemCategoryManager`/`ItemCategory`/`ItemCategorySet`/`IItemCategoryBizKey` 等の全メソッド・シグネチャ
- `reference/item-manager-api-reference.md` — `ItemManager`/`Item`/`IItemBizKey` の全メソッド・シグネチャ
- `reference/currency-manager-api-reference.md` — `CurrencyManager`/`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate` 等の全メソッド・シグネチャ

いずれもプラットフォーム API の実クラス定義に基づく。記憶で書かない。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でユーザ情報を取得・登録する処理を作って」
- 「Java で `UserManager`/`CompanyManager` を使いたい」
- 「JavaEE 開発モデルで会社・組織の CRUD を実装したい」
- 「組織階層（ツリー）を取得したい」
- 「ユーザを組織に所属させる処理を作りたい」
- 「Java でパブリックグループ/プライベートグループ/会社グループ/法人グループを扱う処理を作って」
- 「Java で `PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager` を使いたい」
- 「パブリックグループの階層（ツリー）やカテゴリ・ロールを扱いたい」
- 「Java で法人/取引先/品目カテゴリ/品目/通貨を扱う処理を作って」
- 「Java で `CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager` を使いたい」
- 「品目カテゴリの階層（ツリー）を取得したい」「通貨レートを登録・取得したい」
- 「ユーザ分類/パブリックグループ分類/組織分類（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg`）を扱いたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

依頼が以下に該当する場合は、本スキルの対象外である旨を伝える:
- ユーザプロファイル**画像**の取得・登録・削除 → `java-im-profile-usage`
- ロール定義自体（新規登録・階層・カテゴリ）・ユーザへのロール割当 → `java-im-role-usage`/`java-im-account-usage`
- 認可リソース・ポリシー・権限確認 → `java-im-authz-usage`
- ログイン設定・アカウントロック等のアカウント制御 → `java-im-account-usage`

## 実装手順

1. ユーザの要件をヒアリング（対象がユーザ/会社/組織/役職/組織所属/パブリック/プライベート/会社/法人グループのどれか、単体取得か検索か、新規登録か更新か、多言語対応・カテゴリ・ロール・階層（ツリー）操作が必要か）
2. 対象に応じたメソッドを `reference/` 配下の対応するリファレンスで正確に確認する（記憶や推測で書かない）
3. ユーザ・会社・組織系は `assets/user-master-basic-usage.md`、グループ系は `assets/group-master-basic-usage.md`、法人・取引先・品目カテゴリ・品目・通貨は `assets/business-master-basic-usage.md` を参照して実装する
4. 新規作成を行う場合、対象が `Company`/`DepartmentSet`（Java API からは新規作成不可。`importData`/テナントセットアップ資材の利用をユーザに確認）か、それ以外（`termCd` 有無で自動判定の `set*`。新規登録時は `startDate`/`endDate` の設定が必須）かを確認する。ただし `Currency`/`CurrencyConversion`/`CurrencyPrecision` は期間の概念自体を持たないため対象外（`set*` が単純な `void` upsert）
5. 多言語対応が必要なモデル（`User`/`Department`/`CompanyPost`/`Corporation`/`Customer`/`ItemCategory`/`Item`/`Currency` 系）を登録する場合、`setDefaultLocale` → `createLocaleElement()` → 各セッタ → `putLocaleElement` の手順を踏む
6. グループ系・法人/取引先/品目カテゴリ/品目/通貨の検索系（`list*`/`search*`/`count*`）を使う場合、`AppCmnSearchCondition` に渡すカラム名は各エンティティ用の列挙型（`ImmPublicGroupColumn`/`ImmCustomerColumn` 等、`ImmTableColumn` 実装）の `toString()` から取得する
7. `CustomerManager`/`ItemManager` の検索系（`search`/`list`/`count`/`total`）を使う場合、第一引数の `companyCd` を渡し忘れていないか確認する（他クラスと異なりメソッド名にエンティティ名を含まない汎用シグネチャ）
8. グループ系・単体取得系（`get*`）は対象が存在しない場合に `null` を返すため、呼び出し側で null チェックを行う
9. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか確認

## 注意事項

### ユーザ・会社・組織系

- **`Company`/`DepartmentSet` の `updateCompany`/`updateDepartmentSet` は既存レコードの更新専用であり、新規作成はできない。** 標準実装は対象コードを条件とした SQL `UPDATE` のみを発行し、対象が存在しない場合は例外を送出せず何も更新せずに終了する。新規の会社・組織セットが必要な場合は `importData` またはテナントセットアップ資材経由での投入をユーザに確認する。`Department` を登録する際は、参照先の `DepartmentSet` が事前に作成済みである必要がある
- **`Company` モデルは会社コード・ソートキー等のみで、多言語の会社名フィールドを持たない。** 会社名の表示が必要な場合は組織側で名称を管理する等、別途設計が必要
- **`set*` 系メソッド（`setUser`/`setDepartment`/`setCompanyPost`）で新規登録する場合（`termCd` 未設定時）は `startDate`/`endDate` の両方の設定が必須。** 未設定のまま呼び出すと `BizApiException` が送出される。**更新の場合（`termCd` 設定時）も、`startDate`/`endDate` を省略してはならない。** 未設定（null）のままだと、対象データに格納されている値との不一致とみなされ「対象データと指定されたデータの開始日、終了日が異なります」という `BizApiException` が送出される。更新時は、登録時に使用した `startDate`/`endDate` と同じ値を明示的に設定すること
- **`setUserAttach` の `term` 引数に `null` は渡せない。** 常に `startDate`/`endDate` を設定した `jp.co.intra_mart.foundation.master.common.model.Term` インスタンスを渡す必要がある
- **`set*` 系メソッド（`setUser`/`setDepartment`/`setCompanyPost`/`setUserAttach`）で期間（開始日・終了日）そのものは変更できない。** 期間変更には `moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*` を使う
- **多言語情報（氏名・組織名等）は、キー項目だけをセットして `set*` を呼んでも保存されない。** `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` の手順が必須
- **`setUser` に複数ロケールの `putLocaleElement` をまとめて渡す呼び出し方（新規登録時に1回で複数ロケール分を登録する、または `termCd` を指定した更新でまだ存在しないロケールを追加登録する）は、いずれも `NullPointerException` を送出する。** 1回の `setUser` 呼び出しで安全に登録できるのは単一ロケールのみである（`assets/user-master-basic-usage.md` の登録パターンを参照）
- **検索系（`list*`/`search*`/`count*`）は `locale` が必須。** 単体取得系（`getUser`/`getCompany` 等）は `locale` を省略すると全言語の情報を取得する、という挙動の違いに注意する
- **`list*` と `search*` はシグネチャが同一だが、指定ロケールのデータが存在しないレコードの扱いが異なる。** `list*` はそのレコードも結果に含め、国際化情報（氏名等）が `null` になる。`search*` はそのレコードを結果から除外する

### グループ系

- **4クラスの API 規模・機能範囲は同一ではない。** パブリックグループのみカテゴリ・ロール・ツリー機能を持ち、プライベートグループはユーザ紐付け中心の最小構成である。他クラスの実装パターンをそのまま流用できない場合がある点に注意する
- **法人グループのモデルは会社コード（`companyCd`）を追加で保持する。** 会社グループと同型と誤認せず、`reference/corporation-group-manager-api-reference.md` で相違点を確認する
- **単体取得系（`get*`）は対象が存在しない場合、例外を送出せず `null` を返す。** 呼び出し側で必ず null チェックを行う
- **検索系（`list*`/`search*`/`count*`）に渡す `AppCmnSearchCondition` のカラム指定は、対応する列挙型（`ImmTableColumn` 実装）の `toString()` で文字列化してから `addCondition(String, Object[, Operator])` に渡す。** `SearchTarget` 引数版のオーバーロードには渡せない

### 法人・取引先・品目カテゴリ・品目・通貨

- **`CorporationManager`（法人）は `CorporationGroupManager`（法人グループ）とは別クラス・別パッケージ。** 混同しない
- **`CustomerManager`/`ItemManager` は CRUD・検索メソッド名がエンティティ名を含まない汎用名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`）であり、`search`/`list`/`count`/`total` の第一引数が必ず `companyCd`。** `UserManager`/`CompanyManager` の命名規則と混同しない
- **`ItemCategoryManager` はメソッド名を `Category`（`ItemCategory` ではなく）と表記する。** `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion` 等
- **通貨4エンティティのうち、期間管理（`ITerm`）を持つのは `CurrencyRate` のみ。** `Currency`/`CurrencyConversion`/`CurrencyPrecision` の `set*` は `void` を返す単純な upsert であり、`startDate`/`endDate` の設定は不要（むしろモデルに該当フィールドが無い）
- **単体取得系（`getCorporation`/`get`（Customer/Item）/`getCurrency*`）は対象が存在しない場合、例外を送出せず `null` を返す。** 呼び出し側で必ず null チェックを行う

### 共通

- `UserManager`/`CompanyManager`、グループ系4クラス、法人・取引先・品目カテゴリ・品目・通貨の5クラスとも、ほぼ全メソッドが検査例外 `BizApiException` を送出する。呼び出し元で必ず `throws` 宣言または `try-catch` する

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. `Company`/`DepartmentSet` を新規作成しようとしていないか（`updateCompany`/`updateDepartmentSet` は更新専用であり、Java API からの新規作成はできない。新規作成が必要な場合は `importData`/テナントセットアップ資材の利用を検討しているか）
2. `User`/`Department`/`CompanyPost` の登録・更新が、`termCd` の有無による自動判定という前提で実装されているか。新規登録時に `startDate`/`endDate` を設定しているか
3. `setUserAttach` の `term` 引数に `null` を渡していないか（`Term` インスタンスに `startDate`/`endDate` を設定して渡しているか）
4. 多言語対応モデルの登録で `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` の手順が踏まれているか
5. 検索系メソッドに `locale` が指定されているか
6. グループ系で対象グループ種別（パブリック/プライベート/会社/法人）に応じた正しいマネージャクラス・パッケージを使用しているか
7. グループ系の単体取得系メソッドの戻り値が `null` になり得る前提でハンドリングされているか
8. グループ系の検索系メソッドで、カラム指定に列挙型の `toString()` を使用しているか（`SearchTarget` 版と混同していないか）
9. `BizApiException` が握りつぶされていないか
10. `CorporationManager`（法人）と `CorporationGroupManager`（法人グループ）を混同していないか
11. `CustomerManager`/`ItemManager` の検索系メソッドに `companyCd` を渡しているか
12. 通貨の `Currency`/`CurrencyConversion`/`CurrencyPrecision` に対して、存在しない `startDate`/`endDate` を設定しようとしていないか（`CurrencyRate` にのみ期間の概念がある）
13. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか
14. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）でのユーザ・会社・組織・役職・組織所属・パブリック/プライベート/会社/法人グループ・法人・取引先・品目カテゴリ・品目・通貨の CRUD** | **本スキル** |
| ユーザプロファイル画像の取得・登録・削除 | `java-im-profile-usage` |
| ロール定義自体（新規登録・階層・カテゴリ） | `java-im-role-usage` |
| ユーザへのロール割当、ログイン設定・アカウントロック | `java-im-account-usage` |
| 認可リソース・ポリシー・権限確認 | `java-im-authz-usage` |
