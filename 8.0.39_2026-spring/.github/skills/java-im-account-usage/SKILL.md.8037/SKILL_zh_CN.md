---
name: java-im-account-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的账户信息管理 API（`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`）的技能集。提供登录设置（区域设置・时区・日历・主题・周起始日・日期时间格式）、账户锁定与登录失败次数、账户属性（`getAttribute`/`setAttribute`）、密码校验（`AccountPasswordAdapter`）、为用户分配角色（`addAccountRoleInfo` 等）的实现模式。当提及想在 Java 中获取/更新账户信息、想在 Java 中使用 AccountInfoManager、想在 JavaEE 开发模型中处理登录设置或账户锁定、想用 Java 编写为用户分配角色的处理时使用。角色**定义本身**（新建、层级、分类）的操作应使用 `java-im-role-usage`。若要在 JSSP（脚本开发模型）中实现同等处理，应改用 SSJS 版的 AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Account Info Manager API（Java 版）使用支持技能

## 目的

用于在 Java 代码中实现账户登录设置、锁定、属性、密码校验与角色分配的技能集，使用 intra-mart Accel Platform 为 **JavaEE 开发模型** 提供的账户信息管理 API（`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`）。

## 账户与角色的边界（最重要）

用户与角色的关联方法（`addAccountRoleInfo`、`deleteAccountRoleInfo`、`getAccountRoleIds` 等）定义在 `AccountInfoManager` 一侧，但**从语义上讲属于"角色"的范畴**。本技能将其作为实现模式纳入，但职责划分如下。

| 职责 | 负责技能 |
|------|-----------|
| 对用户进行角色的**分配・解除・有效期设置**（`addAccountRoleInfo` 等，不改变分配本身以外的字段） | **本技能** |
| 角色**定义本身**的新建、层级结构、分类操作 | `java-im-role-usage` |

若角色定义本身尚不存在却要实现角色分配，应先向用户确认是否需要通过 `java-im-role-usage` 先创建角色定义。

**本技能仅处理 Java 源文件（`.java`）。** 若在 JSSP（`.js`）中实现，应改用 SSJS 版的 AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下目前不存在规定异常处理方针的 Java 专用规约（截至2026年）。`AccountInfoManager` / `AccountPasswordAdapter` 的异常均为受检异常（详见后述），业务异常的包装方针应遵循 `assets/account-basic-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`AccountInfoManager` 类属于 `jp.co.intra_mart.foundation.admin.account` 包，是一个 **`final class`**，无法被继承扩展。账户信息模型 `AccountInfo` 的构造函数参数必须提供 `userCd`，需通过 `new AccountInfo(userCd)` 生成（不存在默认构造函数）。请注意 `AccountInfo#locale` 字段的类型是 **`java.util.Locale`** 而非 `String`。详细的签名・内部结构・相关类请参考 `reference/account-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 账户信息的注册・更新（含登录设置） | `assets/account-basic-usage.md` | `addAccountInfo()` / `getAccountInfo()` → `updateAccountInfo()` 的调用示例 |
| 密码校验 | `assets/account-basic-usage.md` | 使用 `AccountPasswordAdapter#collate()` 的登录确认处理 |
| 账户锁定・解锁 | `assets/account-basic-usage.md` | `AccountInfo#setLockDate()` 的调用示例 |
| 账户属性的 get/set | `assets/account-basic-usage.md` | `getAttribute()` / `setAttribute()` 的调用示例 |
| 为用户分配角色与获取有效角色列表 | `assets/account-basic-usage.md` | `addAccountRoleInfo()`，以及 `getAccountRoleIds()` 与递归版 `getAccountRoleIdsRecursively()` 的使用区分 |

### 参考资料

- `reference/account-api-reference.md` — `AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter` 的全部方法・签名，以及异常（`AdminException` / `PasswordException`）的处理方式（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似需求时:
- "想在 Java 中获取/更新账户信息"
- "想在 Java 中使用 AccountInfoManager"
- "想在 JavaEE 开发模型中处理登录设置（区域设置・时区・日历）"
- "想用 Java 实现账户锁定・登录失败次数处理"
- "想用 Java 编写为用户分配角色的处理"
- "想用 Java 编写登录时校验密码的处理"

若未明确说明"在 Java 中"、"在 JavaEE 开发模型中"等，应向用户确认项目现有实现使用的是哪种开发模型。若是在 JSSP（专业代码）画面或函数容器内实现，应改用 SSJS 版的 AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）。

此外，若需求涉及角色**定义本身**（新建、层级、分类），应引导用户使用 `java-im-role-usage` 而非本技能。

## 实现步骤

1. 听取用户需求（涉及账户的哪个方面：登录设置／锁定／属性／密码校验／角色分配，或多项组合）
2. 若需求是对角色**定义本身**进行操作，应引导至 `java-im-role-usage`（不在本技能范围内）
3. 参考 `assets/account-basic-usage.md` 实现（方法签名务必参考 `reference/account-api-reference.md`，不要凭记忆或推测编写）
4. 处理密码时，务必以"密码保存方式为哈希化时 password 字段为 null"为前提进行设计（禁止明文比较，应使用 `AccountPasswordAdapter#collate()`）
5. 更新账户信息时，不要每次都新建 `new AccountInfo(userCd)`，务必先通过 `getAccountInfo()` 获取现有值后再修改所需字段
6. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **密码采用哈希化保存时，`getAccountInfo()`/`getAccountInfos()`/`searchAccountInfos()` 返回的 `password` 为 `null`。** 密码校验必须使用 `AccountPasswordAdapter#collate()`（不要直接比较 `AccountInfo.password`）
- **当 `AccountInfo.password` 为 `null` 时，`updateAccountInfo()` 仅更新密码以外的字段。** 若想在保留密码的同时更新其他字段，应保持已获取的 `AccountInfo` 的 `password` 不变并原样传入；反之，若误将空字符串等非 null 值设置进去，会导致密码被意外覆盖
- **`AccountRoleInfo` 的有效期判定为"开始日 &lt;= 判定日 &lt; 结束日"。** 将结束日设置为 `null` 会重置为系统最大日期（注意这并不等同于"无限期"，系统最大日期只是被当作事实上的无限期处理）
- **仅查看角色"分配"直接匹配的 `getUserCdsByAccountRoleId()`，与考虑层级・有效期的 `getUserCdsByRoleId()`，行为不同。** 若想连同父角色下的子角色持有者一起检索，应使用后者。同样，`getAccountRoleIds()`（仅直接分配）与 `getAccountRoleIdsRecursively()`（含子角色）也需要根据场景区分使用
- **`isUpdate(Date)` 已标记为 `@Deprecated`**（自 8.0.4 起始终返回 `true`）。不要用它判断是否发生了更新
- **当 `canDecrypt()` 为 `false`（不可逆＝哈希化）时，`AccountPasswordAdapter#decrypt()` 返回 `null`。** 若实现前提是可以解密，应事先确认 `canDecrypt()`
- `AccountInfoManager` 的全部方法均抛出受检异常 `AdminException`，`AccountPasswordAdapter` 的全部方法均抛出受检异常 `PasswordException`。**二者是不同的异常类体系**，若在同一方法中同时使用这两个 API，需要分别 `catch`，或通过共同的父类统一捕获

## 生成后的确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. 密码校验处理是否使用了 `AccountPasswordAdapter#collate()`，而非直接比较 `AccountInfo.password`
2. 调用 `updateAccountInfo()` 的地方是否基于事先通过 `getAccountInfo()` 获取的值，而非每次都新建 `new AccountInfo(userCd)` 从而牵连未设置的字段
3. 在希望将密码排除在更新对象之外的地方，是否误将空字符串等非 null 值设置到了 `password`
4. 角色分配的检索是直接匹配（`getAccountRoleIds()` / `getUserCdsByAccountRoleId()`）还是考虑层级（`getAccountRoleIdsRecursively()` / `getUserCdsByRoleId()`），是否与需求一致
5. 是否吞没了 `AdminException` / `PasswordException`
6. 是否混入了角色定义本身的操作（若混入，应切分到 `java-im-role-usage` 的范围）
7. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
8. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有针对 Java 的代码评审・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| SSJS（JSSP）中的账户信息操作 | 应改用 SSJS 版的 AccountInfoManager API（`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`）（不在本技能范围内） |
| **Java（JavaEE 开发模型）中的账户设置、锁定、属性、密码校验与角色分配** | **本技能** |
| 角色**定义本身**（新建、层级、分类）的操作 | `java-im-role-usage` |
| Java 中的文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java 中的唯一 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java 中的互斥控制（`NewLock`） | `java-im-lock-usage` |
| Java 中的工作流联动处理 | `java-im-workflow-usage` |
