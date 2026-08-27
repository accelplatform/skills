---
name: java-im-lock-usage
description: intra-mart 固有のアプリケーションロック API（`jp.co.intra_mart.foundation.service.client.information.NewLock`）を Java（JavaEE 開発モデル）で使用するためのスキルセット。分散環境でのDBベース排他制御、通常ロック（手動 unlock）とリクエストスコープロック（自動解放）の使い分け、`java.util.concurrent.locks.Lock` 実装としての制約を提供する。Java で排他制御をしたい、Java で NewLock API を使いたい、JavaEE 開発モデルで採番処理やカウンタ更新を排他制御したい、分散環境で同一キーの処理を直列化したい、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の NewLock API（`d.ts/platform/` 配下に定義があれば）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Application Lock API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのアプリケーションロック API（`jp.co.intra_mart.foundation.service.client.information.NewLock`）を使い、Java コードで分散環境における排他制御（同一キーに対する処理の直列化）を実装するためのスキルセット。

## 2つのロックスコープの使い分け（最重要）

`NewLock` は、ロック解除の責務が異なる 2 系統の API を提供する。**用途に応じてどちらを使うかを最初に決定すること。**

| 系統 | 主なメソッド | 解除の責務 | 用途 |
|------|-------------|-----------|------|
| **通常ロック** | `lock()` / `tryLock()` / `tryLock(long, TimeUnit)` | **呼び出し側が明示的に `unlock()` する**（`try`/`finally` 必須） | メソッド内で完結する排他制御（カウンタ更新、採番処理等） |
| **リクエストスコープロック** | `lockRequestScope()` / `tryLockRequestScope()` / `tryLockRequestScope(long, TimeUnit)` | **プラットフォーム標準の `RequestScopeLockReleaseFilter` がレスポンス返却時に自動解除**（明示的な `unlock()` 不要） | リクエスト処理の複数箇所（複数メソッド・複数クラスにまたがる）でロックを保持し続けたい場合 |

判断基準:
- **1つのメソッド（またはごく近いスコープ）内でロックを取得・解放できる → 通常ロックを使う。** `try { lock.lock(); ... } finally { lock.unlock(); }` の形で確実に解放する
- **ロック取得箇所と解放箇所が離れている、または複数メソッドにまたがってロックを保持し続けたい → リクエストスコープロックを使う。** ただし「取り忘れると次のリクエストまでロックが残る」通常ロックの危険を、「レスポンス返却まで保持され続ける」形に置き換えるだけなので、保持時間が長くなりすぎないよう注意する
- 実プラットフォームコード（`SimpleNumberCounterEvent#getNumber()`、ワークフローの採番処理）では、ファイルベースのカウンタ更新を `tryLockRequestScope(timeout, TimeUnit.SECONDS)` で排他制御し、`finally` で `unlock()` を呼んでいる（リクエストスコープロックでも明示的に `unlock()` を呼ぶこと自体は可能で、早期解放したい場合は呼んでよい）
- **ユーザから明示の指定がなければ、通常ロック（`lock()`/`tryLock()` + `try`/`finally`）をデフォルトとする。** スコープをまたぐ要件が明確な場合のみリクエストスコープロックを検討する

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は、対応する SSJS 版 API が `d.ts/platform/` 配下に定義されていればそちらを使うこと。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には例外処理を定めた Java 向け専用規約は存在しない（2026年時点）。`NewLock` の例外はすべて非チェック例外（後述）であり、業務例外へのラップ方針は `assets/lock-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`NewLock` クラスは `jp.co.intra_mart.foundation.service.client.information` パッケージに属し、`java.util.concurrent.locks.Lock` を実装する。ロック情報はシステムデータベースで一元管理されるため、分散環境（複数アプリケーションサーバ構成）でも同一 `id` に対する排他制御が可能。詳細なシグネチャ・内部構造・関連クラスは `reference/lock-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| メソッド内で完結する排他制御（通常ロック、`try`/`finally` で確実に解放） | `assets/lock-basic-usage.md` | `lock()`/`tryLock(long, TimeUnit)` の呼び出し例、`run(Runnable)` ユーティリティの使用例 |
| リクエストの複数箇所にまたがる排他制御（リクエストスコープロック） | `assets/lock-basic-usage.md` | `lockRequestScope()`/`tryLockRequestScope()` の呼び出し例 |

### リファレンス

- `reference/lock-api-reference.md` — `NewLock` / `LockController` / `LockControlException` 系の全メソッド・シグネチャ、`RequestScopeLockReleaseFilter` による自動解放の仕組み（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で排他制御をする処理を作って」
- 「JavaEE 開発モデルで NewLock API を使ってカウンタ更新を排他制御したい」
- 「分散環境で同一キーの処理が同時実行されないようにしたい」
- 「採番処理にロックをかけたい」
- 「複数サーバでも重複しないよう、更新処理を直列化したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内での排他制御であれば、SSJS 版 API（存在すれば）を使う。

また、**排他制御の対象が単一 JVM 内（同一アプリケーションサーバ内）の並行処理に限定される場合**は、`NewLock` はシステムデータベースへの通信を伴う分オーバーヘッドが大きいため、標準の `java.util.concurrent`（`ReentrantLock`、`synchronized` 等）の方が適切なケースがある。分散環境での一意性が要件に含まれるかどうかをユーザに確認し、含まれない場合は標準 API の使用も選択肢として提示する。

## 実装手順

1. ユーザの要件をヒアリング（排他制御の対象キーの決め方、分散環境での排他制御が必要か、ロック取得のタイムアウト要否、ロック失敗時の業務エラーハンドリング要否）
2. 通常ロックとリクエストスコープロックのどちらを使うか決定（上表の判断基準を参照。**ユーザの指定があればそちらを優先**、単一メソッド内で完結するなら通常ロックがデフォルト）
3. `assets/lock-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/lock-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. ロックID（`NewLock` のコンストラクタ引数）の設計: 排他制御したい対象を一意に表すキーとする（例: `loginGroupId + ":" + 対象リソースのパス`）。過度に広い粒度（例: 固定文字列1つ）にすると無関係な処理まで直列化されるため避ける
5. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **通常ロックは必ず `try`/`finally` で解放する。** `lock()`/`tryLock()` の直後から `finally` ブロックの `unlock()` までを `try` で囲むこと。解放し忘れると、次回以降の同一 ID に対するロック取得が永久に（またはタイムアウトするまで）ブロックされる
- **`NewLock` のメソッドは例外をすべて非チェック例外（`LockControlRuntimeException`）で通知する。** `Identifier#get()` の `IOException`（チェック例外）とは対照的な設計のため、`throws` 宣言は不要だが、`catch` する場合は `LockControlRuntimeException` を対象にする
- **`newCondition()` は `UnsupportedOperationException` を投げる。** `Lock` インタフェースの標準機能だが `NewLock` では未サポート。`Condition` を使った待機・通知の実装はできない
- **`lockInterruptibly()` は名前通りには動作しない。** 内部実装は単に `lock()` を呼ぶだけで、実質的な割り込み対応はされていない。割り込み可能なロック取得が必要な場合は別の実装を検討する
- **リクエストスコープロックの自動解放はプラットフォーム標準の `RequestScopeLockReleaseFilter` が担う。** アプリケーション側で明示的にフィルタを登録する必要はない。ただし `NewLock.releaseRequestScope()`（静的メソッド）は `@Deprecated` かつ当該フィルタ専用の内部 API のため、アプリケーションコードから直接呼び出さないこと
- **`NewLock` は同一 JVM 内で完結する並行処理には過剰な場合がある。** システムデータベースとの通信を伴うため、分散環境での一意性が要件でなければ `java.util.concurrent`（`ReentrantLock` 等）の方が軽量で適切なことが多い
- ロックID の粒度設計に注意する。粒度が粗すぎる（例: アプリケーション全体で1つの固定ID）と無関係な処理まで直列化され、性能劣化やデッドロックの温床になる。粒度が細かすぎる（例: リクエストごとに毎回異なるランダムID）と排他制御として機能しない

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. 通常ロックを使った箇所で `lock()`/`tryLock()` 後から `unlock()` までが `try`/`finally` で確実に囲まれているか
2. リクエストスコープロックとの選択が、ロックの保持スコープ（単一メソッド内か、複数箇所にまたがるか）に合っているか
3. `NewLock.releaseRequestScope()`（`@Deprecated`）をアプリケーションコードから直接呼び出していないか
4. ロックID の粒度が排他制御の対象として適切か（粗すぎず、細かすぎない）
5. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
6. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）での排他制御実装 | 対応する SSJS 版 API が定義されていればそちらを使用（本スキルの対象外） |
| **Java（JavaEE 開発モデル）での排他制御実装** | **本スキル** |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java での一意 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java でのワークフロー連携処理 | `java-im-workflow-usage` |
| 単一 JVM 内に閉じた並行処理制御 | 本スキルの対象外（`java.util.concurrent` の標準クラスを個別実装） |
