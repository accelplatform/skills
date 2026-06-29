# 函数容器规约

> **适用范围**: 🟢 **始终** — 生成函数容器（`.js`）时适用。`init()` 结构、验证、IM 通用主数据 API 等。

## 函数容器的标准实现方针

### 基本结构

```javascript
/**
 * {画面名称}
 *
 * @file {文件名}
 * @description {关于此文件的简要说明}
 */

// ========================================
// 常量定义
// ========================================
// TODO：在此添加要使用的常量

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================
let $title = '画面标题';        // 画面本身的名称
let $subTitle = '副标题';       // 画面的副名称（画面所属类别的名称）
let $data = '{}';
// TODO：如需其他绑定变量，在此添加

// ========================================
// 初始化处理
// ========================================
/**
 * 画面初始化处理
 *
 * @param {Object} request - 请求对象
 */
// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面 URL 时最先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 执行主处理
  let response = main(request);

  // 以 JSON 格式存储到 $data 中
  // 如果 JSON 中包含 </script>，可能导致脚本终止并被植入任意代码等漏洞，
  // 因此将响应中的 '/' 全部替换为 '\/'
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// 主处理
// ========================================
/**
 * 执行主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // 错误代码
      message: ''               // 错误消息
    }
  };

  try {
    // 验证请求参数
    validateRequest(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '请求参数不正确。');
    return response;
  }

  try {
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E002', '发生了意外错误。');
    return response;
  }

  return response;
}

// ========================================
// 验证
// ========================================
/**
 * 验证请求参数。
 * 检查请求参数中不能出错的部分。
 *
 * @param {Object} request - 请求参数
 */
function validateRequest(request) {
  // TODO：在此添加验证检查逻辑
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {};

  // TODO：在此添加业务逻辑主处理
  // 将处理结果存储到 result 中

  return result;
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时将错误消息全屏显示。
 *
 * @param {String} code - 错误代码
 * @param {String} message - 错误消息
 */
function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### 实现方针

- 定义用于标题显示的绑定变量（`$title` 和 `$subTitle`）以及展示画面显示用的绑定变量（`$data`）
  - 除此之外的绑定变量，尽量不定义
- `$data` 需以 JSON 字符串的形式向展示画面传递信息
  - JSON 字符串化使用 `JSON.stringify()`
  - 对输出的 JSON 字符串使用 `.replace(/\//g, '\\/')` 进行转义，使斜杠无害化
    - 为防止 JSON 字符串中包含 `</script>` 时，展示页面中脚本意外终止
- 不使用 `new Packages.***`（直接实例化 Java 类）。这会导致内存泄漏和处理锁，影响性能。请改用 `d.ts/` 中定义的 SSJS 全局类和 API
- **按照 d.ts 中的类型定义调用 API**
  - 若参数类型不包含 `null`（没有 `?` 或 `| null`），则不得传入 `null`。是否可省略，以 `?`（可选参数）的有无为准。即使想表达"无条件"，也要传入对应类型的空对象（例如：`new AppCmnSearchCondition()`）
  - **不得凭猜测调用 d.ts 中未定义的方法名**。必须在 d.ts 或参考文档（`reference/` 目录）中确认方法名和参数类型后再实现。
    - 例：`UserActvMatterPropertyValue` 中不存在 `setMatterProperty()`，正确写法是 `createMatterProperty(Array)` / `updateMatterProperty(Array)`
- 各函数的职责完全分离
  - 例如，validateRequest 函数只检查请求参数的约束条件
- 每个函数目标在 50 行以内
  - 超过 50 行时考虑拆分
- 嵌套最多 4 层

### IM-共通マスタ API（IMMUserManager / IMMCompanyManager 等）的注意事项

- **不得向搜索条件参数（`AppCmnSearchCondition` 类型）传入 `null`**。Java 侧会发生 `IllegalArgumentException`
- 即使要无条件获取全部记录，也必须**传入空的 `new AppCmnSearchCondition()`**
- 获取用户名、所属部门时，应使用 IM-共通マスタ API，而非直接访问数据库（如 `SELECT FROM im_user` 等）
  - 用户名：`IMMUserManager.getUser(bizKey, date, localeId)` → `result.data.locales[locale].userName`
  - 所属部门（优先当前组织）：`Contexts.getUserContext().currentDepartment.departmentName`
    - 登录用户本身时，优先使用当前组织
    - 无法获取当前组织或其他用户时：`IMMCompanyManager.listDepartmentWithUser()` → `result.data[0].displayName`（返回类型为 `DepartmentListNodeInfo[]`）

- **访问 `locales` 对象时，必须加入 null 检查和回退处理**。当 `result.data.locales` 本身为 `undefined`，或语言区域不匹配时会发生错误

```javascript
// OK：传入空的搜索条件对象
let condition = new AppCmnSearchCondition();
let result = manager.listDepartmentWithUser(bizKey, condition, true, new Date(), localeId);

// NG：传入 null → IllegalArgumentException
let result = manager.listDepartmentWithUser(bizKey, null, true, new Date(), localeId);

// 获取租户语言区域
let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;

// OK：对 locales 本身进行 null 检查 + 带回退地访问
if (result.data && result.data.locales) {
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  if (localeInfo) {
    userName = localeInfo.userName || '';
  }
}

// NG：不检查 locales 的 null → locales 为 undefined 时发生异常
let locales = result.data.locales;
let localeInfo = locales[locale];  // locales 为 undefined → TypeError

// NG：无回退直接访问 → 语言区域不匹配时报错
let localeInfo = result.data.locales[locale];
userName = localeInfo.userName;  // localeInfo 为 undefined → TypeError
```

## validateRequest 函数的实现模式

JavaScript 中请求参数验证函数的基本实现模式。

### 基本结构

```javascript
/**
 * 验证请求参数。
 *
 * @param {Object} request - 请求参数
 * @throws {Error} 验证错误时
 */
function validateRequest(request) {
  // 执行各参数的验证
  validateParameter1(request);
  validateParameter2(request);
  // ... 添加必要的验证
}
```

### 验证模式

#### 必填检查

```javascript
let value = request['parameterName'];
if (!value || value.length === 0) {
  throw new Error('parameterName 为必填项。');
}
```

#### 字符串长度检查

```javascript
let value = request['parameterName'];
if (value.length > maxLength) {
  throw new Error(`parameterName 最多为 ${maxLength} 个字符。`);
} else if (value.length < minLength) {
  throw new Error(`parameterName 至少需要 ${minLength} 个字符。`);
}
```

#### 数值检查

```javascript
let value = request['parameterName'];
if (isNaN(value)) {
  throw new Error('parameterName 必须为数值。');
} else if (value < min || value > max) {
  throw new Error(`parameterName 请在 ${min} 到 ${max} 的范围内指定。`);
}
```

#### 正则表达式模式匹配

```javascript
let value = request['parameterName'];
let pattern = /^[a-zA-Z0-9_-]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName 只能使用英文字母、数字、连字符和下划线。');
}
```

#### 邮箱地址格式检查

```javascript
let value = request['parameterName'];
let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName 的格式不正确。');
}
```

#### 日期格式检查

```javascript
let value = request['parameterName'];
let pattern = /^\d{4}-\d{2}-\d{2}$/;
if (!pattern.test(value)) {
  throw new Error('parameterName 请以 YYYY-MM-DD 格式指定。');
}
```

#### 用户代码格式检查

```javascript
let value = request['parameterName'];
let pattern = /^[0-9A-Za-z_@\.\+\!\-]$/;  // 半角英数字及 _-@.+!
if (!pattern.test(value)) {
  throw new Error('parameterName 请以用户代码格式指定。');
}
```

#### 复合模式示例

```javascript
// 1. 必填检查 + 字符串长度检查
let userCode = request['userCode'];
if (!userCode || userCode.length === 0) {
  throw new Error('userCode 为必填项。');
} else if (userCode.length > 100) {
  throw new Error('userCode 最多为 100 个字符。');
}

// 2. 可选项目检查（仅在值存在时验证）
let age = request['age'];
if (age !== undefined && age !== null && age !== '') {
  if (isNaN(age)) {
    throw new Error('age 必须为数值。');
  } else if (age < 0 || age > 150) {
    throw new Error('age 请在 0 到 150 的范围内指定。');
  }
}
```

### 实现方针

- 发现错误后立即抛出异常
- 明确说明哪个参数存在何种问题
- 按以下顺序执行基本检查
  1. 必填检查
  2. 字符数检查
  3. 格式检查
  4. 与其他参数的关联检查
- 使用严格等于运算符（`===`）

## request 对象的处理

### 获取请求参数

```javascript
// 获取 GET 参数、POST 参数
let userId = request['userId'];
let keyword = request['keyword'];

// 设置默认值
let page = request['page'] || '1';
let sortKey = request['sortKey'] || 'user_id';

// 获取数组参数
let selectedIds = request['selectedIds'];
if (selectedIds) {
  let idArray = selectedIds.split(',');
}
```

### 实现方针

- 必须对从 request 获取的参数值进行验证
- 由于从 request 获取的值为字符串，需要数字时使用 `parseInt()` 或 `parseFloat()` 进行转换
- 请求参数必须进行净化处理，作为 SQL 参数或存储文件名使用时，注意防止注入攻击
