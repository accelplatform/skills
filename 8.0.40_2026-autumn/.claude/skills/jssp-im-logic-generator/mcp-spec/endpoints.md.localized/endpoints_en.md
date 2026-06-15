# MCP Server Endpoint Specification

Endpoint specification for the MCP server that provides IM-LogicDesigner task definitions.

To avoid confusion with other MCP servers, all tool names are given the `imLogic` prefix.

---

## 1. `imLogicListTaskTypes`

Returns a list of task types.
Used to locate the desired task among 300+ tasks.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `query` | string | No | Keyword search. Partial match against `keyId` / `label` / `description` / `category`. Returns all when omitted |
| `category` | string | No | Filter by category (exact match) |
| `keyType` | string | No | Filter by task type. `application` (standard task) / `userDefinition` (user-defined task) |
| `definitionType` | string | No | Filter by user-defined task type. `javascript` / `rest` / `sql` / `db_fetch` / `template`. Implies `keyType = userDefinition` |

### Response

See [imLogicListTaskTypes.response.json](schemas/imLogicListTaskTypes.response.json).

### Call Examples

```jsonc
// Fetch all
{ "method": "imLogicListTaskTypes", "params": {} }

// Keyword search
{ "method": "imLogicListTaskTypes", "params": { "query": "authorization" } }

// Category filter
{ "method": "imLogicListTaskTypes", "params": { "category": "Repository" } }

// User-defined tasks only
{ "method": "imLogicListTaskTypes", "params": { "keyType": "userDefinition" } }

// Template-type user-defined tasks only
{ "method": "imLogicListTaskTypes", "params": { "definitionType": "template" } }
```

### Notes

- Even when fetching all, the result holds only summaries and is expected to stay around a few tens of KB
- Tasks with `hasEntityId: true` require an additional `imLogicResolveEntitySchema` call when authoring the spec (always `false` for user-defined tasks)
- In addition to standard tasks (`keyType = "application"`), user-defined tasks registered in the tenant (`keyType = "userDefinition"`) are also included. User-defined tasks are distinguished by `definitionType` (`javascript` / `rest` / `sql` / `db_fetch` / `template`). See [reference/user-definitions.md](../reference/user-definitions.md) for the structure of user-defined tasks

---

## 2. `imLogicGetTaskTemplate`

Returns the complete template for a single specified task type.
Includes all the information `build-flow.js` consumes.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keyId` | string | Yes | Task type ID. For standard tasks, the task type ID (e.g. `im_authorizeAuthz`); for user-defined tasks, the `definitionId` (e.g. `mail_sender`) |
| `keyType` | string | Yes | Filter by task type. `application` (standard task) / `userDefinition` (user-defined task) |

### Response

See [imLogicGetTaskTemplate.response.json](schemas/imLogicGetTaskTemplate.response.json).

### Call Examples

```jsonc
// Standard task
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "im_authorizeAuthz" } }

// User-defined task (specify definitionId)
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "mail_sender" } }
```

### Notes

- For entity tasks (`hasEntityId: true`), `dataMapMetadata.inputDataDefinition` / `outputDataDefinition` return the default for an unspecified entity (empty or generic schema). Obtain the entity-specific types via `imLogicResolveEntitySchema` and override them
- `cellSample`'s `id` / `position` / `z` are overwritten by build-flow.js, so the values in the template are placeholders
- `optionMap`'s `title` / `label` are likewise overwritten
- For user-defined tasks (`keyType = "userDefinition"`), `flowElementSample.properties` has the structure `{ definition: { definitionId, definitionType, definitionData: { elementId, elementProperties, inputDataDefinition, outputDataDefinition }, localize, ... }, continueOnError }`. The contents of `elementProperties` differ per `definitionType` (`javascript`: `{ script }`, `sql`: `{ query, queryType, ... }`, etc.). See [reference/user-definitions.md](../reference/user-definitions.md) for details
- A user-defined task's `inputDataDefinition` / `outputDataDefinition` are defined freely by the user on the tenant side and do not need to be overridden via `imLogicResolveEntitySchema`

---

## 3. `imLogicListEntities`

Returns a list of IM-Repository entities.
Used to identify the `entityId` for flows that take/return an entity as input/output, or for entity tasks.
**Because `imLogicResolveEntitySchema` can hang when passed a non-existent `entityId`, first identify a real `entityId` with this endpoint before passing it.**

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `query` | string | No | Keyword search. Partial match against `entityId` / `entityName` / `category` / `description`. Returns all when omitted |
| `category` | string | No | Filter by category (exact match) |
| `dataSourceType` | string | No | Filter by data source type. `table` / `view` / `query` / `static` / `webservice` |

### Response

See [imLogicListEntities.response.json](schemas/imLogicListEntities.response.json).

### Call Examples

```jsonc
// Fetch all
{ "method": "imLogicListEntities", "params": {} }

// Keyword search (partial match on display name / ID)
{ "method": "imLogicListEntities", "params": { "query": "rich text" } }

// Category filter
{ "method": "imLogicListEntities", "params": { "category": "Portlet" } }
```

### Notes

- A lightweight summary that does not include field (column) definitions. Obtain field definitions via `imLogicResolveEntitySchema` (the same two-step approach as `imLogicListTaskTypes` ⇒ `imLogicGetTaskTemplate`)
- `entityId` and `entityName` are required. `category` / `dataSourceType` / `description` may be omitted
- Even when fetching all, it holds only summaries and is expected to stay lightweight

---

## 4. `imLogicResolveEntitySchema`

Dynamically resolves and returns a task's input/output field definitions based on an entity ID.
Fetches the entity schema from IM-Repository and builds `inputDataDefinition` / `outputDataDefinition` according to the task type.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keyId` | string | Yes | Task type ID (e.g. `im_repositorySearchEntityData`) |
| `entityId` | string | Yes | Entity ID (e.g. `imprtl_portlet_info_tables_imprtl_portlet_info`) |

### Response

See [imLogicResolveEntitySchema.response.json](schemas/imLogicResolveEntitySchema.response.json).

### Call Example

```jsonc
{
  "method": "imLogicResolveEntitySchema",
  "params": {
    "keyId": "im_repositorySearchEntityData",
    "entityId": "imprtl_portlet_info_tables_imprtl_portlet_info"
  }
}
```

### Notes

- The returned `inputDataDefinition` / `outputDataDefinition` are used to override the same fields inside the `dataMapMetadata` of the template obtained via `imLogicGetTaskTemplate`
- If the entity is not found, the server throws an exception and the tool call fails (see "Error Behavior" at the end for details). Pass only existing `entityId` values

---

## 5. `imLogicListMappingFunctions`

Returns a list of functions usable in mapping.
Used when value conversion/processing is needed in variable-to-variable mapping.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `query` | string | No | Keyword search. Partial match against `name` / `label` / `description` / `category`. Returns all when omitted |
| `category` | string | No | Filter by category (exact match) |

### Response

See [imLogicListMappingFunctions.response.json](schemas/imLogicListMappingFunctions.response.json).

### Call Examples

```jsonc
// Fetch all
{ "method": "imLogicListMappingFunctions", "params": {} }

// Keyword search
{ "method": "imLogicListMappingFunctions", "params": { "query": "array" } }

// Category filter
{ "method": "imLogicListMappingFunctions", "params": { "category": "String operations" } }
```

### Notes

- About 50 entries currently. Lightweight (a few KB) even when fetching all
- `argCount` gives a rough number of arguments. Get details via `imLogicGetMappingFunction`

---

## 6. `imLogicGetMappingFunction`

Returns the complete definition of a specified function.
Includes the argument schema, return type, and usage examples.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Function name (e.g. `im_array_size`) |

### Response

See [imLogicGetMappingFunction.response.json](schemas/imLogicGetMappingFunction.response.json).

### Call Example

```jsonc
{ "method": "imLogicGetMappingFunction", "params": { "name": "im_array_size" } }
```

### Notes

- The order of `arguments[]` corresponds to the index of `mappingRules.source.arguments[]`
- `examples[]` includes usage examples. They serve as material for a coding agent to assemble a correct `source` structure
- Function nesting (passing another function as an argument) can be expressed with the recursive structure of `mappingSource`

---

## Usage Flow

1. `imLogicListTaskTypes(query?, keyType?, definitionType?)` ⇒ `imLogicGetTaskTemplate(keyId)`
   - Identify the `keyId` of the task that fits the purpose (standard task or user-defined task)
   - Get the template (equivalent to `build-flow.js`'s `task-templates/*.json`)
   - User-defined tasks can be filtered by `keyType = userDefinition` or `definitionType`

2. `imLogicListEntities(query?, category?)` ⇒ `imLogicResolveEntitySchema(keyId, entityId)`  * Only when using entities
   - Identify a real `entityId` with `imLogicListEntities` (for `hasEntityId: true` tasks, or flows that use entities as input/output)
   - Obtain entity-specific input/output type definitions with `imLogicResolveEntitySchema`
   - Override the template's `dataMapMetadata.inputDataDefinition` / `outputDataDefinition` (reuse as type definitions when used for flow input/output)
   - **Do not pass a guessed `entityId` to `imLogicResolveEntitySchema`** (to avoid hangs; always pass a value identified via `imLogicListEntities`)
   - Not needed for user-defined tasks

3. `imLogicListMappingFunctions(query?)` ⇒ `imLogicGetMappingFunction(name)`  * Only when value conversion/processing is needed
   - Get the names and argument definitions of functions used in mapping

4. Assemble `spec.json` and run `build-flow.js`

## Error Behavior

Common to all endpoints.

When a non-existent `keyId` / `name` / `entityId`, etc. is specified, the server **does not return a structured error response (JSON); instead it throws an exception on the server side and makes the tool call itself fail**.

The server log outputs something like the following.

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] Failed to execute the tool.
java.lang.IllegalArgumentException: Task type not found. keyId=im_no_such_task, keyType=application
```

**Caution (for coding agents):**

- When a tool call fails (exception), the caller (MCP client) cannot receive a response and **may end up in a waiting state (hang)**.
- Therefore, when calling `imLogicGetTaskTemplate` / `imLogicGetMappingFunction` / `imLogicResolveEntitySchema`, do not pass guessed non-existent IDs.
- First identify real `keyId` / `name` values with the listing endpoints (`imLogicListTaskTypes` / `imLogicListMappingFunctions`), and pass only those values to the detail endpoints.
- For entities (`hasEntityId: true`) as well, pass only existing `entityId` values to `imLogicResolveEntitySchema`.
