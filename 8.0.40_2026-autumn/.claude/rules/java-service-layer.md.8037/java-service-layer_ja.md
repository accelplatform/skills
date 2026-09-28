---
paths:
  - "**/service/*.java"
---

# サービス層実装規約（Java）

> **適用範囲**: 🟢 **常時** — `service` パッケージ配下のクラス（サービスインターフェース・実装）を生成・編集する際に適用。

## 概要

サービス層はビジネスロジックを実装し、複数のリポジトリにまたがる操作をオーケストレーションする。アーキテクチャ全体のレイヤー構造は `java-architecture.md` を参照。

## サービスインターフェースと実装

- **必須** ドメイン層に `interface {ServiceName}Service` を定義し、インフラストラクチャ層に `Standard{ServiceName}Service implements {ServiceName}Service` を実装すること
- **必須** コンストラクタでファクトリ経由の依存解決（デフォルトコンストラクタ）と、テスト用の依存性注入コンストラクタ（package-private）の両方を用意すること

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {
  private final {EntityName}Repository {entityName}Repository;

  public Standard{ServiceName}Service() {
    this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
  }

  // テスト用コンストラクタ（依存性注入）
  Standard{ServiceName}Service({EntityName}Repository repository) {
    this.{entityName}Repository = repository;
  }
}
```

完全なテンプレートは `.claude/skills/java-im-service-layer/references/StandardServiceTemplate.java` を参照。

## トランザクション管理

- **必須** トランザクション境界はサービス層が所有すること（標準パターン）
- `SessionTemplate.execute()` はテナントデータベースセッションを開き、正常終了時は自動コミット、例外発生時は自動ロールバックする
- リポジトリが単独利用される場合のみ、リポジトリ自身が `SessionTemplate.execute()` を呼んでよい

```java
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
  validateInput(input); // トランザクション開始前に実行
  try {
    return SessionTemplate.execute(s -> {
      {DomainModel} entity = {entityName}Repository.findBy{BusinessKey}(input.get{BusinessKey}());
      {DomainModel} processed = applyBusinessRules(entity, input);
      {entityName}Repository.save(processed);
      return buildResult(processed);
    });
  } catch (RepositoryException e) {
    throw new {ServiceName}ServiceException("処理に失敗しました: " + e.getMessage(), e);
  }
}
```

複数リポジトリを1トランザクションで扱う例は `.claude/skills/java-im-service-layer/references/MultiRepositoryServiceTemplate.java` を参照。

## バリデーションとビジネスルール

- **必須** `validateInput()` はトランザクション開始前（`SessionTemplate.execute()` の外側）で実行すること
- **必須** `applyBusinessRules()` はトランザクション内（ラムダ内）で実行し、ドメインモデルの状態検証・更新を行うこと

## 例外階層と変換ルール

| 種別 | 基底 | 用途 |
|---|---|---|
| `{ServiceName}ServiceException` | `Exception`（検査例外） | ビジネスルール違反、入力不正、対象データ不存在 |
| `{ServiceName}RuntimeException` | `RuntimeException`（非検査例外） | ファクトリロード失敗等のプログラミングエラー |

- **必須** `RepositoryException` は `{ServiceName}ServiceException` でラップすること（cause を保持）
- **必須** 予期しない `RuntimeException` はそのままスローすること（キャッチしない）
- 例外メッセージは日本語、トラブルシューティングに必要な変数値を含めること。ログ出力の要否・レベルは `java-logging.md` を参照

## 主要な要件

- **必須** インフラストラクチャの関心事を含まない純粋なビジネスロジックを実装すること
- **必須** 複数のリポジトリにまたがる操作をコーディネートすること
- **必須** 下位層のすべての例外をキャッチしてラップすること
- **必須** リポジトリの依存性にファクトリパターンを使用し、テスト用のコンストラクタインジェクションをサポートすること
- **禁止** 実装の詳細を上位層に公開しないこと

## 関連

- `java-architecture.md` - アーキテクチャ原則・レイヤー構造
- `java-entity.md` - Entity クラス規約
- `java-logging.md` - ログ出力規約
- 完全なサービス実装テンプレートは `.claude/skills/java-im-service-layer/SKILL.md` を参照
