---
name: bpm-tenant-setup-generator
description: 将编辑好的 BPMN（IM-BPM 流程设计器的 BPM 流程）文件整合到 intra-mart Accel Platform 租户环境搭建（Importer）用资材套件中。当提及「将 BPMN 的导入整合进搭建流程」「想在租户环境搭建中导入 BPMN」「想将 IM-BPM 的流程导入到租户环境」「制作将 BPM 流程注册到流程设计器的资材」时使用。
---

# 租户环境搭建资材生成技能（BPMN 用）

## 目的

用于将 BPMN 文件整合到 jssp-tenant-setup-generator（`.agents/skills/jssp-tenant-setup-generator/SKILL.md`）所生成的租户搭建用资材中的技能。
生成的资材可从租户环境管理（租户环境搭建）中导入。


## 生成对象

| 类别 | 输出文件 | 多语言 |
|---------|-------------|--------|
| 导入用 BPMN（bpmn） | 复制到 `storage/system` 下 | - |
| BPMN 导入 JS | `<key>/initialize/<version>/<key>_bpm_import.js` | - |
| 角色・授权资材（仅未生成时的恢复处理）|参见 `.agents/skills/jssp-tenant-setup-generator/SKILL.md`|-|
| DDL（仅未生成时的恢复处理）|参见 `.agents/skills/jssp-tenant-setup-generator/SKILL.md`|-|
| 对 import-config.xml 的追加 | 在 `<extends-import>` 段中追加 `<extends-import-class>` 行（手动追加） | - |


## 文件结构

```
bpm-tenant-setup-generator/
├── SKILL.md                            # 本文件
└── reference/
    └── bpm-import.md                   # BPMN 上传规格
```

## 输出位置

由于 `.agents/skills/jssp-tenant-setup-generator` 的 build 脚本（`.agents/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js`）尚不支持 `bpmImport`，以下内容不由 build 脚本输出，而是由本技能的生成步骤（步骤 2～3）输出。

| 类别 | 输出位置 |
|------|--------|
| 导入用 BPMN（bpmn） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` |
| BPMN 导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_bpm_import.js` |
| 角色・授权资材（仅未生成时的恢复处理）|参见 `.agents/skills/jssp-tenant-setup-generator/SKILL.md`|
| DDL（仅未生成时的恢复处理）|参见 `.agents/skills/jssp-tenant-setup-generator/SKILL.md`|
| 对 import-config.xml 的追加 | 在 `<extends-import>` 段中追加 `<extends-import-class>` 行（手动追加） |

### import-config 的选择规则

- 在组装同一发布的首次安装资材过程中，若既有的 import-config 中已生成角色・授权・DDL 等，则应向**同一个 config（通常为 config-1）**追加用于 BPMN 导入的 `<extends-import>`。不得仅因 config 已存在就增加 config 编号。
- 仅在以下情况下才新建 config-(N+1)：既有 config 已发布・已投入租户而无法变更时、用户明确指示差分发布／版本升级时，或需要分离执行顺序时。若不清楚是否适用且会影响结果，则向用户确认。
- 若既有 config 中没有 `<extends-import>`，则在 `<database>`・`<tenant-master>` 之后新建。若已存在，则按照 [reference/bpm-import.md](reference/bpm-import.md) 的执行顺序追加 `<extends-import-class>`。

- 关于 `<version>`，若 `src/main/storage/system/products/import/basic/<key>/` 下已存在版本文件夹（已放入角色・授权资材／DDL／BPMN 等的文件夹），则**直接沿用该文件夹名**。不得仅将 BPMN 相关资材（导入用 BPMN、`<key>_bpm_import.js`）单独生成到另一个新的版本文件夹中。仅当不存在既有文件夹时（本技能的首次生成），才按照 `.agents/skills/jssp-tenant-setup-generator/SKILL.md` 的解析优先顺序（spec.json 的 `version` → module.xml/pom.xml 的 `<version>` → `1.0.0`）重新确定。
  - 版本升级（提升 `spec.version` 并创建新版本文件夹的运营方式。`.agents/skills/jssp-tenant-setup-generator/reference/multi-config.md` 的模式(I)）仅在用户明确指示进行版本升级时才执行。在本技能的生成过程中，AI 不得询问是否需要版本升级，也不得以 pom.xml 的版本发生变化为理由自动切换到新的版本文件夹。
- `<key>` 的值遵循 `.agents/skills/jssp-tenant-setup-generator/SKILL.md` 的规则。
- `<file>` 直接沿用复制源的文件名。

## 使用时机

当用户提出以下类似需求时：

- 「想在租户环境搭建中导入 BPMN」
- 「想在租户环境搭建中导入 BPMN 及生成的资材」

## 生成步骤

### 1. 生成角色・授权资材／DDL（仅未生成时・以恢复为目的）

BPM 项目的编辑・部署需要执行用户具备相应权限（角色・授权资材），并且若目标租户尚未应用 DDL（表定义），则后续导入会失败。两者均参见 `.agents/skills/jssp-tenant-setup-generator/SKILL.md`。

- 若角色・授权资材与 DDL 均已生成，则跳过本步骤，进入步骤 2。
- 仅当存在未生成的资材时，才作为恢复处理，执行 `.agents/skills/jssp-tenant-setup-generator/SKILL.md` 生成步骤中用于生成缺失的角色・授权资材／DDL 的部分。菜单・作业调度器・门户小部件 DML 等其他资材若已生成，则不再重新生成。

### 2. 需求确认（BPMN）
- 确定要从租户环境搭建中导入的 BPMN 文件。
  - 显示 `doc/<BPM 流程名>-prompt/` 下 *.bpmn 的列表及选择栏。
  - 将选中的 BPMN 文件复制到「输出位置」中的「导入用 BPMN（bpmn）」处。
- 询问导入 BPM 流程设计器所需的值（详情参见 [reference/bpm-import.md](reference/bpm-import.md) 中的「spec.json 中的指定」）。
  - `projectId`：流程设计器的项目 ID。将 artifactId 作为初始值呈现，并向用户确认。
  - `projectName`：流程设计器的项目名。将 pom.xml 中的 `<name>` 作为初始值呈现，并向用户确认。
  - `files`：选择并复制的 BPMN 文件名列表。

### 3. 生成 BPMN 的搭建用资材

由于 `.agents/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js` 的 build 脚本尚不支持 `bpmImport`，以下内容不执行 build 脚本，而由本技能直接生成与追加。

- 生成 `<key>_bpm_import.js`。其处理内容遵循 [reference/bpm-import.md](reference/bpm-import.md) 中的「扩展导入 JS 的处理内容」「Java 直接调用详情」（`checkProjectExists` → 若不存在则 `createProject` → 对每个 `files` 执行 `uploadOrUpdateBpmnFile`；均不使用 REST API，而是通过 `ProjectFactory` / `ResourceFactory` 直接调用 Java）。使用第 2 步中确认的 `projectId` / `projectName` / `files`。
- 在上述「import-config 的选择规则」中确定的 `import-<artifactId>-config-<N>.xml` 的 `<extends-import>` 段中手动追加 `<extends-import-class>...<key>_bpm_import.js</extends-import-class>` 行。若已输出 `extendsImport` / `workflowImport` / `logicImport` 的行，则追加在其后（顺序参见 [reference/bpm-import.md](reference/bpm-import.md) 中的「执行时机」）。


## 规格生成指南
| 文件 | 内容 |
|---------|------|
| `.agents/skills/bpm-tenant-setup-generator/reference/bpm-import.md` | BPMN 上传的机制 |
