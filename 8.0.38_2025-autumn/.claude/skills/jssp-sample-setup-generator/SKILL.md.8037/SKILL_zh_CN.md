---
name: jssp-sample-setup-generator
description: 新建 intra-mart Accel Platform 示例数据设置（Importer）所需的全套资料。从 spec.json 一次性以多语言（ja/en/zh_CN）展开生成 Importer 格式的 config XML、角色、授权（策略 / 资源 / 资源组 / 主体组）、菜单组、任务调度器、扩展导入 JS、DDL/DML SQL 骨架、Portlet 注册 DML（生成向 b_m_portlet_* 表的 DML，将 JSSP 展示页面注册为门户页面的 Portlet）、IM-Workflow 导入联动（将 storage/public 下的 WF 定义 XML 复制到 storage/system 并生成通过 DataImportExecutor 加载的扩展导入 JS）、IM-LogicDesigner 导入联动（将 storage/public 下的逻辑流 ZIP 复制到 storage/system 并生成通过 LogicFlowImporter 加载的扩展导入 JS）。当用户提及"创建示例数据设置资料"、"创建示例数据的导入资料"、"创建试用环境用的示例数据"、"创建 import-％短模块ID％-config.xml"、"生成注册示例 Portlet 的 DML"、"希望通过示例数据设置加载 IM-Workflow"、"希望通过示例数据设置加载 IM-LogicDesigner 的逻辑流"时使用。租户环境设置（构建模块运行的前提）请使用 jssp-tenant-setup-generator。
allowed-tools: Bash, Read, Write, Glob
---

# 示例数据设置资料生成技能

## 目的

用于根据提示指示从零生成 intra-mart Accel Platform **示例数据设置**（Importer）所需全套文件的技能。
生成的资料可从租户环境管理（示例数据设置）导入。

示例数据设置是 **为试用已部署的各模块而导入示例数据的处理**。生产环境中不执行。

## 与 jssp-tenant-setup-generator 的关系

Schema（`import-data-config.xsd`）和可导入的资料与租户环境设置相同。**各 XML 的规范·实现模板请参见 `jssp-tenant-setup-generator`。**

| 内容 | 参照位置 |
|---|---|
| 角色定义 XML | `.claude/skills/jssp-tenant-setup-generator/reference/role.md` |
| 授权策略 XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-policy.md` |
| 授权资源·资源组 XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-resource.md` |
| 授权主体组 XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-subject-group.md` |
| 菜单组 XML | `.claude/skills/jssp-tenant-setup-generator/reference/menu-group.md` |
| 任务调度器 XML | `.claude/skills/jssp-tenant-setup-generator/reference/job-scheduler.md` |
| DDL 的类型映射 | `.claude/skills/jssp-tenant-setup-generator/reference/database-sql.md` |

**参照时的替换：**

| 租户侧的记述 | 本技能中的替换 |
|---|---|
| `conf/products/import/basic/％短模块ID％/` | `conf/products/import/sample/`（无短模块 ID 目录） |
| `import-％短模块ID％-config-％Schema 版本％.xml` | `import-％短模块ID％-config.xml` |
| `products/import/basic/<key>/<version>/` | `products/import/sample/<key>/`（无 `<version>` 目录） |
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js` |
| `configNumber` / `-<N>` 后缀 / 多个 config 运维 | 不存在 |
| `build-setup-import.js` | `build-sample-setup-import.js` |

## 与租户环境设置的主要差异

这些差异均源于"每次都会执行""设置文件只有 1 个"。各资料的规范请参见前述的 `jssp-tenant-setup-generator`。

| 观点 | 示例数据设置（本技能） |
|---|---|
| Schema 版本管理 / 多个 config（`configNumber`） | **不适用**。每个模块最多只有 1 个设置文件（不可指定 `spec.version` / `spec.configNumber`。build 脚本会报错停止） |
| 重新执行 | **每次都会执行全部模块** -> DDL·DML·扩展导入必须幂等（单纯的 `CREATE TABLE` / `INSERT` 在第 2 次会报错。[reference/database-sql.md](reference/database-sql.md)） |
| 发生异常时 | **后续处理会继续执行** -> 必须输出 `Logger`。仅凭完成显示无法判断成败 |
| 执行顺序控制 | 无法拆分 config。仅能通过 `<extends-import>` 内的记述顺序控制 |
| DDL | **仅限示例数据设置专用表**（`tables[].ddl: true`） |

## 生成对象

| 类别 | 输出文件 | 多语言 |
|------|---------|--------|
| 导入设置 | `import-<artifactId>-config.xml` | - |
| 数据库 | `<key>-ddl.sql` / `<key>-dml.sql` | - |
| Portlet 注册 | `<key>-dml.sql`（对 `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` 的实际 DELETE + INSERT） | - |
| 角色 | `<key>-role.xml` | ja / en / zh_CN |
| 授权资源组 | `<key>-authz-resource-group.xml` | ja / en / zh_CN |
| 授权资源 | `<key>-authz-resource.xml` | ja / en / zh_CN |
| 授权主体组 | `<key>-authz-subject-group.xml` | ja / en / zh_CN |
| 授权策略 | `<key>-authz-policy.xml` | - |
| 菜单组 | `<key>-menu-group.xml` | ja / en / zh_CN |
| 任务调度器 | `<key>-job-scheduler.xml` | ja / en / zh_CN |
| 扩展导入 JS | `<key>/initialize/<key>_import.js` | - |
| IM-Workflow 导入 JS | `<key>/initialize/<key>_workflow_import.js` | - |
| IM-Workflow 导入 XML | 复制到 `storage/system` 之下 | - |
| IM-LogicDesigner 导入 JS | `<key>/initialize/<key>_logic_import.js` | - |
| IM-LogicDesigner 导入 ZIP | 复制到 `storage/system` 之下 | - |
| IMW 逻辑流插件注册 JS | `<key>/initialize/<key>_import.js`（在 `doImport` 中使用 `WorkflowLogicFlowManager`） | - |

## 文件结构

```
jssp-sample-setup-generator/
├── SKILL.md                        # 本文件
├── scripts/
│   └── build-sample-setup-import.js # spec.json -> 一次性生成各 XML/JS/SQL
├── reference/
│   ├── import-config.md            # import-<artifactId>-config.xml 的结构
│   ├── database-sql.md             # DDL/DML 骨架规范·重新导入时的存在检查
│   ├── extends-import.md           # 扩展导入类（doImport）规范
│   ├── portlet-import.md           # Portlet 注册（portletImport）规范
│   ├── workflow-import.md          # IM-Workflow 导入（workflowImport）规范
│   ├── logic-import.md             # IM-LogicDesigner 导入（logicImport）规范
│   ├── imw-logic-plugin-import.md  # IMW 逻辑流插件注册规范
│   └── checklist.md                # 生成后的自检清单
└── examples/
    └── any_app.spec.json           # 用 spec 表示假想应用 "any_app" 的示例
```

## 输出位置

build 脚本将输出分开放置到以下位置。

| 类别 | 输出位置 |
|------|--------|
| `import-<artifactId>-config.xml` | `src/main/conf/products/import/sample/` |
| 各种 XML / SQL | `src/main/storage/system/products/import/sample/<key>/` |
| 扩展导入 JS | `src/main/jssp/src/<key>/initialize/<key>_import.js` |
| IM-Workflow 导入 JS | `src/main/jssp/src/<key>/initialize/<key>_workflow_import.js` |
| IM-Workflow 导入 XML（复制） | `src/main/storage/system/products/import/sample/<key>/<file>.xml` |
| IM-LogicDesigner 导入 JS | `src/main/jssp/src/<key>/initialize/<key>_logic_import.js` |
| IM-LogicDesigner 导入 ZIP（复制） | `src/main/storage/system/products/import/sample/<key>/<file>.zip` |

`<artifactId>` **仅用于设置文件名**（不用于存放目录名）。解析顺序：

1. **spec.json 的 `"artifactId"` 字段**
2. 项目根目录 **`pom.xml`** 的 `<artifactId>`（排除 `<parent>` 内的）
3. **`module.xml`**（或 `src/main/jssp/module.xml`）的 `<id>` 的 **点号分隔的末尾段**（例如 `mypackage.hoge` -> `hoge`）
4. **spec.key（兜底）**

`<artifactId>` 可与 `<key>` 不同。storage 之下的引用路径使用 `<key>`。

config 中的 `<role-file>`、`<authz-*-file>`、`<create-file>`、`<insert-file>` 以
相对 `src/main/storage/system` 的路径书写（如 `products/import/sample/<key>/<key>-role.xml`）。
`<extends-import-class>` 以相对 `src/main/jssp/src` 的路径书写（如 `<key>/initialize/<key>_import.js`）。

资料的放置不设置 `<version>` 目录。示例数据的运维要求是始终与模块的最新版本保持最新状态，因此更新时覆盖既有文件（`--force`）。

### DDL 的职责划分

DDL 仅以 **只在示例数据设置中使用的表** 为对象。仅生成指定了 `spec.database.tables[].ddl: true` 的表。

| 表的性质 | 创建 DDL 的位置 |
|---|---|
| 模块运行所必需 | 租户环境设置（`src/main/storage/system/products/import/basic/<key>/<version>/`） |
| 示例数据设置专用 | **示例数据设置（`src/main/storage/system/products/import/sample/<key>/`）** |

如果只是向既有表（已在租户环境设置中创建）INSERT，则不指定 `ddl`。此类表仅出现在 DML 的骨架中。

### `storage/system` 之下与 `storage/public` 之下的使用区分

| 放置位置 | 主要存放内容 | 导入路径 |
|--------|----------|---------|
| `src/main/storage/system/products/import/sample/<key>/` | DDL / DML、角色 XML、授权 XML、菜单 XML、任务调度器 XML | **仅由示例数据设置（Importer）导入**。无法通过导入画面单独导入 |
| `src/main/storage/public/im_workflow/` | IM-Workflow 导入 XML | **用户可从导入画面手动导入**（使用本技能时，会从此处复制到 storage/system 并自动导入） |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner 导入 ZIP | 同上 |

## 默认策略：扩展导入（IM-Workflow / IM-LogicDesigner）默认关闭

spec.json 中的 `workflowImport` / `logicImport` 部分，**仅在用户在 prompt 中明确指示要导入 IM-Workflow / IM-LogicDesigner 时**才添加。

- **明确指定的示例**：包含 IM-Workflow、IM-LogicDesigner、`workflowImport`、`logicImport` 任一关键词的请求。例如：「希望通过示例数据设置加载 IM-Workflow」「希望通过示例数据设置加载 IM-LogicDesigner 的逻辑流」「请包含 `workflowImport`」等
- **不允许的情况（不要根据隐式/推测来添加）**：对于「创建示例数据设置资料」之类的一般性请求，即使 `storage/public/im_workflow/` 或 `storage/public/im_logic/` 下存在文件，**也不要在 spec.json 中添加 `workflowImport` / `logicImport`**
- **不要主动询问**：AI 不得主动询问「是否有工作流 / LogicDesigner 的导入？」。只有当用户先提及时才确认细节

## 使用时机

用户提出以下请求时：

- "创建示例数据设置资料"
- "一次性创建示例数据的导入资料"
- "创建试用环境用的示例数据"
- "创建 `import-％短模块ID％-config.xml`"
- "希望将 JSSP 画面注册为示例 Portlet"（包含 `portletImport` 时）
- "希望通过示例数据设置加载 IM-Workflow 的导入"（当 `storage/public/im_workflow/` 下存在 WF 定义 XML 时）★ 仅在明确指定时
- "希望通过示例数据设置加载 IM-LogicDesigner 的导入"（当 `storage/public/im_logic/` 下存在逻辑流 ZIP 时）★ 仅在明确指定时

租户环境设置（构建模块运行的前提）请使用 `jssp-tenant-setup-generator`。

## 生成步骤

### 1. 需求确认

向用户确认以下信息。

| 项目 | 必须 | 示例 |
|------|------|------|
| 应用键（英文 ID） | YES | `any_app`, `expense_app` |
| artifactId（短模块 ID） | NO | 省略时按 `pom.xml` 的 `<artifactId>` -> `module.xml` `<id>` 点号末尾段 -> `<key>` 顺序自动解析 |
| 简称（用于插件 ID） | YES | `app`, `exp` |
| 显示名（日 / 英 / 中） | YES | `Any App` / `Any App` / `Any App` |
| 角色构成 | YES | `app_manager`（管理员）等 |
| 授权资源构成（服务 URI） | YES | `service://any_app/maintenance/content` 等 |
| 授权策略（谁能访问什么） | YES | tenant_manager / app_manager / authenticated 等 |
| 任务调度器（可选） | NO | 如有定期批处理 |
| 菜单组（可选） | NO | 如需菜单注册 |
| DML 表（可选） | NO | 导入示例数据的表 |
| DDL 表（可选） | NO | 如有只在示例数据设置中使用的表。需指定 `tables[].ddl: true` |
| Portlet 定义（可选） | NO | 希望将 JSSP 画面作为试用用 Portlet 注册到门户时（`portlet_cd`、要显示的页面路径、3 种语言的标题） |
| 扩展导入处理（可选） | NO | 如在 doImport(tenantId) 中有初始化处理 |

> **不要询问 `configNumber` / `version`**
> 示例数据设置不属于 Schema 版本管理的对象，每个模块最多只会创建 1 个设置文件。**本技能中两个字段都无法指定**（build 脚本会报错拒绝）。

### 2. 组装 spec.json

根据需求确认结果组装 spec.json。编码代理只编写 spec，XML 的 3 语言文件展开和命名空间附加由 build 脚本自动完成。

示例：[examples/any_app.spec.json](examples/any_app.spec.json)

spec.json 的各字段与租户环境设置相同。请通过前述对应表参照各 reference。本技能特有的差异仅以下内容。

```jsonc
{
  "key": "any_app",
  // 不可指定 "version" 和 "configNumber"（build 脚本会报错停止）
  "artifactId": "any-app",
  "shortName": "app",
  "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },

  // roles / authzResourceGroups / authzResources / authzPolicies /
  // authzSubjectGroups / menuGroups / jobScheduler 与租户环境设置相同

  "database": {
    "tables": [
      // 未指定 ddl = 仅 DML（已在租户环境设置中创建的表）
      { "name": "any_app_data", "comment": "サンプルデータ" },
      // ddl: true = 示例数据设置专用表。按 3 个方言分别生成 DDL
      { "name": "any_app_demo", "comment": "デモ用テーブル", "ddl": true }
    ],
    "dmlPerDialect": false                     // false（默认）：DML 单文件 / true：3 方言分别
  },

  // 将 JSSP 画面作为试用用 Portlet 注册到门户（可选）。
  // 向 b_m_portlet_info / b_m_portlet_mode / b_m_portlet_title_info 生成
  // DELETE -> INSERT（全量刷新）并输出到 <key>-dml.sql。
  // 即使没有 database，仅凭此项也会输出 DML 文件。
  // 详情请参阅 reference/portlet-import.md
  "portletImport": {
    "portlets": [
      {
        "portletCd": "any_app_summary",
        "path": "any_app/portlet/summary_view/index",
        "editable": false,
        "titles": {
          "name": { "ja": "Any App サマリ", "en": "Any App Summary", "zh_CN": "Any App 摘要" },
          "application": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
          "description": { "ja": "Any App の概要を表示します。", "en": "Displays an overview of Any App.", "zh_CN": "显示 Any App 的概览。" }
        }
      }
    ]
  },

  "extendsImport": true,
  "workflowImport": { "files": ["im_workflow-simple_approval-import.xml"] },
  "logicImport": { "files": ["im-logicdesigner-data-sample-simple.zip"] }
}
```

| reference 文件 | 内容 |
|--------------|------|
| [reference/import-config.md](reference/import-config.md) | `import-<artifactId>-config.xml` 的结构·引用规则 |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML 骨架的格式、**重新导入时的存在检查** |
| [reference/extends-import.md](reference/extends-import.md) | `doImport(tenantId)` 的实现规范 |
| [reference/portlet-import.md](reference/portlet-import.md) | Portlet 注册（`portletImport.portlets`、向 `b_m_portlet_*` 生成 DML、幂等的全量刷新、不涉及的项目） |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow 导入机制 |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner 导入机制 |
| [reference/imw-logic-plugin-import.md](reference/imw-logic-plugin-import.md) | IMW 逻辑流插件注册规范 |
| [reference/checklist.md](reference/checklist.md) | 生成后的自检 |

### 3. 执行 build-sample-setup-import.js

```bash
node .claude/skills/jssp-sample-setup-generator/scripts/build-sample-setup-import.js \
     <spec.json 的路径>
```

省略 `--out` 时，输出位置使用 SKILL.md 中记载的默认路径。

build-sample-setup-import.js 自动完成的事项：

- 3 语言区域（en / ja / zh_CN）× 各 XML 的自动展开
- 命名空间（`xmlns`）的自动附加
- 角色 ID / 授权资源 ID 等的引用完整性检查（对 spec 内部未引用的 ID 给出警告）
- 检测到 `spec.version` / `spec.configNumber` 时报错停止
- 存在 `type="im-logic-rest"` 的授权策略时给出警告（参见 [reference/logic-import.md](reference/logic-import.md)）
- DDL（仅限 `tables[].ddl: true`，按 3 个方言分别）/ DML 的骨架 SQL 生成
- 根据 `portletImport.portlets` 生成向 `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` 的实际 DELETE + INSERT 语句（并非仅有注释的骨架，而是可直接用于示例数据设置导入的 DML。为经受每次执行，以 DELETE -> INSERT 的全量刷新方式输出，且不添加 SQL 注释）
- 扩展导入 JS 骨架的生成（以空函数输出 `doImport(tenantId)`）
- IM-Workflow 导入 XML 的复制（`storage/public/im_workflow/` -> `storage/system/products/import/sample/<key>/`）以及专用 JS（`<key>_workflow_import.js`）的生成
- IM-LogicDesigner 导入 ZIP 的复制（`storage/public/im_logic/` -> `storage/system/products/import/sample/<key>/`）以及专用 JS（`<key>_logic_import.js`）的生成（经由 `Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider`）
- `import-<artifactId>-config.xml` 的自动组装（仅引用实际存在的输出文件，`<extends-import>` 中并列多个 `<extends-import-class>`）

存在既有文件时会报错停止。更新资料时请指定 `--force`。

### 4. 自检

生成后按 [reference/checklist.md](reference/checklist.md) 的自检清单进行确认。

## 注意事项

- 本技能 **专用于新应用的示例数据资料一式的生成**。不适用于对既存资料的追加（如向 authz-policy 追加条目等），此类操作建议手动编辑。
- **不要重新定义租户环境设置侧已定义的角色·授权·菜单·作业·Portlet**（会造成重复导入。Portlet 会因全量刷新而覆盖租户侧的注册内容）。
- 授权策略的 `subject` 表达式（如 `S(b_m_role:...)`）**build 脚本不会对其内容进行校验**。务必参照 `.claude/skills/jssp-tenant-setup-generator/reference/authz-policy.md` 确认书式。
- 扩展导入 JS（`doImport(tenantId)`）的内容是空骨架。实现内容由用户单独追加。实现规范请参见 [reference/extends-import.md](reference/extends-import.md)。

## 区分

| 技能 | 用途 |
|------|------|
| **jssp-sample-setup-generator**（本技能） | 示例数据设置资料一式（Importer 格式）的生成 |
| jssp-tenant-setup-generator | 租户环境设置资料一式的生成（构建模块运行的前提） |
| jssp-im-workflow-generator | IM-Workflow 工作流定义 XML 的生成 |
| jssp-im-logic-generator | IM-LogicDesigner 流程定义 JSON 的生成 |
| jssp-page-generator | 画面·函数容器的生成 |
| jssp-im-job-generator | 作业程序（批处理）本体的实现 |

**关于任务调度器的区分：**
本技能生成的仅为 `<key>-job-scheduler.xml`（作业·作业网的定义 XML）。
作业的**实现本体**（`jp.co...` 的 Java 类或 `.js` 的作业程序）应使用 `jssp-im-job-generator`。
