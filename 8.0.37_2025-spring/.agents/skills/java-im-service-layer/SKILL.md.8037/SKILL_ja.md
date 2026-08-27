---
name: java-im-service-layer
description: Layer of service implementation rules for business logic and orchestration of repository operations. DDD service layer implementation guidelines. Service factory pattern for dependency management. Exception handling and business rule enforcement in service layer. The concise convention summary lives in .agents/requirements/java-service-layer/AGENTS.md — use this skill when full code templates (single-repository / multi-repository transaction patterns) are needed.
disable-model-invocation: false
user-invocable: true
---

# サービス層実装ルール（詳細テンプレート集）

## 概要
サービス層はビジネスロジックを実装し、複数のリポジトリにまたがる操作をオーケストレーションします。

> 規約の要点（ガードレール）は `.agents/requirements/java-service-layer/AGENTS.md` にまとめている。本スキルはそこから参照される、完全なコードテンプレートを提供する。

## ドメインサービスインターフェース

```java
public interface {ServiceName}Service {
    {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException;
    List<{DomainModel}> find{BusinessCriteria}({CriteriaType} criteria) throws {ServiceName}ServiceException;
    boolean validate{BusinessRule}({DomainModel} model) throws {ServiceName}ServiceException;
}
```

## ビジネスサービス実装

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {

    private final {EntityName}Repository {entityName}Repository;

    public Standard{ServiceName}Service() {
        this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
    }

    // 依存性注入によるテスト用コンストラクタ
    public Standard{ServiceName}Service({EntityName}Repository repository) {
        this.{entityName}Repository = repository;
    }

    @Override
    public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
        try {
            validateInput(input);
            return SessionTemplate.execute(s -> {
                {DomainModel} entity = {entityName}Repository.findBy{BusinessKey}(input.get{BusinessKey}());
                if (entity == null) {
                    throw new {ServiceName}ServiceException("エンティティが見つかりません: {BusinessKey}=" + input.get{BusinessKey}());
                }
                {DomainModel} processedEntity = applyBusinessRules(entity, input);
                {entityName}Repository.save(processedEntity);
                return buildResult(processedEntity);
            });
        } catch (RepositoryException e) {
            throw new {ServiceName}ServiceException("処理に失敗しました: " + e.getMessage(), e);
        }
    }
}
```

**参照**: `references/StandardServiceTemplate.java` — サービス実装の完全テンプレート（コンストラクタDI・バリデーション・トランザクション管理）

### サービスファクトリ標準
```java
import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;
import jp.co.intra_mart.common.platform.log.Logger;

public abstract class {ServiceName}ServiceFactory {

    private static final Logger LOGGER = Logger.getLogger({ServiceName}ServiceFactory.class);

    private static final class LazyHolder {
        private static final {ServiceName}ServiceFactory INSTANCE = load{ServiceName}ServiceFactory();

        private static {ServiceName}ServiceFactory load{ServiceName}ServiceFactory() {
            try {
                {ServiceName}ServiceFactory service = ServiceLoaderUtil.loadFirst({ServiceName}ServiceFactory.class);
                if (service != null) {
                    return service;
                }
                return new Standard{ServiceName}ServiceFactory();
            } catch (Exception e) {
                LOGGER.error("Failed to load {ServiceName}ServiceFactory", e);
                throw new {ServiceName}RuntimeException("Failed to load {ServiceName}ServiceFactory", e);
            }
        }
    }

    protected {ServiceName}ServiceFactory() {
        super();
    }

    public abstract {ServiceName}Service get{ServiceName}Service() throws {ServiceName}ServiceException;

    public static {ServiceName}ServiceFactory getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

## トランザクション管理

### SessionTemplate.execute() の動作
`SessionTemplate.execute()` はテナントデータベースセッションを開き、ラムダ式を実行します。
- 正常終了時: **自動コミット**
- 例外発生時: **自動ロールバック**

### トランザクション境界のルール
- **必須** トランザクション境界はサービス層が所有すること（標準パターン）
- `SessionTemplate.execute()` はネスト可能である。サービス層とリポジトリ層の両方で使用しても動作上の問題はない
- **推奨** サービス層がトランザクションを管理するパターン1を標準とし、リポジトリは単独利用時のみ自身でトランザクションを管理するパターン2を使用する

### パターン1: サービス所有トランザクション（標準パターン）

サービスが `SessionTemplate.execute()` でトランザクションを管理し、リポジトリはセッション内で呼ばれる。

```java
// サービス層 — トランザクション境界を所有
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
    try {
        validateInput(input);
        return SessionTemplate.execute(s -> {
            // リポジトリ呼び出し（SessionTemplate の外で定義されたセッション内で実行される）
            {DomainModel} entity = {entityName}Repository.findBy{BusinessKey}(input.get{BusinessKey}());
            {DomainModel} processed = applyBusinessRules(entity, input);
            {entityName}Repository.save(processed);
            return buildResult(processed);
        });
    } catch (RepositoryException e) {
        throw new {ServiceName}ServiceException("処理に失敗しました: " + e.getMessage(), e);
    }
}

// リポジトリ層 — SessionTemplate を呼ばない（サービスのセッション内で動作する）
@Override
public void save({DomainModel} model) throws RepositoryException {
    try {
        {EntityName}Entity entity = convertToEntity(model);
        final {EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);
        dao.insert(entity);
    } catch (SQLRuntimeException e) {
        throw new RepositoryException("{EntityName}の保存に失敗しました", e);
    }
}
```

### パターン2: リポジトリ単独トランザクション

リポジトリがサービスを経由せず単独で使用される場合のみ、リポジトリ自身がトランザクションを管理する。

```java
// リポジトリ層 — 単独利用時は自身で SessionTemplate を呼ぶ
@Override
public void save({DomainModel} model) throws RepositoryException {
    try {
        SessionTemplate.execute(s -> {
            {EntityName}Entity entity = convertToEntity(model);
            final {EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);
            dao.insert(entity);
            return null;
        });
    } catch (SQLRuntimeException e) {
        throw new RepositoryException("{EntityName}の保存に失敗しました", e);
    }
}
```

## バリデーションとビジネスルール

### validateInput() の実装

サービスメソッドの先頭でバリデーションを実行し、不正な入力を早期に排除する。
バリデーションはトランザクション開始前（`SessionTemplate.execute()` の外側）で行う。

```java
private void validateInput({InputType} input) throws {ServiceName}ServiceException {
    if (input == null) {
        throw new {ServiceName}ServiceException("入力が null です");
    }
    if (input.get{BusinessKey}() == null || input.get{BusinessKey}().isEmpty()) {
        throw new {ServiceName}ServiceException("{BusinessKey} は必須です");
    }
    // 業務固有のバリデーション
    if (input.getAmount() != null && input.getAmount().compareTo(BigDecimal.ZERO) < 0) {
        throw new {ServiceName}ServiceException("金額は0以上である必要があります: " + input.getAmount());
    }
}
```

### applyBusinessRules() の実装

ビジネスルールを適用し、ドメインモデルを更新して返す。
トランザクション内（`SessionTemplate.execute()` のラムダ内）で呼び出される。

```java
private {DomainModel} applyBusinessRules({DomainModel} entity, {InputType} input)
        throws {ServiceName}ServiceException {
    // 状態の検証
    if (!entity.isEditable()) {
        throw new {ServiceName}ServiceException(
                "編集不可の状態です: " + entity.getStatus());
    }
    // ドメインモデルの更新
    entity.updateFrom(input);
    return entity;
}
```

## サービス層の例外階層

サービス層では以下の命名規約に従う:

- **サービス例外**: `{ServiceName}ServiceException extends Exception`（検査例外）
  - ビジネスルール違反、入力不正、対象データ不存在等
- **サービスランタイム例外**: `{ServiceName}RuntimeException extends RuntimeException`（非検査例外）
  - プログラミングエラー、ファクトリロード失敗等

```java
// サービス例外（検査例外）
public class {ServiceName}ServiceException extends Exception {
    public {ServiceName}ServiceException(String message) { super(message); }
    public {ServiceName}ServiceException(String message, Throwable cause) { super(message, cause); }
}

// ランタイム例外（非検査例外）— ファクトリ等で使用
public class {ServiceName}RuntimeException extends RuntimeException {
    public {ServiceName}RuntimeException(String message, Throwable cause) { super(message, cause); }
}
```

### 例外変換ルール
- **RepositoryException** → `{ServiceName}ServiceException` でラップ（cause を保持）
- **RuntimeException（予期しない）** → そのままスロー（catch しない）
- 例外メッセージは日本語で記述し、トラブルシューティングに必要な変数値を含めること

## 主要な要件

**参照**: `references/MultiRepositoryServiceTemplate.java` — 複数リポジトリを1トランザクションで操作するパターン

### ビジネスロジックの分離
- **必須** インフラストラクチャの関心事を含まない純粋なビジネスロジックを実装すること
- **必須** 複数のリポジトリにまたがる操作をコーディネートすること
- **必須** ビジネスルールとバリデーションを強制すること
- **禁止** 実装の詳細を上位層に公開してはならない

### エラーハンドリング
- **必須** 下位層のすべての例外をキャッチしてラップすること
- **必須** ビジネス上意味のあるエラーメッセージを提供すること
- **必須** デバッグのために例外チェーンを保持すること

### 依存性管理
- **必須** リポジトリの依存性にファクトリパターンを使用すること
- **必須** テスト用にコンストラクタインジェクションをサポートすること

## 関連スキル・規約

- `.agents/requirements/java-service-layer/AGENTS.md` - 本スキルの規約要約（常時参照）
- `.agents/requirements/java-architecture/AGENTS.md` - アーキテクチャ原則・レイヤ構造
- `.agents/requirements/java-entity/AGENTS.md` - エンティティ・ドメインモデル定義
- `.agents/requirements/java-logging/AGENTS.md` - ログ実装ルール
- `java-im-architecture` - アーキテクチャ原則と一般ルール（詳細テンプレート集）
- `java-im-mirage-usage` - リポジトリ・DAO層のDBアクセス実装
