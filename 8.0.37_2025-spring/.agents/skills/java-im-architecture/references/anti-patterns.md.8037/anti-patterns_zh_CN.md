# 反模式集

常见的架构违规及其修正示例。可作为代码评审时的检查要点使用。

## 1. 从 Endpoint 直接调用 DAO

### NG
```java
@Path("/api/example/category/{id}")
@GET
public CategoryEntity get(@Variable(name = "id") String id) {
    // 表现层直接引用了基础设施层
    CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
    return dao.find(id);  // 直接返回 Entity
}
```

### OK
```java
@Path("/api/example/category/{id}")
@GET
public CategoryResponse get(@Variable(name = "id") String id) throws Exception {
    return useCase.execute(id);  // 通过 UseCase 调用
}
```

**理由**：跨越分层边界会导致业务逻辑应用遗漏、测试困难、Entity 暴露等问题。

## 2. 将 Entity 暴露给 API 响应

### NG
```java
public CategoryEntity getCategory(String id) {
    return dao.find(id);  // 直接将 Entity（public 字段 + DB 结构）暴露给外部
}
```

### OK
```java
public CategoryResponse getCategory(String id) {
    Category model = service.findById(id);
    return CategoryResponse.fromDomainModel(model);  // 转换为 Response DTO
}
```

**理由**：Entity 反映的是 DB 结构。内部列名、审计追踪信息会因此泄漏给客户端。

## 3. Repository 内包含业务逻辑

### NG
```java
public class StandardCategoryRepository implements CategoryRepository {
    @Override
    public void save(Category category) throws RepositoryException {
        // 在仓储内判断业务规则
        if (category.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RepositoryException("金額が不正です");
        }
        SessionTemplate.execute(s -> { /* ... */ });
    }
}
```

### OK
```java
// 在服务层进行校验
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

**理由**：仓储只负责数据访问与转换。业务规则是服务层的职责。

## 4. Domain 层依赖 Infrastructure

### NG
```java
package example.domain.service;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;       // NG：基础设施依赖
import jp.co.intra_mart.mirage.ext.session.SessionTemplate; // NG：基础设施依赖

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

import example.domain.repository.CategoryRepository;  // 领域层的接口

public class StandardCategoryService implements CategoryService {
    private final CategoryRepository repository;  // 仅依赖接口
    // ...
}
```

**理由**：领域层不得持有外部依赖。由基础设施层实现领域接口。

## 5. 空 catch（吞掉异常）

### NG
```java
try {
    repository.save(category);
} catch (RepositoryException e) {
    // 什么都不做 —— 异常被完全忽略
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

**理由**：吞掉异常会导致数据不一致无法被检测。应保留原因（cause）并重新抛出。

## 6. 事务边界错误

### NG：在 Endpoint 中管理事务
```java
@Path("/api/example/category")
@POST
public void create(@Body CategoryRequest request) {
    SessionTemplate.execute(s -> {  // 在表现层管理事务
        service.createCategory(request);
        return null;
    });
}
```

### OK：在 Service 中管理事务
```java
// 服务层持有事务边界
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

**理由**：事务边界应由服务层持有。表现层只需调用用例。

## 7. 异常消息使用英语（业务异常）

### NG
```java
throw new CategoryServiceException("Category not found: id=" + id);
```

### OK
```java
throw new CategoryServiceException("カテゴリが見つかりません: categoryId=" + id);
```

**理由**：异常消息须使用日语编写，并包含排查问题所需的变量值。日志消息则使用英语。

## 8. 未使用工厂模式（直接 new）

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

**理由**：使用工厂模式可通过 ServiceLoader 替换实现，测试时也易于注入 mock。

## 9. 校验异常时输出日志

### NG
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    LOGGER.error("Validation failed: " + errors);  // 不必要的日志
    throw new ValidationException(errors);
}
```

### OK
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    throw new ValidationException(errors);  // 不输出日志
}
```

**理由**：输入校验异常属于用户输入错误，并非系统故障，因此不需要输出日志。

## 10. 手动设置审计追踪字段

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
dao.insert(entity);  // AbstractDAO 会自动设置审计追踪字段
```

**理由**：AbstractDAO 的基本方法（insert/update）会自动设置审计追踪字段。禁止手动设置。
