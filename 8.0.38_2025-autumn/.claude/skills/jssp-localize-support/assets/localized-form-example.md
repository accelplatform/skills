# 多言語化済みフォーム画面の実装例

ユーザ登録フォーム画面を多言語化した完全な実装例。
ハードコードされた日本語文字列を全てメッセージプロパティに外部化している。

## ファイル構成

```
src/main/
├── jssp/simple_form_localized/
│   ├── view/
│   │   ├── index.html                  # プレゼンテーションページ
│   │   └── index.js                    # ファンクションコンテナ（画面用）
│   └── api/
│       └── register.js                 # ファンクションコンテナ（API用）
└── conf/message/simple_form_localized/
    ├── caption.properties              # キャプション（デフォルト=英語）
    ├── caption_ja.properties           # キャプション（日本語）
    ├── caption_en.properties           # キャプション（英語）
    ├── caption_zh_CN.properties        # キャプション（中国語）
    ├── message.properties              # メッセージ（デフォルト=英語）
    ├── message_ja.properties           # メッセージ（日本語）
    ├── message_en.properties           # メッセージ（英語）
    ├── message_zh_CN.properties        # メッセージ（中国語）
    ├── log-message.properties          # ログメッセージ（デフォルト=英語）
    ├── log-message_ja.properties       # ログメッセージ（日本語）
    ├── log-message_en.properties       # ログメッセージ（英語）
    └── log-message_zh_CN.properties    # ログメッセージ（中国語）
```

---

## メッセージプロパティファイル

### caption_ja.properties（日本語キャプション）

```properties
CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE=\u30e6\u30fc\u30b6\u767b\u9332\u30fb\u524a\u9664
CAP.Z.IWP.SKILLS.SIMPLE.FORM.SUBTITLE=\u30e6\u30fc\u30b6\u7ba1\u7406\u6a5f\u80fd
CAP.Z.IWP.SKILLS.SIMPLE.FORM.BASIC.INFO=\u57fa\u672c\u60c5\u5831
CAP.Z.IWP.SKILLS.SIMPLE.FORM.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED=\u5fc5\u9808
CAP.Z.IWP.SKILLS.SIMPLE.FORM.FULL.NAME=\u6c0f\u540d
CAP.Z.IWP.SKILLS.SIMPLE.FORM.LAST.NAME=\u59d3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.FIRST.NAME=\u540d
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE=\u767b\u9332\u65e5
CAP.Z.IWP.SKILLS.SIMPLE.FORM.OTHER.INFO=\u305d\u306e\u4ed6\u60c5\u5831
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE=\u5e74\u9f62
CAP.Z.IWP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER=\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.10S=10\u4ee3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.20S=20\u4ee3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.30S=30\u4ee3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.40S=40\u4ee3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.50S=50\u4ee3
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS=60\u4ee3\u4ee5\u4e0a
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTER=\u767b\u9332
CAP.Z.IWP.SKILLS.SIMPLE.FORM.TEMP.SAVE=\u4e00\u6642\u4fdd\u5b58
CAP.Z.IWP.SKILLS.SIMPLE.FORM.DELETE=\u524a\u9664
```

### caption_en.properties / caption.properties（英語キャプション）

```properties
CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE=User Registration / Deletion
CAP.Z.IWP.SKILLS.SIMPLE.FORM.SUBTITLE=User Management
CAP.Z.IWP.SKILLS.SIMPLE.FORM.BASIC.INFO=Basic Information
CAP.Z.IWP.SKILLS.SIMPLE.FORM.USER.CODE=User Code
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED=Required
CAP.Z.IWP.SKILLS.SIMPLE.FORM.FULL.NAME=Full Name
CAP.Z.IWP.SKILLS.SIMPLE.FORM.LAST.NAME=Last Name
CAP.Z.IWP.SKILLS.SIMPLE.FORM.FIRST.NAME=First Name
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE=Registration Date
CAP.Z.IWP.SKILLS.SIMPLE.FORM.OTHER.INFO=Other Information
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE=Age
CAP.Z.IWP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER=Please select
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.10S=10s
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.20S=20s
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.30S=30s
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.40S=40s
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.50S=50s
CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS=60s and above
CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTER=Register
CAP.Z.IWP.SKILLS.SIMPLE.FORM.TEMP.SAVE=Save Draft
CAP.Z.IWP.SKILLS.SIMPLE.FORM.DELETE=Delete
```

### message_ja.properties（日本語メッセージ）

```properties
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9\u306f\u6700\u5927100\u6587\u5b57\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME=\u59d3\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME=\u59d3\u306f\u6700\u592730\u6587\u5b57\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME=\u540d\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME=\u540d\u306f\u6700\u592730\u6587\u5b57\u3067\u3059\u3002
MSG.C.IWP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER=\u767b\u9332\u3057\u3066\u3082\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f
MSG.I.IWP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS=\u30e6\u30fc\u30b6\u767b\u9332\u306b\u6210\u529f\u3057\u307e\u3057\u305f\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR=\u30b7\u30b9\u30c6\u30e0\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.INVALID.REQUEST=\u30ea\u30af\u30a8\u30b9\u30c8\u30d1\u30e9\u30e1\u30fc\u30bf\u304c\u4e0d\u6b63\u3067\u3059\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR=\u4e88\u671f\u3057\u306a\u3044\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002
MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE=\u30b7\u30b9\u30c6\u30e0\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f
```

### message_en.properties / message.properties（英語メッセージ）

```properties
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE=User Code is required.
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE=User Code must be 100 characters or less.
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME=Last Name is required.
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME=Last Name must be 30 characters or less.
MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME=First Name is required.
MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME=First Name must be 30 characters or less.
MSG.C.IWP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER=Are you sure you want to register?
MSG.I.IWP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS=User registration was successful.
MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR=A system error has occurred.
MSG.E.IWP.SKILLS.SIMPLE.FORM.INVALID.REQUEST=Invalid request parameters.
MSG.E.IWP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR=An unexpected error has occurred.
MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE=System Error
```

### log-message_ja.properties（日本語ログメッセージ）

```properties
E.IWP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
E.IWP.SKILLS.SIMPLE.FORM.00002=\u30e6\u30fc\u30b6\u767b\u9332\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

### log-message_en.properties / log-message.properties（英語ログメッセージ）

```properties
E.IWP.SKILLS.SIMPLE.FORM.00001=An error occurred during page rendering. {0}
E.IWP.SKILLS.SIMPLE.FORM.00002=An error occurred during user registration. {0}
```

---

## ソースコード

### view/index.html（プレゼンテーションページ）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /> - <imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.SUBTITLE" escapeXml="true" escapeJs="false" /></title>
  <!-- プレゼンテーションページ連携用のバインド変数 -->
  <script>const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;</script>
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
  .button-spacing {
    display: flex;
    gap: 3em;
  }
  </style>
  <!-- プレゼンテーションページのスクリプト -->
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    // 画面の初期表示
    function initializeView(result) {
      document.getElementById(':userCode:').value = result.userCode;
      document.getElementById(':userFirstName:').value = result.userFirstName;
      document.getElementById(':userLastName:').value = result.userLastName;
      document.getElementById(':age:').value = result.age;
      document.getElementById(':registrationDate:').value = result.registrationDate || '';
    }

    // セキュアトークン取得
    function getSecureToken() {
      return document.querySelector('input[name=im_secure_token]').value;
    }

    // バリデーションの表示初期化
    function clearValidationError() {
      document.querySelectorAll('.imds-error-text').forEach((element) => {
        element.style.display = 'none';
      });
    }

    // バリデーション
    // ★ JavaScript 内のメッセージは escapeXml="false" escapeJs="true" で埋め込む
    function validateRequest(request) {
      const errors = [];

      const userCode = request.userCode;
      if (!userCode || userCode.length === 0) {
        errors.push({name: 'userCode', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE" escapeXml="false" escapeJs="true" />'});
      } else if (userCode.length > 100) {
        errors.push({name: 'userCode', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE" escapeXml="false" escapeJs="true" />'});
      }

      const userLastName = request.userLastName;
      if (!userLastName || userLastName.length === 0) {
        errors.push({name: 'userLastName', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME" escapeXml="false" escapeJs="true" />'});
      } else if (userLastName.length > 30) {
        errors.push({name: 'userLastName', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME" escapeXml="false" escapeJs="true" />'});
      }

      const userFirstName = request.userFirstName;
      if (!userFirstName || userFirstName.length === 0) {
        errors.push({name: 'userFirstName', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME" escapeXml="false" escapeJs="true" />'});
      } else if (userFirstName.length > 30) {
        errors.push({name: 'userFirstName', message: '<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME" escapeXml="false" escapeJs="true" />'});
      }

      return errors;
    }

    // バリデーションエラー表示
    function showValidationError(errors) {
      errors.forEach((error) => {
        const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.style.display = '';
        }
      });
    }

    // 登録処理
    async function register(request) {
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
        imuiShowErrorMessage('<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
        return false;
      }
      if (result.error) {
        imuiShowErrorMessage(result.errorMessage);
        return false;
      }

      imuiShowSuccessMessage('<imart type="message" id="MSG.I.IWP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS" escapeXml="false" escapeJs="true" />');
      return true;
    }

    // イベント
    document.getElementById('register-button').addEventListener('click', () => {
      const request = {
        userCode: document.getElementById(':userCode:').value,
        userFirstName: document.getElementById(':userFirstName:').value,
        userLastName: document.getElementById(':userLastName:').value,
        age: document.getElementById(':age:').value,
        registrationDate: document.getElementById(':registrationDate:').value
      };

      clearValidationError();
      const errors = validateRequest(request);
      if (errors.length > 0) {
        showValidationError(errors);
        return false;
      }

      // ★ 確認ダイアログのメッセージとタイトルも多言語化
      imuiConfirm(
        '<imart type="message" id="MSG.C.IWP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER" escapeXml="false" escapeJs="true" />',
        '<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTER" escapeXml="false" escapeJs="true" />',
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
  </script>
</imart>

<!-- ページ全体のコンテナ -->
<!-- ★ HTML 内のラベルは escapeXml="true" escapeJs="false" で埋め込む -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-back-button">
        <button type="button" class="imds-button is-ghost is-large">
          <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
        </button>
      </div>
      <div class="imds-header-title">
        <p><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.SUBTITLE" escapeXml="true" escapeJs="false" /></p>
        <h1><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
      </div>
    </header>

    <main>
      <!-- セキュアトークン -->
      <imart type="imSecureToken" />

      <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.BASIC.INFO" escapeXml="true" escapeJs="false" /></h2>
          <div class="imds-field-container has-accent-color">
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <!-- ★ HTML 属性内にもメッセージタグを埋め込める -->
                <span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.USER.CODE" escapeXml="true" escapeJs="false" /></span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                  </div>
                  <!-- ★ エラーテキストは JS で動的に設定されるため空にする -->
                  <span class="imds-error-text" for=":userCode:"></span>
                </div>
              </div>
            </div>

            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.FULL.NAME" escapeXml="true" escapeJs="false" /></span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field-group">
                  <div class="imds-field-group-control is-horizontal">
                    <div class="imds-field">
                      <div class="imds-field-label">
                        <label for=":userLastName:"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.LAST.NAME" escapeXml="true" escapeJs="false" /></label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userLastName:" class="imds-textbox" name="userLastName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userLastName:"></span>
                    </div>
                    <div class="imds-field">
                      <div class="imds-field-label">
                        <label for=":userFirstName:"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.FIRST.NAME" escapeXml="true" escapeJs="false" /></label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userFirstName:" class="imds-textbox" name="userFirstName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userFirstName:"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE" escapeXml="true" escapeJs="false" /></span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":registrationDate:" class="imds-textbox" name="registrationDate" value="" style="max-width: 10em;" />
                    <imart type="imuiCalendar" floatable="true" altField="#\\:registrationDate\\:" format="yyyy/MM/dd" />
                  </div>
                  <span class="imds-error-text" for=":registrationDate:"></span>
                </div>
              </div>
            </div>

            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label"><span><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.OTHER.INFO" escapeXml="true" escapeJs="false" /></span></div>
              <div class="imds-field-group-control is-horizontal">
                <div class="imds-field">
                  <div class="imds-field-label">
                    <label for=":age:"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE" escapeXml="true" escapeJs="false" /></label>
                  </div>
                  <div class="imds-field-control">
                    <select id=":age:" class="imds-select" name="age">
                      <option value=""><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER" escapeXml="true" escapeJs="false" /></option>
                      <option value="10"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.10S" escapeXml="true" escapeJs="false" /></option>
                      <option value="20"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.20S" escapeXml="true" escapeJs="false" /></option>
                      <option value="30"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.30S" escapeXml="true" escapeJs="false" /></option>
                      <option value="40"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.40S" escapeXml="true" escapeJs="false" /></option>
                      <option value="50"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.50S" escapeXml="true" escapeJs="false" /></option>
                      <option value="60"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS" escapeXml="true" escapeJs="false" /></option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>

      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="register-button" class="imds-button is-primary" style="min-width: 8em;"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REGISTER" escapeXml="true" escapeJs="false" /></button>
        <button type="button" id="temporary-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TEMP.SAVE" escapeXml="true" escapeJs="false" /></button>
        <button type="button" id="delete-button" class="imds-button is-outlined is-danger" style="min-width: 8em;"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.DELETE" escapeXml="true" escapeJs="false" /></button>
      </div>
    </main>
  </div>
</div>
```

### view/index.js（ファンクションコンテナ - 画面用）

```javascript
/**
 * シンプルなフォーム画面（多言語化版）
 */

// バインド変数
// ★ $title, $subTitle は HTML 側で <imart type="message"> を直接使うため不要になり削除済み
let $data = '{}';

function init(request) {
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function main(request) {
  let response = {
    result: null,
    error: { code: '', message: '' }
  };

  try {
    validateRequest(request);
  } catch (e) {
    // ★ ログメッセージはプレースホルダ {0} 付きで定義し、引数で置換
    Logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00001', e.message));
    transferErrorPage('E001', MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.INVALID.REQUEST'));
    return response;
  }

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    Logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00001', e.message));
    transferErrorPage('E002', MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR'));
    return response;
  }

  return response;
}

function validateRequest(request) {
  // 特になし
}

function processBusinessLogic(request) {
  let result = {
    userCode: '',
    userFirstName: '',
    userLastName: '',
    age: ''
  };

  let userCode = request['userCode'];
  if (userCode != null) {
    result.userCode = userCode;
  }

  return result;
}

function transferErrorPage(code, message) {
  let param = {
    // ★ エラーページのタイトルも多言語化
    title: MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE'),
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

### api/register.js（ファンクションコンテナ - API用）

```javascript
/**
 * ユーザ登録API（多言語化版）
 */

// ========================================
// 定数定義
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SKILLS.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SKILLS.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SKILLS.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.SKILLS.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// エントリーポイント
// ========================================
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
    let message = apiError.message || MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR');

    if (statusCode >= 500) {
      // ★ ログメッセージも多言語化
      logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00002', message));
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
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.TOKEN.NOT.SPECIFIED'));
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.INVALID.TOKEN'));
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.INVALID.TOKEN'));
  }
}

// ★ バリデーションメッセージも多言語化
function validateRequest(request) {
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE'));
  } else if (userCode.length > 100) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE'));
  }

  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME'));
  } else if (userLastName.length > 30) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME'));
  }

  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME'));
  } else if (userFirstName.length > 30) {
    throwValidationError(MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME'));
  }
}

function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

function processBusinessLogic(request) {
  let result = {
    userCode: '',
    userFirstName: '',
    userLastName: '',
    age: ''
  };

  let parameters = {
    userCode: request['userCode'],
    userFirstName: request['userFirstName'],
    userLastName: request['userLastName'],
    age: request['age']
  };

  // ここで、parameter の値を使用し、データベースへの登録処理を行ってください

  return result;
}
```
