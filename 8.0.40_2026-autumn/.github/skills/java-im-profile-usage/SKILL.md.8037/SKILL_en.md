---
name: java-im-profile-usage
description: A skillset for using the intra-mart-specific user profile image management API (`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`, IM-Common Master / im_master-main module) in Java (JavaEE development model). Provides implementation patterns for retrieving profile images (Stream form and URL form, single and multiple), deleting them, and registering them (data URL form / via Storage). Use when the user mentions wanting to get/register/delete a user's profile image in Java, wanting to use UserProfileImageManager in Java, or wanting to handle IM-Common Master profile images in the JavaEE development model. Operations on the user's basic information itself (name, affiliation, classification, etc.) are out of scope — this API is dedicated to profile images only. IM-LogicDesigner logic flow elements (under `jp.co.intra_mart.foundation.logic.element.profile`) are also out of scope. As of 2026 no equivalent API is provided for JSSP (script development model).
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart User Profile Image Manager API (Java Version) Support Skill

## Purpose

A skillset for implementing the retrieval, registration, and deletion of a user's profile image (avatar image) in Java code, using the user profile image management API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.master.user.UserProfileImageManager`). Part of the functionality provided by IM-Common Master (the `im_master-main` module).

## Clarifying the Scope (Important)

The term "IM-Common Master (profile)" can refer to several different pieces of functionality, so the scope of this skill is clarified below.

| Functionality | In Scope for This Skill? |
|------|-----------------|
| Retrieving, registering, and deleting a user's **profile image** (avatar image) (`UserProfileImageManager`) | **In scope (this skill)** |
| Registering, updating, and searching the user's **basic information** itself (name, affiliation, classification, etc.) | **Out of scope.** As of 2026, this investigation has not confirmed an equivalent Java API (something corresponding to the SSJS version's `IMMUserManager`). If such a request comes up, confirm the implementation approach with the user |
| IM-LogicDesigner logic flow elements (`GetProfileTask` / `UpdateProfileTask` / `RegisterProfileTask` / `RemoveProfileTask`, etc., under `jp.co.intra_mart.foundation.logic.element.profile`) | **Out of scope.** These are internal implementation classes for the logic flow feature and are not intended to be called directly as a general-purpose Java API |

If a request concerns something other than profile images (CRUD on basic user information, etc.), tell the user that it is out of scope for this skill.

**This skill covers Java source files (`.java`) only.** For equivalent implementation in JSSP (`.js`), no corresponding SSJS API exists as of 2026, so confirm the implementation approach with the user.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, `try-with-resources`, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining exception-handling policy exists under `.github/instructions` (as of 2026). Follow the business-exception-wrapping pattern in `assets/profile-basic-usage.md` for `UserProfileImageManager`'s exceptions (`BizApiException`, a checked exception).

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

`UserProfileImageManager` belongs to the `jp.co.intra_mart.foundation.master.user` package and is an **interface** (`@since 8.0.26`); obtain an implementation via `UserProfileImageManagerFactory.getFactory().getService()` (do not instantiate it directly with `new`). Every method throws the checked exception `BizApiException` (`jp.co.intra_mart.foundation.exception`).

`UserImage`, the model used for registration, implements `IUserBizKey`, and the image body is passed as `jp.co.intra_mart.foundation.service.client.file.Storage<?>` (the common interface for `PublicStorage`/`SessionScopeStorage`/`SystemStorage` handled by the `java-im-storage-usage` skill). The retrieval result model `UserImageFileInfo` is `InputStream`-based. For detailed signatures and internal structure, refer to `reference/profile-api-reference.md` (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Retrieving a profile image (Stream form, single/multiple) | `assets/profile-basic-usage.md` | Call examples for `getUserProfileImageStream()` / `getUserProfileImagesStream()` |
| Retrieving a profile image (URL form, single/multiple) | `assets/profile-basic-usage.md` | Call examples for `getUserProfileImageURL()` / `getUserProfileImagesURL()` |
| Deleting a profile image | `assets/profile-basic-usage.md` | Call example for `deleteUserProfileImage()` |
| Registering a profile image (data URL form) | `assets/profile-basic-usage.md` | Call example for `setUserProfileImageURL()` (base64 data URL) |
| Registering a profile image (via Storage) | `assets/profile-basic-usage.md` | Example combining `setUserProfileImage(UserImage)` with `java-im-storage-usage` (`SessionScopeStorage`, etc.) |

### Reference

- `reference/profile-api-reference.md` — All methods and signatures of `UserProfileImageManager` / `UserProfileImageManagerFactory` / `UserImage` / `UserImageFileInfo` / `IUserBizKey`, and how the exception (`BizApiException`) is handled (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "I want to get a user's profile image in Java"
- "I want to use UserProfileImageManager in Java"
- "I want to build processing in the JavaEE development model that registers/deletes an avatar image"
- "I want to display the IM-Common Master profile image in a list screen"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses.

Also, if the request concerns CRUD on **basic user information** (name, affiliation, etc.) or the **IM-LogicDesigner logic flow**, tell the user it is out of scope for this skill (the former has no corresponding skill in place yet, and the latter is deliberately out of scope).

## Implementation Steps

1. Gather the user's requirements (which of retrieval/registration/deletion, single or multiple, and for registration, data URL form or via Storage)
2. If the request concerns something other than profile images (CRUD on basic user information, IM-LogicDesigner integration), tell the user it is out of scope
3. Implement by referring to `assets/profile-basic-usage.md` (always refer to `reference/profile-api-reference.md` for method signatures — do not write from memory or guesswork)
4. Route the implementation through `UserProfileImageManagerFactory.getFactory().getService()`; never instantiate `UserProfileImageManagerImpl` directly with `new`
5. When using `setUserProfileImage(UserImage)`, obtain and close the `Storage<?>` passed to `UserImage#setStorage()` according to the `java-im-storage-usage` conventions (`try-with-resources` required, etc.)
6. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Never instantiate `UserProfileImageManagerImpl` directly with `new`.** Always obtain it via `UserProfileImageManagerFactory.getFactory().getService()` (a factory pattern using `@ProvideFactory`/`@ProvideService`)
- **Behavior when an image does not exist differs by method.** `getUserProfileImageStream()`/`getUserProfileImageURL()` (single) return NoImage when the image is not registered, but `getUserProfileImagesStream()`/`getUserProfileImagesURL()` (multiple) omit unregistered users from the result. When using the multiple-retrieval methods, handle the case where some of the requested user codes may be missing from the result
- **Only jpg (jpeg) and png image extensions are supported.** Passing another extension to `setUserProfileImageURL()`/`setUserProfileImage()` results in an error
- **Omitting `imageSizeType` retrieves the `original` size.** Specify the key name for an image size defined in `im-master-config.xml`. Verify the behavior in advance if you specify a key that does not exist
- **URL-form retrieval results are cached keyed by user code and image type.** Reusing a cached URL immediately after updating an image may keep referencing the old image, so pay attention to the timing of re-fetching after calling an update method (`setUserProfileImage*`/`deleteUserProfileImage`)
- **All methods throw `BizApiException` (a checked exception).** Do not swallow it — either wrap it into a business exception or propagate it to the caller

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Whether the implementation is obtained via `UserProfileImageManagerFactory.getFactory().getService()` (not instantiated directly with `new`)
2. Whether calls to the multiple-retrieval methods (`getUserProfileImagesStream()`/`getUserProfileImagesURL()`) handle the case where the result may not include every requested user code
3. Wherever `setUserProfileImage(UserImage)` is used, whether the `Storage<?>` source is properly closed via `try-with-resources` or similar (compliant with the `java-im-storage-usage` conventions)
4. Whether `BizApiException` is being swallowed silently
5. Whether CRUD on basic user information or IM-LogicDesigner integration has crept into the scope of this skill
6. Whether the code complies with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| **Retrieving, registering, and deleting user profile images in Java (JavaEE development model)** | **This skill** |
| CRUD on basic user information (name, affiliation, classification, etc.) | No corresponding Java skill in place yet (as of 2026). Confirm the implementation approach with the user |
| Assigning roles to users, account attributes, login settings | `java-im-account-usage` |
| IM-LogicDesigner logic flow elements/triggers | Out of scope for this skill. See `jssp-im-logic-generator` for generating logic flows themselves |
| File operations in Java (`PublicStorage`/`SessionScopeStorage`/`SystemStorage`) | `java-im-storage-usage` |
| Profile image operations in SSJS (JSSP) | No corresponding SSJS API has been confirmed as of 2026. Confirm the implementation approach with the user |
