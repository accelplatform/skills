---
name: java-im-account-usage
description: intra-mart 固有のアカウント情報管理 API（`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`）を Java（JavaEE 開発モデル）で使用するためのスキルセット。ログイン設定（ロケール・タイムゾーン・カレンダー・テーマ・週開始曜日・日時フォーマット）、アカウントロック・ログイン失敗回数、アカウント属性（`getAttribute`/`setAttribute`）、パスワード照合（`AccountPasswordAdapter`）、ユーザへのロール割当（`addAccountRoleInfo` 等）の実装パターンを提供する。Java でアカウント情報を取得/更新したい、Java で AccountInfoManager を使いたい、JavaEE 開発モデルでログイン設定やアカウントロックを扱いたい、ユーザにロールを割り当てる処理を Java で作りたい、と言及されたときに使用。ロール定義自体（新規登録・階層・カテゴリ）の操作は `java-im-role-usage` を使うこと。JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Account Info Manager API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのアカウント情報管理 API（`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`）を使い、Java コードでアカウントのログイン設定・ロック・属性・パスワード照合・ロール割当を実装するためのスキルセット。

## アカウントとロールの境界（最重要）

`addAccountRoleInfo` / `deleteAccountRoleInfo` / `getAccountRoleIds` 等のユーザ⇔ロールの紐付けメソッドは `AccountInfoManager` 側に定義されているが、**意味的には「ロール」の話**である。このスキルには実装パターンとして含めるが、以下のように責務を分ける。

| 責務 | 担当スキル |
|------|-----------|
| ユーザに対するロールの**割当・解除・有効期間設定**（`addAccountRoleInfo` 等、本人以外のフィールドは変更しない） | **本スキル** |
| ロール**定義自体**の新規登録・階層構造・カテゴリの操作 | `java-im-role-usage` |

ロール定義がまだ存在しない状態でロール割当を実装しようとしている場合は、先に `java-im-role-usage` でロール定義を作成する必要がないかユーザに確認すること。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は、SSJS 版の AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）を使うこと。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には例外処理を定めた Java 向け専用規約は存在しない（2026年時点）。`AccountInfoManager` / `AccountPasswordAdapter` の例外はすべてチェック例外（後述）であり、業務例外へのラップ方針は `assets/account-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`AccountInfoManager` クラスは `jp.co.intra_mart.foundation.admin.account` パッケージに属する **`final class`**。継承して拡張することはできない。アカウント情報モデルの `AccountInfo` はコンストラクタ引数に `userCd` が必須で、`new AccountInfo(userCd)` で生成する（デフォルトコンストラクタは無い）。`AccountInfo#locale` フィールドは `String` ではなく **`java.util.Locale` 型**である点に注意。詳細なシグネチャ・内部構造・関連クラスは `reference/account-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| アカウント情報の登録・更新（ログイン設定含む） | `assets/account-basic-usage.md` | `addAccountInfo()` / `getAccountInfo()` → `updateAccountInfo()` の呼び出し例 |
| パスワード照合 | `assets/account-basic-usage.md` | `AccountPasswordAdapter#collate()` を使ったログイン確認処理 |
| アカウントロック・ロック解除 | `assets/account-basic-usage.md` | `AccountInfo#setLockDate()` の呼び出し例 |
| アカウント属性の get/set | `assets/account-basic-usage.md` | `getAttribute()` / `setAttribute()` の呼び出し例 |
| ユーザへのロール割当・有効ロール一覧取得 | `assets/account-basic-usage.md` | `addAccountRoleInfo()`、`getAccountRoleIds()` と再帰版 `getAccountRoleIdsRecursively()` の使い分け |

### リファレンス

- `reference/account-api-reference.md` — `AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter` の全メソッド・シグネチャ、例外（`AdminException` / `PasswordException`）の扱い（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でアカウント情報を取得/更新したい」
- 「Java で AccountInfoManager を使いたい」
- 「JavaEE 開発モデルでログイン設定（ロケール・タイムゾーン・カレンダー）を扱いたい」
- 「アカウントロック・ログイン失敗回数を Java で実装したい」
- 「ユーザにロールを割り当てる処理を Java で作りたい」
- 「ログイン時にパスワードを照合する処理を Java で作りたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内での実装であれば、SSJS 版の AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）を使う。

また、依頼が**ロール定義自体**（新規登録・階層・カテゴリ）に関するものであれば、本スキルではなく `java-im-role-usage` を案内する。

## 実装手順

1. ユーザの要件をヒアリング（アカウントのどの側面を扱うか: ログイン設定/ロック/属性/パスワード照合/ロール割当のいずれか、または複数）
2. 依頼がロール**定義自体**の操作であれば `java-im-role-usage` に誘導する（本スキルの対象外）
3. `assets/account-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/account-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. パスワードを扱う実装では、必ずハッシュ化保存時に `password` フィールドが `null` になる前提で設計する（平文比較禁止、`AccountPasswordAdapter#collate()` を使用）
5. アカウント情報の更新では、`new AccountInfo(userCd)` を都度生成せず、必ず `getAccountInfo()` で既存値を取得してから一部フィールドを変更する
6. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **パスワードのハッシュ化保存時は `getAccountInfo()`/`getAccountInfos()`/`searchAccountInfos()` で `password` が `null` になる。** パスワード照合は必ず `AccountPasswordAdapter#collate()` を使うこと（`AccountInfo.password` を直接比較しない）
- **`updateAccountInfo()` は `AccountInfo.password` が `null` の場合、パスワード以外のみが更新される。** 意図せずパスワードを保持したまま更新したい場合は、取得した `AccountInfo` の `password` を触らずそのまま渡す。逆に空文字などの非 null 値を誤って設定すると、意図せずパスワードが上書きされる
- **`AccountRoleInfo` の有効期間は「開始日 &lt;= 判定日 &lt; 終了日」で判定される。** 終了日を `null` 設定するとシステム最大日付にリセットされる（無期限にはならない点に注意。システム最大日付が事実上の無期限として扱われる）
- **ロール「割当」の直接一致のみを見る `getUserCdsByAccountRoleId()` と、階層・有効期間を考慮する `getUserCdsByRoleId()` は挙動が異なる。** 親ロールの配下にあるサブロール保有者も含めて検索したい場合は後者を使う。同様に `getAccountRoleIds()`（直接割当のみ）と `getAccountRoleIdsRecursively()`（サブロール含む）も使い分けが必要
- **`isUpdate(Date)` は `@Deprecated`（8.0.4 以降は常に `true` を返す）。** 更新有無の判定には使わない
- **`AccountPasswordAdapter#decrypt()` は `canDecrypt()` が `false`（不可逆＝ハッシュ化）の場合 `null` を返す。** 復号を前提にした実装をする場合は事前に `canDecrypt()` を確認すること
- `AccountInfoManager` の全メソッドは `AdminException`（チェック例外）を、`AccountPasswordAdapter` の全メソッドは `PasswordException`（チェック例外）をスローする。**両者は別系統の例外クラス**のため、同一メソッド内で両方の API を使う場合は `catch` を分けるか共通の親クラスでまとめて捕捉する

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. パスワード照合処理が `AccountPasswordAdapter#collate()` を使っており、`AccountInfo.password` の直接比較になっていないか
2. `updateAccountInfo()` を呼ぶ箇所が、事前に `getAccountInfo()` で取得した値をベースにしており、`new AccountInfo(userCd)` を都度生成して未設定フィールドを巻き込んでいないか
3. パスワードを更新対象から除外したい箇所で、`password` に空文字等の非 null 値を誤って設定していないか
4. ロール割当の検索が、直接一致（`getAccountRoleIds()` / `getUserCdsByAccountRoleId()`）と階層考慮（`getAccountRoleIdsRecursively()` / `getUserCdsByRoleId()`）のどちらを使うべきか要件と一致しているか
5. `AdminException` / `PasswordException` を握りつぶしていないか
6. ロール定義自体の操作が紛れ込んでいないか（紛れ込んでいれば `java-im-role-usage` の範囲に切り出す）
7. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
8. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）でのアカウント情報操作 | SSJS 版 AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）を使用（本スキルの対象外） |
| **Java（JavaEE 開発モデル）でのアカウント設定・ロック・属性・パスワード照合・ロール割当** | **本スキル** |
| ロール**定義自体**（新規登録・階層・カテゴリ）の操作 | `java-im-role-usage` |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java での一意 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java での排他制御（`NewLock`） | `java-im-lock-usage` |
| Java でのワークフロー連携処理 | `java-im-workflow-usage` |
