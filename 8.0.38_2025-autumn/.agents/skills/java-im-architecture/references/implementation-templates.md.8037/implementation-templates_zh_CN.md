# 分层实现模板

从 SKILL.md 各章节引用的、按层划分的完整代码模板集。

## 表现层

### 端点实现模式

采用 Web API Maker 的工厂 + 服务（端点）两个类的结构实现。详细的实现模式请参考 `java-im-web-api-maker-usage` 技能。

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
        // 1. 输入校验
        List<String> errors = {Operation}Validator.validate(param1);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        // 2. 调用用例
        return useCase.execute(param1);
    }
}
```

### 请求/响应 DTO

```java
// 请求 DTO - 放置在表现层
public class {Operation}Request {
    private String param1;
    private int param2;

    // getter/setter
    // 校验规则委托给 Validator
}

// 响应 DTO - 放置在表现层
public class {Operation}Response {
    private String resultField;
    private List<{Item}Response> items;

    // 从领域模型转换的方法
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

### 校验器

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

## 应用层

### 用例实现模式

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
            // 1. 将请求 DTO 转换为领域模型
            {DomainModel} domainModel = convertToDomainModel(request);

            // 2. 调用领域服务
            {DomainResult} result = service.process{Operation}(domainModel);

            // 3. 将领域模型转换为响应 DTO
            return {Operation}Response.fromDomainModel(result);

        } catch ({DomainName}Exception e) {
            LOGGER.error("Failed to execute {operation}: " + e.getMessage(), e);
            throw new {ApplicationName}Exception("業務処理に失敗しました", e);
        }
    }

    private {DomainModel} convertToDomainModel({Operation}Request request) {
        // 转换逻辑
    }
}
```

## 错误处理

### 异常层级

```java
// 表现层异常（输入校验等）
public class ValidationException extends RuntimeException

// 应用异常
public class {ApplicationName}Exception extends Exception
public class {OperationName}Exception extends {ApplicationName}Exception

// 领域异常（受检异常）
public class {DomainName}Exception extends Exception
public class {DomainName}RepositoryException extends {DomainName}Exception
public class {ServiceName}ServiceException extends {DomainName}Exception
public class {OperationName}OperationException extends {DomainName}Exception

// 基础设施异常（运行时异常）
public class {DomainName}RuntimeException extends RuntimeException
public class {SubDomainName}RuntimeException extends {DomainName}RuntimeException
public class {OperationName}RuntimeException extends {DomainName}RuntimeException
```

### 各层的异常处理

```java
// 表现层：将应用异常转换为 HTTP 响应
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

// 应用层：将领域异常转换为应用异常
try {
    return service.processOperation(domainModel);
} catch ({DomainName}Exception e) {
    throw new {ApplicationName}Exception("業務処理に失敗しました", e);
}

// 领域服务层：将基础设施异常转换为领域异常
try {
    // 业务逻辑
} catch ({DomainName}RepositoryException e) {
    LOGGER.error("Failed to process {operation} for {entity}: " + entityId, e);
    throw new {ServiceName}ServiceException("{ビジネスコンテキスト/エラー詳細}", e);
}
```

## 工厂模式

### 服务工厂标准

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

### DAO 工厂集成

```java
// 使用框架的 DAO 工厂（详情请参考 java-im-mirage-usage 技能）
{EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);
```

## 安全

### 认证与授权

通过注解应用到表现层的端点上。详细的认证方式・授权联动请参考 `java-im-web-api-maker-usage` / `java-im-authz-usage` 技能。

```java
// 组合多种认证策略的 API 端点安全防护
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
        // 实现
    }
}
```

### 输入校验与净化

在表现层执行，应用层及以后的层只接收已完成校验的数据。

```java
// 在表现层端点校验输入
public Response processRequest({Operation}Request request) {
    // 1. 输入校验（委托给 Validator）
    List<String> errors = {Operation}Validator.validate(request);
    if (!errors.isEmpty()) {
        return Response.validationFailure(errors);
    }

    // 2. 使用已校验的请求调用用例
    return useCase.execute(request);
}
```

## 性能

### 数据库访问优化

```java
// 为提升性能采用批量操作
public void saveAll(List<{EntityName}> entities) {
    {EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);

    for ({EntityName} entity : entities) {
        {EntityName}Entity entityData = convertToEntity(entity);
        dao.insert(entityData);
    }
    // 对于大数据集，可考虑使用批量插入操作
}
```

### 任务处理框架

```java
// 带参数提取的后台任务处理
public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        // 提取任务参数
        final String targetPath = getParameter("targetPath");

        // 带进度跟踪的处理
        int processedCount = 0;
        // ... 处理逻辑

        return JobResult.success("処理完了。総ドキュメント数: " + processedCount);
    }
}
```

### 常量与配置管理

```java
// 集中式常量管理
public class Constants {
    public static final int DEFAULT_PAGE_SIZE = 50;
    public static final int MAX_BATCH_SIZE = 1000;
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
}
```
