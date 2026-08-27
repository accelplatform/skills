# 贯穿全层的实现示例

以单个业务功能（分类管理）为例，展示从 DDL 到 Endpoint 的全部分层实现。
说明各类的包结构位置以及层间的依赖关系。

## 包结构

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
│   │   ├── Category.java              ← 参考 SampleModel.java
│   │   └── CategoryStatus.java
│   ├── service/
│   │   ├── CategoryService.java       (interface)
│   │   └── CategoryServiceFactory.java
│   ├── repository/
│   │   ├── CategoryRepository.java    (interface)
│   │   └── CategoryRepositoryFactory.java  ← 参考 RepositoryFactoryTemplate.java
│   └── exception/
│       ├── RepositoryException.java
│       └── CategoryServiceException.java
└── infrastructure/
    ├── entity/
    │   └── CategoryEntity.java        ← 参考 SampleEntity.java
    ├── dao/
    │   └── CategoryDAO.java           ← 参考 SampleDAO.java
    ├── repository/
    │   ├── StandardCategoryRepository.java      ← 参考 StandardRepositoryTemplate.java
    │   └── StandardCategoryRepositoryFactory.java
    └── service/
        ├── StandardCategoryService.java         ← 参考 StandardServiceTemplate.java
        └── StandardCategoryServiceFactory.java

src/main/resources/
└── META-INF/sql/{packagePath}/infrastructure/dao/CategoryDAO/
    ├── find-by-id.sql                 ← 参考 sql-patterns.md
    └── find-by-condition.sql

src/main/storage/system/products/import/basic/{module_id}/
└── {module_id}-ddl.sql               ← 参考 ddl-templates.md
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

## 2. Entity（基础设施层）

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

    // 审计追踪（4个字段）
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

## 3. DAO（基础设施层）

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

## 5. Domain Model（领域层）

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

    // 仅提供 getter（不提供 setter）
    public String getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public int getSortOrder() { return sortOrder; }
    public CategoryStatus getStatus() { return status; }
    public boolean isActive() { return status == CategoryStatus.ACTIVE; }
    // ... 其他 getter 省略
}
```

## 6. Repository Interface（领域层）

```java
package example.domain.repository;

public interface CategoryRepository {
    Category findById(String categoryId) throws RepositoryException;
    List<Category> findAll() throws RepositoryException;
    void save(Category category) throws RepositoryException;
    void remove(String categoryId) throws RepositoryException;
}
```

## 7. Repository 实现（基础设施层）

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

    // ... remove、findAll 省略
}
```

## 8. Service Interface + 实现（领域层 + 基础设施层）

```java
// 领域层: interface
package example.domain.service;

public interface CategoryService {
    Category findById(String categoryId) throws CategoryServiceException;
    List<Category> findAll() throws CategoryServiceException;
}
```

```java
// 基础设施层: 实现
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

## 9. UseCase（应用层）

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

## 10. Endpoint（表现层）

```java
// 工厂
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
// 端点
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

## 数据流

```
[客户端] GET /api/example/category/CAT001
      │
      ▼
CategoryEndpoint.get("CAT001")
      │ 将 categoryId 传递给 UseCase
      ▼
GetCategoryUseCase.execute("CAT001")
      │ 调用 Service
      ▼
StandardCategoryService.findById("CAT001")
      │ 调用 Repository（异常会被包装为 ServiceException）
      ▼
StandardCategoryRepository.findById("CAT001")
      │ DAOFactory → DAO → sqlManager → 2way SQL → DB
      │ 将 Entity 转换为 Model
      ▼
CategoryDAO.findByCategoryId("CAT001")
      │ sqlManager.getSingleResult() → 执行 find-by-id.sql
      ▼
[DB] SELECT ... FROM exm_m_category WHERE category_id = 'CAT001'
```
