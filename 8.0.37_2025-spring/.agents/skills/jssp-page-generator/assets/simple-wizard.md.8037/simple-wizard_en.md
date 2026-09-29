# Simple Wizard Screen Template

## Overview

A presentation page template (HTML part only) for a screen that represents a simple wizard.
Uses imds steppers to display the next screen each time a button is pressed.

## Template

```html
<!-- Full-page container (no id is added, since it is placed inside the intra-mart theme's <div id="imui-container">) -->
<div class="imds-container">
  <!-- Header -->
  <header class="imds-header">
    <div class="imds-header-title">
      <p>${Sample}</p>
      <h1>${Sample} Import</h1>
    </div>
  </header>

  <!-- Main content -->
  <main class="sample-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1. Select File</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2. Review Content</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>3. Import Result</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-6 imds-px-8 imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-5">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>Select File</p>
        </div>
        <div class="imds-message-content">
          <p>Import the export data of ${Sample}.</p>
          <p>Select a file and click the Review Content button.</p>
          <p>The only importable file format is XXXXXX.</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area">
          <input type="file" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">Drag and drop a file here</p>
          <p class="imds-file-upload-text">or</p>
          <button type="button" class="imds-button is-outlined is-small is-primary">Select File</button>
        </div>
      </div>
      <button type="button" class="imds-button is-primary imds-mt-7">Proceed to Review Content</button>
    </section>
  </main>
</div>
```

## Notes

- Screen display switching when clicking on the stepper should be implemented separately in JavaScript
