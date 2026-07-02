# 工作流 审批画面模板（workflowOpenPage 方式 / 旧型）

## 概述

IM-Workflow 审批（处理）画面程序的模板。
是以只读方式显示在申请画面输入的零件代码、零件名称、单价、合计金额、理由，审批者进行处理的示例画面。
画面初始显示时，根据工作流参数和用户数据ID获取已申请数据并显示。
通过处理按钮，使用 `workflowOpenPage` 函数将处理委托给工作流引擎。

> **与模态方式（新型）的取舍**：使用 `imWorkflow.modal.showProcess()` 的新型请参考 `modal-approve-screen.md`。新规开发推荐使用新型。本模板用于需要 workflowOpenPage 方式（旧型）审批（处理）画面的场合。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  ├── approve/
  │   ├── index.js              # 函数容器
  │   └── index.html            # 表现页面
  └── action/
      └── action_process.js     # 动作处理（别的模板）
```

**注意：** IM-Workflow 的画面在内容定义中直接指定 JSSP 路径，因此无需路由表。

---

## 函数容器（approve/index.js）

```javascript
/**
 * 工作流 审批画面
 *
 * @file index.js
 * @description 构成零件发注的审批画面。
 *              接收工作流参数，获取已申请数据并显示。
 */

// ========================================
// 绑定变量（表现页面联动用）
// ========================================

// 画面标题
let $title = '零件发注审批';
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
    logger.error('审批画面显示中发生错误。{}', e.message);
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
 * 以系统案件ID为键获取已申请数据（案件属性）。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';

  if (!systemMatterId) {
    throw new Error('未指定 imwSystemMatterId。');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 处理画面不会传入 imwUserDataId（仅传入 imwSystemMatterId）。
  // 未完成案件的案件属性以系统案件ID为键，通过 ActvMatter 获取。
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * 从案件属性获取申请内容并反映到 processResult。
 * 以系统案件ID为键获取未完成案件的案件属性。
 * （处理画面不会传入 imwUserDataId，因此无法使用 UserActvMatterPropertyValue(userDataId)。
 *   参考 reference/imart-tag-workflow-open-page.md 的「各画面种别的必须属性」表。）
 *
 * @param {Object} processResult - 处理结果
 * @param {String} systemMatterId - 系统案件ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let manager = new ActvMatter(systemMatterId);
  let result = manager.getMatterPropertyList();
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

## 表现页面（approve/index.html）

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
      // 画面的初始显示
      function initializeView(result) {
        document.getElementById(':partCode:').textContent = result.partCode;
        document.getElementById(':partName:').textContent = result.partName;
        document.getElementById(':unitPrice:').textContent = result.unitPrice;
        document.getElementById(':quantity:').textContent = result.quantity;
        document.getElementById(':totalAmount:').textContent = result.totalAmount;
        document.getElementById(':reason:').textContent = result.reason;
      }

      // "返回"按钮 点击时事件
      document.getElementById('imw-back-button').addEventListener('click', () => {
        // 返回上一画面
        document.getElementById('imw-back-form').submit();
      });

      // "处理"按钮 点击时事件
      // 审批/退回/否决/保留/取消保留的选择在调用 workflowOpenPage('4') 后
      // 通过 IM-Workflow 引擎的标准对话框进行
      document.getElementById('process-button').addEventListener('click', () => {
        workflowOpenPage('4');
      });

      // 入口点
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
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
                  <span>零件代码</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":partCode:" class="imds-text"></span>
                    </div>
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
                      <span id=":partName:" class="imds-text"></span>
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
                      <span id=":unitPrice:" class="imds-text"></span>
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
                      <span id=":quantity:" class="imds-text"></span>
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
                      <span id=":totalAmount:" class="imds-text"></span>
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
                      <span id=":reason:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">处理</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- 工作流页面跳转用表单 -->
<imart type="tag" tagname="form" name="imwBackForm" id="imwBackForm" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## 画面层无法实现的业务约束

`workflowOpenPage('4')` 打开的 IM-Workflow 标准处理对话框，让用户在对话框内选择「审批 / 退回 / 否决」并输入评论，整个流程在对话框内闭合。因此，**画面侧的 JavaScript 无法实现「根据所选动作切换评论必填/可选」之类的控制**。

由于此原因，以下业务约束**无法在画面层实现**：

- 「否决时必须填写理由（审批时可选）」
- 「评论字数上限 300 字」
- 「选择特定动作时强制填写追加项目」

当需求中包含此类约束时，**请勿强行在画面侧解决，而应在操作处理侧（`{功能名}/workflow/action/`）进行校验**。
具体的实现方式（通过返回值表示失败/抛出异常/包装专用校验画面等）应根据需求灵活判断（本技能不强制规定单一解决方案）。

操作处理的详细说明请参阅 [`simple-action-process.md`](simple-action-process.md)。

---

## 可用模板

- **审批画面**：[assets/simple-approve.md](assets/simple-approve.md)
  - IM-Workflow 的审批画面（使用 workflowOpenPage 标签）
  - 以只读方式显示已申请数据
  - 处理按钮：`workflowOpenPage('4')`

### 生成时的指示示例

当用户请求"创建工作流审批画面"时，参考此 assets 中的代码，适当定制后生成。

### 生成详细画面（确认/处理详情/参照详情）时

以审批画面模板为基础，**全部去除**以下元素：
- 头部的"返回"按钮（`imw-back-button`）
- "返回"按钮的 JS 事件监听器
- 返回用表单（`imw-back-form`）
- 处理按钮（`workflowOpenPage('4')`）

详细画面在工作流引擎的 iframe 内显示，因此返回目标页面路径不存在，会跳转到空页面。
