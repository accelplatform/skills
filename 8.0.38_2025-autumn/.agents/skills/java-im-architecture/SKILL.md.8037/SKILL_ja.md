---
name: java-im-architecture
description: Architecture principles, patterns, and conventions for application development on the intra-mart platform (Java / JavaEE development model), based on Clean Architecture/DDD principles. Detailed templates for layer structure, dependency rules, naming conventions, error handling, factory patterns, security principles, and a full-stack implementation example. The concise convention summary lives in .agents/requirements/java-architecture/AGENTS.md — use this skill when full code templates or the anti-pattern catalog are needed.
disable-model-invocation: false
user-invocable: true
---

# アーキテクチャ原則と一般ルール（詳細テンプレート集）

## 概要

アプリケーションの全レイヤーに適用されるコアアーキテクチャ原則、パターン、規約。Clean Architecture/DDD原則に基づく、intra-martプラットフォーム（Java / JavaEE 開発モデル）上でのアプリケーション開発。

> 規約の要点（ガードレール）は `.agents/requirements/java-architecture/AGENTS.md` にまとめている。本スキルはそこから参照される、完全なコードテンプレート・アンチパターン集・全レイヤー縦断実装例を提供する。

## アーキテクチャ概要

### レイヤー構造
```
┌─────────────────────────────────────────┐
│        プレゼンテーション層                │
│    (REST API Endpoints, Request/       │
│     Response DTOs, Validation)         │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│          アプリケーション層                │
│    (Use Cases, Jobs, Orchestration)    │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│              ドメイン層                   │
│  (Models, Services, Repositories)       │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│         インフラストラクチャ層              │
│    (DAOs, Entities, External APIs)      │
└─────────────────────────────────────────┘
```

### 各レイヤーの責務

| レイヤー               | 責務                                                                             | 主要コンポーネント                                            |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| プレゼンテーション層   | 外部インターフェース、リクエスト/レスポンス変換、入力バリデーション、認証・認可  | Endpoint, Request DTO, Response DTO, Validator                |
| アプリケーション層     | ユースケースの実行、ドメインサービスのオーケストレーション、トランザクション制御 | UseCase, Job                                                  |
| ドメイン層             | ビジネスルール、ドメインロジック、ドメインモデルの定義                           | Model, Service (Interface), Repository (Interface), Exception |
| インフラストラクチャ層 | データ永続化、外部システム連携、ドメインインターフェースの実装                   | DAO, Entity, Service (Impl), Repository (Impl)                |

### 依存関係ルール
1. **外側のレイヤーは内側のレイヤーに依存し、その逆はない**
2. **ドメイン層は外部依存を持たない**
3. **インフラストラクチャ層はドメインインターフェースを実装する**
4. **アプリケーション層はドメインサービスをオーケストレーションする**
5. **プレゼンテーション層はアプリケーション層のユースケースを呼び出す（ドメイン層・インフラストラクチャ層を直接参照しない）**

### レイヤー間のデータフロー
```
[外部クライアント]
       │
       ▼
プレゼンテーション層: Request DTO → バリデーション → UseCase呼び出し
       │
       ▼
アプリケーション層: UseCase → ドメインモデルへ変換 → ドメインサービス呼び出し → 結果をResponse DTOへ変換
       │
       ▼
ドメイン層: ビジネスロジック実行 → リポジトリ呼び出し
       │
       ▼
インフラストラクチャ層: Entity変換 → DB操作 → Entity → ドメインモデルへ変換
```

**参照**: 全レイヤーを縦断する完全実装例は `references/full-stack-example.md` を参照。

## 命名規約

### パッケージ構造
```
src/main/java/{package}/
├── presentation/        # プレゼンテーション層
│   ├── endpoint/       # REST APIエンドポイント
│   ├── request/        # リクエストDTO
│   ├── response/       # レスポンスDTO
│   └── validator/      # 入力バリデーション
├── application/         # アプリケーション層
│   ├── usecase/        # ユースケース
│   ├── exception/      # アプリケーション例外
│   └── job/            # バックグラウンドジョブ
├── domain/              # ドメイン層
│   ├── model/          # ドメインモデルと値オブジェクト
│   ├── service/        # ドメインサービスインターフェース
│   ├── repository/     # リポジトリインターフェース
│   └── exception/      # ドメイン例外
└── infrastructure/      # インフラストラクチャ層
    ├── dao/            # データアクセス実装
    ├── entity/         # データベースエンティティ
    ├── model/          # インフラストラクチャモデル（内部用途）
    ├── repository/     # インフラストラクチャリポジトリ実装
    └── service/        # インフラストラクチャサービス実装
```

### クラス命名パターン

一般的なクラス・メソッド・変数の命名規則は `.agents/requirements/java-naming/AGENTS.md` を参照。ここではレイヤー別の補足のみ記載する。

#### プレゼンテーション層
- **エンドポイント**: `{Resource}Endpoint`
- **リクエストDTO**: `{Operation}Request`
- **レスポンスDTO**: `{Operation}Response`
- **バリデーター**: `{Operation}Validator`

#### アプリケーション層
- **ユースケース**: `{Operation}UseCase`
- **ジョブ**: `{JobName}Job`
- **例外**: `{ContextName}Exception`

#### ドメイン層
- **インターフェース**: `{EntityName}Repository`, `{ServiceName}Service`
- **ドメインモデル**: `{EntityName}`（シンプルな名前）
- **例外**: `{DomainName}Exception`
- **ファクトリ**: `{ServiceName}Factory`, `{ServiceName}ServiceFactory`

#### インフラストラクチャ層
- **実装**: `Standard{EntityName}Repository`, `Standard{ServiceName}Service`
- **エンティティ**: `{EntityName}Entity`

#### 例外クラス命名
- **サービス例外**: `{ServiceName}ServiceException`（例: `OrderServiceException`）
- **リポジトリ例外**: `RepositoryException`（共通）
- **ランタイム例外**: `{DomainName}RuntimeException`（例: `OrderRuntimeException`）
- **アプリケーション例外**: `{ApplicationName}Exception`（例: `OrderAppException`）

#### ファクトリクラス命名
- **サービスファクトリ**: `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory`
- **リポジトリファクトリ**: `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory`

#### プレースホルダ規約（スキル内テンプレート）
- **クラス名**: PascalCase `{EntityName}`, `{ServiceName}`
- **変数名**: camelCase `{entityName}`, `{serviceName}`
- **テーブル/カラム名**: snake_case `{table_name}`, `{column_name}`

### メソッド命名パターン
- **検索系**: `findBy{Criteria}`, `findAll{EntityName}s`, `findLatest{EntityName}`
- **業務操作**: `process{BusinessOperation}`, `calculate{BusinessMetric}`
- **検証**: `validate{BusinessRule}`, `is{BusinessState}`
- **変換**: `convertTo{TargetType}`, `transformTo{TargetFormat}`
- **ユーティリティ**: `build{Object}`, `create{Object}Instance`
- **ジョブ実行**: `execute`, `run`
- **ユースケース実行**: `execute`

## プレゼンテーション層の設計

Web API Makerのファクトリ + サービス（エンドポイント）の2クラス構成で実装する。リクエスト/レスポンスDTO・バリデーターの完全なコード例は `references/implementation-templates.md` の「プレゼンテーション層」を参照。

### 責務境界

**プレゼンテーション層が担うこと:**
- HTTPリクエストの受信とパース
- 入力バリデーション（形式チェック、必須チェック、型チェック）
- 認証・認可の適用（アノテーションベース）
- リクエストDTOからユースケースへの引き渡し
- ユースケースの結果をレスポンスDTOに変換
- HTTPレスポンスの生成（ステータスコード、ヘッダ等）
- エラーレスポンスのフォーマット

**プレゼンテーション層が担わないこと:**
- ビジネスロジックの実行
- ドメインモデルの直接操作
- データベースアクセス
- トランザクション制御
- 複数ドメインサービスのオーケストレーション

## アプリケーション層の設計

ユースケースは、リクエストDTOをドメインモデルへ変換し、ドメインサービスを呼び出し、結果をレスポンスDTOへ変換する薄い層として実装する。ドメイン例外はアプリケーション例外へラップする。完全なコード例は `references/implementation-templates.md` の「アプリケーション層」を参照。

## エラーハンドリング戦略

### 例外階層の分類
- **プレゼンテーション例外**（`ValidationException` 等）: 非検査例外
- **アプリケーション例外**（`{ApplicationName}Exception` 等）: 検査例外
- **ドメイン例外**（`{DomainName}Exception`, `{ServiceName}ServiceException` 等）: 検査例外
- **インフラストラクチャ例外**（`{DomainName}RuntimeException` 等）: 非検査例外

完全な例外クラス定義とレイヤー別ハンドリングの実装例は `references/implementation-templates.md` の「エラーハンドリング」を参照。

### ログ出力禁止の例外
- **禁止** 入力バリデーション例外（`ValidationException`）でログ出力しないこと — ユーザーの入力誤りでありシステム障害ではない
- **禁止** 権限チェック例外（認可エラー）でログ出力しないこと — 認可フレームワークが処理する
- 詳細は `.agents/requirements/java-logging/AGENTS.md` を参照

## ファクトリパターン実装

- **必須** サービス・リポジトリの取得には `new` ではなくファクトリ（`{Name}Factory.getInstance()`）を使用すること
  - 理由: `ServiceLoaderUtil` による実装差し替え、テスト時のモック注入を可能にするため
- 完全なサービスファクトリのテンプレートは `references/implementation-templates.md` の「ファクトリパターン」を参照
- DAOファクトリの利用は `java-im-mirage-usage` スキルを参照

### 設定ファイルパターン
- **SQLファイル**: `/META-INF/sql/{package_path}/{ClassName}/{methodName}.sql`
- **設定ファイル**: `/src/main/conf/{feature}/{config_name}-config.xml`
- **インポート設定**: `/src/main/conf/products/import/basic/{feature}/{config_name}.xml`
- **DDLファイル**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-ddl.sql`
- **認可設定**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-authz-*.xml`

## ログ出力標準

ログレベル・出力パターン・例外タイプ別の判断は `.agents/requirements/java-logging/AGENTS.md` を参照。

## セキュリティ原則

プレゼンテーション層のエンドポイントに認証・認可アノテーションを適用する。複数認証戦略の組み合わせや入力検証・サニタイズの完全なコード例は `references/implementation-templates.md` の「セキュリティ」を参照。詳細な認証方式・認可連携は `java-im-web-api-maker-usage` / `java-im-authz-usage` スキルを参照。

### データ保護
- **必須** 機密情報（パスワード、トークン、個人データ）をログに記録しない
- **必須** すべてのユーザー入力をプレゼンテーション層で検証・サニタイズする
- **必須** SQL操作にはパラメータ化クエリ（2WaySQL）を使用する。詳細は `java-im-mirage-usage` を参照

## パフォーマンスガイドライン

データベースアクセスのバッチ操作、ジョブ処理フレームワーク、集中型定数管理の完全なコード例は `references/implementation-templates.md` の「パフォーマンス」を参照。

## ドキュメント標準

コードドキュメント（JavaDoc）の記述規約は `.agents/requirements/java-javadoc/AGENTS.md` を参照。

### APIドキュメント
- **必須** すべての公開APIエンドポイントを日本語サマリーで文書化する
- **必須** リクエスト/レスポンスの例を含める
- **必須** 認証・認可要件を指定する
- **必須** エラー条件とレスポンスを文書化する

## 開発ワークフロー

**参照**: 頻出のアンチパターンと修正例は `references/anti-patterns.md` を参照。

### コードレビューガイドライン
1. **アーキテクチャ準拠**: レイヤー境界と依存関係を検証（特にプレゼンテーション層がドメイン層を直接参照していないか）
2. **プレゼンテーション層の責務**: エンドポイントにビジネスロジックが漏れていないか確認
3. **フレームワーク統合**: intra-mart APIの適切な使用を確認
4. **セキュリティレビュー**: 入力検証、認可、インジェクション保護を確認
5. **パフォーマンス影響**: バッチ処理をレビュー
6. **テストカバレッジ**: 適切なユニットテストと統合テストを確保

### 品質ゲート
- **コードコンパイル**: すべてのコードが警告なしでコンパイルされること
- **ユニットテスト**: ビジネスロジックで最低80%のカバレッジ
- **統合テスト**: すべてのAPIエンドポイントに統合テストが必要
- **セキュリティスキャン**: 重大なセキュリティ脆弱性がないこと、特にインジェクション
- **パフォーマンステスト**: バッチ操作がパフォーマンス要件を満たすこと

## 関連スキル・規約

- `.agents/requirements/java-architecture/AGENTS.md` - 本スキルの規約要約（常時参照）
- `.agents/requirements/java-naming/AGENTS.md` - 命名規則
- `.agents/requirements/java-code-style/AGENTS.md` - コーディングスタイル
- `.agents/requirements/java-javadoc/AGENTS.md` - JavaDoc規約
- `.agents/requirements/java-logging/AGENTS.md` - ログ実装規約
- `.agents/requirements/java-entity/AGENTS.md` - Entityクラス規約
- `java-im-service-layer` - サービス層実装ルール
- `java-im-web-api-maker-usage` - REST APIエンドポイント実装
- `java-im-mirage-usage` - DBアクセス実装（DAO/Repository）
- `java-im-authz-usage` - 認可（Authorization）実装
