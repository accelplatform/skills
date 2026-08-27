---
applyTo: "**/*.java"
description: "命名規則（Java）（パッケージ・クラス・メソッド・変数・定数の命名規則）"
---

# 命名规约（Java）

> **适用范围**: 🟢 **始终** — 适用于所有包、类、方法、变量的命名。

## 命名规约一览

| 对象 | 规约 | 示例 |
|------|------|------|
| 包名 | 全部小写，以点分隔 | `jp.co.intra_mart.sample.service` |
| 类名 / 接口名 | 帕斯卡命名法（PascalCase） | `UserService`, `Repository` |
| 方法名 | 驼峰命名法 | `getUserInfo`, `validateInput` |
| 变量名 | 驼峰命名法 | `userId`, `itemList` |
| 常量（`static final`） | 大写蛇形命名法 | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| 类型参数 | 单个大写字母 | `T`, `E`, `K`, `V` |

## 类名・接口名

### 按层的后缀

| 层 | 后缀 | 示例 |
|---|---|---|
| 实体 | `Entity` | `UserEntity`, `CategoryEntity` |
| 领域模型 | 无（直接使用领域名） | `User`, `Category` |
| 服务 | `Service` | `UserService`, `CategoryService` |
| 仓储 | `Repository` | `UserRepository`, `CategoryRepository` |
| DAO | `DAO` | `UserDAO`, `CategoryDAO` |
| REST API 端点 | `Endpoint` | `UserEndpoint` |
| 批处理作业 | `Job` | `CategoryBatchJob` |
| 异常 | `Exception` | `CategoryServiceException`, `RepositoryException` |
| 请求/响应 | `Request` / `Response` | `UserRequest`, `UserResponse` |

### 接口与实现类

- 接口名不加 `I` 前缀（这不符合 Java 的惯例）
  - 良好示例: `interface Repository` / `class RepositoryImpl implements Repository`
  - 不良示例: `interface IRepository`
- 若实现类只有一个，可不必强行加 `Impl` 后缀，而是使用能体现实现内容的具体名称（例如 `StandardCategoryRepository`）

## 方法名

### 命名模式

| 前缀 | 用途 | 示例 |
|--------------|------|-----|
| `get` | 数据获取 | `getUserInfo`, `getItemList` |
| `set` | 数据设置 | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | 返回布尔值 | `isValid`, `hasPermission` |
| `validate` | 校验处理 | `validateInput`, `validateUserData` |
| `create` | 新建 | `createUser`, `createOrder` |
| `update` | 更新处理 | `updateUser`, `updateStatus` |
| `delete` | 删除处理 | `deleteUser`, `deleteItem` |
| `find` / `search` | 检索处理（`find`：单条记录，`search`：多条记录・条件检索） | `findById`, `searchUsers` |
| `convert` / `to` | 转换处理 | `convertToJson`, `toEntity` |
| `format` | 格式化处理 | `formatDate`, `formatNumber` |

- `find` 系方法在对象不存在时应返回 `null` 或 `Optional`（不应抛出异常）。仅当对象不存在本身即构成错误时，才使用会抛出异常的 `get` 系方法

## 变量名

良好示例:
```java
final String userId = "user001"; // 含义明确
final List<User> userList = new ArrayList<>(); // 用复数形式表示列表
final boolean isActive = true; // 布尔值使用 is/has 前缀
final int maxRetryCount = 3; // 有意义的名称
final Timestamp startDate = new Timestamp(System.currentTimeMillis()); // 明确表示为日期
```

不良示例:
```java
final String a = "user001"; // 含义不明
final List<User> data = new ArrayList<>(); // 不清楚是什么数据
final boolean flag = true; // 不清楚是什么标志
final User tmp = getUser(); // 滥用临时变量
final List<User> list1 = new ArrayList<>(); // 应避免使用连续编号
```

## 常量

```java
private static final int MAX_RETRY_COUNT = 3;
private static final long DEFAULT_TIMEOUT = 30000L;
private static final String STATUS_ACTIVE = "1";
private static final String STATUS_INACTIVE = "0";
private static final String ERROR_CODE_NOT_FOUND = "E001";
private static final String ERROR_CODE_INVALID_INPUT = "E002";
```

## 包结构

按层划分包。

```
jp.co.intra_mart.sample
├── entity          // 实体（DB 映射）
├── model           // 领域模型
├── repository      // 仓储（DB 访问）
├── dao             // DAO（通过 im_mirage 进行表操作和 SQL 执行）
├── service         // 服务（业务逻辑）
├── endpoint        // REST API 端点
├── job             // 批处理作业
└── exception       // 异常类
```

## 禁止使用缩写

变量名・方法名・参数名原则上应 **不使用缩写，完整拼写**。
使用缩写容易导致含义误解，并增加代码评审时的认知负担，因此应优先考虑清晰度而非字符数的简短。

### 禁止使用的缩写示例

| NG: 缩写 | OK: 完整拼写 |
|----------|-------------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e`（catch 参数除外） | `error` |
| `req` | `request` |
| `res` / `resp` | `response` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter`（复数为 `parameters`） |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary`，或体现用途的名称 |
| `impl`（作为类名后缀除外） | `implementation` |

### 允许的例外

以下缩写允许使用。

- **广泛通用的缩写**: `id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `dao`, `dto`, `i18n`, `a11y`
- **循环计数器 `i` / `j` / `k`**: 短循环内的索引变量
- **`catch (Exception e)`**: 作为异常对象参数名的 `e`
- **类名后缀 `Impl`**: 表示实现类的惯用后缀
- **业务领域的正式缩写**: 如 `vat`（增值税）等在业务领域内已标准化的缩写

### 良好示例 / 不良示例

```java
// 不良示例:
final User tmpUser = repository.find(userId);
final String msg = request.getParameter("msg");
final String errMsg = e.getMessage();
final List<User> userArr = new ArrayList<>();

// 良好示例:
final User targetUser = repository.find(userId);
final String message = request.getParameter("message");
final String errorMessage = e.getMessage();
final List<User> userList = new ArrayList<>();
```

## 保留字・避免冲突

应避免使用以下名称:
- Java 保留字: `class`, `interface`, `return`, `var`, `if`, `else`, `default` 等
- 与 `java.lang` 中已有类名的冲突: 不应将 `String`, `Object`, `System`, `Thread` 等作为类名重复使用
- 与 intra-mart Accel Platform 提供的类名冲突（不应在同一个包内创建与已导入的 API 类同名的类）
