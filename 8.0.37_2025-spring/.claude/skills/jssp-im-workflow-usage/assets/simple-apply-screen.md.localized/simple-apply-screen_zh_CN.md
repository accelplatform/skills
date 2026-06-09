# 工作流 申请画面模板

## 概述

IM-Workflow 申请画面程序的模板。
是输入零件代码、零件名称、单价、合计金额、理由进行申请的示例画面。
画面初始显示时，函数容器接收工作流参数并传递给表现页面。
通过申请/临时保存按钮，使用 `workflowOpenPage` 函数将处理委托给工作流引擎。

表单内的输入项目作为 `userParameter` 传递给动作处理。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  ├── apply/
  │   ├── index.js              # 函数容器
  │   └── index.html            # 表现页面
  └── action/
      └── action_process.js     # 动作处理（别的模板）
```

**注意：** IM-Workflow 的画面在内容定义中直接指定 JSSP 路径，因此无需路由表。

---

## 函数容器（apply/index.js）

```javascript
/**
 * 工作流 申请画面
 *
 * @file index.js
 * @description 构成零件发注的申请画面。
 *              接收工作流参数并传递给表现页面。
 */

// ========================================
// 绑定变量（表现页面联动用）
// ========================================

// 画面标题
let $title = '零件发注申请';
let $subTitle = '零件管理工作流';

// 画面数据
let $data = '{}';

// 工作流参数
let $imwSystemMatterId = '';
let $imwUserDataId = '';
let $imwApplyBaseDate = '';
let $imwFlowId = '';
let $imwAuthUserCode = '';
let $imwNodeId = '';
let $imwCallOriginalParams = '';
let $imwNextPagePath = '';
let $imwNextScriptPath = '';
let $imwNextApplicationId = '';
let $imwNextServiceId = '';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 从工作流引擎调用画面时，最先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 获取工作流参数
  $imwSystemMatterId     = request['imwSystemMatterId']       || '';
  $imwUserDataId         = request['imwUserDataId']           || '';
  $imwApplyBaseDate      = request['imwApplyBaseDate']        || '';
  $imwFlowId             = request['imwFlowId']               || '';
  $imwAuthUserCode       = request['imwAuthUserCode']         || '';
  $imwNodeId             = request['imwNodeId']               || '';
  $imwCallOriginalParams = request['imwCallOriginalParams']   || '';
  $imwNextPagePath       = request['imwCallOriginalPagePath'] || '';
  $imwNextScriptPath     = request['imwNextScriptPath']       || '';
  $imwNextApplicationId  = request['imwNextApplicationId']    || '';
  $imwNextServiceId      = request['imwNextServiceId']        || '';

  // 执行主处理
  let response = main(request);

  // 以 JSON 格式存储到 $data
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
      code: '',
      message: ''
    }
  };

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('申请画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '发生了意外错误。');
    return response;
  }

  return response;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑的主处理。
 * 从临时保存返回时获取已保存的数据。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 从临时保存返回时，以 userDataId 为键获取已保存数据
  let userDataId = request['imwUserDataId'];
  if (userDataId) {
    getMatterProperties(result, userDataId);
  }

  return result;
}

/**
 * 从案件属性获取数据。
 *
 * @param {Object} processResult - 处理结果
 * @param {String} userDataId - 用户数据ID
 */
function getMatterProperties(processResult, userDataId) {
  let manager = new UserActvMatterPropertyValue();
  let result = manager.getMatterPropertyList(userDataId);
  if (!result.resultFlag) {
    throw new Error('案件属性获取失败。');
  }

  for (let i = 0; i < result.data.length; i++) {
    let matterProperty = result.data[i];
    if (matterProperty.matterPropertyKey in processResult) {
      processResult[matterProperty.matterPropertyKey] = matterProperty.matterPropertyValue || '';
    }
  }
}

// ========================================
// IM-共通主数据 Helper
// ========================================
/**
 * 获取用户名。
 * 带 locales 的 null 检查 + 区域设置回退。
 *
 * @param {String} userCd - 用户代码
 * @return {String} 用户名
 */
function getUserName(userCd) {
  let accountContext = Contexts.getAccountContext();
  let locale = accountContext.locale;
  let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;
  let manager = new IMMUserManager();
  let result = manager.getUser({ userCd: userCd }, new Date(), locale);

  if (!result.data || !result.data.locales) {
    return '';
  }
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  return (localeInfo && localeInfo.userName) ? localeInfo.userName : '';
}

/**
 * 获取所属部门名称。
 * 带 locales 的 null 检查 + 区域设置回退。
 *
 * @param {String} userCd - 用户代码
 * @return {String} 部门名称
 */
function getDepartmentName(userCd) {
  // 对于登录用户自身，优先使用当前组织
  let accountContext = Contexts.getAccountContext();
  if (userCd === accountContext.userCd) {
    let userContext = Contexts.getUserContext();
    if (userContext && userContext.currentDepartment) {
      return userContext.currentDepartment.departmentName || '';
    }
  }

  // 无法获取当前组织时，或对其他用户，通过 IM-共通主数据 API 获取
  let locale = accountContext.locale;
  let manager = new IMMCompanyManager();
  let condition = new AppCmnSearchCondition();
  // 返回值为 DepartmentListNodeInfo[]（直接持有 displayName 的扁平结构）
  let result = manager.listDepartmentWithUser({ userCd: userCd }, condition, false, new Date(), locale);

  if (!result.data || result.data.length === 0) {
    return '';
  }
  return result.data[0].displayName || '';
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时全屏显示错误消息。
 *
 * @param {String} code - 错误代码
 * @param {String} message - 错误消息
 */
function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## 表现页面（apply/index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- 工作流画面跳转用 CSJS -->
  <imart type="workflowOpenPageCsjs" />
  <!-- 表现页面的自定义样式 -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- 表现页面的脚本 -->
  <script>
    // 表现页面联动用的绑定变量
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      // 验证检查常时执行标志
      let activeValidation = false;

      // 画面的初始显示
      function initializeView(result) {
        document.getElementById(':partCode:').value = result.partCode;
        document.getElementById(':partName:').value = result.partName;
        document.getElementById(':unitPrice:').value = result.unitPrice;
        document.getElementById(':quantity:').value = result.quantity;
        document.getElementById(':totalAmount:').value = result.totalAmount;
        document.getElementById(':reason:').value = result.reason;
      }

      // 初始化验证错误显示
      function clearValidationError() {
        document.querySelectorAll('.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });
        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // 显示验证错误
      function showValidationError(errors) {
        errors.forEach((error) => {
          const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
          if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = '';
            const fieldElement = errorElement.closest('.imds-field');
            if (fieldElement) {
              fieldElement.classList.add('imds-validation-error');
            }
          }
        });
        activeValidation = true;
      }

      // 创建请求参数
      function createRequest() {
        return {
          partCode:    document.getElementById(':partCode:').value,
          partName:    document.getElementById(':partName:').value,
          unitPrice:   document.getElementById(':unitPrice:').value,
          quantity:     document.getElementById(':quantity:').value,
          totalAmount: document.getElementById(':totalAmount:').value,
          reason:      document.getElementById(':reason:').value
        };
      }

      // 获取验证错误
      // TODO: 根据字段规格定制验证规则
      function getValidationErrors() {
        const request = createRequest();
        const errors = [];

        // 零件代码：必填
        const partCode = request['partCode'];
        if (!partCode || partCode.length === 0) {
          errors.push({ name: 'partCode', message: '零件代码为必填项。' });
        }

        // TODO: 添加其他字段的验证规则

        return errors;
      }

      // 实时再验证
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
        }
      }

      // 执行验证
      function validateCurrentStep() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        }
        return true;
      }

      // 实时再验证用事件监听器
      // TODO: 为所有验证对象字段注册监听器
      // 文本输入字段（input、textarea）使用 "input" 事件
      [':partCode:', ':partName:', ':reason:'].forEach((id) => {
        document.getElementById(id).addEventListener('input', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });
      // 选择框、日期输入、数字输入等使用 "change" 事件
      [':unitPrice:', ':quantity:', ':totalAmount:'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });

      // "返回"按钮 点击时事件
      document.getElementById('imw-back-button').addEventListener('click', () => {
        document.getElementById('imw-back-form').submit();
      });

      // 组装案件名称
      // TODO: 根据流程定义的案件名称规则进行定制
      function buildMatterName() {
        return '零件发注申请_' + $data.result.partCode;
      }

      // "申请"按钮 点击时事件
      document.getElementById('apply-button').addEventListener('click', () => {
        if (!validateCurrentStep()) {
          return;
        }
        // 设置案件名称
        document.getElementById('imwMatterName').value = buildMatterName();

        // 如果 imwSystemMatterId 存在，则为再申请（撤回后）
        // 不存在时为新规申请
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          workflowOpenPage('3');  // 再申请
        } else {
          workflowOpenPage('0');  // 新规申请
        }
      });

      // "临时保存"按钮 点击时事件
      document.getElementById('temp-save-button').addEventListener('click', () => {
        workflowOpenPage('1');
      });

      // 入口点
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
        // 再申请模式时，改变按钮标签
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          document.getElementById('apply-button').textContent = '再申请';
        }
      }
    });
  </script>
</imart>

<!-- 工作流画面调用用表单 -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=$imwAuthUserCode
    imwSystemMatterId=$imwSystemMatterId
    imwUserDataId=$imwUserDataId
    imwNodeId=$imwNodeId
    imwApplyBaseDate=$imwApplyBaseDate
    imwFlowId=$imwFlowId
    imwCallOriginalParams=$imwCallOriginalParams
    imwNextPagePath=$imwNextPagePath
    imwNextScriptPath=$imwNextScriptPath
    imwNextApplicationId=$imwNextApplicationId
    imwNextServiceId=$imwNextServiceId>

  <!-- 案件名称（申请按钮按下时由 JavaScript 设置） -->
  <input type="hidden" id="imwMatterName" name="imwMatterName" value="" />

  <!-- 页面整体容器 -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">
        <div class="imds-header-back-button">
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large">
            <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
          </button>
        </div>
        <div class="imds-header-icon">
          <span class="imds-icon-wrapper is-large">
            <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
          </span>
        </div>
        <div class="imds-header-title">
          <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
          <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
        </div>
      </header>
      <main>
        <div class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">发注信息</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span class="imds-required-label-required" data-required-label="必须">零件代码</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field" for=":partCode:">
                    <div class="imds-field-control">
                      <input type="text" id=":partCode:" class="imds-textbox" name="partCode" value="" />
                    </div>
                    <span class="imds-error-text" for=":partCode:" style="display:none;"></span>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>零件名称</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="text" id=":partName:" class="imds-textbox" name="partName" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>单价</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":unitPrice:" class="imds-textbox" name="unitPrice" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>数量</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":quantity:" class="imds-textbox" name="quantity" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>合计金额</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":totalAmount:" class="imds-textbox" name="totalAmount" value="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">申请理由</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>理由</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <textarea id=":reason:" class="imds-textarea" name="reason" rows="4"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="apply-button" class="imds-button is-primary" style="min-width: 8em;">申请</button>
          <button type="button" id="temp-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">临时保存</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- 工作流页面跳转用表单 -->
<imart type="tag" tagname="form" id="imw-back-form" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## 可用模板

- **申请画面**：[assets/simple-apply.md](assets/simple-apply.md)
  - IM-Workflow 的申请画面（使用 workflowOpenPage 标签）
  - 工作流参数的传递模式
  - 表单内的输入项目传递给动作处理的 `userParameter`
  - 申请按钮：`workflowOpenPage('0')`，临时保存按钮：`workflowOpenPage('1')`

### 生成时的指示示例

当用户请求"创建工作流申请画面"时，参考此 assets 中的代码，适当定制后生成。

### 生成时的注意事项

- **不得在 `<imart type="workflowOpenPage">` 标签上添加 `id` 属性**。
  - `workflowOpenPage` 标签不支持 `id` 属性，生成的 `<form>` 元素不会附 `id`。`document.getElementById('workflowOpenPageForm')` 返回 `null`
  - 从 JS 引用表单元素时，使用 `name` 属性，通过 `document.forms['workflowOpenPageForm']` 访问
- **不得在 `workflowOpenPage` 表单内的输入字段添加 `name` 属性**。
  - 表单内存在 `<input type="hidden" name="vendorId">` 和 `<select name="vendorId">` 等相同 `name` 时，表单提交时 `userParam.vendorId` 变成数组（NativeArray），在动作处理中产生 `Cannot convert NativeArray` 错误。
  - 从输入字段（`select`、`input[type=text]`、`input[type=number]`、`textarea`）中去掉 `name`，申请按钮按下时通过 JS 将值复制到 hidden 字段。
  - **单选按钮**分组需要 `name`，但要与 hidden 字段使用不同名称（例：输入用 `name="urgencyTypeInput"` / hidden `name="urgencyType"`）
- **`<imart>` 标签不存在 `filter` 属性**。
  - 要在 HTML 中显示 JSON 内的个别值（用户名、部门名等），请放置 `<span id="..."></span>`，并在 JavaScript 的 `initializeView` 中用 `element.textContent = result.xxx` 进行设置。
  - `<imart type="string" value=$data filter="json:result.xxx" />` 这样的写法不起作用
- **图标与文字并用的按钮**中，文字必须用 `<span class="imds-button-text">` 括起。直接放置文字节点会导致布局混乱（参考 imds-html-icon-button.md）
- **仅图标的按钮**（无文字，如删除垃圾桶图标）使用普通大小。使用 `is-small` / `is-x-small` 会使图标过小而难以操作
- 必填输入项目的标签必须附加必填标记（`imds-required-label-required` 类 + `data-required-label="必须"`）
- 日期输入使用 `imuiCalendar`（必须指定 `floatable="true"`），而非 `<input type="date">`。不使用内联显示（未指定 `floatable`）
- **验证的实现请遵守 `{{AGENT_RULES}}/jssp-presentation-page.md` 的规范**（以下为主要规则）：
  - 不使用 `maxlength` 属性。字符数限制通过验证错误消息通知
  - 验证相关函数按 `clearValidationError` → `showValidationError` → `createRequest` → `getValidationErrors` → `resetValidationError` → `validateCurrentStep` 的顺序定义
  - `showValidationError` 通过 `errorElement.closest('.imds-field')` 获取父元素，末尾设置 `activeValidation = true`
  - 初次验证错误后，输入值变更时进行实时再验证（`activeValidation` 标志 + `input`/`change` 事件监听器）
  - 在入口点调用 `clearValidationError()`
  - 为必填字段的 `imds-field` 标签附加 `for=":fieldName:"` 属性，并在其直下放置 `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>`
  - 按钮事件通过 `addEventListener` 注册，而非 `onclick` 属性
- **imuiCalendar（altField）与实时再验证并用时的注意**：imuiCalendar 的 `altField` 通过 jQuery 的 `.val()` 直接设置 DOM 属性，原生 `change` 事件不触发。通过 `Object.defineProperty` 覆盖 `value` 属性的 setter，发出 `change` 事件：
  ```javascript
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () { return descriptor.get.call(this); },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  ```
- **IM-共通主数据搜索（imACMSearch）回调与实时再验证并用时的注意**：
  `imACMSearch` 的回调函数定义在全局作用域，因此无法直接访问 `DOMContentLoaded` 内的 `activeValidation` 或 `resetValidationError`。以 `window._resetValidationError` 公开再验证函数，并在回调中调用：
  ```javascript
  // DOMContentLoaded 内
  window._resetValidationError = () => {
    if (activeValidation) { resetValidationError(); }
  };
  // 全局回调内
  function callbackXxxSearch(result) {
    // ... 设值处理 ...
    if (window._resetValidationError) { window._resetValidationError(); }
  }
  ```
