# 多语言化表单页面实现示例

用户注册表单页面的多语言化完整实现示例。
所有硬编码的日语字符串均已外部化至消息属性文件。

## 文件结构

```
src/main/
├── jssp/simple_form_localized/
│   ├── view/
│   │   ├── index.html                  # 展示页面
│   │   └── index.js                    # 函数容器（页面用）
│   └── api/
│       └── register.js                 # 函数容器（API 用）
└── conf/message/simple_form_localized/
    ├── caption.properties              # 标题（默认=英语）
    ├── caption_ja.properties           # 标题（日语）
    ├── caption_en.properties           # 标题（英语）
    ├── caption_zh_CN.properties        # 标题（中文）
    ├── message.properties              # 消息（默认=英语）
    ├── message_ja.properties           # 消息（日语）
    ├── message_en.properties           # 消息（英语）
    ├── message_zh_CN.properties        # 消息（中文）
    ├── log-message.properties          # 日志消息（默认=英语）
    ├── log-message_ja.properties       # 日志消息（日语）
    ├── log-message_en.properties       # 日志消息（英语）
    └── log-message_zh_CN.properties    # 日志消息（中文）
```

---

## 消息属性文件

### caption_ja.properties（日语标题）

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

### caption_en.properties / caption.properties（英语标题）

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

### message_ja.properties（日语消息）

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

### message_en.properties / message.properties（英语消息）

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

### log-message_ja.properties（日语日志消息）

```properties
E.IWP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
E.IWP.SKILLS.SIMPLE.FORM.00002=\u30e6\u30fc\u30b6\u767b\u9332\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

### log-message_en.properties / log-message.properties（英语日志消息）

```properties
E.IWP.SKILLS.SIMPLE.FORM.00001=An error occurred during page rendering. {0}
E.IWP.SKILLS.SIMPLE.FORM.00002=An error occurred during user registration. {0}
```

---

## 源代码

### view/index.html（展示页面）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /> - <imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.SUBTITLE" escapeXml="true" escapeJs="false" /></title>
  <!-- 展示页面集成用绑定变量 -->
  <script>const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;</script>
  <!-- 展示页面自定义样式 -->
  <style>
  .button-spacing {
    display: flex;
    gap: 3em;
  }
  </style>
  <!-- 展示页面脚本 -->
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面显示
    function initializeView(result) {
      document.getElementById(':userCode:').value = result.userCode;
      document.getElementById(':userFirstName:').value = result.userFirstName;
      document.getElementById(':userLastName:').value = result.userLastName;
      document.getElementById(':age:').value = result.age;
      document.getElementById(':registrationDate:').value = result.registrationDate || '';
    }

    // 获取安全令牌
    function getSecureToken() {
      return document.querySelector('input[name=im_secure_token]').value;
    }

    // 初始化验证显示
    function clearValidationError() {
      document.querySelectorAll('.imds-error-text').forEach((element) => {
        element.style.display = 'none';
      });
    }

    // 验证
    // ★ JavaScript 内的消息使用 escapeXml="false" escapeJs="true" 嵌入
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

    // 显示验证错误
    function showValidationError(errors) {
      errors.forEach((error) => {
        const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.style.display = '';
        }
      });
    }

    // 注册处理
    async function register(request) {
      const response = await fetch('sample/simple_form/api/register', {
        method: 'POST',
        headers: {
          'X-Intramart-Secure-Token': getSecureToken()
        },
        body: new URLSearchParams(request)
      });

      // 响应（API 在 4xx/5xx 时也以 {error: true, errorMessage} 格式的 JSON 返回）
      // 代理错误等情况下返回非 JSON 时，回退为 null
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

    // 事件处理
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

      // ★ 确认对话框的消息和标题也进行多语言化
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

    // 入口点
    clearValidationError();
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeView($data.result);
    }
  });
  </script>
</imart>

<!-- 页面整体容器 -->
<!-- ★ HTML 内的标签使用 escapeXml="true" escapeJs="false" 嵌入 -->
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
      <!-- 安全令牌 -->
      <imart type="imSecureToken" />

      <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.BASIC.INFO" escapeXml="true" escapeJs="false" /></h2>
          <div class="imds-field-container has-accent-color">
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <!-- ★ 消息标签也可以嵌入 HTML 属性内 -->
                <span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />"><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.USER.CODE" escapeXml="true" escapeJs="false" /></span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                  </div>
                  <!-- ★ 错误文本由 JS 动态设置，此处留空 -->
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

### view/index.js（函数容器 - 页面用）

```javascript
/**
 * 简单表单页面（多语言化版）
 */

// 绑定变量
// ★ $title 和 $subTitle 因 HTML 端直接使用 <imart type="message"> 而不再需要，已删除
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
    // ★ 日志消息定义时带占位符 {0}，通过参数替换
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
  // 无特别处理
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
    // ★ 错误页面标题也进行多语言化
    title: MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR.TITLE'),
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

### api/register.js（函数容器 - API 用）

```javascript
/**
 * 用户注册 API（多语言化版）
 */

// ========================================
// 常量定义
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SKILLS.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SKILLS.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SKILLS.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.SKILLS.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// 入口点
// ========================================
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP 方法检查 (405)
    checkMethod(request);
    // 安全令牌验证 (400)
    verifySecureToken(request);
    // 请求参数验证 (400)
    validateRequest(request);
    // 执行业务逻辑主处理（异常时为 500）
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
      // ★ 日志消息也进行多语言化
      logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00002', message));
    } else {
      logger.warn('[register] API 请求未被受理。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // 以 JSON 格式返回
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

// ========================================
// 方法 / 安全令牌 / 验证
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
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

// ★ 验证消息也进行多语言化
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

  // 请在此处使用 parameters 的值执行数据库注册处理

  return result;
}
```
