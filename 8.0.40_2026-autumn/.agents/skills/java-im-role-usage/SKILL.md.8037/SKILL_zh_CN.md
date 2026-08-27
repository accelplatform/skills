---
name: java-im-role-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的角色管理 API（`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`）的技能集。提供角色的新建/更新/删除、子角色层级（添加/删除/获取全部父角色或子角色）、分类管理（列表/移动/删除）、按角色ID/角色名/分类检索与分页的实现模式。当用户提到想在 Java 中新建角色、想在 Java 中使用 RoleInfoManager、想在 JavaEE 开发模型中管理角色层级或分类时使用。将角色分配给特定用户（`addAccountRoleInfo` 等）不在本技能范围内，请使用 `java-im-account-usage`。若要在 JSSP（脚本开发模型）中实现同等处理，请使用 SSJS 版 RoleInfoManager API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）。
---

# intra-mart Role Management API（Java 版）使用支持技能

## 目的

使用 intra-mart Accel Platform 为 **JavaEE 开发模型**提供的角色管理 API（`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`），在 Java 代码中实现角色定义本身的新建、更新、删除、层级（子角色）管理、分类管理与检索的技能集。

## 角色与账户的边界（最重要）

**本技能仅涉及角色定义本身的 CRUD、层级、分类管理。** 将角色分配给特定用户（例如 `AccountInfoManager#addAccountRoleInfo`）不在范围内。

| 操作 | 对应 API | 负责技能 |
|------|---------|-----------|
| 角色的新建・更新・删除 | `RoleInfoManager#addRoleInfo` / `updateRoleInfo` / `deleteRoleInfo` | **本技能** |
| 子角色层级的添加・删除・查询 | `RoleInfoManager#addSubRoleInfo` / `deleteSubRoleInfo(s)` / `get(All)SubRoleIds` / `get(All)ParentRoleIds` | **本技能** |
| 分类的列表・移动・删除 | `RoleInfoManager#getCategories` / `moveCategory` / `deleteCategory(ies)` | **本技能** |
| 角色的检索・分页 | `RoleInfoManager#searchRoleInfosBy*` | **本技能** |
| **将角色分配/解除给特定用户** | `AccountInfoManager#addAccountRoleInfo` 等 | **`java-im-account-usage`（本技能范围外）** |

如果需求是「给用户分配角色」「更改账户所持有的角色」，由于这不是对角色定义本身的操作，应引导至 `java-im-account-usage`。

**本技能仅涉及 Java 源文件（`.java`）。** 在 JSSP（`.js`）中实现时，请使用对应的 SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下目前不存在规定异常处理方针的 Java 专用规约（截至2026年）。`RoleInfoManager` 的所有方法都被设计为抛出 `AdminException`（受检异常），业务异常的包装方针应遵循 `assets/role-basic-usage.md` 中的模式。

`jssp-*` 的规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`RoleInfoManager` 类属于 `jp.co.intra_mart.foundation.admin.role` 包，是一个非 `final` 的普通类。提供角色的新建・更新・删除、子角色层级管理、分类管理、检索与分页。详细的签名与相关类请参考 `reference/role-api-reference.md`（不要凭记忆或猜测编写）。

要点：
- **`RoleInfo` 有三种构造函数。** `RoleInfo()`（通过 `Identifier` 自动为角色ID编号，**会抛出 `IOException`**）、`RoleInfo(roleId)`（指定角色ID，角色名将与角色ID相同）、`RoleInfo(roleId, roleName)`（两者都指定）。应根据用途区分使用
- **`RoleInfo` 的 `displayName` 是 `Map<Locale, String>`，** 而非单一 `String`，可按语言环境保存不同的显示名
- **`getRoleInfo(roleId)` 在角色不存在时返回 `null` 而非抛出异常。** 调用方必须进行 null 检查（详见「注意事项」）

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 角色的新建・获取・更新 | `assets/role-basic-usage.md` | `RoleInfo` 构造函数的选择使用、`addRoleInfo`/`getRoleInfo`（含 null 检查）/`updateRoleInfo` 的调用示例 |
| 子角色层级的构建与层级检索 | `assets/role-basic-usage.md` | `addSubRoleInfo`、`getAllSubRoleIds`/`getSubRoleIds` 的区分使用 |
| 角色内含检查 | `assets/role-basic-usage.md` | 使用 `certify` 的业务逻辑示例 |
| 按分类检索与分页 | `assets/role-basic-usage.md` | 使用 `searchRoleInfosByCategoryAndRoleName` 的列表画面实现 |
| 大量子角色注册的优化 | `assets/role-basic-usage.md` | `WithoutCreatingSummary` 系列方法与 `regenerateRoleSummary()` 的组合 |

### 参考资料

- `reference/role-api-reference.md` — `RoleInfoManager` / `RoleInfo` / `RoleInfoListItem` / `AdminException` 的全部方法与签名（基于实际平台 API 类定义，不要凭记忆编写）

## 使用时机

用户提出以下请求时使用：
- 「想在 Java 中新建角色」
- 「想在 JavaEE 开发模型中使用 RoleInfoManager API 管理角色层级」
- 「想给角色添加・删除子角色」
- 「想列出・移动角色分类」
- 「想按角色ID或角色名创建带分页的检索列表」

如果没有明确提到「在 Java 中」「在 JavaEE 开发模型中」，应先向用户确认现有项目实现所采用的开发模型。如果是在 JSSP（专业代码）画面或函数容器内实现，则使用 SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）。

「想给用户分配角色」「想更改特定账户所持有的角色」这类需求不在本技能范围内，应引导至 `java-im-account-usage`。

## 实施步骤

1. 听取用户需求（是角色定义的 CRUD、子角色层级操作、分类管理，还是检索・列表画面。若目的是给用户分配角色，则引导至 `java-im-account-usage`）
2. 选择 `RoleInfo` 的构造函数（自动编号角色ID，还是明确指定），并确定是否需要设置角色名・分类・（按语言环境的）显示名
3. 参考 `assets/role-basic-usage.md` 进行实现（方法签名必须参考 `reference/role-api-reference.md`，不要凭记忆或猜测编写）
4. 处理子角色层级时，默认使用 `addSubRoleInfo`/`deleteSubRoleInfo(s)`（自动更新摘要的版本），仅在大量数据批量更新等出现性能问题时才使用 `WithoutCreatingSummary` 系列方法，并在最后统一调用一次 `regenerateRoleSummary()`
5. 确认是否遵循 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **`getRoleInfo(roleId)` 在角色不存在时返回 `null` 而非抛出异常。** 若不进行 null 检查直接使用返回值，会导致 `NullPointerException`。必须进行 null 检查
- **`RoleInfo()`（无参构造函数）会抛出 `IOException`**（通过 `Identifier` 自动编号失败时）。其余两种构造函数（`RoleInfo(roleId)` / `RoleInfo(roleId, roleName)`）不会抛出异常。选择构造函数时应意识到这种不对称性
- **`certify` 的第一个参数（`nestRoleIds`）与第二个参数（`roleIds`）在「是否展开嵌套」上是不对称的。** 第一个参数会连同嵌套的角色一起检查，第二个参数仅按直接匹配检查。参数顺序颠倒会导致判定遗漏
- **区分使用 `getAllParentRoleIds`/`getAllSubRoleIds`（递归・全部层级）与 `getParentRoleIds`/`getSubRoleIds`（仅一层）。** 应在实现前明确是只需要「直属的父/子」，还是需要「全部层级」
- **使用 `WithoutCreatingSummary` 系列方法（8.0.37 及以后）时，必须另外调用 `regenerateRoleSummary()`。** 若不调用，角色摘要会变得不一致，导致 `getAllSubRoleIds`/`getAllParentRoleIds`/`certify` 等依赖摘要的检索结果不准确。通常应以 `addSubRoleInfo`/`deleteSubRoleInfo(s)`（自动更新摘要的版本）为默认方式，仅在大量数据批量更新等出现性能问题时才使用 `WithoutCreatingSummary` 系列方法，并在最后统一调用一次 `regenerateRoleSummary()`
- **`getCategoryCount` 已 `@Deprecated`。** 新实现应使用 `getRoleInfoCountByCategory`
- **`moveCategory` 是会批量更新该分类下所有角色分类名的破坏性操作。** 调用前应确认对象范围与影响

## 生成后确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下内容。

1. 所有使用 `getRoleInfo()` 返回值的地方是否都进行了 null 检查
2. 使用 `RoleInfo()`（无参构造函数）的地方是否恰当地处理了 `IOException`
3. `certify()` 的第一个・第二个参数（是否展开嵌套）是否按预期顺序传递
4. 使用 `WithoutCreatingSummary` 系列方法的地方，后续是否都无遗漏地调用了 `regenerateRoleSummary()`
5. 新实现中是否使用了已 `@Deprecated` 的 `getCategoryCount`・`isUpdate`
6. `moveCategory`・`deleteRoleInfo(s)`・`deleteCategory(ies)` 等破坏性操作是否仅在需求要求的范围内执行
7. 是否存在吞掉 `AdminException`（受检异常）的情况
8. 是否遵循 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` 是 JSSP 专用的，不适用于本技能的生成物。如果项目另有 Java 专用的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| 在 SSJS（JSSP）中操作角色定义 | 使用对应的 SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）（本技能范围外） |
| **在 Java（JavaEE 开发模型）中管理角色定义（CRUD・层级・分类・检索）** | **本技能** |
| 在 Java 中将角色分配/解除给特定用户 | `java-im-account-usage` |
| 在 Java 中进行文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| 在 Java 中生成唯一 ID（`Identifier`） | `java-im-identifier-usage` |
| 在 Java 中进行排他控制（`NewLock`） | `java-im-lock-usage` |
| 在 Java 中进行工作流集成处理 | `java-im-workflow-usage` |
