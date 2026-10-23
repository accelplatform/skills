# 角色搜索对话框实现示例

使用 IM-共通主数据的 `imACMSearch` 调用角色搜索对话框的实现示例。
展示通过单击文本框打开搜索对话框，并将选择结果反映到表单中的模式。
页面骨架遵循 `jssp-imds-theme` 的 `assets/imds-form-page.md`（固定显示头部、仅滚动表单部分的 `pgstyle-layout-*` 布局），由函数容器（`index.js`）与呈现页面（`index.html`）组成，可直接作为画面运行。

## 使用组件一览

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | 调用 IM-共通主数据搜索对话框 |
| Header | `jssp-imds-theme` 的 `imds-html-header.md` | 页面头部（图标・标题） |
| Field | `jssp-imds-theme` 的 `imds-html-field.md` | 角色名称输入字段 |
| TextboxControl | `jssp-imds-theme` 的 `imds-html-textbox-control.md` | 带搜索图标的文本框 |
| IconButton | `jssp-imds-theme` 的 `imds-html-icon-button.md` | 清除按钮（× 图标） |

## 整体结构

```
index.js（函数容器）
├── $title / $subTitle            ... 输出到页面头部和 <title> 的画面名
└── $targetLocale                 ... 搜索对话框的显示区域设置（登录用户的区域设置）

<imart type="head">
├── <title> / <meta>              ... 标题・安全令牌
├── <link> / <style>              ... 加载 theme-conditional-layout.css・定义 pgstyle-layout-*
├── <imart type="imACMSearch" />  ... 加载搜索画面调用标签
└── <script>
    ├── callbackFromImMaster()      ... 接收选择结果的回调函数（全局作用域）
    ├── window.callbackFromImMaster ... 将回调函数注册为全局
    └── DOMContentLoaded
        ├── setSelectedRole()   ... 将选择结果反映到表单（以 window._setSelectedRole 公开）
        ├── addEventListener('click') ... 单击文本框时打开搜索对话框（imACMSearch.open）
        └── addEventListener('click') ... 通过清除按钮清除选择结果

div.imds-container.pgstyle-layout-container
├── header.imds-header            ... 页面头部（图标・标题）
└── main.pgstyle-layout-main
    └── form.imds-form.pgstyle-layout-content
        └── section
            └── imds-field-container
                └── imds-field（角色名称）
                    └── imds-field-control
                        ├── input[type="hidden"]    ... 角色 ID（隐藏字段）
                        ├── imds-textbox-control    ... 角色名称（带搜索图标・只读）
                        └── button.imds-button      ... 清除按钮（× 图标）
```

## 1. head 部分（搜索对话框的设置）

### 1.1 加载 imACMSearch 标签

在 `<imart type="head">` 内放置 `<imart type="imACMSearch" />`，生成用于调用搜索画面的对象。

```html
<imart type="head">
  <!-- IM-共通主数据搜索画面调用标签 -->
  <imart type="imACMSearch" />
</imart>
```

**要点：**
- `<imart type="imACMSearch" />` 必须放置在 `<imart type="head">` 内
- 此操作将在全局生成 `imACMSearch` 对象

### 1.2 启动搜索对话框

通过文本框的单击事件调用 `imACMSearch.open(parameter)`，以弹出方式显示搜索对话框。

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // 角色名称 单击时事件
    document.getElementById(':roleName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.role.list",
          title: "关键词"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.role.list' : ['role_id']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "角色搜索",
        message           : "角色搜索",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
      };

      // 打开搜索画面
      imACMSearch.open(parameter);
    });
  });
</script>
```

**要点：**
- 在 `tabs` 中指定角色搜索的插件 ID `jp.co.intra_mart.master.app.search.tabs.role.list`
- 角色搜索只有关键词搜索标签页（没有树形搜索标签页）
- 用 `prop` 指定传递给回调函数的获取项目（`role_id`）
- `type: 'single'` 为单选模式，`'multiple'` 为多选模式
- `wnd_close: true` 表示选择后自动关闭对话框
- 由于需要引用元素，事件在 `DOMContentLoaded` 内注册（`<imart type="head">` 内的脚本先于正文元素执行）
- `target_locale` 输出在函数容器中绑定的 `$targetLocale`（登录用户的区域设置，`Contexts.getAccountContext().locale`），使搜索对话框以登录用户的区域设置显示。由于是 `<script>` 内的字符串字面量，需指定 `escapeXml="false" escapeJs="true"`（参见 `.github/instructions/jssp-presentation-page.instructions.md`「作为 JavaScript 字符串字面量使用时」）

### 1.3 回调函数

接收搜索对话框中选择的角色信息，并调用 1.4 的反映函数将其反映到表单字段中。

```html
<script type="text/javascript">
  // 回调函数（imACMSearch 按函数名调用，因此定义在全局作用域）
  function callbackFromImMaster(result) {
    // 未选择时不做任何处理（保留当前值）
    if (!result || result.length === 0) {
      return;
    }
    if (typeof window._setSelectedRole === 'function') {
      window._setSelectedRole(result[0].data.role_id, result[0].displayName);
    }
  }
  // 将函数放置到全局
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**要点：**
- 回调函数接收对象数组形式的选择结果
- 单选（`type: 'single'`）时使用 `result[0]` 获取
- 选择结果为空（未选择）时不做任何处理，保留当前值。选择结果的清除通过清除按钮进行
- 角色搜索的 `data` 包含 `role_id`。由于角色名称不包含在 `data` 中，需从 `result[0].displayName` 获取
- 回调函数必须通过 `window.函数名 = 函数名` 注册到全局作用域
- 回调函数无法直接引用 `DOMContentLoaded` 内的函数，因此通过以 `window._setSelectedRole` 公开的函数将值反映到表单（参见 `.github/instructions/jssp-presentation-page.instructions.md`「全局作用域的回调函数（imACMSearch 等）」）

### 1.4 选择结果的反映与清除

在 `DOMContentLoaded` 内定义将选择结果反映到表单的函数，并以 `window._setSelectedRole` 公开给回调函数使用。清除按钮向同一函数传入空字符串以清除选择结果。

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // 将选择结果反映到表单（清除时传入空字符串）
    function setSelectedRole(roleId, roleName) {
      document.getElementById(':roleId:').value   = roleId;
      document.getElementById(':roleName:').value = roleName;
    }
    // 公开以便全局作用域的回调函数调用
    window._setSelectedRole = setSelectedRole;

    // 清除按钮 单击时事件
    document.getElementById('role-clear-button').addEventListener('click', () => {
      setSelectedRole('', '');
    });
  });
</script>
```

**要点：**
- 隐藏字段（代码值）与显示用文本框（名称）在同一函数中更新，避免两者的值不一致
- 显示用文本框为 `readonly`，因此通过清除按钮清除选择结果

## 2. body 部分（表单元素）

放置隐藏字段（用于保存代码值）和带搜索图标的只读文本框（用于显示名称）。
在名称显示栏右侧并列放置清除选择结果的清除按钮（`jssp-imds-theme` 的 `imds-html-textbox-control.md`「搜索图标 + 清除按钮」）。

```html
<div class="imds-field is-horizontal imds-w-15 sample-role">
  <div class="imds-field-label"><label for=":roleName:">角色名称</label></div>
  <div class="imds-field-control">
    <input type="hidden" id=":roleId:" value="">
    <div class="imds-textbox-control">
      <input type="text" id=":roleName:" placeholder="请选择角色名称" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" id="role-clear-button" class="imds-button is-ghost" title="清除">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

**要点：**
- 使用 `input[type="hidden"]` 保存角色 ID，用于服务器提交
- 显示用文本框设为 `readonly`，仅允许通过搜索对话框进行选择
- 在 `imds-textbox-control` 内放置放大镜图标（`fa-magnifying-glass`），表示可以搜索
- `input[type="hidden"]` 放在 `imds-textbox-control` 之外（`imds-field-control` 的直接子级），`imds-textbox-control` 内仅放置 `input.imds-textbox` 和 `span.imds-icon`
- 清除按钮是仅含图标的按钮，因此通过 `title` 属性说明操作内容（`imds-html-icon-button.md`）
- 使用 `is-horizontal imds-w-15` 使标签和字段横向排列，并统一标签宽度

## 完整代码

### 函数容器（index.js）

```javascript
/**
 * 角色搜索画面
 *
 * @file index.js
 * @description 构建将 IM-共通主数据搜索对话框中选择的值显示到表单的画面。
 */

// ========================================
// 绑定变量（用于呈现页面联动）
// ========================================
let $title = '角色搜索';
let $subTitle = 'IM-共通主数据 示例';
let $targetLocale = '';    // 搜索对话框的显示区域设置（登录用户的区域设置）

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面URL时，最先执行。
 * 将登录用户的区域设置作为搜索对话框的显示区域设置，设置到绑定变量。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 将登录用户的区域设置作为搜索对话框的显示区域设置
  $targetLocale = Contexts.getAccountContext().locale;
}
```

### 呈现页面（index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- 用于控制各主题不同的内容显示区域高度和宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- 呈现页面自定义样式 -->
  <style>
    /* 布局控制样式 */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
  </style>
  <!-- IM-共通主数据搜索画面调用标签 -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 回调函数（imACMSearch 按函数名调用，因此定义在全局作用域）
    function callbackFromImMaster(result) {
      // 未选择时不做任何处理（保留当前值）
      if (!result || result.length === 0) {
        return;
      }
      if (typeof window._setSelectedRole === 'function') {
        window._setSelectedRole(result[0].data.role_id, result[0].displayName);
      }
    }
    // 将函数放置到全局
    window.callbackFromImMaster = callbackFromImMaster;

    document.addEventListener('DOMContentLoaded', () => {
      // 将选择结果反映到表单（清除时传入空字符串）
      function setSelectedRole(roleId, roleName) {
        document.getElementById(':roleId:').value   = roleId;
        document.getElementById(':roleName:').value = roleName;
      }
      // 公开以便全局作用域的回调函数调用
      window._setSelectedRole = setSelectedRole;

      // 角色名称 单击时事件
      document.getElementById(':roleName:').addEventListener('click', () => {
        const parameter = {
          tabs: [{
            id   : "jp.co.intra_mart.master.app.search.tabs.role.list",
            title: "关键词"
          }],
          prop: {
            'jp.co.intra_mart.master.app.search.tabs.role.list' : ['role_id']
          },
          callback_function : 'callbackFromImMaster',
          basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
          wnd_title         : "角色搜索",
          message           : "角色搜索",
          wnd_close         : true,
          type              : 'single',
          deleted_data      : false,
          target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
        };

        // 打开搜索画面
        imACMSearch.open(parameter);
      });

      // 清除按钮 单击时事件
      document.getElementById('role-clear-button').addEventListener('click', () => {
        setSelectedRole('', '');
      });
    });
  </script>
</imart>

<!-- 页面整体容器（因位于 intra-mart 主题 imui-container 内部，故不附加 id） -->
<div class="imds-container pgstyle-layout-container">
  <!-- 头部 -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-user-shield"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <!-- 主要内容 -->
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <div class="imds-field-container has-accent-color">
          <div class="imds-field is-horizontal imds-w-15 sample-role">
            <div class="imds-field-label"><label for=":roleName:">角色名称</label></div>
            <div class="imds-field-control">
              <input type="hidden" id=":roleId:" value="">
              <div class="imds-textbox-control">
                <input type="text" id=":roleName:" placeholder="请选择角色名称" class="imds-textbox" readonly value="">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </div>
              <button type="button" id="role-clear-button" class="imds-button is-ghost" title="清除">
                <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  </main>
</div>
```

## 实现注意事项

- `<imart type="imACMSearch" />` 必须放置在 `<imart type="head">` 内
- 回调函数必须通过 `window.函数名 = 函数名` 注册到全局作用域
- 在 `tabs` 中明确指定插件 ID，并与 `prop` 的键保持一致
- 由于角色名称不包含在 `data` 中，显示名称需使用 `result[i].displayName`
- 显示用字段设为 `readonly`，仅允许通过搜索对话框进行选择
- `:roleId:`、`:roleName:` 是遵循 `.github/instructions/jssp-presentation-page.instructions.md`「id 属性的命名规约」的输入元素 id。在同一画面放置多个相同搜索栏时，请修改这些 id、清除按钮的 id 和反映函数名，避免重复
- 带 `sample-` 前缀的类是用于布局调整的自定义类，不是 imds 主题的标准类
- 头部的标题・副标题不要直接书写，而是输出在函数容器中绑定的 `$title` / `$subTitle`
- `target_locale` 不要直接书写 `'ja'` 等值，而是以 `escapeXml="false" escapeJs="true"` 输出在函数容器中绑定的 `$targetLocale`（登录用户的区域设置）
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` 是不可替换的固定类名。在 `<imart type="head">` 中加载 `theme-conditional-layout.css`，并在 `<style>` 中定义布局控制样式（`jssp-imds-theme` 的 `assets/imds-form-page.md`）
- 回调的 `result` 为空（未选择）时不做任何处理，不要清除当前值
- 多选模式（`type: 'multiple'`）时，需在回调内用 `for` 循环处理 `result`
- 多选模式下，将回调的 `result` 保存到变量中，在重新打开对话框时作为 `default_selected` 参数传递，可恢复对话框上已选择的项目。实现模式如下：
  - 声明保持变量：`let selectedRole = [];`
  - 在回调内保存（`result` 为空时不保存，保留已选择的项目）：`selectedRole = result;`
  - 启动对话框时传递：`default_selected: selectedRole`
  - 清除时置空：`selectedRole = [];`
