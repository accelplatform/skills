---
name: java-im-service-layer
description: Layer of service implementation rules for business logic and orchestration of repository operations. DDD service layer implementation guidelines. Service factory pattern for dependency management. Exception handling and business rule enforcement in service layer. The concise convention summary lives in the java-service-layer coding convention reference — use this skill when full code templates (single-repository / multi-repository transaction patterns) are needed.
disable-model-invocation: false
user-invocable: true
---

# Service Layer Implementation Rules (Full Template Collection)

## Overview
The service layer implements business logic and orchestrates operations that span multiple repositories.

> The essential points of the convention (guardrails) are summarized in `.agents/requirements/java-service-layer/AGENTS.md`. This skill is referenced from there and provides the complete code templates.

## Domain Service Interface

```java
public interface {ServiceName}Service {
    {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException;
    List<{DomainModel}> find{BusinessCriteria}({CriteriaType} criteria) throws {ServiceName}ServiceException;
    boolean validate{BusinessRule}({DomainModel} model) throws {ServiceName}ServiceException;
}
```

## Business Service Implementation

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {

    private final {EntityName}Repository {entityName}Repository;

    public Standard{ServiceName}Service() {
        this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
    }

    // Test constructor for dependency injection
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

**Reference**: `references/StandardServiceTemplate.java` — full template of a service implementation (constructor DI, validation, transaction management)

### Service Factory Standard
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

## Transaction Management

### How SessionTemplate.execute() Behaves
`SessionTemplate.execute()` opens a tenant database session and executes the lambda expression.
- On normal completion: **auto-commit**
- On exception: **auto-rollback**

### Transaction Boundary Rules
- **Required** The service layer owns the transaction boundary (the standard pattern)
- `SessionTemplate.execute()` can be nested. There is no operational problem using it in both the service layer and the repository layer
- **Recommended** Treat Pattern 1, in which the service layer manages the transaction, as the standard, and use Pattern 2 — where the repository manages its own transaction — only when the repository is used standalone

### Pattern 1: Service-Owned Transaction (Standard Pattern)

The service manages the transaction with `SessionTemplate.execute()`, and the repository is called within that session.

```java
// Service layer — owns the transaction boundary
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
    try {
        validateInput(input);
        return SessionTemplate.execute(s -> {
            // Repository call (executed within the session defined outside SessionTemplate)
            {DomainModel} entity = {entityName}Repository.findBy{BusinessKey}(input.get{BusinessKey}());
            {DomainModel} processed = applyBusinessRules(entity, input);
            {entityName}Repository.save(processed);
            return buildResult(processed);
        });
    } catch (RepositoryException e) {
        throw new {ServiceName}ServiceException("処理に失敗しました: " + e.getMessage(), e);
    }
}

// Repository layer — does not call SessionTemplate (operates within the service's session)
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

### Pattern 2: Standalone Repository Transaction

Only when the repository is used standalone, without going through a service, does the repository itself manage the transaction.

```java
// Repository layer — calls SessionTemplate itself when used standalone
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

## Validation and Business Rules

### Implementing validateInput()

Run validation at the start of the service method to eliminate invalid input early.
Validation is performed before the transaction starts (outside `SessionTemplate.execute()`).

```java
private void validateInput({InputType} input) throws {ServiceName}ServiceException {
    if (input == null) {
        throw new {ServiceName}ServiceException("入力が null です");
    }
    if (input.get{BusinessKey}() == null || input.get{BusinessKey}().isEmpty()) {
        throw new {ServiceName}ServiceException("{BusinessKey} は必須です");
    }
    // Business-specific validation
    if (input.getAmount() != null && input.getAmount().compareTo(BigDecimal.ZERO) < 0) {
        throw new {ServiceName}ServiceException("金額は0以上である必要があります: " + input.getAmount());
    }
}
```

### Implementing applyBusinessRules()

Apply business rules, updating and returning the domain model.
This is invoked inside the transaction (inside the lambda of `SessionTemplate.execute()`).

```java
private {DomainModel} applyBusinessRules({DomainModel} entity, {InputType} input)
        throws {ServiceName}ServiceException {
    // Validate state
    if (!entity.isEditable()) {
        throw new {ServiceName}ServiceException(
                "編集不可の状態です: " + entity.getStatus());
    }
    // Update the domain model
    entity.updateFrom(input);
    return entity;
}
```

## Service Layer Exception Hierarchy

Follow the naming conventions below in the service layer:

- **Service exception**: `{ServiceName}ServiceException extends Exception` (checked exception)
  - Business rule violations, invalid input, target data not found, etc.
- **Service runtime exception**: `{ServiceName}RuntimeException extends RuntimeException` (unchecked exception)
  - Programming errors, factory load failures, etc.

```java
// Service exception (checked exception)
public class {ServiceName}ServiceException extends Exception {
    public {ServiceName}ServiceException(String message) { super(message); }
    public {ServiceName}ServiceException(String message, Throwable cause) { super(message, cause); }
}

// Runtime exception (unchecked exception) — used in factories, etc.
public class {ServiceName}RuntimeException extends RuntimeException {
    public {ServiceName}RuntimeException(String message, Throwable cause) { super(message, cause); }
}
```

### Exception Conversion Rules
- **RepositoryException** → wrap in `{ServiceName}ServiceException` (preserving the cause)
- **RuntimeException (unexpected)** → let it propagate as-is (do not catch)
- Write exception messages in Japanese, including the variable values needed for troubleshooting

## Key Requirements

**Reference**: `references/MultiRepositoryServiceTemplate.java` — pattern for operating on multiple repositories within a single transaction

### Separation of Business Logic
- **Required** Implement pure business logic that does not include infrastructure concerns
- **Required** Coordinate operations that span multiple repositories
- **Required** Enforce business rules and validation
- **Prohibited** Do not expose implementation details to upper layers

### Error Handling
- **Required** Catch and wrap all exceptions from lower layers
- **Required** Provide error messages that are meaningful from a business perspective
- **Required** Preserve the exception chain for debugging

### Dependency Management
- **Required** Use the factory pattern for repository dependencies
- **Required** Support constructor injection for testing

## Related Skills and Conventions

- `.agents/requirements/java-service-layer/AGENTS.md` - Convention summary for this skill (always reference)
- `.agents/requirements/java-architecture/AGENTS.md` - Architecture principles and layer structure
- `.agents/requirements/java-entity/AGENTS.md` - Entity and domain model definitions
- `.agents/requirements/java-logging/AGENTS.md` - Logging implementation rules
- `java-im-architecture` - Architecture principles and general rules (full template collection)
- `java-im-mirage-usage` - DB access implementation for the repository/DAO layer
