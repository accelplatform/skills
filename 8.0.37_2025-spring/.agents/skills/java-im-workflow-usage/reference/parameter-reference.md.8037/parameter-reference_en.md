# Parameter Class Field Reference (JavaEE Development Model)

Based on the actual platform API class definitions of intra-mart Accel Platform (IM-Workflow) (`im_workflow_core`). **Do not add fields/methods from memory or guesswork.** If you need a field that is not listed here, verify the class with dev-knowledge (source code search MCP) before using it.

Each field is accessed via `getXxx()` / `setXxx()` getters/setters (the fields themselves are `private`).

---

## `ActionProcessParameter`

Package: `jp.co.intra_mart.foundation.workflow.plugin.process.action`

| Field | Type | Description |
|-----------|-----|------|
| actFlag | String | Proxy flag (0: processed by self / 1: processed by proxy) |
| applyBaseDate | String | Application base date (`yyyy/MM/dd`) |
| authCompanyCode | String | Authority company code |
| authOrgzCode | String | Authority organization code |
| authOrgzSetCode | String | Authority organization set code |
| authUserCd | String | Processing authority user code |
| contentsId | String | Contents ID |
| contentsVersionId | String | Contents version ID |
| execUserCd | String | Processing executor user code |
| flowId | String | Flow ID |
| flowVersionId | String | Flow version ID |
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID (same value as tenant ID) |
| matterName | String | Matter name |
| matterNumber | String | Matter number |
| nodeId | String | Node ID |
| nextNodeIds | String[] | Destination (next node) node ID (set during send-back, pull-back, or matter operation) |
| parameter | String | Parameter (holds the FQCN of the registered implementation class. Usually not referenced from business logic) |
| priorityLevel | String | Priority level |
| processComment | String | Processing comment |
| processDate | String | Processing date (`yyyy/MM/dd`) |
| resultStatus | String | Processing result status |
| routeId | String | Route ID |
| routeVersionId | String | Route version ID |
| systemMatterId | String | System matter ID |
| targetLocales | String[] | Target locale IDs |
| userDataId | String | User data ID |
| lumpProcessFlag | String | Bulk approval flag (0: normal approval / 1: bulk approval) |
| autoProcessFlag | String | Auto-processing flag (0: normal processing / 1: auto processing) |
| DCNodeConfigModels | DynamicAndCnfmNodeConfigModel[] | Dynamic/confirmation node configuration information |
| HVNodeConfigModels | HorizontalAndVerticalNodeConfigModel[] | Horizontal/vertical placement node configuration information |
| branchSelectModels | BranchSelectModel[] | Branch destination selection information |

## `ArriveProcessParameter`

Package: `jp.co.intra_mart.foundation.workflow.plugin.process.arrive`

| Field | Type | Description |
|-----------|-----|------|
| actFlag | String | Proxy flag |
| applyBaseDate | String | Application base date |
| contentsId / contentsVersionId | String | Contents ID / version ID |
| flowId / flowVersionId | String | Flow ID / version ID |
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID |
| matterName | String | Matter name |
| matterNumber | String | Matter number |
| nodeId | String | Arrival node ID |
| parameter | String | Parameter |
| preNodeAuthCompanyCode | String | Previous node processing authority company code |
| preNodeAuthOrgzCode | String | Previous node processing authority organization code |
| preNodeAuthOrgzSetCode | String | Previous node processing authority organization set code |
| preNodeAuthUserCd | String | Previous node processing authority user code |
| preNodeExecUserCd | String | Previous node processing executor code |
| preNodeId | String | Previous node ID |
| preNodeProcessComment | String | Previous node processing comment |

(There may be additional fields related to the state immediately before arrival. If you need something beyond the above, verify `ArriveProcessParameter` with dev-knowledge.)

## `MatterStartProcessParameter`

Package: `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start`

| Field | Type | Description |
|-----------|-----|------|
| applyBaseDate | String | Application base date |
| contentsId / contentsVersionId | String | Contents ID / version ID |
| flowId / flowVersionId | String | Flow ID / version ID |
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID |
| parameter | String | Parameter |
| processDate | String | Processing date |
| routeId | String | Route ID |
| routeVersionId | String | (The rest of the field list continues; verify `MatterStartProcessParameter` with dev-knowledge. The above is only an excerpt of the beginning) |
| systemMatterId | String | System matter ID |
| targetLocales | String[] | Target locale IDs |
| userDataId | String | User data ID |

## `MatterEndProcessParameter`

Package: `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end`

| Field | Type | Description |
|-----------|-----|------|
| actFlag | String | Proxy flag |
| applyBaseDate | String | Application base date |
| contentsId / contentsVersionId | String | Contents ID / version ID |
| flowId / flowVersionId | String | Flow ID / version ID |
| lastAuthUserCd | String | Final processing authority user code |
| lastExecUserCd | String | Final processing executor user code |
| lastProcessNodeId | String | Final processing node ID |
| lastResultStatus | String | Final processing result status |
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID |
| parameter | String | Parameter |
| processDate | String | Processing date |
| mailIds | String[] | Array of mail template IDs |
| imBoxIds | String[] | Array of IMBox template IDs |
| mailReplaceMap | Map\<MailReplaceId, String\> | Mail substitution string information |
| imBoxReplaceMap | Map\<ImBoxReplaceId, String\> | IMBox substitution string information |

(Message-related fields, such as `messageIds`, may follow. If you need details, verify `MatterEndProcessParameter` with dev-knowledge.)

## `RuleConditionParameter`

Package: `jp.co.intra_mart.foundation.workflow.plugin.rule.condition`

| Field | Type | Description |
|-----------|-----|------|
| applyBaseDate | String | Application base date |
| contentsId / contentsVersionId | String | Contents ID / version ID |
| flowId / flowVersionId | String | Flow ID / version ID |
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID |
| nodeId | String | Branch/union node ID |
| parameter | String | Parameter |
| processDate | String | Arrival date |
| routeId / routeVersionId | String | Route ID / version ID |
| systemMatterId | String | System matter ID |
| targetLocales | String[] | Target locale IDs |
| userDataId | String | User data ID |

## `WorkflowAuthorityParameter` (for processing target user plugin)

Package: `jp.co.intra_mart.foundation.workflow.listener.param` (extends `WorkflowParameter`)

Fields inherited from `WorkflowParameter`:

| Field | Type | Description |
|-----------|-----|------|
| localeId | String | Locale ID |
| loginGroupId | String | Login group ID |
| applyBaseDate | String | Application base date |
| parameter | String | Parameter |
| targetLocales | String[] | Target locale IDs |

Fields specific to `WorkflowAuthorityParameter`:

| Field | Type | Description |
|-----------|-----|------|
| targetCodes | String[] | List of target codes (set to the user code(s) that last processed the node when the node was reached via a pull-back, send-back, or matter operation that moved the node. May be `null`) |

## `WorkflowMatterParameter` (for processing target user plugin / matter information)

Package: `jp.co.intra_mart.foundation.workflow.listener.param`

| Field | Type | Description |
|-----------|-----|------|
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |
| contentsId / contentsVersionId | String | Contents ID / version ID |
| routeId / routeVersionId | String | Route ID / version ID |
| flowId / flowVersionId | String | Flow ID / version ID |
| nodeId | String | Node ID |

## `UserDataModel` (return value element of the processing target user plugin)

Package: `jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model`

| Field | Type | Description |
|-----------|-----|------|
| localeId | String | Locale ID of the processing target user |
| userCode | String | User code of the processing target user |
| userName | String | User name of the processing target user |
| userOrgzModels | OrgzDataModel[] | Affiliated organization information of the processing target user (becomes the candidate choices for the responsible organization) |

`OrgzDataModel` holds the company name, organization name, company code, organization set code, and organization code (same structure as the JSSP version's `userOrgzModels`). If you need detailed fields, verify `OrgzDataModel` with dev-knowledge.

---

## Arguments of the Matter Delete Listener / Matter Archive Listener

Passed as individual `String` arguments rather than a `Parameter` object (see [assets/matter-delete-listener.md](../assets/matter-delete-listener.md) / [assets/matter-archive-listener.md](../assets/matter-archive-listener.md)).

**Common arguments for the active matter delete listener, completed matter delete listener, and matter archive process (4 arguments):**

| Argument Name | Type | Description |
|--------|-----|------|
| loginGroupId | String | Login group ID |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |

**Only the archived matter delete listener (`IWorkflowArcMatterDeleteListener`) differs (5 arguments):**

| Argument Name | Type | Description |
|--------|-----|------|
| loginGroupId | String | Login group ID |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |
| archiveMonth | String | Archive month (`yyyyMM` format). Past matters are split across tables by month, so this is needed to identify the target to delete |

**Note:** Unlike the other two (active/completed), the archived matter delete listener has `archiveMonth` appended at the end. Implementing it with only 4 arguments results in an "unimplemented abstract method" compile error even with `@Override` present. See [assets/matter-delete-listener.md](../assets/matter-delete-listener.md) for details.
