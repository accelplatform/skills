---
name: java-im-authz-usage
description: intra-mart 固有の認可（Authorization）API（`jp.co.intra_mart.foundation.authz.*`、`im_authz_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。認可リソース・リソースグループ、サブジェクト・サブジェクトグループ（Expression による条件式構成）、ポリシーの新規登録・更新・削除、AuthorizationClient による権限確認（authorize）の実装パターンを提供する。Java で認可機構を使いたい、Java で AuthorizationClient / ResourceManager / SubjectManager / PolicyManager を使いたい、JavaEE 開発モデルでリソース・サブジェクト・ポリシーを登録したい、権限チェック（authorize）をJavaで実装したい、と言及されたときに使用。ロール定義自体のCRUD（RoleInfoManager）は `java-im-role-usage`、特定ユーザへのロール割当は `java-im-account-usage` を使うこと。JSSP（スクリプト開発モデル）向けの同等API（d.ts）は2026年時点で提供されていない。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart 认可（Authorization）API（Java 版）使用支持技能

## 目的

使用 intra-mart Accel Platform 提供的面向 **JavaEE 开发模型**的认可（Authorization）API（`jp.co.intra_mart.foundation.authz.*`），在 Java 代码中实现认可资源、主体（Subject）、策略（Policy）的新增登录・更新・删除，以及通过 `AuthorizationClient` 进行权限确认（authorize）的技能集。

## 认可的基本概念（最重要）

认可判断由「谁（Subject）」「对什么（Resource）」「做什么操作（Action）」「允许/禁止（Effect）」这四个要素构成。

| 概念 | 作用 |
|------|------|
| 资源（`Resource`）/ 资源组（`ResourceGroup`） | 认可对象。以资源URI（`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 格式）为键。名称・说明由配对的 `ResourceGroup` 持有 |
| 主体（`Subject`）/ 主体组（`SubjectGroup`） | 「谁」的条件。主体本身无法单独登录，必须组合成 `Expression`（AND/OR/NOT）后作为 `SubjectGroup` 登录 |
| 策略（`Policy`） | (资源组, 主体组, 资源类型, 操作) → 效果（`PERMIT`/`DENY`）的组合 |
| `AuthorizationClient` | 开发者进行权限确认的**推荐入口点**（`authorize(...)` 返回 `AuthorizeResult`） |

`ResourceManager` / `SubjectManager` / `PolicyManager` 负责资源・主体・策略的 CRUD，`AuthorizationClient` 负责权限确认。这些**均只公开接口，不可直接引用实现类，必须通过对应的 `*Factory` 类获取实例**。

## 与角色（Role）・账户管理的边界（重要）

**本技能仅涵盖「认可」（资源・主体・策略的 CRUD 与权限确认）。** intra-mart 中还存在角色管理这一独立概念，对应的 API 与技能均不同。

| 操作 | 对象 API | 负责技能 |
|------|---------|-----------|
| 认可资源・主体・策略的 CRUD，权限确认（authorize） | `jp.co.intra_mart.foundation.authz.*`（`ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`） | **本技能** |
| 角色定义本身的新增登录・更新・删除・层级・分类 | `RoleInfoManager` | `java-im-role-usage`（本技能范围外） |
| 为特定用户分配・解除角色 | `AccountInfoManager#addAccountRoleInfo` 等 | `java-im-account-usage`（本技能范围外） |

如果请求是「想新建角色」「想给用户分配角色」，这属于角色管理而非认可（Authz），应分别引导至 `java-im-role-usage` / `java-im-account-usage`。不过，将「属于某角色的用户群」作为认可的**主体**条件使用是合理的场景（此时具体的 `Subject` 实现由 `im_master_subjecttypes` 等扩展模块提供，属于本技能范围外）。

**本技能仅涵盖 Java 源文件（`.java`）。** 截至2026年，`d.ts/` 目录下尚未提供面向 JSSP（`.js`）的对应 API（d.ts）。如被要求在 JSSP 中使用认可功能，应告知用户该情况并确认应对方针。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 Javadoc |

截至2026年，`.github/instructions` 目录下不存在专门规定异常处理的 Java 专用规约。`SubjectManager#removeSubject`/`removeSubjectGroup` 会抛出 `SubjectManagingException`（受检异常），而 `ResourceManager`/`PolicyManager`/`AuthorizationClient` 的主要 CRUD・权限确认方法以非受检异常为主（`InvalidResourceUriException` 等部分除外）。异常处理方式遵循 `reference/authz-api-reference.md` 中各方法定义及 `assets/authz-basic-usage.md` 中的模式。

`jssp-*` 相关规约不适用于本技能（不要应用于 Java 文件）。

## API 概述

`jp.co.intra_mart.foundation.authz` 包下的 API 属于 `im_authz_base` 模块（公开接口）。详细的方法签名・包结构请参考 `reference/authz-api-reference.md`（不要凭记忆或猜测编写）。

要点：
- **CRUD 与权限确认均通过 Factory 模式获取。** 通过对应的 `*Factory.getInstance().getXxx()` 获取实例，例如 `ResourceManagerFactory.getInstance().getResourceManager()`
- **Manager/Client 实例不可跨多个租户复用。** 在同一线程内切换租户时，不要缓存实例，每次都应重新从 Factory 获取（`ResourceManager` 的 Javadoc 中明确记载的约束）
- **主体（Subject）无法单独登录。** 需通过 `SubjectExpression.S(subject)` 转换为 `Expression`，并可用 `Expression.AND`/`OR`/`NOT` 组合后传给 `SubjectManager#registerSubjectGroup(...)`
- **`getDeclaredPolicy`（仅明确设置的策略，未设置时返回 `null`）与 `getActualPolicy`（补全继承后的实际生效策略）用途不同。** 若需了解实际生效的权限，应使用 `getActualPolicy`/`getActualPolicies`

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 资源登录 | `assets/authz-basic-usage.md` | 通过 `ResourceManager#registerAsResource` 登录资源URI，`I18nValue` 的用法 |
| 主体组登录 | `assets/authz-basic-usage.md` | 使用 `SubjectExpression.S(...)` 与 `Expression.AND`/`OR`/`NOT` 构建主体表达式，`SubjectManager#registerSubjectGroup` |
| 策略设置 | `assets/authz-basic-usage.md` | 通过 `PolicyManager#setPolicy` 登录允许・禁止，内置主体组（`getAuthenticatedUsers`/`getGuestSubjectGroup`）的使用 |
| 权限确认（画面・API 中的认可检查） | `assets/authz-basic-usage.md` | `AuthorizationClient#authorize` 的调用模式，`AuthorizeResult` 的判定方法 |
| 策略的参照与解除 | `assets/authz-basic-usage.md` | `getDeclaredPolicy`/`getActualPolicy` 的区分使用，通过 `removePolicy` 回退 |

### 参考资料

- `reference/authz-api-reference.md` — `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`/`PolicyDecisionService`/`PolicyInformationService`/模型接口（`Resource`/`Subject`/`Policy`/`Effect`/`AuthorizeResult`）的核心方法・签名（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

用户提出以下请求时使用：
- 「想在 Java 中使用认可机构（Authz）」
- 「想在 JavaEE 开发模型中使用 AuthorizationClient 实现权限检查」
- 「想新登录认可资源・主体・策略」
- 「想针对满足特定条件（组织・公共组等）的用户群设置权限」
- 「想确认该用户是否被允许对该资源执行某操作」

若未明确说明是「Java」还是「JavaEE 开发模型」，应向用户确认现有项目实现所采用的模型。

「想新建角色」「想给用户分配角色」这类请求属于本技能范围外，应引导至 `java-im-role-usage` / `java-im-account-usage`。

## 实现步骤

1. 听取用户需求（是资源・主体・策略的 CRUD，还是权限确认（authorize）的实现？若目的是角色定义或角色分配，应引导至 `java-im-role-usage`/`java-im-account-usage`）
2. 设计资源URI（`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 格式，以应用名・组件名分层，避免与其他应用冲突）
3. 整理主体条件（是单一 `Subject`，还是通过 `Expression.AND`/`OR`/`NOT` 组合的复合条件？同时确认内置组（`getAuthenticatedUsers`/`getGuestSubjectGroup`）是否足够）
4. 参考 `assets/authz-basic-usage.md` 进行实现（方法签名务必参考 `reference/authz-api-reference.md`，不要凭记忆或猜测编写）
5. 实现权限确认时，将资源URI的组装逻辑在登录处理与确认处理之间共用（避免因写法不一致导致判定错误）
6. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **不要将 Manager/Client 实例跨租户缓存在字段中。** 这是 `ResourceManager` 的 Javadoc 中明确记载的约束——若复用实例，部分 API 的执行可能失败。每次调用都应从 `*Factory.getInstance().getXxx()` 重新获取
- **不存在单独登录主体的 API。** 必须按照 `SubjectExpression.S(subject)` → `Expression.AND`/`OR`/`NOT` → `SubjectManager#registerSubjectGroup(Expression, ...)` 的顺序将其登录为 `SubjectGroup`
- **`Effect.BLOCK` 无法作为策略直接登录。** 它是仅作为认可判断结果出现的值，若传给 `setPolicy` 会引发 `IllegalSerializationException`。策略登录应仅使用 `PERMIT`/`DENY`
- **`AuthorizeResult` 的判定应采用 `AuthorizeResult.Permit.equals(result)` 的形式。** 若使用 `result == AuthorizeResult.Permit`，在未来枚举常量增加时可能导致判定遗漏风险（Javadoc 中的明确推荐事项）
- **不要混淆 `getDeclaredPolicy` 与 `getActualPolicy`。** `getDeclaredPolicy` 在未明确设置时返回 `null`（调用方必须进行 null 检查）。若需了解实际生效的权限，应使用补全继承后的 `getActualPolicy`/`getActualPolicies`
- **`removePolicy`/`removeResourceGroup`/`removeSubjectGroup`/`removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` 均为破坏性操作。** 尤其是 `removeAllPolicies`（删除全部策略）与 `removeResourceGroup`（连同其下的资源・策略一并删除）影响范围较大，调用前应确认影响范围
- **通常无需直接调用 `PolicyDecisionService`/`PolicyInformationService`。** Javadoc 中也明确记载「通常无需直接操作此类」，权限确认应使用 `AuthorizationClient`
- **`PolicyInformationServicetFactory`（`Service` 紧接着多了一个 `t`）是原始源代码中的类名。** 不要误认为拼写错误而将其重命名

## 生成后确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. `AuthorizeResult` 的判定是否使用 `.equals()`（而非 `==` 比较）
2. 所有使用 `getDeclaredPolicy()` 返回值的地方是否都进行了 null 检查
3. 传给 `setPolicy(...)` 的效果是否始终为 `PERMIT`/`DENY` 之一，而非直接登录 `BLOCK`
4. `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient` 的实例是否未在 `static` 字段等处跨租户缓存
5. 资源URI的组装逻辑是否在登录处理与确认处理之间共用（是否存在写法不一致）
6. `removeAllPolicies`・`removeResourceGroup`・`removePoliciesForResourceGroup`・`removePoliciesForSubjectGroup` 等破坏性操作是否仅在需求所要求的范围内执行
7. 是否未吞没 `SubjectManagingException`（受检异常）
8. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目中另有面向 Java 的代码审查・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **Java（JavaEE 开发模型）中认可资源・主体・策略的 CRUD 与权限确认** | **本技能** |
| Java 中的角色定义（CRUD、层级、分类、检索） | `java-im-role-usage` |
| Java 中为特定用户分配・解除角色 | `java-im-account-usage` |
| Java 中的文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java 中的唯一 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java 中的排他控制（`NewLock`） | `java-im-lock-usage` |
| Java 中的工作流联动处理 | `java-im-workflow-usage` |
| 在 JSSP（脚本开发模型）中使用认可功能 | 截至2026年尚未提供对应的 d.ts / 技能（本技能范围外） |
