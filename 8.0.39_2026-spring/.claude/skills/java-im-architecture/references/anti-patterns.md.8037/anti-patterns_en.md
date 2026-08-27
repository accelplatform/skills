# Anti-Pattern Catalog

Common architecture violations and their fixes. Use as a checklist during code review.

## 1. Calling a DAO Directly from an Endpoint

### NG
```java
@Path("/api/example/category/{id}")
@GET
public CategoryEntity get(@Variable(name = "id") String id) {
    // Presentation layer directly references the infrastructure layer
    CategoryDAO dao = DAOFactory.getTenantDatabaseDAO(CategoryDAO.class);
    return dao.find(id);  // Returns the Entity as-is
}
```

### OK
```java
@Path("/api/example/category/{id}")
@GET
public CategoryResponse get(@Variable(name = "id") String id) throws Exception {
    return useCase.execute(id);  // Called via a UseCase
}
```

**Reason**: Skipping layer boundaries causes business logic to be applied inconsistently, makes testing difficult, and exposes the Entity.

## 2. Exposing an Entity in an API Response

### NG
```java
public CategoryEntity getCategory(String id) {
    return dao.find(id);  // Exposes the Entity (public fields + DB structure) as-is
}
```

### OK
```java
public CategoryResponse getCategory(String id) {
    Category model = service.findById(id);
    return CategoryResponse.fromDomainModel(model);  // Converted to a Response DTO
}
```

**Reason**: The Entity reflects the DB structure. Internal column names and audit trail fields would leak to the client.

## 3. Business Logic Inside a Repository

### NG
```java
public class StandardCategoryRepository implements CategoryRepository {
    @Override
    public void save(Category category) throws RepositoryException {
        // Business rule judged inside the repository
        if (category.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RepositoryException("金額が不正です");
        }
        SessionTemplate.execute(s -> { /* ... */ });
    }
}
```

### OK
```java
// Validation in the service layer
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

**Reason**: A repository is responsible only for data access and conversion. Business rules are the service layer's responsibility.

## 4. Domain Layer Depending on Infrastructure

### NG
```java
package example.domain.service;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;       // NG: infrastructure dependency
import jp.co.intra_mart.mirage.ext.session.SessionTemplate; // NG: infrastructure dependency

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

import example.domain.repository.CategoryRepository;  // Domain-layer interface

public class StandardCategoryService implements CategoryService {
    private final CategoryRepository repository;  // Depends only on the interface
    // ...
}
```

**Reason**: The domain layer must have no external dependencies. The infrastructure layer implements the domain interface.

## 5. Empty catch (Swallowing an Exception)

### NG
```java
try {
    repository.save(category);
} catch (RepositoryException e) {
    // Does nothing — the exception is completely ignored
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

**Reason**: Swallowing an exception makes data inconsistencies undetectable. Preserve the cause and rethrow.

## 6. Wrong Transaction Boundary

### NG: Managing the Transaction in the Endpoint
```java
@Path("/api/example/category")
@POST
public void create(@Body CategoryRequest request) {
    SessionTemplate.execute(s -> {  // Transaction managed in the presentation layer
        service.createCategory(request);
        return null;
    });
}
```

### OK: Managing the Transaction in the Service
```java
// The service layer owns the transaction boundary
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

**Reason**: The service layer owns the transaction boundary. The presentation layer should only call the use case.

## 7. Exception Message in English (Business Exception)

### NG
```java
throw new CategoryServiceException("Category not found: id=" + id);
```

### OK
```java
throw new CategoryServiceException("カテゴリが見つかりません: categoryId=" + id);
```

**Reason**: Exception messages must be written in Japanese and include the variable values needed for troubleshooting. Log messages, on the other hand, are written in English.

## 8. Not Using the Factory Pattern (Direct `new`)

### NG
```java
public class GetCategoryUseCase {
    private final CategoryService service = new StandardCategoryService();  // Direct new
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

**Reason**: The factory pattern allows the implementation to be swapped via ServiceLoader, and makes mock injection easy during testing.

## 9. Logging on a Validation Exception

### NG
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    LOGGER.error("Validation failed: " + errors);  // Unnecessary logging
    throw new ValidationException(errors);
}
```

### OK
```java
List<String> errors = validator.validate(request);
if (!errors.isEmpty()) {
    throw new ValidationException(errors);  // No logging
}
```

**Reason**: An input validation exception is a user input error, not a system failure. Logging is unnecessary.

## 10. Manually Setting Audit Trail Fields

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
dao.insert(entity);  // AbstractDAO sets the audit trail fields automatically
```

**Reason**: The basic methods (insert/update) of AbstractDAO set the audit trail fields automatically. Setting them manually is prohibited.
