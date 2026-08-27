---
paths:
  - "src/main/jssp/**/*.html"
---

# imdsConfirm（JavaScript API）

## 基本情報

imds テーマで確認ダイアログを表示する。
imuiConfirm と API 呼び出しに互換性があるため、imuiConfirm が使用済みであれば imdsConfirm に置き換えができる。

## ⚠️ 重要: 関数定義は各ページに必ず含めること

`imdsConfirm` 関数は **共通処理（テーマやプラットフォーム）から自動的に提供されない**。
本リファレンス下記の「JavaScript コード」セクションにある関数定義一式（`function imdsConfirm(...)` と末尾の `imdsConfirm._active = false;`）を、`imdsConfirm` を呼び出す **各プレゼンテーションページごとに** `<script>` 内へコピーする必要がある。

- 既存ページに `imdsConfirm` の自前実装が記述されているのを見つけても、「重複している」「共通化されているはず」と判断して **削除してはならない**。削除するとそのページの確認ダイアログが動かなくなる
- 共通化したい場合でも、別ファイルへの切り出しは行わず、各ページに同じ関数定義を保持する運用が前提
- 関数の中身（HTML 生成・イベント・Promise 化等）は本リファレンスのコードと厳密に一致させること。差異があると見た目や挙動が崩れる

## JavaScript コード

```javascript
/**
 * 確認ダイアログを表示し、ユーザの選択結果を返す。
 *
 * @param {string} message - 本文
 * @param {string} [title='確認'] - タイトル
 * @param {Function} [onOk] - 決定ボタン押下時のコールバック
 * @param {Function} [onCancel] - キャンセルボタン押下時のコールバック
 * @param {Object} [options]
 * @param {'info'|'danger'|'warning'} [options.mode='info'] - ダイアログの種別
 * @param {{text?: string}} [options.okButton] - 決定ボタンのオプション
 * @param {{text?: string}} [options.cancelButton] - キャンセルボタンのオプション
 * @returns {Promise<boolean>} 決定ボタン押下時 true、キャンセル押下時 false
 */
function imdsConfirm(message, title, onOk, onCancel, options) {
  // 既に表示中の場合は即 false で返す
  if (imdsConfirm._active) {
    return Promise.resolve(false);
  }
  imdsConfirm._active = true;

  const VALID_MODES = ['info', 'danger', 'warning'];
  let mode = (options && options.mode) || 'info';
  if (!VALID_MODES.includes(mode)) mode = 'info';

  const okText = (options && options.okButton && options.okButton.text) || '実行';
  const cancelText = (options && options.cancelButton && options.cancelButton.text) || 'キャンセル';
  const dialogTitle = title || '確認';

  // モード別の設定
  const iconClass = mode === 'info' ? 'fa-circle-question' : 'fa-triangle-exclamation';
  const okButtonClass = mode === 'danger' ? 'imds-button is-danger' : 'imds-button is-primary';

  // dialog 要素を生成
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

  // textContent でユーザ入力を安全に差し込む (XSS 対策)
  dialog.querySelector('.imds-confirm-message-title').textContent = dialogTitle;
  dialog.querySelector('.imds-confirm-cancel-button').textContent = cancelText;
  dialog.querySelector('.imds-confirm-ok-button').textContent = okText;

  // message は改行コードで改行できるようにする
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

    // 決定ボタン
    dialog.querySelector('.imds-confirm-ok-button').addEventListener('click', function() {
      if (typeof onOk === 'function') onOk();
      close(true);
    });

    // キャンセルボタン
    dialog.querySelector('.imds-confirm-cancel-button').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // × ボタン (キャンセル扱い)
    dialog.querySelector('.imds-confirm-close').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // Escape キーによる閉じ (キャンセル扱い)
    dialog.addEventListener('cancel', function(e) {
      e.preventDefault();
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    dialog.showModal();
  });
}

/** @type {boolean} 表示中フラグ (二重表示防止) */
imdsConfirm._active = false;
```

## 使用ガイドライン

確認メッセージを表示する場合は、`window.confirm()` や `imuiConfirm()` ではなく、この `imdsConfirm()` を使用すること。

### mode の使い分け

| mode | 用途 | 例 |
|------|------|----|
| `info` | 通常の確認。データの変更を伴わない操作や、UNDO 可能な操作の確認 | 「この内容で検索しますか？」 |
| `warning` | 実データが更新され、UNDO できない場合の確認 | 「ステータスを承認済みに変更します。元に戻せません。よろしいですか？」 |
| `danger` | 実データが削除される場合の確認 | 「選択した3件のデータを削除します。この操作は元に戻せません。」 |

### 呼び出し例

```javascript
// 通常の確認（mode 省略時は info）
imdsConfirm('処理を実行しますか？').then(function(result) {
  if (result) {
    // 決定時の処理
  }
});

// 更新確認（warning）
imdsConfirm(
  'ステータスを承認済みに変更します。\nこの操作は元に戻せません。よろしいですか？',
  '更新確認',
  null,
  null,
  { mode: 'warning' }
).then(function(result) {
  if (result) {
    // 更新処理
  }
});

// 削除確認（danger）
imdsConfirm(
  '選択したデータを削除します。\nこの操作は元に戻せません。',
  '削除確認',
  null,
  null,
  { mode: 'danger', okButton: { text: '削除' } }
).then(function(result) {
  if (result) {
    // 削除処理
  }
});
```

## アクセシビリティ対応

- 決定ボタン押下後の処理内容が明らかであれば、実際に処理される内容を端的に表示する
  - 例：「新規登録」「更新」「削除」「検索」
  - デフォルト：「実行」

## 実装上の注意

- 二重表示はできない。既に表示中の場合、2回目の呼び出しは即座に `false` で解決される
- `message` 内の `\n` は改行として表示される。HTML タグは挿入されない（XSS 対策済み）
- `onOk` / `onCancel` コールバックと Promise の両方が利用できるが、混在させず Promise ベースで統一すること
