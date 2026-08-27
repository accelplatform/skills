# 输入表单页面实现示例

结合 imds 主题组件的业务输入表单页面实现示例。
以"PC 终端 - 新建注册"页面为题材，展示标题、区段、字段组、各种输入组件和底部按钮的构成模式。

本页面采用固定显示标题和底部、仅表单部分纵向滚动的固定标题布局。使用固定类名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-footer` 的布局控制模式（基于 `height: 100%`，因此必须在 `<imart type="head">` 中加载 `theme-conditional-layout.css`，详见「实现注意事项」）。按功能使用不同占位符 prefix 的旧方式说明请参见 [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md)。

## 使用组件列表

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | 带返回按钮的页面标题 |
| Field | [field.md](../reference/field.md) | 各输入项目 |
| FieldGroup | [field-group.md](../reference/field-group.md) | 输入项目的分组 |
| Textbox | [textbox.md](../reference/textbox.md) | 文本输入 |
| TextboxControl | [textbox-control.md](../reference/textbox-control.md) | 带搜索图标的文本输入 |
| Select | [select.md](../reference/select.md) | 下拉选择 |
| Radio | [radio.md](../reference/radio.md) | 单选按钮 |
| Checkbox | [checkbox.md](../reference/checkbox.md) | 复选框 |
| Button | [button.md](../reference/button.md) | 操作按钮 |
| IconButton | [icon-button.md](../reference/icon-button.md) | 清除按钮（×图标） |
| FileUpload | [file-upload.md](../reference/file-upload.md) | 文件上传 |
| IconFont | [icon-font.md](../reference/icon-font.md) | 各种图标 |

## 整体结构

在 `imds-container` 上附加 `pgstyle-layout-container`（2 行网格），在 `<main>` 上附加 `pgstyle-layout-main`（纵向 flex），在底部上附加 `pgstyle-layout-footer`（`flex:0 0 auto`）。表单区域（`<form>`）本身的滚动控制则使用固定类名 `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`）。

```
div.imds-container.pgstyle-layout-container    ... 根 div（因配置在 intra-mart 主题 imui-container 的内部，故不赋予 id，也不再套中间层包裹元素）
├── header.imds-header                        ... 页面标题（返回按钮・图标・标题。固定显示）
└── main.pgstyle-layout-main（纵向 flex 容器）
    ├── form.imds-form               ... 表单主体（附加 imds-scrollbar。flex:1 0 0; overflow:auto）
    │   ├── section（基本信息）       ... 区段1
    │   │   └── imds-field-container
    │   │       ├── field-group（所属公司）
    │   │       ├── field-group（使用状态）
    │   │       ├── field-group（PC 类型）
    │   │       └── field（使用者）
    │   └── section（详细信息）       ... 区段2
    │       └── imds-field-container
    │           ├── field-group（采购信息）
    │           ├── field-group（机器信息）
    │           ├── field-group（规格）
    │           └── field-group（存储加密）
    └── div.pgstyle-layout-footer（flex:0 0 auto，位于滚动区域之外）  ... 注册・暂存按钮
```

## 1. 页面标题

返回按钮 + 图标 + 标题（带副标题）的构成。
同时放置了 `imds-header-back-button` 和 `imds-header-icon`。

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button
      type="button"
      class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>PC・可移动媒体管理</p>
    <h1>PC 终端 - 新建注册</h1>
  </div>
</header>
```

## 2. 表单主体

为 `imds-form` 应用灰色背景（`has-background-color-gray`），配置为可滚动区域。
在表单内用 `imds-section` 进行逻辑分隔，每个区段用 `imds-heading` 添加标题。

`<form>` 本身兼作固定标题布局的滚动区域（附加 `imds-scrollbar`・`flex: 1 0 0; overflow: auto;`）。请在根 `<div>` 上附加 `pgstyle-layout-container`，在 `<main>` 上附加 `pgstyle-layout-main`，在 `<form>` 本身上附加 `pgstyle-layout-content`（CSS 定义请参考「实现注意事项」）。

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <!-- 参见「1. 页面标题」 -->
  </header>
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">基本信息</h2>
        <div class="imds-field-container has-accent-color">
          <!-- 字段组集合 -->
        </div>
      </section>
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">详细信息</h2>
        <div class="imds-field-container has-accent-color">
          <!-- 字段组集合 -->
        </div>
      </section>
    </form>
    <!-- 底部（注册・暂存按钮）配置在 main 的直接子级、form 的外侧。参见「5. 底部（操作按钮）」 -->
  </main>
</div>
```

**要点：**
- `imds-field-container has-accent-color` 为字段组添加强调色竖线
- `imds-content-normal-width` 将内容宽度限制为标准宽度
- `imds-content-normal-width` 之所以没有直接添加在 `<form>` 上，而是添加在各个 `<section>` 上，是有意为之的差异（uiux-share 的示例是直接加在 `<form>` 上，而本资产为了能够以区段为单位复用相同的最大宽度而如此设计）。效果相同，因此无需将其移动到 `<form>` 上
- 根 `<div>` 不赋予 id，仅赋予 `class="imds-container ..."`，且不创建中间层包裹元素
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` 是**固定**类名，不是按功能替换的占位符——生成时也不要更改类名（以 `imds-` 开头的标准类同样不要更改）

## 3. 基本信息区段

### 3.1 单选按钮 + 子字段组合（所属公司）

在 `imds-field-group` 内，在单选按钮选择下方放置子字段（公司名、部门名）的模式。
在组标签上用 `imds-required-label-required` 添加必填标记。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="必填">
      所属公司
    </span>
  </div>
  <div class="imds-field-group-control">
    <div class="imds-radio-group is-horizontal sample-proprietor">
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-1"
          checked="" />
        <span>NTT DATA Intramart</span>
      </label>
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-2" />
        <span>其他</span>
      </label>
    </div>
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-company">
          <div class="imds-field-label"><label for=":r6b:">公司名称</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6b:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-department">
          <div class="imds-field-label"><label for=":r6c:">部门名称</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6c:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**要点：**
- 使用 `imds-radio-group is-horizontal` 将单选按钮横向排列
- 在 `imds-field-group-control` 内纵向排列单选组和子字段组
- 用嵌套的 `imds-field-group` 横向排列子字段

### 3.2 下拉框 + 带搜索文本横向排列（使用状态）

使用 `imds-field-group-control is-horizontal` 横向排列下拉框和带搜索图标文本框的模式。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>使用状态</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field sample-status">
      <div class="imds-field-label">
        <label
          class="imds-required-label-required"
          data-required-label="必填"
          for=":r6d:">
          状态
        </label>
      </div>
      <div class="imds-field-control">
        <select
          id=":r6d:"
          class="imds-select">
          <option>请选择</option>
          <option>已设置</option>
          <option>使用中</option>
        </select>
      </div>
    </div>
    <div class="imds-field sample-location">
      <div class="imds-field-label"><label for=":r6e:">使用地点</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="选择使用地点"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**要点：**
- 组标签无必填标记，在各字段的标签上添加 `imds-required-label-required`
- 使用 `imds-textbox-control` 实现带搜索图标的只读文本框
- 在 `imds-field-control` 内并排放置清除按钮（`fa-xmark-circle`）

### 3.3 纵向排列单选按钮（PC 类型）

选项较多时，使用默认（纵向排列）的 `imds-radio-group`。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="必填">
      PC 类型
    </span>
  </div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-radio-group">
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-1"
              checked="" />
            <span>台式机</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-2" />
            <span>笔记本</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-3" />
            <span>平板电脑</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-4" />
            <span>智能手机</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-5" />
            <span>小型可移动媒体（USB 存储器等）</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3.4 带搜索文本的单独字段（使用者）

直接使用 `imds-field` 而不是 `imds-field-group` 的单独字段模式。
使用 `is-horizontal imds-w-15` 与组保持相同的标签宽度对齐。

```html
<div class="imds-field is-horizontal imds-w-15 sample-user">
  <div class="imds-field-label"><label for=":r6h:">使用者</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input
        type="text"
        placeholder="选择用户"
        class="imds-textbox"
        readonly
        value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button
      type="button"
      class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

## 4. 详细信息区段

### 4.1 日期・金额・搜索横向排列（采购信息）

横向排列不同输入类型（date、text、带搜索文本）的模式。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>采购信息</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6i:">采购日期</label></div>
      <div class="imds-field-control">
        <input
          type="date"
          id=":r6i:"
          class="imds-textbox"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6j:">采购金额</label></div>
      <div class="imds-field-control">
        <input
          type="text"
          id=":r6j:"
          class="imds-textbox has-text-end"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6k:">审批信息</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="选择审批编号"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**要点：**
- `type="date"` 也使用 `imds-textbox` 类
- 使用 `has-text-end` 将金额字段右对齐

### 4.2 多行字段组（机器信息）

在 `imds-field-group-control` 内放置多个嵌套的 `imds-field-group`，每行横向排列字段的模式。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>机器信息</span></div>
  <div class="imds-field-group-control">
    <!-- 第1行: 制造商名称・型号名称 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-manufacturer">
          <div class="imds-field-label"><label for=":r6l:">制造商名称</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6l:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6m:">型号名称</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6m:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 第2行: 机器名称・序列号・MAC地址 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-machine-name">
          <div class="imds-field-label"><label for=":r6n:">机器名称</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6n:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-serial">
          <div class="imds-field-label"><label for=":r6o:">序列号</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6o:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-mac-address">
          <div class="imds-field-label"><label for=":r6p:">MAC 地址</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6p:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 第3行: OS・其他 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-os">
          <div class="imds-field-label"><label for=":r6q:">OS</label></div>
          <div class="imds-field-control">
            <select
              id=":r6q:"
              class="imds-select">
              <option>请选择</option>
              <option>Windows10</option>
              <option>Windows10</option>
              <option>Mac</option>
              <option>其他</option>
            </select>
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6r:">其他</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6r:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**要点：**
- 外层的 `imds-field-group-control` 不加 `is-horizontal`，纵向排列（以行为单位）
- 每行用嵌套的 `imds-field-group` > `imds-field-group-control is-horizontal` 横向排列
- 每行的字段数量可以不同（2列、3列、2列）

### 4.3 文本 + 下拉框的连接字段（规格）

像内存容量一样，将文本输入和单位下拉框横向连接的模式。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>规格</span></div>
  <div class="imds-field-group-control">
    <!-- 第1行: CPU 世代・SSD 容量・HDD 容量 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-cpu">
          <div class="imds-field-label"><label for=":r6s:">CPU 世代</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6s:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-ssd">
          <div class="imds-field-label"><label for=":r6t:">SSD 容量</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6t:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-hdd">
          <div class="imds-field-label"><label for=":r6u:">HDD 容量</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6u:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 第2行: 内存容量 + 单位下拉框 + 内存信息 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field-group sample-memory-group">
          <div class="imds-field-group-control is-horizontal">
            <div class="imds-field sample-memory-size">
              <div class="imds-field-label"><label for=":r6v:">内存容量</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r6v:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
            <div class="imds-field sample-memory-size-unit">
              <div class="imds-field-control">
                <select
                  id=":r70:"
                  class="imds-select">
                  <option>GB</option>
                  <option>TB</option>
                </select>
              </div>
            </div>
            <div class="imds-field sample-memory">
              <div class="imds-field-label"><label for=":r71:">内存信息</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r71:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**要点：**
- 用 `imds-field-group` 进一步将内存容量和单位下拉框组合，使其呈连接外观
- 单位下拉框（`sample-memory-size-unit`）省略 `imds-field-label`，仅放置控件

### 4.4 复选框 + 文件上传（存储加密）

在同一组内纵向排列复选框和文件上传的模式。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>存储加密</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <label class="imds-checkbox">
          <input type="checkbox" />
          <span>已加密</span>
        </label>
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-file-upload">
          <div class="imds-file-upload-drop-area">
            <input type="file" />
            <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
            <p class="imds-file-upload-message">请将文件拖放到此处</p>
            <p class="imds-file-upload-text">或</p>
            <button
              type="button"
              class="imds-button is-outlined is-small is-primary">
              选择文件
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. 底部（操作按钮）

固定显示在表单下方的操作按钮区域。配置在 `<main>` 的直接子级、滚动区域（`<form>`）的**外侧**，并使用固定类名 `pgstyle-layout-footer`（`flex: 0 0 auto`）固定尺寸。CSS 定义请参考「实现注意事项」。
横向排列主要按钮（注册）和轮廓按钮（暂存）。

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button is-primary"
    style="min-width: 8em;">
    注册
  </button>
  <button
    type="button"
    class="imds-button is-outlined is-primary"
    style="min-width: 8em;">
    暂存
  </button>
</div>
```

**要点：**
- 使用 `imds-border-t-1` 显示与表单区域的分界线
- 主要操作（注册）使用 `is-primary`，辅助操作（暂存）使用 `is-outlined is-primary`
- 宽度指定不定义独有的 `min-width-8em` 系列类，而是使用内联 `style="min-width: 8em;"`（参见 `jssp-presentation-page.md`「输入字段的宽度控制」中的反模式说明。自定义类与 imds 标准类的优先级相同，可能会被覆盖）

## 实现注意事项

- 对所有 `imds-field-group` 统一添加 `is-horizontal imds-w-15`，保持标签宽度一致
- 单独的 `imds-field` 也添加相同的 `is-horizontal imds-w-15`，与组保持对齐
- `for` / `id` 属性中的 `:r6b:` 等为占位符，实现时请替换为唯一值
- 带搜索图标的文本框（`imds-textbox-control`）需添加 `readonly` 并并排放置清除按钮
- `sample-` 前缀的类是布局调整用的自定义类，不是 imds 主题的标准类。**生成时请替换为与功能名称对应的前缀**（例如：商品管理画面则使用 `product-*`）。以 `imds-` 开头的标准类请原样使用，不要更改名称
- `pgstyle-layout-footer` 是**固定**类名，不是按功能替换的占位符——生成时也不要更改类名
- 本模板仅展示了底部部分的 HTML 片段，因此需要在 `<imart type="head">` 的 `<style>` 中定义以下布局控制样式（由于本文件中只有底部部分作为独立片段存在，此处仅列出 `pgstyle-layout-footer` 的定义。如果整体使用整个表单——`imds-container` / `<main>` / 表单主体的滚动区域——则还需要 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` 的定义。完整目录（含 `pgstyle-layout-content`）请参考 [imds-list-page.md](imds-list-page.md)「实现注意事项」）

  ```css
  /* 布局控制样式 */
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- `<imart type="head">` 中还必须加载 `im_design_system/theme/css/theme-conditional-layout.css`（用于控制各主题不同的内容显示区域高度和宽度的 CSS）。如果缺少该文件，`.imds-container` 的高度将无法确定，可能导致内容区域被压缩为高度 0。

  ```html
  <!-- 用于控制各主题不同的内容显示区域高度和宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 6. 判断基准（表单设计指南）

「实现注意事项」是类名・结构层面的规约，与此相对，本节汇总的是「在何种情况下选择哪一种方式」的设计判断基准。

### 6.1 必填标记的使用区分

必填标记有 3 种变体。**在同一系统・同一画面内必须统一使用其中一种**（如果画面之间混用不同方式，用户会误以为「标记方式的差异＝含义的差异」）。

| 类 | 外观 | 适合的目标用户 | 使用示例 |
|---|---|---|---|
| `imds-required-label-required`（+ `data-required-label="必填"`） | 显示「必填」徽标 | 面向终端用户・IT 素养不高的用户的画面 | 面向一般用户的申请表单、通用主数据注册画面 |
| `imds-required-label-optional`（+ `data-required-label="任意"`） | 显示「任意」徽标 | 必填项占绝大多数、任意项较少的画面 | 必填项较多、只想将附加信息设为任意项的表单 |
| `imds-required-label-required-asterisk` | 显示星号 `*` | 面向管理画面・业务系统等 IT 素养较高用户的画面 | 系统管理员用设置画面、面向开发者的管理控制台 |

**判断步骤：**
1. 首先确认使用者群体。如果目标是管理画面・设置画面等「熟悉业务系统的用户」，使用 `required-asterisk`（星号）即可
2. 面向终端用户・一般用户的画面，优先使用明确的「必填」标记（`required`）
3. 当必填项占画面的大部分、任意项仅占少数时，也可以考虑反过来只在少数任意项上添加「任意」标记（`optional`），其余不加标记的方式（可以将标记数量降到最低）
4. 如果规格书中没有对必填标记做出指定，默认使用 `imds-required-label-required`（「必填」标记）

### 6.2 字段／字段组的排列顺序

- 表单内的输入项目，应按照**从左上到右下、重要度高的项目・输入顺序自然的项目优先**的原则进行排列
- 典型的优先顺序参考：「识别信息（代码・名称等）」→「分类・状态」→「详细信息・附随信息」→「备注・备忘等任意项目」
- 相关联的项目（例如「制造商名称」与「型号名称」、「采购日期」与「采购金额」）应归入同一个 `imds-field-group`，以减少视线移动
- 当某项输入依赖于其他项目的内容时（例如选择「省份」后「城市」的选项会随之变化），应将作为依赖来源的项目配置在依赖目标项目之前
- 以区段（`imds-section`）为单位时，原则上也应按照基本信息 → 详细信息 → 任意・补充信息的顺序排列（参见表单页面实现示例中「基本信息」「详细信息」的排列顺序）

### 6.3 校验错误时的输入保留

- 即使发生校验错误，**用户已输入的值也不应被清除，而应原样保留显示在画面上**（无论是发生错误的项目还是正常的项目，都应全部保留）
- 对于通信错误、保存失败等服务器端错误，同样应保留输入值，仅显示错误消息
- 实现模式：
  - 服务器端校验时，在错误响应中原样包含输入值返回，并在函数容器一侧通过 `<imart type="string" value=$xxx>` 重新显示
  - 客户端校验时，仅通过 `preventDefault()` 等方式阻止表单提交，不改变输入值的 DOM
  - 错误提示本身通过在对应 `imds-field` 的正下方显示 `<span class="imds-error-text">`，并对 `imds-field` 添加／移除 `imds-validation-error` 类以进行视觉强调实现（详见 SKILL.md 的「表单实现模式」）
- 即使发生页面跳转或临时性的重新显示（例如打开并关闭其他对话框），也不应导致输入值丢失
