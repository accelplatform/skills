# Localized Form Screen Implementation Example

A complete implementation example of a user registration form screen with multilingual support.
All hardcoded Japanese strings have been externalized to message properties.

## File Structure

```
src/main/
├── jssp/simple_form_localized/
│   ├── view/
│   │   ├── index.html                  # Presentation page
│   │   └── index.js                    # Function container (for screen)
│   └── api/
│       └── register.js                 # Function container (for API)
└── conf/message/simple_form_localized/
    ├── caption.properties              # Captions (default = English)
    ├── caption_ja.properties           # Captions (Japanese)
    ├── caption_en.properties           # Captions (English)
    ├── caption_zh_CN.properties        # Captions (Chinese)
    ├── message.properties              # Messages (default = English)
    ├── message_ja.properties           # Messages (Japanese)
    ├── message_en.properties           # Messages (English)
    ├── message_zh_CN.properties        # Messages (Chinese)
    ├── log-message.properties          # Log messages (default = English)
    ├── log-message_ja.properties       # Log messages (Japanese)
    ├── log-message_en.properties       # Log messages (English)
    └── log-message_zh_CN.properties    # Log messages (Chinese)
```

---

## Message Property Files

### caption_ja.properties (Japanese captions)

```properties
CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE=\u30e6\u30fc\u30b6\u767b\u9332\u30fb\u524a\u9664
CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE=\u30e6\u30fc\u30b6\u7ba1\u7406\u6a5f\u80fd
CAP.Z.APP.SKILLS.SIMPLE.FORM.BASIC.INFO=\u57fa\u672c\u60c5\u5831
CAP.Z.APP.SKILLS.SIMPLE.FORM.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9
CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED=\u5fc5\u9808
CAP.Z.APP.SKILLS.SIMPLE.FORM.FULL.NAME=\u6c0f\u540d
CAP.Z.APP.SKILLS.SIMPLE.FORM.LAST.NAME=\u59d3
CAP.Z.APP.SKILLS.SIMPLE.FORM.FIRST.NAME=\u540d
CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE=\u767b\u9332\u65e5
CAP.Z.APP.SKILLS.SIMPLE.FORM.OTHER.INFO=\u305d\u306e\u4ed6\u60c5\u5831
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE=\u5e74\u9f62
CAP.Z.APP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER=\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.10S=10\u4ee3
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.20S=20\u4ee3
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.30S=30\u4ee3
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.40S=40\u4ee3
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.50S=50\u4ee3
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS=60\u4ee3\u4ee5\u4e0a
CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTER=\u767b\u9332
CAP.Z.APP.SKILLS.SIMPLE.FORM.TEMP.SAVE=\u4e00\u6642\u4fdd\u5b58
CAP.Z.APP.SKILLS.SIMPLE.FORM.DELETE=\u524a\u9664
```

### caption_en.properties / caption.properties (English captions)

```properties
CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE=User Registration / Deletion
CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE=User Management
CAP.Z.APP.SKILLS.SIMPLE.FORM.BASIC.INFO=Basic Information
CAP.Z.APP.SKILLS.SIMPLE.FORM.USER.CODE=User Code
CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED=Required
CAP.Z.APP.SKILLS.SIMPLE.FORM.FULL.NAME=Full Name
CAP.Z.APP.SKILLS.SIMPLE.FORM.LAST.NAME=Last Name
CAP.Z.APP.SKILLS.SIMPLE.FORM.FIRST.NAME=First Name
CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE=Registration Date
CAP.Z.APP.SKILLS.SIMPLE.FORM.OTHER.INFO=Other Information
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE=Age
CAP.Z.APP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER=Please select
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.10S=10s
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.20S=20s
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.30S=30s
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.40S=40s
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.50S=50s
CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS=60s and above
CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTER=Register
CAP.Z.APP.SKILLS.SIMPLE.FORM.TEMP.SAVE=Save Draft
CAP.Z.APP.SKILLS.SIMPLE.FORM.DELETE=Delete
```

### message_ja.properties (Japanese messages)

```properties
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE=\u30e6\u30fc\u30b6\u30b3\u30fc\u30c9\u306f\u6700\u5927100\u6587\u5b57\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME=\u59d3\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME=\u59d3\u306f\u6700\u592730\u6587\u5b57\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME=\u540d\u306f\u5fc5\u9808\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME=\u540d\u306f\u6700\u592730\u6587\u5b57\u3067\u3059\u3002
MSG.C.APP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER=\u767b\u9332\u3057\u3066\u3082\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f
MSG.I.APP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS=\u30e6\u30fc\u30b6\u767b\u9332\u306b\u6210\u529f\u3057\u307e\u3057\u305f\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR=\u30b7\u30b9\u30c6\u30e0\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.INVALID.REQUEST=\u30ea\u30af\u30a8\u30b9\u30c8\u30d1\u30e9\u30e1\u30fc\u30bf\u304c\u4e0d\u6b63\u3067\u3059\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR=\u4e88\u671f\u3057\u306a\u3044\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002
MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE=\u30b7\u30b9\u30c6\u30e0\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f
```

### message_en.properties / message.properties (English messages)

```properties
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE=User Code is required.
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE=User Code must be 100 characters or less.
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME=Last Name is required.
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME=Last Name must be 30 characters or less.
MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME=First Name is required.
MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME=First Name must be 30 characters or less.
MSG.C.APP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER=Are you sure you want to register?
MSG.I.APP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS=User registration was successful.
MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR=A system error has occurred.
MSG.E.APP.SKILLS.SIMPLE.FORM.INVALID.REQUEST=Invalid request parameters.
MSG.E.APP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR=An unexpected error has occurred.
MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE=System Error
```

### log-message_ja.properties (Japanese log messages)

```properties
E.APP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
E.APP.SKILLS.SIMPLE.FORM.00002=\u30e6\u30fc\u30b6\u767b\u9332\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

### log-message_en.properties / log-message.properties (English log messages)

```properties
E.APP.SKILLS.SIMPLE.FORM.00001=An error occurred during page rendering. {0}
E.APP.SKILLS.SIMPLE.FORM.00002=An error occurred during user registration. {0}
```

---

## Source Code

### view/index.html (Presentation Page)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /> - <imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE" escapeXml="true" escapeJs="false" /></title>
  <!-- Custom styles for presentation page -->
  <style>
  .button-spacing {
    display: flex;
    gap: 3em;
  }
  </style>
  <!-- Scripts for presentation page (scope $data via IIFE instead of a global variable) -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize screen display
    function initializeView(result) {
      document.getElementById(':userCode:').value = result.userCode;
      document.getElementById(':userFirstName:').value = result.userFirstName;
      document.getElementById(':userLastName:').value = result.userLastName;
      document.getElementById(':age:').value = result.age;
      document.getElementById(':registrationDate:').value = result.registrationDate || '';
    }

    // Get secure token
    function getSecureToken() {
      return document.querySelector('input[name=im_secure_token]').value;
    }

    // Initialize validation display
    function clearValidationError() {
      document.querySelectorAll('.imds-error-text').forEach((element) => {
        element.style.display = 'none';
      });
    }

    // Validation
    // ★ Messages inside JavaScript are embedded with escapeXml="false" escapeJs="true"
    function validateRequest(request) {
      const errors = [];

      const userCode = request.userCode;
      if (!userCode || userCode.length === 0) {
        errors.push({name: 'userCode', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE" escapeXml="false" escapeJs="true" />'});
      } else if (userCode.length > 100) {
        errors.push({name: 'userCode', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE" escapeXml="false" escapeJs="true" />'});
      }

      const userLastName = request.userLastName;
      if (!userLastName || userLastName.length === 0) {
        errors.push({name: 'userLastName', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME" escapeXml="false" escapeJs="true" />'});
      } else if (userLastName.length > 30) {
        errors.push({name: 'userLastName', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME" escapeXml="false" escapeJs="true" />'});
      }

      const userFirstName = request.userFirstName;
      if (!userFirstName || userFirstName.length === 0) {
        errors.push({name: 'userFirstName', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME" escapeXml="false" escapeJs="true" />'});
      } else if (userFirstName.length > 30) {
        errors.push({name: 'userFirstName', message: '<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME" escapeXml="false" escapeJs="true" />'});
      }

      return errors;
    }

    // Display validation errors
    function showValidationError(errors) {
      errors.forEach((error) => {
        const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.style.display = '';
        }
      });
    }

    // Registration processing
    async function register(request) {
      const response = await fetch('sample/simple_form/api/register', {
        method: 'POST',
        headers: {
          'X-Intramart-Secure-Token': getSecureToken()
        },
        body: new URLSearchParams(request)
      });

      // Response (the API is expected to return JSON in {error: true, errorMessage} format even on 4xx/5xx)
      // Fall back to null when the response is not JSON (e.g., proxy error)
      const result = await response.json().catch(() => null);
      if (!result) {
        imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
        return false;
      }
      if (result.error) {
        imuiShowErrorMessage(result.errorMessage);
        return false;
      }

      imuiShowSuccessMessage('<imart type="message" id="MSG.I.APP.SKILLS.SIMPLE.FORM.REGISTER.SUCCESS" escapeXml="false" escapeJs="true" />');
      return true;
    }

    // Event handler
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

      // ★ Confirmation dialog message and title are also localized
      imuiConfirm(
        '<imart type="message" id="MSG.C.APP.SKILLS.SIMPLE.FORM.CONFIRM.REGISTER" escapeXml="false" escapeJs="true" />',
        '<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTER" escapeXml="false" escapeJs="true" />',
        async () => {
          const isSuccess = await register(request);
          if (isSuccess) {
            clearValidationError();
          }
        }
      );
    });

    // Entry point
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

<!-- Page root container (no id, since it is placed inside the intra-mart theme's imui-container) -->
<!-- ★ Labels in HTML are embedded with escapeXml="true" escapeJs="false" -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-back-button">
      <button type="button" class="imds-button is-ghost is-large">
        <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
      </button>
    </div>
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-file"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE" escapeXml="true" escapeJs="false" /></p>
      <h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
    </div>
  </header>

  <main>
    <!-- Secure token -->
    <imart type="imSecureToken" />

    <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.BASIC.INFO" escapeXml="true" escapeJs="false" /></h2>
        <div class="imds-field-container has-accent-color">
          <div class="imds-field-group is-horizontal imds-w-15">
            <div class="imds-field-group-label">
              <!-- ★ Message tags can also be embedded in HTML attributes -->
              <span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.USER.CODE" escapeXml="true" escapeJs="false" /></span>
            </div>
            <div class="imds-field-group-control">
              <div class="imds-field">
                <div class="imds-field-control">
                  <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                </div>
                <!-- ★ Error text is set dynamically by JS, so leave it empty -->
                <span class="imds-error-text" for=":userCode:"></span>
              </div>
            </div>
          </div>

          <div class="imds-field-group is-horizontal imds-w-15">
            <div class="imds-field-group-label">
              <span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.FULL.NAME" escapeXml="true" escapeJs="false" /></span>
            </div>
            <div class="imds-field-group-control">
              <div class="imds-field-group">
                <div class="imds-field-group-control is-horizontal">
                  <div class="imds-field">
                    <div class="imds-field-label">
                      <label for=":userLastName:"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.LAST.NAME" escapeXml="true" escapeJs="false" /></label>
                    </div>
                    <div class="imds-field-control">
                      <input type="text" id=":userLastName:" class="imds-textbox" name="userLastName" value="" />
                    </div>
                    <span class="imds-error-text" for=":userLastName:"></span>
                  </div>
                  <div class="imds-field">
                    <div class="imds-field-label">
                      <label for=":userFirstName:"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.FIRST.NAME" escapeXml="true" escapeJs="false" /></label>
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
              <span><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTRATION.DATE" escapeXml="true" escapeJs="false" /></span>
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
            <div class="imds-field-group-label"><span><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.OTHER.INFO" escapeXml="true" escapeJs="false" /></span></div>
            <div class="imds-field-group-control is-horizontal">
              <div class="imds-field">
                <div class="imds-field-label">
                  <label for=":age:"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE" escapeXml="true" escapeJs="false" /></label>
                </div>
                <div class="imds-field-control">
                  <select id=":age:" class="imds-select" name="age">
                    <option value=""><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.SELECT.PLACEHOLDER" escapeXml="true" escapeJs="false" /></option>
                    <option value="10"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.10S" escapeXml="true" escapeJs="false" /></option>
                    <option value="20"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.20S" escapeXml="true" escapeJs="false" /></option>
                    <option value="30"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.30S" escapeXml="true" escapeJs="false" /></option>
                    <option value="40"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.40S" escapeXml="true" escapeJs="false" /></option>
                    <option value="50"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.50S" escapeXml="true" escapeJs="false" /></option>
                    <option value="60"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.AGE.60S.PLUS" escapeXml="true" escapeJs="false" /></option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>

    <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
      <button type="button" id="register-button" class="imds-button is-primary" style="min-width: 8em;"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REGISTER" escapeXml="true" escapeJs="false" /></button>
      <button type="button" id="temporary-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TEMP.SAVE" escapeXml="true" escapeJs="false" /></button>
      <button type="button" id="delete-button" class="imds-button is-outlined is-danger" style="min-width: 8em;"><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.DELETE" escapeXml="true" escapeJs="false" /></button>
    </div>
  </main>
</div>
```

### view/index.js (Function Container - for screen)

```javascript
/**
 * Simple form screen (localized version)
 */

// Bind variables
// ★ $title and $subTitle are no longer needed as HTML uses <imart type="message"> directly — removed
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
    // ★ Log messages are defined with placeholder {0} and replaced with arguments
    Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
    transferErrorPage('E001', MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.INVALID.REQUEST'));
    return response;
  }

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
    transferErrorPage('E002', MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR'));
    return response;
  }

  return response;
}

function validateRequest(request) {
  // Nothing in particular
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
    // ★ Error page title is also localized
    title: MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE'),
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

### api/register.js (Function Container - for API)

```javascript
/**
 * User registration API (localized version)
 */

// ========================================
// Constants
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.APP.SKILLS.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.APP.SKILLS.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.APP.SKILLS.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.APP.SKILLS.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// Entry point
// ========================================
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP method check (405)
    checkMethod(request);
    // Secure token verification (400)
    verifySecureToken(request);
    // Request parameter validation (400)
    validateRequest(request);
    // Execute main business logic (500 on exception)
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.UNEXPECTED.ERROR');

    if (statusCode >= 500) {
      // ★ Log messages are also localized
      logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00002', message));
    } else {
      logger.warn('[register] API request was not accepted. code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // Return in JSON format
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

// ========================================
// Method / Secure token / Validation
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'Method ' + method + ' is not allowed.');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.TOKEN.NOT.SPECIFIED'));
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.INVALID.TOKEN'));
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400,
      MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.INVALID.TOKEN'));
  }
}

// ★ Validation messages are also localized
function validateRequest(request) {
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.USER.CODE'));
  } else if (userCode.length > 100) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.USER.CODE'));
  }

  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.LAST.NAME'));
  } else if (userLastName.length > 30) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.LAST.NAME'));
  }

  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.REQUIRED.FIRST.NAME'));
  } else if (userFirstName.length > 30) {
    throwValidationError(MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.MAX.LENGTH.FIRST.NAME'));
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

  // Use the values in parameters to perform database registration here

  return result;
}
```
