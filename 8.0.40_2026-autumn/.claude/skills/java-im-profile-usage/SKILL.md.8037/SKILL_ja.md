---
name: java-im-profile-usage
description: intra-mart 固有のユーザプロファイル画像管理 API（`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`、IM-共通マスタ / im_master-main モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。プロファイル画像の取得（Stream形式・URL形式、単数/複数）、削除、登録（データURL形式／Storage経由）の実装パターンを提供する。Java でユーザのプロファイル画像を取得/登録/削除したい、Java で UserProfileImageManager を使いたい、JavaEE 開発モデルで IM-共通マスタのプロファイル画像を扱いたい、と言及されたときに使用。ユーザ基本情報（氏名・所属・分類区分等）そのものの操作は対象外（本 API はプロファイル画像専用）。IM-LogicDesigner のロジックフロー要素（`jp.co.intra_mart.foundation.logic.element.profile` 配下）は対象外。JSSP（スクリプト開発モデル）向けの同等 API は 2026年時点で提供されていない。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart User Profile Image Manager API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのユーザプロファイル画像管理 API（`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`）を使い、Java コードでユーザのプロファイル画像（アバター画像）の取得・登録・削除を実装するためのスキルセット。IM-共通マスタ（`im_master-main` モジュール）が提供する機能の一部。

## スコープの明確化（重要）

「IM-共通マスタ（プロファイル）」という語は複数の異なる機能を指しうるため、本スキルの範囲を明確にする。

| 機能 | 本スキルの対象か |
|------|-----------------|
| ユーザの**プロファイル画像**（アバター画像）の取得・登録・削除（`UserProfileImageManager`） | **対象（本スキル）** |
| ユーザ**基本情報**（氏名・所属・分類区分等）そのものの登録・更新・検索 | **対象外**。2026年時点で Java 向けの同等 API（SSJS 版 `IMMUserManager` に相当するもの）は本調査では確認できていない。該当の依頼があれば、ユーザに実装方針を確認すること |
| IM-LogicDesigner のロジックフロー要素（`jp.co.intra_mart.foundation.logic.element.profile` 配下の `GetProfileTask` / `UpdateProfileTask` / `RegisterProfileTask` / `RemoveProfileTask` 等） | **対象外**。ロジックフロー用の内部実装クラスであり、汎用 Java API として直接呼び出す想定のものではない |

依頼内容がプロファイル画像以外（ユーザ基本情報の CRUD 等）を指している場合は、本スキルの対象外である旨をユーザに伝えること。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での同等実装は、2026年時点で対応する SSJS 版 API が存在しないため、ユーザに実装方針を確認すること。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、`try-with-resources`、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には例外処理を定めた Java 向け専用規約は存在しない（2026年時点）。`UserProfileImageManager` の例外（`BizApiException`、チェック例外）は、業務例外へのラップ方針を `assets/profile-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`UserProfileImageManager` は `jp.co.intra_mart.foundation.master.user` パッケージに属する **interface**（`@since 8.0.26`）で、実装は `UserProfileImageManagerFactory.getFactory().getService()` から取得する（`new` による直接インスタンス化はしない）。全メソッドがチェック例外 `BizApiException`（`jp.co.intra_mart.foundation.exception`）をスローする。

登録用モデルの `UserImage` は `IUserBizKey` を実装し、画像実体は `jp.co.intra_mart.foundation.service.client.file.Storage<?>`（`java-im-storage-usage` スキルが扱う `PublicStorage`/`SessionScopeStorage`/`SystemStorage` の共通インタフェース）として渡す。取得結果の `UserImageFileInfo` は `InputStream` ベース。詳細なシグネチャ・内部構造は `reference/profile-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| プロファイル画像の取得（Stream形式・単数/複数） | `assets/profile-basic-usage.md` | `getUserProfileImageStream()` / `getUserProfileImagesStream()` の呼び出し例 |
| プロファイル画像の取得（URL形式・単数/複数） | `assets/profile-basic-usage.md` | `getUserProfileImageURL()` / `getUserProfileImagesURL()` の呼び出し例 |
| プロファイル画像の削除 | `assets/profile-basic-usage.md` | `deleteUserProfileImage()` の呼び出し例 |
| プロファイル画像の登録（データURL形式） | `assets/profile-basic-usage.md` | `setUserProfileImageURL()`（base64 データURL）の呼び出し例 |
| プロファイル画像の登録（Storage経由） | `assets/profile-basic-usage.md` | `setUserProfileImage(UserImage)` と `java-im-storage-usage`（`SessionScopeStorage` 等）との連携例 |

### リファレンス

- `reference/profile-api-reference.md` — `UserProfileImageManager` / `UserProfileImageManagerFactory` / `UserImage` / `UserImageFileInfo` / `IUserBizKey` の全メソッド・シグネチャ、例外（`BizApiException`）の扱い（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でユーザのプロファイル画像を取得したい」
- 「Java で UserProfileImageManager を使いたい」
- 「JavaEE 開発モデルでアバター画像の登録・削除処理を作りたい」
- 「IM-共通マスタのプロファイル画像を一覧画面に表示したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

また、依頼が**ユーザ基本情報**（氏名・所属等）の CRUD や、**IM-LogicDesigner のロジックフロー**に関するものであれば、本スキルの対象外である旨を伝える（前者は対応スキル未整備、後者は意図的に対象外としている）。

## 実装手順

1. ユーザの要件をヒアリング（取得/登録/削除のいずれか、単数/複数、登録時はデータURL形式かStorage経由か）
2. 依頼がプロファイル画像以外（ユーザ基本情報の CRUD、IM-LogicDesigner 連携）であれば対象外である旨を伝える
3. `assets/profile-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/profile-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. 実装は `UserProfileImageManagerFactory.getFactory().getService()` を経由し、`UserProfileImageManagerImpl` を直接 `new` しない
5. `setUserProfileImage(UserImage)` を使う場合、`UserImage#setStorage()` に渡す `Storage<?>` の取得・クローズは `java-im-storage-usage` の規約（`try-with-resources` 必須等）に従う
6. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`UserProfileImageManagerImpl` を直接 `new` しない。** 必ず `UserProfileImageManagerFactory.getFactory().getService()` 経由で取得する（`@ProvideFactory`/`@ProvideService` によるファクトリパターン）
- **画像が存在しない場合の挙動がメソッドによって異なる。** `getUserProfileImageStream()`/`getUserProfileImageURL()`（単数）は未登録時に NoImage を返すが、`getUserProfileImagesStream()`/`getUserProfileImagesURL()`（複数）は未登録のユーザを結果に含めない。複数取得系を使う場合、リクエストしたユーザコードの一部が結果から欠落しうる前提でハンドリングすること
- **対応する画像拡張子は jpg(jpeg)/png のみ。** `setUserProfileImageURL()`/`setUserProfileImage()` で他の拡張子を渡すとエラーになる
- **`imageSizeType` を省略すると `original` サイズで取得される。** `im-master-config.xml` で定義された画像サイズのキー名を指定する。存在しないキーを指定した場合の挙動は事前に検証すること
- **URL形式の取得結果はユーザコードと画像種別をキーにキャッシュされる。** 画像を更新した直後にキャッシュされたURLを再利用すると古い画像を参照し続ける可能性があるため、更新系（`setUserProfileImage*`/`deleteUserProfileImage`）呼び出し後は再取得のタイミングに注意する
- **全メソッドが `BizApiException`（チェック例外）をスローする。** 握りつぶさず、業務例外へのラップまたは呼び出し元への伝播を行う

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. `UserProfileImageManagerFactory.getFactory().getService()` 経由で実装を取得しているか（直接 `new` していないか）
2. 複数取得系（`getUserProfileImagesStream()`/`getUserProfileImagesURL()`）の呼び出しで、結果に含まれないユーザコードがある前提のハンドリングになっているか
3. `setUserProfileImage(UserImage)` を使う箇所で、`Storage<?>` の取得元が `try-with-resources` 等で適切にクローズされているか（`java-im-storage-usage` の規約に準拠しているか）
4. `BizApiException` を握りつぶしていないか
5. ユーザ基本情報の CRUD や IM-LogicDesigner 連携が本スキルの範囲に紛れ込んでいないか
6. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
7. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）でのユーザプロファイル画像の取得・登録・削除** | **本スキル** |
| ユーザ基本情報（氏名・所属・分類区分等）の CRUD | 対応する Java 向けスキル未整備（2026年時点）。ユーザに実装方針を確認 |
| ユーザへのロール割当・アカウント属性・ログイン設定 | `java-im-account-usage` |
| IM-LogicDesigner のロジックフロー要素・トリガ | 本スキルの対象外。ロジックフロー自体の生成は `jssp-im-logic-generator` を参照 |
| Java でのファイル操作（`PublicStorage`/`SessionScopeStorage`/`SystemStorage`） | `java-im-storage-usage` |
| SSJS（JSSP）でのプロファイル画像操作 | 2026年時点で対応する SSJS API 未確認。ユーザに実装方針を確認 |
