# 工作流 处理画面模板（处理模态方式）

## 概述

IM-Workflow 处理画面程序的模板（处理模态方式）。
使用 `imWorkflow.modal.showProcess()` API，通过 IM-Workflow 的标准模态 UI 进行审批、否决、退回等处理。

处理画面是经由内容定义（或 URL 直接访问）进行 IM-Workflow 处理的画面。
使用 IM-Workflow 引擎传入的 `imwSystemMatterId` 和 `imwNodeId` 启动处理模态。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── approve/
      ├── index.js              # 函数容器
      └── index.html            # 表现页面

src/main/conf/routing-jssp-config/
  └── {功能名}.xml              # 路由配置（处理画面的 URL 映射）
```

**注意：** 处理模态方式的处理画面是从 URL 直接访问的**独立画面**，因此需要在 `src/main/conf/routing-jssp-config/` 中注册路由 XML。

---

## 路由配置（routing-jssp-config/{功能名}.xml）

向已有的 `{功能名}.xml` 追加时，仅追记 `<file-mapping>` 元素。

```xml
<!-- TODO: 将 path 和 page 改为与功能名一致 -->
<file-mapping path="/{功能名}/workflow/approve" page="{功能名}/workflow/approve/index">
  <authz uri="service://{功能名}/workflow/approve" action="execute" />
</file-mapping>
```

---

## 函数容器（approve/index.js）

```javascript
/**
 * 工作流 处理画面（处理模态方式）
 *
 * @file index.js
 * @description 构成{功能名}的处理画面（审批/否决/退回）。
 *              使用处理模态（imWorkflow.modal.showProcess）进行处理。
 *              IM-Workflow 参数：imwSystemMatterId（系统案件ID）, imwNodeId（节点ID）
 */

// ========================================
// 绑定变量（表现页面联动用）
// ========================================
let $title = '{画面标题}（处理）';       // TODO: 设置画面标题
let $subTitle = '{副标题}';              // TODO: 设置副标题
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  let response = main(request);
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
    logger.error('处理画面显示中发生错误。{}', e.message);
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
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {
    imwParameter: {
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: 在此定义申请内容字段
    }
  };

  if (!result.imwParameter.systemMatterId || !result.imwParameter.nodeId) {
    throw new Error('未指定 imwSystemMatterId 或 imwNodeId。');
  }

  // 处理画面（未完成案件）不会传入 imwUserDataId，因此以系统案件ID为键获取
  getMatterProperties(result.formParameter, result.imwParameter.systemMatterId);

  return result;
}

// ========================================
// 案件属性获取
// ========================================
/**
 * 从案件属性获取申请内容并反映到 processResult。
 * 处理画面针对未完成案件，不会传入 userDataId，因此以系统案件ID为键通过 ActvMatter 获取。
 * （不使用以 userDataId 为键的 UserActvMatterPropertyValue）
 *
 * @param {Object} processResult - 反映目标对象（formParameter）
 * @param {String} systemMatterId - 系统案件ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let actvMatter = new ActvMatter(systemMatterId);
  let result = actvMatter.getMatterPropertyList();
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
  <!-- 安全令牌（处理模态方式中使用 http-equiv 形式） -->
  <meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
  <!-- 处理模态 API（defer 必须） -->
  <script src="im_workflow/js/api_base.js" defer></script>
  <!-- 表现页面的自定义样式 -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- 表现页面的脚本 -->
  <script>
    (function($data) {

    document.addEventListener('DOMContentLoaded', () => {

      // 画面的初始显示（以只读方式显示申请内容）
      function initializeView(result) {
        // TODO: 显示申请内容字段
        // 例：document.getElementById(':field1:').textContent = result.field1;
      }

      // "返回"按钮 点击时事件
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // "处理"按钮 点击时事件（async 必须）
      document.getElementById('process-button').addEventListener('click', async () => {

        // TODO: 根据需要设置 userParameter（传递给动作处理的数据）
        const userParameter = {
          // TODO: 根据字段进行修改
          // field1: document.getElementById(':field1:').textContent,
        };

        // 打开处理模态
        const result = await imWorkflow.modal.showProcess({
          processParameter: {
            systemMatterId: $data.result.imwParameter.systemMatterId,
            nodeId:         $data.result.imwParameter.nodeId
            // processType: [],           // TODO: 以数组指定要使用的处理种别（未指定时全部种别可选）
            // processComment: '',        // TODO: 如需设置处理评论的初始值则指定
          },
          optionalParameter: {
            userParameter: userParameter
          },
          rebootModal: false
        });

        // 处理完成后的处理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('处理已完成。');
          imWorkflow.transition.afterProcess();
        }
      });

      // 入口点
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result.formParameter);
      }
    });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- 页面整体容器（因会被放置在 intra-mart 主题的 imui-container 内部，所以不附加 id） -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-back-button">
      <button type="button" id="back-button" class="imds-button is-ghost is-large" aria-label="返回">
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
      <!-- TODO: 在此实现以只读方式显示申请内容的区块 -->
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">{区块标题}</h2>
        <div class="imds-field-container has-accent-color">
          <!-- 只读字段示例（显示申请者输入的值） -->
          <div class="imds-field-group is-horizontal imds-w-15">
            <div class="imds-field-group-label">
              <span>{字段标签}</span>
            </div>
            <div class="imds-field-group-control">
              <div class="imds-field">
                <div class="imds-field-control">
                  <!-- 因只读故以 span 显示（id 从 initializeView 引用） -->
                  <span id=":field1:" class="imds-text"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- 处理按钮（审批/否决/退回等在模态内选择） -->
    <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
      <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">处理</button>
    </div>
  </main>
</div>
```

---

## 生成时的注意事项

- **`imwSystemMatterId` 和 `imwNodeId` 是 IM-Workflow 引擎传入的参数**
  - 经由内容定义的 `scriptPath` 打开本处理画面时，IM-Workflow 引擎会自动传入
  - 在 `processBusinessLogic()` 内进行必填校验，未指定时跳转到错误页面
- **将 `imwParameter` 与 `formParameter` 分离**
  - `imwParameter`：传递给 IM-Workflow 引擎的参数（`systemMatterId`、`nodeId`）
  - `formParameter`：处理画面上显示的申请内容（从案件属性获取的只读数据）
  - 分离可防止业务字段误混入 `processParameter`
- **`showProcess()` 完成后，仅在 `isProcessDone` 为 true 时调用 `imWorkflow.transition.afterProcess()`**
  - 仅在处理完成时跳转（同时显示完成消息）
  - 取消时（`isProcessDone` 为 false）停留在画面，使处理者可再次打开模态
- **`processType` 参数的指定**
  - 未指定（空数组或省略）时，自动确定用户在模态内可选择的处理种别
  - 如需仅允许特定处理种别，则指定 `processType` 数组
- **在头部放置"返回"按钮**
  - 将 `imds-header-back-button` div + `back-button` id 的按钮放置在 `imds-header-icon` 之前
  - 点击时调用 `imWorkflow.transition.returnTo()`（返回调用方的申请一览、案件一览等的 API）
- **以只读方式显示申请内容**
  - 处理画面只需确认申请者输入的内容，无需编辑
  - 处理画面针对未完成案件，不会传入 `imwUserDataId`，因此案件属性的获取请使用 **`ActvMatter(systemMatterId).getMatterPropertyList()`（无参数）**。不要使用以 `userDataId` 为键的 `UserActvMatterPropertyValue`（与申请画面的临时保存再编辑获取来源不同）
  - 案件属性值 API 请参考 `reference/api-user-actv-matter-property-value.md`（`ActvMatter` 的说明也在该文件开头）
- **安全令牌与 `api_base.js` 与申请画面相同**
  - 使用 `<meta http-equiv="X-Intramart-Secure-Token">` 形式
  - `defer` 属性必须
