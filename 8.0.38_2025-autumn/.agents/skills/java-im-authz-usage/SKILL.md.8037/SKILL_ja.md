---
name: java-im-authz-usage
description: intra-mart 固有の認可（Authorization）API（`jp.co.intra_mart.foundation.authz.*`、`im_authz_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。認可リソース・リソースグループ、サブジェクト・サブジェクトグループ（Expression による条件式構成）、ポリシーの新規登録・更新・削除、AuthorizationClient による権限確認（authorize）の実装パターンを提供する。Java で認可機構を使いたい、Java で AuthorizationClient / ResourceManager / SubjectManager / PolicyManager を使いたい、JavaEE 開発モデルでリソース・サブジェクト・ポリシーを登録したい、権限チェック（authorize）をJavaで実装したい、と言及されたときに使用。ロール定義自体のCRUD（RoleInfoManager）は `java-im-role-usage`、特定ユーザへのロール割当は `java-im-account-usage` を使うこと。JSSP（スクリプト開発モデル）向けの同等API（d.ts）は2026年時点で提供されていない。
---

# intra-mart Authorization API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの認可（Authorization）API（`jp.co.intra_mart.foundation.authz.*`）を使い、Java コードで認可リソース・サブジェクト・ポリシーの新規登録・更新・削除、および `AuthorizationClient` による権限確認（authorize）を実装するためのスキルセット。

## 認可の基本概念（最重要）

認可判断は「誰が（サブジェクト）」「何を（リソース）」「どうする（アクション）」「許可/禁止（エフェクト）」の4要素で構成される。

| 概念 | 役割 |
|------|------|
| リソース（`Resource`）/ リソースグループ（`ResourceGroup`） | 認可対象。キーはリソースURI（`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 形式）。名称・説明は対になる `ResourceGroup` が保持する |
| サブジェクト（`Subject`）/ サブジェクトグループ（`SubjectGroup`） | 「誰が」の条件。サブジェクト単体では登録できず、`Expression`（AND/OR/NOT）で組んだ式を `SubjectGroup` として登録する |
| ポリシー（`Policy`） | (リソースグループ, サブジェクトグループ, リソースタイプ, アクション) → エフェクト（`PERMIT`/`DENY`）の組 |
| `AuthorizationClient` | 開発者が権限確認を行う**推奨エントリポイント**（`authorize(...)` が `AuthorizeResult` を返す） |

`ResourceManager` / `SubjectManager` / `PolicyManager` はリソース・サブジェクト・ポリシーの CRUD、`AuthorizationClient` は権限確認を担う。いずれも**インタフェースのみが公開されており、実装クラスを直接参照せず対応する `*Factory` クラス経由で取得する**。

## ロール・アカウント管理との境界（重要）

**このスキルが扱うのは「認可」（リソース・サブジェクト・ポリシーの CRUD と権限確認）のみである。** intra-mart にはロール管理という別の概念があり、対象 API・担当スキルが異なる。

| 操作 | 対象 API | 担当スキル |
|------|---------|-----------|
| 認可リソース・サブジェクト・ポリシーの CRUD、権限確認（authorize） | `jp.co.intra_mart.foundation.authz.*`（`ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`） | **本スキル** |
| ロール定義自体の新規登録・更新・削除・階層・カテゴリ | `RoleInfoManager` | `java-im-role-usage`（本スキルの対象外） |
| 特定ユーザへのロール割当・解除 | `AccountInfoManager#addAccountRoleInfo` 等 | `java-im-account-usage`（本スキルの対象外） |

「ロールを新規作成したい」「ユーザにロールを割り当てたい」という依頼が来た場合、認可（Authz）ではなくロール管理の話であるため、それぞれ `java-im-role-usage` / `java-im-account-usage` に誘導すること。ただし認可の**サブジェクト**として「ロールに所属するユーザ群」を条件に使うこと自体はあり得る（その場合の `Subject` 実装は `im_master_subjecttypes` 等の拡張モジュールが提供するもので、本スキルの対象外）。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）向けの同等 API（d.ts）は 2026 年時点で `d.ts/` 配下に存在しない。JSSP からの認可利用を求められた場合はその旨をユーザに伝え、対応方針を確認すること。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.agents/requirements` 配下には例外処理を定めた Java 向け専用規約は存在しない（2026年時点）。`SubjectManager#removeSubject`/`removeSubjectGroup` は `SubjectManagingException`（チェック例外）をスローするが、`ResourceManager`/`PolicyManager`/`AuthorizationClient` の主要な CRUD・権限確認メソッドは非チェック例外中心（`InvalidResourceUriException` 等一部を除く）である。例外の扱いは `reference/authz-api-reference.md` の各メソッド定義と `assets/authz-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`jp.co.intra_mart.foundation.authz` パッケージ配下の API は `im_authz_base` モジュール（公開インタフェース）に属する。詳細なシグネチャ・パッケージ構成は `reference/authz-api-reference.md` を参照すること（記憶や推測で書かない）。

主なポイント:
- **CRUD・権限確認のいずれも Factory パターンで取得する。** `ResourceManagerFactory.getInstance().getResourceManager()` のように、対応する `*Factory.getInstance().getXxx()` でインスタンスを取得する
- **Manager/Client インスタンスは複数テナントで使い回してはならない。** 同一スレッド上でテナントを切り替える場合、インスタンスをキャッシュせずに都度 Factory から取得しなおす（`ResourceManager` の Javadoc に明記された制約）
- **サブジェクトは単体で登録できない。** `SubjectExpression.S(subject)` で `Expression` に変換し、`Expression.AND`/`OR`/`NOT` で組み合わせてから `SubjectManager#registerSubjectGroup(...)` に渡す
- **`getDeclaredPolicy`（明示設定のみ、未設定時は `null`）と `getActualPolicy`（継承を補完した実効ポリシー）は用途が異なる。** 実際に適用される権限を知りたい場合は `getActualPolicy`/`getActualPolicies` を使う

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| リソースの登録 | `assets/authz-basic-usage.md` | `ResourceManager#registerAsResource` によるリソースURI登録、`I18nValue` の使い方 |
| サブジェクトグループの登録 | `assets/authz-basic-usage.md` | `SubjectExpression.S(...)` と `Expression.AND`/`OR`/`NOT` によるサブジェクト式の構成、`SubjectManager#registerSubjectGroup` |
| ポリシーの設定 | `assets/authz-basic-usage.md` | `PolicyManager#setPolicy` による許可・禁止の登録、組込みサブジェクトグループ（`getAuthenticatedUsers`/`getGuestSubjectGroup`）の利用 |
| 権限確認（画面・API での認可チェック） | `assets/authz-basic-usage.md` | `AuthorizationClient#authorize` の呼び出しパターン、`AuthorizeResult` の判定方法 |
| ポリシーの参照・解除 | `assets/authz-basic-usage.md` | `getDeclaredPolicy`/`getActualPolicy` の使い分け、`removePolicy` によるフォールバック |

### リファレンス

- `reference/authz-api-reference.md` — `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`/`PolicyDecisionService`/`PolicyInformationService`/モデルインタフェース（`Resource`/`Subject`/`Policy`/`Effect`/`AuthorizeResult`）の中核メソッド・シグネチャ（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で認可機構（Authz）を使いたい」
- 「JavaEE 開発モデルで AuthorizationClient を使って権限チェックを実装したい」
- 「認可リソース・サブジェクト・ポリシーを新規登録したい」
- 「特定の条件（組織・パブリックグループ等）のユーザ群に対して権限を設定したい」
- 「このユーザがこのリソースに対する操作を許可されているか確認したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

「ロールを新規作成したい」「ユーザにロールを割り当てたい」という依頼は本スキルの対象外。`java-im-role-usage` / `java-im-account-usage` に誘導する。

## 実装手順

1. ユーザの要件をヒアリング（リソース・サブジェクト・ポリシーの CRUD か、権限確認（authorize）の実装か。ロール定義・ロール割当が目的の場合は `java-im-role-usage`/`java-im-account-usage` に誘導）
2. リソースURIの設計（`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 形式。アプリケーション名・コンポーネント名で階層を区切り、他アプリケーションと衝突しないようにする）を決定
3. サブジェクトの条件を整理（単一の `Subject` か、`Expression.AND`/`OR`/`NOT` で組む複合条件か。組込みグループ（`getAuthenticatedUsers`/`getGuestSubjectGroup`）で足りるかも確認）
4. `assets/authz-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/authz-api-reference.md` を必ず参照し、記憶や推測で書かない）
5. 権限確認を実装する場合、リソースURIの組み立てロジックを登録処理と確認処理で共通化する（表記ゆれによる判定ミスを防ぐため）
6. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **Manager/Client インスタンスをテナントを跨いでフィールドにキャッシュしない。** `ResourceManager` の Javadoc に明記された制約で、使い回した場合に一部 API の実行が失敗することがある。呼び出しのたびに `*Factory.getInstance().getXxx()` で取得する
- **サブジェクトは単体で登録する API が存在しない。** 必ず `SubjectExpression.S(subject)` → `Expression.AND`/`OR`/`NOT` → `SubjectManager#registerSubjectGroup(Expression, ...)` の順で `SubjectGroup` として登録する
- **`Effect.BLOCK` はポリシーとして直接登録できない。** 認可判断の結果としてのみ現れる値であり、`setPolicy` に渡すと `IllegalSerializationException` が発生する。ポリシー登録には `PERMIT`/`DENY` のみを使う
- **`AuthorizeResult` の判定は `AuthorizeResult.Permit.equals(result)` の形で行う。** `result == AuthorizeResult.Permit` を使うと、将来 enum 定数が追加された際に判定漏れを招くリスクがある（Javadoc 上の明示的な推奨事項）
- **`getDeclaredPolicy` と `getActualPolicy` を混同しない。** `getDeclaredPolicy` は明示設定が無い場合 `null` を返す（呼び出し側での null チェックが必須）。実際に適用される権限を知りたい場合は継承を補完した `getActualPolicy`/`getActualPolicies` を使う
- **`removePolicy`/`removeResourceGroup`/`removeSubjectGroup`/`removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` は破壊的操作である。** 特に `removeAllPolicies`（全ポリシー削除）と `removeResourceGroup`（配下のリソース・ポリシーごと削除）は影響範囲が大きいため、呼び出し前に対象範囲を確認すること
- **`PolicyDecisionService`/`PolicyInformationService` を直接呼び出す必要は通常ない。** Javadoc 上も「通常このクラスを直接扱う必要はありません」と明記されており、権限確認は `AuthorizationClient` を使うこと
- **`PolicyInformationServicetFactory`（`Service` の直後に `t` が入る綴り）は原文どおりのクラス名である。** タイプミスと誤認してリネームしないこと

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. `AuthorizeResult` の判定を `.equals()` で行っているか（`==` 比較になっていないか）
2. `getDeclaredPolicy()` の戻り値を使用する箇所すべてで null チェックを行っているか
3. `setPolicy(...)` に渡すエフェクトが `PERMIT`/`DENY` のいずれかであり、`BLOCK` を直接登録していないか
4. `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient` のインスタンスを `static` フィールド等でテナントを跨いでキャッシュしていないか
5. リソースURIの組み立てロジックが登録処理と確認処理で共通化されているか（表記ゆれの有無）
6. `removeAllPolicies`・`removeResourceGroup`・`removePoliciesForResourceGroup`・`removePoliciesForSubjectGroup` 等の破壊的操作について、要件通りの範囲でのみ実行されるか
7. `SubjectManagingException`（チェック例外）を握りつぶしていないか
8. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
9. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での認可リソース・サブジェクト・ポリシーの CRUD、権限確認** | **本スキル** |
| Java でのロール定義（CRUD・階層・カテゴリ・検索） | `java-im-role-usage` |
| Java での特定ユーザへのロール割当・解除 | `java-im-account-usage` |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java での一意 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java での排他制御（`NewLock`） | `java-im-lock-usage` |
| Java でのワークフロー連携処理 | `java-im-workflow-usage` |
| JSSP（スクリプト開発モデル）での認可利用 | 2026年時点で対応する d.ts / スキルは未提供（本スキルの対象外） |
