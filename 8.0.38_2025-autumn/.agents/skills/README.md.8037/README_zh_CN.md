# JSSP / 低代码资源的技能集

## 概要

收录用于通过 intra-mart Accel Platform 的 JSSP（脚本开发模型）创建源代码以及低代码资源的技能集的代码库。

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
  - ⇒ `jssp-im-workflow-generator`
    - 生成包含内容、路由、流程、案件属性、分支规则的导入用 XML
    - 支持直线・分支・同步・横向・纵向的路由模式
    - 支持示例安装时的用户・公司・组织・职位・公共组 ※扩展计划通过 MCP 支持
    - 支持日语（ja）・英语（en）・简体中文（zh_CN）
- 想要创建与工作流联动的各种画面・处理
  - ⇒ `jssp-im-workflow-usage`（+ `jssp-page-generator`）
    - 生成申请/审批/详情/确认/参照画面（html + js）
    - 生成执行处理・到达处理・案件开始/结束处理・分支条件判断・各种监听器（js）

### 想要创建 IM-LogicDesigner 资源

- 想要创建逻辑流（低代码）的定义文件
  - ⇒ `jssp-im-logic-generator`
    - 生成包含逻辑流（flow_definition.json）・路由（flow_route.json）的导入用 ZIP
    - 支持租户管理功能提供的标准任务（授权・仓库操作・邮件发送等共 125 种）※扩展计划通过 MCP 支持
    - 支持标准映射函数（数值运算・字符串操作・数组操作・JSON・BASE64 等共 52 种）※扩展计划通过 MCP 支持
    - 支持用户自定义任务（JavaScript・REST・SQL・Database Fetch・模板）※扩展计划通过 MCP 支持

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

### 想要准备生产部署

- 想创建租户环境搭建资源
  - ⇒ `jssp-tenant-setup-generator`
    - 基于交付物，准备必要的角色・授权・菜单・作业，以及搭建配置文件
    - 菜单仅为"站点地图（PC 用）"

## 限制事项

- imui 主题、V72 兼容画面的生成不支持。仅支持 imds。
- 路由表：不支持对授权资源的反查指示。
- 授权：原则上不使用 `welcome-all`。授权资源以租户环境搭建资材形式导入，不生成经由作业的导入资材。
- 作业：作业定义以租户环境搭建资材形式导入，不生成经由作业的导入资材。
- 为检查生成物的正确性，会执行 Node.js 脚本。临时使用 `/tmp`。
- IM-Workflow：主定义的 JSSP-API 不在对象范围。仅支持案件获取/操作系。
- IM-Workflow：列表显示模式・流程组・媒体・消息不生成。
- IM-LogicDesigner：从 JSSP 业务画面调用 IM-LogicDesigner，仅限通过路由。
- IM-LogicDesigner：默认不生成路由。如有必要，需给出具体指示。
- IM-LogicDesigner：连 MCP 也不支持的用户自定义，用 JavaScript 用户自定义代替。
- IM-LogicDesigner：触发器・逻辑流的预览图像不生成。
- IM-BloomMaker / ViewCreator / Accel Studio：这些低代码资材不生成。
