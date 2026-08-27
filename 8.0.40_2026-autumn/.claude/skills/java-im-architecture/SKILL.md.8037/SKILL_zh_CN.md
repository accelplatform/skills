---
name: java-im-architecture
description: 基于 Clean Architecture/DDD 原则，为 intra-mart 平台（Java / JavaEE 开发模型）上的应用开发提供架构原则、模式与规约。提供分层结构、依赖规则、命名规约、错误处理、工厂模式、安全原则以及全栈实现示例的详细模板。规约要点（精简版）保存在项目的 Java 架构规约文件中——当需要完整的代码模板或反模式目录时使用本技能。
disable-model-invocation: false
user-invocable: true
---

# 架构原则与通用规则（详细模板集）

## 概述

适用于应用程序所有层的核心架构原则、模式与规约。基于 Clean Architecture/DDD 原则，在 intra-mart 平台（Java / JavaEE 开发模型）上进行应用开发。

> 规约要点（护栏）汇总于 `.claude/rules/java-architecture.md`。本技能提供从那里引用的完整代码模板、反模式目录，以及贯穿所有层的完整实现示例。

## 架构概述

### 分层结构
```
┌─────────────────────────────────────────┐
│           表现层                          │
│    (REST API Endpoints, Request/       │
│     Response DTOs, Validation)         │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│           应用层                          │
│    (Use Cases, Jobs, Orchestration)    │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│           领域层                          │
│  (Models, Services, Repositories)       │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│           基础设施层                      │
│    (DAOs, Entities, External APIs)      │
└─────────────────────────────────────────┘
```

### 各层的职责

| 层                   | 职责                                                                             | 主要组件                                            |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 表现层   | 对外接口、请求/响应转换、输入校验、认证与授权  | Endpoint, Request DTO, Response DTO, Validator                |
| 应用层     | 用例的执行、领域服务的编排、事务控制 | UseCase, Job                                                  |
| 领域层             | 业务规则、领域逻辑、领域模型的定义                           | Model, Service (Interface), Repository (Interface), Exception |
| 基础设施层 | 数据持久化、外部系统联动、领域接口的实现                   | DAO, Entity, Service (Impl), Repository (Impl)                |

### 依赖规则
1. **外层依赖内层，反之不成立**
2. **领域层不持有外部依赖**
3. **基础设施层实现领域接口**
4. **应用层负责编排领域服务**
5. **表现层调用应用层的用例（不直接引用领域层与基础设施层）**

### 跨层数据流
```
[外部客户端]
       │
       ▼
表现层: Request DTO → 校验 → 调用 UseCase
       │
       ▼
应用层: UseCase → 转换为领域模型 → 调用领域服务 → 将结果转换为 Response DTO
       │
       ▼
领域层: 执行业务逻辑 → 调用仓储
       │
       ▼
基础设施层: 转换 Entity → DB 操作 → Entity → 转换为领域模型
```

**参考**：贯穿所有层的完整实现示例请参考 `references/full-stack-example.md`。

## 命名规约

### 包结构
```
src/main/java/{package}/
├── presentation/        # 表现层
│   ├── endpoint/       # REST API 端点
│   ├── request/        # 请求 DTO
│   ├── response/       # 响应 DTO
│   └── validator/      # 输入校验
├── application/         # 应用层
│   ├── usecase/        # 用例
│   ├── exception/      # 应用异常
│   └── job/            # 后台任务
├── domain/              # 领域层
│   ├── model/          # 领域模型与值对象
│   ├── service/        # 领域服务接口
│   ├── repository/     # 仓储接口
│   └── exception/      # 领域异常
└── infrastructure/      # 基础设施层
    ├── dao/            # 数据访问实现
    ├── entity/         # 数据库实体
    ├── model/          # 基础设施模型（内部使用）
    ├── repository/     # 基础设施仓储实现
    └── service/        # 基础设施服务实现
```

### 类命名模式

通用的类・方法・变量命名规则请参考 `.claude/rules/java-naming.md`。此处仅记载各层特有的补充说明。

#### 表现层
- **端点**: `{Resource}Endpoint`
- **请求 DTO**: `{Operation}Request`
- **响应 DTO**: `{Operation}Response`
- **校验器**: `{Operation}Validator`

#### 应用层
- **用例**: `{Operation}UseCase`
- **任务**: `{JobName}Job`
- **异常**: `{ContextName}Exception`

#### 领域层
- **接口**: `{EntityName}Repository`, `{ServiceName}Service`
- **领域模型**: `{EntityName}`（简单命名）
- **异常**: `{DomainName}Exception`
- **工厂**: `{ServiceName}Factory`, `{ServiceName}ServiceFactory`

#### 基础设施层
- **实现**: `Standard{EntityName}Repository`, `Standard{ServiceName}Service`
- **实体**: `{EntityName}Entity`

#### 异常类命名
- **服务异常**: `{ServiceName}ServiceException`（例如：`OrderServiceException`）
- **仓储异常**: `RepositoryException`（通用）
- **运行时异常**: `{DomainName}RuntimeException`（例如：`OrderRuntimeException`）
- **应用异常**: `{ApplicationName}Exception`（例如：`OrderAppException`）

#### 工厂类命名
- **服务工厂**: `{ServiceName}ServiceFactory` / `Standard{ServiceName}ServiceFactory`
- **仓储工厂**: `{EntityName}RepositoryFactory` / `Standard{EntityName}RepositoryFactory`

#### 占位符规约（技能内模板）
- **类名**: PascalCase `{EntityName}`, `{ServiceName}`
- **变量名**: camelCase `{entityName}`, `{serviceName}`
- **表/列名**: snake_case `{table_name}`, `{column_name}`

### 方法命名模式
- **检索类**: `findBy{Criteria}`, `findAll{EntityName}s`, `findLatest{EntityName}`
- **业务操作**: `process{BusinessOperation}`, `calculate{BusinessMetric}`
- **校验**: `validate{BusinessRule}`, `is{BusinessState}`
- **转换**: `convertTo{TargetType}`, `transformTo{TargetFormat}`
- **工具方法**: `build{Object}`, `create{Object}Instance`
- **任务执行**: `execute`, `run`
- **用例执行**: `execute`

## 表现层设计

采用 Web API Maker 的工厂 + 服务（端点）两个类的结构实现。请求/响应 DTO・校验器的完整代码示例请参考 `references/implementation-templates.md` 的"表现层"部分。

### 职责边界

**表现层承担的职责：**
- 接收并解析 HTTP 请求
- 输入校验（格式检查、必填检查、类型检查）
- 应用认证・授权（基于注解）
- 将请求 DTO 传递给用例
- 将用例结果转换为响应 DTO
- 生成 HTTP 响应（状态码、头部等）
- 格式化错误响应

**表现层不承担的职责：**
- 执行业务逻辑
- 直接操作领域模型
- 数据库访问
- 事务控制
- 编排多个领域服务

## 应用层设计

将用例实现为一个薄层：把请求 DTO 转换为领域模型、调用领域服务、再将结果转换为响应 DTO。领域异常应包装为应用异常。完整代码示例请参考 `references/implementation-templates.md` 的"应用层"部分。

## 错误处理策略

### 异常层级分类
- **表现层异常**（`ValidationException` 等）：非受检异常
- **应用异常**（`{ApplicationName}Exception` 等）：受检异常
- **领域异常**（`{DomainName}Exception`、`{ServiceName}ServiceException` 等）：受检异常
- **基础设施异常**（`{DomainName}RuntimeException` 等）：非受检异常

完整的异常类定义与各层的处理实现示例请参考 `references/implementation-templates.md` 的"错误处理"部分。

### 禁止记录日志的异常
- **禁止** 对输入校验异常（`ValidationException`）记录日志 — 这是用户输入错误，而非系统故障
- **禁止** 对权限检查异常（授权错误）记录日志 — 由授权框架处理
- 详情请参考 `.claude/rules/java-logging.md`

## 工厂模式实现

- **必须** 获取服务・仓储时使用工厂（`{Name}Factory.getInstance()`）而非 `new`
  - 理由：便于通过 `ServiceLoaderUtil` 替换实现，以及在测试时注入 mock
- 完整的服务工厂模板请参考 `references/implementation-templates.md` 的"工厂模式"部分
- DAO 工厂的使用方法请参考 `java-im-mirage-usage` 技能

### 配置文件模式
- **SQL 文件**: `/META-INF/sql/{package_path}/{ClassName}/{methodName}.sql`
- **配置文件**: `/src/main/conf/{feature}/{config_name}-config.xml`
- **导入配置**: `/src/main/conf/products/import/basic/{feature}/{config_name}.xml`
- **DDL 文件**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-ddl.sql`
- **授权配置**: `/src/main/storage/system/products/import/basic/{feature}/{feature}-authz-*.xml`

## 日志输出标准

日志级别・输出模式・按异常类型的判断方式请参考 `.claude/rules/java-logging.md`。

## 安全原则

在表现层的端点上应用认证・授权注解。多种认证策略组合及输入校验・净化的完整代码示例请参考 `references/implementation-templates.md` 的"安全"部分。详细的认证方式・授权联动请参考 `java-im-web-api-maker-usage` / `java-im-authz-usage` 技能。

### 数据保护
- **必须** 不将敏感信息（密码、令牌、个人数据）记录到日志中
- **必须** 在表现层对所有用户输入进行校验・净化
- **必须** SQL 操作使用参数化查询（2WaySQL）。详情请参考 `java-im-mirage-usage`

## 性能指南

数据库访问的批量操作、任务处理框架、集中式常量管理的完整代码示例请参考 `references/implementation-templates.md` 的"性能"部分。

## 文档标准

代码文档（JavaDoc）的书写规约请参考 `.claude/rules/java-javadoc.md`。

### API 文档
- **必须** 用日语摘要为所有公开 API 端点编写文档
- **必须** 包含请求/响应示例
- **必须** 指定认证・授权要求
- **必须** 记录错误情形与响应

## 开发工作流

**参考**：常见反模式与修正示例请参考 `references/anti-patterns.md`。

### 代码评审指南
1. **架构合规性**：验证分层边界与依赖关系（特别是表现层是否直接引用了领域层）
2. **表现层职责**：确认业务逻辑是否泄漏到了端点中
3. **框架集成**：确认是否正确使用了 intra-mart API
4. **安全评审**：确认输入校验、授权、注入防护
5. **性能影响**：评审批处理逻辑
6. **测试覆盖率**：确保有充分的单元测试与集成测试

### 质量关卡
- **代码编译**：所有代码必须无警告编译通过
- **单元测试**：业务逻辑至少达到 80% 的覆盖率
- **集成测试**：所有 API 端点都需要集成测试
- **安全扫描**：不存在重大安全漏洞，尤其是注入类漏洞
- **性能测试**：批量操作需满足性能要求

## 相关技能与规约

- `.claude/rules/java-architecture.md` - 本技能的规约摘要（始终参考）
- `.claude/rules/java-naming.md` - 命名规则
- `.claude/rules/java-code-style.md` - 编码风格
- `.claude/rules/java-javadoc.md` - JavaDoc 规约
- `.claude/rules/java-logging.md` - 日志实现规约
- `.claude/rules/java-entity.md` - Entity 类规约
- `java-im-service-layer` - 服务层实现规则
- `java-im-web-api-maker-usage` - REST API 端点实现
- `java-im-mirage-usage` - DB 访问实现（DAO/Repository）
- `java-im-authz-usage` - 授权（Authorization）实现
