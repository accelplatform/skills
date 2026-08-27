# 生命周期相关插件字段（到达处理・案件开始处理・案件退避处理・案件删除监听器）

与 `actionProcess`（节点级）・`matterEndProcess`（spec 级）相同的命名模式，以下插件也可以从 `spec.json` 自动注册。均同时支持 JSSP 实现（脚本路径）和 Java 实现（FQCN，`*Impl: "java"`）。`pluginId` 会自动设置为 `{exPointId}.pluginScriptExecutor` 或 `{exPointId}.pluginJavaExecutor`。

## 到达处理（arriveProcess）— 节点级

在 `apply` / `approve` / `confirm` 等任意节点上通过 `arriveProcess` 字段指定。

```jsonc
{
  "id": "01", "type": "approve", "name": "Manager",
  "arriveProcess": "leave/arrive/arrive_process",       // JSSP 实现（脚本路径，不含扩展名）
  "arriveProcessImpl": "jssp"                            // 可省略。省略时为 "jssp"
},
{
  "id": "02", "type": "approve", "name": "Director",
  "arriveProcess": "jp.co.intra_mart.sample.leave.workflow.arrive.LeaveArriveProcess",
  "arriveProcessImpl": "java"                            // Java 实现（FQCN）
}
```

- exPointId：`jp.co.intra_mart.workflow.plugin.event.node.arrive.process`
- 实现请使用 `jssp-im-workflow-usage`（`assets/simple-arrive-process.md`）或 `java-im-workflow-usage`（`assets/arrive-process.md`）

## 案件开始处理（matterStartProcess）— spec 级

```jsonc
{
  "matterStartProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterStartProcess",
  "matterStartProcessImpl": "java"    // "java" | "jssp"（省略时为 "jssp"）
}
```

- exPointId：`jp.co.intra_mart.workflow.plugin.event.matter.start.process`
- 实现请使用 `jssp-im-workflow-usage`（`assets/simple-matter-start-process.md`）或 `java-im-workflow-usage`（`assets/matter-start-process.md`）

## 案件退避处理（matterArchiveProcess）— spec 级

```jsonc
{
  "matterArchiveProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterArchiveListener",
  "matterArchiveProcessImpl": "java"
}
```

- exPointId：`jp.co.intra_mart.workflow.plugin.event.matter.archive.process`
- 实现请使用 `jssp-im-workflow-usage`（`assets/simple-matter-archive-listener.md`）或 `java-im-workflow-usage`（`assets/matter-archive-listener.md`）

## 案件删除监听器（未完成/已完成/历史）— spec 级

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

| 字段 | exPointId |
|-----------|-----------|
| `activeMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` |
| `completedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` |
| `archivedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` |

实现请使用 `jssp-im-workflow-usage`（`assets/simple-actv-matter-delete-listener.md` 等）或 `java-im-workflow-usage`（`assets/matter-delete-listener.md`）。

## 字段一览

| 字段 | 必须 | 默认值 | 说明 |
|-----------|------|-----------|------|
| `arriveProcess`（节点） | No | 无 | 到达处理的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `arriveProcessImpl`（节点） | No | `"jssp"` | `"java"` 时为 Java 类执行 |
| `matterStartProcess` | No | 无 | 案件开始处理的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `matterStartProcessImpl` | No | `"jssp"` | `"java"` 时为 Java 类执行 |
| `matterArchiveProcess` | No | 无 | 案件退避处理的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `matterArchiveProcessImpl` | No | `"jssp"` | `"java"` 时为 Java 类执行 |
| `activeMatterDeleteProcess` | No | 无 | 未完成案件删除监听器的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `activeMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` 时为 Java 类执行 |
| `completedMatterDeleteProcess` | No | 无 | 已完成案件删除监听器的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `completedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` 时为 Java 类执行 |
| `archivedMatterDeleteProcess` | No | 无 | 历史案件删除监听器的脚本路径（JSSP）或 FQCN（Java）。省略时不注册插件 |
| `archivedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` 时为 Java 类执行 |

## 未支持（已知差距）

以下内容目前无法通过 `build-workflow.js` 自动生成，需要手动编辑 XML：

- **用户程序方式的分支/合并条件**：`branchMethod: "program"` 节点的节点类型代码会被输出，但对应插件本身（`jp.co.intra_mart.workflow.plugin.event.node.branch.rule` / `...union.rule`）的注册尚未实现。「规则方式」的分支（`branchMethod: "rule"`，使用 `matterProperties` + `rules`）已支持
- **处理对象者插件（自定义实现）**：职位・组织・角色等标准插件（通过 `node.plugin.suffix` 指定）已支持，但通过 SSJS/Java 完全自定义实现的处理对象者插件的注册途径，很可能与本技能生成的 route/flow 导入 XML 是不同的体系，尚未验证（参见 `.github/skills/jssp-im-workflow-usage/assets/simple-authority-exec-event-listener.md`）
