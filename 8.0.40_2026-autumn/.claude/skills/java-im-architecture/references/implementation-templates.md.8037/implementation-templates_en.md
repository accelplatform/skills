# Layer-Specific Implementation Templates

A collection of complete, layer-specific code templates referenced from each section of SKILL.md.

## Presentation Layer

### Endpoint Implementation Pattern

Implement using a two-class structure of a Web API Maker factory plus a service (endpoint). For detailed implementation patterns, see the `java-im-web-api-maker-usage` skill.

```java
/**
 * {リソース名}エンドポイントファクトリ
 */
@WebAPIMaker
public class {Resource}EndpointFactory {

    @ProvideFactory
    public static {Resource}EndpointFactory getFactory() {
        return new {Resource}EndpointFactory();
    }

    @ProvideService
    public {Resource}Endpoint getEndpoint() {
        return new {Resource}Endpoint();
    }
}
```

```java
/**
 * {リソース名}に関するREST APIエンドポイント
 */
@IMAuthentication
@Authz(uri = "service://{feature}/web/tenant", action = "execute")
@{Feature}
public class {Resource}Endpoint {

    private final {Operation}UseCase useCase;

    public {Resource}Endpoint() {
        this.useCase = new {Operation}UseCase();
    }

    @Path("/api/{feature}/{resource}/{operation}")
    @GET(summary = "{操作概要}", description = "{操作説明}")
    @Secured
    public {Operation}Response getOperation(
        @Required @Parameter(name = "param1", description = "パラメータ1") String param1
    ) throws {ApplicationName}Exception {
        // 1. Input validation
        List<String> errors = {Operation}Validator.validate(param1);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        // 2. Call the use case
        return useCase.execute(param1);
    }
}
```

### Request/Response DTOs

```java
// Request DTO - placed in the presentation layer
public class {Operation}Request {
    private String param1;
    private int param2;

    // getters/setters
    // Validation rules are delegated to the Validator
}

// Response DTO - placed in the presentation layer
public class {Operation}Response {
    private String resultField;
    private List<{Item}Response> items;

    // Conversion method from the domain model
    public static {Operation}Response fromDomainModel({DomainModel} model) {
        {Operation}Response response = new {Operation}Response();
        response.resultField = model.getField();
        response.items = model.getItems().stream()
            .map({Item}Response::fromDomainModel)
            .collect(Collectors.toList());
        return response;
    }
}
```

### Validator

```java
/**
 * {Operation}リクエストの入力検証
 */
public class {Operation}Validator {

    public static List<String> validate({Operation}Request request) {
        List<String> errors = new ArrayList<>();

        if (request.getParam1() == null || request.getParam1().isEmpty()) {
            errors.add("param1 is required");
        }

        if (request.getParam2() < 0) {
            errors.add("param2 must be non-negative");
        }

        return errors;
    }
}
```

## Application Layer

### Use Case Implementation Pattern

```java
/**
 * {業務操作}を実行するユースケース
 */
public class {Operation}UseCase {

    private static final Logger LOGGER = Logger.getLogger({Operation}UseCase.class);

    private final {ServiceName}Service service;

    public {Operation}UseCase() {
        this.service = {ServiceName}ServiceFactory.getInstance().get{ServiceName}Service();
    }

    /**
     * ユースケースを実行する
     *
     * @param request リクエストDTO
     * @return レスポンスDTO
     * @throws {ApplicationName}Exception 業務エラーが発生した場合
     */
    public {Operation}Response execute({Operation}Request request) throws {ApplicationName}Exception {
        try {
            // 1. Convert the request DTO into a domain model
            {DomainModel} domainModel = convertToDomainModel(request);

            // 2. Call the domain service
            {DomainResult} result = service.process{Operation}(domainModel);

            // 3. Convert the domain model into the response DTO
            return {Operation}Response.fromDomainModel(result);

        } catch ({DomainName}Exception e) {
            LOGGER.error("Failed to execute {operation}: " + e.getMessage(), e);
            throw new {ApplicationName}Exception("業務処理に失敗しました", e);
        }
    }

    private {DomainModel} convertToDomainModel({Operation}Request request) {
        // Conversion logic
    }
}
```

## Error Handling

### Exception Hierarchy

```java
// Presentation exception (input validation, etc.)
public class ValidationException extends RuntimeException

// Application exceptions
public class {ApplicationName}Exception extends Exception
public class {OperationName}Exception extends {ApplicationName}Exception

// Domain exceptions (checked)
public class {DomainName}Exception extends Exception
public class {DomainName}RepositoryException extends {DomainName}Exception
public class {ServiceName}ServiceException extends {DomainName}Exception
public class {OperationName}OperationException extends {DomainName}Exception

// Infrastructure exceptions (runtime)
public class {DomainName}RuntimeException extends RuntimeException
public class {SubDomainName}RuntimeException extends {DomainName}RuntimeException
public class {OperationName}RuntimeException extends {DomainName}RuntimeException
```

### Layer-Specific Exception Handling

```java
// Presentation layer: convert application exceptions into HTTP responses
try {
    {Operation}Response response = useCase.execute(request);
    return Response.ok(response);
} catch (ValidationException e) {
    return Response.status(400).entity(e.getErrors()).build();
} catch ({ApplicationName}Exception e) {
    LOGGER.warn("Business error in {operation}: " + e.getMessage());
    return Response.status(422).entity(e.getMessage()).build();
} catch (Exception e) {
    LOGGER.error("Unexpected error in {operation}", e);
    return Response.status(500).entity("Internal Server Error").build();
}

// Application layer: convert domain exceptions into application exceptions
try {
    return service.processOperation(domainModel);
} catch ({DomainName}Exception e) {
    throw new {ApplicationName}Exception("業務処理に失敗しました", e);
}

// Domain service layer: convert infrastructure exceptions into domain exceptions
try {
    // Business logic
} catch ({DomainName}RepositoryException e) {
    LOGGER.error("Failed to process {operation} for {entity}: " + entityId, e);
    throw new {ServiceName}ServiceException("{ビジネスコンテキスト/エラー詳細}", e);
}
```

## Factory Pattern

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

### DAO Factory Integration

```java
// Using the framework DAO factory (see the java-im-mirage-usage skill for details)
{EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);
```

## Security

### Authentication and Authorization

Apply via annotations on presentation-layer endpoints. For detailed authentication methods and authorization integration, see the `java-im-web-api-maker-usage` / `java-im-authz-usage` skills.

```java
// API endpoint security combining multiple authentication strategies
@IMAuthentication
@BasicAuthentication
@OAuth(scope = "{feature}")
@Authz(uri = "service://{feature}/web/tenant", action = "execute")
@{Feature}
public class {Resource}Endpoint {

    @Path("/api/{feature}/{resource}/{operation}")
    @GET(summary = "{操作概要}", description = "{操作説明}")
    @Secured
    public {Operation}Response secureOperation(
        @Required @Parameter(name = "param1", description = "パラメータ1") String param1
    ) throws {ApplicationName}Exception {
        // Implementation
    }
}
```

### Input Validation and Sanitization

Perform this in the presentation layer; pass only validated data on to the application layer and beyond.

```java
// Validate input at the presentation-layer endpoint
public Response processRequest({Operation}Request request) {
    // 1. Input validation (delegated to the Validator)
    List<String> errors = {Operation}Validator.validate(request);
    if (!errors.isEmpty()) {
        return Response.validationFailure(errors);
    }

    // 2. Call the use case with the validated request
    return useCase.execute(request);
}
```

## Performance

### Database Access Optimization

```java
// Batch operations to improve performance
public void saveAll(List<{EntityName}> entities) {
    {EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);

    for ({EntityName} entity : entities) {
        {EntityName}Entity entityData = convertToEntity(entity);
        dao.insert(entityData);
    }
    // Consider using batch insert operations for large datasets
}
```

### Job Processing Framework

```java
// Background job processing with parameter extraction
public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        // Extract job parameters
        final String targetPath = getParameter("targetPath");

        // Processing with progress tracking
        int processedCount = 0;
        // ... processing logic

        return JobResult.success("処理完了。総ドキュメント数: " + processedCount);
    }
}
```

### Constants and Configuration Management

```java
// Centralized constant management
public class Constants {
    public static final int DEFAULT_PAGE_SIZE = 50;
    public static final int MAX_BATCH_SIZE = 1000;
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
}
```
