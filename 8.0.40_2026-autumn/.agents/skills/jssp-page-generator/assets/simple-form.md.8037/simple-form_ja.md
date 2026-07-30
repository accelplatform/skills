# シンプルフォーム画面テンプレート

## 概要

シンプルな入力フォームとAPIを使用した登録機能を持つ基本的な画面構成のテンプレート。
画面初期表示時はサーバ側で取得した値をプレゼンテーションページに表示し、入力内容を保存するときは AJAX を使用する。
ユーザコードの初期値は、クエリパラメータから取得する。

## ファイル構成

```
src/main/jssp/src/simple_form/view/
  ├── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ

src/main/jssp/src/simple_form/api/
  └── register.js           # 登録API

src/main/conf/routing-jssp-config/
  └── simple_form.xml       # ルーティング設定
```

---

## ファンクションコンテナ（simple_form/view/index.js）

```javascript
/**
 * シンプルなフォーム画面
 *
 * @file index.js
 * @description ユーザコード、ユーザ名（姓・名）、年齢の入力を受け付けるフォームを構成します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = 'ユーザ登録・削除';
let $subTitle = 'ユーザ管理機能';
let $data = '{}';

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * 画面のURLにアクセスされたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  // メイン処理を実行
  let response = main(request);

  // JSON 形式で $data に格納
  // JSON 内に </script> が含まれていると、スクリプトが終了してしまうため、
  // レスポンス中の '/' を '\/' に全置換する
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// メイン処理
// ========================================
/**
 * メイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // エラーコード
      message: ''               // エラーメッセージ
    }
  };

  try {
    // リクエストパラメータのバリデーション
    validateRequest(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E001', 'リクエストパラメータが不正です。');
    return response;
  }

  try {
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E002', '予期しないエラーが発生しました。');
    return response;
  }

  return response;
}

// ========================================
// バリデーション
// ========================================
/**
 * リクエストパラメータの検証を行います。
 * リクエストパラメータのうち、誤ってはいけないものをチェックします。
 *
 * @param {Object} request - リクエストパラメータ
 */
function validateRequest(request) {
  // 特になし
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let result = {
    userCode: '',               // ユーザコード
    userFirstName: '',          // ユーザ名（名）
    userLastName: '',           // ユーザ名（姓）
    age: ''                     // 年齢
  };

  // リクエストパラメータの取得
  let userCode = request['userCode'];
  if (userCode != null) {
    result.userCode = userCode;
  }

  return result;
}

// ========================================
// エラーページ遷移
// ========================================
/**
 * エラーが発生したときにエラーメッセージを全画面に表示します。
 *
 * @param {String} code - エラーコード
 * @param {String} message - エラーメッセージ
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## プレゼンテーションページ（simple_form/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- プレゼンテーションページのスクリプト（$data をグローバル領域に置かず IIFE でスコープ化する） -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      // バリデーションチェック常時実行フラグ
      let activeValidation = false;

      // 確認ダイアログの表示
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
              '<button class="imds-confirm-close imds-button is-ghost" aria-label="閉じる">' +
                '<span class="imds-icon" aria-hidden="true"><i class="fa-solid fa-xmark"></i></span>' +
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
        const contentEl = dialog.querySelector('.imds-confirm-message-content');
        const lines = String(message).split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) contentEl.appendChild(document.createElement('br'));
          contentEl.appendChild(document.createTextNode(lines[i]));
        }

        // ダイアログを開く前にトリガ要素を記憶（閉じた後にフォーカスを戻すため）
        const triggerElement = document.activeElement;

        // ARIA 属性
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        const titleId = 'imds-confirm-title-' + Date.now();
        dialog.setAttribute('aria-labelledby', titleId);
        dialog.querySelector('.imds-confirm-message-title').id = titleId;

        document.body.appendChild(dialog);

        return new Promise(function(resolve) {
          let settled = false;

          function close(result) {
            if (settled) return;
            settled = true;
            imdsConfirm._active = false;
            dialog.removeEventListener('keydown', onKeyDown);
            dialog.close();
            document.body.removeChild(dialog);
            // トリガ要素にフォーカスを戻す
            if (triggerElement && typeof triggerElement.focus === 'function') {
              triggerElement.focus();
            }
            resolve(result);
          }

          const okButton = dialog.querySelector('.imds-confirm-ok-button');
          const cancelButton = dialog.querySelector('.imds-confirm-cancel-button');
          const closeButton = dialog.querySelector('.imds-confirm-close');

          // 決定ボタン
          okButton.addEventListener('click', function() {
            if (typeof onOk === 'function') onOk();
            close(true);
          });

          // キャンセルボタン
          cancelButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // × ボタン (キャンセル扱い)
          closeButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // Escape キーによる閉じ (キャンセル扱い)
          dialog.addEventListener('cancel', function(e) {
            e.preventDefault();
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // キーボード操作
          // - Enter:  OK ボタンとして確定（キャンセル/× にフォーカスがある場合はそのボタンの動作を優先）
          // - Tab:    ネイティブ dialog がフォーカストラップを行うので追加実装不要
          // - Escape: cancel イベントでハンドリング済み
          function onKeyDown(e) {
            if (e.key === 'Enter') {
              const focused = document.activeElement;
              if (focused === cancelButton || focused === closeButton) {
                return;
              }
              e.preventDefault();
              okButton.click();
            }
          }
          dialog.addEventListener('keydown', onKeyDown);

          dialog.showModal();

          // 初期フォーカス
          // - danger モード: 誤操作防止のためキャンセルボタンへ
          // - それ以外:      OK ボタンへ
          setTimeout(function() {
            if (mode === 'danger') {
              cancelButton.focus();
            } else {
              okButton.focus();
            }
          }, 0);
        });
      }

      /** @type {boolean} 表示中フラグ (二重表示防止) */
      imdsConfirm._active = false;

      // セキュアトークン取得
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // 画面の初期表示
      function initializeView(result) {
        document.getElementById(':userCode:').value = result.userCode;
        document.getElementById(':userFirstName:').value = result.userFirstName;
        document.getElementById(':userLastName:').value = result.userLastName;
        document.getElementById(':age:').value = result.age;
      }

      // バリデーションの表示初期化
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });

        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // バリデーションエラー表示
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
        });

        // バリデーションチェックを常時実行
        activeValidation = true;
      }

      // バリデーション（ロジックをここに集約。resetValidationError と validateCurrentStep の両方から呼ばれる）
      function getValidationErrors() {
        const errors = [];

        // ユーザコード：必須、最大100文字
        const userCode = document.getElementById(':userCode:').value;
        if (!userCode || userCode.length === 0) {
          errors.push({name: 'userCode', message: 'ユーザコードは必須です。'});
        } else if (userCode.length > 100) {
          errors.push({name: 'userCode', message: 'ユーザコードは最大100文字です。'});
        }

        // ユーザ名（姓）：必須、最大30文字
        const userLastName = document.getElementById(':userLastName:').value;
        if (!userLastName || userLastName.length === 0) {
          errors.push({name: 'userLastName', message: '姓は必須です。'});
        } else if (userLastName.length > 30) {
          errors.push({name: 'userLastName', message: '姓は最大30文字です。'});
        }

        // ユーザ名（名）：必須、最大30文字
        const userFirstName = document.getElementById(':userFirstName:').value;
        if (!userFirstName || userFirstName.length === 0) {
          errors.push({name: 'userFirstName', message: '名は必須です。'});
        } else if (userFirstName.length > 30) {
          errors.push({name: 'userFirstName', message: '名は最大30文字です。'});
        }

        return errors;
      }

      // リクエストパラメータを作成
      function createRequest() {
        return {
          userCode: document.getElementById(':userCode:').value,
          userFirstName: document.getElementById(':userFirstName:').value,
          userLastName: document.getElementById(':userLastName:').value,
          age: document.getElementById(':age:').value
        };
      }

      // バリデーションエラーのリセット（一度エラーが出た後、入力変更時に再チェックして表示を更新する）
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        } else {
          return true;
        }
      }

      // 登録処理
      async function register(request) {
        // サーバ側へ送信
        const response = await fetch('sample/simple_form/api/register', {
          method: 'POST',
          headers: {
            'X-Intramart-Secure-Token': getSecureToken()
          },
          body: new URLSearchParams(request)
        });

        // レスポンス（API は 4xx/5xx でも {error: true, errorMessage} 形式の JSON を返す想定）
        // プロキシエラー等で JSON 以外が返ったときは null にフォールバックする
        const result = await response.json().catch(() => null);
        if (!result) {
          imuiShowErrorMessage('システムエラーが発生しました。');
          return false;
        }
        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        imuiShowSuccessMessage('ユーザ登録に成功しました。');
        return true;
      }

      // 入力要素 入力値変更時イベント
      document.getElementById(':userCode:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });
      document.getElementById(':userLastName:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });
      document.getElementById(':userFirstName:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });

      // 登録ボタン クリック時イベント
      document.getElementById('register-button').addEventListener('click', () => {
        // パラメータ情報の作成
        const request = createRequest();

        // バリデーション実行
        if (!resetValidationError()) return;

        // 確認メッセージ
        imdsConfirm(
          '登録してもよろしいですか？',
          '登録',
          async () => {
            const isSuccess = await register(request);
            if (isSuccess) {
              clearValidationError();
            }
          }
        );
      });

      // エントリーポイント
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ページ全体のコンテナ -->
<div id="container">
  <div class="imds-container">
    <!-- ヘッダ -->
    <header class="imds-header">
      <div class="imds-header-back-button">
        <button type="button" class="imds-button is-ghost is-large">
          <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
        </button>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main>
      <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">基本情報</h2>
          <div class="imds-field-container has-accent-color">
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必須">ユーザコード</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":userCode:">
                  <div class="imds-field-control">
                    <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                  </div>
                  <span class="imds-error-text" for=":userCode:">エラーメッセージをここに表示します。</span>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必須">氏名</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field-group">
                  <div class="imds-field-group-control is-horizontal">
                    <div class="imds-field" for=":userLastName:">
                      <div class="imds-field-label">
                        <label for=":userLastName:">姓</label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userLastName:" class="imds-textbox" name="userLastName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userLastName:">エラーメッセージをここに表示します。</span>
                    </div>
                    <div class="imds-field" for=":userFirstName:">
                      <div class="imds-field-label">
                        <label for=":userFirstName:">名</label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userFirstName:" class="imds-textbox" name="userFirstName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userFirstName:">エラーメッセージをここに表示します。</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label"><span>その他情報</span></div>
              <div class="imds-field-group-control is-horizontal">
                <div class="imds-field" for=":age:">
                  <div class="imds-field-label">
                    <label for=":age:">年齢</label>
                  </div>
                  <div class="imds-field-control">
                    <select id=":age:" class="imds-select" name="age">
                      <option value="">選択してください</option>
                      <option value="10">10代</option>
                      <option value="20">20代</option>
                      <option value="30">30代</option>
                      <option value="40">40代</option>
                      <option value="50">50代</option>
                      <option value="60">60代以上</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="register-button" class="imds-button is-primary" style="min-width: 8em;">登録</button>
        <button type="button" id="temporary-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">一時保存</button>
        <button type="button" id="delete-button" class="imds-button is-outlined is-danger" style="min-width: 8em;">削除</button>
      </div>
    </main>
  </div>
</div>
```

---

## 登録API（simple_form/api/register.js）

```javascript
/**
 * ユーザ登録API
 *
 * @file register.js
 * @description ユーザコード、ユーザ名（姓・名）、年齢の入力を受け付け、データベースに登録します。
 */

// ========================================
// 定数定義
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// エントリーポイント
// ========================================
/**
 * APIのエントリーポイントです。
 * APIが呼び出されたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP メソッドのチェック (405)
    checkMethod(request);
    // セキュアトークン検証 (400)
    verifySecureToken(request);
    // リクエストパラメータのバリデーション (400)
    validateRequest(request);
    // ビジネスロジックのメイン処理を実行（例外時は 500）
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[register] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[register] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // JSON 形式で返却
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

// ========================================
// メソッド・セキュアトークン・バリデーション
// ========================================
/**
 * HTTP メソッドが許可されているかチェックします。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

/**
 * セキュアトークン（CSRF 対策）の検証を行います。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが指定されていません。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンの検証に失敗しました。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが不正です。');
  }
}

/**
 * リクエストパラメータの検証を行います。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function validateRequest(request) {
  // ユーザコード：必須、最大100文字
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throwValidationError('userCode は必須です。');
  } else if (userCode.length > 100) {
    throwValidationError('userCode は最大100文字です。');
  }

  // ユーザ名（姓）：必須、最大30文字
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throwValidationError('userLastName は必須です。');
  } else if (userLastName.length > 30) {
    throwValidationError('userLastName は最大30文字です。');
  }

  // ユーザ名（名）：必須、最大30文字
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throwValidationError('userFirstName は必須です。');
  } else if (userFirstName.length > 30) {
    throwValidationError('userFirstName は最大30文字です。');
  }
}

/**
 * バリデーションエラー（400）をスローします。
 *
 * @param {string} message - エラーメッセージ
 */
function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

/**
 * エラーコード・HTTP ステータス付きで例外をスローします。
 *
 * @param {string} code - エラーコード
 * @param {number} httpStatus - HTTP ステータスコード
 * @param {string} message - エラーメッセージ
 */
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let result = {
    userCode: '',               // ユーザコード
    userFirstName: '',          // ユーザ名（名）
    userLastName: '',           // ユーザ名（姓）
    age: ''                     // 年齢
  };

  // リクエストパラメータの取得
  let request = {
    userCode: request['userCode'],
    userFirstName: request['userFirstName'],
    userLastName: request['userLastName'],
    age: request['age']
  };

  // TODO: ここで、parameter の値を使用し、データベースへの登録処理を行ってください

  return result;
}
```

---

## ルーティング設定（simple_form.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- プレゼンテーションページ -->
  <file-mapping path="/sample/simple_form" page="sample/simple_form/view/index">
    <authz uri="service://sample/simple_form" action="execute" />
  </file-mapping>

  <!-- AJAX 通信用 REST-API -->
  <file-mapping path="/sample/simple_form/api/register" page="sample/simple_form/api/register">
    <authz uri="service://sample/simple_form/api/register" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 使用可能なテンプレート

- **シンプルフォーム**: [assets/simple-form.md](assets/simple-form.md)
  - intra-mart Design System（imds）のテーマを適用した画面
  - テキスト入力を複数用意したフォーム入力
  - 登録は REST-API で実行

### 生成時の指示例

ユーザが「フォーム画面を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。

---

## バリデーションパターン集

`getValidationErrors()` 内で使用する各種チェックのスニペット。
DOM から直接値を読み取るパターンで統一する。

### 文字列長チェック（上限・下限）

```javascript
const value = document.getElementById(':fieldName:').value;
if (value.length > 200) {
  errors.push({ name: 'fieldName', message: 'fieldName は最大200文字です。' });
} else if (value.length < 8) {
  errors.push({ name: 'fieldName', message: 'fieldName は8文字以上で入力してください。' });
}
```

### 数値チェック（NaN・範囲）

```javascript
const value = document.getElementById(':age:').value;
if (value !== '') {
  const num = Number(value);
  if (isNaN(num)) {
    errors.push({ name: 'age', message: '年齢は数値で入力してください。' });
  } else if (num < 0 || num > 150) {
    errors.push({ name: 'age', message: '年齢は0〜150の範囲で入力してください。' });
  }
}
```

### 正規表現パターンマッチング

```javascript
const value = document.getElementById(':code:').value;
if (value && !/^[A-Za-z0-9_-]+$/.test(value)) {
  errors.push({ name: 'code', message: 'コードは半角英数字・ハイフン・アンダースコアのみ使用できます。' });
}
```

### メールアドレス形式

```javascript
const value = document.getElementById(':email:').value;
if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  errors.push({ name: 'email', message: 'メールアドレスの形式が正しくありません。' });
}
```

### 日付形式（YYYY-MM-DD）

```javascript
const value = document.getElementById(':startDate:').value;
if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
  errors.push({ name: 'startDate', message: '開始日は YYYY-MM-DD 形式で入力してください。' });
}
```

### 任意項目（値がある場合のみチェック）

```javascript
const value = document.getElementById(':memo:').value;
if (value && value.length > 500) {
  errors.push({ name: 'memo', message: 'メモは最大500文字です。' });
}
```

### 日付の前後関係チェック

```javascript
const startDate = document.getElementById(':startDate:').value;
const endDate = document.getElementById(':endDate:').value;
if (startDate && endDate && startDate > endDate) {
  errors.push({ name: 'endDate', message: '終了日は開始日以降を指定してください。' });
}
```
