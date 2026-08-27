---
applyTo: "**/service/*.java"
description: "サービス層実装規約（Java）（service パッケージのインターフェース・実装・依存解決）"
---

# Service Layer Implementation Conventions (Java)

> **Application Scope**: 🟢 **Always** — Applies when generating/editing classes under the `service` package (service interfaces and implementations).

## Overview

The service layer implements business logic and orchestrates operations that span multiple repositories. See `java-architecture.instructions.md` for the overall layer structure.

## Service Interfaces and Implementations

- **Required** Define `interface {ServiceName}Service` in the domain layer and implement `Standard{ServiceName}Service implements {ServiceName}Service` in the infrastructure layer
- **Required** Provide both a default constructor that resolves dependencies via a factory, and a package-private constructor for dependency injection in tests

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {
  private final {EntityName}Repository {entityName}Repository;

  public Standard{ServiceName}Service() {
    this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
  }

  // Test constructor (dependency injection)
  Standard{ServiceName}Service({EntityName}Repository repository) {
    this.{entityName}Repository = repository;
  }
}
```

See `.github/skills/java-im-service-layer/references/StandardServiceTemplate.java` for the full template.

## Transaction Management

- **Required** The service layer owns transaction boundaries (the standard pattern)
- `SessionTemplate.execute()` opens a tenant database session; it auto-commits on normal completion and auto-rolls back when an exception occurs
- A repository may call `SessionTemplate.execute()` itself only when it is used standalone (without going through a service)

```java
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
  validateInput(input); // Run before the transaction starts
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

See `.github/skills/java-im-service-layer/references/MultiRepositoryServiceTemplate.java` for an example that handles multiple repositories in a single transaction.

## Validation and Business Rules

- **Required** Run `validateInput()` before the transaction starts (outside `SessionTemplate.execute()`)
- **Required** Run `applyBusinessRules()` inside the transaction (inside the lambda), validating and updating the domain model's state

## Exception Hierarchy and Conversion Rules

| Type | Base | Usage |
|---|---|---|
| `{ServiceName}ServiceException` | `Exception` (checked) | Business rule violations, invalid input, target data not found |
| `{ServiceName}RuntimeException` | `RuntimeException` (unchecked) | Programming errors such as factory load failures |

- **Required** Wrap `RepositoryException` in `{ServiceName}ServiceException` (preserving the cause)
- **Required** Let unexpected `RuntimeException`s propagate as-is (do not catch them)
- Exception messages must be in Japanese and include variable values needed for troubleshooting. See `java-logging.instructions.md` for whether/at what level to log

## Key Requirements

- **Required** Implement pure business logic that does not include infrastructure concerns
- **Required** Coordinate operations that span multiple repositories
- **Required** Catch and wrap all exceptions from lower layers
- **Required** Use the factory pattern for repository dependencies, and support constructor injection for testing
- **Prohibited** Do not expose implementation details to upper layers

## Related

- `java-architecture.instructions.md` - Architecture principles and layer structure
- `java-entity.instructions.md` - Entity class conventions
- `java-logging.instructions.md` - Logging conventions
- See `.github/skills/java-im-service-layer/SKILL.md` for the full service implementation templates
