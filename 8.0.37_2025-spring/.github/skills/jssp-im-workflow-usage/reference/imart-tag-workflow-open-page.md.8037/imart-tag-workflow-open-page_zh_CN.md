---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART workflowOpenPage 标签参考

## 概述

`<imart type="workflowOpenPage">` 是生成用于显示执行工作流处理画面的 HTML 表单标签的标签。
支持申请、临时保存、再申请、处理、确认等各类画面。

与 `<imart type="workflowOpenPageCsjs" />` 标签配合使用，调用客户端 JavaScript 函数 `workflowOpenPage(pageType, callback)` 来显示画面。

## 画面类型（pageType）

| 值 | 说明 |
|------|------|
| `"0"` | 申请画面 |
| `"1"` | 临时保存画面 |
| `"2"` | 申请（草稿案件）画面 |
| `"3"` | 再申请画面 |
| `"4"` | 处理画面 |
| `"5"` | 确认画面 |

## 属性列表

### 必须属性

| 属性 | 类型 | 说明 |
|------|------|------|
| imwApplyBaseDate | String | 申请基准日（`yyyy/MM/dd` 格式）。申请/临时保存画面必须 |
| imwFlowId | String | 流程ID。申请/临时保存画面必须 |
| imwSystemMatterId | String | 系统案件ID。草稿案件/再申请/处理/确认画面必须 |
| method | String | FORM 标签的 method 属性 |

### 可选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-----------|------|
| imwAuthUserCode | String | - | 权限者代码（代理来源用户代码） |
| imwUserDataId | String | - | 用户数据ID。临时保存画面必须 |
| imwNodeId | String | - | 节点ID |
| imwCallOriginalParams | String | - | 调用方参数。"返回"按钮和处理完成后转移时作为请求参数使用 |
| imwNextScriptPath | String | - | 跳转目标脚本路径（脚本开发模式用） |
| imwNextApplicationId | String | - | 跳转目标应用程序ID（JavaEE 开发模式用） |
| imwNextServiceId | String | - | 跳转目标服务ID（JavaEE 开发模式用） |
| imwNextPagePath | String | - | 跳转目标页面路径（JSP/Servlet 用） |
| name | String | - | FORM 标签的 name 属性 |
| target | String | `_top` | FORM 标签的 target 属性 |
| useContextPath | String | `"true"` | URL 生成时是否包含上下文路径 |

### 各画面类型的必须属性

| 属性 | 申请(0) | 临时保存(1) | 草稿(2) | 再申请(3) | 处理(4) | 确认(5) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| imwApplyBaseDate | O | O | - | - | - | - |
| imwFlowId | O | O | - | - | - | - |
| imwSystemMatterId | - | - | O | O | O | O |
| imwUserDataId | - | O | - | - | - | - |

## 跳转目标参数

从以下3种模式中指定一种作为跳转目标。全部未指定时，处理完成后关闭画面结束。

| 开发模式 | 使用的属性 |
|-----------|-------------|
| 脚本开发 | `imwNextScriptPath` |
| JavaEE 开发 | `imwNextApplicationId` + `imwNextServiceId` |
| JSP/Servlet | `imwNextPagePath` |

## 使用示例

### 表现页面

```html
<imart type="head">
  <!-- 工作流画面跳转用 CSJS -->
  <imart type="workflowOpenPageCsjs" />
</imart>

<!-- 工作流画面调用用表单 -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=imwAuthUserCode
    imwSystemMatterId=imwSystemMatterId
    imwUserDataId=imwUserDataId
    imwNodeId=imwNodeId
    imwApplyBaseDate=imwApplyBaseDate
    imwFlowId=imwFlowId
    imwCallOriginalParams=imwCallOriginalParams
    imwNextScriptPath=imwNextScriptPath
    imwNextApplicationId=imwNextApplicationId
    imwNextServiceId=imwNextServiceId
    imwNextPagePath=imwNextPagePath>

  <!-- 用户数据 -->
  <input type="hidden" name="user_data_1" value="foo">
  <input type="hidden" name="user_data_2" value="bar">

  <!-- 处理按钮 -->
  <input type="button" value="申请" onclick="workflowOpenPage('0')" />
  <input type="button" value="处理" onclick="workflowOpenPage('4')" />
  <input type="button" value="确认" onclick="workflowOpenPage('5')" />
</imart>
```

### JavaScript 函数调用

```javascript
// 显示申请画面
workflowOpenPage('0');

// 显示处理画面（带回调）
workflowOpenPage('4', 'onWorkflowClose');

// 回调函数（处理画面关闭时调用）
function onWorkflowClose() {
  // 关闭画面后的处理
  location.reload();
}
```

## 注意事项

- 将 `<imart type="workflowOpenPageCsjs" />` 标签放置在 `<head>` 内（读取 CSJS 函数时必须）
- `callback` 参数可省略。指定的函数不存在时不执行
- `useContextPath="true"` 时，URL 以 `/imart/aaa/bbb` 格式输出；`"false"` 时以 `aaa/bbb` 格式输出
- 使用 `imwNextPagePath` / `imwNextApplicationId` + `imwNextServiceId` 时，需要在 SafeUrlManager 中注册
