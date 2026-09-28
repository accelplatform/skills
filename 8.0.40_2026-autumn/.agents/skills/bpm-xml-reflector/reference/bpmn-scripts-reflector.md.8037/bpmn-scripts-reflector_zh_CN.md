# BPMN 脚本反映器

## 概述
解析 BPMN 格式的 XML，将生成脚本的内容反映到 BPMN 中。

## 使用时机
当用户提出如下请求时：
- 「希望将生成脚本的内容反映到 BPMN XML 中」

## 反映目标
- 正确：`doc/<BPM流程名>-prompt/<BPM流程名>.bpmn`（复制目标。只允许在此处进行反映）
- 错误：`doc/<BPM流程名>.bpmn`（复制源。**绝对不可修改**）

## 反映到 BPMN XML 中的内容
- 本技能集执行以下操作。
  - 将生成脚本的路径及参数追加到 BPM 的开始事件或用户任务中

## 实施步骤

### Step0. 确认对象
- 确认作为反映源的生成脚本配置信息，以及反映目标文件。
  - 展示作为反映源的生成脚本配置信息的路径以及反映目标 BPMN 文件的路径，确认是否无误。
- 是否执行反映
  - 确认是否执行反映处理。若为 YES，则执行 Step1 之后的步骤；若为 NO，则中止处理。

### Step1. 反映生成脚本的路径

反映逻辑实现于 `.agents/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js` 中。以下是其概要及调用方法。

### 制作方判定

`reflect()` 在读取 BPMN 时，会通过 `detectVendor(xml)` 根据命名空间声明自动判定制作方，并将判定结果传递给后续的 `applyXxxFormKey` 调用。根据判定结果，所赋予的 `formKey` 属性名会随之切换。

| 制作方 | 判定条件 |
|---------|---------|
| `im-bpm`（IM-BPM 制作） | 包含 `xmlns:activiti="http://activiti.org/bpmn"` |
| `igrafx`（iGrafx 制作） | 命名空间 URI 中包含 `www.igrafx.com` |
| `other`（其他） | 不符合上述任何一项 |

单独调用 `applyStartEventFormKey` / `applyUserTaskFormKey` 时，需在末尾参数中传入 `vendor`。省略时按 `other` 处理（与以往一样，不附加前缀）。

### 处理概要

| 函数 | 作用 |
|------|------|
| `detectVendor(xml)` | 根据命名空间声明判定制作方（`'im-bpm'` / `'igrafx'` / `'other'`） |
| `collectRoutingPaths(configDir)` | 从 routing-jssp-config 下的 XML 中收集 `file-mapping` 的 `path` 属性 |
| `applyStartEventFormKey(xml, eventId, featurePath, vendor)` | 为开始事件赋予 `formKey="forward:<功能路径>"`（IM-BPM 制作为 `activiti:formKey`） |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk, vendor)` | 为用户任务赋予 `formKey="forward:<功能路径>?processInstanceId=...&<pk>=..."`（IM-BPM 制作为 `activiti:formKey`） |
| `reflect(bpmnPath, routingConfigDir, mappings)` | 汇总执行以上操作，并覆盖保存 BPMN 文件（内部会执行 `detectVendor()`，自动将制作方类型传递给各个 `applyXxxFormKey`） |

### 反映目标路径的保护

`reflect()` 在写入前会通过 `isPromptCopyBpmnPath(bpmnPath)`（集中于 `bpmn-reflector-utils.js`，与 `bpmn-specs-reflector.js` 的 `reflectFixes()` 等共用）校验 `bpmnPath`。若不是 `doc/<BPM流程名>-prompt/<BPM流程名>.bpmn` 形式（＝包含复制源 `doc/<BPM流程名>.bpmn`），则抛出异常并中止处理，完全不向文件写入任何内容。这是为了无论调用方的指示是否有误，都能在代码层面强制执行上述「反映目标」中「错误：绝对不可修改复制源」这一规约而设置的保护。

**按制作方区分的属性名：**

| 项目 | IM-BPM 制作 | iGrafx・其他 |
|------|-----------|----------------|
| `formKey` 属性 | `activiti:formKey` | `formKey` |

### 调用示例

```javascript
var reflector = require('./.agents/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js');

reflector.reflect(
  'doc/purchase-order-prompt/purchase-order.bpmn',
  'src/main/conf/routing-jssp-config',
  [
    // 开始事件：formKey = "forward:/purchase/apply"
    {
      type: 'startEvent',
      elementId: 'startEvent1',
      routingXml: 'purchase_apply.xml'
    },
    // 用户任务：formKey = "forward:/purchase/approve?processInstanceId=...&orderCd=..."
    {
      type: 'userTask',
      elementId: 'approveTask',
      routingXml: 'purchase_approve.xml',
      pk: { param: 'orderCd', varName: 'orderCd' }
    }
  ]
);
```

### mappings 定义的注意事项

- `type`：指定 `'startEvent'` 或 `'userTask'`
- `routingXml`：`routing-jssp-config` 下的 XML 文件名（用于获取 `file-mapping` 的 `path`）
- `pk`（仅用户任务・可选）：需要从流程变量传递业务数据主键时指定
  - 前提是主键项已注册为流程变量，并在流程实例内传递
  - `param`：查询参数名（例如：`orderCd`）
  - `varName`：流程变量名（例如：`orderCd`）
- 已设置 `formKey` 的元素不会被覆盖（IM-BPM 制作以 `activiti:formKey` 的有无进行判定）
- 只要通过 `reflect()` 调用，制作方的判定及属性名的切换均会自动进行，调用方无需关心
