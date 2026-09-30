# 简单向导画面模板

## 概述

表现简单向导的画面构成的呈现页面（仅HTML部分）模板。
使用imds的步进器，每次按下按钮时显示下一个画面。

## 模板

```html
<!-- 整个页面的容器（配置在 intra-mart 主题的 imui-container 内部，因此不附加 id） -->
<div class="imds-container">
  <!-- 头部 -->
  <header class="imds-header">
    <div class="imds-header-title">
      <p>${示例}</p>
      <h1>${示例} 导入</h1>
    </div>
  </header>

  <!-- 主要内容 -->
  <main class="sample-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.选择文件</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.确认内容</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>3.导入结果</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-6 imds-px-8 imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-5">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>选择文件</p>
        </div>
        <div class="imds-message-content">
          <p>导入${示例}的导出数据。</p>
          <p>选择文件后，点击确认内容按钮。</p>
          <p>可导入的文件格式仅限XXXXXX。</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area">
          <input type="file" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">请将文件拖放至此处</p>
          <p class="imds-file-upload-text">或</p>
          <button type="button" class="imds-button is-outlined is-small is-primary">选择文件</button>
        </div>
      </div>
      <button type="button" class="imds-button is-primary imds-mt-7">前往确认内容</button>
    </section>
  </main>
</div>
```

## 注意事项

- 点击步进器时的画面显示切换，需另行使用JavaScript实现