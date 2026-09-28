# 无障碍规范（屏幕阅读器支持）

> **适用范围**: 🟠 **业务需求依赖** — 仅在规格书明确要求时厚涂适用。无要求时保持最小（使用 `imdsConfirm`、`<button>` 的基础 `aria-label`、装饰图标的 `aria-hidden="true"` 等）。除非规格书要求，否则不要添加 `aria-describedby`、动态 `aria-invalid`、`role="group"` + `aria-labelledby` 等厚重的无障碍连线。

使用 intra-mart Accel Platform 脚本开发创建的页面，必须能够通过屏幕阅读器（NVDA / JAWS / VoiceOver / Narrator）进行操作。
目标是达到 WCAG 2.1 AA 级标准。

## 基本原则

1. **使用语义化 HTML** - 避免滥用 `div` / `span`，优先使用 `button`、`a`、`nav`、`main`、`header`、`table`、`label` 等语义化元素
2. **所有功能仅靠键盘即可操作** - 不构建依赖鼠标的 UI
3. **焦点在视觉上清晰可见** - 不用 `none` 隐藏 `outline`
4. **传达动态变化** - DOM 重写和异步处理结果须通过实时区域通知
5. **不单独依靠图片或图标传达信息** - 必须同时附上文字或替代文本

## 页面整体结构

### 地标

intra-mart Accel Platform 的全局页眉、全局菜单和页脚由**平台（主题）输出**。
因此，各展示页面中**不得添加** `<header>` / `<nav>` / `<footer>`（否则会与平台提供的地标重复）。

页面的根结构遵循 `jssp-presentation-page.md` 的规范，只放置 `<main>`。根标签（`<div>`；class 遵循所使用的 UI 主题）在普通画面中不附加 `id`（因其位于 intra-mart 主题输出的 `<div id="imui-container">` 内部）。仅 Portlet 画面例外，附加 `id="app-portlet-{功能ID}-container"`。

```html
<div>
  <main>
    <h1>页面标题</h1>
    <!-- 主要内容 -->
  </main>
</div>
```

- `<main>` 是 HTML5 语义化元素，隐式具有 `role="main"`，因此不要同时添加 `role="main"`
- 每个页面只能有一个 `<main>`
- 当页面中有多个区域需要分节时，使用 `<section aria-labelledby="...">`（不使用 `<nav>` 等）

### 标题层级

- 页面标题使用 `h1`，其下按 `h2` → `h3` 的顺序**不跳级**书写
- 不根据视觉效果选择标题级别（通过 CSS 调整大小）
- 每个页面只能有一个 `h1`

### 语言属性

```html
<html lang="ja">
```

多语言支持时，在服务器端切换 `lang`。

## 表单

### 标签

所有输入元素都必须关联**明确的 `label`**。

按照 JSSP 的惯例，输入元素的 `id` 用冒号包围，如 `:userName:`。

```html
<!-- OK：通过 for / id 关联 -->
<label for=":userName:">用户名</label>
<input type="text" id=":userName:" name="userName">

<!-- NG：仅有占位符 -->
<input type="text" placeholder="用户名">
```

- 即使在视觉上隐藏标签，也要保留在 DOM 中，使用 `class="visually-hidden"` 等方式隐藏（`display:none` 是 NG）
- 仅含图标的按钮必须添加 `aria-label` 或 `title`

### 必填项

```html
<label for=":email:">电子邮件地址 <span aria-hidden="true">*</span></label>
<input type="email" id=":email:" required aria-required="true">
```

`*` 是装饰性的，因此添加 `aria-hidden="true"`；通过 `aria-required` 或 `required` 传达必填的事实。

### 错误显示

在遵循 `jssp-presentation-page.md` 标准模式（`.imds-field` + `.imds-validation-error` 类，通过 `style.display` 显示/隐藏 `.imds-error-text`）的基础上，添加 ARIA 属性。

```html
<div class="imds-field" for=":age:">
  <label for=":age:">年龄</label>
  <input type="number" id=":age:"
         aria-describedby=":age:-error">
  <span class="imds-error-text" for=":age:" id=":age:-error" style="display:none;"></span>
</div>
```

```javascript
// 显示错误时
function showValidationError(errors) {
  errors.forEach((error) => {
    const fieldElement = document.querySelector(`.imds-field[for=":${error.name}:"]`);
    if (fieldElement) {
      fieldElement.classList.add('imds-validation-error');
    }
    const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.style.display = '';
    }
    // 为输入元素添加 aria-invalid
    const inputElement = document.getElementById(`:${error.name}:`);
    if (inputElement) {
      inputElement.setAttribute('aria-invalid', 'true');
    }
  });
}

// 清除错误时
function clearValidationError() {
  document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => {
    el.classList.remove('imds-validation-error');
  });
  document.querySelectorAll('.imds-error-text').forEach((el) => {
    el.style.display = 'none';
  });
  document.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
    el.removeAttribute('aria-invalid');
  });
}
```

- `aria-describedby` 指向消息元素的 `id`（即使用户手动更改 HTML 中的位置，关联也不会断开）
- 对有错误的输入添加 `aria-invalid="true"`，清除时移除
- 保持使用 `style.display = 'none'` 隐藏消息元素的现有模式（`display:none` 的元素即使被 `aria-describedby` 指向也不会被朗读，但显示时会被朗读，因此没有问题）
- 提交时发生错误时，将焦点移至第一个错误项

### 分组

将单选按钮和复选框组用 `fieldset` + `legend` 包裹。

```html
<fieldset>
  <legend>性别</legend>
  <label><input type="radio" name="gender" value="m"> 男性</label>
  <label><input type="radio" name="gender" value="f"> 女性</label>
</fieldset>
```

#### 使用 imds 组件时

`imds-radio-group` / `imds-checkbox-group` 在结构上无法使用 `fieldset` / `legend`。
作为替代，在 `imds-radio-group` / `imds-checkbox-group` 的 `div` 上添加 `role="group"` 和 `aria-labelledby`，引用字段标签的 `id`，从而实现等效的分组。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <span id=":gender:-label">性别</span>
  </div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-horizontal"
         role="group" aria-labelledby=":gender:-label">
      <label class="imds-radio">
        <input type="radio" name="gender" value="m" />
        <span>男性</span>
      </label>
      <label class="imds-radio">
        <input type="radio" name="gender" value="f" />
        <span>女性</span>
      </label>
    </div>
  </div>
</div>
```

- 组标签使用 `<span id="...">` 而不是 `<label for="...">`（因为 `label` 的 `for` 只对单个输入有效）
- `aria-labelledby` 引用的 `id` 与字段标签的 `id` 保持一致

## 按钮与链接

- **可点击元素使用 `button` 或 `a`**。禁止使用 `div onclick`
- 链接（页面跳转）使用 `a`，页面内操作使用 `button`
- 仅含图标的按钮必须添加 `aria-label`

```html
<!-- NG -->
<div class="btn" onclick="save()">保存</div>

<!-- OK -->
<button type="button" onclick="save()">保存</button>

<!-- 仅图标 -->
<button type="button" aria-label="删除">
  <span class="imds-icon imds-icon-trash" aria-hidden="true"></span>
</button>
```

## 表格

数据表格必须始终提供**无障碍名称**。`<th>` 必须始终指定 `scope`。

### 无障碍名称的赋予方式

使用以下任一方法为 `<table>` 提供无障碍名称。

| 方法 | 用途 |
|------|------|
| `aria-labelledby="..."` | 页面上已有标题（如 `<h1>`）时的**首选**。无需重复管理文字 |
| `aria-label="..."` | 页面上没有对应标题时 |
| `<caption>` | 希望在视觉上也显示标题时 |

**注意：**
- imds 主题没有视觉上隐藏 `<caption>` 的实用类（相当于 `sr-only`）。
- 使用 `<caption>` 可能导致显示错乱，因此在 imds 环境中原则上使用 `aria-labelledby` 或 `aria-label`。

### 推荐模式：用 `aria-labelledby` 引用 `<h1>`

```html
<header class="imds-header">
  <div class="imds-header-title">
    <h1 id="page-title">用户列表</h1>
  </div>
</header>

...

<table aria-labelledby="page-title">
  <thead>
    <tr>
      <th scope="col">用户ID</th>
      <th scope="col">姓名</th>
      <th scope="col">所属部门</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">U001</th>
      <td>山田太郎</td>
      <td>营业部</td>
    </tr>
  </tbody>
</table>
```

### 其他规则

- `<th>` 必须添加 `scope="col"` 或 `scope="row"`
- 不将表格用于布局目的（使用 CSS Grid / Flexbox）
- 当一个页面有多个同类表格时，各 `aria-labelledby` 引用的 `id` 必须指向不同的标题

## 图片与图标

| 类型 | 处理方式 |
|------|----------|
| 有含义的图片 | `<img alt="说明文字">` |
| 装饰性图片 | `<img alt="">` |
| 有含义的图标字体 | 添加 `aria-label` |
| 装饰性图标字体 | 添加 `aria-hidden="true"` |
| 内联 SVG（有含义） | 在 `span.imds-icon` 上添加 `aria-label` |
| 内联 SVG（装饰） | `aria-hidden="true"` |

## 对话框与模态框

确认对话框以 **`imdsConfirm()` 为首选**（参见 `jssp-presentation-page.md`）。
imds 提供的标准对话框支持 ARIA 属性、焦点控制和键盘操作。

```javascript
imdsConfirm(
  '确定要删除吗？',
  '删除',
  async () => {
    await deleteItem(id);
  },
  null,
  {
    mode: 'danger',
    okButton: { text: '删除' }
  }
);
```

### 不得不自行实现对话框时

仅当需要创建 `imdsConfirm` 无法实现的复杂输入对话框等情况时，必须满足以下要求。

- 在对话框元素上添加 `role="dialog"` 和 `aria-modal="true"`
- 通过 `aria-labelledby` 与标题元素关联，通过 `aria-describedby` 与说明元素关联
- 对话框打开的瞬间，**将焦点移至对话框内第一个可聚焦元素**
- 关闭时，**将焦点返回至原触发元素**
- 必须能通过 `Escape` 键关闭
- 焦点必须被限制在对话框内（焦点不会移至背后的元素）

```html
<div role="dialog" aria-modal="true"
     aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">删除确认</h2>
  <p id="dialog-description">此操作无法撤销。是否继续？</p>
  <button type="button">取消</button>
  <button type="button">删除</button>
</div>
```

## 动态更新（通知）

异步处理结果和系统消息等**不涉及页面跳转的更新**，需要通知给屏幕阅读器。

### 首选：imui 标准消息函数

遵循 `jssp-presentation-page.md` 的规范，使用以下函数。
这些函数使 intra-mart 主题在内部执行等效于实时区域的处理。

| 用途 | 函数 |
|------|------|
| 成功结束通知 | `imuiShowSuccessMessage(message)` |
| 警告（可恢复错误） | `imuiShowWarningMessage(message)` |
| 错误（不可恢复） | `imuiShowErrorMessage(message)` |

```javascript
// 成功结束
imuiShowSuccessMessage('用户注册成功。');

// 错误（API 响应的 errorMessage 已经组装为 `[代码] 消息` 格式）
imuiShowErrorMessage(result.errorMessage);
```

对于可以用这些 imui 函数表达的通知，不得创建自定义实时区域。

### 自定义实时区域（限定用途）

仅对无法用 imui 函数表达的内联更新（例如：搜索结果数量的页眉显示、步骤向导的进度显示），才自行放置具有 `aria-live` 的元素。

```html
<!-- 搜索结果数量显示 -->
<div id="search-result-count" role="status" aria-live="polite" aria-atomic="true"></div>
```

```javascript
document.getElementById('search-result-count').textContent =
  '找到 ' + result.countRow + ' 条结果';
```

- 实时区域元素必须**从页面初始显示时就存在于 DOM 中**（之后通过 `appendChild` 添加的元素不会被朗读）
- 基本使用 `aria-live="polite"`。`assertive` 仅用于中断用户操作的重大通知
- 不要重复发出与 imui 函数用途重叠的通知

## 键盘操作

- 按 `Tab` 键焦点必须按逻辑顺序移动（不使用正值 `tabindex`）
- 自定义 UI 中的可操作元素添加 `tabindex="0"`
- 不可聚焦区域添加 `tabindex="-1"`
- 不用 CSS 消除焦点环（`:focus` / `:focus-visible`）
- 实现快捷键时，选择不与其他软件按键冲突的组合

## 颜色与对比度

- 不**仅用颜色**传达信息（例如，仅用红色表示必填项是 NG。须同时附上图标或文字）
- 文字颜色与背景的对比度必须为 **4.5:1 以上**（大字体为 3:1 以上）
- 焦点显示与周围的对比度必须为 3:1 以上

## 使用 imds 组件时

`jssp-imds-theme` 技能的各 reference 中有"无障碍支持"章节。
生成组件时，请参阅对应的 reference，确保无遗漏地添加必要属性（`scope`、`for`、`aria-label`、`aria-hidden` 等）。

| 组件 | 参考 reference |
|------|---------------|
| 表格 | `imds-html-table.md` |
| 文本框 | `imds-html-textbox.md` / `imds-html-textbox-control.md` |
| 下拉选择 | `imds-html-select.md` |
| 单选按钮 | `imds-html-radio.md` / `imds-html-radio-group.md` |
| 复选框 | `imds-html-checkbox.md` / `imds-html-checkbox-group.md` |
| 切换开关 | `imds-html-toggle.md` |
| 菜单 | `imds-html-menu.md` |
| 折叠面板 | `imds-html-accordion.md` |
| 确认对话框 | `imds-csjs-confirm.md` |
| 图片与图标 | `imds-html-img.md` / `imds-html-icon-font.md` / `imds-html-inline-svg.md` |

## 检查清单

### 页面结构

- [ ] 根结构是否为 `<div><main>...</main></div>`（普通画面不附加 `id`；仅 Portlet 画面附加 `id="app-portlet-{功能ID}-container"`；class 遵循所使用的 UI 主题）
- [ ] 页面中只有一个 `<main>`，且未同时添加 `role="main"`
- [ ] 标题是否按 `h1` → `h2` → `h3` 的顺序不跳级

### 表单

- [ ] 所有输入元素是否通过 `label` 关联（`for` / `id`）
- [ ] 仅含图标的按钮是否有 `aria-label` 或 `title`
- [ ] 必填项是否指定了 `required` / `aria-required`
- [ ] 错误时是否为输入元素添加 `aria-invalid="true"`，清除时是否移除
- [ ] 错误消息元素（`.imds-error-text`）是否有 `id`，并通过 `aria-describedby` 与输入元素关联
- [ ] 单选按钮和复选框组是否用 `fieldset` + `legend` 包裹（使用 imds 时是否用 `role="group"` + `aria-labelledby` 代替）

### 操作

- [ ] 可点击元素是否用 `button` / `a` 实现（禁止 `div onclick`）
- [ ] 是否仅靠键盘即可操作所有功能
- [ ] 是否未用 CSS 消除焦点环
- [ ] `tabindex` 是否未使用正值

### 表格

- [ ] `<table>` 是否通过 `aria-labelledby`（引用现有标题）/ `aria-label` / `<caption>` 提供了无障碍名称
- [ ] 在 imds 环境中是否使用 `aria-labelledby` 或 `aria-label` 而不是 `<caption>`
- [ ] `th` 是否指定了 `scope` 属性
- [ ] 是否未将表格用于布局目的

### 图片与图标

- [ ] 有含义的图片是否有 `alt` 属性
- [ ] 装饰性图片是否指定了 `alt=""` 或 `aria-hidden="true"`

### 对话框

- [ ] 确认对话框是否使用了 `imdsConfirm()`
- [ ] 自定义对话框是否添加了 `role="dialog"` / `aria-modal="true"` / `aria-labelledby`
- [ ] 自定义对话框的打开/关闭时是否实现了焦点控制（移动、恢复、限制）
- [ ] 自定义对话框是否能通过 `Escape` 键关闭

### 动态更新

- [ ] 系统通知是否使用了 `imuiShowSuccessMessage` / `imuiShowWarningMessage` / `imuiShowErrorMessage`
- [ ] 仅对 imui 无法表达的内联更新（如搜索结果数量）使用 `role="status"` / `aria-live`
- [ ] 自定义实时区域元素是否从初始显示时就存在于 DOM 中

### 颜色

- [ ] 是否未仅用颜色传达信息
- [ ] 对比度是否为 4.5:1 以上

## 相关

- `.agents/requirements/jssp-presentation-page/AGENTS.md` - 展示页面的基本结构
- `.agents/skills/jssp-localize-support/` 相关 - 多语言化（朗读语言）
- `.agents/skills/jssp-imds-theme/reference/` - imds 各组件的无障碍支持
