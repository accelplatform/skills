---
name: java-im-profile-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的用户头像图片管理 API（`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`，IM-通用主数据 / im_master-main 模块）的技能集。提供头像图片的获取（Stream 形式・URL 形式，单个/多个）、删除、注册（数据 URL 形式／通过 Storage）的实现模式。当提及想在 Java 中获取/注册/删除用户的头像图片、想在 Java 中使用 UserProfileImageManager、想在 JavaEE 开发模型中处理 IM-通用主数据的头像图片时使用。用户基本信息（姓名・所属・分类区分等）本身的操作不在本技能范围内（本 API 专用于头像图片）。IM-LogicDesigner 的逻辑流程要素（`jp.co.intra_mart.foundation.logic.element.profile` 下）不在本技能范围内。截至2026年，尚未提供面向 JSSP（脚本开发模型）的同等 API。
---

# intra-mart User Profile Image Manager API（Java 版）使用支持技能

## 目的

用于在 Java 代码中实现用户头像图片（Avatar 图片）的获取・注册・删除的技能集，使用 intra-mart Accel Platform 为 **JavaEE 开发模型** 提供的用户头像图片管理 API（`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`）。属于 IM-通用主数据（`im_master-main` 模块）所提供功能的一部分。

## 范围界定（重要）

由于"IM-通用主数据（Profile）"一词可能指代多种不同功能，此处明确本技能的范围。

| 功能 | 是否属于本技能范围 |
|------|-----------------|
| 用户**头像图片**（Avatar 图片）的获取・注册・删除（`UserProfileImageManager`） | **属于本技能范围** |
| 用户**基本信息**（姓名・所属・分类区分等）本身的注册・更新・检索 | **不在本技能范围内**。截至2026年，本次调查中未能确认面向 Java 的同等 API（相当于 SSJS 版 `IMMUserManager` 的对应物）。若有相关需求，应向用户确认实现方针 |
| IM-LogicDesigner 的逻辑流程要素（`jp.co.intra_mart.foundation.logic.element.profile` 下的 `GetProfileTask` / `UpdateProfileTask` / `RegisterProfileTask` / `RemoveProfileTask` 等） | **不在本技能范围内**。这些是逻辑流程专用的内部实现类，并非设计为可作为通用 Java API 直接调用的对象 |

若需求内容指向头像图片以外的事项（用户基本信息的 CRUD 等），应告知用户这不在本技能范围内。

**本技能仅处理 Java 源文件（`.java`）。** 由于截至2026年尚未提供对应的 SSJS 版 API，JSSP（`.js`）中的同等实现应向用户确认实现方针。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、`try-with-resources`、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下目前不存在规定异常处理方针的 Java 专用规约（截至2026年）。`UserProfileImageManager` 的异常（`BizApiException`，受检异常）的业务异常包装方针应遵循 `assets/profile-basic-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`UserProfileImageManager` 是属于 `jp.co.intra_mart.foundation.master.user` 包的 **interface**（`@since 8.0.26`），其实现通过 `UserProfileImageManagerFactory.getFactory().getService()` 获取（不通过 `new` 直接实例化）。全部方法均会抛出受检异常 `BizApiException`（`jp.co.intra_mart.foundation.exception`）。

用于注册的模型 `UserImage` 实现了 `IUserBizKey`，图片实体以 `jp.co.intra_mart.foundation.service.client.file.Storage<?>`（`java-im-storage-usage` 技能所处理的 `PublicStorage`/`SessionScopeStorage`/`SystemStorage` 的共通接口）形式传递。获取结果的 `UserImageFileInfo` 基于 `InputStream`。详细的签名・内部结构请参考 `reference/profile-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 头像图片的获取（Stream 形式・单个/多个） | `assets/profile-basic-usage.md` | `getUserProfileImageStream()` / `getUserProfileImagesStream()` 的调用示例 |
| 头像图片的获取（URL 形式・单个/多个） | `assets/profile-basic-usage.md` | `getUserProfileImageURL()` / `getUserProfileImagesURL()` 的调用示例 |
| 头像图片的删除 | `assets/profile-basic-usage.md` | `deleteUserProfileImage()` 的调用示例 |
| 头像图片的注册（数据 URL 形式） | `assets/profile-basic-usage.md` | `setUserProfileImageURL()`（base64 数据 URL）的调用示例 |
| 头像图片的注册（通过 Storage） | `assets/profile-basic-usage.md` | `setUserProfileImage(UserImage)` 与 `java-im-storage-usage`（`SessionScopeStorage` 等）的联动示例 |

### 参考资料

- `reference/profile-api-reference.md` — `UserProfileImageManager` / `UserProfileImageManagerFactory` / `UserImage` / `UserImageFileInfo` / `IUserBizKey` 的全部方法・签名，以及异常（`BizApiException`）的处理方式（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似需求时:
- "想在 Java 中获取用户的头像图片"
- "想在 Java 中使用 UserProfileImageManager"
- "想在 JavaEE 开发模型中实现头像图片的注册・删除处理"
- "想在列表画面中显示 IM-通用主数据的头像图片"

若未明确说明"在 Java 中"、"在 JavaEE 开发模型中"等，应向用户确认项目现有实现使用的是哪种开发模型。

此外，若需求涉及**用户基本信息**（姓名・所属等）的 CRUD，或 **IM-LogicDesigner 的逻辑流程**，应告知用户这不在本技能范围内（前者是尚未配备对应技能，后者是有意排除在外）。

## 实现步骤

1. 听取用户需求（获取/注册/删除中的哪一种、单个/多个、注册时是数据 URL 形式还是通过 Storage）
2. 若需求涉及头像图片以外的事项（用户基本信息的 CRUD、IM-LogicDesigner 联动），应告知用户这不在本技能范围内
3. 参考 `assets/profile-basic-usage.md` 实现（方法签名务必参考 `reference/profile-api-reference.md`，不要凭记忆或推测编写）
4. 实现时须经由 `UserProfileImageManagerFactory.getFactory().getService()` 获取，不要直接 `new` `UserProfileImageManagerImpl`
5. 使用 `setUserProfileImage(UserImage)` 时，传给 `UserImage#setStorage()` 的 `Storage<?>` 的获取・关闭应遵循 `java-im-storage-usage` 的规约（必须使用 `try-with-resources` 等）
6. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **不要直接 `new` `UserProfileImageManagerImpl`。** 必须经由 `UserProfileImageManagerFactory.getFactory().getService()` 获取（基于 `@ProvideFactory`/`@ProvideService` 的工厂模式）
- **图片不存在时的行为因方法而异。** `getUserProfileImageStream()`/`getUserProfileImageURL()`（单个）在未注册时返回 NoImage，而 `getUserProfileImagesStream()`/`getUserProfileImagesURL()`（多个）不会将未注册的用户包含在结果中。使用多个获取系方法时，应在"请求的部分用户代码可能从结果中缺失"这一前提下进行处理
- **对应的图片扩展名仅限 jpg(jpeg)/png。** 通过 `setUserProfileImageURL()`/`setUserProfileImage()` 传入其他扩展名会导致错误
- **省略 `imageSizeType` 时，将以 `original` 尺寸获取。** 应指定 `im-master-config.xml` 中定义的图片尺寸键名。指定不存在的键时的行为应事先进行验证
- **URL 形式的获取结果会以用户代码与图片种类为键进行缓存。** 若在更新图片后立即复用已缓存的 URL，可能会继续引用旧图片，因此调用更新系方法（`setUserProfileImage*`/`deleteUserProfileImage`）后，应注意重新获取的时机
- **全部方法均会抛出 `BizApiException`（受检异常）。** 不要将其吞没，应包装为业务异常或向调用方传播

## 生成后的确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. 是否经由 `UserProfileImageManagerFactory.getFactory().getService()` 获取实现（是否未直接 `new`）
2. 调用多个获取系方法（`getUserProfileImagesStream()`/`getUserProfileImagesURL()`）时，是否在"结果中可能存在缺失的用户代码"这一前提下进行了处理
3. 使用 `setUserProfileImage(UserImage)` 的地方，`Storage<?>` 的获取来源是否通过 `try-with-resources` 等方式被恰当关闭（是否符合 `java-im-storage-usage` 的规约）
4. 是否吞没了 `BizApiException`
5. 用户基本信息的 CRUD 或 IM-LogicDesigner 联动是否混入了本技能范围
6. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有针对 Java 的代码评审・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **Java（JavaEE 开发模型）中用户头像图片的获取・注册・删除** | **本技能** |
| 用户基本信息（姓名・所属・分类区分等）的 CRUD | 尚未配备对应的 Java 向技能（截至2026年）。应向用户确认实现方针 |
| 为用户分配角色・账户属性・登录设置 | `java-im-account-usage` |
| IM-LogicDesigner 的逻辑流程要素・触发器 | 不在本技能范围内。逻辑流程本身的生成请参考 `jssp-im-logic-generator` |
| Java 中的文件操作（`PublicStorage`/`SessionScopeStorage`/`SystemStorage`） | `java-im-storage-usage` |
| SSJS（JSSP）中的头像图片操作 | 截至2026年尚未确认对应的 SSJS API。应向用户确认实现方针 |
