# Coding Conventions (Java)

> **Application Scope**: 🟢 **Always** — Applies when generating/editing `.java` files.

## Variable Declaration

### Actively use `final` for local variables

Good example:
```java
final String userId = "user001";
final List<String> items = new ArrayList<>();
```

Bad example:
```java
String userId = "user001";   // Add final if not reassigned
```

**Reason**:
- Makes it explicit that the variable is not reassigned, improving readability and maintainability
- Prevents bugs caused by unintended reassignment

### Do not use `var` (local variable type inference)

Good example:
```java
final Map<String, Object> resultMap = new HashMap<>();
```

Bad example:
```java
var resultMap = new HashMap<String, Object>();   // Do not use, as the type becomes hard to read
```

**Reason**:
- In some cases the type is hard to determine from the right-hand side alone, reducing readability
- Increases the effort needed to confirm types during review

## String Literals

### Rule: Strings must always use double quotes (`"`)

Java string literals do not permit anything other than double quotes, so single quotes are reserved for `char` literals only.

Good example:
```java
final String message = "Processing complete";
final char delimiter = ',';
```

Bad example:
```java
final char delimiter = ",";   // Use a char literal (single quote) for char
```

## Operators / Syntax

### Use `equals()` for object equality checks

Good example:
```java
if ("active".equals(status)) {
  // processing
}
if (Objects.equals(userId, targetUserId)) {
  // null-tolerant comparison
}
```

Bad example:
```java
if (status == "active") {    // Becomes a reference comparison and does not work as intended
  // processing
}
```

**Reason**:
- For reference types such as `String`, `==` performs a reference comparison rather than a value equality check
- `Objects.equals()` includes a null check internally, helping avoid `NullPointerException`

### Prefer the enhanced for loop / Stream API

Good example:
```java
for (String userId : userIds) {
  // processing
}

final List<String> activeUserIds = users.stream()
    .filter(user -> "active".equals(user.getStatus()))
    .map(User::getUserId)
    .collect(Collectors.toList());
```

Bad example:
```java
for (int i = 0; i < userIds.size(); i++) {   // Use an enhanced for loop when index manipulation is unnecessary
  String userId = userIds.get(i);
}
```

### Do not use raw types

Good example:
```java
final List<String> items = new ArrayList<>();
```

Bad example:
```java
final List items = new ArrayList();   // Omitting the generic type parameter is prohibited
```

## Referencing Constants

- Do not write magic numbers/magic strings directly in code; define them as `public static final` constants
- Constant classes (Java API) provided by intra-mart Accel Platform may be `import`ed and referenced directly (Java has no cross-language constraint like JSSP's `d.ts`)
- Define constants at the top of the class, or gather them in a dedicated `Constants` class

Good example:
```java
private static final int MAX_RETRY_COUNT = 3;
private static final String STATUS_ACTIVE = "1";
```

## Indentation / Formatting

### Indentation

- Use 2 spaces consistently (if the design document or spec gives instructions, follow those instead)
- Be careful not to nest too deeply (4 levels max is recommended)

### Line Length

- 120 characters or fewer is recommended
- Break lines at an appropriate position when a line gets too long

Good example:
```java
final List<User> result = userDao.findByCondition(
    departmentCd, status, orderBy
);
```

**Note: Avoid line breaks right after `&&` / `||`**

Breaking a line right after `&&` / `||` in the middle of a condition makes it visually harder to follow the grouping of the condition, which can lead to review oversights.

For long conditions, **extract to a local variable or keep it on a single line**.

```java
// NG: line break at trailing && (hard to grasp the whole condition)
if (result.getData() != null && result.getData().size() > 0 &&
    result.getData().get(0).getCount() > 0) {
  // processing
}

// OK: extract to a local variable
final boolean hasValidResult = result.getData() != null
    && result.getData().size() > 0
    && result.getData().get(0).getCount() > 0;
if (hasValidResult) {
  // processing
}

// OK: keep it on a single line
if (result.getData() != null && result.getData().size() > 0 && result.getData().get(0).getCount() > 0) {
  // processing
}
```

### Brace Style

```java
// Use K&R style
public String processData(final String input) {
  if (input == null) {
    return null;
  }

  for (final String item : items) {
    // processing
  }

  return result;
}
```

## Comments

For class/method JavaDoc, refer to `java-javadoc.md`. This section covers inline comments only.

### Inline Comments

```java
// Note the reason for complex logic
final int threshold = 30;  // Data older than 30 days is subject to deletion

// TODO: #12345 Temporary fix. To be corrected in the next release
```
