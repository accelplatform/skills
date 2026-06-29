# 命名规范

> **适用范围**: 🟢 **始终** — 适用于所有文件、函数与变量的命名。

## 命名规范一览

| 对象 | 规范 | 示例 |
|------|------|------|
| 文件名 | 蛇形命名法 | `user_master.js` |
| 函数名 | 驼峰命名法 | `getUserInfo`, `validateInput` |
| 变量名 | 驼峰命名法 | `userId`, `itemList` |
| 常量 | 大写蛇形命名法 | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| 绑定变量 | `$` + 驼峰命名法 | `$data`, `$formData`, `$pageInfo` |

## 函数名

### 命名模式

| 前缀 | 用途 | 示例 |
|------|------|------|
| `get` | 数据获取 | `getUserInfo`, `getItemList` |
| `set` | 数据设置 | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | 返回布尔值 | `isValid`, `hasPermission` |
| `validate` | 验证处理 | `validateInput`, `validateUserData` |
| `create` | 新建 | `createUser`, `createOrder` |
| `update` | 更新处理 | `updateUser`, `updateStatus` |
| `delete` | 删除处理 | `deleteUser`, `deleteItem` |
| `search` | 搜索处理 | `searchUsers`, `searchItems` |
| `convert` | 转换处理 | `convertToJson`, `convertDateFormat` |
| `format` | 格式化处理 | `formatDate`, `formatNumber` |

## 变量名

正确示例：
```javascript
let userId = 'user001'; // 含义明确
let userList = []; // 复数形式表示列表
let isActive = true; // 布尔值使用 is/has 前缀
let maxRetryCount = 3; // 有意义的名称
let startDate = new Date(); // 明确是日期
```

错误示例：
```javascript
let a = 'user001'; // 含义不明
let data = []; // 不清楚是什么数据
let flag = true; // 不清楚是什么标志
let tmp = getUser(); // 滥用临时变量
let list1 = []; // 避免使用序号
```

## 常量

```javascript
// 在文件开头定义
let MAX_RETRY_COUNT = 3;
let DEFAULT_TIMEOUT = 30000;
let STATUS_ACTIVE = 'active';
let STATUS_INACTIVE = 'inactive';
let ERROR_CODE_NOT_FOUND = 'E001';
let ERROR_CODE_INVALID_INPUT = 'E002';
```

## 绑定变量

传递给展示页面的变量需加 `$` 前缀。

### 绑定变量的定义（函数容器）

```javascript
// 绑定变量（用于展示页面联动）
let $title = '画面标题';        // 画面本身的名称
let $subTitle = '副标题';       // 画面的副名称（画面所属类别的名称）
let $data = '{}';

function init(request) {
  let response = {
    result: {
      userCode: '',
      userFirstName: '',
      userLastName: '',
      age: '',
    },
    error: {
      code: '',
      message: '',
    },
  };
  // 如果 JSON 中包含 </script>，脚本将被终止，
  // 因此将响应中的 '/' 全部替换为 '\/'
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

### 绑定变量的使用（展示页面）

```html
<!-- 标题显示 -->
<title>
  <imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> -
  <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
</title>

<script>
  // 仅对绑定变量，不能写 value="$data"，必须不加引号写成 value=$data
  // 对非绑定变量，不能写 type='string'，必须用双引号写成 type="string"
  // 这是 imart 标签的特有规范
  const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

  document.addEventListener('DOMContentLoaded', () => {
    // 各函数定义在 DOMContentLoaded 事件内，以防止从外部直接执行

    function initializeView(result) {
      // TODO：在此添加画面初始化处理
    }

    // 错误检查
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeView($data.result);
    }
  });
</script>
```

### 绑定变量与普通变量的区分

```javascript
// 绑定变量（传递给展示页面）
let $title = '画面标题';        // 画面本身的名称
let $subTitle = '副标题';       // 画面的副名称（画面所属类别的名称）
let $data = '{}';

// 局部变量（在函数内使用）
let tempList = []; // 无前缀
let processedData = {};
```

## 禁止使用缩写

变量名、函数名、参数名**原则上不缩写，使用完整拼写**。
缩写会导致误解并增加代码审查时的认知负担，因此优先考虑清晰度而非字符数量的减少。

### 禁止使用的缩写示例

| NG：缩写形式 | OK：完整拼写 |
|------------|-----------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e`（catch 参数除外） | `error` |
| `req` | `request` |
| `res` | `response` |
| `el` / `elem` | `element` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter`（复数形式为 `parameters`） |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary` 或表示用途的名称 |
| `dlg` | `dialog` |
| `ok` | （若为按钮则用 `okButton` 等，根据上下文补充含义） |

### 允许的例外

以下缩写是允许的。

- **广泛通用的缩写**：`id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `i18n`, `a11y`
- **循环计数器 `i` / `j` / `k`**：短循环中的索引变量
- **`catch (e)`**：作为异常对象参数名的 `e`
- **业务上的正式缩写**：在业务领域标准化的缩写，如 `vat`（增值税）

### 正确示例 / 错误示例

```javascript
// 错误示例：
const okBtn = dialog.querySelector('.ok');
const cancelBtn = dialog.querySelector('.cancel');
const msg = req.getParameter('msg');
const errMsg = e.message;
const userArr = [];

// 正确示例：
const okButton = dialog.querySelector('.ok');
const cancelButton = dialog.querySelector('.cancel');
const message = request.getParameter('message');
const errorMessage = e.message;
const userList = [];
```

## 避免与保留字冲突

避免使用以下名称：
- JavaScript 保留字：`class`, `function`, `return`, `var`, `if`, `else` 等
- intra-mart 保留字：`request`, `response`, `session`, `Contexts` 等
- 全局对象：`Debug`, `Logger`, `Database` 等
