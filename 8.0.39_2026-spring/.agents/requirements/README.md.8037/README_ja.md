# コーディング規約

本ディレクトリには intra-mart Accel Platform スクリプト開発（JSSP）プロジェクトのコーディング規約を配置している。

## 規約適用の優先順位（最重要）

1. **仕様書を最優先**: 成果物の内容は `spec/*.md` 等の仕様書に従う。仕様書に書かれていることは規約より優先される。
2. **規約はフォールバック**: 仕様書に明記されていない事項のみ、本規約をデフォルトとして適用する。
3. **過剰適用を避ける**: 規約は「最低限のガードレール」であり「達成基準」ではない。仕様書に書かれていない要件を規約から類推して足し込まない。
   - 特に **業務要件依存の規約**（アクセシビリティ厳格度、文字数上限、複雑なエラーコード体系等）は、仕様書で明示指示が無ければ最小限の適用に留める。
   - 「念のため」で全規約を厚塗りすると、保守者が「なぜこの実装か」を判断できなくなる。

## 規約の参照方針

各規約ファイルには冒頭に **適用範囲** が明記されている。下表の **適用範囲タグ** を参考に、現在のタスクに関連する規約のみを `Read` ツールで読み込むこと。タスクに無関係な規約（例: DB 操作なしの画面で `.agents/requirements/jssp-2way-sql/AGENTS.md`）は読まなくてよい。

### 適用範囲タグの凡例

| タグ | 意味 | 取り扱い |
|------|------|---------|
| 🟢 **常時** | 全ての JSSP 実装で適用 | 必ず参照すること |
| 🟡 **文脈依存** | 該当機能を使う実装時のみ適用 | 該当機能を含まない場合は読まなくてよい |
| 🟠 **業務要件依存** | 仕様書で明示指示があった場合に厚く適用、無ければ最小限 | 仕様書を確認してから読む |

## 規約ファイル一覧（一行要約 + 適用範囲タグ）

### JSSP（スクリプト開発モデル）向け

| ファイル | 一行要約 | 適用範囲 |
|---------|---------|---------|
| `.agents/requirements/jssp-overview/AGENTS.md` | プロジェクト概要・技術スタック | 🟢 常時 |
| `.agents/requirements/jssp-file-structure/AGENTS.md` | ディレクトリ構造・ファイル命名 | 🟢 常時 |
| `.agents/requirements/jssp-code-style/AGENTS.md` | `let` / 文字列リテラル / 演算子 | 🟢 常時（`.js` 生成時） |
| `.agents/requirements/jssp-naming/AGENTS.md` | ファイル名・関数名・変数名 | 🟢 常時 |
| `.agents/requirements/jssp-function-container/AGENTS.md` | `init()` 関数構造・バリデーション・IM-共通マスタ API | 🟢 ファンクションコンテナ（`.js`）生成時 |
| `.agents/requirements/jssp-presentation-page/AGENTS.md` | プレゼンテーションページ（`.html`）構造・バリデーション・id 命名規約 | 🟢 プレゼンテーションページ（`.html`）生成時 |
| `.agents/requirements/jssp-error-handling/AGENTS.md` | try-catch / レスポンス構造 / エラーコード | 🟢 常時 |
| `.agents/requirements/jssp-security/AGENTS.md` | XSS / CSRF / 入力検証 | 🟢 常時（ユーザ入力扱う場面） |
| `.agents/requirements/jssp-logging/AGENTS.md` | ログレベル / 機密情報マスク / プレースホルダ | 🟡 ログ実装時 |
| `.agents/requirements/jssp-2way-sql/AGENTS.md` | 2WaySQL / `DbParameter` / トランザクション | 🟡 **DB 操作時のみ**（`db.executeByTemplate` / `db.execute` を使う場合） |
| `.agents/requirements/jssp-testing/AGENTS.md` | 単体テスト（jest-on-rhino） | 🟡 テスト実装時 |
| `.agents/requirements/jssp-performance/AGENTS.md` | コンパイラ設定 / session.js | 🟡 パフォーマンスチューニング時 |
| `.agents/requirements/jssp-accessibility/AGENTS.md` | ARIA / WCAG 2.1 AA / スクリーンリーダー | 🟠 **業務要件次第**（仕様書に明示指示があるときのみ厚く適用。指示がなければ `imdsConfirm` / 基本的な `aria-label` 等の最低限のみ） |

### 共通（JSSP / Java 両対応）

| ファイル | 一行要約 | 適用範囲 |
|---------|---------|---------|
| `.agents/requirements/database-ddl/AGENTS.md` | テーブル・カラム命名規約 / 型マッピング / 監査証跡カラム / 主キー・インデックス設計 / DDL で許可される構文 | 🟢 常時（新規テーブルの DDL 作成時。JSSP・Java どちらでテーブルを利用する場合も適用） |

### Java（JavaEE 開発モデル）向け

| ファイル | 一行要約 | 適用範囲 |
|---------|---------|---------|
| `.agents/requirements/java-architecture/AGENTS.md` | レイヤー構造・依存関係ルール・例外階層・ファクトリパターン | 🟢 常時（Java 実装時） |
| `.agents/requirements/java-service-layer/AGENTS.md` | サービス層（Service）の実装ルール・トランザクション境界・例外変換 | 🟢 常時（`service` パッケージ実装時） |
| `.agents/requirements/java-entity/AGENTS.md` | Entity クラス（Mirage ORM）の設計規約・監査証跡フィールド | 🟡 Entity クラス（`entity` パッケージ）生成時 |
| `.agents/requirements/java-code-style/AGENTS.md` | `final` / 文字列リテラル / `equals()` / raw type 禁止 | 🟢 常時（`.java` 生成時） |
| `.agents/requirements/java-naming/AGENTS.md` | パッケージ・クラス・メソッド・変数の命名規則 | 🟢 常時 |
| `.agents/requirements/java-javadoc/AGENTS.md` | クラス・メソッドの JavaDoc 記述規約 | 🟢 常時 |
| `.agents/requirements/java-logging/AGENTS.md` | ログレベル / 機密情報マスク / 例外タイプ別ログ判断 | 🟡 ログ実装時 |

## ローカライズ

各規約ファイルにはローカライズ版（`*_en.md`, `*_zh_CN.md`）が `*.md.<version>/` 配下にある。
プロジェクトのロケール設定に応じて自動で切り替わる。
