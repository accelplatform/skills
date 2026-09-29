---
name: java-im-secure-token-usage
description: intra-mart 固有のセキュアトークン API（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`、`im_core_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。CSRF 対策のためのトークン発行（`createToken`）・検証（`verify`）、ワンタイムトークンと再利用可能トークンの使い分け、パラメータ連動トークンによる改ざん検知、`HTTPContextManager` による `HttpServletRequest` の取得パターンを提供する。Java で SecureToken を発行・検証したい、Java で CSRF 対策を実装したい、`SecureTokenManager` を使いたい、Web API Maker の `@Secured` に頼らずセキュアトークンを扱いたい、と言及されたときに使用。Web API Maker のエンドポイントで宣言的にセキュアトークン検証したい場合は `java-im-web-api-maker-usage`（`@Secured`）を使うこと。
---

# intra-mart SecureToken API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのセキュアトークン API（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`）を使い、Java コードで CSRF（クロスサイトリクエストフォージェリ）対策のためのトークン発行・検証を実装するためのスキルセット。

正規の手順（画面表示 → フォーム送信等）を経由しないリクエストを遮断するための仕組みで、Web API Maker の `@Secured` アノテーションもこの API を内部的に利用している。**本スキルは `@Secured` に頼らず `SecureTokenManager` を直接呼び出す実装（Servlet、カスタムタグ、Web API Maker 以外の Java エンドポイント等）を対象とする。**

## トークンのライフサイクル（最重要）

`SecureTokenManager` は「発行」と「検証」で異なるメソッド系統を提供する。**用途に応じてどちらを使うか、どちらの種別のトークンにするかを最初に決定すること。**

| フェーズ | メソッド | 判断ポイント |
|------|---------|-------------|
| 発行 | `createToken(boolean useOneTimeToken)` / `createToken(boolean, Map<String, List<String>>)` | ワンタイム（`true`）か再利用可能（`false`）か。**状態変更操作にはワンタイムをデフォルトとする** |
| 検証 | `verify()` / `verify(String)` / `verify(String, Map<String, List<String>>)` | リクエストパラメータから自動取得するか、明示的にトークン文字列を渡すか |

判断基準:
- **1回限りの状態変更操作（登録・更新・削除・ログイン処理等） → `createToken(true)`（ワンタイムトークン）をデフォルトとする**
- **同一画面から複数回リクエストが送信されうる操作（ページング付き検索等） → `createToken(false)`（再利用可能トークン）を検討する**
- **重要なパラメータ（金額・権限レベル等）が画面遷移の間に改ざんされていないかも確認したい → パラメータ連動トークン（`Map<String, List<String>>` を渡す版）を使う**（`assets/secure-token-basic-usage.md` パターン3）

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.html`/`.js`）での多言語化・CSRF 対策は `<imart type="imSecureToken" />` タグ（`.agents/requirements/jssp-security/AGENTS.md` 参照）または JSSP 版のトークン検証を使う。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.agents/requirements` 配下には SecureToken 実装を定めた Java 向け専用規約は存在しない。例外処理・トークン検証失敗時のレスポンス方針は `assets/secure-token-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

`SecureTokenManager` は `jp.co.intra_mart.foundation.secure_token` パッケージに属し、コンストラクタで `ServletRequest` を要求する。`HttpServletRequest` が引数で渡されない文脈では `HTTPContextManager` から取得する。詳細なシグネチャは `reference/secure-token-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| Servlet でのトークン発行・検証（基本形） | `assets/secure-token-basic-usage.md` パターン1 | `doGet`/`doPost` での `createToken`/`verify` 呼び出し例 |
| `HttpServletRequest` を引数で受け取らない文脈での実装 | `assets/secure-token-basic-usage.md` パターン2 | `HTTPContextManager` によるリクエスト取得 |
| パラメータ連動トークン（改ざん検知） | `assets/secure-token-basic-usage.md` パターン3 | 発行時・検証時に同一パラメータを渡す実装 |
| ワンタイム/再利用可能トークンの使い分け | `assets/secure-token-basic-usage.md` パターン4 | 用途別の `createToken` 呼び出し例 |
| 例外処理・検証失敗時のレスポンス | `assets/secure-token-basic-usage.md` パターン5 | `SecureTokenException` と `verify()` の `false` 判定の使い分け |

### リファレンス

- `reference/secure-token-api-reference.md` — `SecureTokenManager`/`SecureToken`/`SecureTokenException`/`HTTPContextManager` の全メソッド・シグネチャ（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で SecureToken を発行・検証する処理を作って」
- 「Java で CSRF 対策を実装したい」
- 「`SecureTokenManager` を使いたい」
- 「Web API Maker を使わずにセキュアトークンを検証したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面での CSRF 対策であれば `<imart type="imSecureToken" />` タグ（`.agents/requirements/jssp-security/AGENTS.md`）を使う。Web API Maker のエンドポイントであれば `java-im-web-api-maker-usage` の `@Secured` を使う。

## 実装手順

1. ユーザの要件をヒアリング（発行箇所・検証箇所、状態変更操作かどうか、パラメータの改ざん検知が必要か、`HttpServletRequest` を直接受け取れる文脈か）
2. ワンタイムトークンと再利用可能トークンのどちらを使うか決定（上表の判断基準を参照。**ユーザの指定があればそちらを優先**、状態変更操作はワンタイムがデフォルト）
3. `assets/secure-token-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/secure-token-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. `HttpServletRequest` の取得方法を決定（引数で渡される文脈かどうかで `assets/secure-token-basic-usage.md` パターン1/パターン2を使い分ける）
5. `verify()` が `false` を返した場合のレスポンス（`403` 等）と、`SecureTokenException` 発生時のハンドリングを分けて実装する（`assets/secure-token-basic-usage.md` パターン5）
6. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか確認

## 注意事項

- **`verify()` が `false` を返すことと `SecureTokenException` が送出されることを混同しない。** 前者は「正規の手順を経ていないアクセス」を示す正常な判定結果（`403` 等で拒否）、後者はトークン処理自体の異常（セッション不整合等、システムエラーとして扱う）
- **`createToken()` はコンストラクタに渡した `HttpServletRequest` に紐づくセッションへトークンを格納する。** セッションが確立されていない状態で呼び出すと正しく機能しない
- **開発時のみの検証スキップ用システムプロパティ（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager.ignore_token_check`）を運用環境で有効にしない。** CSRF 対策が無効化される
- **ワンタイムトークンは検証後に無効化される。** 無効化された `SecureToken` の `getString()` 等を再度呼び出すと `SecureTokenException` が送出される
- Web API Maker のエンドポイントでセキュアトークン検証をしたい場合は、本 API を直接呼ぶのではなく `java-im-web-api-maker-usage` の `@Secured` を使う（重複した検証実装を避ける）

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. 状態変更操作にワンタイムトークン、複数回送信されうる操作に再利用可能トークンが使われているか
2. `verify()` の `false` 判定（アクセス拒否）と `SecureTokenException`（システムエラー）が区別して処理されているか
3. `HttpServletRequest` の取得方法（引数直接／`HTTPContextManager`）が実装コンテキストに合っているか
4. パラメータ連動トークンを使う場合、発行時・検証時で同一形式のパラメータを渡しているか
5. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか
6. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| JSSP（スクリプト開発モデル）画面での CSRF 対策 | `<imart type="imSecureToken" />` タグ（`.agents/requirements/jssp-security/AGENTS.md`） |
| Web API Maker エンドポイントでの宣言的なセキュアトークン検証（`@Secured`） | `java-im-web-api-maker-usage` |
| **Java（JavaEE 開発モデル）での `SecureTokenManager` 直接利用（Servlet・カスタムタグ等）** | **本スキル** |
