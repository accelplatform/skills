---
name: java-im-master-usage
description: A skill set for using intra-mart's IM Common Master API (`UserManager`/`CompanyManager`/the 4 group classes (`Public|Private|Company|Corporation`)/`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`, all under `jp.co.intra_mart.foundation.master.*`, `im_master-main` module) in Java (JavaEE development model). Provides implementation patterns for retrieving, searching, creating, updating, and deleting users, companies, organizations/organization sets, posts, user-organization attachment, public/private/company/corporation groups, corporations, customers, item categories, items, and currencies (including `CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`), plus retrieving the organization/public-group/item-category hierarchy (tree) and user/public-group/organization categories (`UserCtg`/`PublicGroupCtg`/`DepartmentCtg`, etc.). Use this when the user mentions handling basic information for users, companies, organizations, groups, corporations, customers, items, or currencies in Java, using any of the above Manager classes, implementing IM Common Master CRUD in the JavaEE development model, or retrieving the organization/group/item-category hierarchy. For user profile images, use `java-im-profile-usage`; for role definitions/role assignment, use `java-im-role-usage`/`java-im-account-usage`; for authorization, use `java-im-authz-usage`.
---

# intra-mart IM Common Master API (Java) Support Skill

## Purpose

A skill set that supports CRUD and search operations on basic information for users, companies, organizations, posts, and public/private/company/corporation groups in Java code, using the IM Common Master API provided by intra-mart Accel Platform for the **JavaEE development model**.

## Class Structure (Important)

**Companies, organizations, posts, and user-to-organization attachment are all handled by the single class `CompanyManager`.** No separate class equivalent to `DepartmentManager`/`OrganizationManager` exists (a fact confirmed by exhaustively checking every `*Manager` class under `jp.co.intra_mart.foundation.master.*`). In contrast, **a dedicated manager class exists for each group type** (unlike `CompanyManager`, which handles multiple targets in a single class).

| Target | Class in charge | Package | Model class |
|---|---|---|---|
| User information | `UserManager` | `jp.co.intra_mart.foundation.master.user` | `User` (plus categories `UserCtg`/`UserCtgItm`) |
| Company | `CompanyManager` | `jp.co.intra_mart.foundation.master.company` | `Company` (only a company code and sort key. **Has no multilingual name field. Cannot be created via the Java API**) |
| Organization / organization set | `CompanyManager` | same as above | `Department`/`DepartmentSet` (plus organization categories `DepartmentCtg`/`DepartmentCtgItm`) |
| Post | `CompanyManager` | same as above | `CompanyPost` |
| User-to-organization attachment (with a "main" flag) | `CompanyManager` (`setUserAttach`/`removeUserAttach`) | same as above | No dedicated model |
| Public group | `PublicGroupManager` | `jp.co.intra_mart.foundation.master.public_group` | `PublicGroup` (plus group set `PublicGroupSet`, categories `PublicGroupCtg`/`PublicGroupCtgItm`, roles `PublicGroupRole`) |
| Private group | `PrivateGroupManager` | `jp.co.intra_mart.foundation.master.private_group` | `PrivateGroup` |
| Company group | `CompanyGroupManager` | `jp.co.intra_mart.foundation.master.company_group` | `CompanyGroup` (plus group set `CompanyGroupSet`) |
| Corporation group | `CorporationGroupManager` | `jp.co.intra_mart.foundation.master.corporation_group` | `CorporationGroup` (plus group set `CorporationGroupSet`) |
| Corporation | `CorporationManager` | `jp.co.intra_mart.foundation.master.corporation` | `Corporation` (plus attachment relationship with customers). **A separate class from `CorporationGroupManager` (corporation group)** |
| Customer | `CustomerManager` | `jp.co.intra_mart.foundation.master.customer` | `Customer`. CRUD/search method names are generic and do not include the entity name (`get`/`set`/`remove`/`list`/`search`/`count`/`total`) |
| Item category | `ItemCategoryManager` | `jp.co.intra_mart.foundation.master.item_category` | `ItemCategory` (plus set `ItemCategorySet`, hierarchical tree, attachment relationship with items). Method names use the wording `Category` |
| Item | `ItemManager` | `jp.co.intra_mart.foundation.master.item` | `Item`. Generic method names of the same shape as `CustomerManager` |
| Currency | `CurrencyManager` | `jp.co.intra_mart.foundation.master.currency` | `Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate` (only `CurrencyRate` has term management) |

All classes belong to the `im_master-main` module and extend `AbstractManager`. There is no alias class (such as `HoldingGroup`) for what is called a "corporation group" — `CorporationGroupManager`/`CorporationGroup` is the class that covers it.

**`Company`/`DepartmentSet` each have an `updateCompany`/`updateDepartmentSet` method, but these are update-only against an existing record — `CompanyManager` (the Java API) alone cannot create a new one.** The standard implementation issues only a SQL `UPDATE` keyed on the target code, and if the target doesn't exist, throws no exception and simply completes without updating anything. Provisioning a new company or organization set requires going through `importData` or tenant setup import materials. In contrast, `User`/`Department`/`CompanyPost`/user-organization attachment all share a common pattern where a single `set*` method automatically decides between creation and update based on whether a term code (`termCd`) is present, and these can be created via the Java API. **Be aware that whether creation is possible differs by entity.**

**The API size and feature scope differ substantially across the four group classes.**

- **Public group (`PublicGroupManager`) has the largest API of the four classes.** In addition to the group itself and group sets, it has category (categories and category items) and role management features, plus tree operations (`getTree`/`getBranch`/`getChildren`/`getParent`/`getAbsoluteXxx`). The other three classes have no category/role management features
- **Company group and corporation group (`CompanyGroupManager`/`CorporationGroupManager`) form a mid-sized API of the same lineage.** They have CRUD, search, and term operations (`moveTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`/`separateTerm*`) for the group and group set
- **The corporation group model (`CorporationGroup`/`ICorporationGroupBizKey`, etc.) is almost identical in shape to the company group, differing only in that it additionally holds `companyCd` (company code).** `CorporationGroupManager#getCorporationGroupSetAll()` has two variants: one with no arguments, and one taking `(String companyCd)` (retrieves only the group sets belonging to the specified company)
- **Private group (`PrivateGroupManager`) has the smallest-scale API of the four classes.** It has no category, role, or tree features; its focus is CRUD and search on the group itself, plus linking with users (`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` methods)

**The five classes for corporations, customers, item categories, items, and currencies also each have their own independent API scale.**

- **Item category (`ItemCategoryManager`) has the largest API of the five classes.** In addition to the category itself and category sets, it has hierarchical (tree) operations of the same shape as `Department`/`CorporationGroup`, plus cross-search operations with items (`ItemCategoryManager.java` alone exceeds 4,800 lines)
- **Corporation (`CorporationManager`), customer (`CustomerManager`), and item (`ItemManager`) have a simple CRUD structure with no category or tree features.** Only corporation additionally has an attachment relationship with customers (`setCorporationAttach`, etc.)
- **For customer and item, the CRUD/search method names are generic and do not include the entity name (`get`/`set`/`remove`/`list`/`search`/`count`/`total`), and the first argument of `search`/`list`/`count`/`total` is `companyCd` (company scope).** Note this differs from the naming convention of `UserManager`/`CompanyManager`, etc.
- **Currency (`CurrencyManager`) handles four entity types (`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`) in a single class.** Of these, only `CurrencyRate` has term management (`ITerm`); the other three simply have a `set*` that returns `void` as a simple upsert

Categories (`UserCtg`/`UserCtgItm`, `PublicGroupCtg`/`PublicGroupCtgItm`, `DepartmentCtg`/`DepartmentCtgItm`) are each features included in `UserManager`/`PublicGroupManager`/`CompanyManager` respectively; no independent manager class exists for them. The business key for `UserCtg`/`PublicGroupCtg` is the category code only, but **only `DepartmentCtg`/`DepartmentCtgItm` includes `companyCd` (organization categories are scoped per company)**.

Always consult the dedicated reference under `reference/` for each class for the detailed attribute signatures and the full method list (do not rely on memory or guesswork — combined, over 14 classes expose a very large API, so never implement from assumption).

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method Javadoc |

There is no dedicated Java convention under `.agents/requirements` for IM Common Master implementation. Follow the patterns in `assets/user-master-basic-usage.md` for exception handling and how to register multilingual information, and `assets/group-master-basic-usage.md` for group-related exception handling and how to build search conditions.

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

Both `UserManager` and `CompanyManager` belong to the `im_master-main` module and extend `AbstractManager`. The default constructors `UserManager()`/`CompanyManager()` use the "currently logged-in user" for the updater user code and default locale. Nearly all public methods on both classes declare the checked exception `jp.co.intra_mart.foundation.exception.BizApiException`.

The four group classes (`PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager`) also belong to the `im_master-main` module and extend `AbstractManager`. Each has four common constructors (`()` / `(String updateUserCd)` / `(String updateUserCd, Locale defaultLocale)` / `(String updateUserCd, Locale defaultLocale, String loginGroupId)`; the fourth is `@Deprecated`), and when an argument is omitted, the value of the "currently logged-in user" is used. Nearly all methods consistently declare `BizApiException`. **For the group classes, single-retrieval methods (`get*`) return `null` rather than throwing an exception when the target does not exist.** `count*`/`search*`/`list*` take `AppCmnSearchCondition`, a reference date (`Date`), and `Locale` as conditions. All group classes have `importData`/`exportData`/`getImportCategories`/`getExportCategories`.

The five classes for corporations, customers, item categories, items, and currencies (`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`) also follow the same pattern of four constructors, `BizApiException` declarations, `null` returns from `get*`, and `importData`/`exportData`.

Always consult the corresponding reference under `reference/` for details (do not rely on memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| Retrieving a user | `assets/user-master-basic-usage.md` Pattern 1 | A `getUser` call example |
| Searching users (keyword, paging) | `assets/user-master-basic-usage.md` Pattern 2 | `listUser` using `AppCmnSearchCondition`/`ImmUserColumn` |
| Creating/updating a user | `assets/user-master-basic-usage.md` Pattern 3 | `setUser` (automatic decision based on `termCd`; `startDate`/`endDate` are required on creation), the procedure for registering multilingual information |
| Retrieving/updating a company | `assets/user-master-basic-usage.md` Pattern 4 | `getCompany`/`updateCompany` (update-only; note creation is not possible) |
| Creating/updating an organization, retrieving the hierarchy | `assets/user-master-basic-usage.md` Pattern 5 | `setDepartment`, `getTree` (the `DepartmentSet` must already exist) |
| User-to-organization attachment (main flag) | `assets/user-master-basic-usage.md` Pattern 6 | `setUserAttach`/`removeUserAttach` (the `term` argument cannot be `null`) |
| Creating/updating a post | `assets/user-master-basic-usage.md` Pattern 7 | `setCompanyPost` (`startDate`/`endDate` are required on creation) |
| Retrieving/searching public groups | `assets/group-master-basic-usage.md` Pattern 1 | Call examples for `getPublicGroup`/`searchPublicGroup` |
| Retrieving the public group hierarchy (tree) | `assets/group-master-basic-usage.md` Pattern 2 | `getTree`/`getBranch` |
| Creating a private group and linking it to a user | `assets/group-master-basic-usage.md` Pattern 3 | `setPrivateGroup`/`setUserAttach`/`removeUserAttach` |
| Retrieving/searching company groups | `assets/group-master-basic-usage.md` Pattern 4 | `getCompanyGroup`/`searchCompanyGroup` |
| Retrieving/searching corporation groups (scoped to a company code) | `assets/group-master-basic-usage.md` Pattern 5 | `getCorporationGroup`/`getCorporationGroupSetAll(companyCd)` |
| Retrieving/creating a corporation, linking it with customers | `assets/business-master-basic-usage.md` Patterns 1-2 | `getCorporation`/`setCorporation`/`setCorporationAttach` |
| Searching customers (scoped to a company code, paging) | `assets/business-master-basic-usage.md` Pattern 3 | `CustomerManager#search` (first argument `companyCd`) |
| Retrieving the item category hierarchy, searching the attachment relationship with items | `assets/business-master-basic-usage.md` Pattern 4 | `getTree`/`getItemWithCategory` |
| Creating an item | `assets/business-master-basic-usage.md` Pattern 5 | `ItemManager#set` (automatic decision based on `termCd`) |
| Registering/retrieving a currency rate | `assets/business-master-basic-usage.md` Pattern 6 | `setCurrencyRate` (has term management)/`getCurrencyRate` |

### Reference

- `reference/user-manager-api-reference.md` — All methods and signatures for `UserManager`/`User`/`IUserBizKey`/`UserCtg`/`UserCtgItm`
- `reference/company-manager-api-reference.md` — All methods and signatures for `CompanyManager`/`Company`/`Department`/`CompanyPost`/`DepartmentCtg`/`DepartmentCtgItm`
- `reference/public-group-manager-api-reference.md` — All methods and signatures for `PublicGroupManager`/`PublicGroup`/`IPublicGroupBizKey`/`PublicGroupCtg`/`PublicGroupCtgItm`, etc.
- `reference/private-group-manager-api-reference.md` — All methods and signatures for `PrivateGroupManager`/`PrivateGroup`/`IPrivateGroupBizKey`
- `reference/company-group-manager-api-reference.md` — All methods and signatures for `CompanyGroupManager`/`CompanyGroup`/`ICompanyGroupBizKey`, etc.
- `reference/corporation-group-manager-api-reference.md` — All methods and signatures for `CorporationGroupManager`/`CorporationGroup`/`ICorporationGroupBizKey`, etc.
- `reference/corporation-manager-api-reference.md` — All methods and signatures for `CorporationManager`/`Corporation`/`ICorporationBizKey`
- `reference/customer-manager-api-reference.md` — All methods and signatures for `CustomerManager`/`Customer`/`ICustomerBizKey`
- `reference/item-category-manager-api-reference.md` — All methods and signatures for `ItemCategoryManager`/`ItemCategory`/`ItemCategorySet`/`IItemCategoryBizKey`, etc.
- `reference/item-manager-api-reference.md` — All methods and signatures for `ItemManager`/`Item`/`IItemBizKey`
- `reference/currency-manager-api-reference.md` — All methods and signatures for `CurrencyManager`/`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`, etc.

All are based on the actual platform API class definitions. Do not write from memory.

## When to Use

Use this skill when the user makes a request such as:
- "Create Java code that retrieves and registers user information"
- "I want to use `UserManager`/`CompanyManager` in Java"
- "I want to implement CRUD for companies/organizations in the JavaEE development model"
- "I want to retrieve the organization hierarchy (tree)"
- "I want to create logic that attaches a user to an organization"
- "Create Java code that handles public/private/company/corporation groups"
- "I want to use `PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager` in Java"
- "I want to handle the public group hierarchy (tree), categories, or roles"
- "Create Java code that handles corporations/customers/item categories/items/currencies"
- "I want to use `CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager` in Java"
- "I want to retrieve the item category hierarchy (tree)" / "I want to register and retrieve a currency rate"
- "I want to handle user categories/public group categories/organization categories (`UserCtg`/`PublicGroupCtg`/`DepartmentCtg`)"

If it's not explicitly stated whether this is for Java or the JavaEE development model, confirm with the user which development model the existing project uses.

If the request falls into the following categories, explain that it is out of scope for this skill:
- Retrieving/registering/deleting a user profile **image** → `java-im-profile-usage`
- Role definitions themselves (creation, hierarchy, categories) / role assignment to users → `java-im-role-usage`/`java-im-account-usage`
- Authorization resources, policies, permission checks → `java-im-authz-usage`
- Login settings, account lock, and other account controls → `java-im-account-usage`

## Implementation Steps

1. Gather requirements from the user (whether the target is a user/company/organization/post/organization attachment/public/private/company/corporation group, whether it's a single retrieval or a search, whether it's a creation or an update, whether multilingual support, category, role, or hierarchy (tree) operations are needed)
2. Precisely confirm the applicable methods in the corresponding reference under `reference/` (do not write from memory or guesswork)
3. For users/companies/organizations, implement by consulting `assets/user-master-basic-usage.md`; for groups, consult `assets/group-master-basic-usage.md`; for corporations/customers/item categories/items/currencies, consult `assets/business-master-basic-usage.md`
4. When creating, determine whether the target is `Company`/`DepartmentSet` (cannot be created via the Java API — confirm with the user whether to use `importData`/tenant setup import materials) or something else (a `set*` method that auto-decides based on `termCd`; `startDate`/`endDate` are required on creation). Note that `Currency`/`CurrencyConversion`/`CurrencyPrecision` are out of scope here since they have no concept of a term at all (`set*` is a simple `void` upsert)
5. When registering a model that supports multiple languages (`User`/`Department`/`CompanyPost`/`Corporation`/`Customer`/`ItemCategory`/`Item`/`Currency`), follow the procedure `setDefaultLocale` → `createLocaleElement()` → each setter → `putLocaleElement`
6. When using search methods for groups or for corporations/customers/item categories/items/currencies (`list*`/`search*`/`count*`), obtain the column name to pass to `AppCmnSearchCondition` from the `toString()` of the corresponding enum for each entity (e.g. `ImmPublicGroupColumn`, `ImmCustomerColumn`, an implementation of `ImmTableColumn`)
7. When using search methods on `CustomerManager`/`ItemManager` (`search`/`list`/`count`/`total`), check that you have not forgotten to pass the first argument `companyCd` (unlike other classes, these use a generic signature whose method name does not include the entity name)
8. Since group single-retrieval methods (`get*`) return `null` when the target does not exist, perform a null check on the caller side
9. Verify compliance with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## Notes

### Users, companies, and organizations

- **`Company`/`DepartmentSet`'s `updateCompany`/`updateDepartmentSet` are update-only against an existing record; they cannot create a new one.** The standard implementation issues only a SQL `UPDATE` keyed on the target code, and if the target doesn't exist, throws no exception and simply completes without updating anything. If a new company or organization set is needed, confirm with the user whether to use `importData` or tenant setup import materials. The `DepartmentSet` a `Department` references must already exist before the `Department` is registered
- **The `Company` model only holds a company code, sort key, etc., and has no multilingual company-name field.** If a displayable company name is needed, design a separate mechanism (e.g., managing the name on the organization side)
- **When creating via `set*` methods (`setUser`/`setDepartment`/`setCompanyPost`) — i.e. when `termCd` is unset — both `startDate` and `endDate` must be set.** Calling without them throws a `BizApiException`. **They must not be omitted for an update either (`termCd` set).** Leaving them unset (null) is treated as a mismatch against the values stored for the target record, throwing a `BizApiException` ("the start/end dates of the target data and the specified data differ"). On update, explicitly set the same `startDate`/`endDate` that were used at registration
- **The `term` argument to `setUserAttach` cannot be `null`.** Always pass an instance of `jp.co.intra_mart.foundation.master.common.model.Term` with `startDate`/`endDate` set
- **`set*` methods (`setUser`/`setDepartment`/`setCompanyPost`/`setUserAttach`) cannot change the term itself (start/end dates).** Use `moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*` to change the term
- **Multilingual information (name, organization name, etc.) is not saved if you only set key fields and call `set*`.** The `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` procedure is mandatory
- **Calling `setUser` with multiple locales' `putLocaleElement` supplied together — whether registering several locales in one creation call, or adding a locale that doesn't yet exist via an update with `termCd` set — throws a `NullPointerException` either way.** A single `setUser` call can safely register only one locale (see the registration pattern in `assets/user-master-basic-usage.md`)
- **Search methods (`list*`/`search*`/`count*`) require `locale`.** Note the difference in behavior from single-retrieval methods (`getUser`/`getCompany`, etc.), which retrieve information in all languages when `locale` is omitted
- **`list*` and `search*` share identical signatures but differ in how they treat a record whose data is missing for the requested locale.** `list*` still includes that record, with its localized fields (name, etc.) returned as `null`. `search*` excludes that record from the result entirely

### Groups

- **The API size and feature scope are not identical across the four group classes.** Only the public group has category, role, and tree features, while the private group is a minimal configuration centered on user linking. Note that implementation patterns from one class may not carry over directly to another
- **The corporation group model additionally holds a company code (`companyCd`).** Do not mistake it for having the same shape as the company group; check the differences in `reference/corporation-group-manager-api-reference.md`
- **Single-retrieval methods (`get*`) return `null` rather than throwing an exception when the target does not exist.** Always perform a null check on the caller side
- **For the column specification passed to `AppCmnSearchCondition` in search methods (`list*`/`search*`/`count*`), convert it to a string via the `toString()` of the corresponding enum (an implementation of `ImmTableColumn`) before passing it to `addCondition(String, Object[, Operator])`.** It cannot be passed to the `SearchTarget`-argument overload

### Corporations, customers, item categories, items, and currencies

- **`CorporationManager` (corporation) is a separate class in a separate package from `CorporationGroupManager` (corporation group).** Do not confuse the two
- **For `CustomerManager`/`ItemManager`, the CRUD/search method names are generic and do not include the entity name (`get`/`set`/`remove`/`list`/`search`/`count`/`total`), and the first argument of `search`/`list`/`count`/`total` is always `companyCd`.** Do not confuse this with the naming convention of `UserManager`/`CompanyManager`
- **`ItemCategoryManager` uses the wording `Category` (not `ItemCategory`) in its method names.** e.g. `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion`
- **Of the four currency entities, only `CurrencyRate` has term management (`ITerm`).** The `set*` of `Currency`/`CurrencyConversion`/`CurrencyPrecision` are simple upserts that return `void`, and setting `startDate`/`endDate` is unnecessary (indeed, the models have no such fields)
- **Single-retrieval methods (`getCorporation`/`get` for Customer/Item/`getCurrency*`) return `null` rather than throwing an exception when the target does not exist.** Always perform a null check on the caller side

### Common

- Nearly all methods on `UserManager`/`CompanyManager`, the four group classes, and the five classes for corporations, customers, item categories, items, and currencies throw the checked exception `BizApiException`. Always declare `throws` or use `try-catch` at the call site

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether the code is attempting to create a new `Company`/`DepartmentSet` (`updateCompany`/`updateDepartmentSet` are update-only and cannot create via the Java API; if creation is needed, has the use of `importData`/tenant setup import materials been considered?)
2. Whether creation/updating of `User`/`Department`/`CompanyPost` is implemented on the premise of auto-decision based on `termCd`, and whether `startDate`/`endDate` are set on creation
3. Whether the `term` argument to `setUserAttach` is `null` (it should be a `Term` instance with `startDate`/`endDate` set)
4. Whether the `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` procedure is followed when registering a multilingual-capable model
5. Whether `locale` is specified on search methods
6. Whether the correct group manager class and package are used for the target group type (public/private/company/corporation)
7. Whether the return value of group single-retrieval methods is handled on the premise that it can be `null`
8. Whether the `toString()` of the enum is used for group search column specification (not confused with the `SearchTarget` variant)
9. Whether `BizApiException` is being swallowed anywhere
10. Whether `CorporationManager` (corporation) and `CorporationGroupManager` (corporation group) are being confused
11. Whether `companyCd` is passed to the search methods of `CustomerManager`/`ItemManager`
12. Whether `startDate`/`endDate`, which do not exist, are being set for currency `Currency`/`CurrencyConversion`/`CurrencyPrecision` (only `CurrencyRate` has the concept of a term)
13. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
14. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|-----------------|------------------|
| **CRUD for users, companies, organizations, posts, organization attachment, public/private/company/corporation groups, corporations, customers, item categories, items, and currencies in Java (JavaEE development model)** | **This skill** |
| Retrieving/registering/deleting a user profile image | `java-im-profile-usage` |
| Role definitions themselves (creation, hierarchy, categories) | `java-im-role-usage` |
| Role assignment to users, login settings, account lock | `java-im-account-usage` |
| Authorization resources, policies, permission checks | `java-im-authz-usage` |
