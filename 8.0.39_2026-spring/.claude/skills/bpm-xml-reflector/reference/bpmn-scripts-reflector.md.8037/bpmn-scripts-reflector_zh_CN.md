# BPMN 脚本反映器

## 概要
解析 BPMN 格式的 XML，并将生成的脚本内容反映到 BPMN 中。

## 使用时机
当用户提出如下请求时：
- 「希望将生成脚本的内容反映到 BPMN XML 中」

## 反映目标
- 正确：`doc/<BPM流程名>-prompt/<BPM流程名>.bpmn`（复制目标。只能反映到此文件）
- 错误：`doc/<BPM流程名>.bpmn`（复制来源。**绝对不可改写**）

## 反映到 BPMN XML 的内容
- 本技能集执行以下操作。
  - 将生成的脚本路径和参数添加到 BPM 的开始事件或用户任务中

## 实施步骤

### 步骤 0. 确认对象
- 确认作为反映来源的生成脚本的配置信息与反映目标文件。
  - 提示作为反映来源的生成脚本配置信息的路径与反映目标 BPMN 文件的路径，确认是否有误。
- 是否实施反映
  - 确认是否实施反映处理。若为 YES，则执行步骤 1 及之后的步骤。若为 NO，则中止处理。

### 步骤 1. 反映生成脚本的路径

反映逻辑实现于 `.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js`。以下为其概要与调用方法。

### 处理概要

| 函数 | 作用 |
|------|------|
| `collectRoutingPaths(configDir)` | 从 routing-jssp-config 下的 XML 中收集 `file-mapping` 的 `path` 属性 |
| `applyStartEventFormKey(xml, eventId, featurePath)` | 为开始事件添加 `formKey="forward:<功能路径>"` |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk)` | 为用户任务添加 `formKey="forward:<功能路径>?processInstanceId=...&<pk>=..."` |
| `reflect(bpmnPath, routingConfigDir, mappings)` | 汇总执行上述处理，并覆盖保存 BPMN 文件 |

### 调用示例

```javascript
var reflector = require('.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector');

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
- `pk`（仅用户任务・可选）：在将业务数据的主键从流程变量传递时指定
  - 前提是主键项目已注册为流程变量，并在流程实例内进行传递
  - `param`：查询参数名（例：`orderCd`）
  - `varName`：流程变量名（例：`orderCd`）
- 已设置 `formKey` 的元素不会被覆盖
