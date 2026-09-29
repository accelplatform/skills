---
name: java-im-contexts-usage
description: >
  用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的执行上下文获取 API
  （`jp.co.intra_mart.foundation.context.Contexts`，`im_core_base` / `im_user_context` /
  `im_job_scheduler_base` 模块）的技能集。提供 AccountContext（用户代码、租户ID、区域设置、时区、
  角色ID、认证状态）、UserContext（用户资料、所属部门、公司、职位、公共组、用户分类）、
  ClientContext（客户端类型）、ExternalUserContext（外部用户判定）、JobSchedulerContext
  （任务执行参数）的获取模式，以及通过 ContextStatus 进行的认证/管理员判定。
  当用户提到：想在 Java 中获取登录用户的信息、想了解 Contexts.get() 的用法、想确认
  AccountContext 或 UserContext 的方法、想实现认证检查（isAuthenticated）或管理员判定
  （isAdministrator）、想获取用户的区域设置/时区、想获取角色ID列表、想获取用户所属部门
  （Department）或公司（Company）的信息、想在任务中获取执行参数、想获取公共组或用户分类信息、
  想判定是否为外部用户时使用本技能。
  若要在 JSSP（脚本开发模型）中实现同等处理，请使用 SSJS 版 Context 对象
  （`d.ts/platform/object/im-ssjs-*-context.d.ts`、
  `d.ts/platform/job-scheduler/im-ssjs-job-scheduler-context.d.ts`）。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Contexts API（Java 版）支持技能

## 目的

用于使用 intra-mart Accel Platform 面向 **JavaEE 开发模型**提供的执行上下文获取 API（`jp.co.intra_mart.foundation.context.Contexts`），在 Java 代码中获取登录用户的账户信息、组织信息、客户端信息以及任务执行信息的技能集。

**本技能仅涉及 Java 源文件（`.java`）。** JSSP（`.js`）的实现请使用 `d.ts/platform/object/` 和 `d.ts/platform/job-scheduler/` 下的 SSJS 版 Context 对象（不在本技能范围内）。

## 入口点

`jp.co.intra_mart.foundation.context.Contexts` 类的 `get()` 是唯一入口点。

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

AccountContext accountContext = Contexts.get(AccountContext.class);
```

```java
public static <T extends Context> T get(final Class<T> type)
```

若在存储区中找不到指定类型的上下文，将抛出 `ContextNotFoundException`（**非受检异常**，是 `RuntimeException` 的子类），方法签名无需 `throws` 声明。但在上下文不可用的运行环境（参见下文"上下文可用范围"）中调用会在运行时抛出异常，需加以注意。

## 可获取的上下文类型

| 上下文类型 | 包 | 所属模块 | 用途 |
|---|---|---|---|
| `AccountContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | 账户、认证、区域设置、角色ID |
| `UserContext` | `jp.co.intra_mart.foundation.user_context.model` | `im_user_context` | 用户资料、组织信息（来自 IM 通用主数据） |
| `ClientContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | 客户端类型ID |
| `ExternalUserContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | 外部用户判定 |
| `JobSchedulerContext` | `jp.co.intra_mart.foundation.job_scheduler` | `im_job_scheduler_base` | 任务执行参数、任务网信息 |

所有方法签名与 JavaDoc 请务必参考 `reference/contexts-api-reference.md`（不要凭记忆或推测编写）。

## ContextStatus 工具类

`jp.co.intra_mart.foundation.context.ContextStatus` 提供常见判定的快捷方式（内部只是调用 `Contexts.get(AccountContext.class)`，简单判定时优先使用它）。

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (ContextStatus.isAuthenticated()) { /* 已认证 */ }
if (ContextStatus.isAdministrator()) { /* 系统管理员 */ }
```

| 方法 | 返回值 | 说明 |
|---|---|---|
| `isAdministrator()` | `boolean` | `AccountContext.getUserType()` 是否为 `ADMINISTRATOR` |
| `isAuthenticated()` | `boolean` | `AccountContext.isAuthenticated()` 的结果 |
| `validate()` | `boolean` | 检查登录签名的完整性（未认证用户始终为 `false`） |

## 应使用哪个上下文（判定表）

| 所需信息 | 获取方式 |
|---|---|
| 用户代码 | `AccountContext.getUserCd()` |
| 租户ID | `AccountContext.getTenantId()` |
| 区域设置 | `AccountContext.getLocale()` |
| 时区 | `AccountContext.getTimeZone()` |
| 是否已认证 | `ContextStatus.isAuthenticated()` |
| 是否为管理员 | `ContextStatus.isAdministrator()` |
| 用户种别 | `AccountContext.getUserType()` |
| 角色ID列表（含子角色） | `AccountContext.getRoleIds()` |
| 登录时间 | `AccountContext.getLoginTime()` |
| 用户显示名、邮箱等 | `UserContext.getUserProfile()` 的各方法 |
| 主所属部门 | `UserContext.getMainDepartment()` |
| 全部所属部门 | `UserContext.getAllDepartments()` |
| 所属公司 | `UserContext.getCompanyList()` |
| 职位 | `UserContext.getMainPostList()` / `getAllPosts()` |
| 公共组 | `UserContext.getPublicGroupList()` |
| 用户分类 | `UserContext.getUserCategoryList()` |
| 客户端类型 | `ClientContext.getClientTypeId()` |
| 是否为外部用户 | `ExternalUserContext.isExternalUser()` |
| 任务执行参数 | `JobSchedulerContext.getParameter(key)`，或任务内使用 `BaseJob.getParameter(key)` |

## 应参考的规约

| 规约 | 处理方式 |
|---|---|
| `.claude/rules/java-naming.md` | 🟢 **必读** — 包/类/方法/变量命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必读** — 类/方法 JavaDoc |
| `.claude/rules/java-logging.md` | 🟡 实现日志时 — 除用户代码外不要输出个人信息 |

`jssp-*` 规约不适用于本技能（不要应用于 Java 文件）。

## API 概述

完整方法列表、JavaDoc 及相关模型类（`UserProfile` / `Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory`）请参考 `reference/contexts-api-reference.md`（基于平台实际类定义，不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---|---|---|
| 在服务层获取用户信息、认证检查 | `assets/contexts-basic-usage.md` | `AccountContext` 的获取、认证检查模式 |
| 使用区域设置/时区实现国际化 | `assets/contexts-basic-usage.md` | 使用 `Locale`/`TimeZone` 的日期格式化示例 |
| 获取用户所属组织信息 | `assets/contexts-basic-usage.md` | 从 `UserContext` 获取部门/公司的示例 |
| 在任务中获取参数 | `assets/contexts-basic-usage.md` | 继承 `BaseJob` 的任务中使用 `getParameter()` 的示例 |

### 参考资料

- `reference/contexts-api-reference.md` — `Contexts` / `ContextStatus` / 各 Context 接口的全部方法、`UserType` 枚举、按环境划分的上下文可用范围

## 使用时机

当用户提出如下请求时：
- "我想在 Java 中获取登录用户的信息"
- "我想在 JavaEE 开发模型中使用 Contexts.get()"
- "我想在服务层获取用户代码或租户ID"
- "我想获取用户所属的部门/公司"
- "我想在任务中获取执行参数"
- "我想判断用户是否已认证/是否为管理员"

若未明确说明是 Java 还是 JSSP，请向用户确认项目采用的开发模型。若是在 JSSP（专业代码）画面或函数容器内获取上下文，应使用对应的 SSJS 版 Context 对象（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`）。

## 实现步骤

1. 根据上述判定表确定所需的上下文类型
2. 使用 `Contexts.get(XxxContext.class)` 获取。**无需对返回值进行空值检查**（`Contexts.get()` 不会返回 null，无法获取对应上下文时始终会抛出 `ContextNotFoundException`）。某些上下文在特定运行环境中可能抛出该异常，需要时请加以考虑（参见下文"注意事项"）
3. 对于以认证为前提的处理，确认 `ContextStatus.isAuthenticated()` 或 `AccountContext.isAuthenticated()`
4. 参考 `assets/contexts-basic-usage.md` 实现（方法签名务必参考 `reference/contexts-api-reference.md`，不要凭记忆或推测编写）
5. 遵守按层划分的使用位置（参见下文"注意事项"）
6. 确认是否符合 `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **必须：不要对 `Contexts.get()` 的返回值进行空值检查（该检查是永远不会执行的死代码）。** `Contexts.get()` 绝不会返回 null——找不到对应上下文时，始终会抛出 `ContextNotFoundException`（非受检异常）（已通过实际源码与实际运行环境双重确认）。因此 `if (account == null)` 这样的分支永远不会为真。某些上下文在特定运行环境中可能无法获取（参见下文"上下文可用范围"），需要处理获取失败的情况时，应捕获 `ContextNotFoundException` 而非进行空值检查（不过 `AccountContext` 是必需上下文，通常不会抛出该异常）
- **必须：认证检查。** 即使成功获取 `AccountContext`，`isAuthenticated()` 也可能返回 `false`（未认证用户、系统启动时等）。以认证为前提的处理必须进行确认
- **禁止：持有或缓存上下文。** 上下文绑定于请求（或线程）。不得保存在实例字段或 `static` 字段中
  ```java
  // 错误：保存在字段中（初始化时的上下文被固定）
  private AccountContext account = Contexts.get(AccountContext.class);

  // 正确：在需要时随时获取
  public void process() {
      AccountContext account = Contexts.get(AccountContext.class);
  }
  ```
- **禁止：输出个人信息到日志。** 用户代码（`getUserCd()`）和租户ID可以输出到日志，但 `UserProfile` 中的姓名（`getUserName()`）、邮箱、电话号码、地址等个人信息不得输出到日志
- **注意：`AccountContext.getUserCd()` 即使对系统管理员或未认证用户也会返回值。** 不要仅凭该代码进行业务判断，必须与 `getUserType()` 及/或 `isAuthenticated()` 组合使用
- **注意：`getLoginGroupId()` 已废弃（`@Deprecated`）。** 这是一个返回与租户ID相同值的兼容性属性，新实现应使用 `getTenantId()`
- **推荐：按层划分的使用位置**
  - 表现层/控制器层：认证确认、区域设置获取
  - 应用层/服务层：用户代码获取、审计字段设置、基于组织信息的业务逻辑判断
  - 基础设施层（DAO/Repository）：不要直接调用 `Contexts` API，应从上层通过参数传入

## 生成后检查

并非通过自动验证脚本（如 JSSP 版的 `validate-jssp-code.js`），而是手动确认以下内容。

1. 每处 `Contexts.get()` 调用是否考虑了上下文可能不可用的运行环境（参见上文"上下文可用范围"）
2. 以认证为前提的处理中是否遗漏了 `isAuthenticated()` 检查
3. 是否将上下文保存在实例字段或 `static` 字段中
4. 是否将 `UserProfile` 中的姓名、邮箱等个人信息输出到日志
5. 基础设施层（DAO/Repository）是否直接调用了 `Contexts` API
6. 是否符合 `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。如果项目另有面向 Java 的代码评审/安全检查技能，请使用那些技能

## 上下文可用范围

各上下文的实现通过 `ContextProducer`（按运行环境划分的插件机制）存入存储区。下表涵盖 HTTP 请求环境（已认证，通过 Web API）与任务调度器执行环境（通过 `BaseJob`）。结果可能依赖租户/用户配置，若运行环境不在下表范围内（例如未认证的 HTTP 请求），应以 `Contexts.get()` 的调用结果（正常获取，还是抛出 `ContextNotFoundException`）单独确认。

| 运行环境 | AccountContext | UserContext | ClientContext | JobSchedulerContext |
|---|---|---|---|---|
| HTTP 请求（已认证） | ○ | ○ | ○ | ×（`ContextNotFoundException`） |
| 任务调度器 | ○（设置为任务执行用户的上下文，`userCd` 为任务执行专用的技术账号） | ○（但若执行用户在 IM 通用主数据中没有对应记录，`getUserContext().getUserProfile()` 可能返回 `null`） | ○（`clientTypeId` 可以获取） | ○（推荐通过 `BaseJob.getJobContext()`） |

## 在任务中使用 JobSchedulerContext

对于继承 `jp.co.intra_mart.foundation.job_scheduler.BaseJob` 的任务实现，推荐优先使用 `BaseJob` 提供的 `protected` 工具方法（`getJobContext()` / `getParameter()` / `getParameterAsInteger()` 等），而不是直接调用 `Contexts.get(JobSchedulerContext.class)`。详见 `reference/contexts-api-reference.md`。

## 与其他技能的边界

| 职责 | 负责的技能 |
|---|---|
| 在 SSJS（JSSP）中获取上下文 | 使用对应的 SSJS 版 Context 对象（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`），不在本技能范围内 |
| **在 Java（JavaEE 开发模型）中获取上下文** | **本技能** |
| 在 Java 中更新账户信息/分配角色（`AccountInfoManager`） | `java-im-account-usage` |
| 在 Java 中对角色定义本身进行 CRUD（`RoleInfoManager`） | `java-im-role-usage` |
| 在 Java 中进行授权检查（`AuthorizationClient`） | `java-im-authz-usage` |
| 在 Java 中实现任务本体（`execute()` 的实现等） | 不在本技能范围内（如项目另有任务实现相关技能，请使用该技能） |
