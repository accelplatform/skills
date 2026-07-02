---
name: jssp-tenant-setup-generator
description: 新建 intra-mart Accel Platform 租户环境设置（Importer）所需的全套资料。从 spec.json 一次性以多语言（ja/en/zh_CN）展开生成 Importer 格式的 config XML、角色、授权（策略 / 资源 / 资源组 / 主体组）、菜单组、任务调度器、扩展导入 JS、DDL/DML SQL 骨架、IM-Workflow 导入联动（将 storage/public 下的 WF 定义 XML 复制到 storage/system 并生成通过 DataImportExecutor 加载的扩展导入 JS）、IM-LogicDesigner 导入联动（将 storage/public 下的逻辑流 ZIP 复制到 storage/system 并生成通过 LogicFlowImporter 加载的扩展导入 JS）。当用户提及"创建租户初始设置资料"、"创建 Importer 导入资料"、"创建初始数据导入用 XML"、"创建设置 XML"、"希望通过租户环境设置加载 IM-Workflow"、"将工作流定义的导入纳入设置"、"希望通过租户环境设置加载 IM-LogicDesigner 的逻辑流"时使用。
allowed-tools: Bash, Read, Write, Glob
---

# 租户环境设置资料生成技能

## 目的

用于根据提示指示从零生成 intra-mart Accel Platform 的 **Importer**（租户环境设置资料）所需全套文件的技能。
生成的资料可从租户环境管理（租户环境设置）导入。

## 生成对象

| 类别 | 输出文件 | 多语言 |
|------|---------|--------|
| 导入设置 | `import-<artifactId>-config-1.xml` | - |
| 数据库 | `<key>-ddl.sql` / `<key>-dml.sql` | - |
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

## 文件结构

```
jssp-tenant-setup-generator/
├── SKILL.md                       # 本文件
├── scripts/
│   └── build-setup-import.js      # spec.json -> 一次性生成各 XML/JS/SQL
├── reference/
│   ├── import-config.md           # import-<artifactId>-config-1.xml 的结构
│   ├── role.md                    # 角色定义 XML 规范
│   ├── authz-policy.md            # 授权策略 XML 规范
│   ├── authz-resource.md          # 授权资源·资源组 XML 规范
│   ├── authz-subject-group.md     # 授权主体组 XML 规范
│   ├── menu-group.md              # 菜单组 XML 规范
│   ├── job-scheduler.md           # 任务调度器 XML 规范
│   ├── extends-import.md          # 扩展导入类（doImport）规范
│   ├── workflow-import.md         # IM-Workflow 导入（workflowImport）规范
│   ├── logic-import.md            # IM-LogicDesigner 导入（logicImport）规范
│   ├── multi-config.md            # 多个 config 运维（版本升级 / 同一版本内追加 config）
│   ├── database-sql.md            # DDL/DML 骨架规范
│   └── checklist.md               # 生成后的自检清单
└── examples/
    └── any_app.spec.json          # 用 spec 表示假想应用 "any_app" 的示例
```

## 输出位置

build 脚本将输出分为以下 2 处。

| 类别 | 输出位置 |
|------|---------|
| `import-<artifactId>-config-<N>.xml` | `src/main/conf/products/import/basic/<artifactId>/` |
| 各种 XML / SQL | `src/main/storage/system/products/import/basic/<key>/<version>/` |
| 扩展导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js` |
| IM-Workflow 导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| IM-Workflow 导入 XML（复制） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| IM-LogicDesigner 导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| IM-LogicDesigner 导入 ZIP（复制） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |

`<version>` 按以下优先顺序决定：

1. 若指定了 **spec.json 的 `"version"` 字段**则使用该值
2. 若项目根目录存在 **`module.xml`**（或 `src/main/jssp/module.xml`），则使用其 `<version>` 标签的值
3. 若项目根目录存在 **`pom.xml`**，则使用其 `<version>` 标签的值（排除 `<parent>` 内的 version）
4. 以上均不存在时使用 **`1.0.0`**

`<N>` 通过 spec.json 的 `"configNumber"` 字段指定。**AI 必须在需求确认阶段务必向用户询问 `configNumber`**（不得自动推断；详情参见"### 1. 需求确认"下的注记）。处理多个 config 的运维详见后文"多个 config 运维"。

当 `<N> >= 2` 时，各 XML / SQL / JS 的文件名末尾会附加 `-<N>` 后缀（如 `equip-authz-policy-2.xml`、`equip_import-2.js`）。这是为了在同一 `<version>` 内多个 config 共存时避免冲突，用于希望在同一版本内控制导入顺序的运维场景（如控制 LogicDesigner 路由与授权策略的执行顺序）。关于插入位置的细节和使用场景，请参见 [reference/import-config.md](reference/import-config.md#confignumber--1-时的文件名后缀) 与 [reference/logic-import.md](reference/logic-import.md#路由用授权策略的投入顺序)。

`<artifactId>` 是 **设置 XML 的存放目录名兼文件名（`import-<artifactId>-config-<N>.xml`）**。按 intra-mart 租户环境设置的规范，必须与项目 `pom.xml` 的 `<artifactId>` 一致。解析顺序：

1. **spec.json 的 `"artifactId"` 字段**（显式指定）
2. 项目根目录 **`pom.xml`** 的 `<artifactId>`（排除 `<parent>` 内的）
3. 项目根目录 **`module.xml`**（或 `src/main/jssp/module.xml`）的 `<id>` 的 **点号分隔的末尾段**（例如 `mypackage.hoge` -> `hoge`）
4. **spec.key（兜底）** — 以上均不存在时用 spec.key 替代

`<artifactId>` 可与 `<key>` 不同（如 `<key>="equip"`、`<artifactId>="equipment-lending-system"`）。内部引用路径（`<*-file>`）使用 `<key>`，**仅 Importer 设置 XML 的目录名和文件名（`import-<artifactId>-config-<N>.xml`）** 使用 `<artifactId>`。

config-1.xml 中的 `<role-file>`、`<authz-*-file>`、`<create-file>`、`<insert-file>` 以
相对 `src/main/storage/system` 的路径书写（如 `products/import/basic/<key>/<version>/<key>-role.xml`）。
`<extends-import-class>` 以相对 `src/main/jssp/src` 的路径书写（如 `<key>/initialize/<version>/<key>_import.js`）。

## DDL / 示例 DML 放置位置的意义

**租户环境设置中导入的 SQL 文件**（`CREATE TABLE` 等 DDL，以及**用于导入初始示例数据的 DML（`<key>_sample-dml.sql`）**）必须放置在以下路径，无论是否直接使用本技能：

```
src/main/storage/system/products/import/basic/<key>/<version>/
```

**理由**：DDL 与示例初始 DML 的设计前提是 **由 intra-mart 的租户环境设置（Importer）一次性批量导入**。用户无法通过导入画面单独导入，因此必须作为租户环境设置资源放置在 `storage/system` 下。`jssp-page-generator` 和 `jssp-im-workflow-usage` 等其他技能生成 DDL/示例 DML 时也需集中放置于此。

### 范围外：从函数容器运行时调用的 SQL

从函数容器通过 `db.executeByTemplate` / `db.execute` **在运行时调用的业务 SQL**（SELECT / INSERT / UPDATE / DELETE 等 2WaySQL 模板）不在本章节范围内。
这些文件放置于 `src/main/jssp/src/{功能名}/sql/`（详见 `.claude/rules/jssp-2way-sql.md`）。

### `storage/system` 与 `storage/public` 的使用区分

| 放置位置 | 主要存放内容 | 导入路径 |
|---------|------------|---------|
| `src/main/storage/system/products/import/basic/<key>/<version>/` | DDL / 示例 DML、角色 XML、授权 XML、菜单 XML、作业调度 XML、扩展导入 JS 等 | **仅由租户环境设置（Importer）导入**。无法通过导入画面单独导入 |
| `src/main/storage/public/im_workflow/` | IM-Workflow 导入 XML | **用户可从导入画面手动导入**（使用本技能时，会从此处复制到 storage/system 并自动导入） |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner 导入 ZIP | 同上 |

简言之，**用户可通过导入画面单独导入的资源放在 `storage/public` 下**，**不可单独导入的资源放在 `storage/system` 下**。DDL 与示例 DML 属于后者，因此必须放置在 `storage/system` 下。

## 默认策略：扩展导入（IM-Workflow / IM-LogicDesigner）默认关闭

spec.json 中的 `workflowImport` / `logicImport` 部分，**仅在用户在 prompt 中明确指示要导入 IM-Workflow / IM-LogicDesigner 时**才添加。

- **明确指定的示例**：包含 IM-Workflow、IM-LogicDesigner、`workflowImport`、`logicImport` 任一关键词的请求。例如：「希望通过租户环境设置加载 IM-Workflow」「将工作流定义的导入纳入设置」「希望通过租户环境设置加载 IM-LogicDesigner 的逻辑流」「请包含 `workflowImport`」等
- **不允许的情况（不要根据隐式/推测来添加）**：对于「创建租户初始设置资料」「创建 Importer 导入资料」之类的一般性请求，即使 `storage/public/im_workflow/` 或 `storage/public/im_logic/` 下存在文件，**也不要在 spec.json 中添加 `workflowImport` / `logicImport`**
- **不要主动询问**：AI 不得主动询问「是否有工作流 / LogicDesigner 的导入？」。只有当用户先提及时才确认细节

## 使用时机

用户提出以下请求时：

- "创建租户初始设置资料"
- "一次性生成 Importer 的导入 XML 全套"
- "创建租户环境设置用的授权资源·角色定义"
- "生成初始数据导入的骨架"
- "希望通过租户环境设置加载 IM-Workflow"（当 `storage/public/im_workflow/` 下存在 WF 定义 XML 时）★ 仅在明确指定时
- "希望通过租户环境设置加载 IM-LogicDesigner"（当 `storage/public/im_logic/` 下存在逻辑流 ZIP 时）★ 仅在明确指定时

## 生成步骤

### 1. 需求确认

向用户确认以下信息。

| 项目 | 必须 | 示例 |
|------|------|------|
| 应用键（英文 ID） | YES | `any_app`, `expense_app` |
| 版本号 | NO | `1.0.0`（省略时自动从 `module.xml` / `pom.xml` 的 `<version>` 检测；若都不存在则为 `1.0.0`） |
| config 编号（configNumber） | YES | `1`（初次安装）／`2`, `3`, ...（向已导入的租户追加差分）。**必须向用户确认，不得自动推断**（AI 无法判断该资料是否在向既有租户再次投入） |
| artifactId（设置 XML 存放目录名） | NO | 省略时按 `pom.xml` 的 `<artifactId>` -> `module.xml` `<id>` 点号末尾段 -> `<key>` 顺序自动解析 |
| 简称（用于插件 ID） | YES | `app`, `exp` |
| 显示名（日 / 英 / 中） | YES | `Any App` / `Any App` / `Any App` |
| 角色构成 | YES | `app_manager`（管理员）等 |
| 授权资源构成（服务 URI） | YES | `service://any_app/maintenance/content` 等 |
| 授权策略（谁能访问什么） | YES | tenant_manager / app_manager / authenticated 等 |
| 任务调度器（可选） | NO | 如有定期批处理 |
| 菜单组（可选） | NO | 如需菜单注册 |
| DDL/DML 表（可选） | NO | 如有专有表 |
| 扩展导入处理（可选） | NO | 如在 doImport(tenantId) 中有初始化处理 |

> **关于 configNumber 的需求确认**
> `configNumber` **不会**根据 `module.xml` / `pom.xml` 的 `<version>` 变化或既有文件存在与否自动推断。新应用的初次安装使用 `1`，向已导入的租户追加差分则为 `2` 或更高，属于需要运维判断的内容。因此 AI 在组装 spec.json 之前，务必向用户提出如下问题:
> - "本次安装是新应用的初版（configNumber=1），还是对已导入租户的差分追加（configNumber=2 或更高）？"
> - 追加差分时，需先确认当前最大 N，然后指定 `N+1`。

### 2. 组装 spec.json

根据需求确认结果组装 spec.json。编码代理只编写 spec，XML 的 3 语言文件展开和命名空间附加由 build 脚本自动完成。

示例：[examples/any_app.spec.json](examples/any_app.spec.json)

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",                          // 版本号。省略时自动从 module.xml / pom.xml 的 <version> 检测；若都不存在则为 "1.0.0"
  "configNumber": 1,                           // import-<artifactId>-config-<N>.xml 中的 N。初次安装用 1，向已导入的租户追加差分则用 2, 3, ...。AI 必须在需求确认时向用户确认，不得默默使用默认值 1。
  "artifactId": "any-app",                     // 设置 XML 存放目录名。省略时按 pom.xml 的 <artifactId> -> module.xml <id> 点号末尾段 -> "key" 顺序回退
  "shortName": "app",
  "displayNames": {
    "ja": "Any App",
    "en": "Any App",
    "zh_CN": "Any App"
  },

  // 1. 角色定义
  "roles": [
    {
      "id": "app_manager",                    // 角色 ID（短英数字）
      "name": "any_app_manager",              // 角色名（系统内部名）
      "category": "any_app",                  // 角色类别
      "displayNames": {
        "ja": "Any App 管理者",
        "en": "Any App Manager",
        "zh_CN": "Any App 管理者"
      }
    }
  ],

  // 2. 授权资源组
  "authzResourceGroups": [
    { "id": "any-app-content-root", "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." } },
    { "id": "any-app-http-services", "parentGroup": "http-services",
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } }
  ],

  // 3. 授权资源
  "authzResources": [
    {
      "id": "any-app-content-maintenance",
      "uri": "service://any_app/maintenance/content",
      "parentGroup": "any-app-http-services",
      "displayNames": {
        "ja": "Any App コンテンツ管理",
        "en": "Any App Content Maintenance",
        "zh_CN": "Any App 内容管理"
      }
    }
  ],

  // 4. 授权策略（无需多语言）
  //    ※ tenant_manager 会自动授予所有 service 资源和所有菜单组，无需记述。
  //      仅记述其他目标角色／用户（详见 reference/authz-policy.md「默认策略」）。
  "authzPolicies": [
    { "resource": "any-app-content-maintenance", "type": "service", "action": "execute",
      "subject": "S(b_m_role:app_manager)", "effect": "PERMIT" }
  ],

  // 5. 授权主体组
  "authzSubjectGroups": [
    {
      "sortKey": 900,
      "expression": "S(b_m_role:app_manager)",
      "displayNames": { "ja": "Any App 管理者", "en": "Any App Manager", "zh_CN": "Any App 管理者" }
    }
  ],

  // 6. 菜单组（可选） — menu-items 可以用 items 数组分层书写
  "menuGroups": [
    {
      "id": "any_app_sm-pc",                  // 惯例：<key>_sm-pc（站点地图 PC）
      "sortNumber": 2000,                     // 顶层文件夹的显示顺序
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
      "items": [
        { "id": "any_app_home_sm-pc",  "sortNumber": 10, "url": "any_app/home",
          "displayNames": { "ja": "ホーム", "en": "Home", "zh_CN": "首页" } },
        { "id": "any_app_admin_sm-pc", "sortNumber": 100, "type": "folder",
          "displayNames": { "ja": "管理", "en": "Admin", "zh_CN": "管理" },
          "items": [
            { "id": "any_app_admin_users_sm-pc", "sortNumber": 10, "url": "any_app/admin/users",
              "displayNames": { "ja": "ユーザ管理", "en": "User Management", "zh_CN": "用户管理" } }
          ]
        }
      ]
    }
  ],

  // 7. 任务调度器（可选）
  "jobScheduler": {
    "jobCategory":    { "id": "app-job-category",    "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobnetCategory": { "id": "app-jobnet-category", "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobs": [
      {
        "id": "app-job-sample-batch",
        "type": "JAVA",
        "path": "com.example.any_app.job.SampleBatchJob",
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ],
    "jobnets": [
      {
        "id": "app-jobnet-sample-batch",
        "disallowConcurrent": true,
        "jobs": ["app-job-sample-batch"],
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ]
  },

  // 8. 数据库（可选） — DDL 始终按 3 个方言分别生成，DML 通过 dmlPerDialect 切换
  "database": {
    "tables": [
      { "name": "any_app_data", "comment": "サンプルデータ" }
    ],
    "dmlPerDialect": false                     // false（默认）：DML 单文件 / true：3 方言分别
  },

  // 9. 扩展导入（可选） — 为 true 时生成 doImport(tenantId) 的骨架 JS
  "extendsImport": true,

  // 10. IM-Workflow 导入（可选） — 将 files 中列出的 XML 从 storage/public/im_workflow/
  //     复制到 storage/system 之下，并生成加载用 <key>_workflow_import.js
  "workflowImport": {
    "files": [
      "im_workflow-simple_approval-import.xml"
    ]
  },

  // 11. IM-LogicDesigner 导入（可选） — 将 files 中列出的 ZIP 从 storage/public/im_logic/
  //     复制到 storage/system 之下，并生成通过 LogicFlowImporter 加载的 <key>_logic_import.js
  "logicImport": {
    "files": [
      "im-logicdesigner-data-sample-simple.zip"
    ]
  }
}
```

各部分的详细信息请参见 `reference/` 之下的文件。

| reference 文件 | 内容 |
|--------------|------|
| [reference/import-config.md](reference/import-config.md) | `import-<artifactId>-config-1.xml` 的结构·引用规则 |
| [reference/role.md](reference/role.md) | 角色定义 XML（基底 + 语言别） |
| [reference/authz-policy.md](reference/authz-policy.md) | 授权策略 XML（subject 的书式·effect） |
| [reference/authz-resource.md](reference/authz-resource.md) | 授权资源·资源组 XML（parent-group, uri） |
| [reference/authz-subject-group.md](reference/authz-subject-group.md) | 授权主体组 XML（sort-key, expression） |
| [reference/menu-group.md](reference/menu-group.md) | 菜单组 XML 的最小结构 |
| [reference/job-scheduler.md](reference/job-scheduler.md) | 作业·作业网定义 XML |
| [reference/extends-import.md](reference/extends-import.md) | `doImport(tenantId)` 的实现规范 |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow 导入机制（`workflowImport.files`、生成 JS 的结构、依赖顺序） |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner 导入机制（`logicImport.files`、`LogicFlowImporter` 的 Java 直接访问） |
| [reference/multi-config.md](reference/multi-config.md) | 多个 config 运维（版本升级 / 同一版本内追加 config）的手顺与示例 |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML SQL 骨架的格式 |
| [reference/checklist.md](reference/checklist.md) | 生成后的自检 |

### 3. 执行 build-setup-import.js

```bash
node .claude/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js \
     <spec.json 的路径>
```

省略 `--out` 时，输出位置使用 SKILL.md 中记载的默认路径。

build-setup-import.js 自动完成的事项：

- 3 语言区域（en / ja / zh_CN）× 各 XML 的自动展开
- 命名空间（`xmlns`）的自动附加
- 角色 ID / 授权资源 ID 等的引用完整性检查（对 spec 内部未引用的 ID 给出警告）
- DDL/DML 骨架 SQL 的生成（仅在表名上添加注释）
- 扩展导入 JS 骨架的生成（以空函数输出 `doImport(tenantId)`）
- IM-Workflow 导入 XML 的复制（`storage/public/im_workflow/` -> `storage/system/products/import/basic/<key>/<version>/`）以及专用 JS（`<key>_workflow_import.js`）的生成
- IM-LogicDesigner 导入 ZIP 的复制（`storage/public/im_logic/` -> `storage/system/products/import/basic/<key>/<version>/`）以及专用 JS（`<key>_logic_import.js`）的生成（经由 `Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider`）
- `import-<artifactId>-config-1.xml` 的自动组装（仅引用实际存在的输出文件，`<extends-import>` 中并列多个 `<extends-import-class>`）

### 4. 自检

生成后按 [reference/checklist.md](reference/checklist.md) 的自检清单进行确认。

## 多个 config 运维

将 `import-<artifactId>-config-N.xml` 拆分为多个文件的情况分为 2 种模式。

| 模式 | 用途 |
|---|---|
| **(I) 版本升级** | 提升 `spec.version`，将差分追加到新版本目录 |
| **(II) 同一版本内追加 config** | 保留 `spec.version`，仅增加 `configNumber`；文件名末尾会附加 `-<N>` 后缀 |

两者都 **不动既有的 config-N.xml**，而是追加新 config。手顺、具体示例和差分 spec.json 示例请参见 [reference/multi-config.md](reference/multi-config.md)。

## 注意事项

- 本技能 **专用于新应用的导入资料一式的生成**。不适用于对既存资料的追加（如向 authz-policy 追加条目等），此类操作建议手动编辑。
- 菜单组 XML 的详细规范（菜单项的层级·链接种类等）请参考 intra-mart Accel Platform 的文档。本技能仅生成最小结构的框架。
- 授权策略的 `subject` 表达式（如 `S(b_m_role:...)`）**build 脚本不会对其内容进行校验**。spec.json 中写入的字符串原样输出。务必参照 [reference/authz-policy.md](reference/authz-policy.md) 确认书式。
- 扩展导入 JS（`doImport(tenantId)`）的内容是空骨架。实现内容由用户单独追加。实现规范请参见 [reference/extends-import.md](reference/extends-import.md)。

## 区分

| 技能 | 用途 |
|------|------|
| **jssp-tenant-setup-generator**（本技能） | 租户环境设置资料一式（Importer 格式）的生成 |
| jssp-im-workflow-generator | IM-Workflow 工作流定义 XML 的生成 |
| jssp-im-logic-generator | IM-LogicDesigner 流程定义 JSON 的生成 |
| jssp-page-generator | 画面·函数容器的生成 |
| jssp-im-job-generator | 作业程序（批处理）本体的实现 |

**关于任务调度器的区分：**
本技能生成的仅为 `<key>-job-scheduler.xml`（作业·作业网的定义 XML）。
作业的**实现本体**（`jp.co...` 的 Java 类或 `.js` 的作业程序）应使用 `jssp-im-job-generator`。
