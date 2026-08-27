---
name: java-im-architecture
description: Architecture principles, patterns, and conventions for application development on the intra-mart platform (Java / JavaEE development model), based on Clean Architecture/DDD principles. Detailed templates for layer structure, dependency rules, naming conventions, error handling, factory patterns, security principles, and a full-stack implementation example. The concise convention summary lives in the project's Java architecture convention file — use this skill when full code templates or the anti-pattern catalog are needed.
disable-model-invocation: false
user-invocable: true
---

# Architecture Principles and General Rules (Detailed Template Collection)

## Overview

Core architecture principles, patterns, and conventions applied across all layers of an application. Application development on the intra-mart platform (Java / JavaEE development model), based on Clean Architecture/DDD principles.

> The key points of the convention (the guardrails) are summarized in `.agents/requirements/java-architecture/AGENTS.md`. This skill provides the complete code templates, anti-pattern catalog, and a full-stack implementation example referenced from there.

## Architecture Overview

### Layer Structure
```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│    (REST API Endpoints, Request/       │
│     Response DTOs, Validation)         │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│         Application Layer                │
│    (Use Cases, Jobs, Orchestration)    │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│            Domain Layer                  │
│  (Models, Services, Repositories)       │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│        Infrastructure Layer              │
│    (DAOs, Entities, External APIs)      │
└─────────────────────────────────────────┘
```

### Responsibilities of Each Layer

| Layer               | Responsibility                                                                             | Key Components                                            |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Presentation Layer   | External interface, request/response conversion, input validation, authentication/authorization  | Endpoint, Request DTO, Response DTO, Validator                |
| Application Layer     | Executing use cases, orchestrating domain services, transaction control | UseCase, Job                                                  |
| Domain Layer             | Business rules, domain logic, definition of domain models                           | Model, Service (Interface), Repository (Interface), Exception |
| Infrastructure Layer | Data persistence, external system integration, implementation of domain interfaces                   | DAO, Entity, Service (Impl), Repository (Impl)                |

### Dependency Rules
1. **Outer layers depend on inner layers, never the reverse**
2. **The domain layer has no external dependencies**
3. **The infrastructure layer implements domain interfaces**
4. **The application layer orchestrates domain services**
5. **The presentation layer calls application-layer use cases (it never references the domain or infrastructure layers directly)**

### Data Flow Across Layers
```
[External Client]
       │
       ▼
Presentation Layer: Request DTO → Validation → Call UseCase
       │
       ▼
Application Layer: UseCase → Convert to domain model → Call domain service → Convert result to Response DTO
       │
       ▼
Domain Layer: Execute business logic → Call repository
       │
       ▼
Infrastructure Layer: Convert Entity → DB operation → Entity → Convert to domain model
```

**Reference**: See `references/full-stack-example.md` for a complete implementation example spanning all layers.

## Naming Conventions

### Package Structure
```
src/main/java/{package}/
├── presentation/        # Presentation layer
│   ├── endpoint/       # REST API endpoints
│   ├── request/        # Request DTOs
│   ├── response/       # Response DTOs
│   └── validator/      # Input validation
├── application/         # Application layer
│   ├── usecase/        # Use cases
│   ├── exception/      # Application exceptions
│   └── job/            # Background jobs
├── domain/              # Domain layer
│   ├── model/          # Domain models and value objects
│   ├── service/        # Domain service interfaces
│   ├── repository/     # Repository interfaces
│   └── exception/      # Domain exceptions
└── infrastructure/      # Infrastructure layer
    ├── dao/            # Data access implementation
    ├── entity/         # Database entities
    ├── model/          # Infrastructure models (internal use)
    ├── repository/     # Infrastructure repository implementation
    └── service/        # Infrastructure service implementation
```

### Class Naming Patterns

For general class/method/variable naming rules, see `.agents/requirements/java-naming/AGENTS.md`. Only layer-specific additions are described here.

#### Presentation Layer
- **Endpoint**: `{Resource}Endpoint`
- **Request DTO**: `{Operation}Request`
- **Response DTO**: `{Operation}Response`
- **Validator**: `{Operation}Validator`

#### Application Layer
- **Use case**: `{Operation}UseCase`
- **Job**: `{JobName}Job`
- **Exception**: `{ContextName}Exception`

#### Domain Layer
- **Interface**: `{EntityName}Repository`, `{ServiceName}Service`
- **Domain model**: `{EntityName}` (a simple name)
- **Exception**: `{DomainName}Exception`
- **Factory**: `{ServiceName}Factory`, `{ServiceName}ServiceFactory`

#### Infrastructure Layer
- **Implementation**: `Standard{EntityName}Repository`, `Standard{ServiceName}Service`
- **Entity**: `{EntityName}Entity`

#### Exception Class Naming
- **Service exception**: `{ServiceName}ServiceException` (e.g., `OrderServiceException`)
- **Repository exception**: `RepositoryException` (shared)
- **Runtime exception**: `{DomainName}RuntimeException` (e.g., `OrderRuntimeException`)
- **Application exception**: `{ApplicationName}Exception` (e.g., `OrderAppException`)

#### Factory Class Naming
- **Service factory**: `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory`
- **Repository factory**: `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory`

#### Placeholder Conventions (In-Skill Templates)
- **Class name**: PascalCase `{EntityName}`, `{ServiceName}`
- **Variable name**: camelCase `{entityName}`, `{serviceName}`
- **Table/column name**: snake_case `{table_name}`, `{column_name}`

### Method Naming Patterns
- **Lookup**: `findBy{Criteria}`, `findAll{EntityName}s`, `findLatest{EntityName}`
- **Business operation**: `process{BusinessOperation}`, `calculate{BusinessMetric}`
- **Validation**: `validate{BusinessRule}`, `is{BusinessState}`
- **Conversion**: `convertTo{TargetType}`, `transformTo{TargetFormat}`
- **Utility**: `build{Object}`, `create{Object}Instance`
- **Job execution**: `execute`, `run`
- **Use case execution**: `execute`

## Presentation Layer Design

Implement using a two-class structure of a Web API Maker factory plus a service (endpoint). For complete code examples of request/response DTOs and validators, see the "Presentation Layer" section of `references/implementation-templates.md`.

### Responsibility Boundary

**What the presentation layer is responsible for:**
- Receiving and parsing HTTP requests
- Input validation (format checks, required-field checks, type checks)
- Applying authentication/authorization (annotation-based)
- Passing request DTOs to use cases
- Converting use case results into response DTOs
- Generating HTTP responses (status codes, headers, etc.)
- Formatting error responses

**What the presentation layer is NOT responsible for:**
- Executing business logic
- Directly manipulating domain models
- Database access
- Transaction control
- Orchestrating multiple domain services

## Application Layer Design

Implement use cases as a thin layer that converts request DTOs into domain models, calls domain services, and converts the result into response DTOs. Wrap domain exceptions into application exceptions. For complete code examples, see the "Application Layer" section of `references/implementation-templates.md`.

## Error Handling Strategy

### Exception Hierarchy Classification
- **Presentation exceptions** (`ValidationException`, etc.): unchecked exceptions
- **Application exceptions** (`{ApplicationName}Exception`, etc.): checked exceptions
- **Domain exceptions** (`{DomainName}Exception`, `{ServiceName}ServiceException`, etc.): checked exceptions
- **Infrastructure exceptions** (`{DomainName}RuntimeException`, etc.): unchecked exceptions

For complete exception class definitions and layer-specific handling examples, see the "Error Handling" section of `references/implementation-templates.md`.

### Exceptions That Must Not Be Logged
- **Forbidden**: Do not log input validation exceptions (`ValidationException`) — these represent user input mistakes, not system failures
- **Forbidden**: Do not log authorization-check exceptions (authorization errors) — the authorization framework handles these
- See `.agents/requirements/java-logging/AGENTS.md` for details

## Factory Pattern Implementation

- **Required**: Use a factory (`{Name}Factory.getInstance()`) rather than `new` to obtain services and repositories
  - Rationale: to allow implementation swapping via `ServiceLoaderUtil` and mock injection during testing
- For the complete service factory template, see the "Factory Pattern" section of `references/implementation-templates.md`
- For DAO factory usage, see the `java-im-mirage-usage` skill

### Configuration File Patterns
- **SQL file**: `/META-INF/sql/{package_path}/{ClassName}/{methodName}.sql`
- **Configuration file**: `/src/main/conf/{feature}/{config_name}-config.xml`
- **Import configuration**: `/src/main/conf/products/import/basic/{feature}/{config_name}.xml`
- **DDL file**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-ddl.sql`
- **Authorization configuration**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-authz-*.xml`

## Logging Standards

See `.agents/requirements/java-logging/AGENTS.md` for log levels, output patterns, and how to decide by exception type.

## Security Principles

Apply authentication/authorization annotations to presentation-layer endpoints. For complete code examples combining multiple authentication strategies and input validation/sanitization, see the "Security" section of `references/implementation-templates.md`. For detailed authentication methods and authorization integration, see the `java-im-web-api-maker-usage` / `java-im-authz-usage` skills.

### Data Protection
- **Required**: Never log sensitive information (passwords, tokens, personal data)
- **Required**: Validate and sanitize all user input in the presentation layer
- **Required**: Use parameterized queries (2WaySQL) for SQL operations. See `java-im-mirage-usage` for details

## Performance Guidelines

For complete code examples of database access batch operations, the job processing framework, and centralized constant management, see the "Performance" section of `references/implementation-templates.md`.

## Documentation Standards

For code documentation (JavaDoc) writing conventions, see `.agents/requirements/java-javadoc/AGENTS.md`.

### API Documentation
- **Required**: Document all public API endpoints with a Japanese-language summary
- **Required**: Include request/response examples
- **Required**: Specify authentication/authorization requirements
- **Required**: Document error conditions and responses

## Development Workflow

**Reference**: See `references/anti-patterns.md` for common anti-patterns and their fixes.

### Code Review Guidelines
1. **Architecture compliance**: Verify layer boundaries and dependencies (especially whether the presentation layer directly references the domain layer)
2. **Presentation layer responsibility**: Confirm that business logic has not leaked into endpoints
3. **Framework integration**: Confirm proper use of intra-mart APIs
4. **Security review**: Confirm input validation, authorization, and injection protection
5. **Performance impact**: Review batch processing
6. **Test coverage**: Ensure adequate unit and integration tests

### Quality Gates
- **Code compilation**: All code must compile without warnings
- **Unit tests**: At least 80% coverage of business logic
- **Integration tests**: Integration tests required for all API endpoints
- **Security scan**: No critical security vulnerabilities, especially injection
- **Performance testing**: Batch operations must meet performance requirements

## Related Skills and Conventions

- `.agents/requirements/java-architecture/AGENTS.md` - Convention summary for this skill (always consult)
- `.agents/requirements/java-naming/AGENTS.md` - Naming conventions
- `.agents/requirements/java-code-style/AGENTS.md` - Coding style
- `.agents/requirements/java-javadoc/AGENTS.md` - JavaDoc conventions
- `.agents/requirements/java-logging/AGENTS.md` - Logging implementation conventions
- `.agents/requirements/java-entity/AGENTS.md` - Entity class conventions
- `java-im-service-layer` - Service layer implementation rules
- `java-im-web-api-maker-usage` - REST API endpoint implementation
- `java-im-mirage-usage` - DB access implementation (DAO/Repository)
- `java-im-authz-usage` - Authorization implementation
