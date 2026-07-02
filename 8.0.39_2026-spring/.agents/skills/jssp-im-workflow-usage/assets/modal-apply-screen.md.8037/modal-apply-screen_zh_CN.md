# 工作流 申请画面模板（处理模态方式）

## 概述

IM-Workflow 申请画面程序的模板（处理模态方式）。
使用 `imWorkflow.modal.showApply()` / `imWorkflow.modal.showTemporarySave()` API，
通过 IM-Workflow 的标准模态 UI 进行申请、暂存。

申请与暂存在同一个 JSSP 画面上提供（与 `simple-apply-screen.md` 相同）。
将 `showApply()` 与 `showTemporarySave()` 分配到同一表单上的不同按钮。

申请画面是从 URL 直接访问的独立 JSSP 画面。
再次编辑暂存案件时，在 URL 参数 `userDataId` 上附加用户数据 ID 进行访问。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── apply/
      ├── index.js              # 函数容器
      └── index.html            # 表现页面

src/main/conf/routing-jssp-config/
  └── {功能名}.xml              # 路由配置（申请画面的 URL 映射）
```

**注意：** 处理模态方式的申请画面是从 URL 直接访问的**独立画面**，因此需要在 `src/main/conf/routing-jssp-config/` 中注册路由 XML。（与 workflowOpenPage 方式的不同点）

---

## 路由配置（routing-jssp-config/{功能名}.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- TODO: 将 path 和 page 改为与功能名一致 -->
  <file-mapping path="/{功能名}/workflow/apply" page="{功能名}/workflow/apply/index">
    <authz uri="service://{功能名}/workflow/apply" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 函数容器（apply/index.js）

```javascript
/**
 * 工作流 申请画面（处理模态方式）
 *
 * @file index.js
 * @description 构成{功能名}的申请画面。
 *              新规申请・暂存使用处理模态（imWorkflow.modal.showApply / showTemporarySave）。
 *              当 imwSystemMatterId 已采番（已申请的案件＝撤回后的未申请状态等）时，
 *              需要重新申请，因此画面侧切换为 showProcess（重新申请），且暂存不可用。
 *              IM-Workflow 参数：
 *                imwFlowId（→ flowId，新规申请时）
 *                imwSystemMatterId（→ systemMatterId，已采番则为重新申请模式）
 *                imwNodeId（→ nodeId，重新申请时的处理对象节点）
 *                imwUserDataId（→ userDataId，再次编辑暂存案件时的取得・更新键）
 */

// ========================================
// 绑定变量（表现页面联动用）
// ========================================
let $title = '{画面标题}';        // TODO: 设置画面标题
let $subTitle = '{副标题}';       // TODO: 设置副标题
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
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  let result = {
    imwParameter: {
      // systemMatterId 已采番时为重新申请模式
      isReapply:      !isBlank(request['imwSystemMatterId']),
      // 未申请时的信息（isReapply = false 时）
      flowId:         request['imwFlowId']         || '',
      userDataId:     request['imwUserDataId']     || '',
      applyBaseDate:  request['imwApplyBaseDate']  || '',
      // 已申请的信息（isReapply = true 时）
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: 在此定义表单的初始值字段
      // field1: '', field2: '', field3: ''
    }
  };

  if (result.imwParameter.userDataId) {
    getMatterProperties(result.formParameter, result.imwParameter.userDataId);
  }

  return result;
}

/**
 * 从案件属性获取数据。
 * 用于将暂存数据作为画面的初始值反映。
 *
 * @param {Object} processResult - 处理结果对象（各字段将被覆盖）
 * @param {String} userDataId - 用户数据 ID
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
    // 表现页面联动用的绑定变量
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      // 校验检查常时执行标志
      let activeValidation = false;

      // 是否为重新申请模式
      const isReapply = $data.result.imwParameter.isReapply;

      // 画面的初始显示
      function initializeView(result) {
        // TODO: 根据字段进行修改
        // 例：document.getElementById(':field1:').value = result.formParameter.field1;

        // 重新申请模式下暂存不可用，因此隐藏暂存按钮，
        // 并将申请按钮的标签改为「重新申请」。
        if (isReapply) {
          document.getElementById('temp-save-button').style.display = 'none';
          document.getElementById('apply-button').textContent = '重新申请';
        }
      }

      // 清空表单
      function clearForm() {
        // TODO: 根据字段进行修改
        // 例：document.getElementById(':field1:').value = '';
      }

      // 校验错误显示初始化
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });
        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // 显示校验错误
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

      // 获取校验错误
      // TODO: 根据字段规格自定义校验规则
      function getValidationErrors() {
        const errors = [];

        // TODO: 必填字段的校验示例
        // const fieldValue = document.getElementById(':field1:').value;
        // if (!fieldValue || fieldValue.length === 0) {
        //   errors.push({ name: 'field1', message: 'field1 为必填。' });
        // }

        return errors;
      }

      // 实时重新校验
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
        }
      }

      // 执行校验
      function validateCurrentStep() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        }
        return true;
      }

      // 实时重新校验用事件监听器
      // TODO: 在所有校验对象字段上注册监听器
      // 文本输入字段（input、textarea）使用 "input" 事件
      // [':field1:', ':field2:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('input', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });
      // 下拉框、数值输入等使用 "change" 事件
      // [':field3:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('change', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });

      // 组装案件名称
      // TODO: 根据流程定义的案件名称规则自定义
      function buildMatterName() {
        // TODO: 改为实际的案件名称生成逻辑
        return '{案件名称前缀}_' + document.getElementById(':field1:').value;
      }

      // 从当前表单值组装 userParameter
      // TODO: 根据字段进行修改。键名须与动作处理的 userParam 一致。
      function buildUserParameter() {
        return {
          // field1: document.getElementById(':field1:').value,
          // field2: document.getElementById(':field2:').value
        };
      }

      // "返回"按钮 点击时事件
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // "申请（重新申请）"按钮 点击时事件（async 必须）
      document.getElementById('apply-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        let result;
        if (isReapply) {
          // 重新申请：由于 systemMatterId 已采番，使用 showProcess（重新申请）。
          // 处理种别按流程定义自动决定（未申请状态下会提示重新申请等）。
          result = await imWorkflow.modal.showProcess({
            processParameter: {
              systemMatterId: $data.result.imwParameter.systemMatterId,
              nodeId:         $data.result.imwParameter.nodeId,
              matterName:     buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            },
            rebootModal: false
          });
        } else {
          // 新规申请：使用 showApply（systemMatterId 未采番）。
          // userDataId 用于将暂存草稿转换为正式申请（新规申请时为空字符串）。
          result = await imWorkflow.modal.showApply({
            processParameter: {
              flowId:        $data.result.imwParameter.flowId,
              userDataId:    $data.result.imwParameter.userDataId,
              applyBaseDate: $data.result.imwParameter.applyBaseDate,
              matterName:    buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            }
          });
        }

        // 申请/重新申请完成后的处理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage(isReapply ? '重新申请已完成。' : '申请已完成。');
          imWorkflow.transition.afterProcess();
        }
      });

      // "暂存"按钮 点击时事件（async 必须）
      document.getElementById('temp-save-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        // 打开暂存模态
        // 有 userDataId 时更新已有暂存，否则新建
        const result = await imWorkflow.modal.showTemporarySave({
          processParameter: {
            flowId:        $data.result.imwParameter.flowId,             // 新建暂存时使用
            userDataId:    $data.result.imwParameter.userDataId || '',   // 更新时使用（空字符串时为新建）
            applyBaseDate: $data.result.imwParameter.applyBaseDate,
            matterName:    buildMatterName()
          },
          optionalParameter: {
            userParameter: buildUserParameter()
          },
          rebootModal: false
        });

        // 暂存完成后的处理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('暂存已完成。');
          imWorkflow.transition.afterProcess();
        }
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
        <!-- TODO: 在此实现区块和字段 -->
        <!-- 以下为示例结构（字段实现示例） -->
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">{区块标题}</h2>
          <div class="imds-field-container has-accent-color">
            <!-- 必填字段示例 -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必填">{字段标签}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":field1:">
                  <div class="imds-field-control">
                    <input type="text" id=":field1:" class="imds-textbox" value="" />
                  </div>
                  <span class="imds-error-text" for=":field1:" style="display:none;"></span>
                </div>
              </div>
            </div>
            <!-- 可选字段示例 -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span>{字段标签}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":field2:" class="imds-textbox" value="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="apply-button" class="imds-button is-primary" style="min-width: 8em;">申请</button>
        <button type="button" id="temp-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">暂存</button>
      </div>
    </main>
  </div>
</div>
```

---

## 生成时的注意事项

- **以 `imwSystemMatterId` 分支新规申请与重新申请（必须）**
  - **`imwSystemMatterId` 已采番 = 已申请的案件**（撤回后的「未申请状态」等）。此状态下需要的是「重新申请」而非「申请」，且重新申请须用 **`showProcess()` 而非 `showApply()`**（调用 `showApply()` 会导致 userDataId / 案件重复错误）。
  - 已采番时（`isReapply`）：将申请按钮的处理切换为 `showProcess({ processParameter: { systemMatterId, nodeId }, ... })`，**隐藏暂存按钮**（重新申请时不可暂存），并将按钮标签改为「重新申请」。
  - 未采番时：照旧使用 `showApply()`（新规申请）/ `showTemporarySave()`（暂存）。
  - 判定依据为 **`systemMatterId` 而非 `userDataId`**。暂存草稿持有 `userDataId` 但 `systemMatterId` 未采番，因此应作为新规申请模式处理（通过 `showApply` 转换为正式申请）。
  - 为使重新申请模式生效，须在函数容器中接收 `imwSystemMatterId` / `imwNodeId` 并存入 `imwParameter`。
- **申请与暂存须放置在同一画面（新规申请模式时）**
  - 与 `simple-apply-screen.md`（workflowOpenPage 方式）相同，将申请、暂存按钮放置在同一表单上
  - 对应关系：申请按钮 → `showApply()`，暂存按钮 → `showTemporarySave()`
- **暂存案件的再次编辑（新规申请模式时）**
  - 接收到 URL 参数 `userDataId` 时，用 `getMatterProperties()` 进行表单的初始显示
  - 再次编辑后按下暂存按钮，使用 `userDataId` 更新已有的暂存
  - 再次编辑后按下申请按钮，通过 `showApply()`（传入 `userDataId`）转换为正式申请
- **在 `flowId` 中设置正确的流程 ID**
  - 使用 IM-Workflow 流程定义 XML 中指定的流程 ID（`<flow id="...">` 的值）
  - 指定错误的流程 ID 会导致模态无法正常启动
- **使 `userParameter` 的键名与动作处理的 `userParam` 一致**
  - 与动作处理（`action_process.js`）中以 `userParam.fieldName` 读取的键名完全一致
  - 汇总到 `buildUserParameter()` 函数中，可使申请、暂存两个按钮传递相同的数据
- **`showApply()` / `showTemporarySave()` 均仅在 `isProcessDone` 为 true 时调用 `imWorkflow.transition.afterProcess()`**
  - `showApply()`：仅在申请完成时调用（申请完成后跳转到申请一览）
  - `showTemporarySave()`：仅在暂存完成时调用（失败、取消时停留在画面，使用户可以修改）
- **注意安全令牌标签的格式**
  - 使用 `<meta http-equiv="X-Intramart-Secure-Token">` 而非 `<meta name="im_secure_token">`
- **不要省略 `api_base.js` 的 `defer` 属性**
- **在头部放置"返回"按钮**
  - 将 `imds-header-back-button` div + `back-button` id 的按钮放置在 `imds-header-icon` 之前
  - 点击时调用 `imWorkflow.transition.returnTo()`
- **申请、暂存按钮的事件监听器须为 `async` 函数**
- **不要忘记创建路由 XML**
  - 如果申请画面的 URL 未在 `routing-jssp-config` 中注册，将无法访问
