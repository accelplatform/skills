---
name: java-im-identifier-usage
description: intra-mart 固有の一意 ID 生成 API（`jp.co.intra_mart.foundation.service.client.information.Identifier`）を Java（JavaEE 開発モデル）で使用するためのスキルセット。分散環境でのシステム一意 ID 取得（`get()`）とアプリケーションサーバ内一意 ID 取得（`make()`）の使い分け、例外処理パターンを提供する。Java でユニーク ID を生成したい、Java で Identifier API を使いたい、JavaEE 開発モデルで一意な採番処理を作りたい、伝票番号やレコードキーを自動採番したい、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の Identifier API（`d.ts/platform/` 配下に定義があれば）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Identifier API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの一意 ID 生成 API（`jp.co.intra_mart.foundation.service.client.information.Identifier`）を使い、Java コードで伝票番号・採番キー・トレース ID 等の一意な識別子を生成する実装を支援するスキルセット。

## 2つの取得メソッドの使い分け（最重要）

`Identifier` クラスは、一意性の保証範囲が異なる 2 つの ID 取得手段を提供する。**用途に応じてどちらを使うかを最初に決定すること。**

| メソッド | シグネチャ | 一意性の保証範囲 | 生成される文字列長 | 例外 |
|---------|-----------|-----------------|------------------|------|
| `get()`（インスタンスメソッド） | `public String get() throws IOException` | **システム全体**（分散環境・複数アプリケーションサーバ構成でも共通の Server Manager 経由で一意性を保証） | 15 バイト | `IOException`（Server Manager との通信エラー） |
| `make()`（静的メソッド） | `public static String make()` | **アプリケーションサーバ内のみ**（プロセス内で一意。他サーバとの一意性は保証されない） | 13 バイト | なし（チェック例外なし） |

判断基準:
- **分散環境（複数アプリケーションサーバ、クラスタ構成）で一意性が必要 → `get()` を使う。** 業務データ（伝票番号、申請番号、レコードの主キー等、他サーバで生成された ID と重複してはならないもの）は原則こちら。
- **単一プロセス内で閉じた一時的な識別子（ログのトレース ID、リクエストスコープ内の相関 ID、ユニットテストや単体プロセスでしか動かない処理の採番等）で足りる → `make()` を使う。** `IOException` の例外処理が不要な分、コードは簡潔になる。
- 実プラットフォームコード（`EngineNumberingUtil#createNewNumber()`）では、通常時は `get()` を使い、単体テストモード等 Server Manager に接続できない実行環境でのみ `make()` にフォールバックする、という使い分けが行われている。**ユーザから明示の指定がなければ、業務データの採番は `get()` をデフォルトとする。**

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は、対応する SSJS 版 API が `d.ts/platform/` 配下に定義されていればそちらを使うこと。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には `IOException` のラップ方針を定めた Java 向け専用規約は存在しない（2026年時点）。`get()` 使用時の例外処理は `assets/identifier-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`Identifier` クラスは `jp.co.intra_mart.foundation.service.client.information` パッケージに属し、`final` クラス（継承不可）。コンストラクタは `public Identifier()` のみで、状態を持たない（スレッドセーフに呼び出せる）。詳細なシグネチャ・内部構造・関連クラスは `reference/identifier-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| 分散環境で一意な ID を採番する処理（`get()`、`IOException` ハンドリング込み） | `assets/identifier-basic-usage.md` | フィールド/メソッドでの呼び出し例、業務例外へのラップ |
| アプリケーションサーバ内一意の軽量な ID を採番する処理（`make()`） | `assets/identifier-basic-usage.md` | ログトレース ID・相関 ID 等での呼び出し例 |

### リファレンス

- `reference/identifier-api-reference.md` — `Identifier` / `IdentifierSpi` / `SystemIdProvider` の全メソッド・シグネチャ・生成される ID の形式、`identifier-config.xml` によるカスタマイズ方法（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で一意な ID を生成する処理を作って」
- 「JavaEE 開発モデルで伝票番号を自動採番したい」
- 「Java で Identifier API を使ってレコードの主キーを採番したい」
- 「分散環境でも重複しない ID を Java で発行したい」
- 「ログのトレース ID を Java で採番したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内での採番であれば、SSJS 版 API（存在すれば）を使う。

## 実装手順

1. ユーザの要件をヒアリング（採番した ID の用途、分散環境での一意性が必要か、採番失敗時の業務エラーハンドリング要否）
2. `get()` と `make()` のどちらを使うか決定（上表の判断基準を参照。**ユーザの指定があればそちらを優先**、業務データの採番は `get()` がデフォルト）
3. `assets/identifier-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/identifier-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. `get()` を使う場合は `IOException` を業務例外にラップするか、`throws` で伝播するかを `assets/identifier-basic-usage.md` のパターンに従って決定（プロジェクトに Java 向けのエラーハンドリング規約が別途追加された場合はそちらを優先する）
5. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`Identifier` はセキュリティ用途のトークン生成には使わない。** 生成される ID は時刻情報と内部シーケンス番号（`get()` の場合はさらにシステム ID）から構成される予測可能な値であり、暗号学的に安全な乱数ではない。パスワードリセットトークン・CSRF トークン・セッション ID 等、推測困難性が求められる用途には `java.security.SecureRandom` 等の別 API を使うこと（本スキルの対象外）
- **`get()` は `IOException` を送出する。** Server Manager との通信エラーが発生しうるため、呼び出し元で必ず `try-catch` するか、`throws` を宣言して呼び出し元に伝播させる。握りつぶさない
- **`make()` はプロセス内一意に過ぎない。** 複数のアプリケーションサーバで同時に採番される可能性がある処理（例: クラスタ構成での伝票番号発行）に `make()` を使うと ID が重複しうる。分散環境での一意性が要件に含まれる場合は必ず `get()` を使う
- **`Identifier` は状態を持たないクラス。** `get()` を呼ぶ場合のみインスタンス化が必要（`new Identifier()`）。`make()` は静的メソッドなのでインスタンス化不要
- 生成される ID は英数字（36 進数表現）の文字列。DB カラムに格納する場合は桁数（`get()` は 15 バイト、`make()` は 13 バイト）を踏まえてカラム長を設計する
- `identifier-config.xml` による生成アルゴリズムのカスタマイズ（`IdentifierSpi` の独自実装への差し替え）は、プラットフォーム全体の設定変更であり、個別のアプリケーション開発では通常不要。ユーザから明示の要求がある場合のみ `reference/identifier-api-reference.md` の該当セクションを参照して対応する

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. `get()` / `make()` の選択が、要求されている一意性の範囲（分散環境か単一プロセスか）に合っているか
2. `get()` を使った箇所で `IOException` が握りつぶされていないか
3. セキュリティトークン等、推測困難性が求められる用途に誤用していないか
4. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
5. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）での一意 ID 生成実装 | 対応する SSJS 版 API が定義されていればそちらを使用（本スキルの対象外） |
| **Java（JavaEE 開発モデル）での一意 ID 生成実装** | **本スキル** |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java でのワークフロー連携処理 | `java-im-workflow-usage` |
| セキュリティ用途の推測困難なトークン生成 | 本スキルの対象外（`java.security.SecureRandom` 等を個別実装） |
