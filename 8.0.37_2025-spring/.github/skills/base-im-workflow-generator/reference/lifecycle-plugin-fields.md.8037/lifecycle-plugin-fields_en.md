# Lifecycle Plugin Fields (Arrival Process, Matter Start Process, Matter Archive Process, Matter Delete Listeners)

Following the same naming pattern as `actionProcess` (per-node) and `matterEndProcess` (spec-level), the following plugins can also be auto-registered from `spec.json`. All of them support both JSSP implementation (script path) and Java implementation (FQCN, `*Impl: "java"`). `pluginId` is automatically set to either `{exPointId}.pluginScriptExecutor` or `{exPointId}.pluginJavaExecutor`.

## Arrival Process (arriveProcess) — Per Node

Specify on any node — `apply` / `approve` / `confirm`, etc. — with the `arriveProcess` field.

```jsonc
{
  "id": "01", "type": "approve", "name": "Manager",
  "arriveProcess": "leave/arrive/arrive_process",       // JSSP implementation (script path, no extension)
  "arriveProcessImpl": "jssp"                            // Optional. Defaults to "jssp"
},
{
  "id": "02", "type": "approve", "name": "Director",
  "arriveProcess": "jp.co.intra_mart.sample.leave.workflow.arrive.LeaveArriveProcess",
  "arriveProcessImpl": "java"                            // Java implementation (FQCN)
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.node.arrive.process`
- Implement with `jssp-im-workflow-usage` (`assets/simple-arrive-process.md`) or `java-im-workflow-usage` (`assets/arrive-process.md`)

## Matter Start Process (matterStartProcess) — Spec Level

```jsonc
{
  "matterStartProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterStartProcess",
  "matterStartProcessImpl": "java"    // "java" | "jssp" (default "jssp")
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.matter.start.process`
- Implement with `jssp-im-workflow-usage` (`assets/simple-matter-start-process.md`) or `java-im-workflow-usage` (`assets/matter-start-process.md`)

## Matter Archive Process (matterArchiveProcess) — Spec Level

```jsonc
{
  "matterArchiveProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterArchiveListener",
  "matterArchiveProcessImpl": "java"
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.matter.archive.process`
- Implement with `jssp-im-workflow-usage` (`assets/simple-matter-archive-listener.md`) or `java-im-workflow-usage` (`assets/matter-archive-listener.md`)

## Matter Delete Listeners (Active/Completed/Archived) — Spec Level

```jsonc
{
  "activeMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveActiveMatterDeleteListener",
  "activeMatterDeleteProcessImpl": "java",
  "completedMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveCompletedMatterDeleteListener",
  "completedMatterDeleteProcessImpl": "java",
  "archivedMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveArchivedMatterDeleteListener",
  "archivedMatterDeleteProcessImpl": "java"
}
```

| Field | exPointId |
|-----------|-----------|
| `activeMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` |
| `completedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` |
| `archivedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` |

Implement with `jssp-im-workflow-usage` (`assets/simple-actv-matter-delete-listener.md`, etc.) or `java-im-workflow-usage` (`assets/matter-delete-listener.md`).

## Field List

| Field | Required | Default | Description |
|-----------|------|-----------|------|
| `arriveProcess` (node) | No | none | Arrival process script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `arriveProcessImpl` (node) | No | `"jssp"` | `"java"` for Java class execution |
| `matterStartProcess` | No | none | Matter start process script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `matterStartProcessImpl` | No | `"jssp"` | `"java"` for Java class execution |
| `matterArchiveProcess` | No | none | Matter archive process script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `matterArchiveProcessImpl` | No | `"jssp"` | `"java"` for Java class execution |
| `activeMatterDeleteProcess` | No | none | Active matter delete listener script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `activeMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` for Java class execution |
| `completedMatterDeleteProcess` | No | none | Completed matter delete listener script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `completedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` for Java class execution |
| `archivedMatterDeleteProcess` | No | none | Archived matter delete listener script path (JSSP) or FQCN (Java). Plugin not registered if omitted |
| `archivedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` for Java class execution |

## Not Supported (Known Gaps)

The following cannot currently be auto-generated from `build-workflow.js`. The XML must be edited manually:

- **User-program-style branch/union conditions**: the node type code for `branchMethod: "program"` nodes is output, but registration of the corresponding plugin itself (`jp.co.intra_mart.workflow.plugin.event.node.branch.rule` / `...union.rule`) is not yet implemented. The "rule" method (`branchMethod: "rule"`, using `matterProperties` + `rules`) is supported
- **Custom processing target user plugin implementations**: the standard plugins (post, organization, role, etc., specified via `node.plugin.suffix`) are supported, but the registration path for a fully custom SSJS/Java processing target user plugin is very likely a separate mechanism from the route/flow import XML this skill generates, and is unverified (see `.github/skills/jssp-im-workflow-usage/assets/simple-authority-exec-event-listener.md`)
