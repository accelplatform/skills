# Architecture Conventions (Java)

> **Application Scope**: 🟢 **Always** — Applies to all application implementation in Java (JavaEE Development Model). Based on Clean Architecture / DDD principles.

## Layer Structure

```
Presentation Layer → Application Layer → Domain Layer → Infrastructure Layer
```

| Layer | Responsibility | Key Components |
|---|---|---|
| Presentation | External interface, request/response conversion, input validation, authentication/authorization | Endpoint, Request DTO, Response DTO, Validator |
| Application | Executing use cases, orchestrating domain services, the starting point for transaction control | UseCase, Job |
| Domain | Business rules, domain logic, domain model definitions | Model, Service (interface), Repository (interface), Exception |
| Infrastructure | Data persistence, external system integration, implementing domain interfaces | DAO, Entity, Service (impl), Repository (impl) |

### Dependency Rules

1. **Required** Outer layers depend on inner layers, never the reverse
2. **Required** The domain layer must have no external dependencies (DAO, DB framework, etc.)
3. **Required** The infrastructure layer implements the domain interfaces
4. **Required** The presentation layer only calls application-layer use cases; it must not directly reference the domain or infrastructure layers
5. See `.agents/skills/java-im-architecture/references/anti-patterns.md` for violation examples and fixes

## Package Structure

```
src/main/java/{package}/
├── presentation/{endpoint,request,response,validator}/
├── application/{usecase,job,exception}/
├── domain/{model,service,repository,exception}/
└── infrastructure/{dao,entity,model,repository,service}/
```

See `.agents/skills/java-im-architecture/references/full-stack-example.md` for an implementation example spanning all layers (DDL → Entity → DAO → Repository → Service → UseCase → Endpoint).

## Naming Conventions

Basic rules for class/method/variable names are in `java-naming/AGENTS.md`. This section only supplements class types that span multiple layers.

| Type | Naming pattern | Example |
|---|---|---|
| Endpoint | `{Resource}Endpoint` | `CategoryEndpoint` |
| Use case | `{Operation}UseCase` | `GetCategoryUseCase` |
| Job | `{JobName}Job` | `CategoryBatchJob` |
| Service factory | `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory` | `CategoryServiceFactory` |
| Repository factory | `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory` | `CategoryRepositoryFactory` |
| Application exception | `{ApplicationName}Exception` | `CategoryAppException` |

## Exception Hierarchy

| Type | Base | Usage |
|---|---|---|
| `ValidationException` | `RuntimeException` | Input validation in the presentation layer |
| `{ApplicationName}Exception` | `Exception` | Application layer |
| `{DomainName}Exception` / `{ServiceName}ServiceException` | `Exception` (checked) | Domain layer |
| `{DomainName}RuntimeException` | `RuntimeException` (unchecked) | Infrastructure layer, factories |

- Exception conversion must wrap a lower layer's exception in the upper layer's exception, preserving the cause (see `java-service-layer/AGENTS.md` for the service layer's details)
- Whether to log depends on the exception type. See "Log Level Decisions by Exception Type" in `java-logging/AGENTS.md`
  - **Prohibited** in particular: logging `ValidationException` and authorization errors

## Factory Pattern

- **Required** Use a factory (`{Name}Factory.getInstance()`) rather than `new` to obtain services and repositories
  - Reason: enables swapping implementations via `ServiceLoaderUtil` and mock injection during testing
- See `.agents/skills/java-im-architecture/SKILL.md` for the full factory implementation template

## Presentation Layer Responsibility Boundaries

**In scope**: receiving HTTP requests, input validation, applying authentication/authorization, DTO conversion, generating responses
**Out of scope**: executing business logic, directly manipulating domain models, DB access, transaction control, orchestrating multiple domain services

Use the `java-im-web-api-maker-usage` skill to implement REST API endpoints (Web API Maker annotations).

## Security Principles

- **Required** Do not log sensitive information (passwords, tokens, personal data) — see `java-logging/AGENTS.md`
- **Required** Validate and sanitize all user input in the presentation layer
- **Required** Use parameterized queries (2WaySQL) for SQL operations — see `java-im-mirage-usage`
- See `java-im-web-api-maker-usage` / `java-im-authz-usage` for authentication, authorization, OAuth, and secure token verification

## Documentation Conventions

See `java-javadoc/AGENTS.md` for class/method JavaDoc.

## Code Review Checklist

1. Layer boundaries and dependencies (especially whether the presentation layer directly references the domain layer)
2. Whether business logic has leaked into the presentation layer
3. Proper use of intra-mart APIs
4. Input validation, authorization, injection countermeasures
5. Test coverage

## Related

- `java-naming/AGENTS.md` - Naming conventions
- `java-code-style/AGENTS.md` - Coding style
- `java-javadoc/AGENTS.md` - JavaDoc conventions
- `java-logging/AGENTS.md` - Logging conventions
- `java-service-layer/AGENTS.md` - Service layer implementation conventions
- `java-entity/AGENTS.md` - Entity class conventions
- See `.agents/skills/java-im-architecture/SKILL.md` for the full anti-pattern catalog and the full-stack implementation example
