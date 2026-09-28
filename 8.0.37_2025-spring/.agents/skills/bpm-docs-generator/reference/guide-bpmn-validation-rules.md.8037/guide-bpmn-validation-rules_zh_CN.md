# 输入规则定义规范（rules.json）

本文档定义了 BPMN 验证中使用的输入规则定义文件（`rules.json`）的规范。
主要目的是「确保规则描述的一致性」和「明确包含实现依赖行为的解释规则」。

## 1. 适用范围

- 对象：以 `--rules <rules.json>` 形式读取的输入规则定义
- 格式：JSON 数组（规则条目列表）
- 单位：1 条目 = 1 个选择条件 + 1 个验证目标值 + 1 个约束集

## 2. 规则条目规范

### 2.1 结构

```jsonc
{
  "id": "process.id",                 // 必需。违规标识符
  "selector": "bpmn:Process",         // 必需。验证目标 BPMN 类型
  "path": "id",                       // 必需。从 selector 匹配的元素中获取值的路径
  "label": "process id",              // 可选。显示名称（省略时使用 path）
  "when": { "activiti:type": "mail" }, // 可选。对 selector 匹配元素的属性过滤器
  "forEach": { "extensionType": "activiti:in" }, // 可选。子元素迭代
  "rule": { "required": true, "maxLength": 255 } // 必需。约束定义
}
```

### 2.2 必需项目

- `id`
- `selector`
- `path`
- `rule`

在实现中，缺少 `selector` 或 `path` 的条目会被忽略。省略 `rule` 时视为空对象，省略 `id` 时会在错误消息的上下文中用 `label`（或 `path`）代替。
本文档将 `id` 视为规范上的必需项目（实现侧的替代行为是为了向后兼容而存在的行为；新建规则定义时必须始终赋予 `id`）。

### 2.3 解释规则

- `selector` 会递归遍历 BPMN 树，并应用于所有匹配的元素。
- 当同一 `selector` 存在多个匹配时，每个元素独立判定。
- 对同一对象施加多个约束时，可以在 `rule` 内定义多个键。
- 当 `path` 或 `when` 不同时，应拆分为不同的条目。

## 3. 错误消息规范

输出示例：

```
ERROR: [input(mailTask.to.required)] mail task field[to] (ServiceTask#mail-task_1) is required
```

- `[input(...)]` 使用规则条目的 `id`（必需项目）。
- `label (...)` 包含用于识别违规实例的信息。
- 作为向后兼容，对于省略了 `id` 的规则，`[input(...)]` 中的 `...` 会用 `label`（未指定时用 `path`）代替。
- 如果作为违规位置的 BPMN 元素本身没有 `id` 属性，则使用具有 `id` 属性的最近祖先元素作为标识符（此处的 `id` 与规则条目的 `id` 是不同的概念，指的是 BPMN 元素侧的 `id` 属性）。

## 4. path 记法规范

`path` 以 `.` 分隔进行求值。

| 片段 | 含义 |
|---|---|
| `id` / `name` / `isExecutable` | 普通属性 |
| `activiti:type` / `activiti:class` | 命名空间属性（有 `$attrs` 回退机制） |
| `errorRef` / `messageRef` / `signalRef` | 引用属性（IDREF） |
| `field(<name>)` | 选择 `activiti:field[name=<name>]` |
| `value` | 子元素（`activiti:string`/`activiti:expression`）的值 |
| `text` | FormalExpression 系元素的正文 |

使用 `field(<name>).value` 可以用 1 条规则表达字段存在、子元素存在、值输入等多种检查。

- 当同一 `extensionElements` 内存在多个同名的 `activiti:field` 时，`field(<name>)` 仅选择第一个（按 XML 出现顺序排在最前的）；第二个及以后的会被忽略。
- 同一 `extensionElements` 内 `activiti:field` 的 name 重复本身，基于「同一元素内 `activiti:field` 的 name 应保持唯一」的前提，与输入规则（`path`/`rule`）分开，作为 BPMN 模型自身的结构检查（`[model]` 上下文），始终进行检测并作为错误处理。

```jsonc
{
  "id": "mailTask.to.required",
  "selector": "bpmn:ServiceTask",
  "when": { "activiti:type": "mail" },
  "path": "field(to).value",
  "label": "mail task field[to]",
  "rule": { "required": true }
}
```

## 5. 引用属性（IDREF）的处理

- `errorRef` / `messageRef` / `signalRef` 在引用解析失败时会产生模型警告。
- 仅当对应输入规则的 `path` 实际被求值，并成功获取到未解析引用的原始值（moddle 无法解析的原始字符串）时，才会将该模型警告标记为已消费并加以抑制（这是一种基于同一元素×同一属性名完全匹配来判定的确定性机制，不存在模糊的启发式判断）。
- 如果输入规则本身未定义，或 `path` 匹配但未能获取到原始值，则该引用属性的失败不会被消费，最终会作为模型警告输出。
- `itemSubjectRef` 是 IM-BPM 独有扩展的项目，用于引用以确定 `dataObject` 的类型（数据类型）。它被视为不在标准 BPMN 引用完整性验证的范围内，因此其引用解析失败始终作为抑制对象。

## 6. when 规范（selector 匹配元素过滤器）

```jsonc
"when": { "activiti:type": "mail" }
```

```jsonc
"when": { "activiti:type": ["applyworkflow", "draftworkflow"] }
```

- 单一值：完全匹配
- 数组值：OR 匹配
- 多个键：AND 匹配

`when` 是针对 `selector` 所选中的元素本身进行求值的（不进行父元素搜索）。

当 `bpmn:ServiceTask` 这种同一类型混合多种用途时，必须通过 `when` 进行分类（这是运营规约上的强制要求，并非由实现机械强制执行）。

## 7. forEach 规范（子元素迭代）

用于验证仅凭 `path` 难以表达的多个子元素。

| 描述 | 对象 |
|---|---|
| `{ "extensionType": "activiti:in" }` | `extensionElements` 下指定类型的元素 |
| `{ "extensionFieldPrefix": "inputData_" }` | `name` 前缀匹配的 `activiti:field` |

指定 `forEach` 时，`path` 将成为相对于迭代对象子元素的相对指定。

`when` 会在迭代前对父级（`selector` 匹配的元素）进行求值。当 `forEach` 中同时指定 `extensionFieldPrefix` 和 `extensionType` 时，`extensionFieldPrefix` 优先。
当 `forEach` 的迭代对象为 0 件时，该条目本身不会产生违规（如需要求最少数量，应在其他条目中定义 `required` 等）。

```jsonc
{
  "id": "callActivity.in.target.maxLength",
  "selector": "bpmn:CallActivity",
  "forEach": { "extensionType": "activiti:in" },
  "path": "target",
  "label": "callActivity in target",
  "rule": { "maxLength": 255 }
}
```

`when` 与 `forEach` 可以并用。

## 8. rule 约束规范

| 键 | 规范 |
|---|---|
| `required: true` | 禁止空值（未设置・空字符串） |
| `requiredIfPresent: true` | 仅当 XML 上明确标注了该属性时才禁止空字符串（省略属性本身不算错误） |
| `requiredIf: { "path": "...", "equals": 值 }` | 仅在条件成立时才要求必填 |
| `requiredGroup: ["a", "b", ...]` | 要求列举的路径中至少有一个 |
| `invalidValues: ["ticket:"]` | 禁止与列举值完全一致 |
| `format: "regex"` | 要求匹配正则表达式（不加 `^...$` 时可能变为部分匹配） |
| `maxLength: number` | 最大字符数 |
| `requiredPrefix: ["${", "#{"]` | 要求具有指定前缀之一 |
| `invalidPrefix: ["urn:"]` | 禁止指定前缀 |
| `requiredWithoutPrefix: true` | 去除开头到 `:` 为止的部分后，禁止空值 |
| `requiredWithoutPrefixIf: { "path": "...", "equals": 值 }` | 上述规则的条件版本 |

`requiredIfPresent` 应用于单段 `path`（例如：`activiti:version`、`field(to)`）。不推荐用于复合 `path`（例如：`field(to).value`），因为「属性明确标注」的判定粒度与规范意图不一致。

评估按本表所列顺序（`required` → `requiredIfPresent` → `requiredIf` → `invalidValues` → `requiredGroup` → `format` → `maxLength` → `requiredPrefix` → `invalidPrefix` → `requiredWithoutPrefix`）固定进行，一旦某约束违规即终止判定（每个条目・每个元素最多 1 件）。JSON 中 `rule` 对象内键的书写顺序不影响评估顺序。
`requiredWithoutPrefixIf` 作为决定 `requiredWithoutPrefix` 是否适用的前置条件进行评估（并非独立阶段）。
此顺序被硬编码在 `validateInputRuleOnElement()`（validate-bpmn.js）中。新增或变更约束键时，需同时更新本表与 `validateInputRuleOnElement()` 的实现顺序，使两者保持一致。
若需要独立验证多个观点，请拆分为多个条目。

## 9. 运营指南

- 如需自定义规则，可复制 `scripts/rules-validate-default.json` 中的条目进行调整。
- 用 `path` + `rule` 难以表达的验证（相互引用完整性、DSL 解释等）不应通过规则定义处理，而应在实现侧通过自定义验证处理。
- 新增规则时，必须通过 `when` 明确区分对象类型的差异（尤其是 `ServiceTask`）。
