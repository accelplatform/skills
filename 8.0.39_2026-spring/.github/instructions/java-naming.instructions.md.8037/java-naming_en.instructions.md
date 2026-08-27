---
applyTo: "**/*.java"
description: "命名規則（Java）（パッケージ・クラス・メソッド・変数・定数の命名規則）"
---

# Naming Conventions (Java)

> **Application Scope**: 🟢 **Always** — Applies to all package, class, method, and variable naming.

## Naming Convention Summary

| Target | Convention | Example |
|--------|------------|---------|
| Package names | All lowercase, separated by dots | `jp.co.intra_mart.sample.service` |
| Class names / Interface names | PascalCase | `UserService`, `Repository` |
| Method names | camelCase | `getUserInfo`, `validateInput` |
| Variable names | camelCase | `userId`, `itemList` |
| Constants (`static final`) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| Type parameters | Single uppercase letter | `T`, `E`, `K`, `V` |

## Class Names / Interface Names

### Suffixes by Layer

| Layer | Suffix | Example |
|---|---|---|
| Entity | `Entity` | `UserEntity`, `CategoryEntity` |
| Domain model | None (the domain name as-is) | `User`, `Category` |
| Service | `Service` | `UserService`, `CategoryService` |
| Repository | `Repository` | `UserRepository`, `CategoryRepository` |
| DAO | `DAO` | `UserDAO`, `CategoryDAO` |
| REST API endpoint | `Endpoint` | `UserEndpoint` |
| Batch job | `Job` | `CategoryBatchJob` |
| Exception | `Exception` | `CategoryServiceException`, `RepositoryException` |
| Request/Response | `Request` / `Response` | `UserRequest`, `UserResponse` |

### Interfaces and Implementation Classes

- Do not prefix interface names with `I` (this goes against Java convention)
  - Good example: `interface Repository` / `class RepositoryImpl implements Repository`
  - Bad example: `interface IRepository`
- If there is only a single implementation class, it is fine to give it a concrete name that conveys the implementation instead of forcing an `Impl` suffix (e.g. `StandardCategoryRepository`)

## Method Names

### Naming Patterns

| Prefix | Usage | Example |
|--------|-------|---------|
| `get` | Data retrieval | `getUserInfo`, `getItemList` |
| `set` | Data setting | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | Returns a boolean | `isValid`, `hasPermission` |
| `validate` | Validation processing | `validateInput`, `validateUserData` |
| `create` | New creation | `createUser`, `createOrder` |
| `update` | Update processing | `updateUser`, `updateStatus` |
| `delete` | Delete processing | `deleteUser`, `deleteItem` |
| `find` / `search` | Search processing (`find`: a single record, `search`: multiple records / conditional search) | `findById`, `searchUsers` |
| `convert` / `to` | Conversion processing | `convertToJson`, `toEntity` |
| `format` | Formatting processing | `formatDate`, `formatNumber` |

- `find`-style methods return `null` or `Optional` when the target does not exist (they must not throw an exception). Only use a `get`-style method that throws an exception when the absence of the target is itself an error condition

## Variable Names

Good examples:
```java
final String userId = "user001"; // Meaning is clear
final List<User> userList = new ArrayList<>(); // Plural form expresses a list
final boolean isActive = true; // Booleans use an is/has prefix
final int maxRetryCount = 3; // A meaningful name
final Timestamp startDate = new Timestamp(System.currentTimeMillis()); // Clearly a date
```

Bad examples:
```java
final String a = "user001"; // Meaningless
final List<User> data = new ArrayList<>(); // Unclear what data this is
final boolean flag = true; // Unclear what this flag represents
final User tmp = getUser(); // Overuse of a temporary variable
final List<User> list1 = new ArrayList<>(); // Avoid sequential numbering
```

## Constants

```java
private static final int MAX_RETRY_COUNT = 3;
private static final long DEFAULT_TIMEOUT = 30000L;
private static final String STATUS_ACTIVE = "1";
private static final String STATUS_INACTIVE = "0";
private static final String ERROR_CODE_NOT_FOUND = "E001";
private static final String ERROR_CODE_INVALID_INPUT = "E002";
```

## Package Structure

Split packages by layer.

```
jp.co.intra_mart.sample
├── entity          // Entities (DB mapping)
├── model           // Domain models
├── repository      // Repositories (DB access)
├── dao             // DAOs (table operations and SQL execution via im_mirage)
├── service         // Services (business logic)
├── endpoint        // REST API endpoints
├── job             // Batch jobs
└── exception       // Exception classes
```

## Prohibition of Abbreviations

As a rule, variable names, method names, and parameter names must be **written out in full, without abbreviation**.
Abbreviations increase the risk of misinterpretation and the cognitive load during code review, so prioritize clarity over brevity.

### Examples of Prohibited Abbreviations

| NG: Abbreviation | OK: Full spelling |
|----------|-------------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e` (except for the catch argument) | `error` |
| `req` | `request` |
| `res` / `resp` | `response` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter` (plural: `parameters`) |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary`, or a name indicating its purpose |
| `impl` (other than as a class name suffix) | `implementation` |

### Allowed Exceptions

The following abbreviations are permitted:

- **Widely established abbreviations**: `id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `dao`, `dto`, `i18n`, `a11y`
- **Loop counters `i` / `j` / `k`**: index variables within a short loop
- **`catch (Exception e)`**: `e` as the exception object's parameter name
- **The `Impl` class name suffix**: a conventional suffix indicating an implementation class
- **Official business-domain abbreviations**: e.g. `vat` (value-added tax), where the abbreviation is standardized within the business domain

### Good / Bad Examples

```java
// Bad example:
final User tmpUser = repository.find(userId);
final String msg = request.getParameter("msg");
final String errMsg = e.getMessage();
final List<User> userArr = new ArrayList<>();

// Good example:
final User targetUser = repository.find(userId);
final String message = request.getParameter("message");
final String errorMessage = e.getMessage();
final List<User> userList = new ArrayList<>();
```

## Reserved Words / Avoiding Collisions

Avoid using the following names:
- Java reserved words: `class`, `interface`, `return`, `var`, `if`, `else`, `default`, etc.
- Collisions with existing `java.lang` class names: do not reuse `String`, `Object`, `System`, `Thread`, etc. as class names
- Collisions with class names provided by intra-mart Accel Platform (do not create a class with the same name as an imported API class within the same package)
