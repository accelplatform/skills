---
name: java-im-message-usage
description: intra-mart 固有のメッセージ取得 API（`jp.co.intra_mart.foundation.security.message.MessageManager`、`im_core_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。ユーザ/テナント/システムロケールの解決順序、プレースホルダ置換、メッセージ存在確認（`hasMessage`）、メッセージプロパティファイルの配置・キー命名規約を提供する。Java でメッセージプロパティを扱いたい、Java で多言語化・ローカライズ（i18n）したい、Java で MessageManager を使いたい、JavaEE 開発モデルでメッセージを外部化したい、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は `jssp-localize-support` を使うこと。
---

# intra-mart MessageManager API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのメッセージ取得 API（`jp.co.intra_mart.foundation.security.message.MessageManager`）を使い、Java コードでメッセージプロパティファイルからラベル・エラーメッセージ等を取得する実装を支援するスキルセット。

**このスキルが扱うのは Java ソースファイル（`.java`）とメッセージプロパティファイル（`.properties`）のみ。** JSSP（`.js` / `.html`）での多言語化は `jssp-localize-support` を使うこと。

## メッセージ取得メソッドの使い分け（重要）

`MessageManager` はロケール解決の範囲が異なる複数のメソッド群を提供する。**用途に応じてどれを使うかを最初に決定すること。**

| メソッド群 | ロケール解決順序 | 主な用途 |
|-----------|----------------|---------|
| `getMessage(String key, ...)` | ユーザ → テナント → システム → ロケール指定なし | 画面表示用のラベル・メッセージ（**アプリケーション開発の既定はこちら**） |
| `getMessage(Locale locale, String key, ...)` | 指定ロケール → ロケール指定なし | ログ出力等、ユーザロケールに依存させたくない場合 |
| `getTenantMessage(String key, String...)` | テナント → システム → ロケール指定なし | **プラットフォーム内部用**。通常のアプリケーション開発では使わない |
| `hasMessage(...)` / `hasTenantMessage(...)` | （対応する `getMessage` 系と同じ解決順序で存在有無のみ判定） | キーの存在自体を業務ロジックで分岐条件にしたい場合 |

判断基準:
- 画面のラベル・エラーメッセージ等、**ログイン中ユーザの言語設定に応じて出し分けたい文字列 → `getMessage(String key, ...)` を使う。ユーザから明示の指定がなければこちらをデフォルトとする。**
- ログ出力・監査証跡等、**システム全体で言語を固定したい文字列 → `getMessage(Locale, String key, ...)` を使う**（`Locale.JAPANESE` 等を明示指定）
- `getTenantMessage` は Javadoc 上「intra-mart Accel Platform内部のログ、例外に用いるメッセージを取得するためのメソッド」と明記されており、アプリケーション開発では通常使用しない

詳細なメソッド一覧・解決順序・例外仕様は `reference/message-manager-api-reference.md` を必ず参照すること（記憶や推測で書かない）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.agents/requirements` 配下には、メッセージプロパティファイルの配置・キー命名を定めた Java 向け専用規約は存在しない。本スキルでは JSSP 側の `jssp-localize-support` と共通のキー命名規約を採用する（`assets/message-manager-usage.md` の「メッセージキーの命名規約」を参照）。プロジェクトに既存のメッセージプロパティファイルがある場合は、そのキー体系を優先すること。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

`MessageManager` は `jp.co.intra_mart.foundation.security.message` パッケージに属する `final` クラスで、コンストラクタは `private`。インスタンスは `getInstance()`（シングルトン）で取得する。詳細なシグネチャ・解決順序・例外仕様は `reference/message-manager-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| ユーザロケールでのメッセージ取得（基本・プレースホルダ置換） | `assets/message-manager-usage.md` | `getMessage(key, args...)` の呼び出しパターン |
| ロケール明示指定でのメッセージ取得（ログ出力等） | `assets/message-manager-usage.md` | `getMessage(Locale, key, args...)` の呼び出しパターン |
| 業務例外へのメッセージ組み込み | `assets/message-manager-usage.md` | `AccessSecurityException` の扱い方を含む実装例 |
| メッセージ存在確認 | `assets/message-manager-usage.md` | `hasMessage` を使った分岐パターン |
| メッセージプロパティファイル（`.properties`）本体 | `assets/message-manager-usage.md` | キー命名規約・native2ascii エスケープ・配置先 |

### リファレンス

- `reference/message-manager-api-reference.md` — `MessageManager` / `AccessSecurityException` / `IllegalArgumentException` の全メソッド・シグネチャ・ロケール解決順序・プロパティファイル配置（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でメッセージプロパティを扱う処理を作って」
- 「JavaEE 開発モデルで画面のラベルを多言語化したい」
- 「Java で MessageManager を使ってエラーメッセージを取得したい」
- 「Java 側のログメッセージをプロパティファイルに外部化したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内での多言語化であれば `jssp-localize-support` を使う。

## 実装手順

1. ユーザの要件をヒアリング（対象文字列がユーザロケール依存かシステム固定か、既存のメッセージキー体系の有無）
2. `getMessage(String key, ...)` と `getMessage(Locale, String key, ...)` のどちらを使うか決定（上表の判断基準を参照。**ユーザの指定があればそちらを優先**、画面表示用は `getMessage(String key, ...)` がデフォルト）
3. メッセージキーを決定し、`assets/message-manager-usage.md` の「メッセージキーの命名規約」に従ってプロパティファイル（`.properties`、`ja`/`en`/`zh_CN`/デフォルトの各ロケール分）を作成または追記する
4. `assets/message-manager-usage.md` を参照して Java 実装を作成（メソッドのシグネチャは `reference/message-manager-api-reference.md` を必ず参照し、記憶や推測で書かない）
5. `AccessSecurityException` の扱いを決定（`assets/message-manager-usage.md` のパターンに従う。原則として上位に伝播させるか、内部エラーとして扱う）
6. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`getMessage` / `getTenantMessage` は、メッセージキーが未定義でも例外を送出しない。** 未定義時は `"undefined"`（または「未定義」を表すメッセージ）にフォールバックする。キーの存在確認が必要な場合は `hasMessage` / `hasTenantMessage` を使う
- **`AccessSecurityException` は `key` / `locale` / `args` に `null` を渡した場合にのみ送出される。** 呼び出し側の実装ミスを示す例外であり、通常は catch して業務的に回復させる対象ではない
- **`jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` は `java.lang.IllegalArgumentException` とは別クラス。** IDE の自動 import 補完で取り違えないこと（詳細は `reference/message-manager-api-reference.md` を参照）
- **`getTenantMessage` はプラットフォーム内部用。** アプリケーション開発では `getMessage`（ユーザロケール）または `getMessage(Locale, ...)`（ロケール明示指定）を使う
- メッセージプロパティファイルの非 ASCII 文字は `\uXXXX` 形式（native2ascii）でエスケープする。改行コードは LF を使用する
- プレースホルダ置換は `MessageFormat#format` に準じる。メッセージ本文中の `'` は `''`、`{` は `'{` とエスケープする

## 生成後の確認

自動検証スクリプト（JSSP 版の `validate-i18n.js` 相当）ではなく、以下の項目を手動で確認する。

1. `getMessage(String key, ...)` / `getMessage(Locale, ...)` / `getTenantMessage` の選択が、要求されているロケール解決範囲（ユーザ依存かシステム固定か）に合っているか
2. メッセージキーが `assets/message-manager-usage.md` の命名規約（ドット区切り、アンダースコア・ハイフン禁止）に準拠しているか
3. プロパティファイルが ja / en / zh_CN / デフォルトの各ロケール分そろっているか、キーセットが一致しているか
4. `AccessSecurityException` が握りつぶされていないか
5. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
6. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）でのメッセージ多言語化（`<imart type="message">` タグ・SSJS 版 `MessageManager`） | `jssp-localize-support` |
| **Java（JavaEE 開発モデル）でのメッセージプロパティ・`MessageManager` 実装** | **本スキル** |
| Java でのアーキテクチャ・レイヤー構造全般 | `java-im-architecture` |
