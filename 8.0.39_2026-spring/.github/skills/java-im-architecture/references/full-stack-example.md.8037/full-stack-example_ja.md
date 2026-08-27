# 全レイヤー縦断実装例

1つの業務機能（カテゴリ管理）で、DDLからEndpointまで全レイヤーを実装する例。
各クラスの配置パッケージとレイヤー間の依存関係を示す。

## パッケージ構成

```
src/main/java/{packagePath}/
├── presentation/
│   ├── endpoint/
│   │   ├── CategoryEndpointFactory.java
│   │   └── CategoryEndpoint.java
│   └── response/
│       └── CategoryResponse.java
├── application/
│   └── usecase/
│       └── GetCategoryUseCase.java
├── domain/
│   ├── model/
│   │   ├── Category.java              ← SampleModel.java 参照
│   │   └── CategoryStatus.java
│   ├── service/
│   │   ├── CategoryService.java       (interface)
│   │   └── CategoryServiceFactory.java
│   ├── repository/
│   │   ├── CategoryRepository.java    (interface)
│   │   └── CategoryRepositoryFactory.java  ← RepositoryFactoryTemplate.java 参照
│   └── exception/
│       ├── RepositoryException.java
│       └── CategoryServiceException.java
└── infrastructure/
    ├── entity/
    │   └── CategoryEntity.java        ← SampleEntity.java 参照
    ├── dao/
    │   └── CategoryDAO.java           ← SampleDAO.java 参照
    ├── repository/
    │   ├── StandardCategoryRepository.java      ← StandardRepositoryTemplate.java 参照
    │   └── StandardCategoryRepositoryFactory.java
    └── service/
        ├── StandardCategoryService.java         ← StandardServiceTemplate.java 参照
        └── StandardCategoryServiceFactory.java

src/main/resources/
└── META-INF/sql/{packagePath}/infrastructure/dao/CategoryDAO/
    ├── find-by-id.sql                 ← sql-patterns.md 参照
    └── find-by-condition.sql

src/main/storage/system/products/import/basic/{module_id}/
└── {module_id}-ddl.sql               ← ddl-templates.md 参照
```

## 1. DDL

```sql
CREATE TABLE exm_m_category (
    category_id VARCHAR(15) NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    sort_order DECIMAL(10, 0) DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    create_user_cd VARCHAR(100) NOT NULL,
    create_date TIMESTAMP NOT NULL,
    record_user_cd VARCHAR(100) NOT NULL,
    record_date TIMESTAMP NOT NULL,
    PRIMARY KEY (category_id)
);
```

## 2. Entity（インフラストラクチャ層）

```java
package example.infrastructure.entity;

@Table(name = "exm_m_category")
public class CategoryEntity implements Serializable {
    @PrimaryKey(generationType = GenerationType.APPLICATION)
    @Column(name = "category_id")
    public String categoryId;

    @Column(name = "category_name")
    public String categoryName;

    @Column(name = "sort_order")
    public int sortOrder;

    @Column(name = "status")
    public String status;

    // 監査証跡（4フィールド）
    @Column(name = "create_user_cd")
    public String createUserCd;
    @Column(name = "create_date")
    public Timestamp createDate;
    @Column(name = "record_user_cd")
    public String recordUserCd;
    @Column(name = "record_date")
    public Timestamp recordDate;

    public CategoryEntity() {}

    public CategoryStatus getStatusAsEnum() {
        return (status != null) ? CategoryStatus.valueOf(status) : null;
    }

    public void setStatusFromEnum(CategoryStatus value) {
        this.status = (value != null) ? value.name() : null;
    }
}
```

## 3. DAO（インフラストラクチャ層）

```java
package example.infrastructure.dao;

public class CategoryDAO extends AbstractDAO<CategoryEntity> {
    private static final String SQL_PATH =
            "/META-INF/sql/example/infrastructure/dao/CategoryDAO/";

    public CategoryEntity findByCategoryId(final String categoryId) {
        final FindByIdCriteria criteria = new FindByIdCriteria();
        criteria.categoryId = categoryId;
        return sqlManager.getSingleResult(
                CategoryEntity.class, SQL_PATH.concat("find-by-id.sql"), criteria);
    }

    public List<CategoryEntity> findAll() {
        return sqlManager.getResultList(
                CategoryEntity.class, SQL_PATH.concat("find-by-condition.sql"));
    }

    public static class FindByIdCriteria {
        public String categoryId;
    }
}
```

## 4. SQL（2way SQL）

### `find-by-id.sql`
```sql
SELECT
  category_id, category_name, sort_order, status,
  create_user_cd, create_date, record_user_cd, record_date
FROM exm_m_category
WHERE category_id = /*categoryId*/'CAT001'
```

## 5. Domain Model（ドメイン層）

```java
package example.domain.model;

public class Category implements Serializable {
    private final String categoryId;
    private final String categoryName;
    private final int sortOrder;
    private final CategoryStatus status;
    private final String createUserCd;
    private final Date createDate;
    private final String recordUserCd;
    private final Date recordDate;

    public Category(String categoryId, String categoryName, int sortOrder,
            CategoryStatus status, String createUserCd, Date createDate,
            String recordUserCd, Date recordDate) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.sortOrder = sortOrder;
        this.status = status;
        this.createUserCd = createUserCd;
        this.createDate = (createDate != null) ? new Date(createDate.getTime()) : null;
        this.recordUserCd = recordUserCd;
        this.recordDate = (recordDate != null) ? new Date(recordDate.getTime()) : null;
    }

    // getter のみ（setter なし）
    public String getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public int getSortOrder() { return sortOrder; }
    public CategoryStatus getStatus() { return status; }
    public boolean isActive() { return status == CategoryStatus.ACTIVE; }
    // ... 他のgetter省略
}
```

## 6. Repository Interface（ドメイン層）

```java
package example.domain.repository;

public interface CategoryRepository {
    Category findById(String categoryId) throws RepositoryException;
    List<Category> findAll() throws RepositoryException;
    void save(Category category) throws RepositoryException;
    void remove(String categoryId) throws RepositoryException;
}
```

## 7. Repository実装（インフラストラクチャ層）

```java
package example.infrastructure.repository;

public class StandardCategoryRepository implements CategoryRepository {
    @Override
    public Category findById(final String categoryId) throws RepositoryException {
        try {
            final CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
            final CategoryEntity entity = dao.findByCategoryId(categoryId);
            return (entity != null) ? convertToModel(entity) : null;
        } catch (SQLRuntimeException e) {
            throw new RepositoryException("カテゴリの検索に失敗しました: " + categoryId, e);
        }
    }

    @Override
    public void save(final Category category) throws RepositoryException {
        try {
            SessionTemplate.execute(s -> {
                final CategoryEntity entity = convertToEntity(category);
                final CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
                if (dao.find(entity.categoryId) != null) {
                    dao.update(entity);
                } else {
                    dao.insert(entity);
                }
                return null;
            });
        } catch (SQLRuntimeException e) {
            throw new RepositoryException("カテゴリの保存に失敗しました", e);
        }
    }

    private Category convertToModel(final CategoryEntity e) {
        return new Category(e.categoryId, e.categoryName, e.sortOrder,
                e.getStatusAsEnum(), e.createUserCd,
                (e.createDate != null) ? new Date(e.createDate.getTime()) : null,
                e.recordUserCd,
                (e.recordDate != null) ? new Date(e.recordDate.getTime()) : null);
    }

    private CategoryEntity convertToEntity(final Category m) {
        final CategoryEntity e = new CategoryEntity();
        e.categoryId = m.getCategoryId();
        e.categoryName = m.getCategoryName();
        e.sortOrder = m.getSortOrder();
        e.setStatusFromEnum(m.getStatus());
        return e;
    }

    // ... remove, findAll 省略
}
```

## 8. Service Interface + 実装（ドメイン層 + インフラストラクチャ層）

```java
// ドメイン層: interface
package example.domain.service;

public interface CategoryService {
    Category findById(String categoryId) throws CategoryServiceException;
    List<Category> findAll() throws CategoryServiceException;
}
```

```java
// インフラストラクチャ層: 実装
package example.infrastructure.service;

public class StandardCategoryService implements CategoryService {
    private static final Logger LOGGER = Logger.getLogger(StandardCategoryService.class);
    private final CategoryRepository categoryRepository;

    public StandardCategoryService() {
        this.categoryRepository =
                CategoryRepositoryFactory.getInstance().getCategoryRepository();
    }

    StandardCategoryService(CategoryRepository repository) {
        this.categoryRepository = repository;
    }

    @Override
    public Category findById(String categoryId) throws CategoryServiceException {
        try {
            return categoryRepository.findById(categoryId);
        } catch (RepositoryException e) {
            LOGGER.error("Failed to find category: categoryId=" + categoryId, e);
            throw new CategoryServiceException("カテゴリの検索に失敗しました", e);
        }
    }

    // ... findAll 省略
}
```

## 9. UseCase（アプリケーション層）

```java
package example.application.usecase;

public class GetCategoryUseCase {
    private final CategoryService service;

    public GetCategoryUseCase() {
        this.service = CategoryServiceFactory.getInstance().getCategoryService();
    }

    public CategoryResponse execute(String categoryId) throws Exception {
        Category category = service.findById(categoryId);
        if (category == null) {
            return null;
        }
        return CategoryResponse.fromDomainModel(category);
    }
}
```

## 10. Endpoint（プレゼンテーション層）

```java
// ファクトリ
package example.presentation.endpoint;

@WebAPIMaker
public class CategoryEndpointFactory {
    @ProvideFactory
    public static CategoryEndpointFactory getFactory() {
        return new CategoryEndpointFactory();
    }
    @ProvideService
    public CategoryEndpoint getEndpoint() {
        return new CategoryEndpoint();
    }
}
```

```java
// エンドポイント
package example.presentation.endpoint;

@IMAuthentication
@Authz(uri = "service://example/api", action = "execute")
@ExampleCategory
public class CategoryEndpoint {
    private final GetCategoryUseCase useCase = new GetCategoryUseCase();

    @Path("/api/example/category/{categoryId}")
    @GET(summary = "カテゴリ取得", description = "IDでカテゴリを取得します")
    public CategoryResponse get(
            @Required @Variable(name = "categoryId", description = "カテゴリID") String categoryId
    ) throws Exception {
        return useCase.execute(categoryId);
    }
}
```

## データフロー

```
[クライアント] GET /api/example/category/CAT001
      │
      ▼
CategoryEndpoint.get("CAT001")
      │ categoryId を UseCase に渡す
      ▼
GetCategoryUseCase.execute("CAT001")
      │ Service を呼び出す
      ▼
StandardCategoryService.findById("CAT001")
      │ Repository を呼び出す（例外は ServiceException にラップ）
      ▼
StandardCategoryRepository.findById("CAT001")
      │ DAOFactory → DAO → sqlManager → 2way SQL → DB
      │ Entity → Model 変換
      ▼
CategoryDAO.findByCategoryId("CAT001")
      │ sqlManager.getSingleResult() → find-by-id.sql 実行
      ▼
[DB] SELECT ... FROM exm_m_category WHERE category_id = 'CAT001'
```
