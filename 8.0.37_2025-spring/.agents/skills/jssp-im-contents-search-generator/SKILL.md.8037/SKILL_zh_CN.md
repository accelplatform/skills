---
name: jssp-im-contents-search-generator
description: 生成 IM-ContentsSearch 的自定义 Crawler（Solr 索引注册/删除 Job）和自定义内容显示检索结果模板。当提到以下内容时使用：创建 Crawler、注册到 Solr、支持全文检索、添加内容检索、扩展 IM-ContentsSearch、创建检索结果模板。与 jssp-im-job-generator 结合使用，同时提供 Job 注册步骤说明。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) 已参考并理解内容
- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) 已参考并理解内容
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) 已参考并理解内容
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) 已参考并理解内容
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) 已参考并理解内容
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) 已参考并理解内容
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) 已参考并理解内容
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) 已参考并理解内容
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) 已参考并理解内容


# IM-ContentsSearch 扩展程序生成 Skill

## 目的

扩展 intra-mart Accel Platform 的 IM-ContentsSearch 功能，生成用于将自定义内容注册到 Solr 的 Crawler Job 和自定义检索结果模板（JSSP）的 Skill。

由于 SSJS 没有官方 API，通过 Rhino 的 `Packages.***` 语法直接调用 Java 类来实现。

## 生成对象

| 类别 | 文件 | 作用 | 多语言 |
|------|---------|------|-------|
| Crawler Job 程序 | 只要放置在可被识别为服务器端 JavaScript 的位置（如 `src/main/jssp/src/`），文件名等规约没有特别限制（例：`src/main/jssp/src/{功能名}/job/crawler.js`） | Crawler Job（Solr 索引注册/删除） | - |
| 检索结果模板 | 只要符合脚本开发模式（JSSP）结构，文件名等规约没有特别限制（例：`src/main/jssp/src/im_contents_search/template/{功能名}.js`） | 检索结果模板（功能容器） | - |
| 检索结果模板 | 只要符合脚本开发模式（JSSP）结构，文件名等规约没有特别限制（例：`src/main/jssp/src/im_contents_search/template/{功能名}.html`） | 检索结果模板（演示页） | - |
| 检索结果模板 | `src/main/conf/contentssearch-template-config/{功能名}.xml` | 模板配置（TYPE、模板路径、动态字段定义） | - |
| 检索结果模板 | 如果已在 `src/main/conf/message/` 下创建了消息属性文件，可以不另建专用消息属性文件，直接向已有文件中添加键（例：`src/main/conf/message/{模块标识符}/{功能名}/contents_search/caption*.properties`） | 用于检索结果显示的消息属性文件（定义 TYPE 显示名称、字段标签等） | ja / en / zh_CN |

根据情况，也可以仅生成 Crawler 或仅生成模板。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `jssp-function-container.md` | 🟢 **必读** — 模板 JS 的 `init()` 结构 |
| `jssp-naming.md` / `jssp-code-style.md` | 🟢 必读 |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **必读** — Crawler 必须有详细日志和错误处理 |
| `jssp-2way-sql.md` | 🟡 **仅在使用 2WaySQL 时参考**（例如，Crawler 的检索 SQL 使用 2WaySQL 时） |
| `jssp-presentation-page.md` | 🟡 模板 HTML 的基本结构（imcs 专用类优先参考本 Skill 的 assets） |
| `jssp-security.md` | 🟡 实现模板 HTML 时参考 XSS 对策章节。由于检索结果内容（`request` 参数）来自 Apache Solr，存储型 XSS 的风险不为零。DOM 操作使用 `textContent`，`innerHTML` 仅限用于 iAP 内部生成的 HTML |

---

## 实现步骤

**请按从上到下的顺序执行此工作流程。禁止跳过或更改步骤顺序。**

---

### 步骤 1：需求确认

向用户确认以下信息。对于未确定的项目，Skill 将提出合适的默认值。

**生成 Crawler 时：**

| 确认项目 | 补充说明 |
|---------|------|
| 功能名（物理名） | 用于文件路径和常量（例：`sales_order`）。建议使用蛇形命名法 |
| 内容数据来源 | 用于生成注册用内容的数据源（如果从数据库数据生成内容，则提供目标表名及列定义等） |
| 内容定义 | 用于设计注册用内容结构的定义信息（标准字段和动态字段的定义、数据类型、转换规则等）※Solr 字段类型请参考 `reference/dynamic-fields.md` 中的类型表 |
| TYPE 设计 | 是否需要父 TYPE（例：`sales_order`）+ 子 TYPE（按分类）的层次结构。**iAP 产品使用的 TYPE（`workflow` / `imbox` / `iac` / `bpw` / `acceldocuments` / `wdc` / `iag` / `imkb`）禁止使用。** 由于未来产品更新可能新增其他 TYPE，自定义 TYPE 应使用包含功能名或公司标识符的唯一名称 |
| 详情页 URL | 检索结果中附加的源信息页面链接（设置到 `content.setUrl()` 的相对路径）（例：`sales_order/detail`） |
| 访问控制设置 | 可用的构建器请参考 `reference/aci-builders.md`。代表性选项：`EveryoneACIBuilder`（全部已认证用户）/ `StandardRoleACIBuilder`（指定角色）/ `StandardUserACIBuilder`（指定用户）/ `StandardDepartmentACIBuilder`（部门）等。也可以按数据行动态设置 |

**生成模板时：**

| 确认项目 | 补充说明 |
|---------|------|
| 检索结果模板中显示的字段 | 标准字段和需要显示的动态字段（与 Crawler 保持一致） |
| 是否需要多语言支持 | 如果需要，确认各语言的显示文本 |

---

### 步骤 2：读取 Asset

根据要生成的程序，使用 **Read 工具读取**以下 Asset。**此步骤不可省略。**

| 生成对象 | 需读取的文件 |
|---------|----------------|
| Crawler | `assets/simple-crawler.md` |
| 模板（JS・HTML） | `assets/simple-template.md` |

---

### 步骤 3：读取 Java API 参考资料

使用 **Read 工具**必须读取以下参考文件。不得凭记忆或推测编写 Java 类名和方法。

| 文件 | 读取条件 |
|---------|---------|
| `reference/java-api-classes.md` | **始终读取** — 所有 Java 类的完整限定名、主要方法及 SSJS 限制 |
| `reference/aci-builders.md` | **始终读取** — 所有 9 种可用访问控制构建器的构造函数和 SSJS 调用模式 |
| `reference/dynamic-fields.md` | 使用动态字段时 — `Fields.*` 类型及数据类型转换模式 |
| `reference/template-config.md` | 生成模板时 — XML 配置结构 |

---

### 步骤 4：生成 Crawler Job

参考 `assets/simple-crawler.md`，生成 Crawler Job 程序（例：`src/main/jssp/src/{功能名}/job/crawler.js`）。

※ Job 程序请使用 `jssp-im-job-generator`。

**Crawler Job 程序的必要结构：**

1. Java 类引用（`let ContentsSearchManager = Packages.***` 等）
2. `execute()` — Job 入口点（通过 `Contexts.getJobSchedulerContext().getParameter()` 获取参数）
3. `executeDelta(manager, withCommit)` — 差异爬取
4. `executeDelete(manager, withCommit)` — 删除爬取
5. 用于内容注册（标准字段 + 动态字段 + 附件 + 访问控制）和删除的辅助函数（如有需要）

**禁止事项：**
- 继承 `BaseCrawlingJob`（SSJS 中不可能。直接实现 `execute()` 函数）
- 使用 `java.lang.Integer.valueOf()` 等 `valueOf`（Rhino 会将返回值转换回 JS Number。使用 `new` 构造函数替代）
- 将 INT/LONG 字段值以 JS Number 形式传给 `setValue`

---

### 步骤 5：生成模板

基于 `assets/simple-template.md`，生成检索结果模板（功能容器 / 演示页）。

生成文件示例：
- `src/main/jssp/src/im_contents_search/template/{功能名}.js`
- `src/main/jssp/src/im_contents_search/template/{功能名}.html`

**模板 JS 的必要实现：**
1. 全局变量声明 `let $data = '{}';`（以 JSON 字符串形式初始化）
2. `init(request)` 函数 — iAP 逐条调用的入口点。调用 `main(request)` 并将返回值 `response` 通过 `JSON.stringify(response).replace(/\//g, '\\/')` 存储到 `$data`
3. `main(request)` 函数 — 使用 try/catch 处理错误，返回 `{ result: null, error: { code, message } }` 格式的对象
4. `processBusinessLogic(request)` 函数 — 构建并返回显示数据。在服务器端使用 `MessageManager.getMessage()` 获取显示标签，并包含在 `labels` 属性中
5. 日期/数值格式化辅助函数（如有需要）

**演示页的必要实现：**
- 根元素使用 `<div>`，先编写包含 CSS 类（`imcs-content-detail-title` / `imcs-content-detail-subtitle` / `imcs-content-detail-option` / `imcs-content-detail-snippets`）的 HTML 骨架
- 在 `<div>` 末尾放置 IIFE 形式的 `<script>` 块
- 在 `<script>` 标签之后放置 `(function($data) {`，将通过 `<imart type="string" value=$data escapeXml="false" escapeJs="false" />` 展开的 JSON 作为 IIFE 参数接收（不将 `$data` 设为全局变量）
- 若 `$data.error.code` 已设置，则隐藏容器并中断处理
- 通过 `document.currentScript.parentElement` 获取容器，使用 `querySelector` 引用各元素，用 `textContent` / `innerHTML` 设置值

**禁止事项：**
- 对用户来源的值（`$data.result.title`、动态字段值等）使用 `innerHTML`（XSS）— 使用 `textContent`
- `innerHTML` 仅限用于 `$data.result.snippets`（iAP 用 `<b>` 标签标记关键词的文本）
- 从模板中调用 `ContentsSearchManager.search()`（模板是被动接收的）

---

### 步骤 6：生成模板配置 XML

参考 `reference/template-config.md`，生成以下文件。

**生成文件：**
- `src/main/conf/contentssearch-template-config/{功能名}.xml`

**实现要点：**
- TYPE 层次（父/子）与 Crawler 中 `setTypes()` 的设计保持一致
- 子 TYPE 的 `type` 属性只指定子 TYPE（不使用 `"<父 TYPE>$<子 TYPE>"`），通过 `<parent-type>` 明确声明父级
- 在 `<require-dynamic-fields>` 中，仅声明**模板 HTML 中实际显示的动态字段**
- `<template-path>` 使用 `.jssp` 扩展名（指向 `.js` / `.html` 的文件对）

**搜索结果模板不需要 `routing-jssp-config/` 下的路由配置。** 模板由 IM-ContentsSearch 通过 `<template-path>` 直接调用，因此不像普通画面那样经过 URL 路由（详见 `.agents/requirements/jssp-file-structure/AGENTS.md` 中的"不经过路由表调用的画面的例外规约"章节）。

---

### 步骤 7：生成消息属性

在消息属性文件中设置显示用名称。

如果已在 `src/main/conf/message/` 下创建了消息属性文件，可以不另建专用消息属性文件，直接向已有文件中添加键。

※ 创建属性文件请使用 `jssp-localize-support`。

**必要键：**

- 父 TYPE 的画面显示用属性键
- 子 TYPE 的画面显示用属性键（存在子 TYPE 时）
- 检索结果中显示的字段的画面显示用属性键（需要在检索结果中显示自定义字段时）

日语 `caption_ja.properties` 和中文 `caption_zh_CN.properties` 消息属性文件**必须使用 Unicode 转义格式**（相当于 `native2ascii`）编写。

---

### 步骤 8：Job scheduler 注册说明

生成 Crawler 时，向用户提供以下信息。

**Crawler Job 参数设计：**

遵循 `BaseCrawlingJob.java` Javadoc 中定义的参数键和初始值。

| 参数名 | 默认值 | 允许值 | 行为 |
|------------|-----------|--------|------|
| `crawlingType` | `DELTA` | `DELTA` / `DELETE` / `REINDEX` | 爬取类型 |
| `withCommit` | `true` | boolean 字符串 | 处理完成后执行提交 |
| `withOptimize` | `false` | boolean 字符串 | 爬取完成后执行优化。由于负荷较高，推荐在 Job 网络末尾配置 `OptimizeJob` |
| `maxSegments` | `1` | 1 以上的整数 | 优化的分段数。值越小优化精度越高，处理负荷也越大。在 `withOptimize=true` 时有效 |
| `groupName` | `"default"` | 字符串 | 检索服务器组名（Solr 连接设定） |

**首次运行：** 使用 `crawlingType=REINDEX` 创建全量索引。
**定期运行：** 使用 `crawlingType=DELTA` 按计划运行。

---

## SSJS（Rhino）特有限制

详情请参考 `reference/java-api-classes.md`。主要限制一览：

| 限制 | 对策 |
|------|--------|
| 向 Java varargs 方法传入单个值时，可能无法正确解析 | 用 JS 数组包装（例：`content.addText([description])`、`content.setTypes([type1, type2])`） |
| 调用参数类型为包装类（Integer / Long 等）而非基本类型（int / long 等）的方法时，需要进行显式类型转换 | 使用 `new java.lang.Integer(val)` 或 `new java.lang.Long(val)` 显式转换后传入。通过 `Integer.valueOf()` 等进行类型转换时，由于 Rhino 会将返回值转为 Number 类型，故无法使用 |
| `LastCrawlingDateHolder` 不存在清除日期时间的方法 | 使用 `updateLastCrawlingDate(new java.util.Date(0))` 等设置过去日期进行重置 |
| Java `List` 不能使用 `for...in` | 使用 `for (let i = 0; i < list.size(); i++) list.get(i)` 进行迭代 |
