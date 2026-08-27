---
name: java-im-storage-usage
description: intra-mart 固有のファイル操作 API（PublicStorage / SessionScopeStorage / SystemStorage）を Java（JavaEE 開発モデル）で使用するためのスキルセット。ファイルの読み書き・ディレクトリ操作・一時ファイル運用・リソース管理パターンを提供する。Java でファイルを保存したい、Java でストレージ API を使いたい、JavaEE 開発モデルでファイル操作、PublicStorage を Java で使いたい、SessionScopeStorage で一時ファイルを扱いたい、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は `jssp-page-generator` の `reference/api-storage.md`（SSJS 版 Storage API）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Storage API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのファイル操作 API（`jp.co.intra_mart.foundation.service.client.file` パッケージ配下の `PublicStorage` / `SessionScopeStorage` / `SystemStorage`）を使い、Java コードでのファイル読み書き・ディレクトリ操作・一時ファイル運用を実装するためのスキルセット。

## JSSP 版との違い（重要）

JSSP 版（SSJS の `PublicStorage` 等、`d.ts/platform/storage/*.d.ts` で定義）と Java 版は、名前は同じでも **別パッケージの別クラス**であり、API の形も異なる。記憶や類推で JSSP 版のコールバックパターンをそのまま持ち込むと誤りになるため、必ず本ドキュメントの型・シグネチャに従うこと。

| 観点 | JSSP 版（SSJS） | Java 版 |
|------|-----------------|---------|
| クラスの実体 | Rhino 上のグローバルクラス（`d.ts/platform/storage/*.d.ts` で定義） | `jp.co.intra_mart.foundation.service.client.file.{PublicStorage, SessionScopeStorage, SystemStorage}` |
| 読み書きの基本形 | `openAsText(function(reader, error) {...})` 等の **コールバック方式**（コールバック終了時に自動クローズ） | `open()` / `create()` / `append()` が素の `InputStream` / `OutputStream` を返す **通常の Java I/O**。**呼び出し側で明示的なクローズが必須**（`try-with-resources` を使う） |
| 簡易読み書き | `read()` / `createAsText()` 等 | `read()` / `write()` / `load()`（`byte[]`） / `save(byte[])` が同様に存在（型は Java の文字列・バイト配列） |
| 例外処理 | コールバック引数の `error` で受け取る | すべて `throws IOException`。呼び出し元で `try-catch` する |
| 用途 | プレゼンテーションページ・ファンクションコンテナ（JSSP） | JavaEE 開発モデルのサーブレット・EJB・バッチ・ワークフロー処理クラス等の Java ソース |

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は `jssp-page-generator`（`reference/api-storage.md`）を使うこと。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必読** — `final` ローカル変数、`try-with-resources`、文字列リテラル等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必読** — クラス/メソッド JavaDoc |
| `.github/instructions/java-logging.instructions.md` | 🟡 ログ実装時（`Logger.getLogger(XxxClass.class)`） |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## 3クラスの使い分け

| クラス | FQCN | 用途 | 保存先（既定ルート） | ライフサイクル |
|--------|------|------|----------------------|----------------|
| `PublicStorage` | `jp.co.intra_mart.foundation.service.client.file.PublicStorage` | 共有ファイル・アップロードファイル・添付ファイル等の永続データ | `storage/public` | 永続的（明示的に削除するまで残る） |
| `SessionScopeStorage` | `jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage` | 処理中の一時ファイル（アップロード一時保管、加工中データ等） | セッションID単位の一時領域 | セッション基盤側の管理下。**利用後は必ず明示的に削除すること**（実プラットフォームコードにも同様の運用注意が明記されている） |
| `SystemStorage` | `jp.co.intra_mart.foundation.service.client.file.SystemStorage` | システム内部リソース・基盤/アプリ内部処理用データ | `storage/system` | 永続的 |

3クラスとも `Storage<T>` インタフェース（`jp.co.intra_mart.foundation.service.client.file.Storage`）を実装し、実際の I/O メソッドは共通。差はコンストラクタで解決されるルートパスのみ。詳細は `reference/storage-api-reference.md` を参照。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| 基本的なファイル読み書き（テキスト・バイナリ、`try-with-resources`） | `assets/basic-file-operations.md` | `read`/`write`/`open`/`create`/`copy`/`move`/`remove` |
| ディレクトリ操作・一覧取得 | `assets/directory-operations.md` | `list`/`files`/`directories`/`makeDirectories`/フィルタ |
| 一時ファイル運用（`SessionScopeStorage`） | `assets/temp-file-lifecycle.md` | アップロード一時保存、処理後の確実な削除パターン |

### リファレンス

- `reference/storage-api-reference.md` — `Storage<T>` インタフェースの全メソッド一覧・シグネチャ・JavaDoc 要約、3クラスのコンストラクタ差分（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でファイルを保存する処理を作って」
- 「JavaEE 開発モデルで PublicStorage を使いたい」
- 「Java でアップロードファイルを一時領域に置きたい」
- 「SystemStorage で設定ファイルを読み込む処理を Java で書いて」
- 「バッチ処理から SessionScopeStorage の一時ファイルを削除したい」

「Java で」「JavaEE 開発モデルで」等の明示がなく、単に「ファイルを保存する処理を作って」とだけ依頼された場合は **JSSP 版（`jssp-page-generator` の `reference/api-storage.md`）をデフォルトとする**。プロジェクトの既存実装が Java 中心である場合のみ、Java 版が適切かユーザに確認する。

## 実装手順

1. ユーザの要件をヒアリング（永続/一時のどちらか、テキスト/バイナリ、読み込み/書き込み/削除等の操作種別、配置先パッケージ）
2. 用途に応じて `PublicStorage` / `SessionScopeStorage` / `SystemStorage` のいずれを使うか決定（上表参照。**ユーザの指定があればそちらを優先**）
3. 該当する `assets/` テンプレートを参照して実装（メソッドのシグネチャは `reference/storage-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **リソースリーク防止が最優先。** JSSP 版と異なりコールバックによる自動クローズは存在しない。`open()` / `create()` / `append()` で取得したストリームは必ず `try-with-resources` でクローズすること。`read()` / `write()` / `load()` / `save()` はストリームを内部でクローズ済みの簡易メソッドなので、少量データはこちらを優先する
- **大容量ファイルは `open()`/`create()` によるストリーム処理を使う。** `read()`/`load()` はファイル全体をメモリに読み込むため、大容量ファイルでは避ける
- **パスは常に相対パス。** 各コンストラクタの `path` はルート（`storage/public` 等）からの相対パスであり、絶対パスは指定できない
- **パス区切り文字は常に `/` 固定。** OS 依存の `File.separator` は使わない。パス組み立ては原則コンストラクタ（`new PublicStorage(parent, child)` 等）に任せる。詳細は `reference/storage-api-reference.md` の「パス区切り文字に関する注意」を参照
- **パストラバーサル対策。** ユーザ入力をファイル名・パスにそのまま使わない。`..` や `/`・`\` を含む入力はサニタイズまたは拒否する（Java 向けのセキュリティ規約が別途あればそちらを参照。無ければ `.github/instructions/jssp-security.instructions.md` の考え方を Java の例外機構に読み替えて適用する）
- **`SessionScopeStorage` は使用後に明示的に削除する。** 実プラットフォームコード（`WorkflowAttachFileUtil`）にも「一時領域のファイルはマシンを停止しない限り残り続けるため、利用後は必ず削除すること」という運用上の注意が明記されている。`finally` ブロックまたは処理完了後の明示的な `remove()` 呼び出しで確実に削除する
- 例外は `throws IOException` をそのまま伝播させるか、業務例外でラップする。エラーメッセージは `.github/instructions/java-javadoc.instructions.md` の規約に従い日本語で説明的に記述する

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. `open()`/`create()`/`append()` を使った箇所が `try-with-resources` でクローズされているか
2. `PublicStorage` / `SessionScopeStorage` / `SystemStorage` の選択が用途（永続/一時、公開/内部）に合っているか
3. `SessionScopeStorage` を使った一時ファイルが、処理完了後または例外時に確実に削除されるか
4. ユーザ入力をパスに使う箇所でパストラバーサル対策が入っているか
5. `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
6. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）でのファイル操作実装 | `jssp-page-generator`（`reference/api-storage.md`） |
| **Java（JavaEE 開発モデル）でのファイル操作実装** | **本スキル** |
| IM-Workflow の添付ファイル操作（プラットフォーム標準機能側） | プラットフォーム標準機能（`WorkflowAttachFileUtil` 等）。業務側で新規に実装するケースは通常発生しない |
