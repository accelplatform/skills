# 生成后的必要验证步骤

代码生成完成后，在向用户报告**之前**自动执行以下验证。
每个步骤使用 Grep 工具等，对生成的文件进行机械性确认。

## 1. SQL 文件验证

### 1-1. 绑定占位符的语法

确认生成的 `.sql` 文件中不包含 `/*$`。

- `/*param*/'dummy'` — 绑定占位符（PreparedStatement 方式）。**使用此方式**
- `/*$param*/dummy` — 直接嵌入。**仅允许**在无法使用绑定变量的地方（如 ORDER BY 的列名等）（必须进行白名单验证）

**验证方法：** 对生成的 SQL 文件 grep `/*$`，确认没有意外的直接嵌入。

### 1-2. `/*BEGIN*/` 块的正确使用

`/*BEGIN*/` 仅在 WHERE 子句的**全部条件**被 `/*IF*/~/*END*/` 包围的情况下使用。
有固定条件（如始终评估的 `status = '1'` 等）时，不能使用 `/*BEGIN*/`。

```sql
-- NG: /*BEGIN*/ 内有固定条件（r.status = '1'）→ SQL语法错误
WHERE
  /*BEGIN*/
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/
  /*END*/

-- OK: 将固定条件置于 /*BEGIN*/ 外，直接写 WHERE
WHERE
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/

-- OK: 全部条件被 /*IF*/ 包围时可以使用 /*BEGIN*/
/*BEGIN*/
WHERE
  /*IF userId != null*/
  user_id = /*userId*/'dummy'
  /*END*/
/*END*/
```

**验证方法：** 对生成的 `.sql` 文件 grep `/*BEGIN*/`，确认其正下方没有未被 `/*IF*/` 包围的 SQL 条件行（`validate-jssp-code.js` 的 `JSSP-SQL-001` 自动检测）。

### 1-3. 虚拟值的语法

确认绑定占位符的虚拟值在 SQL 语法上是正确的。

- 字符串列：`/*param*/''`（用单引号括起来）
- 数值列：`/*param*/0`

## 2. tsc 类型检查

对生成的 `.js` 文件执行 TypeScript 编译器类型检查。
使用 `d.ts/` 中定义的 API 类型信息，可以静态检测**对不存在属性的访问和类型不匹配**。
`validate-jssp-code.js` 无法检测的类不匹配（例如：`result.data === 0` → 正确为 `result.countRow`）也可以在这里发现。

```bash
# 按功能单位执行（例：room 功能整体）
npm run check:types:room

# 针对任意路径时
bash {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{功能名}/
```

**修改直到 0 issues。**

被抑制的错误（误报）：`TS2304`（d.ts 中未定义的类）、`TS2451/TS6200`（绑定变量的重复声明）、`type 'unknown'/'any'` 上的属性错误。
其他所有错误都很可能是实际 bug，必须修复。

**特别容易检测到的模式：**

| 错误示例 | 原因 | 修复 |
|---|---|---|
| `data` 与 `number` 之间没有重叠（TS2367） | `executeByTemplate` 返回值的 `data` 是数组，无法与 `=== 0` 比较 | 改为 `countRow === 0` |
| 属性 `xxx` 在类型 `YYY` 上不存在（TS2339） | 基于推测调用了 d.ts 中不存在的方法/属性 | 确认 d.ts 后改为正确名称 |

## 3. 函数容器验证（DB访问）

### 2-1. DbParameter 包装

确认**所有 DB 访问方法**的参数都用 `DbParameter.xxx()` 包装。

| 方法 | 参数格式 | 示例 |
|---|---|---|
| `db.select(sql, params)` / `db.execute(sql, params)` | `DbParameter[]`（**数组**） | `[DbParameter.string(userCd), DbParameter.string(fiscalYear)]` |
| `db.executeByTemplate(path, params)` / `db.fetchByTemplate(path, params)` | `{ key: DbParameter }`（**对象**） | `{ userId: DbParameter.string(userId) }` |

**验证方法：** 在生成的 `.js` 文件中搜索 `db.select` / `db.execute` / `executeByTemplate` / `fetchByTemplate` 的调用处，确认参数的所有值都以 `DbParameter.string()`、`DbParameter.number()` 等开头。
直接传递原始字符串或数值会导致 `ClassCastException`。

### 2-2. DbParameter 的类型选择

确认 DDL 的列类型与 `DbParameter` 的类型方法一致。

| DDL 列类型 | DbParameter 方法 |
|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` |
| `INTEGER` / `BIGINT` | `DbParameter.number()` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` |
| `DATE` | `DbParameter.date()` |
| `TIMESTAMP` | `DbParameter.timestamp()` |

**特别注意：**
- 即使值只有数字，如果 DDL 是 `VARCHAR`，也要使用 `DbParameter.string()`（例如：年度 `VARCHAR(4)`）
- `DbParameter.number()` 的参数**必须是 Number 类型**。由于 `userParam`（从画面表单传来的值）全部是字符串类型，必须先用 `Number()` 转换后再传入（例如：`DbParameter.number(Number(userParam.quantity))`）。不转换会导致 `IllegalArgumentException`

## 3. 函数容器验证（API调用）

### 3-1. 与 d.ts 的对照

对于生成的 `.js` 文件中使用的全局类和 API，在 d.ts 中确认以下内容。

- **static vs instance**：是否混淆了 `new Xxx().method()` 和 `Xxx.method()`？
- **方法名**：是否是 d.ts 中存在的方法名（没有基于推测编写）？
- **参数的类型和数量**：是否与 d.ts 的参数定义一致？

**验证方法：** 在生成的 `.js` 文件中 grep `new `，确认每个类的实例化是否与 d.ts 中的定义一致。
特别要注意 `DateTimeFormatter`、`Format` 等工具类，因为它们有很多静态方法。

**特别需要确认的类（实际中容易出错的 API）：**

| 类 | NG 模式 | 正确用法 |
|---|---|---|
| `Identifier` | `new Identifier().getString()` | `Identifier.get()`（静态方法） |

### 3-2. Rhino 的 Date 字符串解析限制

在 Rhino 中，`new Date('YYYY-MM-DD HH:mm:ss')` 或 `new Date('YYYY-MM-DDTHH:mm:ss')` 的解析不稳定，可能变成 `Invalid Date`。
`getMinutes()` 等会返回 `NaN`，导致此后所有比较运算都出现错误。

**验证方法：** 在生成的 `.js` 文件中 grep `new Date(`，如果参数是变量（字符串类型的 request 参数或 DB 值），则用以下 `parseLocalDateTime` 辅助函数替换。

```javascript
// NG: 在 Rhino 中可能变成 Invalid Date
let startDate = new Date(startAt);                   // 'YYYY-MM-DD HH:mm:ss' 格式
let startDate = new Date(startAt.replace(' ', 'T')); // 'YYYY-MM-DDTHH:mm:ss' 格式也是NG

// OK: 多参数构造函数始终作为本地日期时间可靠地工作
function parseLocalDateTime(str) {
  let parts = str.split(/[-: ]/);
  return new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
    parseInt(parts[3], 10),
    parseInt(parts[4], 10),
    parseInt(parts[5], 10)
  );
}
let startDate = parseLocalDateTime(startAt);
```

在所有处理 `"YYYY-MM-DD HH:mm:ss"` 格式日期时间字符串的 `.js` 文件中定义 `parseLocalDateTime` 辅助函数，并替代 `new Date(变量)` 使用。

### 3-3. DB 时间戳的规范化

将 TIMESTAMP 列的值返回到 JSON 响应或表单字段时，由于 JDBC 驱动的不同，返回类型各异（字符串 `"2026-04-21 10:00:00.0"` / Date 对象 / ISO 字符串等），因此必须用以下 `formatTimestamp` 辅助函数进行规范化。

由于 `String(dateObject)` 返回 `"Tue Apr 21 2026 10:00:00 GMT+0900"` 等，不能直接将 Date 对象转换为字符串。

```javascript
function formatTimestamp(value) {
  if (value instanceof Date) {
    let year    = value.getFullYear();
    let month   = ('0' + (value.getMonth() + 1)).slice(-2);
    let day     = ('0' + value.getDate()).slice(-2);
    let hours   = ('0' + value.getHours()).slice(-2);
    let minutes = ('0' + value.getMinutes()).slice(-2);
    let seconds = ('0' + value.getSeconds()).slice(-2);
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  let str = String(value).replace('T', ' ');
  if (str.length > 19) {
    str = str.substring(0, 19);
  }
  return str;
}

// 使用示例
startAt: formatTimestamp(row.start_at),
endAt:   formatTimestamp(row.end_at),
```

**验证方法：** 在生成的 `.js` 文件中 grep 将 TIMESTAMP 列（`_at`、`_date`、`start`、`end` 等）包含在 JSON 中的地方，确认是否用 `formatTimestamp()` 包装。

### 3-4. 共通模块的加载使用 `load()`（`include()` 是误用）

从其他 `.js` 文件使用在其他文件（`common/` 目录下等）中定义的常量和函数时，**必须使用 `load(path)`**。使用 `include(path)` 会让被调用脚本在**独立作用域中执行**，因此在那里声明的变量和函数在调用方完全无法引用，运行时会出现 `ReferenceError: "XXX" is not defined`。

| 函数 | 行为 | 用途 |
|---|---|---|
| `load('xxx/common/yyy')` | 将被调用文件的变量和函数引入调用方作用域 | **共通模块的加载** |
| `include('xxx/view/zzz')` | 在独立作用域执行被调用文件并调用其 `init()` | 页面跳转/画面跳转 |

```javascript
// OK: 使用 load() 加载共通模块
load('room/common/rm_constants');
load('room/common/rm_datetime');

function init(request) {
  // 可以引用 rm_constants.js 的顶层变量
  let errorCode = RM_ERROR_SYSTEM;
}

// NG: 使用 include() 则被调用文件的变量和函数不可见
include('room/common/rm_constants');  // RM_ERROR_SYSTEM 仍然是 undefined
```

共通模块的顶层常量**可以用 `let` 声明**。由于 `load()` 将被调用文件的函数和变量引入调用方作用域，即使是 `let` 也没有问题（使用 `include()` 时作用域分离，无法引用）。需要解决的是**使用 `load()`**，而不是将声明关键字改为 `var`。

```javascript
// rm_constants.js（共通模块）
let RM_ERROR_SYSTEM = 'ROOM-E999';   // OK: 可以从 load() 目标引用

// 调用方（view / api / job）
load('room/common/rm_constants');
// 从此开始可以引用 RM_ERROR_SYSTEM
```

**验证方法：** `validate-jssp-code.js` 的 `JSSP-JS-024` 自动检测 `include('**/common/**')` 模式。

#### `load()` 的参数不要包含 `.js` 扩展名

`load()` 规格内部会在路径末尾**自动添加 `.js`**。因此写 `load('/room/common/foo.js')` 会尝试解析 `/room/common/foo.js.js`，导致 `FileNotFoundException: Function-Container not found: ..._foo_95_js_46_js </room/common/foo.js.js>`。

```javascript
// NG: 明确指定扩展名 → 运行时 FileNotFoundException
load('/room/common/datetime_util.js');

// OK: 不含扩展名
load('/room/common/datetime_util');
```

- 传递给 2WaySQL 的 `executeByTemplate` / `fetchByTemplate` 的路径同样遵循不添加 `.sql` 的规则（参照 `jssp-2way-sql.md`）。记住 intra-mart 外部资源引用路径指定**原则上不包含扩展名**
- 统一使用功能文件夹起点的绝对路径（带前置斜杠）：`load('/room/common/xxx')`

**验证方法：** `validate-jssp-code.js` 的 `JSSP-JS-025` 自动检测 `load('...*.js')` 模式。

### 3-7. Transaction.begin 的返回值检查（必须）

`Transaction.begin(callback)` 规格**不会重新抛出异常，而是返回 `DatabaseResult`**。
回调内 `throw` 的异常会自动回滚，但不会传播到调用方，
因此忽略返回值会导致失败无法检测，出现"HTTP 200 成功但 DB 中没有任何数据"的情况。

#### 必须模式

用变量接收返回值，用 `isSuccess()` 判断失败。在回调内捕获业务异常并重新抛出，在事务后向外抛出。

```javascript
function executeCreate(data) {
  let reservationId = Identifier.get();
  let now = new Date();
  let businessError = null;

  let txResult = Transaction.begin(function() {
    try {
      let db = new TenantDatabase();
      ensureNoOverlap(db, data.roomId, data.startAt, data.endAt, null);
      insertReservation(db, reservationId, data, now);
    } catch (e) {
      businessError = e;   // 将业务异常传递到外部
      throw e;             // 为了回滚重新抛出
    }
  });

  if (businessError) {
    throw businessError;                // 向前端返回业务消息
  }
  if (!txResult.isSuccess()) {
    throw new Error('DB 错误: ' + (txResult.errorMessage || ''));
  }

  return { reservationId: reservationId };
}
```

#### 反模式

```javascript
// NG: 忽略返回值 → 即使失败也不会抛出异常，以成功状态返回 HTTP 200
Transaction.begin(function() {
  let db = new TenantDatabase();
  ensureNoOverlap(...);       // 即使这里 throw...
  insertReservation(...);
});
// 调用方什么都收不到
return { reservationId: reservationId };
```

**验证方法：** `validate-jssp-code.js` 的 `JSSP-JS-026` 自动检测未接收返回值的 `Transaction.begin(...)` 调用。

### 3-8. Rhino 中 JDBC `java.sql.Timestamp` 的处理

在 Rhino 环境中，`db.executeByTemplate` / `db.select` 结果行的 TIMESTAMP 列（`row.xxx_at` 等）以 **`java.sql.Timestamp` 对象**形式返回。这是 **Java 类**，与 JavaScript 的 `Date` 不同。

#### 重要行为

1. **`instanceof Date` 返回 false** — 不能用于 JavaScript Date 判断
2. **`String(timestamp)` 格式为 `"2026-04-20 10:00:00.0"`** — 末尾附有毫秒 `.0`
3. JavaScript 的 `getFullYear()` / `getMonth()` / `getDate()` 方法**不存在**

#### 推荐实现

在处理 TIMESTAMP 值的工具函数中，使用 **`typeof value.getFullYear === 'function'`** 而非 `instanceof Date` 来判断 JavaScript Date，其他情况通过 `String()` → 正则表达式解析。

```javascript
function parseLocalDateTime(value) {
  if (!value) return null;
  // 允许末尾的 ".N"（毫秒）
  let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;
  let matched = pattern.exec(value);
  if (!matched) return null;
  return new Date(
    parseInt(matched[1], 10),
    parseInt(matched[2], 10) - 1,
    parseInt(matched[3], 10),
    parseInt(matched[4], 10),
    parseInt(matched[5], 10),
    matched[6] ? parseInt(matched[6], 10) : 0,
    0
  );
}

function formatTimestamp(date) {
  if (!date) return '';
  let d = null;
  if (typeof date.getFullYear === 'function') {
    d = date;                               // JavaScript Date
  } else {
    d = parseLocalDateTime(String(date));   // java.sql.Timestamp → 通过字符串解析
  }
  if (!d) return '';
  // ... 组装并返回 "YYYY-MM-DD HH:mm:ss"
}
```

**反模式（在 Rhino 中不起作用）：**

```javascript
// NG: instanceof Date 对 Java Timestamp 返回 false
let d = (date instanceof Date) ? date : parseLocalDateTime(String(date));

// NG: parseLocalDateTime 的正则表达式不匹配带 ".0" 的字符串
let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
```

**验证方法：** 这个问题难以静态检测，因此**必须在画面上确认实际数据是否正确显示**（日历和列表画面）。如果 `formatTimestamp()` 向前端返回空字符串，日历上的日期匹配会失败而显示为"空"。

### 3-9. PostgreSQL 的类型严格性（绑定参数类型的严格选择）

PostgreSQL **不进行隐式类型转换**，因此 DDL 列类型与 `DbParameter.xxx()` 的类型必须严格一致。由于 Oracle / SQLServer 会进行隐式转换，开发时难以察觉，直到移到 PostgreSQL 时才会显现。

#### 典型错误

```
ERROR: 运算符不存在：timestamp without time zone >= character varying
  提示：没有与给定名称和参数类型相匹配的运算符。可能需要添加显式类型转换。
```

原因：对 TIMESTAMP 列传入了 `DbParameter.string("2026-04-20 10:00:00")`，不存在 `timestamp >= varchar` 的比较运算符。

#### 必须对应表

| DDL 列类型 | 正确的 DbParameter | 常见错误 |
|---|---|---|
| `TIMESTAMP` | `DbParameter.timestamp(Date)` | `DbParameter.string("YYYY-MM-DD HH:mm:ss")` |
| `DATE` | `DbParameter.date(Date)` | `DbParameter.string("YYYY-MM-DD")` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number(value)` | `DbParameter.string(String(value))` |
| `CHAR(1)` 标志 | `DbParameter.string('0' / '1')` | `DbParameter.boolean(bool)` |

#### 实现模式

以字符串接收的日期时间在服务器端通过 `parseLocalDateTime()` 转换为 Date 后，再传给 `DbParameter.timestamp()`。

```javascript
// OK: TIMESTAMP 列 → DbParameter.timestamp(Date)
let params = {
  rangeFrom: DbParameter.timestamp(parseLocalDateTime(request['rangeFrom'])),
  rangeTo:   DbParameter.timestamp(parseLocalDateTime(request['rangeTo']))
};

// NG: PostgreSQL 中类型不匹配错误
let params = {
  rangeFrom: DbParameter.string(request['rangeFrom']),
  rangeTo:   DbParameter.string(request['rangeTo'])
};
```

**验证方法：** `validate-jssp-code.js` 的 `JSSP-JS-027` 对 `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|startDate|endDate|createdAt|updatedAt|...)` 等包含日期时间系变量名模式进行 warning 检测。由于是基于变量名的启发式检测，也推荐与 DDL 和 SQL 对照手动确认。

### 3-5. 禁止引用 intra-mart 内部表

确认生成的 `.sql` 文件中不包含以 `im` 开头的表名（如 `imm_`、`imw_`、`imr_`、`imjob_` 等）。
intra-mart 产品管理的内部表不是公开 API，版本升级时可能更改架构。
仅在用户明确指示"引用此表"时才允许。

**验证方法：** 对生成的 SQL 文件的 FROM / JOIN 子句，grep 以 `im` 开头的表名。

## 4. imACMSearch 联动验证

如果画面使用 `imACMSearch` 选择并保存用户，请确认以下内容。

### 4-1. 获取 API 中的用户名解析

通过 imACMSearch 选择的 `userId` 保存到 DB 中，但 `userName` 不存在于 DB（如 `reservation_participant` 等）中。
在编辑画面的参与者标签等处显示用户名时，需要在获取 API 侧调用 `IMMUserManager.getUser()` 解析用户名，并在响应中包含 `userName`。

**验证方法：** 对于画面上使用 `imACMSearch` 的输入项（参与者、负责人等），确认对应获取 API（GET系）的返回值中同时包含 `userId` 和 `userName`。如果只返回 `userId`，则添加通过 `IMMUserManager.getUser()` 进行名称解析。

```javascript
// NG: 只有 userId
participantList.push({ userId: participantResult.data[i].user_id });

// OK: 用 IMMUserManager 解析用户名后返回
participantList.push({
  userId:   userId,
  userName: getUserName(userId, localeId, tenantLocale)
});

function getUserName(userId, localeId, tenantLocale) {
  let result = new IMMUserManager().getUser({ userCd: userId }, new Date());
  if (!result.error && result.data && result.data.locales) {
    let locales    = result.data.locales;
    let localeInfo = locales[localeId] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
    if (localeInfo && localeInfo.userName) {
      return localeInfo.userName;
    }
  }
  return userId;
}
```

**`getUser()`（单数）vs `getUsers()`（复数）的注意事项：**
- `IMMUserManager.getUsers()` 是批量获取，但根据服务器环境和版本，`data` 可能返回空数组或 `error: true`（静默失败）
- 在需要可靠解析用户名的情况（如参与者列表等），**循环调用 `getUser()`（单数）**
- 通过 `result.data.locales[locale].userName` 访问（`displayName` 属性只存在于 `UserListNodeInfo`，不存在于 `UserInfo`。`JSSP-JS-019` 自动检测误用）
- 必须对 `locales` 本身进行 null 检查并添加语言环境回退（参照 `jssp-function-container.md`）
- 获取失败时使用 `userId` 作为回退（不吞没异常，输出 `warn` 日志）

### 4-2. 画面侧的初始化代码

从获取 API 的响应初始化参与者列表等时，确认引用了 `userName`。

```javascript
// NG: 回退固定为 userId
participants = list.map(function(p) { return { userId: p.userId, userName: p.userId }; });

// OK: 从 API 接收 userName，没有则使用 userId 作为回退
participants = list.map(function(p) { return { userId: p.userId, userName: p.userName || p.userId }; });
```

### 4-3. 全局回调与 DOMContentLoaded 作用域的桥接

imACMSearch 的回调函数需要在全局作用域中定义，但在 `DOMContentLoaded` 内定义的函数无法从全局直接引用，会导致 `ReferenceError`。
从回调调用 `DOMContentLoaded` 内的函数时，使用将其公开为 `window._functionName` 的桥接模式。

**验证方法：** 在使用 `imACMSearch` 的画面中，确认全局回调函数没有在不经过 `window._` 的情况下直接调用 `DOMContentLoaded` 作用域内的函数。`validate-jssp-code.js` 的 `JSSP-HTML-017` 自动检测。

```javascript
// NG: 全局回调直接调用 DOMContentLoaded 作用域的函数
function callbackUserSearch(result) {
  addSelectedUser(result[0].data.user_cd, result[0].data.user_name); // ReferenceError
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  // ← 缺少 window._addSelectedUser 桥接设置
});

// OK: 通过 window._ 桥接调用
function callbackUserSearch(result) {
  if (typeof window._addSelectedUser === 'function') {
    window._addSelectedUser(result[0].data.user_cd, result[0].data.user_name);
  }
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  window._addSelectedUser = addSelectedUser; // ← 桥接设置
});
```

## 5. 画面（展示页面）验证

### 5-1. imdsConfirm 的内联定义

`imdsConfirm()` 不是平台提供的全局函数。
调用 `imdsConfirm(...)` 的 `.html` 文件必须在页面内包含 `function imdsConfirm(...)` 的内联定义。

**验证方法：** 在生成的 `.html` 文件中 grep `imdsConfirm(`，确认同一文件中存在 `function imdsConfirm(`。
`validate-jssp-code.js` 的 `JSSP-HTML-015` 自动检测。

```javascript
// 各画面中包含以下定义
function imdsConfirm(message, title, onOk, onCancel, options) {
  let modal = document.getElementById('confirmModal');
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmTitle').textContent   = title || '确认';
  modal.style.display = 'flex';
  document.getElementById('confirmOk').onclick = function() {
    modal.style.display = 'none';
    if (typeof onOk === 'function') onOk();
  };
  document.getElementById('confirmCancel').onclick = function() {
    modal.style.display = 'none';
    if (typeof onCancel === 'function') onCancel();
  };
}
```

同时确认 `imdsConfirm` 引用的确认模态框 HTML（拥有 `id="confirmModal"` 的 `<div>`）也存在于同一文件中。

### 5-2. 画面间参数传递需要同时实现发送和接收两侧

在画面A中实现向画面B传递URL参数的链接或按钮时，**同一任务中也要实现画面B侧接收和处理这些参数的代码**。
只实现发送侧而将接收侧推迟到其他任务，会产生按下按钮后什么都不发生（参数被忽略）的缺陷。

**规则：**
- 在画面A中实现附有 `?roomId=xxx&startAt=yyy` 等查询的链接时，也要在画面B的 `DOMContentLoaded`（或 `init()`）中实现读取这些参数并执行表单预填充或打开对话框等处理
- 将接收侧的实现分离到其他任务时，必须在发送侧代码中留下 `// TODO: 在画面B侧实现接收 roomId/startAt/endAt 的处理`

```javascript
// NG: 只在画面A中设置了带参数的URL，画面B侧的接收未实现
// calendar.html?roomId=R001&startAt=2026-05-01+09:00&endAt=2026-05-01+10:00
// → 打开日历画面后对话框不显示（参数未被读取）

// OK: 在同一任务中实现画面A（空室搜索）和画面B（日历）
// 画面A侧：组装URL并跳转
const url = '/room/reservation/calendar?roomId=' + encodeURIComponent(roomId)
  + '&startAt=' + encodeURIComponent(startAt)
  + '&endAt='   + encodeURIComponent(endAt);
location.href = url;

// 画面B侧：用 DOMContentLoaded + setTimeout 接收参数并打开对话框
(function() {
  const params  = new URLSearchParams(location.search);
  const roomId  = params.get('roomId');
  const startAt = params.get('startAt');
  const endAt   = params.get('endAt');
  if (!roomId || !startAt || !endAt) { return; }
  // 等待所有 DOMContentLoaded 处理器（会议室选择初始化等）完成后再打开
  setTimeout(function() {
    const startParts = startAt.split(' ');
    const endParts   = endAt.split(' ');
    openCreateDialog(
      startParts[0],
      startParts[1] ? startParts[1].substring(0, 5) : '09:00',
      { roomId: roomId, endDate: endParts[0], endTime: endParts[1] ? endParts[1].substring(0, 5) : '10:00' }
    );
  }, 0);
})();
```

**验证方法：** 如果生成的代码中有 `location.href = '...'` 或 `<a href="...?xxx=` 等画面跳转代码，确认跳转目标的 `.html` 文件中是否用 `URLSearchParams` / `request['xxx']` 读取了该查询参数。如果不存在读取代码，则是实现遗漏。

## 6. 画面验证（IM-Workflow）

生成了 IM-Workflow 画面时，按以下顺序执行。

1. 运行 `validate-workflow-code.js`，确认 0 error
2. 执行 `jssp-im-workflow-usage/reference/screen-generation-checklist.md` 的所有项目
