# 编码规约（Java）

> **适用范围**: 🟢 **始终** — 生成・编辑 `.java` 文件时适用。

## 变量声明

### 局部变量应积极使用 `final`

良好示例:
```java
final String userId = "user001";
final List<String> items = new ArrayList<>();
```

不良示例:
```java
String userId = "user001";   // 若不再赋值，应加上 final
```

**理由**:
- 明确表示该变量不会被重新赋值，提升可读性与可维护性
- 可防止因意外重新赋值而产生的 bug

### 不使用 `var`（局部变量类型推断）

良好示例:
```java
final Map<String, Object> resultMap = new HashMap<>();
```

不良示例:
```java
var resultMap = new HashMap<String, Object>();   // 类型难以辨识，禁止使用
```

**理由**:
- 仅凭右侧表达式有时难以判断类型，降低可读性
- 增加了评审时确认类型的成本

## 字符串字面量

### 规则: 字符串一律使用双引号（`"`）

Java 的字符串字面量只能使用双引号，因此单引号仅用于 `char` 字面量。

良好示例:
```java
final String message = "处理已完成";
final char delimiter = ',';
```

不良示例:
```java
final char delimiter = ",";   // char 应使用 char 字面量（单引号）
```

## 运算符・语法

### 对象的相等判断使用 `equals()`

良好示例:
```java
if ("active".equals(status)) {
  // 处理
}
if (Objects.equals(userId, targetUserId)) {
  // 允许 null 的比较
}
```

不良示例:
```java
if (status == "active") {    // 将变为引用比较，无法按预期工作
  // 处理
}
```

**理由**:
- 对于 `String` 等引用类型，`==` 会进行引用比较，而非值的一致性判断
- `Objects.equals()` 内置了 null 检查，可避免 `NullPointerException`

### 优先使用增强 for 循环 / Stream API

良好示例:
```java
for (String userId : userIds) {
  // 处理
}

final List<String> activeUserIds = users.stream()
    .filter(user -> "active".equals(user.getStatus()))
    .map(User::getUserId)
    .collect(Collectors.toList());
```

不良示例:
```java
for (int i = 0; i < userIds.size(); i++) {   // 不需要操作索引时应使用增强 for 循环
  String userId = userIds.get(i);
}
```

### 不使用 raw type

良好示例:
```java
final List<String> items = new ArrayList<>();
```

不良示例:
```java
final List items = new ArrayList();   // 禁止省略泛型参数
```

## 常量的引用

- 魔法数字・魔法字符串不得直接写入代码，应定义为 `public static final` 常量
- intra-mart Accel Platform 提供的常量类（Java API）可直接 `import` 引用（Java 不存在类似 JSSP `d.ts` 那样的跨语言限制）
- 常量应统一定义在类的开头，或汇总到专用的 `Constants` 类中

良好示例:
```java
private static final int MAX_RETRY_COUNT = 3;
private static final String STATUS_ACTIVE = "1";
```

## 缩进・格式

### 缩进

- 统一使用 2 个空格（若设计文档或规格书另有指示，以其为准）
- 注意避免嵌套层级过深（推荐最多 4 层）

### 单行长度

- 推荐不超过 120 字符
- 过长时应在适当位置换行

良好示例:
```java
final List<User> result = userDao.findByCondition(
    departmentCd, status, orderBy
);
```

**注意: 避免在 `&&` / `||` 处换行**

在条件表达式中途、`&&` / `||` 之后立即换行，会使条件的整体结构难以在视觉上把握，容易导致评审时的疏漏。

较长的条件表达式应 **提取为局部变量，或整理为一行**。

```java
// NG: 在行尾 && 处换行（难以把握条件全貌）
if (result.getData() != null && result.getData().size() > 0 &&
    result.getData().get(0).getCount() > 0) {
  // 处理
}

// OK: 提取为局部变量
final boolean hasValidResult = result.getData() != null
    && result.getData().size() > 0
    && result.getData().get(0).getCount() > 0;
if (hasValidResult) {
  // 处理
}

// OK: 整理为一行
if (result.getData() != null && result.getData().size() > 0 && result.getData().get(0).getCount() > 0) {
  // 处理
}
```

### 大括号风格

```java
// 使用 K&R 风格
public String processData(final String input) {
  if (input == null) {
    return null;
  }

  for (final String item : items) {
    // 处理
  }

  return result;
}
```

## 注释

关于类・方法的 JavaDoc 写法，请参考 `java-javadoc.md`。本节仅涉及行内注释。

### 行内注释

```java
// 复杂逻辑应记述其原因
final int threshold = 30;  // 超过 30 天的数据为删除对象

// TODO: #12345 临时应对方案，将在下个版本中修正
```
