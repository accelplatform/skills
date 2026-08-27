# 服务层实现规约（Java）

> **适用范围**: 🟢 **始终** — 生成・编辑 `service` 包下的类（服务接口・实现）时适用。

## 概述

服务层实现业务逻辑，并编排跨越多个仓储的操作。整体分层结构请参考 `java-architecture/AGENTS.md`。

## 服务接口与实现

- **必须** 在领域层定义 `interface {ServiceName}Service`，并在基础设施层实现 `Standard{ServiceName}Service implements {ServiceName}Service`
- **必须** 同时提供通过工厂解析依赖的默认构造函数，以及供测试使用的（包私有）依赖注入构造函数

```java
public class Standard{ServiceName}Service implements {ServiceName}Service {
  private final {EntityName}Repository {entityName}Repository;

  public Standard{ServiceName}Service() {
    this.{entityName}Repository = {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
  }

  // 测试用构造函数（依赖注入）
  Standard{ServiceName}Service({EntityName}Repository repository) {
    this.{entityName}Repository = repository;
  }
}
```

完整模板请参考 `.agents/skills/java-im-service-layer/references/StandardServiceTemplate.java`。

## 事务管理

- **必须** 事务边界由服务层持有（标准模式）
- `SessionTemplate.execute()` 会开启租户数据库会话：正常结束时自动提交，发生异常时自动回滚
- 仅当仓储被单独使用（不经过服务层）时，才允许仓储自身调用 `SessionTemplate.execute()`

```java
public {ResultType} process{BusinessOperation}({InputType} input) throws {ServiceName}ServiceException {
  validateInput(input); // 在事务开始前执行
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

在单个事务中操作多个仓储的示例请参考 `.agents/skills/java-im-service-layer/references/MultiRepositoryServiceTemplate.java`。

## 校验与业务规则

- **必须** 在事务开始前（`SessionTemplate.execute()` 之外）执行 `validateInput()`
- **必须** 在事务内（lambda 内部）执行 `applyBusinessRules()`，对领域模型进行状态校验与更新

## 异常层次与转换规则

| 类别 | 基类 | 用途 |
|---|---|---|
| `{ServiceName}ServiceException` | `Exception`（受检异常） | 业务规则违反、输入不正确、对象数据不存在 |
| `{ServiceName}RuntimeException` | `RuntimeException`（非受检异常） | 工厂加载失败等编程错误 |

- **必须** 将 `RepositoryException` 包装为 `{ServiceName}ServiceException`（并保留 cause）
- **必须** 让非预期的 `RuntimeException` 原样抛出（不捕获）
- 异常消息应使用日语，并包含排查问题所需的变量值。是否输出日志及级别请参考 `java-logging/AGENTS.md`

## 主要要求

- **必须** 实现不含基础设施关注点的纯业务逻辑
- **必须** 协调跨越多个仓储的操作
- **必须** 捕获并包装下层的所有异常
- **必须** 对仓储依赖使用工厂模式，并支持测试用的构造函数注入
- **禁止** 向上层暴露实现细节

## 相关

- `java-architecture/AGENTS.md` - 架构原则・分层结构
- `java-entity/AGENTS.md` - Entity 类规约
- `java-logging/AGENTS.md` - 日志输出规约
- 完整的服务实现模板请参考 `.agents/skills/java-im-service-layer/SKILL.md`
