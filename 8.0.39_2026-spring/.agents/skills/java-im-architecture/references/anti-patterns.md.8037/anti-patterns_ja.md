# アンチパターン集

頻出のアーキテクチャ違反と修正例。コードレビュー時のチェックポイントとして活用する。

## 1. Endpoint から DAO を直接呼び出す

### NG
```java
@Path("/api/example/category/{id}")
@GET
public CategoryEntity get(@Variable(name = "id") String id) {
    // プレゼンテーション層からインフラストラクチャ層を直接参照
    CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
    return dao.find(id);  // Entity をそのまま返却
}
```

### OK
```java
@Path("/api/example/category/{id}")
@GET
public CategoryResponse get(@Variable(name = "id") String id) throws Exception {
    return useCase.execute(id);  // UseCase 経由で呼び出し
}
```

**理由**: レイヤー境界を飛び越えると、ビジネスロジックの適用漏れ、テスト困難、Entity露出が発生する。

## 2. Entity を API レスポンスに露出

### NG
```java
public CategoryEntity getCategory(String id) {
    return dao.find(id);  // Entity（publicフィールド + DB構造）をそのまま外部に公開
}
```

### OK
```java
public CategoryResponse getCategory(String id) {
    Category model = service.findById(id);
    return CategoryResponse.fromDomainModel(model);  // Response DTOに変換
}
```

**理由**: Entity はDB構造の反映。内部カラム名・監査証跡がクライアントに漏れる。

## 3. Repository 内にビジネスロジック

### NG
```java
public class StandardCategoryRepository implements CategoryRepository {
    @Override
    public void save(Category category) throws RepositoryException {
        // リポジトリ内でビジネスルールを判定
        if (category.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RepositoryException("金額が不正です");
        }
        SessionTemplate.execute(s -> { /* ... */ });
    }
}
```

### OK
```java
// サービス層でバリデーション
public class StandardCategoryService implements CategoryService {
    @Override
    public void save(Category category) throws CategoryServiceException {
        if (category.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new CategoryServiceException("金額は0以上である必要があります");
        }
        categoryRepository.save(category);
    }
}
```

**理由**: リポジトリはデータアクセスと変換のみ。ビジネスルールはサービス層の責務。

## 4. Domain 層が Infrastructure に依存

### NG
```java
package example.domain.service;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;       // NG: インフラ依存
import jp.co.intra_mart.mirage.ext.session.SessionTemplate; // NG: インフラ依存

public class CategoryService {
    public Category findById(String id) {
        CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
        // ...
    }
}
```

### OK
```java
package example.domain.service;

import example.domain.repository.CategoryRepository;  // ドメイン層のインターフェース

public class StandardCategoryService implements CategoryService {
    private final CategoryRepository repository;  // 依存はインターフェースのみ
    // ...
}
```

**理由**: ドメイン層は外部依存を持たない。インフラストラクチャ層がドメインインターフェースを実装する。

## 5. 空 catch（例外の握り潰し）

### NG
```java
try {
    repository.save(category);
} catch (RepositoryException e) {
    // 何もしない — 例外が完全に無視される
}
```

### OK
```java
try {
    repository.save(category);
} catch (RepositoryException e) {
    LOGGER.error("Failed to save category: categoryId=" + category.getCategoryId(), e);
    throw new CategoryServiceException("カテゴリの保存に失敗しました", e);
}
```

**理由**: 例外を握り潰すとデータ不整合が検知できない。原因（cause）を保持して再スローする。

## 6. トランザクション境界の誤り

### NG: Endpoint でトランザクション管理
```java
@Path("/api/example/category")
@POST
public void create(@Body CategoryRequest request) {
    SessionTemplate.execute(s -> {  // プレゼンテーション層でトランザクション管理
        service.createCategory(request);
        return null;
    });
}
```

### OK: Service でトランザクション管理
```java
// サービス層がトランザクション境界を所有
public void createCategory(Category category) throws CategoryServiceException {
    try {
        SessionTemplate.execute(s -> {
            categoryRepository.save(category);
            return null;
        });
    } catch (RepositoryException e) {
        throw new CategoryServiceException("カテゴリの作成に失敗しました", e);
    }
}
```

**理由**: トランザクション境界はサービス層が所有する。プレゼンテーション層はユースケースを呼ぶだけ。

## 7. 例外メッセージが英語（ビジネス例外）

### NG
```java
throw new CategoryServiceException("Category not found: id=" + id);
```

### OK
```java
throw new CategoryServiceException("カテゴリが見つかりません: categoryId=" + id);
```

**理由**: 例外メッセージは日本語で記述し、トラブルシューティングに必要な変数値を含める。ログメッセージは英語。

## 8. ファクトリパターン未使用（直接 new）

### NG
```java
public class GetCategoryUseCase {
    private final CategoryService service = new StandardCategoryService();  // 直接 new
}
```

### OK
```java
public class GetCategoryUseCase {
    private final CategoryService service;

    public GetCategoryUseCase() {
        this.service = CategoryServiceFactory.getInstance().getCategoryService();
    }
}
```

**理由**: ファクトリパターンにより、ServiceLoader での実装差し替えが可能になる。テスト時のモック注入も容易。

## 9. バリデーション例外でログ出力

### NG
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    LOGGER.error("Validation failed: " + errors);  // 不要なログ
    throw new ValidationException(errors);
}
```

### OK
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    throw new ValidationException(errors);  // ログ出力しない
}
```

**理由**: 入力バリデーション例外はユーザーの入力誤りであり、システム障害ではない。ログ出力は不要。

## 10. 監査証跡フィールドの手動設定

### NG
```java
entity.createUserCd = "admin";
entity.createDate = new Timestamp(System.currentTimeMillis());
entity.recordUserCd = "admin";
entity.recordDate = new Timestamp(System.currentTimeMillis());
dao.insert(entity);
```

### OK
```java
dao.insert(entity);  // AbstractDAO が監査証跡を自動設定する
```

**理由**: AbstractDAOの基本メソッド（insert/update）は監査証跡フィールドを自動設定する。手動設定は禁止。
