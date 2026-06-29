# IM-Workflow Import XML Structure Reference

## Overview

The IM-Workflow import XML is an XML file used to bulk-import workflow definitions.
The encoding is `UTF-16`, the root element is `<data>`, and each definition element uses the `type` attribute to indicate the value type.

### Escaping XML Special Characters

When element values contain special characters, always escape them.
Failing to escape will cause a SAXParseException during import.

| Character | Escape | Common Locations |
|-----------|--------|-----------------|
| `<` | `&lt;` | Rule name condition expressions (e.g., `Amount<10000` → `Amount&lt;10000`) |
| `>` | `&gt;` | Rule name condition expressions (e.g., `Amount>=50000` → `Amount&gt;=50000`) |
| `&` | `&amp;` | When a name contains `&` |
| `"` | `&quot;` | Inside attribute values |
| `'` | `&apos;` | Inside attribute values |

**Special note:** Comparison operators in rule names (`ruleName`) are a very common source of unescaped characters.
Japanese names (e.g., `Unit price under 20000`) have no problem, but English names (e.g., `UnitPrice<20000`) are prone to this issue.

## Overall Structure

```xml
<?xml version="1.0" encoding="UTF-16"?>
<data>
  <contents id="{contentsId}">...</contents>      <!-- Content definition -->
  <route id="{routeId}">...</route>                <!-- Route definition -->
  <flow id="{flowId}">...</flow>                   <!-- Flow definition -->
  <matter_property id="{key}">...</matter_property> <!-- Matter property (Phase 2) -->
  <rule id="{ruleId}">...</rule>                   <!-- Branch rule (Phase 2) -->
  <mail id="{mailId}">...</mail>                   <!-- Mail notification (Phase 3) -->
  <imBox id="{imBoxId}">...</imBox>                <!-- IMBox notification (Phase 3) -->
  <list_pattern id="{patternId}">...</list_pattern> <!-- List pattern (Phase 3) -->
  <message_template id="{templateId}">...</message_template> <!-- Message (Phase 3) -->
</data>
```

**Important: The tag names directly under `<data>` must be strictly as listed above.**
Do not use custom tag names (e.g., `<contentsDataList>`, `<routeDataList>`, `<contentsData>`, `<contentsVersion>`, etc.).
The IM-Workflow importer only recognizes the fixed tag names above.
The internal structure of each definition element must also use the property names as-is (`contentsId`, `routeId`, `flowId`, `details`, `pages`, etc.).

## Type Attributes

Each XML element explicitly declares its value type via the `type` attribute.

| type value | Meaning | Example |
|------------|---------|---------|
| `string` | String | `<flowId type="string">flow_01</flowId>` |
| `number` | Number | `<x type="number">50</x>` |
| `array` | Array | `<value type="array"><value type="object">...</value></value>` |
| `object` | Object | `<value type="object"><key type="string">val</key></value>` |
| `null` | Null value | `<note type="null" />` |

## Locale Structure

All definition elements list entries for 3 locales (`en`, `ja`, `zh_CN`) within `<value type="array">`.
Each locale has a `localeId` to localize names and other fields.

### Items with and without Multi-language Support

| Item | Multi-language | Description |
|------|---------------|-------------|
| contentsName | Yes | Content name |
| routeName | Yes | Route name |
| flowName | Yes | Flow name |
| pageName | Yes | Page name |
| ruleName | Yes | Rule name |
| matterPropertyName | Yes | Matter property name |
| **nodeName** | **No** | **Use the same English name in all locales** |

**Important: `nodeName` (node name) does not support multiple languages.**
Because node names are displayed without regard to language in the IM-Workflow route editor, set the same English name in all locales (en / ja / zh_CN).
Setting Japanese or Chinese node names may cause inconsistencies during export and re-import.

```xml
<contents id="contents_sample">
  <value type="array">
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">en</localeId>
      <contentsName type="string">English name</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">ja</localeId>
      <contentsName type="string">日本語名</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">zh_CN</localeId>
      <contentsName type="string">中文名</contentsName>
      ...
    </value>
  </value>
</contents>
```

## Version Structure

Per IM-Workflow specification, a version covering the full period from `2000/01/01` to `2999/12/31` is required.
Periods without registered definitions are filled with `versionStatus=9` (blank period).

The `details` array of each definition must always have exactly 2 versions.
Set the `startDate` of the active version to the XML generation date (today), and set the `limitDate` of the blank period to the day before that date.

| Version | startDate | limitDate | versionStatus | Purpose |
|---------|-----------|-----------|---------------|---------|
| Blank period | 2000/01/01 | **Day before generation date** (e.g., `2026/03/31`) | 9 | Period with no registered definition (empty data) |
| Active | **Generation date** (e.g., `2026/04/01`) | 2999/12/31 | 1 | Valid data in use |

### versionStatus Values

| Value | Description |
|-------|-------------|
| 0 | Inactive (definition is registered but temporarily disabled) |
| 1 | Active (in use) |
| 9 | Blank period (dummy to fill periods with no registered definitions) |

Version ID naming convention: `{parentId}_{sequential number}` (zero-based sequential number, e.g., `cnt_purchase_0`, `cnt_purchase_1`, ...)

---

## 1. contents (Content Definition)

Contents define the page paths used in the workflow.

### Main Properties

| Property | Type | Description |
|----------|------|-------------|
| contentsId | string | Content ID (unique) |
| localeId | string | Locale ID (en/ja/zh_CN) |
| contentsName | string | Content name |
| contentsType | string | `0` = Script development model |
| updateCount | string | Update count (`1`) |

### pages (Page Path Definition)

Define page paths in the `pages` array of the active version.

| Property | Type | Description |
|----------|------|-------------|
| pagePathId | string | Page path ID (`{prefix}_page_{sequential number}`) |
| pageName | string | Page name |
| pageType | string | Page type (see table below) |
| defaultFlag | string | `1` = Default |
| pathType | string | `0` = Script path |
| scriptPath | string | JSSP file path (without extension, relative path from `src/main/jssp/src/`). **Specify according to the actual file location.** If the file is `apply/index.js`, specify `{basePath}/apply/index` (e.g., `wf_auto_parts/apply/index`). This is not the routing URL path. |
| applicationId | string/null | Used for Java EE |
| serviceId | string/null | Used for Java EE |
| pagePath | string/null | Used for Java EE |

### pageType (Page Type)

| Value | Page Type | Description |
|-------|-----------|-------------|
| 0 | Application page | Input page for new applications |
| 1 | Temporary save page | Resume page from temporary save |
| 2 | Application (processing) page | Application business page |
| 3 | Re-application page | Re-application page after being sent back |
| 4 | Processing page | Processing page for approval/denial/sendback |
| 5 | Confirmation page | Viewing page for confirming parties |
| 6 | Processing detail page | Detail page for processed matters |
| 7 | Reference detail page | Detail page for reference |

### rules (Rule Association)

Describe references to rule definitions used in the `rules` array of the **active version** of the content.
Without this association, even if rule definitions are imported, they will not be linked to the content definition.

| Property | Type | Description |
|----------|------|-------------|
| contentsRuleId | string | Rule ID to associate (matches `ruleId` in the `rule` section) |
| contentsId | string | Content ID |
| contentsVersionId | string | Content version ID |
| ruleData | string/null | Rule data (usually null) |

```xml
<rules type="array">
  <value type="object">
    <contentsRuleId type="string">{{ruleId}}</contentsRuleId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <ruleData type="null" />
  </value>
</rules>
```

**Note:** Leave the `rules` of blank period versions (versionStatus=9) as empty arrays.

### plugins (Content Plugins)

Describe references to plugin programs in the `plugins` array of the **active version** of the content.
Plugin types are distinguished by `exPointId`.

**When to include:**
- **When using matter properties (branch routes, etc.)**: Required. Specify an action process on the application node to save form data to matter properties when applying. Without this setting, errors occur when evaluating branch conditions.
- **When not using matter properties (straight routes, etc.)**: An empty array is acceptable if no action processing is needed. Include if business logic (DB save, etc.) is performed as action processing.
- **User program-type branching**: Branch condition program registration is required.

#### Action Process Plugin

| Property | Type | Description |
|----------|------|-------------|
| contentsPluginId | string | Plugin ID (random ID, 15 chars, `[0-9A-Za-z]`, shared across locales) |
| localeId | string | Locale ID |
| contentsId | string | Content ID |
| contentsVersionId | string | Content version ID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.action.process` |
| pluginId | string | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor` |
| pluginName | string | Plugin name (arbitrary) |
| parameter | string | JSSP file path for action processing (without extension) |
| nodeType | string | Node type number (see numeric codes in `reference/node-types.md`). Specify `2` for use in application nodes. |
| defaultFlag | string | `1` |
| executeOrder | string | `0`, `1`, ... (sequential number per plugin) |

```xml
<plugins type="array">
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
    <pluginName type="string">action_process</pluginName>
    <parameter type="string">{{actionProcessPath}}</parameter>
    <nodeType type="string">2</nodeType>
    <defaultFlag type="string">1</defaultFlag>
    <executeOrder type="string">0</executeOrder>
    <note type="string" />
  </value>
</plugins>
```

#### Branch Condition Plugin (Used for user program-type branching)

| Property | Type | Description |
|----------|------|-------------|
| contentsPluginId | string | Plugin ID (random ID, 15 chars, `[0-9A-Za-z]`, shared across locales). Referenced as `cooperationId` in flow details. |
| localeId | string | Locale ID |
| contentsId | string | Content ID |
| contentsVersionId | string | Content version ID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` |
| pluginId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` |
| pluginName | string | Plugin name (arbitrary) |
| parameter | string | JSSP file path for the branch condition program (without extension) |
| nodeType | string | Empty string |
| defaultFlag | string | `0` |
| executeOrder | string | `0`, `1`, ... (sequential number per plugin) |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId_rule}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
  <pluginName type="string">{{pluginName}}</pluginName>
  <parameter type="string">{{ruleScriptPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">0</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>
```

#### Matter End Process Plugin

| Property | Type | Description |
|----------|------|-------------|
| contentsPluginId | string | Plugin ID (random ID, shared across locales) |
| localeId | string | Locale ID |
| contentsId | string | Content ID |
| contentsVersionId | string | Content version ID |
| exPointId | string | With transaction: `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process` / Without transaction: `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process.no.transaction` |
| pluginId | string | `{exPointId}.pluginScriptExecutor` |
| pluginName | string | `matter_end_process` |
| parameter | string | JSSP file path for the matter end process (without extension) |
| nodeType | string | Empty string |
| defaultFlag | string | `1` |
| executeOrder | string | Sequential number after action process plugins |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process.pluginScriptExecutor</pluginId>
  <pluginName type="string">matter_end_process</pluginName>
  <parameter type="string">{{matterEndProcessPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">1</executeOrder>
  <note type="null" />
</value>
```

**Note:** Leave the `plugins` of blank period versions (versionStatus=9) as empty arrays.

---

## 2. route (Route Definition)

Routes define the node configuration and connection relationships of the workflow.

### Main Properties

| Property | Type | Description |
|----------|------|-------------|
| routeId | string | Route ID (unique) |
| routeName | string | Route name |
| routeType | string | `0` = Standard |

### routeXmlFile (Route Definition Body)

Describe the node configuration in the `routeXmlFile` of the active version.

```xml
<routeXmlFile type="object">
  <routeId type="string">{routeId}</routeId>
  <routeVersionId type="string">{routeVersionId}</routeVersionId>
  <routeType type="string">0</routeType>
  <nodes type="array">
    <!-- Array of node definitions -->
  </nodes>
  <comments type="array" />
  <swimlanes type="array" />
</routeXmlFile>
```

### nodes (Node Definition)

Structure of each node:

| Property | Type | Description |
|----------|------|-------------|
| nodeId | string | Node ID (unique) |
| nodeName | string | Node display name (**max 100 bytes, use the same English name in all locales**) |
| nodeType | string | Node type number (see numeric codes in `reference/node-types.md`) |
| nodeVariety | string | `system` / `human` |
| previousNodeIds | array | Array of preceding node IDs |
| nextNodeIds | array | Array of following node IDs |
| plugins | array | Array of authority plugins |
| x | number | X coordinate (position in route editor) |
| y | number | Y coordinate |
| startNodeFlag | string | `true` = start node |
| endNodeFlag | string | `true` = end node |
| traceId | string | Trace ID (see rules below) |
| routeTemplateId | null/string | Template route ID |
| routeTemplateName | null/string | Template route name |
| parentNode | string/null | Parent node ID |

### traceId Rules

| Node Type | traceId | Example |
|-----------|---------|---------|
| Start / End | `0.0` | `0.0` |
| Straight node (Apply, Approve) | `0.{sequential number}` | `0.1`, `0.2`, `0.3` |
| Branch_Start / Branch_End (same value as a pair) | `{next sequential number after preceding node}-0.0` | `0.3-0.0` |
| Nodes inside branch paths | `{branch traceId prefix}-{path number}.{node number}` | `0.3-1.1`, `0.3-2.1` |

- Branch_Start and its corresponding Branch_End share the **same traceId** (used to identify the pair)
- Horizontal/Vertical layout nodes also end with `-0.0` (at the route definition stage, the suffix is always `-0.0`)
- Path numbers start from `1`. Node numbers also start from `1`.
- The "straight-through path" (direct connection from Branch_Start to Branch_End) uses path number `1`.

#### Nested Branch traceId

When a branch exists within another branch path, the traceId extends hierarchically.

```
Start (0.0) → Apply (0.1) → Approve_A (0.2) → Branch_Start_01 (0.3-0.0)
  ├─ Straight path → Branch_End_01 (0.3-0.0)
  └─ Path 2: Approve_B (0.3-2.1) → Branch_Start_02 (0.3-2.2-0.0)
       ├─ Straight path → Branch_End_02 (0.3-2.2-0.0)
       └─ Path 2: Approve_C (0.3-2.2-2.1) → Branch_End_02
  Branch_End_01 → End (0.0)
```

| Node | traceId | Description |
|------|---------|-------------|
| Approve_A | `0.2` | Straight node before branch |
| Branch_Start_01 / Branch_End_01 | `0.3-0.0` | Outer branch pair |
| Approve_B | `0.3-2.1` | Outer branch path 2, node 1 |
| Branch_Start_02 / Branch_End_02 | `0.3-2.2-0.0` | Inner branch pair (at path 2, node 2 position) |
| Approve_C | `0.3-2.2-2.1` | Inner branch path 2, node 1 |

### plugins (Authority Plugins)

Define the same plugins at both the route level and node level (double-write required).

| Property | Type | Description |
|----------|------|-------------|
| routePluginId | string | Plugin ID (**max 20 bytes**. `plg_{short name}_{sequential number}`) |
| routeId | string | Route ID (**max 20 bytes**) |
| routeVersionId | string | Route version ID (**max 20 bytes**) |
| nodeId | string | Target node ID (**max 20 bytes**) |
| nodeType | string | Node type number (see numeric codes in `reference/node-types.md`) |
| extensionPointId | string | Extension point ID (see node-types.md) |
| pluginId | string | Plugin ID (see `reference/authority-plugins.md`) |
| parameter | string | Parameter specified per plugin (see `reference/authority-plugins.md`) |
| targetType | string | targetType of authority plugin (see `reference/authority-plugins.md`) |
| targetCode | string | Set the same value as parameter |

---

## 3. flow (Flow Definition)

Flows link content and routes, and define the overall behavior settings of the workflow.

### Main Properties

| Property | Type | Description |
|----------|------|-------------|
| flowId | string | Flow ID (unique) |
| flowName | string | Flow name |
| contentsId | string | Content ID to link |
| routeId | string | Route ID to link |

### Flow Configuration Flags

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| lumpProcessFlag | string | `1` | Bulk processing enabled (`0`=disabled, `1`=enabled) |
| lumpConfirmFlag | string | `1` | Bulk confirmation enabled (`0`=disabled, `1`=enabled) |
| attachFileFlag | string | `1` | File attachment enabled (**at flow level**: `0`=disabled, `1`=enabled. **per node**: `0`=disabled, `1`=attach allowed/delete not allowed, `2`=attach and delete allowed) |
| confirmUserSetupFlag | string | `0` | Confirming party setup enabled (`0`=disabled, `1`=enabled) |
| completeMatterConfirmFlag | string | `0` | Completed matter confirmation enabled |
| autoProcessFlag | string | `0` | Auto processing (`0`=disabled, `1`=enabled) |
| autoProcessLimitDay | number/null | null | Auto processing limit days |
| autoProcessLimitType | string | `0` | Auto processing limit type |
| autoPressFlag | string | `0` | Auto reminder enabled (`0`=disabled, `1`=enabled) |
| autoPressLimitDay | number/null | null | Auto reminder limit days |
| asyncProcessFlag | string/null | null | Async processing enabled (`0`/null=disabled, `1`=enabled) |
| sysDateTargetExpandFlag | string/null | null | System date target expansion enabled (`0`/null=disabled, `1`=enabled) |
| calendarId | string/null | null | Calendar ID |

### handleUsers (Reference Users)

Defines users who can reference and operate workflow matters. Configuration is optional (empty array is acceptable).
Set in the `handleUsers` array of the active version. Leave blank period versions (versionStatus=9) as empty arrays.
**If the user has not specified reference users, specify an empty array.** Do not include sample data values as defaults.
Reference: https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/operation_reference/index.html

| Property | Type | Description |
|----------|------|-------------|
| no | string | Unique ID (random ID, 15 chars, `[0-9A-Za-z]`, shared across locales) |
| flowId | string | Flow ID |
| flowVersionId | string | Flow version ID |
| extensionPointId | string | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |
| pluginId | string | Plugin ID (see `reference/authority-plugins.md`) |
| parameter | string | Parameter specified per plugin (see `reference/authority-plugins.md`) |
| targetType | string | targetType of authority plugin (see `reference/authority-plugins.md`) |
| targetCode | string | Set the same value as parameter |
| handleLevel | string | `0` |
| reserveCancelFlag | string | Reservation cancel enabled (`0`=disabled, `1`=enabled) |
| changeUserFlag | string | Processor change enabled (`0`=disabled, `1`=enabled) |
| expandUserFlag | string | Expansion enabled (`0`=disabled, `1`=enabled) |
| deleteDynamicNodeFlag | string | Dynamic node deletion enabled (`0`=disabled, `1`=enabled) |
| undeleteDynamicNodeFlag | string | Dynamic node deletion cancel enabled (`0`=disabled, `1`=enabled) |
| horizontalNodeConfigFlag | string | Horizontal layout node configuration enabled (`0`=disabled, `1`=enabled) |
| verticalNodeConfigFlag | string | Vertical layout node configuration enabled (`0`=disabled, `1`=enabled) |
| handleMoveForwardFlag | string | Matter advance enabled (`0`=disabled, `1`=enabled) |
| handleMoveBackwardFlag | string | Matter sendback enabled (`0`=disabled, `1`=enabled) |
| handleTerminateFlag | string | Matter termination enabled (`0`=disabled, `1`=enabled) |

For pluginId, targetType, and parameter specifications and sample data, see `reference/authority-plugins.md`.
To set multiple reference users, list multiple entries in the `handleUsers` array.
Each entry's `no` must be a different random ID per entry (shared across locales).

### Template

```xml
<handleUsers type="array">
  <value type="object">
    <no type="string">{{handleUserNo}}</no>
    <flowId type="string">flow_{{name}}</flowId>
    <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
    <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.{{suffix}}</pluginId>
    <parameter type="string">{{parameter}}</parameter>
    <targetType type="string">{{targetType}}</targetType>
    <targetCode type="string">{{parameter}}</targetCode>
    <handleLevel type="string">0</handleLevel>
    <reserveCancelFlag type="string">0</reserveCancelFlag>
    <changeUserFlag type="string">0</changeUserFlag>
    <expandUserFlag type="string">0</expandUserFlag>
    <deleteDynamicNodeFlag type="string">0</deleteDynamicNodeFlag>
    <undeleteDynamicNodeFlag type="string">0</undeleteDynamicNodeFlag>
    <horizontalNodeConfigFlag type="string">0</horizontalNodeConfigFlag>
    <verticalNodeConfigFlag type="string">0</verticalNodeConfigFlag>
    <handleMoveForwardFlag type="string">0</handleMoveForwardFlag>
    <handleMoveBackwardFlag type="string">0</handleMoveBackwardFlag>
    <handleTerminateFlag type="string">0</handleTerminateFlag>
  </value>
  <!-- Repeat entries for multiple settings -->
</handleUsers>
```

### defaultOrgzs / flows

- `defaultOrgzs`: Default settings for the application base organization. Usually empty array.
- `flows`: Sub-flow definitions. Usually empty array.

### nodes (Flow Node Settings)

Individual settings for each node in the flow:

| Property | Type | Description |
|----------|------|-------------|
| flowId | string | Flow ID |
| flowVersionId | string | Flow version ID |
| contentsVersionId | string | Content version ID |
| routeVersionId | string | Route version ID |
| nodeId | string | Node ID (matches the route node ID) |
| nodeType | string | Node type number (see numeric codes in `reference/node-types.md`) |
| lumpProcessFlag | string/null | Per-node bulk processing setting |
| attachFileFlag | string/null | Per-node file attachment (`0`=disabled, `1`=attach allowed/delete not allowed, `2`=attach and delete allowed) |
| details | array | Rule association array for branch nodes (empty array for normal nodes) |
| attributes | array | Node attribute array |
| unions | array | Path association array for branch nodes (empty array for normal nodes) |
| routeNode | string/null | Route node |

### details (Branch Node Condition Association)

Specify the conditions applied to each branch path in the `details` array of Branch_Start nodes (nodeType=9).
`cooperationType` differs depending on the branching method.

| cooperationType | cooperationClassify | cooperationId reference | Branching method |
|-----------------|--------------------|-----------------------|-----------------|
| `19` | `2` | `ruleId` in rule section | Rule-based automatic determination |
| `4` | `0` | `contentsPluginId` in contents plugins | User program |

| Property | Type | Description |
|----------|------|-------------|
| no | string | Unique ID (random ID, 15 chars, `[0-9A-Za-z]`, corresponds to `branchUnionId` in unions) |
| cooperationType | string | `19` (rule) / `4` (user program) |
| cooperationClassify | string | `2` (rule) / `0` (program) |
| cooperationId | string | ID of the linked target (see table above) |
| emptyFlag | string | `0` (fixed value) |

* The details of normal Apply / Approve nodes are empty arrays.

### unions (Branch Node Path Association)

Specify the branch destination when a rule is satisfied in the `unions` array of Branch_Start nodes (nodeType=9).
Corresponds 1:1 with details.

| Property | Type | Description |
|----------|------|-------------|
| branchUnionId | string | **Same value** as details `no` (association key) |
| branchUnionGroupId | string | Group ID (random ID, 15 chars, `[0-9A-Za-z]`, unique different value per union) |
| branchUnionGroupClassify | string | `0` (fixed value) |
| countTrue | string | `1` (fixed value) |
| countTargetNodeId | string | First node ID of the branch destination path |

* The unions of normal Apply / Approve nodes and Branch_End nodes are empty arrays.

---

## 4. matter_property (Matter Property)

Defines business data items associated with matters. Used as condition variables for branch rules and as columns in list display.

### Main Properties

| Property | Type | Description |
|----------|------|-------------|
| matterPropertyKey | string | Property key (unique, used as ID) |
| localeId | string | Locale ID |
| matterPropertyName | string | Display name |
| matterPropertyModelType | string | Data type (`1` = number, `0` = string) |
| matterPropertyTypeListPattern | string | Usable in list pattern (`1` = yes) |
| matterPropertyTypeMailTemplate | string | Usable in mail template (`0` = no) |
| matterPropertyTypeImBoxTpl | string | Usable in IMBox template (`0` = no) |
| matterPropertyTypeRule | string | Usable in branch rule (`1` = yes) |
| alignType | string | Display alignment (`0` = left, `1` = center, `2` = right) |
| searchRangeType | string | Search range type (`0` = exact match, `1` = range) |
| commaSeparatedFlag | string | Comma-separated display (`0` = no) |
| calendarFlag | string | Calendar use (`0` = no) |
| updateCount | string | Update count (`1`) |

### Template

```xml
<matter_property id="{{propertyKey}}">
  <value type="array">
    <!-- Repeat per locale (ja, en, zh_CN) -->
    <value type="object">
      <matterPropertyKey type="string">{{propertyKey}}</matterPropertyKey>
      <localeId type="string">{{localeId}}</localeId>
      <matterPropertyName type="string">{{propertyName}}</matterPropertyName>
      <matterPropertyModelType type="string">{{modelType}}</matterPropertyModelType>
      <matterPropertyTypeListPattern type="string">1</matterPropertyTypeListPattern>
      <matterPropertyTypeMailTemplate type="string">0</matterPropertyTypeMailTemplate>
      <matterPropertyTypeImBoxTpl type="string">0</matterPropertyTypeImBoxTpl>
      <matterPropertyTypeRule type="string">1</matterPropertyTypeRule>
      <alignType type="string">2</alignType>
      <searchRangeType type="string">1</searchRangeType>
      <commaSeparatedFlag type="string">0</commaSeparatedFlag>
      <calendarFlag type="string">0</calendarFlag>
      <note type="null" />
      <updateCount type="string">1</updateCount>
    </value>
  </value>
</matter_property>
```

---

## 5. rule (Branch Rule)

Defines condition evaluation rules used in branch routes. Matches matter property values against comparison conditions.

### Main Properties

| Property | Type | Description |
|----------|------|-------------|
| ruleId | string | Rule ID (unique) |
| ruleName | string | Rule name (description of condition) |
| ruleUnionCondition | string | Combination method for compound conditions (`0` = AND) |
| updateCount | string | Update count (`1`) |

### ruleDetailModel (Condition Details)

| Property | Type | Description |
|----------|------|-------------|
| no | string | Condition number (`{ruleId}_{sequential number}`) |
| ruleId | string | Parent rule ID |
| compareRuleId | string | Comparison operator (see table below) |
| compareVariable | string | Matter property key to compare |
| conditionValue | string | Comparison value |
| conditionValueType | string | Value type (`0` = fixed value) |

### compareRuleId (Condition Type: ConditionType)

Official reference: https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html#ConditionType

| Value | Code Name | Description |
|-------|-----------|-------------|
| 0 | condTyp_Include | Contains the following |
| 1 | condTyp_NotInclude | Does not contain the following |
| 2 | condTyp_Corresponding | Matches the following |
| 3 | condTyp_Different | Differs from the following |
| 4 | condTyp_Start | Starts with the following |
| 5 | condTyp_End | Ends with the following |
| 6 | condTyp_Larger | Is greater than the following |
| 7 | condTyp_More | Is greater than or equal to the following |
| 8 | condTyp_Smaller | Is less than the following |
| 9 | condTyp_Less | Is less than or equal to the following |
| 10 | condTyp_CorrespondingEither | Matches any of the following |

**Commonly used values:** For numeric comparisons such as amounts, use `7` (greater than or equal to) and `8` (less than).

### Template

```xml
<rule id="{{ruleId}}">
  <value type="array">
    <!-- Repeat per locale (en, ja, zh_CN) -->
    <value type="object">
      <ruleId type="string">{{ruleId}}</ruleId>
      <localeId type="string">{{localeId}}</localeId>
      <ruleName type="string">{{ruleName}}</ruleName>
      <note type="null" />
      <ruleUnionCondition type="string">0</ruleUnionCondition>
      <updateCount type="string">1</updateCount>
      <ruleDetailModel type="array">
        <value type="object">
          <no type="string">{{ruleId}}_1</no>
          <ruleId type="string">{{ruleId}}</ruleId>
          <compareRuleId type="string">{{compareRuleId}}</compareRuleId>
          <compareVariable type="string">{{propertyKey}}</compareVariable>
          <conditionValue type="string">{{value}}</conditionValue>
          <conditionValueType type="string">0</conditionValueType>
        </value>
        <!-- For compound conditions, list additional conditions -->
      </ruleDetailModel>
    </value>
  </value>
</rule>
```

### Example: 3-level branching by amount

| Rule | Condition | compareRuleId | conditionValue |
|------|-----------|---------------|----------------|
| rule_01 | Less than 10,000 | 8 (less than) | 10000 |
| rule_02 | 10,000 or more and less than 50,000 | 7 (>=) + 8 (<) | 10000, 50000 |
| rule_03 | 50,000 or more | 7 (>=) | 50000 |

---

## Random ID Generation Rules

Fields such as `no`, `contentsPluginId`, and `branchUnionGroupId` in the XML use randomly generated unique IDs.

| Item | Specification |
|------|--------------|
| Character set | Alphanumeric `[0-9A-Za-z]` |
| Length | 15 characters |
| Uniqueness | Must not be duplicated within the XML file |
| Across locales | The same element shares the same `no` across all 3 locales |

Examples: `5hx2qt35p8oslxo`, `A3bC7dE9fG1hJ5k`

## ID Naming Conventions

**Important: Content ID, Route ID, Flow ID, each version ID, and Node ID are all max 20 bytes.**
Since version IDs have a suffix `_{sequential number}` (2 or more characters), the parent ID must be within 20 bytes including the suffix.
If the name is long, shorten the prefix: `contents_` → `cnt_`, `route_` → `rte_`, `flow_` → `flw_`.

| Target | Pattern | Limit | Example |
|--------|---------|-------|---------|
| Content ID | `cnt_{name}` or `contents_{name}` | **20 bytes** | `cnt_purchase` |
| Content version ID | `{contentsId}_{sequential number}` | **20 bytes** | `cnt_purchase_1` |
| Page path ID | `{prefix}_page_{sequential number}` | 20 bytes | `purchase_page_0` |
| Route ID | `rte_{name}` or `route_{name}` | **20 bytes** | `rte_purchase` |
| Route version ID | `{routeId}_{sequential number}` | **20 bytes** | `rte_purchase_1` |
| Node ID | `{routePrefix}_{sequential number}` / `{routePrefix}_start` / `{routePrefix}_end` | **20 bytes** | `purchase_01`, `purchase_start` |
| Flow ID | `flw_{name}` or `flow_{name}` | **20 bytes** | `flw_purchase` |
| Flow version ID | `{flowId}_{sequential number}` | **20 bytes** | `flw_purchase_1` |
| Plugin ID | `plg_{short name}_{sequential number}` | **20 bytes** | `plg_purch_01` |

### Prefix Shortening Guide

If the name part (`{name}`) is long and the version ID would exceed 20 characters with the standard prefix (`contents_` / `route_` / `flow_`), use the following shortened prefixes.

| Standard prefix | Short prefix | When to use |
|----------------|-------------|-------------|
| `contents_` (9 chars) | `cnt_` (4 chars) | When name is 10 or more characters |
| `route_` (6 chars) | `rte_` (4 chars) | When name is 13 or more characters |
| `flow_` (5 chars) | `flw_` (4 chars) | When name is 14 or more characters |

## Coordinate Layout Rules

The x, y coordinates of nodes represent their position in the route editor.

| Node Type | x spacing | y position |
|-----------|-----------|------------|
| Start | 50 | 50 (main line) |
| Apply | 160 | 50 |
| Approve (straight) | +110 each | 50 |
| End | Last node +100 | 50 |
| Branch_Start | Preceding node +100 | 50 |
| Branch_End | Last branch node +120~160 | 50 |
| Branch destination node (upper) | Branch_Start +180 | 110 |
| Branch destination node (lower) | Branch_Start +110~240 | 200~210 |
