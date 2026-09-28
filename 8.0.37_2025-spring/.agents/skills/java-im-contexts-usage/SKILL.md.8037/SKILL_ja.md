---
name: java-im-contexts-usage
description: >
  intra-mart 固有の実行コンテキスト取得 API（`jp.co.intra_mart.foundation.context.Contexts`、
  `im_core_base` / `im_user_context` / `im_job_scheduler_base` モジュール）を Java（JavaEE 開発モデル）で
  使用するためのスキルセット。AccountContext（ユーザーコード・テナントID・ロケール・タイムゾーン・
  ロールID・認証状態）、UserContext（ユーザープロファイル・所属部門・会社・役職・パブリックグループ・
  ユーザー分類）、ClientContext（クライアント種別）、ExternalUserContext（外部ユーザー判定）、
  JobSchedulerContext（ジョブ実行パラメータ）の取得パターンと、ContextStatus による認証・管理者判定を提供する。
  Java でログインユーザーの情報を取得したい、Contexts.get() の使い方を知りたい、AccountContext や
  UserContext のメソッドを確認したい、認証チェック（isAuthenticated）や管理者判定（isAdministrator）を
  実装したい、ユーザーのロケール・タイムゾーンを取得したい、ロールID一覧を取得したい、ユーザーの
  所属部門（Department）や会社（Company）の情報を取得したい、ジョブ内でパラメータを取得したい、
  パブリックグループやユーザー分類の情報を取得したい、外部ユーザー判定をしたい、と言及されたときに使用。
  JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の Context オブジェクト
  （`d.ts/platform/object/im-ssjs-*-context.d.ts`、`d.ts/platform/job-scheduler/im-ssjs-job-scheduler-context.d.ts`）を使うこと。
---

# intra-mart Contexts API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの実行コンテキスト取得 API（`jp.co.intra_mart.foundation.context.Contexts`）を使い、Java コードでログインユーザーのアカウント情報・組織情報・クライアント情報・ジョブ実行情報を取得するためのスキルセット。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は、`d.ts/platform/object/` 配下・`d.ts/platform/job-scheduler/` 配下の SSJS 版 Context オブジェクトを使うこと（本スキルの対象外）。

## エントリーポイント

`jp.co.intra_mart.foundation.context.Contexts` クラスの `get()` が唯一のエントリーポイント。

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

AccountContext accountContext = Contexts.get(AccountContext.class);
```

```java
public static <T extends Context> T get(final Class<T> type)
```

指定した型のコンテキストがストアに見つからない場合、`ContextNotFoundException`（**非チェック例外** = `RuntimeException` のサブクラス）がスローされる。`throws` 宣言は不要。そのため呼び出し側で必ず `catch` しなければならないわけではないが、コンテキストが存在しない実行環境（後述の「コンテキスト利用可能範囲」参照）で呼び出すと実行時に例外が発生する点に注意する。

## 取得可能なコンテキスト型

| コンテキスト型 | パッケージ | 所属モジュール | 用途 |
|---|---|---|---|
| `AccountContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | アカウント・認証・ロケール・ロールID |
| `UserContext` | `jp.co.intra_mart.foundation.user_context.model` | `im_user_context` | ユーザープロファイル・組織情報（IM共通マスタ由来） |
| `ClientContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | クライアント種別ID |
| `ExternalUserContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | 外部ユーザー判定 |
| `JobSchedulerContext` | `jp.co.intra_mart.foundation.job_scheduler` | `im_job_scheduler_base` | ジョブ実行パラメータ・ジョブネット情報 |

全メソッドのシグネチャ・JavaDoc は `reference/contexts-api-reference.md` を参照すること（記憶や推測で書かない）。

## ContextStatus ユーティリティ

`jp.co.intra_mart.foundation.context.ContextStatus` は頻出チェックのショートカットを提供する（内部で `Contexts.get(AccountContext.class)` を呼ぶだけなので、単純な判定にはこちらを優先する）。

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (ContextStatus.isAuthenticated()) { /* 認証済み */ }
if (ContextStatus.isAdministrator()) { /* システム管理者 */ }
```

| メソッド | 戻り値 | 説明 |
|---|---|---|
| `isAdministrator()` | `boolean` | `AccountContext.getUserType()` が `ADMINISTRATOR` か |
| `isAuthenticated()` | `boolean` | `AccountContext.isAuthenticated()` の結果 |
| `validate()` | `boolean` | ログイン署名の整合性チェック（未認証ユーザは常に `false`） |

## どのコンテキストを使うべきか（判定表）

| 必要な情報 | 取得方法 |
|---|---|
| ユーザーコード | `AccountContext.getUserCd()` |
| テナントID | `AccountContext.getTenantId()` |
| ロケール | `AccountContext.getLocale()` |
| タイムゾーン | `AccountContext.getTimeZone()` |
| 認証済みか | `ContextStatus.isAuthenticated()` |
| 管理者か | `ContextStatus.isAdministrator()` |
| ユーザー種別 | `AccountContext.getUserType()` |
| ロールID一覧（サブロール含む） | `AccountContext.getRoleIds()` |
| ログイン時刻 | `AccountContext.getLoginTime()` |
| ユーザー表示名・メールアドレス等 | `UserContext.getUserProfile()` の各メソッド |
| 主所属部門 | `UserContext.getMainDepartment()` |
| 全所属部門 | `UserContext.getAllDepartments()` |
| 所属会社 | `UserContext.getCompanyList()` |
| 役職 | `UserContext.getMainPostList()` / `getAllPosts()` |
| パブリックグループ | `UserContext.getPublicGroupList()` |
| ユーザー分類 | `UserContext.getUserCategoryList()` |
| クライアント種別 | `ClientContext.getClientTypeId()` |
| 外部ユーザーか | `ExternalUserContext.isExternalUser()` |
| ジョブ実行パラメータ | `JobSchedulerContext.getParameter(key)` またはジョブ内は `BaseJob.getParameter(key)` |

## 参照すべき規約

| 規約 | 取り扱い |
|---|---|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |
| `.agents/requirements/java-logging/AGENTS.md` | 🟡 ログ実装時 — ユーザーコード以外の個人情報をログ出力しないこと |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

詳細なメソッド一覧・JavaDoc・関連モデルクラス（`UserProfile` / `Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory`）は `reference/contexts-api-reference.md` を参照すること（プラットフォームの実クラス定義に基づく。記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---|---|---|
| サービス層でのユーザー情報取得・認証チェック | `assets/contexts-basic-usage.md` | `AccountContext` の取得・認証チェックパターン |
| ロケール・タイムゾーンを使った国際化対応 | `assets/contexts-basic-usage.md` | `Locale` / `TimeZone` を使った日時フォーマット例 |
| ユーザーの所属組織情報の取得 | `assets/contexts-basic-usage.md` | `UserContext` から部門・会社を取得する例 |
| ジョブ内でのパラメータ取得 | `assets/contexts-basic-usage.md` | `BaseJob` を継承したジョブでの `getParameter()` 利用例 |

### リファレンス

- `reference/contexts-api-reference.md` — `Contexts` / `ContextStatus` / 各 Context インタフェースの全メソッド、`UserType` 列挙型、コンテキスト利用可能範囲

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でログインユーザーの情報を取得したい」
- 「JavaEE 開発モデルで Contexts.get() を使いたい」
- 「サービス層でユーザーコードやテナントIDを取得したい」
- 「ユーザーの所属部門・会社を取得したい」
- 「ジョブの中で実行パラメータを取得したい」
- 「認証済みかどうか・管理者かどうかを判定したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内でのコンテキスト取得であれば、対応する SSJS 版 Context オブジェクト（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`）を使う。

## 実装手順

1. どのコンテキスト型が必要か、上表の判定表から特定する
2. `Contexts.get(XxxContext.class)` で取得する。**戻り値に対する null チェックは不要**（`Contexts.get()` は null を返すことがなく、該当コンテキストが存在しない場合は必ず `ContextNotFoundException` をスローする）。実行環境によっては例外が発生し得るコンテキストがあるため、必要に応じて例外の考慮を行う（下記「注意事項」参照）
3. 認証前提の処理では `ContextStatus.isAuthenticated()` または `AccountContext.isAuthenticated()` を確認する
4. `assets/contexts-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/contexts-api-reference.md` を必ず参照し、記憶や推測で書かない）
5. レイヤーに応じた使用場所を守る（下記「注意事項」参照）
6. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **必須: `Contexts.get()` の戻り値に対する null チェックは行わない（書いても到達しない）。**
  `Contexts.get()` は該当コンテキストが見つからない場合、null を返すのではなく必ず `ContextNotFoundException`（非チェック例外）をスローする（実ソース・実環境の双方で確認済み）。そのため `if (account == null)` のような分岐は決して真にならない死コードになる。実行環境によっては取得できないコンテキストが存在するため（下記「コンテキスト利用可能範囲」参照）、取得失敗を考慮する場合は null チェックではなく `ContextNotFoundException` の catch を検討すること（ただし `AccountContext` は必須コンテキストのため通常は catch 不要）
- **必須: 認証チェック。** `AccountContext` が取得できても `isAuthenticated()` が `false` の場合がある（未認証ユーザ・システム起動時等）。認証前提の処理では必ず確認すること
- **禁止: コンテキストのフィールド保持・キャッシュ。** コンテキストはリクエスト（またはスレッド）に紐づく。インスタンスフィールドや `static` フィールドに保持してはならない
  ```java
  // NG: フィールドに保持（初期化時のコンテキストが固定される）
  private AccountContext account = Contexts.get(AccountContext.class);

  // OK: 必要なタイミングで都度取得
  public void process() {
      AccountContext account = Contexts.get(AccountContext.class);
  }
  ```
- **禁止: 個人情報のログ出力。** ユーザーコード（`getUserCd()`）やテナントIDはログ出力可能だが、`UserProfile` の氏名（`getUserName()`）、メールアドレス、電話番号、住所等の個人情報はログに出力しないこと
- **注意: `AccountContext.getUserCd()` はシステム管理者・未認証ユーザでも値を返す。** そのユーザーコードのみで業務判定を行わず、必ず `getUserType()` や `isAuthenticated()` と組み合わせて判定すること
- **注意: `getLoginGroupId()` は非推奨（`@Deprecated`）。** テナントIDと同じ値を返す互換用プロパティのため、新規実装では `getTenantId()` を使うこと
- **推奨: レイヤーに応じた使用場所**
  - プレゼンテーション層 / コントローラ層: 認証確認、ロケール取得
  - アプリケーション層 / サービス層: ユーザーコード取得、監査証跡設定、業務ロジックでの組織判定
  - インフラストラクチャ層（DAO/Repository）: `Contexts` API を直接呼び出さない。上位層から引数で受け取る

## 生成後の確認

自動検証スクリプト（JSSP 版の `validate-jssp-code.js` 相当）ではなく、以下の項目を手動で確認する。

1. `Contexts.get()` の呼び出し箇所で、コンテキストが存在しない可能性のある実行環境（下記「コンテキスト利用可能範囲」参照）を踏まえた考慮がされているか
2. 認証前提の処理で `isAuthenticated()` の確認が漏れていないか
3. コンテキストをインスタンスフィールド・`static` フィールドに保持していないか
4. `UserProfile` の氏名・メールアドレス等の個人情報をログに出力していないか
5. インフラストラクチャ層（DAO/Repository）から `Contexts` API を直接呼び出していないか
6. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
7. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## コンテキスト利用可能範囲

各コンテキストの実装は `ContextProducer`（実行環境ごとのプラグイン機構）経由でストアに格納される。下表は Web API 経由の HTTPリクエスト環境（認証済み）と、`BaseJob` 経由のジョブスケジューラ実行環境を対象とする。テナント・ユーザー構成によって結果が変わる可能性があるため、下表に無い実行環境（未認証の HTTPリクエスト等）については、`Contexts.get()` の呼び出し結果（正常取得できるか `ContextNotFoundException` が発生するか）で個別に確認すること。

| 実行環境 | AccountContext | UserContext | ClientContext | JobSchedulerContext |
|---|---|---|---|---|
| HTTPリクエスト（認証済み） | ○ | ○ | ○ | ×（`ContextNotFoundException`） |
| ジョブスケジューラ | ○（ジョブ実行ユーザーのコンテキストが設定される。`userCd` はジョブ実行用の技術アカウントになる） | ○（ただし対応する IM共通マスタレコードが無い実行ユーザーの場合、`getUserContext().getUserProfile()` が `null` を返すことがある） | ○（`clientTypeId` が取得できる） | ○（`BaseJob.getJobContext()` 経由を推奨） |

## ジョブ内での `JobSchedulerContext` 利用

`jp.co.intra_mart.foundation.job_scheduler.BaseJob` を継承したジョブ実装では、`Contexts.get(JobSchedulerContext.class)` を直接呼ぶのではなく、`BaseJob` が提供する `protected` ユーティリティメソッド（`getJobContext()` / `getParameter()` / `getParameterAsInteger()` 等）を使うことが推奨される。詳細は `reference/contexts-api-reference.md` を参照。

## 他スキルとの境界

| 責務 | 担当スキル |
|---|---|
| SSJS（JSSP）でのコンテキスト取得実装 | 対応する SSJS 版 Context オブジェクト（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`）を使用（本スキルの対象外） |
| **Java（JavaEE 開発モデル）でのコンテキスト取得実装** | **本スキル** |
| Java でのアカウント情報の更新・ロール割当（`AccountInfoManager`） | `java-im-account-usage` |
| Java でのロール定義自体の CRUD（`RoleInfoManager`） | `java-im-role-usage` |
| Java での認可チェック（`AuthorizationClient`） | `java-im-authz-usage` |
| Java でのジョブ実装本体（`execute()` の実装等） | 本スキルの対象外（ジョブ実装全体を扱うスキルが別途存在する場合はそちらを利用） |
