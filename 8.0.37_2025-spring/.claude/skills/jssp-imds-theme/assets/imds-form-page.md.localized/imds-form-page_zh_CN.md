# 输入表单页面实现示例

结合 imds 主题组件的业务输入表单页面实现示例。
以"PC 终端 - 新建注册"页面为题材，展示标题、区段、字段组、各种输入组件和底部按钮的构成模式。

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

```
imds-container
├── header.imds-header           ... 页面标题（返回按钮・图标・标题）
└── main
    ├── form.imds-form           ... 表单主体（可滚动区域）
    │   ├── section（基本信息）   ... 区段1
    │   │   └── imds-field-container
    │   │       ├── field-group（所属公司）
    │   │       ├── field-group（使用状态）
    │   │       ├── field-group（PC 类型）
    │   │       └── field（使用者）
    │   └── section（详细信息）   ... 区段2
    │       └── imds-field-container
    │           ├── field-group（采购信息）
    │           ├── field-group（机器信息）
    │           ├── field-group（规格）
    │           └── field-group（存储加密）
    └── div（底部）               ... 注册・暂存按钮
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

```html
<form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
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
```

**要点：**
- `imds-field-container has-accent-color` 为字段组添加强调色竖线
- `imds-content-normal-width` 将内容宽度限制为标准宽度

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

固定显示在表单下方的操作按钮区域。
横向排列主要按钮（注册）和轮廓按钮（暂存）。

```html
<div class="sample-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-primary">
    注册
  </button>
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-outlined is-primary">
    暂存
  </button>
</div>
```

**要点：**
- 使用 `imds-border-t-1` 显示与表单区域的分界线
- 主要操作（注册）使用 `is-primary`，辅助操作（暂存）使用 `is-outlined is-primary`

## 实现注意事项

- 对所有 `imds-field-group` 统一添加 `is-horizontal imds-w-15`，保持标签宽度一致
- 单独的 `imds-field` 也添加相同的 `is-horizontal imds-w-15`，与组保持对齐
- `for` / `id` 属性中的 `:r6b:` 等为占位符，实现时请替换为唯一值
- 带搜索图标的文本框（`imds-textbox-control`）需添加 `readonly` 并并排放置清除按钮
- `sample-` 前缀的类是布局调整用的自定义类，不是 imds 主题的标准类
