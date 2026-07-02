# 简单表单画面模板

## 概述

使用简单输入表单和API实现注册功能的基本画面构成模板。
画面初始显示时，将服务器端获取的值显示在呈现页面中；保存输入内容时使用AJAX。
用户代码的初始值从查询参数中获取。

## 文件结构

```
src/main/jssp/src/simple_form/view/
  ├── index.js              # 功能容器
  └── index.html            # 呈现页面

src/main/jssp/src/simple_form/api/
  └── register.js           # 注册API

src/main/conf/routing-jssp-config/
  └── simple_form.xml       # 路由配置
```

---

## 功能容器（simple_form/view/index.js）

```javascript
/**
 * 简单表单画面
 *
 * @file index.js
 * @description 构建接受用户代码、用户名（姓·名）、年龄输入的表单。
 */

// ========================================
// 绑定变量（用于呈现页面联动）
// ========================================
let $title = '用户注册·删除';
let $subTitle = '用户管理功能';
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面URL时，最先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 执行主处理
  let response = main(request);

  // 以JSON格式存储到$data
  // 如果JSON中包含</script>，脚本会终止，
  // 因此将响应中的'/'全部替换为'\/'
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// 主处理
// ========================================
/**
 * 执行主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // 错误代码
      message: ''               // 错误消息
    }
  };

  try {
    // 验证请求参数
    validateRequest(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '请求参数不正确。');
    return response;
  }

  try {
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E002', '发生了意外错误。');
    return response;
  }

  return response;
}

// ========================================
// 验证
// ========================================
/**
 * 验证请求参数。
 * 检查请求参数中不允许错误的项目。
 *
 * @param {Object} request - 请求参数
 */
function validateRequest(request) {
  // 暂无
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {
    userCode: '',               // 用户代码
    userFirstName: '',          // 用户名（名）
    userLastName: '',           // 用户名（姓）
    age: ''                     // 年龄
  };

  // 获取请求参数
  let userCode = request['userCode'];
  if (userCode != null) {
    result.userCode = userCode;
  }

  return result;
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时，在全屏显示错误消息。
 *
 * @param {String} code - 错误代码
 * @param {String} message - 错误消息
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: '发生了系统错误',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## 呈现页面（simple_form/view/index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- 呈现页面自定义样式 -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- 呈现页面脚本 -->
  <script>
    // 用于呈现页面联动的绑定变量
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      // 始终执行验证检查的标志
      let activeValidation = false;

      // 显示确认对话框
      function imdsConfirm(message, title, onOk, onCancel, options) {
        // 已显示中时立即返回false
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

        // 按模式设置
        const iconClass = mode === 'info' ? 'fa-circle-question' : 'fa-triangle-exclamation';
        const okButtonClass = mode === 'danger' ? 'imds-button is-danger' : 'imds-button is-primary';

        // 生成dialog元素
        const dialog = document.createElement('dialog');
        dialog.className = 'imds-confirm-wrapper';

        dialog.innerHTML =
          '<div class="imds-confirm is-' + mode + '">' +
            '<div class="imds-confirm-content-wrapper">' +
              '<button class="imds-confirm-close imds-button is-ghost" aria-label="关闭">' +
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

        // 通过textContent安全地插入用户输入（XSS对策）
        dialog.querySelector('.imds-confirm-message-title').textContent = dialogTitle;
        dialog.querySelector('.imds-confirm-cancel-button').textContent = cancelText;
        dialog.querySelector('.imds-confirm-ok-button').textContent = okText;

        // 使消息支持换行符换行
        const contentEl = dialog.querySelector('.imds-confirm-message-content');
        const lines = String(message).split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) contentEl.appendChild(document.createElement('br'));
          contentEl.appendChild(document.createTextNode(lines[i]));
        }

        // 打开对话框前记住触发元素（关闭后返回焦点用）
        const triggerElement = document.activeElement;

        // ARIA属性
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
            // 将焦点返回触发元素
            if (triggerElement && typeof triggerElement.focus === 'function') {
              triggerElement.focus();
            }
            resolve(result);
          }

          const okButton = dialog.querySelector('.imds-confirm-ok-button');
          const cancelButton = dialog.querySelector('.imds-confirm-cancel-button');
          const closeButton = dialog.querySelector('.imds-confirm-close');

          // 确定按钮
          okButton.addEventListener('click', function() {
            if (typeof onOk === 'function') onOk();
            close(true);
          });

          // 取消按钮
          cancelButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // ×按钮（视为取消）
          closeButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // 通过Escape键关闭（视为取消）
          dialog.addEventListener('cancel', function(e) {
            e.preventDefault();
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // 键盘操作
          // - Enter:  作为OK按钮确定（取消/×有焦点时优先执行该按钮的操作）
          // - Tab:    原生dialog提供焦点陷阱，无需额外实现
          // - Escape: 已通过cancel事件处理
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

          // 初始焦点
          // - danger模式: 防止误操作，聚焦到取消按钮
          // - 其他:       聚焦到OK按钮
          setTimeout(function() {
            if (mode === 'danger') {
              cancelButton.focus();
            } else {
              okButton.focus();
            }
          }, 0);
        });
      }

      /** @type {boolean} 显示中标志（防止重复显示） */
      imdsConfirm._active = false;

      // 获取安全令牌
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // 画面初始显示
      function initializeView(result) {
        document.getElementById(':userCode:').value = result.userCode;
        document.getElementById(':userFirstName:').value = result.userFirstName;
        document.getElementById(':userLastName:').value = result.userLastName;
        document.getElementById(':age:').value = result.age;
      }

      // 初始化验证显示
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });

        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // 显示验证错误
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

        // 始终执行验证检查
        activeValidation = true;
      }

      // 验证（逻辑集中于此。由 resetValidationError 和 validateCurrentStep 两处调用）
      function getValidationErrors() {
        const errors = [];

        // 用户代码：必填，最多100个字符
        const userCode = document.getElementById(':userCode:').value;
        if (!userCode || userCode.length === 0) {
          errors.push({name: 'userCode', message: '用户代码为必填项。'});
        } else if (userCode.length > 100) {
          errors.push({name: 'userCode', message: '用户代码最多100个字符。'});
        }

        // 用户名（姓）：必填，最多30个字符
        const userLastName = document.getElementById(':userLastName:').value;
        if (!userLastName || userLastName.length === 0) {
          errors.push({name: 'userLastName', message: '姓为必填项。'});
        } else if (userLastName.length > 30) {
          errors.push({name: 'userLastName', message: '姓最多30个字符。'});
        }

        // 用户名（名）：必填，最多30个字符
        const userFirstName = document.getElementById(':userFirstName:').value;
        if (!userFirstName || userFirstName.length === 0) {
          errors.push({name: 'userFirstName', message: '名为必填项。'});
        } else if (userFirstName.length > 30) {
          errors.push({name: 'userFirstName', message: '名最多30个字符。'});
        }

        return errors;
      }

      // 创建请求参数
      function createRequest() {
        return {
          userCode: document.getElementById(':userCode:').value,
          userFirstName: document.getElementById(':userFirstName:').value,
          userLastName: document.getElementById(':userLastName:').value,
          age: document.getElementById(':age:').value
        };
      }

      // 重置验证错误（出现错误后，输入变更时重新检查并更新显示）
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

      // 注册处理
      async function register(request) {
        // 发送到服务器
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
          imuiShowErrorMessage('发生了系统错误。');
          return false;
        }
        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        imuiShowSuccessMessage('用户注册成功。');
        return true;
      }

      // 输入元素值变更时事件
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

      // 注册按钮点击事件
      document.getElementById('register-button').addEventListener('click', () => {
        // 创建参数信息
        const request = createRequest();

        // 执行验证
        if (!resetValidationError()) return;

        // 确认消息
        imdsConfirm(
          '确定要注册吗？',
          '注册',
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
<div id="container">
  <div class="imds-container">
    <!-- 头部 -->
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

    <!-- 主要内容 -->
    <main>
      <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">基本信息</h2>
          <div class="imds-field-container has-accent-color">
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必填">用户代码</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":userCode:">
                  <div class="imds-field-control">
                    <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                  </div>
                  <span class="imds-error-text" for=":userCode:">错误消息显示在这里。</span>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必填">姓名</span>
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
                      <span class="imds-error-text" for=":userLastName:">错误消息显示在这里。</span>
                    </div>
                    <div class="imds-field" for=":userFirstName:">
                      <div class="imds-field-label">
                        <label for=":userFirstName:">名</label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userFirstName:" class="imds-textbox" name="userFirstName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userFirstName:">错误消息显示在这里。</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label"><span>其他信息</span></div>
              <div class="imds-field-group-control is-horizontal">
                <div class="imds-field" for=":age:">
                  <div class="imds-field-label">
                    <label for=":age:">年龄</label>
                  </div>
                  <div class="imds-field-control">
                    <select id=":age:" class="imds-select" name="age">
                      <option value="">请选择</option>
                      <option value="10">10多岁</option>
                      <option value="20">20多岁</option>
                      <option value="30">30多岁</option>
                      <option value="40">40多岁</option>
                      <option value="50">50多岁</option>
                      <option value="60">60岁以上</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="register-button" class="imds-button is-primary" style="min-width: 8em;">注册</button>
        <button type="button" id="temporary-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">临时保存</button>
        <button type="button" id="delete-button" class="imds-button is-outlined is-danger" style="min-width: 8em;">删除</button>
      </div>
    </main>
  </div>
</div>
```

---

## 注册API（simple_form/api/register.js）

```javascript
/**
 * 用户注册API
 *
 * @file register.js
 * @description 接受用户代码、用户名（姓·名）、年龄的输入，并注册到数据库中。
 */

// ========================================
// 常量定义
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// 入口点
// ========================================
/**
 * API的入口点。
 * API被调用时，最先执行。
 *
 * @param {Object} request - 请求对象
 */
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
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[register] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[register] API 请求未被受理。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // 以JSON格式返回
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

// ========================================
// 方法 / 安全令牌 / 验证
// ========================================
/**
 * 检查 HTTP 方法是否被允许。
 *
 * @param {Object} request - 请求对象
 */
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
  }
}

/**
 * 验证安全令牌（CSRF 对策）。
 *
 * @param {Object} request - 请求对象
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '未指定安全令牌。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌验证失败。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌不正确。');
  }
}

/**
 * 验证请求参数。
 *
 * @param {Object} request - 请求对象
 */
function validateRequest(request) {
  // 用户代码：必填，最多100个字符
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throwValidationError('userCode 为必填项。');
  } else if (userCode.length > 100) {
    throwValidationError('userCode 最多100个字符。');
  }

  // 用户名（姓）：必填，最多30个字符
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throwValidationError('userLastName 为必填项。');
  } else if (userLastName.length > 30) {
    throwValidationError('userLastName 最多30个字符。');
  }

  // 用户名（名）：必填，最多30个字符
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throwValidationError('userFirstName 为必填项。');
  } else if (userFirstName.length > 30) {
    throwValidationError('userFirstName 最多30个字符。');
  }
}

/**
 * 抛出验证错误（400）。
 *
 * @param {string} message - 错误消息
 */
function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

/**
 * 附加错误代码和 HTTP 状态码后抛出异常。
 *
 * @param {string} code - 错误代码
 * @param {number} httpStatus - HTTP 状态码
 * @param {string} message - 错误消息
 */
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {
    userCode: '',               // 用户代码
    userFirstName: '',          // 用户名（名）
    userLastName: '',           // 用户名（姓）
    age: ''                     // 年龄
  };

  // 获取请求参数
  let request = {
    userCode: request['userCode'],
    userFirstName: request['userFirstName'],
    userLastName: request['userLastName'],
    age: request['age']
  };

  // TODO: 在此处使用parameter的值，执行数据库注册处理

  return result;
}
```

---

## 路由配置（simple_form.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- 呈现页面 -->
  <file-mapping path="/sample/simple_form" page="sample/simple_form/view/index">
    <authz uri="service://sample/simple_form" action="execute" />
  </file-mapping>

  <!-- 用于AJAX通信的REST-API -->
  <file-mapping path="/sample/simple_form/api/register" page="sample/simple_form/api/register">
    <authz uri="service://sample/simple_form/api/register" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 可用模板

- **简单表单**: [assets/simple-form.md](assets/simple-form.md)
  - 应用了intra-mart Design System（imds）主题的画面
  - 配置了多个文本输入的表单输入
  - 通过REST-API执行注册

### 生成时的指示示例

当用户请求"创建表单画面"时，参考此assets中的代码，生成适当定制的版本。

---

## 验证模式集

在 `getValidationErrors()` 内使用的各种检查代码片段。
统一使用直接从DOM读取值的模式。

### 字符串长度检查（上限・下限）

```javascript
const value = document.getElementById(':fieldName:').value;
if (value.length > 200) {
  errors.push({ name: 'fieldName', message: 'fieldName 最多200个字符。' });
} else if (value.length < 8) {
  errors.push({ name: 'fieldName', message: 'fieldName 请输入8个字符以上。' });
}
```

### 数值检查（NaN・范围）

```javascript
const value = document.getElementById(':age:').value;
if (value !== '') {
  const num = Number(value);
  if (isNaN(num)) {
    errors.push({ name: 'age', message: '年龄请输入数值。' });
  } else if (num < 0 || num > 150) {
    errors.push({ name: 'age', message: '年龄请输入0〜150的范围。' });
  }
}
```

### 正则表达式模式匹配

```javascript
const value = document.getElementById(':code:').value;
if (value && !/^[A-Za-z0-9_-]+$/.test(value)) {
  errors.push({ name: 'code', message: '代码只能使用半角英数字、连字符、下划线。' });
}
```

### 邮箱地址格式

```javascript
const value = document.getElementById(':email:').value;
if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  errors.push({ name: 'email', message: '邮箱地址格式不正确。' });
}
```

### 日期格式（YYYY-MM-DD）

```javascript
const value = document.getElementById(':startDate:').value;
if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
  errors.push({ name: 'startDate', message: '开始日期请以 YYYY-MM-DD 格式输入。' });
}
```

### 可选项目（仅在有值时检查）

```javascript
const value = document.getElementById(':memo:').value;
if (value && value.length > 500) {
  errors.push({ name: 'memo', message: '备注最多500个字符。' });
}
```

### 日期前后关系检查

```javascript
const startDate = document.getElementById(':startDate:').value;
const endDate = document.getElementById(':endDate:').value;
if (startDate && endDate && startDate > endDate) {
  errors.push({ name: 'endDate', message: '结束日期请指定开始日期之后的日期。' });
}
```
