# 导入画面实现示例

结合 imds 主题组件的业务导入画面实现示例。
以"助手定义"画面为题材，展示页头、步骤条、文件选择、内容确认、导入结果的构成模式。

本页面采用固定头部布局：页头固定显示，仅步骤条各步骤内容纵向滚动。CSS 设计・DOM 结构的标准模式请参考 [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md)。

## 使用组件列表

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | 带关联画面菜单的页头 |
| Stepper | [stepper.md](../reference/stepper.md) | 导入流程的进度显示（3 个步骤） |
| Message | [message.md](../reference/message.md) | 导入条件的补充说明 |
| FileUpload | [file-upload.md](../reference/file-upload.md) | 文件上传 + 上传后的列表显示 |
| CollapseMessage | [collapse-message.md](../reference/collapse-message.md) | 状态补充说明・注意事项的折叠显示 |
| Table | [table.md](../reference/table.md) | 导入内容确认表格・结果汇总表格 |
| Checkbox | [checkbox.md](../reference/checkbox.md) | "仅显示失败项"筛选 |
| Button | [button.md](../reference/button.md) | 各步骤的执行・返回按钮 |

## 整体结构

固定头部布局（`imds-container` 采用 2 行网格、`<main>` 采用纵向 flex、步骤内容设置 `flex:1 0 0; overflow:auto`）的详细说明请参考 [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md)。

```
div.imds-container                    ... 根 div（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id，也不夹带中间包装层）
├── header.imds-header               ... 页头（关联画面菜单・标题。固定显示）
└── main（纵向 flex 容器）
    ├── div.imds-stepper              ... 进度步骤条（3 个步骤。固定显示，flex:0 0 auto）
    └── section（按步骤切换。附加 imds-scrollbar，flex:1 0 0; overflow:auto）
        ├── 步骤1：选择文件
        │   ├── imds-message         ... 补充说明消息（支持的格式等）
        │   ├── imds-file-upload      ... 文件上传区域
        │   ├── imds-file-upload-list ... 已上传文件列表
        │   └── button                ... 前往内容确认
        ├── 步骤2：内容确认
        │   ├── imds-collapse-message × N ... 状态补充说明・注意事项
        │   ├── imds-table            ... 导入内容列表（含状态列）
        │   └── 页脚（位于 main 之下・滚动区域之外，flex:0 0 auto） ... 返回・执行导入
        └── 步骤3：导入结果
            ├── sample-import-result-container ... 结果图标 + 消息 + 操作按钮
            └── imds-table            ... 结果汇总表格
```

```css
.assistant-import-layout-container {
  height: 100vh;
  display: grid;
  grid-template-rows: 5rem minmax(0, 1fr);
  grid-template-columns: 100%;
}
.assistant-import-layout-container > .imds-header {
  grid-row: 1 / 2;
}
.assistant-import-layout-main {
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.assistant-import-step-panel {
  flex: 1 0 0;
  overflow: auto;
}
.assistant-import-footer {
  flex: 0 0 auto;
}
```

```html
<div class="imds-container assistant-import-layout-container">
  <header class="imds-header">…</header>
  <main class="assistant-import-layout-main">
    <div class="imds-stepper">…</div>
    <section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
      <!-- 各步骤对应的内容（参见下方 3〜5） -->
    </section>
  </main>
</div>
```

## 1. 页头

通常与导出画面成对存在，同样以 `imds-header-nav`（配合 Popover）模式为基本形式。

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-nav">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a href="#"><span>助手定义列表</span></a></li>
            <li><a href="#"><span>助手定义导出</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**要点：**
- 页头中必须配置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 三者之一
- 不要在 `imds-header-actions` 中放置导入执行按钮（业务操作按钮不放在页头中的原则同样适用于导入画面）

## 2. 步骤条

导入画面由"选择文件" → "内容确认" → "导入结果"这 3 个步骤构成。

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1.选择文件</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2.内容确认</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>3.导入结果</span></button>
    </li>
  </ul>
</div>
```

## 3. 步骤1：选择文件

由补充说明消息 + 文件上传区域 + 上传后的文件列表构成。

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <div class="imds-message is-outlined is-info imds-mb-5">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>选择文件</p>
    </div>
    <div class="imds-message-content">
      <p>导入助手定义的导出数据。</p>
      <p>请选择文件，然后点击"前往内容确认"按钮。</p>
      <p>可导入的文件格式仅限 zip。</p>
    </div>
  </div>
  <div class="imds-file-upload">
    <div class="imds-file-upload-drop-area">
      <input type="file" accept=".zip">
      <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
      <p class="imds-file-upload-message">请将文件拖放到此处</p>
      <p class="imds-file-upload-text">或</p>
      <button type="button" class="imds-button is-outlined is-small is-primary">选择文件</button>
    </div>
  </div>
  <!-- 上传完成后由 JS 插入的文件列表 -->
  <div class="imds-file-upload-list" id="uploaded-file-list">
    <table>
      <tbody>
        <tr>
          <td>
            <span>
              <span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>
              <span class="imds-file-upload-name">assistant-definitions.zip</span>
            </span>
          </td>
          <td class="imds-file-upload-date"><span>2026/07/24 10:00</span></td>
          <td class="imds-file-upload-size"><span>1.2MB</span></td>
          <td>
            <button type="button" class="imds-button is-ghost" title="删除">
              <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width:8em;" disabled>
    前往内容确认
  </button>
</section>
```

**要点：**
- "前往内容确认"按钮在文件上传完成之前应保持 `disabled` 状态
- 文件列表（`imds-file-upload-list`）在上传完成后由 JavaScript 插入。每行配置文件图标、文件名、上传日期时间、大小、删除按钮
- 点击删除按钮取消文件后，若列表变为空，则应将"前往内容确认"按钮重新设为 `disabled`

## 4. 步骤2：内容确认

显示可按状态（新增・更新・删除・无变化）确认已上传文件内容的列表。

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <div class="imds-collapse-message is-outlined is-small is-info imds-mb-3">
    <input type="checkbox" id="status-note-toggle">
    <label for="status-note-toggle">
      <div class="imds-message-title">
        <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
        <p>状态补充说明</p>
      </div>
      <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
    </label>
    <div class="imds-message-content">
      <p>以下状态属于特殊情况，详情请查看表格确认。</p>
      <div class="imds-table is-bordered is-area-bordered is-narrow">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>状态</span></th>
                <th><span>说明</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="is-warning">
                  <span>更新</span>
                  <span class="imds-icon imds-ml-2 is-warning"><i class="fa-solid fa-warning"></i></span>
                </td>
                <td><span>现有数据将被更新。</span></td>
              </tr>
              <tr>
                <td class="is-danger">
                  <span>删除</span>
                  <span class="imds-icon imds-ml-2 is-danger"><i class="fa-solid fa-triangle-exclamation"></i></span>
                </td>
                <td><span>现有数据将被删除。</span></td>
              </tr>
              <tr>
                <td><span>无变化</span></td>
                <td><span>现有数据与导入内容相同，仅更新更新日期时间。</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="imds-table is-sticky" style="max-height: 400px;">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th><span>状态</span></th>
            <th><span>助手定义名称</span></th>
            <th><span>分类</span></th>
          </tr>
        </thead>
        <tbody id="import-preview-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<!-- 页脚放置在 main 之下・滚动区域（section）之外，通过 flex:0 0 auto 固定 -->
<div class="assistant-import-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" id="back-to-file-select" class="imds-button is-outlined" style="min-width:8em;">返回</button>
  <button type="button" id="import-execute-button" class="imds-button is-primary" style="min-width:8em;">导入</button>
</div>
```

**要点：**
- 状态补充说明・注意事项使用 `imds-collapse-message`（折叠消息）显示，仅在需要时配置。消息内使用表格时，采用 `is-bordered is-area-bordered is-narrow` 等 Table 变体
- 应明确说明"无变化"的数据同样属于导入对象，仅会更新更新者・更新日期时间
- 点击返回按钮返回步骤1（选择文件）

## 5. 步骤3：导入结果

根据导入执行后的结果（成功・警告・错误）切换汇总显示。

### 5-A. 成功时

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-success"><i class="fa-regular fa-circle-check"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>助手定义导入已完成。</p>
      <p>详情请查看列表。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">打开助手定义列表</button>
      <button type="button" class="imds-button">返回导入画面</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>导入件数</span></th>
            <th><span>分类</span></th>
            <td><span>10 条</span></td>
          </tr>
          <tr>
            <th><span>助手定义</span></th>
            <td><span>10 条</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>导入文件</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>执行结束日期时间</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>执行用户</span></th>
            <td><span>租户太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

### 5-B. 警告时（部分失败）

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-warning"><i class="imds-iconfont imds-warning"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>助手定义导入已执行，但部分失败。</p>
      <p>详情请查看列表。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">打开助手定义列表</button>
      <button type="button" class="imds-button">返回导入画面</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>导入件数</span></th>
            <th><span>分类</span></th>
            <td><span>5/10 条</span></td>
          </tr>
          <tr>
            <th><span>助手定义</span></th>
            <td><span>5/10 条</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>导入文件</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>执行结束日期时间</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>执行用户</span></th>
            <td><span>租户太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <label class="imds-checkbox imds-mt-3">
    <input type="checkbox" id="show-failed-only" checked>
    <span>仅显示失败项</span>
  </label>
  <div class="imds-table is-bordered" id="import-result-detail-table">
    <!-- 失败数据的详细列表（由 JS 生成） -->
  </div>
</section>
```

### 5-C. 错误时（全部失败）

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-error"><i class="fa-regular fa-circle-xmark"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>助手定义导入失败。</p>
      <p>详情请查看列表。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">打开助手定义列表</button>
      <button type="button" class="imds-button">返回导入画面</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th><span>导入文件</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th><span>执行日期时间</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th><span>执行用户</span></th>
            <td><span>租户太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

**要点：**
- 结果图标通过成功 `is-success`（`fa-circle-check`）、警告 `is-warning`（`imds-warning`）、错误 `is-error`（`fa-circle-xmark`）加以区分
- 成功・警告时，除显示"导入使用的文件名"「执行结束日期时间」「执行用户」外，还应按种类显示导入件数（警告时以 `成功件数/总数` 的格式表示）。错误时（全部失败）省略件数行，仅显示文件名・执行日期时间・执行用户
- 仅在警告时（部分失败）配置"仅显示失败项"复选框。**初始状态为选中**（仅显示失败数据），取消勾选后显示全部数据
- 点击"打开列表"按钮跳转至列表画面，点击"返回导入画面"按钮返回步骤1

## 实现注意事项

- 步骤切换・文件上传状态・导入结果判定（成功/警告/错误）由 JavaScript（及服务端处理结果）控制
- 相当于 `${示例}` 的部分（数据种类名称），应替换为实现对象的数据种类名称
- 可用于导入的文件格式，应同时在 `<input type="file" accept="...">` 与补充说明消息中明确标注
- 由于本画面通常与导出画面成对存在，页头的 `imds-header-nav` 菜单中通常会包含指向导出画面・列表画面的入口
- 步骤2的确认表格・步骤3的结果表格，可根据需要使用 `imds-table is-sticky` 固定表头（参见列表画面模板中的 `isSticky` 一节）
- `sample-import-*` / `assistant-import-*` 为占位符 prefix。实现时应替换为与功能名称相符的 prefix（以 `imds-` 开头的标准类不做修改）
