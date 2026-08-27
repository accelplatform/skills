---
applyTo: "**/*.java"
description: "アーキテクチャ規約（Java）（Clean Architecture / DDD に基づくレイヤー構造・依存関係ルール）"
---

# アーキテクチャ規約（Java）

> **適用範囲**: 🟢 **常時** — Java（JavaEE 開発モデル）でのアプリケーション実装全般に適用。Clean Architecture / DDD 原則に基づく。

## レイヤー構造

```
プレゼンテーション層 → アプリケーション層 → ドメイン層 → インフラストラクチャ層
```

| レイヤー | 責務 | 主要コンポーネント |
|---|---|---|
| プレゼンテーション層 | 外部インターフェース、リクエスト/レスポンス変換、入力バリデーション、認証・認可 | Endpoint, Request DTO, Response DTO, Validator |
| アプリケーション層 | ユースケースの実行、ドメインサービスのオーケストレーション、トランザクション制御の起点 | UseCase, Job |
| ドメイン層 | ビジネスルール、ドメインロジック、ドメインモデルの定義 | Model, Service（interface）, Repository（interface）, Exception |
| インフラストラクチャ層 | データ永続化、外部システム連携、ドメインインターフェースの実装 | DAO, Entity, Service（impl）, Repository（impl） |

### 依存関係ルール

1. **必須** 外側のレイヤーは内側のレイヤーに依存し、その逆はないこと
2. **必須** ドメイン層は外部依存（DAO・DB フレームワーク等）を持たないこと
3. **必須** インフラストラクチャ層がドメインインターフェースを実装すること
4. **必須** プレゼンテーション層はアプリケーション層のユースケースのみを呼び出し、ドメイン層・インフラストラクチャ層を直接参照しないこと
5. 違反例と修正例は `.github/skills/java-im-architecture/references/anti-patterns.md` を参照

## パッケージ構造

```
src/main/java/{package}/
├── presentation/{endpoint,request,response,validator}/
├── application/{usecase,job,exception}/
├── domain/{model,service,repository,exception}/
└── infrastructure/{dao,entity,model,repository,service}/
```

全レイヤーを縦断する実装例（DDL → Entity → DAO → Repository → Service → UseCase → Endpoint）は `.github/skills/java-im-architecture/references/full-stack-example.md` を参照。

## 命名規則

クラス名・メソッド名・変数名の基本規則は `java-naming.md` を参照。本規約ではレイヤー横断のクラス種別のみ補足する。

| 種別 | 命名パターン | 例 |
|---|---|---|
| エンドポイント | `{Resource}Endpoint` | `CategoryEndpoint` |
| ユースケース | `{Operation}UseCase` | `GetCategoryUseCase` |
| ジョブ | `{JobName}Job` | `CategoryBatchJob` |
| サービスファクトリ | `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory` | `CategoryServiceFactory` |
| リポジトリファクトリ | `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory` | `CategoryRepositoryFactory` |
| アプリケーション例外 | `{ApplicationName}Exception` | `CategoryAppException` |

## 例外階層

| 種別 | 基底 | 用途 |
|---|---|---|
| `ValidationException` | `RuntimeException` | プレゼンテーション層の入力バリデーション |
| `{ApplicationName}Exception` | `Exception` | アプリケーション層 |
| `{DomainName}Exception` / `{ServiceName}ServiceException` | `Exception`（検査例外） | ドメイン層 |
| `{DomainName}RuntimeException` | `RuntimeException`（非検査例外） | インフラストラクチャ層・ファクトリ |

- 例外変換は下位層の例外を上位層の例外でラップし、cause を保持すること（サービス層の詳細は `java-service-layer.md`）
- ログ出力可否は例外種別に依存する。詳細は `java-logging.md` の「例外タイプ別ログレベル判断」を参照
  - 特に **禁止**: `ValidationException` と認可エラーでのログ出力

## ファクトリパターン

- **必須** サービス・リポジトリの取得には `new` ではなくファクトリ（`{Name}Factory.getInstance()`）を使用すること
  - 理由: `ServiceLoaderUtil` による実装差し替え、テスト時のモック注入を可能にするため
- ファクトリ実装の完全なテンプレートは `.github/skills/java-im-architecture/SKILL.md` を参照

## プレゼンテーション層の責務境界

**担うこと**: HTTP リクエストの受信、入力バリデーション、認証・認可の適用、DTO 変換、レスポンス生成
**担わないこと**: ビジネスロジックの実行、ドメインモデルの直接操作、DB アクセス、トランザクション制御、複数ドメインサービスのオーケストレーション

REST API エンドポイントの実装（Web API Maker のアノテーション）は `java-im-web-api-maker-usage` スキルを使用すること。

## セキュリティ原則

- **必須** 機密情報（パスワード、トークン、個人データ）をログに記録しないこと（詳細は `java-logging.md`）
- **必須** すべてのユーザー入力をプレゼンテーション層で検証・サニタイズすること
- **必須** SQL 操作にはパラメータ化クエリ（2WaySQL）を使用すること。詳細は `java-im-mirage-usage` を参照
- 認証・認可・OAuth・セキュアトークン検証は `java-im-web-api-maker-usage` / `java-im-authz-usage` を参照

## ドキュメント規約

クラス・メソッドの JavaDoc は `java-javadoc.md` を参照。

## コードレビューの観点

1. レイヤー境界と依存関係（特にプレゼンテーション層がドメイン層を直接参照していないか）
2. プレゼンテーション層にビジネスロジックが漏れていないか
3. intra-mart API の適切な使用
4. 入力検証・認可・インジェクション対策
5. テストカバレッジ

## 関連

- `java-naming.md` - 命名規則
- `java-code-style.md` - コーディングスタイル
- `java-javadoc.md` - JavaDoc 規約
- `java-logging.md` - ログ出力規約
- `java-service-layer.md` - サービス層実装規約
- `java-entity.md` - Entity クラス規約
- 頻出アンチパターン集・全レイヤー縦断実装例は `.github/skills/java-im-architecture/SKILL.md` を参照
