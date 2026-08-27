---
name: java-im-service-layer
description: Layer of service implementation rules for business logic and orchestration of repository operations. DDD service layer implementation guidelines. Service factory pattern for dependency management. Exception handling and business rule enforcement in service layer. The concise convention summary lives in the java-service-layer coding convention reference — use this skill when full code templates (single-repository / multi-repository transaction patterns) are needed.
disable-model-invocation: false
user-invocable: true
---

# 服务层实现规则（完整模板集）

## 概述
服务层实现业务逻辑，并编排跨越多个仓储的操作。

> 规约的要点（护栏）汇总在 `.claude/rules/java-service-layer.md` 中。本技能从那里被引用，提供完整的代码模板。

## 领域服务接口

```java
public interface {ServiceName}Service {
    {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException;
    List<{DomainModel}> find{BusinessCriteria}({CriteriaType} criteria) throws {ServiceName}ServiceException;
    boolean validate{BusinessRule}({DomainModel} model) throws {ServiceName}ServiceException;
}
```

## 业务服务实现

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {

    private final {EntityName}Repository {entityName}Repository;

    public Standard{ServiceName}Service() {
        this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
    }

    // 用于依赖注入的测试构造函数
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

**参考**：`references/StandardServiceTemplate.java` — 服务实现的完整模板（构造函数依赖注入・校验・事务管理）

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

## 事务管理

### SessionTemplate.execute() 的行为
`SessionTemplate.execute()` 会开启租户数据库会话，并执行 lambda 表达式。
- 正常结束时：**自动提交**
- 发生异常时：**自动回滚**

### 事务边界规则
- **必须** 事务边界由服务层持有（标准模式）
- `SessionTemplate.execute()` 可以嵌套使用。在服务层与仓储层两处都使用也不会产生行为上的问题
- **推荐** 以服务层管理事务的模式1为标准，仅当仓储被单独使用时，才使用仓储自身管理事务的模式2

### 模式1：服务持有事务（标准模式）

服务通过 `SessionTemplate.execute()` 管理事务，仓储在该会话内被调用。

```java
// 服务层 — 持有事务边界
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
    try {
        validateInput(input);
        return SessionTemplate.execute(s -> {
            // 仓储调用（在 SessionTemplate 外部定义的会话内执行）
            {DomainModel} entity = {entityName}Repository.findBy{BusinessKey}(input.get{BusinessKey}());
            {DomainModel} processed = applyBusinessRules(entity, input);
            {entityName}Repository.save(processed);
            return buildResult(processed);
        });
    } catch (RepositoryException e) {
        throw new {ServiceName}ServiceException("処理に失敗しました: " + e.getMessage(), e);
    }
}

// 仓储层 — 不调用 SessionTemplate（在服务的会话内运行）
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

### 模式2：仓储单独事务

仅当仓储不经过服务而被单独使用时，才由仓储自身管理事务。

```java
// 仓储层 — 单独使用时自行调用 SessionTemplate
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

## 校验与业务规则

### validateInput() 的实现

在服务方法开头执行校验，尽早排除不正确的输入。
校验在事务开始之前（`SessionTemplate.execute()` 之外）进行。

```java
private void validateInput({InputType} input) throws {ServiceName}ServiceException {
    if (input == null) {
        throw new {ServiceName}ServiceException("入力が null です");
    }
    if (input.get{BusinessKey}() == null || input.get{BusinessKey}().isEmpty()) {
        throw new {ServiceName}ServiceException("{BusinessKey} は必須です");
    }
    // 业务专属校验
    if (input.getAmount() != null && input.getAmount().compareTo(BigDecimal.ZERO) < 0) {
        throw new {ServiceName}ServiceException("金額は0以上である必要があります: " + input.getAmount());
    }
}
```

### applyBusinessRules() 的实现

应用业务规则，更新并返回领域模型。
在事务内（`SessionTemplate.execute()` 的 lambda 内）被调用。

```java
private {DomainModel} applyBusinessRules({DomainModel} entity, {InputType} input)
        throws {ServiceName}ServiceException {
    // 校验状态
    if (!entity.isEditable()) {
        throw new {ServiceName}ServiceException(
                "編集不可の状態です: " + entity.getStatus());
    }
    // 更新领域模型
    entity.updateFrom(input);
    return entity;
}
```

## 服务层的异常层次结构

服务层遵循以下命名规约：

- **服务异常**：`{ServiceName}ServiceException extends Exception`（受检异常）
  - 业务规则违反、输入不正确、目标数据不存在等
- **服务运行时异常**：`{ServiceName}RuntimeException extends RuntimeException`（非受检异常）
  - 编程错误、工厂加载失败等

```java
// 服务异常（受检异常）
public class {ServiceName}ServiceException extends Exception {
    public {ServiceName}ServiceException(String message) { super(message); }
    public {ServiceName}ServiceException(String message, Throwable cause) { super(message, cause); }
}

// 运行时异常（非受检异常）— 用于工厂等场景
public class {ServiceName}RuntimeException extends RuntimeException {
    public {ServiceName}RuntimeException(String message, Throwable cause) { super(message, cause); }
}
```

### 异常转换规则
- **RepositoryException** → 包装为 `{ServiceName}ServiceException`（并保留 cause）
- **RuntimeException（非预期）** → 原样抛出（不捕获）
- 异常消息应使用日语编写，并包含排查问题所需的变量值

## 主要要求

**参考**：`references/MultiRepositoryServiceTemplate.java` — 在单个事务中操作多个仓储的模式

### 业务逻辑的分离
- **必须** 实现不含基础设施关注点的纯业务逻辑
- **必须** 协调跨越多个仓储的操作
- **必须** 强制执行业务规则与校验
- **禁止** 向上层暴露实现细节

### 错误处理
- **必须** 捕获并包装下层的所有异常
- **必须** 提供在业务上有意义的错误消息
- **必须** 为调试保留异常链

### 依赖管理
- **必须** 对仓储依赖使用工厂模式
- **必须** 支持测试用的构造函数注入

## 相关技能・规约

- `.claude/rules/java-service-layer.md` - 本技能的规约摘要（始终参考）
- `.claude/rules/java-architecture.md` - 架构原则・分层结构
- `.claude/rules/java-entity.md` - 实体・领域模型定义
- `.claude/rules/java-logging.md` - 日志实现规则
- `java-im-architecture` - 架构原则与通用规则（完整模板集）
- `java-im-mirage-usage` - 仓储・DAO 层的数据库访问实现
