# 工作流 确认画面模板（workflowOpenPage 方式 / 旧型）

## 概述

IM-Workflow 的确认（pageType=5）画面程序模板。
是以只读方式显示在申请画面输入的零件代码、零件名称、单价、合计金额、理由，确认者进行确认操作的示例画面。

与 `simple-approve-screen.md`（审批画面）采用相同的 `workflowOpenPage` 方式，将处理按钮的调用替换为 `workflowOpenPage('5')`（确认）的结构。
确认/退回等的选择以及评论输入在 `workflowOpenPage('5')` 调用后，于 IM-Workflow 引擎的标准对话框内完成。

> **与模态方式（新型）的区分使用**：使用 `imWorkflow.modal.showConfirm()` 的新型请参考 `modal-confirm-screen.md`。新规开发推荐使用新型。本模板在需要 workflowOpenPage 方式（旧型）的确认画面时使用。

## 申请内容的恢复（重要）

确认画面、处理画面仅从 IM-Workflow 引擎接收 **`imwSystemMatterId`（系统案件ID）**。
**`imwUserDataId` 不会被传递**（在 `reference/imart-tag-workflow-open-page.md` 的「按画面种别的必须属性」表中，`imwUserDataId` 仅在临时保存(1)时标记为 ○，处理(4)、确认(5)不在对象范围内）。

因此，申请内容的恢复无法使用以用户数据ID为键的 `UserActvMatterPropertyValue.getMatterPropertyList(userDataId)`。
**应使用以系统案件ID为键从未完成案件获取案件属性的 `ActvMatter`**（`reference/api-user-actv-matter-property-value.md`：「以系统案件ID为键从未完成案件获取用户数据案件属性信息时使用 `ActvMatter`」）。

```javascript
// OK: 确认画面以 systemMatterId 为键使用 ActvMatter 获取（getMatterPropertyList 无参数）
let manager = new ActvMatter(systemMatterId);
let result = manager.getMatterPropertyList();

// NG: 确认画面不会传递 imwUserDataId，因此无法恢复
let manager = new UserActvMatterPropertyValue();
let result = manager.getMatterPropertyList(userDataId);  // userDataId 为空
```

---

## 函数容器（confirm/index.js）

```javascript
/**
 * 工作流 确认画面（workflowOpenPage 方式）
 *
 * @file index.js
 * @description 构成零件发注的确认画面。
 *              接收工作流参数，获取已申请的数据并显示。
 *              通过处理按钮以 workflowOpenPage('5')（确认）将处理委托给引擎。
 *              IM-Workflow 参数：imwSystemMatterId（系统案件ID）、imwNodeId（节点ID）
 */

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================

// 画面标题
let $title = '零件发注确认';
let $subTitle = '零件管理工作流';

// 画面数据
let $data = '{}';

// 工作流参数
let $imwSystemMatterId = '';
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
 * 当工作流引擎调用画面时，最先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 获取工作流参数
  $imwSystemMatterId     = request['imwSystemMatterId']       || '';
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
    logger.error('确认画面显示中发生错误。{}', e.message);
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
 * 以系统案件ID为键获取已申请的数据（案件属性）。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';
  let nodeId         = request['imwNodeId']         || '';

  if (!systemMatterId || !nodeId) {
    throw new Error('未指定 imwSystemMatterId 或 imwNodeId。');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 确认画面不会传递 imwUserDataId（仅 imwSystemMatterId）。
  // 未完成案件的案件属性以系统案件ID为键使用 ActvMatter 获取。
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * 从案件属性获取申请内容并反映到 processResult。
 * 以系统案件ID为键获取未完成案件的案件属性。
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
// 错误页面跳转
// ========================================
/**
 * 发生错误时在全画面显示错误消息。
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

## 展示页面（confirm/index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- 工作流画面跳转用 CSJS -->
  <imart type="workflowOpenPageCsjs" />
  <!-- 展示页面的自定义样式 -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- 展示页面的脚本 -->
  <script>
    // 用于展示页面联动的绑定变量
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

      // 「返回」按钮点击事件
      document.getElementById('imw-back-button').addEventListener('click', () => {
        // 返回上一画面
        document.getElementById('imw-back-form').submit();
      });

      // 「确认」按钮点击事件
      // 确认/退回等的选择以及评论输入在 workflowOpenPage('5') 调用后
      // 于 IM-Workflow 引擎的标准对话框中进行
      document.getElementById('confirm-button').addEventListener('click', () => {
        workflowOpenPage('5');
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
    imwNodeId=$imwNodeId
    imwCallOriginalParams=$imwCallOriginalParams
    imwNextPagePath=$imwNextPagePath
    imwNextScriptPath=$imwNextScriptPath
    imwNextApplicationId=$imwNextApplicationId
    imwNextServiceId=$imwNextServiceId>

  <!-- 整个页面的容器 -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">
        <div class="imds-header-back-button">
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large" aria-label="返回">
            <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></span>
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
          <button type="button" id="confirm-button" class="imds-button is-primary" style="min-width: 8em;">确认</button>
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

## 与审批画面（simple-approve-screen.md）的差异

旧型确认画面以审批画面模板为写本，仅变更以下内容。

| 项目 | 审批画面 | 确认画面 |
|------|---------|---------|
| 处理按钮的调用 | `workflowOpenPage('4')` | `workflowOpenPage('5')` |
| 按钮标签 / id | `处理` / `process-button` | `确认` / `confirm-button` |
| 标题 | 零件发注审批 | 零件发注确认 |
| 申请内容的恢复 | 使用 `ActvMatter(systemMatterId)` | 使用 `ActvMatter(systemMatterId)` |

> **补充**：审批画面、确认画面的处理对象均为未完成案件，不会传递 `imwUserDataId`（仅 `imwSystemMatterId`）。因此申请内容的恢复使用以系统案件ID为键的 `ActvMatter(systemMatterId).getMatterPropertyList()`（`UserActvMatterPropertyValue.getMatterPropertyList(userDataId)` 是以用户数据ID查询已申请未完成案件的 API，因此在不传递 userDataId 的处理/确认画面中无法使用。请参考 `reference/imart-tag-workflow-open-page.md` 的「按画面种别的必须属性」表）。

## 画面在 iframe 内显示的运用情形

在确认画面于工作流引擎的 iframe 内显示的运用中，由于返回目标的页面路径不存在而会跳转至空白页面，因此请按照 `simple-approve-screen.md` 的「生成详细画面（确认、处理详细、参照详细）时」一节，去除以下内容。

- 头部的「返回」按钮（`imw-back-button`）
- 「返回」按钮的 JS 事件监听器
- 返回用表单（`imw-back-form`）

确认操作的提交按钮（`confirm-button` / `workflowOpenPage('5')`）保留。

## 生成后的必须验证

请按照 `SKILL.md` 的「生成后的必须验证」，实施 `validate-workflow-code.js` → 手动检查 → 与 `jssp-imds-theme/reference` 比对。
特别要确认 `<imart type="workflowOpenPage">` 下的输入字段不附 `name` 属性（仅 hidden 字段持有 `name`）。
