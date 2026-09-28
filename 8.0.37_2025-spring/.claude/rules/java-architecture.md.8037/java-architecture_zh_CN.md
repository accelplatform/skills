---
paths:
  - "**/*.java"
---

# 架构规约（Java）

> **适用范围**: 🟢 **始终** — 适用于 Java（JavaEE 开发模型）的全部应用实现。基于 Clean Architecture / DDD 原则。

## 分层结构

```
表现层 → 应用层 → 领域层 → 基础设施层
```

| 层 | 职责 | 主要组件 |
|---|---|---|
| 表现层 | 外部接口、请求/响应转换、输入校验、认证・授权 | Endpoint, Request DTO, Response DTO, Validator |
| 应用层 | 用例的执行、领域服务的编排、事务控制的起点 | UseCase, Job |
| 领域层 | 业务规则、领域逻辑、领域模型的定义 | Model, Service（接口）, Repository（接口）, Exception |
| 基础设施层 | 数据持久化、外部系统集成、实现领域接口 | DAO, Entity, Service（实现）, Repository（实现） |

### 依赖规则

1. **必须** 外层依赖内层，反之不可
2. **必须** 领域层不得持有外部依赖（DAO・DB 框架等）
3. **必须** 由基础设施层实现领域接口
4. **必须** 表现层只调用应用层的用例，不得直接引用领域层・基础设施层
5. 违反示例及修正示例请参考 `.claude/skills/java-im-architecture/references/anti-patterns.md`

## 包结构

```
src/main/java/{package}/
├── presentation/{endpoint,request,response,validator}/
├── application/{usecase,job,exception}/
├── domain/{model,service,repository,exception}/
└── infrastructure/{dao,entity,model,repository,service}/
```

贯穿全部分层的实现示例（DDL → Entity → DAO → Repository → Service → UseCase → Endpoint）请参考 `.claude/skills/java-im-architecture/references/full-stack-example.md`。

## 命名规约

类名・方法名・变量名的基本规则请参考 `java-naming.md`。本规约仅补充跨层的类别命名。

| 类别 | 命名模式 | 示例 |
|---|---|---|
| 端点 | `{Resource}Endpoint` | `CategoryEndpoint` |
| 用例 | `{Operation}UseCase` | `GetCategoryUseCase` |
| 作业 | `{JobName}Job` | `CategoryBatchJob` |
| 服务工厂 | `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory` | `CategoryServiceFactory` |
| 仓储工厂 | `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory` | `CategoryRepositoryFactory` |
| 应用异常 | `{ApplicationName}Exception` | `CategoryAppException` |

## 异常层次

| 类别 | 基类 | 用途 |
|---|---|---|
| `ValidationException` | `RuntimeException` | 表现层的输入校验 |
| `{ApplicationName}Exception` | `Exception` | 应用层 |
| `{DomainName}Exception` / `{ServiceName}ServiceException` | `Exception`（受检异常） | 领域层 |
| `{DomainName}RuntimeException` | `RuntimeException`（非受检异常） | 基础设施层・工厂 |

- 异常转换应将下层异常包装为上层异常，并保留 cause（服务层详情请参考 `java-service-layer.md`）
- 是否输出日志取决于异常类型。详情请参考 `java-logging.md` 中的「按异常类型判断日志级别」
  - 尤其**禁止**：对 `ValidationException` 及授权错误输出日志

## 工厂模式

- **必须** 获取服务・仓储时使用工厂（`{Name}Factory.getInstance()`）而非 `new`
  - 理由：可通过 `ServiceLoaderUtil` 替换实现，并支持测试时的 mock 注入
- 完整的工厂实现模板请参考 `.claude/skills/java-im-architecture/SKILL.md`

## 表现层的职责边界

**负责**：接收 HTTP 请求、输入校验、应用认证・授权、DTO 转换、生成响应
**不负责**：执行业务逻辑、直接操作领域模型、DB 访问、事务控制、编排多个领域服务

REST API 端点的实现（Web API Maker 注解）请使用 `java-im-web-api-maker-usage` 技能。

## 安全原则

- **必须** 不得将敏感信息（密码、令牌、个人数据）输出到日志（详情请参考 `java-logging.md`）
- **必须** 在表现层校验并净化所有用户输入
- **必须** SQL 操作使用参数化查询（2WaySQL），详情请参考 `java-im-mirage-usage`
- 认证・授权・OAuth・安全令牌校验请参考 `java-im-web-api-maker-usage` / `java-im-authz-usage`

## 文档规约

类・方法的 JavaDoc 请参考 `java-javadoc.md`。

## 代码评审要点

1. 分层边界与依赖关系（尤其表现层是否直接引用了领域层）
2. 业务逻辑是否泄漏到表现层
3. intra-mart API 的正确使用
4. 输入校验・授权・注入攻击对策
5. 测试覆盖率

## 相关

- `java-naming.md` - 命名规约
- `java-code-style.md` - 编码风格
- `java-javadoc.md` - JavaDoc 规约
- `java-logging.md` - 日志输出规约
- `java-service-layer.md` - 服务层实现规约
- `java-entity.md` - Entity 类规约
- 常见反模式集・贯穿全层的实现示例请参考 `.claude/skills/java-im-architecture/SKILL.md`
