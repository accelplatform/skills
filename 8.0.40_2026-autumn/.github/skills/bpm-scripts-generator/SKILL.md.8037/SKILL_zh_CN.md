---
name: bpm-scripts-generator
description: 基于 bpm-docs-generator 创建的规格书（specification.md、<功能名>-screen.md、<功能名>-logic.md 等），生成在 IM-BPM for Accel Platform 上运行 BPM 流程所需的资源（画面・函数容器・DDL/SQL・路由配置・租户环境设置资材，以及适用时的批处理・IM-LogicDesigner・IM-Workflow 资材）。当提及「基于 BPM 规格书创建所需资源」「基于规格书创建脚本」「从规格书生成程序」「将 BPMN 的规格书落实为实现」「生成 BPM 流程的画面・API」时使用。规格书本身的新建请使用 bpm-docs-generator。将本技能生成的画面・路由信息反映到 BPMN-XML 的 formKey 等的后续作业请使用 bpm-xml-reflector。若要将 BPMN 文件本身纳入租户环境设置，请使用 bpm-tenant-setup-generator。
---

# BPMS 资源生成技能

## 目的
基于规格书生成 BPMS 化所需资源的技能集。
资源使用 intra-mart Accel Platform 的脚本开发模型（JSSP）生成。
基本上遵循 jssp-page-generator 的方针，但针对自研（scratch）画面联动场景，记述了 IM-BPM 特有的元素。

## 参考技能

参考以下技能集生成资源。IM-BPM for Accel Platform 特有的实现条件请参见后文的「参考资料」和「IM-BPM 资源注意事项」。

| 技能 | 处理方式 |
|---------|------|
| `.github/skills/jssp-page-generator/SKILL.md` + `.github/skills/jssp-imds-theme/SKILL.md` | 🟢 **必读** 对应规格书中的画面定义、逻辑定义 |
| `.github/skills/jssp-localize-support/SKILL.md` | 有多语言化需求时必读 |
| `.github/skills/jssp-im-job-generator/SKILL.md` | 规格书中有作业（Job）使用时必读（※1 可能未导入） |
| `.github/skills/jssp-tenant-setup-generator/SKILL.md` | 生成业务数据的 DDL・示例 DML、角色・授权资材、Importer 配置 XML 等租户环境设置资材时必读 |
| `.github/skills/jssp-im-logic-generator/SKILL.md` | 当 BPMN 中存在 `activiti:type="logicdesigner"` 的 serviceTask，且 `<BPM 流程名>-prompt` 中明确记载了 LogicDesigner 的规格时，在向用户确认是否需要生成后使用 |
| `.github/skills/base-im-workflow-generator/SKILL.md` / `.github/skills/jssp-im-workflow-usage/SKILL.md` | 当 BPMN 中存在 `activiti:type="applyworkflow"` 或 `activiti:type="draftworkflow"` 的 serviceTask，且 `<BPM 流程名>-prompt` 中明确记载了工作流规格时，在向用户确认是否需要生成后使用 |
| `.github/skills/bpm-tenant-setup-generator/SKILL.md` | 将 BPMN 文件纳入租户环境设置时使用 |

※1 `jssp-im-job-generator` 是 intra-mart Accel Platform 项目模板附带的任选技能之一，根据创建项目时的选择，本项目中可能未导入。参考前请确认 `.github/skills/jssp-im-job-generator/SKILL.md` 是否存在。若不存在，不要凭记忆或猜测补充作业调度器特有的实现，而应告知用户该技能未导入，并确认批处理资材的生成必要性与应对方针（等待追加导入该技能／本次排除在范围之外等）。

## 参考资料

对于 IM-BPM for Accel Platform 特有的实现条件，不要凭记忆或猜测编写，务必阅读并确认以下 reference 文件。

| 文件 | 内容 | 参考时机 |
|---------|------|----------------|
| `.github/skills/bpm-scripts-generator/reference/guide-bpm-form.md` | 请求类型判定、权限检查、业务数据获取、画面模式判定、画面显示控制的示例代码 | 🟢 **必读** — 实现画面（展示页面／函数容器的画面处理）时 |
| `.github/skills/bpm-scripts-generator/reference/guide-bpm-api.md` | 流程实例启动处理、任务完成处理等 BPM API 调用模式 | 🟢 **必读** — 在函数容器中实现流程联动处理（与开始事件／用户任务关联的处理）时 |

**委托给子代理时的注意事项：**
将工作委托给画面代理、API 代理时，编排代理（orchestrator）的提示中必须明确说明上述 reference 文件的**具体路径**。由于子代理是在全新上下文中启动的，仅告知技能名称无法让其察觉 reference 文件的存在。

## 使用时机

当用户提出以下类似需求时：
- 「基于 BPM 规格书创建所需资源」
- 「基于规格书创建脚本」
- 「根据规格书制作程序」

在上述委托中，不仅限于 JSSP 资材；当规格书中存在业务数据定义或角色・授权定义时，租户环境设置资材也作为生成对象处理。

## 着手生成前后的确认流程

在着手脚本生成之前，须按以下步骤（1〜6）确定预定生成物、可选资材的必要性以及对现有成果物的应对方针，并**在步骤 4 的最终确认中获得用户的明确批准后**再执行脚本生成。

### 1. 列出预定生成物

读取规格书（`<BPM 流程名>-prompt` 下、由 `.github/skills/bpm-docs-generator/SKILL.md` 创建）和原始 BPMN，按类别列出预定生成的文件与资材，并呈现给用户。

**列举的依据（各类别的一次信息）**

按类别参照以下一次信息，**仅列举其中有记载的内容**。不得从 BPMN 推测补充一次信息中没有的内容。

| 类别 | 一次信息 |
|------|---------|
| DDL / SQL（表定义、SQL 模板。函数容器在运行时调用的 2WaySQL，放置于 `src/main/jssp/src/<功能名>/sql/`） | `business-data.md` 中的业务数据定义 |
| 租户环境设置资材（DDL・示例 DML。用于 Importer 导入，放置于 `src/main/storage/system/products/import/basic/<key>/<version>/`） | `business-data.md` 中的业务数据定义 |
| 租户环境设置资材（角色・授权） | `specification.md` 中的参与者・角色定义、画面・API 路由配置中的授权 URI 声明，以及 `-prompt` 中的补充规格 |
| Importer 配置 XML | 上述租户环境设置资材，以及 `jssp-tenant-setup-generator` 的询问结果 |
| 画面（展示页面 + 函数容器） | `<功能目录>/<功能名>-screen.md` 中的「画面一览」 |
| API（函数容器） | `<功能目录>/<功能名>-logic.md`、`specification.md` 的流程详情 |
| 批处理（`.github/skills/jssp-im-job-generator/SKILL.md` 对象，如适用。※1 可能未导入） | `specification.md` / `-logic.md` 中的作业记载 |
| 路由、租户设置 | 上述已确定的画面与 API |
| **（如适用）IM-LogicDesigner 资材**（由 `.github/skills/jssp-im-logic-generator/SKILL.md` 生成的 `flow_definition.json` 等） | 步骤 2 的判定结果 |
| **（如适用）IM-Workflow 资材**（由 `.github/skills/base-im-workflow-generator/SKILL.md` 生成的导入 XML、由 `.github/skills/jssp-im-workflow-usage/SKILL.md` 生成的动作处理／画面） | 步骤 2 的判定结果 |

**画面的列举规则（必须严格遵守）**

- 画面须与 `<功能名>-screen.md` 中「画面一览」的行 **一对一** 对应。不得将一览中没有的画面纳入预定生成物。
- **不得仅以 BPMN 中存在 `userTask` / `startEvent` 为依据列举画面。** BPMN 上的任务可能不伴随画面，该判定以 `specification.md` 流程详情中的「画面」栏（无画面时为 `-`）为准。
- 对列举的每个画面，须**一并标注作为依据的 `-screen.md` 路径和画面定义名**。无法给出依据的画面不纳入列举对象。

### 2. 生成对象的判定与确认

#### 2-1. 必须同时具备 BPMN 标签和规格记载的资材（画面／LogicDesigner 资材／工作流资材）

以下资材，**仅当** BPMN 标签和 `-prompt` 中的规格记载**两者都齐备时**，才作为生成对象。若两者之一欠缺，则不生成该资材。「规格记载是否明确」不设判定基准，由负责生成的代理阅读 `-prompt` 的内容，判断是否具备可着手实现的具体程度。

| 资材 | BPMN 侧判定条件 | 规格书侧判定条件 | 两者都满足时的动作 |
|------|------------------|-------------------|---------------------|
| 画面 | 存在对象的 `userTask` 或 `startEvent` | `<功能目录>/<功能名>-screen.md` 中有该画面的定义（画面项目、验证、动作处理），且 `specification.md` 流程详情中该任务的「画面」栏不是 `-` | 纳入生成对象（无需逐个画面确认，在步骤 4 中统一呈现） |
| LogicDesigner 资材 | 存在 `<bpmn:serviceTask activiti:type="logicdesigner">` | `<BPM 流程名>-prompt` 中明确记载了 LogicDesigner 的规格（处理内容、输入输出等） | 确认是否使用 `.github/skills/jssp-im-logic-generator/SKILL.md` 生成 |
| 工作流资材 | 存在 `<bpmn:serviceTask activiti:type="applyworkflow">` 或 `<bpmn:serviceTask activiti:type="draftworkflow">` | `<BPM 流程名>-prompt` 中明确记载了工作流规格（路由结构、审批人等） | 确认是否使用 `.github/skills/base-im-workflow-generator/SKILL.md` / `.github/skills/jssp-im-workflow-usage/SKILL.md` 生成 |

**判定结果的处理（2-1：画面）：**
- 仅生成同时满足两个条件的画面。
- **当 BPMN 中有任务但 `-screen.md` 中没有画面定义时，不得通过推测生成画面。** 这一禁止包括从规格书之外补充画面项目、验证、按钮处理和布局。
- 没有画面定义的任务按「无画面」处理，在对话中向用户简要报告已将其从生成对象中排除及对象任务名。无需记录到文件中。
- 若用户需要该任务的画面，则引导其返回 `.github/skills/bpm-docs-generator/SKILL.md` 创建 `-screen.md` 后再重新执行本技能。不得在本技能内编写画面定义。

**判定结果的处理（2-1：LogicDesigner／工作流）：**
- 仅对同时满足两个条件的资材，分别单独确认「是否生成 XX？」。
- 已获批准执行的资材保留在生成对象中，回答不执行的资材则从生成对象中排除（被排除的部分之后的清单和完成报告中也一并排除）。
- **当 BPMN 中有标签但 `-prompt` 中的规格记载不明确或不足，以及规格存在但没有对应 BPMN 标签的情况下，不进行确认，也不使用 generator 生成资材。** 无需将判定结果或理由记录到文件中，在对话中向用户简要报告即可。

#### 2-2. 不以 BPMN 标签有无作为判定条件的资材（租户环境设置资材／Importer 配置 XML）

以下资材，无论 BPMN 中是否已反映角色分配等标签，均仅依据各行记载的一次信息机械地判定生成对象。**2-1 的「仅当两者都齐备时」规则不适用于这些资材。**

| 资材 | 判断为生成对象的一次信息 | 须从规格中确定的项目 | 动作 |
|------|--------------------------|----------------------|------|
| 租户环境设置资材（DDL・示例 DML） | `business-data.md` 中有业务表定义 | 具备可生成 DDL 的定义，如表名、列定义、类型、必填条件等 | 纳入生成对象（无需逐个确认，在步骤 4 中统一呈现）。委托给 `jssp-tenant-setup-generator`，并放置于 `src/main/storage/system/products/import/basic/<key>/<version>/` |
| 租户环境设置资材（角色・授权） | `specification.md` 的参与者・角色表中有角色 ID、角色名的记载，或画面・API 的路由配置中有 `<authz uri="service://...">` 的声明 | 可从规格中确定角色 ID、显示名、授权资源、对象者、许可动作 | 纳入生成对象（无需逐个确认，在步骤 4 中统一呈现）。即使 BPMN 侧尚未反映角色分配属性（`candidateGroups` 等），也不将其从对象中排除。委托给 `jssp-tenant-setup-generator`，并将角色・授权资材放置于 `src/main/storage/system/products/import/basic/<key>/<version>/` |
| Importer 配置 XML | 生成 DDL、角色、授权、示例 DML 中的任一项 | 已确定 `artifactId`、`version`、`configNumber`、`key` | 纳入生成对象（无需逐个确认）。生成 `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml` |

**判定结果的处理（2-2：租户环境设置资材／Importer 配置 XML）：**
- 当 `business-data.md` 中有业务表定义时，将 DDL 与示例 DML 作为租户环境设置资材处理，并委托给 `.github/skills/jssp-tenant-setup-generator/SKILL.md`。
- 投入到租户环境设置的 DDL・示例 DML 放置于 `src/main/storage/system/products/import/basic/<key>/<version>/`。函数容器在运行时调用的 2WaySQL 放置于 `src/main/jssp/src/<功能名>/sql/`，不得将两者混淆。
- 当可从规格中确定 `specification.md` 的参与者・角色以及画面・API 的授权要求（路由配置中的授权 URI）时，将角色・授权资材委托给同一个 `jssp-tenant-setup-generator`。**不得以 BPMN 侧未反映角色分配属性为理由而搁置生成。**
- 生成 DDL、示例 DML、角色、授权中的任一项时，也须将 Importer 配置 XML 纳入生成对象。生成位置为 `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml`。
- 委托之前，须确定 `key`、`artifactId`、`version`、`configNumber`。不得根据现有租户的投入状况自动推测 `configNumber`，而应向用户确认是初次设置还是差分追加。详情遵循 `.github/skills/jssp-tenant-setup-generator/SKILL.md`。
- 若要将 BPMN 文件本身纳入 Importer，则须作为 `.github/skills/bpm-tenant-setup-generator/SKILL.md` 的对象另行判定，并在获得批准后委托给该技能。仅生成 DDL・角色・授权・Importer 配置时，不得自动复制 BPMN 文件。

### 3. 确认现有成果物

对于第 1 步中列出的预定生成物（DDL/SQL、租户环境设置资材、画面、API、批处理、路由／租户设置，以及适用时的 LogicDesigner／Workflow 资材），按类别确认对应的实际文件是否已经存在。

- **存在现有成果物的类别（必须由用户回答）：**
  - 向用户确认：「是否可以将此 BPMN 的内容以差异形式反映到现有的〇〇（类别名）中？」
  - **回答是的情况：** 该类别按差异反映方式推进生成／委托（委托给子代理时，须明确告知其为差异反映对象及现有文件路径）。
  - **回答否的情况：** 提出不进行差异反映的替代方案（例如：①将该类别从本次生成对象中排除、②将现有文件以其他名称备份后重新生成、③其他用户指定的方针），并与用户确定采用的替代方案。
- **不存在现有成果物的类别：** 直接按新生成推进。
- 如果各类别的现有情况不一致，可按类别分别判断（例如：DDL/SQL 为新建，画面为差异反映等）。

### 4. 生成着手的最终确认

将第 1〜3 步中确定的内容（已决定采纳与否的可选资材、反映了现有成果物应对方针的最终预定生成物清单）再次呈现给用户，并明确确认「是否可以按上述内容着手脚本生成」。

- **在收到用户明确表示可以推进的回答之前，不得开始任何资材生成或向各子代理的委托。** 禁止在呈现清单的时间点擅自假定回答内容，凭自我判断继续处理。
- 如有修改、追加的指示，须在反映该指示后再次呈现清单，并重复本步骤直至获得批准。
- 即使第 1〜3 步的内容中完全不存在可选资材、现有成果物的判定结果（即仅为新建生成），本步骤也不得省略。

### 5. 生成完成后的 BPMN 反映确认

对于已生成画面（展示页面）且已确定对应的 `routing-jssp-config` 路径的开始事件・用户任务，即可将 `formKey`（路由路径）反映到 `doc/<BPM流程名>-prompt/<BPM流程名>.bpmn` 中。**该反映不得自动执行，务必在向用户确认后再实施。**

1. 提示反映对象的一览（开始事件/用户任务的 id，以及对应的 routing-jssp-config 的文件名・路径）。
   - 在步骤2中判定为「无画面」且未生成画面的开始事件・用户任务不作为对象。
   - 对既有 BPMN 进行差分反映（在步骤3中采用差分反映方针的画面）时，仅将重新生成／已变更的路由路径纳入一览。
2. 确认「是否可以按上述内容将 formKey 反映到 BPMN（副本版）」。
   - **Yes 时：** 委派给 `.github/skills/bpm-xml-reflector/SKILL.md`（生成脚本内容的反映：`reference/bpmn-scripts-reflector.md`）。委派时须明确传达 1. 的对应关系（由于 `bpm-xml-reflector` 在新的上下文中启动，无法继承本技能侧的判定结果）。
   - **No 时：** 不进行反映，仅以生成物完成本步骤。若之后需要反映，则告知用户重新执行 `bpm-xml-reflector`。

### 6. 记录对话历史
- 将对提示的请求以及生成结果的报告记录到 `doc/<BPM 流程名>-prompt/interactive-log.md` 中。如果 `doc/<BPMプロセス名>-prompt/interactive-log.md` 中已有记录，则追加记录。
  - 用户提出的指示内容应原样记录。
  - 对指示内容的回答也应原样记录。

## **IM-BPM 资源注意事项**
### **流程实例 ID 和任务 ID 从函数容器 init 函数的参数中获取。**
```
  function init(request) {
    // 来自开始事件的请求
    request.processDefinitionId;
    // 开始事件的历史参照请求
    request.historicProcessInstanceId;
    // 来自用户任务的请求
    request.taskId;
    // 来自用户任务的请求时，预计会追加到请求参数中
    request.processInstanceId;
    // 任务的历史参照请求
    request.historicTaskId;
    ‥‥‥
  }
```
- 使用上述参数进行请求类型判定、权限检查、画面模式判定的详细步骤和示例代码，请参见 `.github/skills/bpm-scripts-generator/reference/guide-bpm-form.md`（本节仅为概要）。

### **业务数据与画面的关系**
- 基本方针
  - 从开始事件或用户任务调用业务数据登记画面来登记业务数据时，以 insert 为基本方式。
- 开始事件、多个用户任务都涉及业务数据输入输出的流程（**无论是同一画面还是不同画面**）
  - 若业务数据定义中含有任务 ID（即以 `流程实例 ID + 任务 ID` 的复合主键进行管理），则按照基本方针，开始事件、各用户任务的登记画面**默认采用对业务数据执行 insert 的方式**。
    - 每次开始事件、用户任务都向业务数据追加一条记录。不对现有记录执行 UPDATE。
    - **仅在明确确认**存在诸如希望控制记录数量之类的需求时，才可以采用替代方案：首次登记画面执行业务数据的 Insert，后续用户任务对业务数据执行 Update。
  - 若业务数据定义中没有任务 ID，则首次登记画面执行业务数据的 Insert，后续用户任务对业务数据执行 Update。
    - 首次登记时（开始事件或第一个用户任务）向业务数据追加一条记录，后续用户任务则对该记录更新画面输入数据。
  - 对于首次登记以外的画面显示，应获取并显示上一个开始事件或用户任务所输入的业务数据。
    - 若业务数据定义含有任务 ID 且采用复合主键方式（insert 方式），获取条件为 `流程实例 ID` + **保存上一个开始事件／用户任务的任务 ID 的流程变量**（流程变量的设置方式参见 `.github/skills/bpm-scripts-generator/reference/guide-bpm-api.md`；命名与提议方针参见 `.github/skills/bpm-docs-generator/reference/guide-specification.md`）。
    - 为使上述获取条件成立，**该复合主键方式下各任务的完成处理（`bpm.TaskService#complete`）必须将自身的 taskId 设置为供后续任务参照的流程变量**（参见 `.github/skills/bpm-scripts-generator/reference/guide-bpm-api.md` 中的「【复合主键方式原则上必须】将自身任务 ID 传递给后续任务的情况」，不得选择简单的 complete(taskId)）。若将画面代理与 API 代理分开委托，编排代理必须明确告知「哪个任务需要谁的 taskId」这一对应关系（因为只实现了后续任务读取处理的代理无法察觉前置任务写入处理的实现遗漏）。
    - 若业务数据定义中没有任务 ID，或采用 Update 方式，则获取条件为业务数据的主键（通过流程变量等方式传递）。
  - 采用 insert 方式登记新记录时，应将上一次获取的内容（前一工序的输入值）与本次画面输入值合并登记为一条记录，并将新记录的任务 ID 设置为**当前开始事件／用户任务自身的任务 ID**（详细实现步骤参见 `.github/skills/bpm-scripts-generator/reference/guide-bpm-form.md` 中的「业务数据获取」）。
