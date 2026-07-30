# imdsConfirm（JavaScript API）

## 基本信息

在 imds 主题中显示确认对话框。
与 imuiConfirm 的 API 调用兼容，如果已使用 imuiConfirm，可以替换为 imdsConfirm。

## ⚠️ 重要：每个页面都必须包含函数定义

`imdsConfirm` 函数**不会从通用处理（主题或平台）自动提供**。
必须将本参考文件下方「JavaScript 代码」一节中的整套函数定义（`function imdsConfirm(...)` 及末尾的 `imdsConfirm._active = false;`）复制到调用 `imdsConfirm` 的**每一个展示页面**的 `<script>` 中。

- 即使在既有页面中发现自定义的 `imdsConfirm` 实现，**不得**判断为「重复」「应已通用化」而**删除它**。一旦删除，该页面的确认对话框将无法工作
- 即使想要通用化，也不要拆分到其他文件，前提是每个页面都保留相同的函数定义
- 函数内容（HTML 生成、事件、Promise 化等）必须与本参考文件的代码严格一致。如有差异，外观或行为将出现问题

## JavaScript 代码

```javascript
/**
 * 显示确认对话框并返回用户的选择结果。
 *
 * @param {string} message - 正文
 * @param {string} [title='确认'] - 标题
 * @param {Function} [onOk] - 按下确定按钮时的回调
 * @param {Function} [onCancel] - 按下取消按钮时的回调
 * @param {Object} [options]
 * @param {'info'|'danger'|'warning'} [options.mode='info'] - 对话框类型
 * @param {{text?: string}} [options.okButton] - 确定按钮的选项
 * @param {{text?: string}} [options.cancelButton] - 取消按钮的选项
 * @returns {Promise<boolean>} 按下确定按钮时返回 true，按下取消时返回 false
 */
function imdsConfirm(message, title, onOk, onCancel, options) {
  // 如果已在显示中，立即返回 false
  if (imdsConfirm._active) {
    return Promise.resolve(false);
  }
  imdsConfirm._active = true;

  const VALID_MODES = ['info', 'danger', 'warning'];
  let mode = (options && options.mode) || 'info';
  if (!VALID_MODES.includes(mode)) mode = 'info';

  const okText = (options && options.okButton && options.okButton.text) || '执行';
  const cancelText = (options && options.cancelButton && options.cancelButton.text) || '取消';
  const dialogTitle = title || '确认';

  // 各模式的配置
  const iconClass = mode === 'info' ? 'fa-circle-question' : 'fa-triangle-exclamation';
  const okButtonClass = mode === 'danger' ? 'imds-button is-danger' : 'imds-button is-primary';

  // 生成 dialog 元素
  const dialog = document.createElement('dialog');
  dialog.className = 'imds-confirm-wrapper';

  dialog.innerHTML =
    '<div class="imds-confirm is-' + mode + '">' +
      '<div class="imds-confirm-content-wrapper">' +
        '<button class="imds-confirm-close imds-button is-ghost">' +
          '<span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>' +
        '</button>' +
        '<div class="imds-confirm-content">' +
          '<div class="imds-confirm-message-wrapper">' +
            '<div class="imds-confirm-icon">' +
              '<span class="imds-icon is-x-small is-' + mode + '">' +
                '<i class="fa-solid ' + iconClass + '"></i>' +
              '</span>' +
            '</div>' +
            '<div class="imds-confirm-message">' +
              '<p class="imds-confirm-message-title"></p>' +
              '<div class="imds-confirm-message-content"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="imds-confirm-footer">' +
        '<div class="imds-confirm-footer-content">' +
          '<button type="button" class="imds-button imds-confirm-cancel-button"></button>' +
          '<button type="button" class="' + okButtonClass + ' imds-confirm-ok-button"></button>' +
        '</div>' +
      '</div>' +
    '</div>';

  // 使用 textContent 安全插入用户输入（XSS 防护）
  dialog.querySelector('.imds-confirm-message-title').textContent = dialogTitle;
  dialog.querySelector('.imds-confirm-cancel-button').textContent = cancelText;
  dialog.querySelector('.imds-confirm-ok-button').textContent = okText;

  // 使 message 中的换行符可以换行显示
  const contentElement = dialog.querySelector('.imds-confirm-message-content');
  const lines = String(message).split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) contentElement.appendChild(document.createElement('br'));
    contentElement.appendChild(document.createTextNode(lines[i]));
  }

  document.body.appendChild(dialog);

  return new Promise(function(resolve) {
    let settled = false;

    function close(result) {
      if (settled) return;
      settled = true;
      imdsConfirm._active = false;
      dialog.close();
      document.body.removeChild(dialog);
      resolve(result);
    }

    // 确定按钮
    dialog.querySelector('.imds-confirm-ok-button').addEventListener('click', function() {
      if (typeof onOk === 'function') onOk();
      close(true);
    });

    // 取消按钮
    dialog.querySelector('.imds-confirm-cancel-button').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // × 按钮（视为取消）
    dialog.querySelector('.imds-confirm-close').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // 通过 Escape 键关闭（视为取消）
    dialog.addEventListener('cancel', function(e) {
      e.preventDefault();
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    dialog.showModal();
  });
}

/** @type {boolean} 显示中标志（防止重复显示） */
imdsConfirm._active = false;
```

## 使用指南

显示确认消息时，请使用此 `imdsConfirm()`，而不是 `window.confirm()` 或 `imuiConfirm()`。

### mode 的使用区别

| mode | 用途 | 示例 |
|------|------|----|
| `info` | 普通确认。不涉及数据变更的操作，或可撤销操作的确认 | "是否使用这些条件进行搜索？" |
| `warning` | 实际数据将被更新且无法撤销时的确认 | "将把状态更改为已批准。此操作无法撤销，您确定吗？" |
| `danger` | 实际数据将被删除时的确认 | "将删除所选的3条数据。此操作无法撤销。" |

### 调用示例

```javascript
// 普通确认（省略 mode 时默认为 info）
imdsConfirm('是否执行处理？').then(function(result) {
  if (result) {
    // 确定时的处理
  }
});

// 更新确认（warning）
imdsConfirm(
  '将把状态更改为已批准。\n此操作无法撤销，您确定吗？',
  '更新确认',
  null,
  null,
  { mode: 'warning' }
).then(function(result) {
  if (result) {
    // 更新处理
  }
});

// 删除确认（danger）
imdsConfirm(
  '将删除所选数据。\n此操作无法撤销。',
  '删除确认',
  null,
  null,
  { mode: 'danger', okButton: { text: '删除' } }
).then(function(result) {
  if (result) {
    // 删除处理
  }
});
```

## 无障碍支持

- 如果按下确定按钮后的处理内容明确，请简洁地显示实际执行的内容
  - 示例：「新建」「更新」「删除」「搜索」
  - 默认：「执行」

## 实现注意事项

- 不能重复显示。如果已在显示中，第二次调用将立即以 `false` 解决
- `message` 中的 `\n` 显示为换行。不插入 HTML 标签（已进行 XSS 防护）
- `onOk` / `onCancel` 回调和 Promise 都可以使用，但不要混用，请统一使用基于 Promise 的方式
