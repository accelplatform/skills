# mappingRules.source.path Root Reference

When `source.type` is `"value"`, `path` starts from one of the following roots.

| Root | Usage | Example |
|---|---|---|
| `$input/...` | Input data (values defined in `inputDataDefinition`) | `$input/input/portletId` |
| `$output/...` | Writing to output data (used on the `target` side) | `$output/data/articleCount` |
| `$variable/...` | Flow variables (defined in `variablesDataDefinition`) | `$variable/tempCount` |
| `$const/<NAME>` | Constants (`constants[].name`) | `$const/ACTION_CONFIG` |
| `$session_properties/...` | System session information | `$session_properties/systemDate` |
| `$account_context/...` | Logged-in user information | `$account_context/userCd`, `$account_context/locale` |
| `<executeId>/<field>` | Output of the preceding task | `im_repositorySearchEntityCount1/count` |
| `<executeId>` | Output of the preceding task (entire object) | `im_repositorySearchEntityData1` |

## Target Side

`mappingRules.target` follows the same root convention, but the most commonly used are:

- `$output/...` — Writing to flow output
- `$variable/...` — Writing to flow variables
- `<executeId>/<inputField>` — Binding to a task's input field
  - Example: `im_repositoryEntityDataUpdate1/portletId`

## Where to Define Mappings

mappingRules are defined on the **task that receives the data**.

| What You Want to Do | Task Where mappingRules are Defined | Example |
|---|---|---|
| Set input values for a task | The task itself | In the mappingRules of `im_repositorySearchEntityCount1`, map `$input/entityId` to input |
| Write to flow variables | The task immediately after the write | In the next task's mappingRules, map `source` → `$variable/temp` |
| Write to flow output (`$output`) | **`im_end`** (end task) | In `im_end`'s mappingRules, map `source` → `$output/body` |

**Important:** Writing to `$output/...` must always be defined in the mappingRules of the `im_end` task.
Defining it in other tasks will cause a `MappingException: property ... not found` error.

## Delimiter Characters

- Path separator is `/`
- Nested objects use `parent/child/grandchild`
- Array elements are handled internally by IM-LogicDesigner; subscripts do not normally appear in paths (the entire array is passed)
