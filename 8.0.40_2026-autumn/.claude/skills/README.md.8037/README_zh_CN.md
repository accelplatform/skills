# JSSP / Java / 低代码资源的技能集

## 概要

本代码库收录了用于在 intra-mart Accel Platform 上创建以下资源的技能集。
* 使用 JSSP（脚本开发模型）的画面・各种插件的源代码
* 使用 Java（JavaEE 开发模型）的各种插件（不含画面）的源代码
* IM-LogicDesigner / IM-Workflow / IM-BPM 相关资源

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

### 想要使用服务端缓存

- 想在 JSSP（脚本开发模型）的功能容器中，通过缓存检索结果或计算成本较高的处理结果来提升性能
  - ⇒ `jssp-im-cache-usage`
    - 提供 SSJS `Cache` 类（`get`/`put`/`remove`/`removeAll`）的基本模式、缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）的创建、缓存键设计
    - 若要用 Java（JavaEE 开发模型）实现同等处理，应使用 `java-im-cache-usage`

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

### 想要通过 IM-Propagation 实现模块间数据联动

- 想要在 Java（JavaEE 开发模型）中通过 `PropagationManager` 实现数据收发
  - ⇒ `java-im-propagation-generator`
    - 提供发送方（数据模型・`GenericModel`・`Encoder`・发送配置文件）与接收方（`Decoder`・`Procedure`・接收配置文件）双方的实现模式
    - 包含 `AbstractProcedure`（搭载于数据库事务）与 `AbstractSessionableProcedure`（自定义的两阶段提交式生命周期）的选用方法
    - 同时提供在自定义模块中接收 intra-mart 标准变更通知（租户・账户・角色・IM-Authz・菜单・日历・作业网・Salesforce 联动・Wiki 等）的监听器实现模式，以及向 IM-Box（应用通知・关注）发送数据的模式
    - 尚未提供面向 JSSP（脚本开发模型）的同等 API

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
- 想用 Java（JavaEE 开发模型）实现自定义任务（流程要素）
  - ⇒ `java-im-logic-generator`
    - 提供分类类（`ElementCategory`）、流程要素类（继承 `Task` + `@LogicFlowElement`）、元数据类（`FlowElementMetadata`）、扩展包注册（`ElementScanPackageFactory` + `META-INF/services`）的实现模式
    - 映射函数、EL函数、流程触发器不在范围内

### 想要创建 IM-BPM 相关资源

- 想从 BPMN(XML) 创建规格书
  - ⇒ `bpm-docs-generator`
    - 从 BPMN 的流程定义中提取流程概要、流程说明、任务详情、条件分支逻辑，生成 Markdown 格式的规格书
    - 生成的规格书也用作生成 JSSP 时的输入提示
- 想将规格书转换为可导入 intra-mart Knowledge 的格式
  - ⇒ `bpm-docs-generator`
    - 将规格书转换为可导入 Knowledge 的 zip 文件
- 想根据 BPM 规格书创建在 IM-BPM for Accel Platform 上运行的 JSSP 资源
  - ⇒ `bpm-scripts-generator`（+ `jssp-page-generator` / `jssp-imds-theme`）
    - 基于 `bpm-docs-generator` 创建的规格书，生成包含画面联动等 IM-BPM 专有元素的 JSSP 资源
- 想将规格书・生成脚本的内容反映到 BPMN-XML
  - ⇒ `bpm-xml-reflector`
    - 将 `bpm-docs-generator` 创建的规格书、`bpm-scripts-generator` 生成的脚本内容反映到 BPMN-XML

### 想要进行多语言化

- 想将 JSSP 业务画面中硬编码的字符串改为多语言对应
  - ⇒ `jssp-localize-support`（+ `jssp-page-generator`）
    - 创建消息属性文件（properties）
    - 改写为 `<imart type="message">` 标签・MessageManager API
    - 支持日语（ja）・英语（en）・简体中文（zh_CN）
- 想在 Java（JavaEE 开发模型）中使用 MessageManager 实现消息属性获取处理
  - ⇒ `java-im-message-usage`
    - 提供 `jp.co.intra_mart.foundation.security.message.MessageManager` 的用户/租户/系统区域设置解析顺序、占位符替换、消息存在性判断（`hasMessage`）的实现模式
    - 包含消息属性文件（`.properties`）的配置与键命名规约（与 JSSP 侧 `jssp-localize-support` 共通）
    - JSSP（脚本开发模型）中的同等实现请使用 `jssp-localize-support`

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
- 想用 Java（JavaEE 开发模型）通过 CacheManager/Cache API 实现以租户为单位的缓存处理
  - ⇒ `java-im-cache-usage`
    - 提供通过 `CacheManagerFactory.getCacheManager()` 获取缓存管理器、`Cache<K, V>` 的 CRUD（`get`/`put`/`remove`/`removeAll` 等）、缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）的创建
    - 包含缓存键・值的 `Serializable` 约束、缓存未命中时的重新加载模式
    - 若要在 JSSP（脚本开发模型）中实现同等处理，应使用 `jssp-im-cache-usage`
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
- 想在 Java（JavaEE 开发模型）中不依赖 Web API Maker 实现 SecureToken（CSRF 防护）的签发与验证
  - ⇒ `java-im-secure-token-usage`
    - 提供通过 `SecureTokenManager` 进行令牌签发（`createToken`）・验证（`verify`）、一次性令牌与可重用令牌的选择、通过参数绑定令牌进行篡改检测、通过 `HTTPContextManager` 获取 `HttpServletRequest` 的实现模式
    - Web API Maker 端点上的声明式验证（`@Secured`）请使用 `java-im-web-api-maker-usage`
- 想用 Java（JavaEE 开发模型）在 intra-mart 上构建 MCP（Model Context Protocol）服务器
  - ⇒ `java-im-mcp-generator`
    - 提供基于 `im_copilot_mcp` 模块的 `@MCPServer`/`@Tool` 注解实现 Streamable HTTP MCP 服务器的实现模式
    - 包含通过 `SchemaProperties` 定义工具参数、通过 `McpScanPackageFactory`（推荐）/`META-INF/im_services/annotation_classes` 向平台注册的模式
    - 普通 REST API（非面向 AI 智能体）请使用 `java-im-web-api-maker-usage`
- 想用 Java（JavaEE 开发模型）构建接收提示词、进行处理并返回响应的 AI 智能体
  - ⇒ `java-im-copilot-agent-generator`
    - 提供基于 `im_copilot_agent` 模块的 `Agent`/`AgentBuilder` 构建智能体、通过 `UserDefinedTool` 实现自定义工具、集成 `Knowledge`（知识检索）・`SkillEntry`（Markdown 技能）、Structured Output（类型化输出）、通过 `AgentExecutionMiddleware` 介入执行流程的实现模式
    - 包含与 IM-Copilot 聊天界面对接时的 `AbstractCopilotAssistant`/`@Assistant` 对接模式（`Agent`/`AgentBuilder` 本身是不依赖 Assistant 框架的独立 Java API）
    - MCP 服务器的实现请使用 `java-im-mcp-generator`，普通 REST API 请使用 `java-im-web-api-maker-usage`
    - 直接使用 `VectorStore`/`ActionFactory` 的低层级 RAG 请使用 `java-im-copilot-rag-generator`，直接使用 `ChatAction`+`ToolConfig` 的低层级 Tool Calling 请使用 `java-im-copilot-toolcalling-generator`
- 想用 Java（JavaEE 开发模型）直接使用 `VectorStore`/`ActionFactory` 实现 RAG（检索增强生成）
  - ⇒ `java-im-copilot-rag-generator`
    - 提供通过 `VectorStoreBuilder`/`VectorStore` 构建・注册向量存储、以及混合检索/相似度检索/关键词检索，通过 `ActionFactory`/`ChatAction`/`EmbeddingsAction` 调用聊天・嵌入的实现模式
    - 包含文档标准实现 `StandardRegistrationDocument`、通过 `TextSplitter`（`splitText` 方法）进行分块
    - 通过 Agent 框架实现的高层级 RAG（`Knowledge`/`RegisteredKnowledge`）请使用 `java-im-copilot-agent-generator`，Tool Calling 请使用 `java-im-copilot-toolcalling-generator`
- 想用 Java（JavaEE 开发模型）直接使用 `ChatAction`+`ToolConfig` 实现 Tool Calling（函数调用）
  - ⇒ `java-im-copilot-toolcalling-generator`
    - 提供不依赖具体供应商（OpenAI・Azure OpenAI Service・Amazon Bedrock 通用）的 Tool Calling 实现模式，基于 `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`（同时支持非流式与流式）
    - 包含通过 `JsonSchemaValidator`/`ToolJsonHelper` 进行工具参数校验・反序列化
    - 通过 Agent 框架实现的高层级 Tool Calling（`UserDefinedTool`）请使用 `java-im-copilot-agent-generator`，RAG 请使用 `java-im-copilot-rag-generator`
- 想用 Java（JavaEE 开发模型）通过 UserManager/CompanyManager/PublicGroupManager/PrivateGroupManager/CompanyGroupManager/CorporationGroupManager/CorporationManager/CustomerManager/ItemCategoryManager/ItemManager/CurrencyManager 构建 IM-通用主数据（用户・公司・组织・职位・公共组・私有组・公司组・法人组・法人・客户・品目类别・品目・货币）的 CRUD・检索处理
  - ⇒ `java-im-master-usage`
    - 提供用户信息（`User`、`UserManager`）、公司（`Company`）・组织/组织集合（`Department`/`DepartmentSet`）・职位（`CompanyPost`）・用户的组织归属（`UserAttach`，均通过 `CompanyManager`）的获取・检索・新建・更新・删除，以及组织层级结构（树）获取的实现模式
    - 包含 `Company` 不存在专用新建方法这一事实、`set*` 系方法根据期间代码（`termCd`）自动判定新建/更新、多语言信息注册步骤（`setDefaultLocale`/`createLocaleElement`/`putLocaleElement`）
    - 同时提供公共组・私有组・公司组・法人组各自专用管理类的获取・检索・新建・更新・删除，以及公共组的分类（类别）・角色・层级结构（树）获取的实现模式
    - 包含群组四个类之间 API 规模・功能范围的差异（仅公共组具有分类・角色・树功能，私有组为最小构成，法人组额外持有公司代码等）
    - 同时提供法人（`CorporationManager`，与法人组为不同的类）・客户（`CustomerManager`）・品目类别（`ItemCategoryManager`，具有层级树）・品目（`ItemManager`）・货币（`CurrencyManager`；`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）的获取・检索・新建・更新・删除的实现模式。包含 `CustomerManager`/`ItemManager` 的方法名为不含实体名称的通用名称、且第一参数为 `companyCd` 这一点
    - 同时提供用户分类・公共组分类・组织分类（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg` 等，均为对应管理类内置的功能）的获取・检索・新建・更新・删除的实现模式
    - 用户头像图片请使用 `java-im-profile-usage`，角色定义・角色分配请使用 `java-im-role-usage`/`java-im-account-usage`，认可请使用 `java-im-authz-usage`
- 想用 Java（JavaEE 开发模型）通过 im_mirage 构建 DB 访问处理
  - ⇒ `java-im-mirage-usage`
    - 提供实体类（`@Table`/`@Column`/`@PrimaryKey`）、DAO 类（继承 `AbstractDAO`・通过 `DAOFactory` 获取）、2WaySQL 的 SQL 文件、通过 `SessionTemplate` 进行事务管理的实现模式
    - JSSP 中的 DB 访问请使用 `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API）。两者开发模型不同，实现完全独立
- 想用 Java（JavaEE 开发模型）通过 Contexts.get() 获取登录用户的信息（账户、组织、客户端、任务执行参数）
  - ⇒ `java-im-contexts-usage`
    - 提供 `AccountContext`（用户代码、租户ID、区域设置、时区、角色ID、认证状态）、`UserContext`（用户资料、所属部门、公司、职位、公共组、用户分类）、`ClientContext`（客户端类型）、`ExternalUserContext`（外部用户判定）、`JobSchedulerContext`（任务执行参数）的获取模式，以及通过 `ContextStatus` 进行的认证/管理员判定
    - JSSP 中的同等实现请使用 SSJS 版 Context 对象（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`）
- 想在 Java（JavaEE 开发模型）中使用 ConfigurationLoader，新建自定义 XML 配置文件（JAXB 配置类・XSD 模式・XML 实体）的读取・保存处理
  - ⇒ `java-im-configuration-generator`
    - 提供 `ConfigurationLoader.load`/`loadAll`/`save`/`clearCache` 的选用方法、通过 `Instance`（`SINGLETON`/`PROTOTYPE`）进行的缓存控制、配置文件的放置位置（SystemStorage 的 `conf/`・`WEB-INF/conf`・类路径）与类名到文件名的转换规则
    - 包含 `check-jaxb-format-plugin` 所要求的 `ObjectFactory`（`factoryClass`/`factoryMethod`，必须为 `static`）实现模式
    - JSSP（脚本开发模型）方向尚未提供对应的 SSJS 版 API

### 想按照设计规约在 Java（JavaEE 开发模型）中实现

- 想确认 Java 实现的分层结构・依赖关系・命名・异常层次・工厂模式
  - ⇒ `java-im-architecture`
    - 提供基于 Clean Architecture/DDD 的分层结构（表现层/应用层/领域层/基础设施层）的职责・依赖规则
    - 包含常见反模式集、从 DDL 到 Endpoint 贯穿全层的实现示例
    - 规约要点汇总在 `.claude/rules/java-architecture.md` 中以便随时参考；本技能是其详细版（完整代码模板）
- 想了解服务层（业务逻辑・事务控制）的实现模式
  - ⇒ `java-im-service-layer`
    - 提供服务接口、工厂模式、基于 `SessionTemplate` 的事务边界、异常转换规则
    - 包含单个仓储／多个仓储在单一事务中处理的模板
    - 规约要点汇总在 `.claude/rules/java-service-layer.md` 中以便随时参考

> Java 的通用规约（命名・编码风格・JavaDoc・日志・实体）请参考 `.claude/rules/README.md` 列表中的对应文件。上述2个技能仅在需要规约附带的完整代码模板・反模式集时调用即可。

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
