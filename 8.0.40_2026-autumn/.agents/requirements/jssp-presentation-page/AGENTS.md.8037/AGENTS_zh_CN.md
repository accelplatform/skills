# 展示页面规范

> **适用范围**: 🟢 **始终** — 生成展示页面（`.html`）时适用。HTML 结构、验证、id 命名规约等。

## 展示页面的标准实现方针

### 基本结构

```html
<!-- 页头 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
  </title>
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- 展示页面的自定义样式 -->
  <style>
    /* TODO: 在此处添加自定义样式 */
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- 展示页面的脚本（不将 $data 置于全局作用域，而是通过 IIFE 进行作用域隔离） -->
  <script>
  (function($data) {
    // 页面加载后的处理
    document.addEventListener('DOMContentLoaded', () => {
      // 获取安全令牌
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // 画面的初始显示
      function initializeView(result) {
        // TODO: 在此处添加画面初始化处理
      }

      // 初始化验证显示
      function clearValidationError() {
        // TODO: 在此处添加验证显示初始化处理
      }

      // 显示验证错误
      function showValidationError(errors) {
        // TODO: 在此处添加验证错误的画面显示处理
      }

      // 验证（将逻辑汇总于此）
      function getValidationErrors() {
        // TODO: 在此处添加验证执行处理
        return [];
      }

      // 创建请求参数
      function createRequest() {
        // TODO: 在此处添加创建请求参数的处理
        return {
          foo: document.getElementById(':foo:').value,
          bar: document.getElementById(':bar:').value
        };
      }

      // 重置验证错误
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        } else {
          return true;
        }
      }

      // 注册处理及其他业务逻辑
      async function register(request) {
        // TODO: 在此处添加数据注册处理
      }

      // 事件处理
      document.getElementById('register-button').addEventListener('click', () => {
        // TODO: 在此处添加事件处理
      });

      // 入口点
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- 整个页面的容器 -->
<div id="container">
  <div class="imds-container">
    <main>
      <!-- 主要内容 -->
    </main>
  </div>
</div>
```

### 实现方针

- 额外需要的 JavaScript 和 CSS，在 `<imart type="head">` 标签内以内联方式实现
  - 标准 CSS 已通过 intra-mart 的主题进行设置，因此此处只定义设计文档中另行指示的内容
  - 没有明确的外观修改指示时，不得定义 CSS
- 所需的 JavaScript 库，在 `<imart type="head">` 标签内使用 `<script>` 标签添加
  - 但是，尽量不引入库，能用 vanilla JavaScript 实现的情况下使用 vanilla 实现
  - 编写能在 Microsoft Edge、Chrome、Safari 上运行的代码
- 根标签使用 `<div>` 标签，并为 id 属性赋值 `container`
  - 所有需要的标签都在根标签下实现
- `<imart>` 标签的 value 属性不得用双引号括起来
- 页面加载时的初始化处理使用 `DOMContentLoaded` 事件

### 变量声明

展示页面内的 JavaScript 在浏览器中执行，因此不适用 Rhino 的限制。
`jssp-code-style.md` 中的 `const` 限制仅适用于函数容器（`.js`），不得应用于 HTML 内的脚本。

- **不重新赋值的变量**：使用 `const`
- **重新赋值的变量**：使用 `let`
- 不使用 `var`

```javascript
// 良好示例
const token = getSecureToken();        // 不重新赋值 → const
const roomList = result.roomList || []; // 不重新赋值 → const
let participants = [];                  // 之后重新赋值 → let
let activeValidation = false;           // 之后重新赋值 → let

// 不良示例
let token = getSecureToken();           // 不重新赋值却使用 let
var participants = [];                  // 不使用 var
```

### imart 标签的约束

`<imart>` 标签与普通 HTML 标签不同，对属性值的引号有严格规则。

| 属性类型 | 双引号 | 示例 |
|-----------|:---:|-----|
| type、escapeXml、escapeJs 等固定值属性 | 必须 | `type="string"` |
| value 等绑定变量属性 | 禁止 | `value=$data` |

#### 1. 绑定变量以外的属性值，必须用双引号（`"`）括起来

不得使用单引号（`'`）或无引号（绑定变量除外）。

不良示例：
```html
<imart type='string' escapeXml='true' escapeJs='false'>  <!-- 单引号 不可 -->
<imart type=string escapeXml=true escapeJs=false>         <!-- 无引号 不可 -->
```

良好示例：
```html
<imart type="string" escapeXml="true" escapeJs="false">   <!-- 双引号 可以 -->
```

#### 2. 绑定变量（value 属性）不得用双引号括起来

绑定变量直接使用带 `$` 前缀的变量名书写。

不良示例：
```html
<imart type="string" value="$data" escapeXml="false" escapeJs="false" />  <!-- 不可 -->
```

良好示例：
```html
<imart type="string" value=$data escapeXml="false" escapeJs="false" />    <!-- 可以 -->
```

## 绑定变量的使用方法

### 用于简单字符串输出时

```html
<title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
```

- `<imart>` 标签的 value 属性不得用双引号括起来
- `escapeXml` 属性必须始终设置为 `true`
  - 为了防止安全漏洞
- `escapeJs` 属性必须始终设置为 `false`
  - 因为不必要的转义会破坏字符串
- 在 `<script>` 标签内使用 `<imart>` 标签时，须遵循下面的「嵌入 JSON 时」或「作为 JavaScript 字符串字面量使用时」的模式

### 嵌入 JSON 时

不将 `$data` 定义为全局变量，而是作为立即执行函数（IIFE）的参数传递，将其限定在该作用域内（参见后文"绑定变量 `$data` 的作用域化（IIFE）"）。

```javascript
(function($data) {
  // 在此处实现引用 $data 的处理
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
```

- `<imart>` 标签的 value 属性不得用双引号括起来
- `escapeXml` 属性必须始终设置为 `false`
  - 因为不必要的转义会破坏 JSON
- `escapeJs` 属性必须始终设置为 `false`
  - 因为不必要的转义会破坏 JSON

### 作为 JavaScript 字符串字面量使用时

```javascript
let value = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
```

- `escapeXml` 属性必须始终设置为 `false`
  - 在 `<script>` 内 HTML 解析器不处理，因此 XML 转义不必要
- `escapeJs` 属性必须始终设置为 `true`
  - 当值中包含引号、反斜杠等 JS 特殊字符时，需要进行转义

**注意**：设置为 `escapeXml="true" escapeJs="false"` 时，若值中包含 `&` 或 `<`，将被转换为 `&amp;` 等，导致作为 JavaScript 字符串无效

### 处理顺序

展示页面的显示按以下顺序进行。

1. 从服务器端开始处理
2. 执行函数容器的初始处理（init 函数）
3. 将处理结果绑定到绑定变量 `$data`
4. 生成展示页面的 HTML
   - 此时 `<imart>` 标签被解释，动态生成 HTML 源代码
   - 绑定到 `$data` 的 JSON 字符串原样输出到 HTML 中
5. 向客户端发送响应
6. 处理转移到接收响应的客户端（浏览器等）
7. 通过 DOMContentLoaded 执行浏览器端的初始化处理

## 绑定变量 `$data` 的作用域化（IIFE）

### 适用条件

**适用于所有画面。** 无论是单独显示的普通画面，还是作为门户页面 Portlet（部件）多重配置的画面，均使用以下 IIFE 模式。

### 原因

若将 `const $data = <imart>...</imart>;` 直接写成独立的 `<script>` 标签，`$data` 会成为全局变量。只要画面单独显示就不会有问题，但当同一门户页面上并排放置多个相同画面（Portlet）时，后加载的实例的 `$data` 会覆盖先加载实例的 `$data`，导致显示行为不符合预期。将 IIFE 作用域化作为所有画面的标准做法，即可在日后将画面改造为 Portlet 时无需返工，同时也能避免污染全局命名空间。

### 实现模式

```html
<script>
(function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // TODO: 在此处添加画面初始化处理（引用 $data）
  });
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
</script>
```

- 不再将 `const $data = <imart>...</imart>;` 写成独立的 `<script>` 标签（旧模式），而是将 `$data` 作为立即执行函数（IIFE）的参数传递
- 即使作为 IIFE 参数传递，`escapeXml="false" escapeJs="false"` 的值也不变（与"嵌入 JSON 时"在 `<script>` 内原样输出 JSON 的判断标准相同）
- 将 `DOMContentLoaded` 监听器、`initializeView` 等处理全部放入 IIFE 内，`$data` 以外的局部变量、函数也一并限定在该作用域内
- 完整细节请参阅本页开头的"基本结构"。Portlet 特有的附加事项（省略页头、页脚等）请参阅 `.agents/skills/jssp-page-generator/assets/simple-portlet.md`

### 注意：元素 id 的冲突

通过 IIFE 可以避免 `$data` 的冲突，但 `id="xxx-table"` 等元素 id 仍然是每个画面固定不变的。如果门户以将多个实例直接并排放置在同一 DOM 中的方式嵌入（而非用 iframe 隔离），id 重复可能导致 `document.getElementById()` 只返回第一个实例的元素。请根据门户的嵌入方式（是否用 iframe 隔离）酌情考虑将 id 按实例唯一化。

## maxlength 属性的使用方针

- 一律不使用 `maxlength` 属性
- 字符数限制全部以验证错误消息的形式明确告知用户
- 用 `maxlength` 无声截断输入时，用户无法察觉字符数限制，粘贴时字符串可能被截断

## id 属性的命名规约

按元素类别区分 id 属性的命名模式。判断依据为 **"JavaScript 的访问频率"和"全局命名空间污染风险"**：风险越高，越要用冒号 `:` 包围 id（冒号在 JS 标识符中无效，因此可阻止 `window.xxx` 访问）。

| 元素类别 | id 模式 | 示例 | 备注 |
|---------|--------|-----|------|
| **输入元素**（input / select / textarea） | **`:fieldName:`**（必须用冒号） | `id=":userName:"` | 经常通过 `.value` 等访问。冒号防止形成 `window.userName` 等全局变量。 |
| **错误 span**（`-error` 后缀） | **`:fieldName:-error`** | `id=":userName:-error"` | 为与输入元素 id 保持视觉对应，仍保留 `:`。 |
| **常时必填标签 span**（accessibility 用，`-label` 后缀） | **`:fieldName:-label`** | `id=":locationType:-label"` | 作为 `aria-labelledby` 的引用目标。字段为常时必填，因此 `imds-required-label-required` **静态附加**，**无需** JS 动态控制。 |
| **条件必填标签**（`-label` 后缀，动态控制对象） | **`fieldName-label`**（不含冒号） | `id="locationDetail-label"` | **不** 静态附加 `imds-required-label-required`，而是通过 `toggleRequiredMark(id, condition)` 动态切换。 |
| **按钮**（`-button` 后缀） | **`xxx-button`**（不含冒号） | `id="apply-button"` | 含连字符，不会污染全局命名空间，也不通过 `.value` 等访问。 |
| **对话框**（`-dialog` 后缀） | **`xxx-dialog`**（不含冒号） | `id="user-select-dialog"` | 同上。 |
| **表单**（`-form` 后缀） | **`xxx-form`**（不含冒号） | `id="main-form"` | 同上。 |
| **根容器及其他结构元素** | 不含冒号 | `id="container"` | 同上。 |

### 标签 span 的使用区分（常时必填 vs 条件必填）

**常时必填**（accessibility 用 id 附带）示例：

```html
<div class="imds-field-label">
  <span id=":locationType:-label"
        class="imds-required-label-required"
        data-required-label="必须">使用地点</span>
</div>
<div class="imds-field-control">
  <div id=":locationType:"
       class="imds-radio-group is-horizontal"
       role="group"
       aria-labelledby=":locationType:-label">
    ...
  </div>
</div>
```

要点：
- HTML 中**静态附加** `imds-required-label-required` 类
- 由 `aria-labelledby` 引用的 id 采用 **`:fieldName:-label`** 形式
- **无需**在 JS 中调用 `toggleRequiredMark()`

**条件必填**（动态控制对象）示例：

```html
<div class="imds-field-label">
  <label for=":locationDetail:" id="locationDetail-label">使用地点详细</label>
</div>
<div class="imds-field-control">
  <input type="text" id=":locationDetail:" class="imds-textbox" />
</div>
```

```javascript
function toggleLocationDetailRequired() {
  const label = document.getElementById('locationDetail-label');
  if (getSelectedLocationType() === 'external') {
    label.classList.add('imds-required-label-required');
    label.setAttribute('data-required-label', '必须');
  } else {
    label.classList.remove('imds-required-label-required');
    label.removeAttribute('data-required-label');
  }
}
```

要点：
- 初始 HTML 中**不附加** `imds-required-label-required` 类
- id 采用 **`fieldName-label`**（不含冒号）形式
- 在 JS 中根据条件用 `classList.add/remove` 动态控制

### validator 的检测

`jssp-page-generator/scripts/validate-jssp-code.js` 的 `JSSP-HTML-018` 规则基于上述命名规约避免误检测：

- id 为 `:fieldName:-label` 形式 → **视为 accessibility 用，跳过检查**
- id 为 `fieldName-label` 形式 → **作为 `toggleRequiredMark()` 调用检查对象**

## 日期输入（imuiCalendar）

日期输入使用 `<imart type="imuiCalendar">` 而非 `<input type="date">`。
使用方法、属性、注意事项及日期时间输入（日期 + 时间的组合）模式，请参考 `.agents/skills/jssp-imds-theme/reference/imui-html-calendar.md`。

## 输入字段的宽度控制

输入字段应根据内容指定合适的宽度。
未指定时，字段将扩展至父元素的全宽，相对于项目内容显得不自然地宽。

| 字段类型 | 宽度控制方法 | 参考值 |
|--------------|----------|------|
| 日期输入（imuiCalendar） | `style="max-width: 10em;"` | 适合 `yyyy-MM-dd` 格式的宽度 |
| 时间输入（input type="time"） | `style="max-width: 8em;"` | 适合 HH:mm 格式的宽度 |
| 下拉选择框 | 尺寸类（如 `is-small`）或 `max-width` | 能容纳最长选项的宽度（例：`max-width: 15em;`） |
| 短文本输入（代码、编号等） | 尺寸类或 `max-width` | 适合预期输入字符数的宽度 |
| 长文本输入（姓名、说明等） | 无需指定（默认全宽） | - |
| 文本域 | 无需指定（默认全宽） | - |

### 反模式：不定义自定义 `.max-width-NNem` / `.min-width-NNem` 类

不得在 `<style>` 块中定义 `.max-width-12em { max-width: 12em; }` 或 `.min-width-8em { min-width: 8em; }` 之类的自定义类用于尺寸控制。
其 CSS 优先级与 imds 默认样式（如 `.imds-textbox`、`.imds-button`）相同，根据声明顺序可能被覆盖，最终被迫到处使用 `!important` 作为变通方案。

```css
/* NG：通过自定义类控制尺寸 */
.max-width-12em { max-width: 12em; }
.max-width-20em { max-width: 20em; }
.min-width-8em  { min-width: 8em; }
```

```html
<!-- NG：自定义类可能被 imds-textbox / imds-button 覆盖 -->
<input type="text" class="imds-textbox max-width-12em" />
<button type="button" class="imds-button is-primary min-width-8em">申请</button>

<!-- OK：内联 style 的优先级高于任何类规则，无需 !important -->
<input type="text" class="imds-textbox" style="max-width: 12em;" />
<button type="button" class="imds-button is-primary" style="min-width: 8em;">申请</button>
```

即使同一个宽度值在多处重复、令 DRY 原则受冲击，也应优先内联书写。当重复确实造成维护负担时，再考虑更高优先级的方案（如 CSS 变量 `--w-input-date: 12em;`）。

本规则适用于 **所有尺寸相关属性**（`max-width` / `min-width` / `width` / `height` 等），因为它们都可能与 imds 默认样式冲突。

## getValidationErrors 函数的实现模式

客户端验证函数。从 DOM 直接读取值并返回错误数组。
由于 `resetValidationError()` 和 `validateCurrentStep()` 两者都会调用它，因此将逻辑汇总于此。

### 基本结构

```javascript
function getValidationErrors() {
  const errors = [];
  // 执行各字段的验证
  return errors;
}
```

### 验证模式

#### 必填检查

```javascript
const value = document.getElementById(':fieldName:').value;
if (!value || value.length === 0) {
  errors.push({ name: 'fieldName', message: 'fieldName 是必填项。' });
}
```

#### 必填 + 字符串长度检查（复合）

```javascript
const userCode = document.getElementById(':userCode:').value;
if (!userCode || userCode.length === 0) {
  errors.push({ name: 'userCode', message: '用户代码是必填项。' });
} else if (userCode.length > 100) {
  errors.push({ name: 'userCode', message: '用户代码最多 100 个字符。' });
}
```

其他模式（数值、正则表达式、邮箱、日期格式、可选项等）请参考 `.agents/skills/jssp-page-generator/assets/simple-form.md` 中的「验证模式集」。

### 实现方针

- 发现错误时，将其添加到数组并继续检查下一个字段（以便一次显示所有错误）
- 检查顺序：必填 → 位数 → 格式 → 与其他字段的关联
- 使用严格相等运算符（`===`）

## 验证的执行时机

### 基本结构

- 画面初次显示时，即使存在输入错误，也不显示验证错误
- 在「申请」「执行」按钮按下等首次执行验证检查时，若有错误，从该时点起每当各输入元素的输入内容发生变化时，再次执行验证检查

### 实现方针

架构概要（完整实现请参考 `.agents/skills/jssp-page-generator/assets/simple-form.md`）：

```javascript
document.addEventListener('DOMContentLoaded', () => {
  let activeValidation = false; // 初次显示时不显示错误

  function clearValidationError() {
    document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => el.classList.remove('imds-validation-error'));
    document.querySelectorAll('.imds-error-text').forEach((el) => { el.style.display = 'none'; });
  }
  function showValidationError(errors) {
    errors.forEach((error) => {
      const field = document.querySelector(`.imds-field[for=":${error.name}:"]`);
      if (field) field.classList.add('imds-validation-error');
      const msg = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
      if (msg) { msg.textContent = error.message; msg.style.display = ''; }
    });
    activeValidation = true; // 从此开始实时重新验证
  }
  function getValidationErrors() { /* 将验证逻辑汇总在一处 */ return []; }
  function resetValidationError() { clearValidationError(); showValidationError(getValidationErrors()); }
  function validateCurrentStep() {
    clearValidationError();
    const errors = getValidationErrors();
    if (errors.length > 0) { showValidationError(errors); return false; }
    return true;
  }

  // 文本输入："input" / 下拉选择、日期、复选框："change"
  [':textField:'].forEach((id) => { document.getElementById(id).addEventListener('input', () => { if (activeValidation) resetValidationError(); }); });
  [':selectField:'].forEach((id) => { document.getElementById(id).addEventListener('change', () => { if (activeValidation) resetValidationError(); }); });
});
```

### 以编程方式设置值的字段的注意事项

实时重新验证依赖于由用户操作触发的原生 `input`/`change` 事件。
但是，以下组件以编程方式设置值，因此不会触发原生事件，重新验证无法运行。

#### imuiCalendar（altField）

`imuiCalendar` 的 `altField` 选项使用 jQuery 的 `.val()` 设置 DOM 属性（`element.value`）。
由于 `.val()` 不触发原生 `change` 事件，需使用 `Object.defineProperty` 覆盖 `value` 属性的 setter，以派发 `change` 事件。

```javascript
// 对 imuiCalendar 的 altField 目标字段应用
[':dateField1:', ':dateField2:'].forEach((id) => {
  const el = document.getElementById(id);
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () {
      return descriptor.get.call(this);
    },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  el.addEventListener('change', () => {
    if (activeValidation) {
      resetValidationError();
    }
  });
});
```

#### 全局作用域的回调函数（imACMSearch 等）

`imACMSearch`（IM 通用主数据检索）的回调函数需要定义在全局作用域中。
由于作用域的关系，无法直接访问 `DOMContentLoaded` 内的 `activeValidation` 和 `resetValidationError`，因此将重新验证函数以 `window._resetValidationError` 的形式公开，在回调内调用。

```javascript
// 在 DOMContentLoaded 内公开
window._resetValidationError = () => {
  if (activeValidation) {
    resetValidationError();
  }
};

// 全局作用域的回调函数内
function callbackXxxSearch(result) {
  // ... 值设置处理 ...
  if (window._resetValidationError) {
    window._resetValidationError();
  }
}
```

## 通过超链接等进行画面跳转时的 URL 指定

### 实现方针

- 使用超链接或调用同一主机内的 REST API 时，以相对路径指定上下文路径下的路径
  - 例：访问 `http://127.0.0.1/imart/foo/bar` 时，URL 指定为 `foo/bar`
- 该相对路径与路由配置文件中定义的 `file-mapping` 标签的 `path` 属性去除开头 `/` 后的内容一致
  - 例：路由配置文件为 `<file-mapping path="/sample/user/list" page="sample/user/user_list">` 时，打开展示页面 `sample/user/user_list` 的 URL 应指定为 `sample/user/list`

### 上下文路径

- 上下文路径是由主机名、端口号、部署目标根目录名构成的 URL
  - 例：`http://127.0.0.1/imart/`
- 由于 `<imart type="head">` 标签将上下文路径指定在 `<base>` 标签中，推荐在指定 URL 时以相对路径指定上下文路径之后的路径

## API 的调用

### 基本实现

```javascript
async function register(request) {
  // 向服务器端发送
  const response = await fetch('sample/simple_form/api/register', {
    method: 'POST',
    headers: {
      'X-Intramart-Secure-Token': getSecureToken()
    },
    body: new URLSearchParams(request)
  });

  // 响应（API 在 4xx/5xx 时也以 {error: true, errorMessage} 格式的 JSON 返回）
  // 代理错误等情况下返回非 JSON 时，回退为 null
  const result = await response.json().catch(() => null);
  if (!result) {
    imuiShowErrorMessage('发生了系统错误。');
    return false;
  }
  if (result.error) {
    imuiShowErrorMessage(result.errorMessage);
    return false;
  }

  imuiShowSuccessMessage('用户注册成功。');
  return true;
}
```

### 实现方针

- REST API 的调用使用 `fetch`
- 方法基本使用 `POST`
- 在 headers 中以键 `X-Intramart-Secure-Token` 设置安全令牌
  - 是否使用令牌由 API 的实现方决定
  - 客户端无论是否使用，都在请求头中设置
- body 根据 API 预期的 Content-Type 进行更改
  - API 预期 application/x-www-form-urlencoded 时，使用 `URLSearchParams` 指定请求参数
  - API 预期 application/json 时，使用 `JSON.stringify()` 指定请求参数
- 异步处理使用 Promise，并使用 `async`、`await` 提高代码可读性
- 响应格式为 `{error: bool, data | errorMessage}`（参见 `jssp-error-handling.md`「API 响应结构（JSON）」）
  - 通过 `result.error` 进行分支，错误时直接显示 `result.errorMessage`（`[代码] 消息` 格式）
  - HTTP 状态码（200 / 400 / 405 / 500）由 API 端设置。客户端不进行单独判断，仅以 `result.error` 进行判断
- 正常结束时使用 `imuiShowSuccessMessage()` 显示处理完成消息
- 发生错误时使用 `imuiShowErrorMessage()` 显示错误消息

## 事件

### 基本实现

```javascript
// 创建请求参数
function createRequest() {
  return {
    userCode: document.getElementById(':userCode:').value,
    userFirstName: document.getElementById(':userFirstName:').value,
    userLastName: document.getElementById(':userLastName:').value,
    age: document.getElementById(':age:').value
  };
}

document.getElementById('register-button').addEventListener('click', () => {
  // 创建参数信息
  const request = createRequest();

  // 执行验证
  if (!resetValidationError()) return;

  // 确认消息
  imdsConfirm(
    '确定要注册吗？',          // 消息
    '注册',                   // 对话框标题
    async () => {             // 点击 OK 按钮时的处理
      const isSuccess = await register(request);
      if (isSuccess) {
        clearValidationError();
      }
    }
  );
});
```

### 实现方针

- 事件使用 `addEventListener()` 定义
- 创建请求参数信息时，根据指定使用的 JavaScript 库更改获取方式
  - 指定使用 React.js、Vue.js 等 JavaScript 库时，从 state 获取
  - 其他情况使用 vanilla JavaScript 的标准 DOM 解析方法获取
- 对请求参数执行验证检查
  1. 使用 `clearValidationError()` 解除画面上的验证错误
  2. 使用 `getValidationErrors()` 执行验证检查
  3. 验证检查存在错误时，使用 `showValidationError()` 显示验证错误并终止
- 显示确认消息时使用 `imdsConfirm()`
- 必须在 `imdsConfirm()` 的第 5 个参数 `options` 中根据操作内容指定 `mode`
  - `info`（默认）：普通确认（注册、检索等）
  - `warning`：无法撤销的数据更新确认
  - `danger`：数据删除确认（`okButton.text` 中指定「删除」）
- 点击 OK 按钮时，执行第 3 个参数的回调
  1. 调用 API
  2. API 处理成功时，使用 `clearValidationError()` 解除画面上的验证错误

## Enter 键事件的实现

### IME 对应（必须）

在日语 IME 转换过程中按下 Enter 时，`event.key === 'Enter'` 会触发。
在此状态下执行表单提交或检索等处理，会导致转换确定操作误触发处理。
**捕获 Enter 键事件时，必须将 `!event.isComposing` 作为条件加入。**

```javascript
textarea.addEventListener('keydown', (event) => {
  if (
    event.key === 'Enter' &&
    !event.isComposing &&   // 不处于 IME 转换中（未确定状态）← 必须
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    event.preventDefault();
    // 处理
  }
});
```

`event.isComposing` 在 `compositionstart` 到 `compositionend` 之间（IME 中字符未确定的状态）为 `true`。转换确定后的 Enter 时变为 `false`。

### 修饰键的组合

| 使用场景 | 条件 | 备注 |
|-------------|------|------|
| 在 textarea 中捕获单独的 Enter | `key==='Enter' && !isComposing && !ctrlKey && !shiftKey && !altKey && !metaKey` | 仅适用于不需要换行的情况 |
| 用 Ctrl+Enter 提交（保留换行） | `key==='Enter' && !isComposing && ctrlKey && !shiftKey && !altKey && !metaKey` | 推荐用于多行评论等场景 |

## 错误消息显示模式

### 显示错误消息

当处理中断且无法恢复的错误时，使用 `imuiShowErrorMessage`

```javascript
imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
```

### 显示警告消息

当处理中断但可以恢复的错误时，使用 `imuiShowWarningMessage`

```javascript
imuiShowWarningMessage([$data.error.code, $data.error.message].join('\n'));
```
