# mappingRules.source.path 起点参考

当 `source.type` 为 `"value"` 时，`path` 从以下起点之一开始。

| 起点 | 用途 | 示例 |
|---|---|---|
| `$input/...` | 输入数据（在 `inputDataDefinition` 中定义的值） | `$input/input/portletId` |
| `$output/...` | 写入输出数据（用于 `target` 侧） | `$output/data/articleCount` |
| `$variable/...` | 流变量（在 `variablesDataDefinition` 中定义） | `$variable/tempCount` |
| `$const/<NAME>` | 常量（`constants[].name`） | `$const/ACTION_CONFIG` |
| `$session_properties/...` | 系统会话信息 | `$session_properties/systemDate` |
| `$account_context/...` | 登录用户信息 | `$account_context/userCd`, `$account_context/locale` |
| `<executeId>/<field>` | 前一任务的输出 | `im_repositorySearchEntityCount1/count` |
| `<executeId>` | 前一任务的输出（整个对象） | `im_repositorySearchEntityData1` |

## target 侧

`mappingRules.target` 遵循相同的起点规范，但常用的有：

- `$output/...` — 写入流输出
- `$variable/...` — 写入流变量
- `<executeId>/<inputField>` — 绑定到任务的输入字段
  - 示例：`im_repositoryEntityDataUpdate1/portletId`

## 映射的定义位置

mappingRules 定义在**接收数据的任务**上。

| 目标操作 | 定义 mappingRules 的任务 | 示例 |
|---|---|---|
| 设置任务的输入值 | 该任务本身 | 在 `im_repositorySearchEntityCount1` 的 mappingRules 中，将 `$input/entityId` 映射到输入 |
| 写入流变量 | 写入操作后紧跟的任务 | 在下一个任务的 mappingRules 中，将 `source` 映射到 `$variable/temp` |
| 写入流输出（`$output`） | **`im_end`**（结束任务） | 在 `im_end` 的 mappingRules 中，将 `source` 映射到 `$output/body` |

**重要：** 向 `$output/...` 的写入必须始终定义在 `im_end` 任务的 mappingRules 中。
定义在其他任务中会导致 `MappingException: property ... not found` 错误。

## 分隔符

- 路径分隔符为 `/`
- 嵌套对象使用 `parent/child/grandchild`
- 数组元素由 IM-LogicDesigner 内部处理，通常在路径中不会出现下标（传递整个数组）
