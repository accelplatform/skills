# レイヤー別実装テンプレート

SKILL.md の各セクションから参照される、レイヤー別の完全なコードテンプレート集。

## プレゼンテーション層

### エンドポイント実装パターン

Web API Makerのファクトリ + サービス（エンドポイント）の2クラス構成で実装する。詳細な実装パターンは `java-im-web-api-maker-usage` スキルを参照。

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
        // 1. 入力バリデーション
        List<String> errors = {Operation}Validator.validate(param1);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        // 2. ユースケース呼び出し
        return useCase.execute(param1);
    }
}
```

### リクエスト/レスポンスDTO

```java
// リクエストDTO - プレゼンテーション層に配置
public class {Operation}Request {
    private String param1;
    private int param2;

    // getter/setter
    // バリデーションルールはValidatorに委譲
}

// レスポンスDTO - プレゼンテーション層に配置
public class {Operation}Response {
    private String resultField;
    private List<{Item}Response> items;

    // ドメインモデルからの変換メソッド
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

### バリデーター

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

## アプリケーション層

### ユースケース実装パターン

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
            // 1. リクエストDTOからドメインモデルへの変換
            {DomainModel} domainModel = convertToDomainModel(request);

            // 2. ドメインサービスの呼び出し
            {DomainResult} result = service.process{Operation}(domainModel);

            // 3. ドメインモデルからレスポンスDTOへの変換
            return {Operation}Response.fromDomainModel(result);

        } catch ({DomainName}Exception e) {
            LOGGER.error("Failed to execute {operation}: " + e.getMessage(), e);
            throw new {ApplicationName}Exception("業務処理に失敗しました", e);
        }
    }

    private {DomainModel} convertToDomainModel({Operation}Request request) {
        // 変換ロジック
    }
}
```

## エラーハンドリング

### 例外階層

```java
// プレゼンテーション例外（入力バリデーション等）
public class ValidationException extends RuntimeException

// アプリケーション例外
public class {ApplicationName}Exception extends Exception
public class {OperationName}Exception extends {ApplicationName}Exception

// ドメイン例外（検査例外）
public class {DomainName}Exception extends Exception
public class {DomainName}RepositoryException extends {DomainName}Exception
public class {ServiceName}ServiceException extends {DomainName}Exception
public class {OperationName}OperationException extends {DomainName}Exception

// インフラストラクチャ例外（実行時例外）
public class {DomainName}RuntimeException extends RuntimeException
public class {SubDomainName}RuntimeException extends {DomainName}RuntimeException
public class {OperationName}RuntimeException extends {DomainName}RuntimeException
```

### レイヤー別例外ハンドリング

```java
// プレゼンテーション層: アプリケーション例外をHTTPレスポンスに変換
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

// アプリケーション層: ドメイン例外をアプリケーション例外に変換
try {
    return service.processOperation(domainModel);
} catch ({DomainName}Exception e) {
    throw new {ApplicationName}Exception("業務処理に失敗しました", e);
}

// ドメインサービス層: インフラ例外をドメイン例外に変換
try {
    // ビジネスロジック
} catch ({DomainName}RepositoryException e) {
    LOGGER.error("Failed to process {operation} for {entity}: " + entityId, e);
    throw new {ServiceName}ServiceException("{ビジネスコンテキスト/エラー詳細}", e);
}
```

## ファクトリパターン

### サービスファクトリ標準

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

### DAOファクトリ統合

```java
// フレームワークDAOファクトリの使用（詳細は java-im-mirage-usage スキルを参照）
{EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);
```

## セキュリティ

### 認証と認可

プレゼンテーション層のエンドポイントにアノテーションで適用する。詳細な認証方式・認可連携は `java-im-web-api-maker-usage` / `java-im-authz-usage` スキルを参照。

```java
// 複数認証戦略によるAPIエンドポイントセキュリティ
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
        // 実装
    }
}
```

### 入力検証とサニタイズ

プレゼンテーション層で実施し、アプリケーション層以降にはバリデーション済みデータのみを渡す。

```java
// プレゼンテーション層のエンドポイントで入力を検証
public Response processRequest({Operation}Request request) {
    // 1. 入力バリデーション（Validatorに委譲）
    List<String> errors = {Operation}Validator.validate(request);
    if (!errors.isEmpty()) {
        return Response.validationFailure(errors);
    }

    // 2. バリデーション済みリクエストでユースケース呼び出し
    return useCase.execute(request);
}
```

## パフォーマンス

### データベースアクセス最適化

```java
// パフォーマンス向上のためのバッチ操作
public void saveAll(List<{EntityName}> entities) {
    {EntityName}DAO dao = DAOFactory.getTenantDatabaseDAO({EntityName}DAO.class);

    for ({EntityName} entity : entities) {
        {EntityName}Entity entityData = convertToEntity(entity);
        dao.insert(entityData);
    }
    // 大量データセットにはバッチインサート操作の使用を検討
}
```

### ジョブ処理フレームワーク

```java
// パラメータ抽出によるバックグラウンドジョブ処理
public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        // ジョブパラメータの抽出
        final String targetPath = getParameter("targetPath");

        // 進捗追跡付き処理
        int processedCount = 0;
        // ... 処理ロジック

        return JobResult.success("処理完了。総ドキュメント数: " + processedCount);
    }
}
```

### 定数と設定管理

```java
// 集中型定数管理
public class Constants {
    public static final int DEFAULT_PAGE_SIZE = 50;
    public static final int MAX_BATCH_SIZE = 1000;
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
}
```
