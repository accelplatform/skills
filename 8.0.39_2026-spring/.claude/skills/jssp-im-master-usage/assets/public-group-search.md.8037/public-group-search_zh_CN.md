# 公共组搜索对话框实现示例

使用 IM-共通主数据的 `imACMSearch` 调用公共组搜索对话框的实现示例。
展示通过单击文本框打开搜索对话框，并将选择结果反映到表单中的模式。
以关键词搜索标签页和树形搜索标签页的双标签页形式实现。

## 使用组件一览

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | 调用 IM-共通主数据搜索对话框 |
| Field | （imds-theme） | 公共组名称输入字段 |
| TextboxControl | （imds-theme） | 带搜索图标的文本框 |

## 整体结构

```
<imart type="head">
├── <imart type="imACMSearch" />   ... 加载搜索画面调用标签
└── <script>
    ├── addEventListener('click')  ... 单击文本框时打开搜索对话框
    ├── imACMSearch.open(parameter) ... 以弹出方式显示搜索画面
    ├── callbackFromImMaster()     ... 接收选择结果的回调函数
    └── window.callbackFromImMaster ... 将回调函数注册为全局

<div id="container">
└── imds-container
    └── main
        └── form.imds-form
            └── section
                └── imds-field-container
                    └── imds-field（公共组名称）
                        ├── input[type="hidden"]    ... 公共组集代码（隐藏字段）
                        ├── input[type="hidden"]    ... 公共组代码（隐藏字段）
                        └── imds-textbox-control    ... 公共组名称（带搜索图标・只读）
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
公共组搜索中指定关键词搜索和树形搜索两个标签页。

```html
<script type="text/javascript">
  // 公共组名称 单击时事件
  document.getElementById(':publicGroupName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.public_group.list",
        title: "关键词"
      }, {
        id   : "jp.co.intra_mart.master.app.search.tabs.public_group.tree",
        title: "树形"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.public_group.list' : ['public_group_set_cd', 'public_group_cd', 'public_group_name'],
        'jp.co.intra_mart.master.app.search.tabs.public_group.tree' : ['public_group_set_cd', 'public_group_cd', 'public_group_name']
      },
      callback_function : 'callbackFromImMaster',
      basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title         : "公共组搜索",
      message           : "公共组搜索",
      wnd_close         : true,
      type              : 'single',
      deleted_data      : false,
      target_locale     : 'ja'
    };

    // 打开搜索画面
    imACMSearch.open(parameter);
  });
</script>
```

**要点：**
- 在 `tabs` 中指定两个公共组搜索插件 ID，显示关键词搜索（`public_group.list`）和树形搜索（`public_group.tree`）两个标签页
- `prop` 为每个标签页分别指定获取项目。即使两个标签页获取相同项目，也需要为各自的键单独指定
- `type: 'single'` 为单选模式，`'multiple'` 为多选模式
- `wnd_close: true` 表示选择后自动关闭对话框
- 如果只需要关键词搜索标签页，则在 `tabs` 中只指定 `public_group.list`

### 1.3 回调函数

接收搜索对话框中选择的公共组信息，并将其反映到表单字段中。

```html
<script type="text/javascript">
  // 回调函数
  function callbackFromImMaster(result) {
    const publicGroupSetCd = result[0].data.public_group_set_cd;
    const publicGroupCd    = result[0].data.public_group_cd;
    const publicGroupName  = result[0].data.public_group_name;
    document.getElementById(':publicGroupSetCode:').value = publicGroupSetCd;
    document.getElementById(':publicGroupCode:').value    = publicGroupCd;
    document.getElementById(':publicGroupName:').value    = publicGroupName;
  }
  // 将函数放置到全局
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**要点：**
- 回调函数接收对象数组形式的选择结果
- 单选（`type: 'single'`）时使用 `result[0]` 获取
- 公共组的主键由 `public_group_set_cd` 和 `public_group_cd` 两个部分构成，因此两者都需存储在隐藏字段中
- 公共组搜索的 `data` 包含 `public_group_set_cd`、`public_group_cd`、`public_group_name`、`delete_flag`
- 回调函数必须通过 `window.函数名 = 函数名` 注册到全局作用域

## 2. body 部分（表单元素）

放置隐藏字段（用于保存主键）和带搜索图标的只读文本框（用于显示名称）。
由于公共组的主键由公共组集代码和公共组代码两个部分构成，各自存储在隐藏字段中。

```html
<div class="imds-field is-horizontal imds-w-15 sample-public-group">
  <div class="imds-field-label"><label for=":publicGroupName:">公共组名称</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":publicGroupSetCode:" value="">
      <input type="hidden" id=":publicGroupCode:" value="">
      <input type="text" id=":publicGroupName:" placeholder="请选择公共组名称" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**要点：**
- 使用 `input[type="hidden"]` 保存公共组集代码和公共组代码两个主键，用于服务器提交
- 显示用文本框设为 `readonly`，仅允许通过搜索对话框进行选择
- 在 `imds-textbox-control` 内放置放大镜图标（`fa-magnifying-glass`），表示可以搜索
- 使用 `is-horizontal imds-w-15` 使标签和字段横向排列，并统一标签宽度

## 完整代码

```html
<imart type="head">
  <!-- IM-共通主数据搜索画面调用标签 -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 公共组名称 单击时事件
    document.getElementById(':publicGroupName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.public_group.list",
          title: "关键词"
        }, {
          id   : "jp.co.intra_mart.master.app.search.tabs.public_group.tree",
          title: "树形"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.public_group.list' : ['public_group_set_cd', 'public_group_cd', 'public_group_name'],
          'jp.co.intra_mart.master.app.search.tabs.public_group.tree' : ['public_group_set_cd', 'public_group_cd', 'public_group_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "公共组搜索",
        message           : "公共组搜索",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : 'ja'
      };

      // 打开搜索画面
      imACMSearch.open(parameter);
    });

    // 回调函数
    function callbackFromImMaster(result) {
      const publicGroupSetCd = result[0].data.public_group_set_cd;
      const publicGroupCd    = result[0].data.public_group_cd;
      const publicGroupName  = result[0].data.public_group_name;
      document.getElementById(':publicGroupSetCode:').value = publicGroupSetCd;
      document.getElementById(':publicGroupCode:').value    = publicGroupCd;
      document.getElementById(':publicGroupName:').value    = publicGroupName;
    }
    // 将函数放置到全局
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>

<!-- 页面整体容器 -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p>IM-共通主数据 示例</p>
        <h1>公共组搜索</h1>
      </div>
    </header>
    <main>
      <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <div class="imds-field-container has-accent-color">
            <div class="imds-field is-horizontal imds-w-15 sample-public-group">
              <div class="imds-field-label"><label for=":publicGroupName:">公共组名称</label></div>
              <div class="imds-field-control">
                <div class="imds-textbox-control">
                  <input type="hidden" id=":publicGroupSetCode:" value="">
                  <input type="hidden" id=":publicGroupCode:" value="">
                  <input type="text" id=":publicGroupName:" placeholder="请选择公共组名称" class="imds-textbox" readonly value="">
                  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  </div>
</div>
```

## 实现注意事项

- `<imart type="imACMSearch" />` 必须放置在 `<imart type="head">` 内
- 回调函数必须通过 `window.函数名 = 函数名` 注册到全局作用域
- 在 `tabs` 中明确指定插件 ID，并与 `prop` 的键保持一致
- 使用多个标签页时，`prop` 需为每个标签页的插件 ID 分别指定获取项目
- 显示用字段设为 `readonly`，仅允许通过搜索对话框进行选择
- `:publicGroupSetCode:`、`:publicGroupCode:`、`:publicGroupName:` 为占位符，实现时请替换为唯一 ID
- 带 `sample-` 前缀的类是用于布局调整的自定义类，不是 imds 主题的标准类
- 多选模式（`type: 'multiple'`）时，需在回调内用 `for` 循环处理 `result`
- 多选模式下，将回调的 `result` 保存到变量中，在重新打开对话框时作为 `default_selected` 参数传递，可恢复对话框上已选择的项目。实现模式如下：
  - 声明保持变量：`let selectedPublicGroup = [];`
  - 在回调内保存：`selectedPublicGroup = result;`
  - 启动对话框时传递：`default_selected: selectedPublicGroup`
