# JSSP / Java / 低代码资源的技能集

## 概要

本代码库收录了用于在 intra-mart Accel Platform 上创建以下资源的技能集。
* 使用 JSSP（脚本开发模型）的画面・各种插件的源代码
* 使用 Java（JavaEE 开发模型）的各种插件（不含画面）的源代码
* IM-LogicDesigner / IM-Workflow 相关资源

为降低编码代理（Coding Agent）的 Token 消耗，建议根据下方的"技能反查"，仅取出所需的技能集进行使用。

## 技能反查

### 想要创建画面

- 想要使用 JSSP（专业代码）新建业务画面
  - ⇒ `jssp-page-generator` + `jssp-imds-theme`
    - 一次性生成功能容器（js）、展示页面（html）、路由表（xml）
    - 如需访问数据库，则实现 2WaySQL（sql）与 API 调用
    - 采用基于 intra-mart Design System（imds）的设计
- 想在业务画面上显示图表
  - ⇒ `jssp-highcharts-usage`
    - 集成 intra-mart 内置的 Highcharts 库，并使用其生成图表
- 想在业务画面中嵌入 IM-通用主数据的检索对话框
  - ⇒ `jssp-im-master-usage`
    - 嵌入用户・公司・组织・职位・公共组・私有组・角色的检索功能

### 想要创建面向外部系统的 REST-API

- 想要新公开带 OAuth 认证的 REST-API
  - ⇒ `jssp-im-oauth-generator`
    - 一次性生成使用 im_oauth 提供方功能的范围定义（xml）・资源 URL 设置（xml）・客户端详细设置（xml）・JSSP 资源实现（js）
    - 不附加 CSRF 安全令牌验证，以 OAuth 访问令牌进行认证
    - 经由浏览器租户登录会话调用的常规 REST-API 由 `jssp-page-generator` 技能定义

### 想要创建作业程序

- 想要使用 JSSP（专业代码）创建作业调度器的批处理
  - ⇒ `jssp-im-job-generator`
    - 生成不带画面的、用于定期执行・批量处理的作业程序的功能容器（js）
- 想要创建 IM-ContentsSearch 的爬虫作业
  - ⇒ `jssp-im-contents-search-generator`
    - 生成收集数据并向 IM-ContentsSearch 注册全文检索数据的作业程序

### 想要创建 IM-Workflow 资源

- 想要创建工作流的主定义文件
  - ⇒ `base-im-workflow-generator`
    - 生成包含内容、路由、流程、案件属性、分支规则的导入用 XML
    - 支持直线・分支・同步・横向・纵向的路由模式
    - 支持示例安装时的用户・公司・组织・职位・公共组 ※扩展计划通过 MCP 支持
    - 支持日语（ja）・英语（en）・简体中文（zh_CN）
- 想要用 JSSP（脚本开发模型）创建与工作流联动的各种画面・处理
  - ⇒ `jssp-im-workflow-usage`（+ `jssp-page-generator`）
    - 生成申请/审批/详情/确认/参照画面（html + js）
    - 生成执行处理・到达处理・案件开始/结束处理・分支条件判断・各种监听器（js）
- 想要用 Java（JavaEE 开发模型）创建工作流的动作处理・到达处理・案件开始/结束处理・分支条件判断・各种监听器
  - ⇒ `java-im-workflow-usage`
    - 生成继承/实现 `ActionProcessEventListener` 等平台抽象类・监听器接口的 Java 类
    - 画面（申请/审批/确认）不在范围内。画面目前使用 `jssp-im-workflow-usage` 的 JSSP 实现

### 想要创建 IM-LogicDesigner 资源

- 想要创建逻辑流（低代码）的定义文件
  - ⇒ `jssp-im-logic-generator`
    - 生成包含逻辑流（flow_definition.json）・路由（flow_route.json）的导入用 ZIP
    - 支持租户管理功能提供的标准任务（授权・仓库操作・邮件发送等共 125 种）※扩展计划通过 MCP 支持
    - 支持标准映射函数（数值运算・字符串操作・数组操作・JSON・BASE64 等共 52 种）※扩展计划通过 MCP 支持
    - 支持用户自定义任务（JavaScript・REST・SQL・Database Fetch・模板）※扩展计划通过 MCP 支持
- 想从 JSSP 画面调用已存在（已配置路由）的逻辑流
  - ⇒ `jssp-im-logic-usage`（+ `jssp-page-generator`）
    - 获取并解析 swagger spec（`<BASE-URL>/logic/all-api-docs`），确定请求/响应结构后生成 `fetch` 调用代码
    - 权限不足（401/403）时提示认可设置的引导信息

### 想要进行多语言化

- 想将 JSSP 业务画面中硬编码的字符串改为多语言对应
  - ⇒ `jssp-localize-support`（+ `jssp-page-generator`）
    - 创建消息属性文件（properties）
    - 改写为 `<imart type="message">` 标签・MessageManager API
    - 支持日语（ja）・英语（en）・简体中文（zh_CN）

### 想要进行测试・质量检查

- 想在 JSSP 画面生成后执行验证・修正（由 `jssp-page-generator` 自动委托）
  - ⇒ `jssp-page-verifier`
    - 以子代理身份负责对生成的 JSSP 源代码进行机械性验证
- 想让编码代理执行代码评审
  - ⇒ `jssp-code-review`
    - 从一般编码规约・绑定变量等用法・命名规则・错误处理等观点进行综合评审
- 想检测安全漏洞
  - ⇒ `jssp-security-check`
    - 检测 SQL 注入・XSS・eval 使用・硬编码凭据等风险与漏洞
- 想为功能容器创建单元测试
  - ⇒ `jssp-jest-test`
    - 使用 Jest on Rhino 生成功能容器（js）的单元测试（调整中）
- 想为业务画面创建 E2E 测试
  - ⇒ `jssp-playwright-test`
    - 使用 Playwright 生成 JSSP 画面（html + js 配对）的 E2E 测试（调整中）
- 想根据规格书创建测试观点一览表・测试项目书（Excel 或 HTML）
  - ⇒ `test-spec-generator`
    - 根据规格书文件，生成 xlsx（使用 officecli）或 HTML 格式的测试观点一览表・测试项目书

### 想在 JavaEE 开发模型中使用 intra-mart 专有功能

- 想用 Java（JavaEE 开发模型）通过 PublicStorage / SessionScopeStorage / SystemStorage 实现文件操作处理
  - ⇒ `java-im-storage-usage`
    - 提供永久文件（`PublicStorage`）・临时文件（`SessionScopeStorage`）・系统内部资源（`SystemStorage`）的使用区分，以及基于 `try-with-resources` 的资源管理模式
    - JSSP（专业代码）中的等效实现请使用 `jssp-page-generator` 的 `reference/api-storage.md`（SSJS 版 Storage API）
- 想用 Java（JavaEE 开发模型）通过 Identifier API 实现唯一 ID 编号处理
  - ⇒ `java-im-identifier-usage`
    - 提供在分布式环境中保证系统整体唯一性的 `get()`，与仅在应用服务器内唯一的 `make()` 的使用区分
    - 单据号・申请编号等业务数据编号默认引导使用 `get()`，日志跟踪 ID 等进程内闭环标识符则使用 `make()`
- 想用 Java（JavaEE 开发模型）通过 NewLock API 实现互斥控制处理
  - ⇒ `java-im-lock-usage`
    - 提供通过 `try`/`finally` 释放的普通锁（`lock()`/`tryLock()`），与在响应返回时自动释放的请求作用域锁（`lockRequestScope()`/`tryLockRequestScope()`）的使用区分
    - 对于在方法内闭环完成的处理，默认引导使用普通锁实现分布式环境下基于数据库的互斥控制
- 想用 Java（JavaEE 开发模型）通过 AccountInfoManager 实现账户信息的获取・更新处理
  - ⇒ `java-im-account-usage`
    - 提供登录设置（区域设置・时区・日历・主题・每周起始日・日期时间格式）、账户锁定・登录失败次数、账户属性、密码核对（`AccountPasswordAdapter`）的实现模式
    - 用户的角色分配（`addAccountRoleInfo` 等）也属于本技能范围。角色定义本身（新建・层级・分类）请使用 `java-im-role-usage`
- 想用 Java（JavaEE 开发模型）通过 UserProfileImageManager 实现 IM-共通主数据的头像图片操作
  - ⇒ `java-im-profile-usage`
    - 提供头像图片的获取（Stream 格式・URL 格式，单个/多个）、删除、注册（数据 URL 格式／通过 `Storage`）的实现模式
    - 不包含用户基本信息（姓名・所属等）本身的操作，以及 IM-LogicDesigner 的逻辑流元素（`jp.co.intra_mart.foundation.logic.element.profile` 下）
- 想用 Java（JavaEE 开发模型）通过 RoleInfoManager 实现角色定义的管理处理
  - ⇒ `java-im-role-usage`
    - 提供角色的新建・更新・删除，子角色层级（添加・删除・获取全部父/子角色），分类管理，以及按角色ID/角色名/分类进行检索・分页的实现模式
    - 不包含向特定用户分配角色的场景，该场景请使用 `java-im-account-usage`
- 想用 Java（JavaEE 开发模型）实现认可（Authorization）资源・主体・策略的 CRUD 与权限确认处理
  - ⇒ `java-im-authz-usage`
    - 提供通过 `ResourceManager`/`SubjectManager`/`PolicyManager` 对资源・主体（通过 Expression 构建条件表达式）・策略进行登录/更新/删除，以及通过 `AuthorizationClient` 进行权限确认（authorize）的实现模式
    - 不包含角色定义本身・向用户分配角色的场景，分别请使用 `java-im-role-usage`/`java-im-account-usage`
- 想用 Java（JavaEE 开发模型）通过 Web API Maker 创建 REST API
  - ⇒ `java-im-web-api-maker-usage`
    - 提供仅通过注解（`@WebAPIMaker`/`@Path`/`@GET` 等）实现 REST API 的工厂・服务类生成模式
    - 支持认证方式（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`）、认可联动（`@Authz`）、安全令牌验证（`@Secured`）、响应控制
    - 认可资源本身的注册请使用 `java-im-authz-usage`；JSSP 中的 REST API 请使用 `jssp-page-generator`/`jssp-im-oauth-generator`
- 想用 Java（JavaEE 开发模型）通过 im_mirage 构建 DB 访问处理
  - ⇒ `java-im-mirage-usage`
    - 提供实体类（`@Table`/`@Column`/`@PrimaryKey`）、DAO 类（继承 `AbstractDAO`・通过 `DAOFactory` 获取）、2WaySQL 的 SQL 文件、通过 `SessionTemplate` 进行事务管理的实现模式
    - JSSP 中的 DB 访问请使用 `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API）。两者开发模型不同，实现完全独立

### 想按照设计规约在 Java（JavaEE 开发模型）中实现

- 想确认 Java 实现的分层结构・依赖关系・命名・异常层次・工厂模式
  - ⇒ `java-im-architecture`
    - 提供基于 Clean Architecture/DDD 的分层结构（表现层/应用层/领域层/基础设施层）的职责・依赖规则
    - 包含常见反模式集、从 DDL 到 Endpoint 贯穿全层的实现示例
    - 规约要点汇总在 `.agents/requirements/java-architecture/AGENTS.md` 中以便随时参考；本技能是其详细版（完整代码模板）
- 想了解服务层（业务逻辑・事务控制）的实现模式
  - ⇒ `java-im-service-layer`
    - 提供服务接口、工厂模式、基于 `SessionTemplate` 的事务边界、异常转换规则
    - 包含单个仓储／多个仓储在单一事务中处理的模板
    - 规约要点汇总在 `.agents/requirements/java-service-layer/AGENTS.md` 中以便随时参考

> Java 的通用规约（命名・编码风格・JavaDoc・日志・实体）请参考 `.agents/requirements/README.md` 列表中的对应文件。上述2个技能仅在需要规约附带的完整代码模板・反模式集时调用即可。

### 想要创建设置资源

- 想创建租户环境设置资源・想准备生产部署
  - ⇒ `jssp-tenant-setup-generator`
    - 基于交付物，准备必要的角色・授权・菜单・作业，以及设置配置文件
    - 菜单仅为"站点地图（PC 用）"
- 想创建示例数据设置资源
  - ⇒ `jssp-sample-setup-generator`
    - 准备用于试用模块的示例数据（DDL/DML）、试用所需的角色・授权・菜单・作业，以及设置配置文件
    - 菜单仅为"站点地图（PC 用）"

## 限制事项

- imui 主题、V72 兼容画面的生成不支持。仅支持 imds。
- 路由表：不支持对授权资源的反查指示。
- 授权：原则上不使用 `welcome-all`。授权资源以租户环境搭建资材形式导入，不生成经由作业的导入资材。
- 作业：作业定义以租户环境搭建资材形式导入，不生成经由作业的导入资材。
- 为检查生成物的正确性，会执行 Node.js 脚本。临时使用 `/tmp`。
- IM-Workflow：主定义的 JSSP-API 不在对象范围。仅支持案件获取/操作系。
- IM-Workflow：列表显示模式・流程组・媒体・消息不生成。
- IM-LogicDesigner：从 JSSP 业务画面调用 IM-LogicDesigner，仅限通过路由（调用方的实现由 `jssp-im-logic-usage` 负责）。
- IM-LogicDesigner：默认不生成路由。如有必要，需给出具体指示。
- IM-LogicDesigner：连 MCP 也不支持的用户自定义，用 JavaScript 用户自定义代替。
- IM-LogicDesigner：触发器・逻辑流的预览图像不生成。
- IM-BloomMaker / ViewCreator / Accel Studio：这些低代码资材不生成。
