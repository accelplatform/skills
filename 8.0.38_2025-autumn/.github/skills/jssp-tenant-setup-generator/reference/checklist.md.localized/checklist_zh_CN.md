# 安装资材生成后自检清单

执行 build-setup-import.js 之后，请确认以下事项。

## 文件结构

- [ ] 已输出 `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml`（目录名与文件名使用相同的 `<artifactId>`。`<artifactId>` 的解析优先级：spec.json 的 `"artifactId"` → pom.xml 的 `<artifactId>` → module.xml 的 `<id>` 以点分隔的末尾段 → `<key>` 兜底）
- [ ] 各 XML / SQL 已输出到 `src/main/storage/system/products/import/basic/<key>/<version>/` 之下
- [ ] 指定扩展导入时，已生成 `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js`
- [ ] 指定 `workflowImport.files` 时，已将原始 XML 复制到 `storage/system/products/import/basic/<key>/<version>/<file>.xml`
- [ ] 指定 `workflowImport.files` 时，已生成 `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js`
- [ ] 指定 `logicImport.files` 时，已将原始 ZIP 复制到 `storage/system/products/import/basic/<key>/<version>/<file>.zip`
- [ ] 指定 `logicImport.files` 时，已生成 `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js`
- [ ] `<version>`（资材版本，例如 `1.0.0`）与 `spec.version` 指定的值一致（省略时为 `1.0.0`）
- [ ] `<N>`（config 编号，例如 `2`）与 `spec.configNumber` 指定的值一致（省略时为 `1`）
- [ ] 当 `<N> >= 2` 时，各文件名的基础部分末尾被附加了 `-<N>` 后缀（例如 `<key>-authz-policy-2.xml`、`<key>-role-2_ja.xml`、`<key>-ddl-2_postgre.sql`、`<key>_import-2.js`）。必须插入到区域设置／DB 方言后缀的**正前方**
- [ ] 全部 XML 文件以 UTF-8（不带 BOM）编码

## 多语言文件

- [ ] role / authz-resource / authz-resource-group / authz-subject-group / menu-group / job-scheduler 各自具备 **基础 + 3 个区域设置（ja / en / zh_CN）共 4 个文件**
- [ ] 各语言文件的 ID / URI / sort-key + expression 与基础文件匹配（检查拼写错误及大小写）
- [ ] 显示名中没有混入空字符串或 `null`

## 引用完整性

- [ ] `import-<artifactId>-config-1.xml` 中所有 `<*-file>` 引用的文件均实际存在（路径中需包含版本目录 `<version>/`）
- [ ] `<extends-import-class>` 引用的 JS 实际存在（包含 `.js` 扩展名以及版本目录）
- [ ] `authz-policy.xml` 的 `resource` 属性在 `authz-resource.xml` 一侧已被定义（哈希值的情况除外）
- [ ] `authz-policy.xml` 的 `subject` 表达式中引用的角色 ID 在 `<key>-role.xml` 中存在
- [ ] `authz-resource.xml` 的 `<parent-group>` 存在于 `authz-resource-group.xml` 或 intra-mart 标准组中
- [ ] `authz-subject-group.xml` 的 `<expression>` 表达式引用了 `<key>-role.xml` 中的角色 ID

## 任务调度器

- [ ] `<job-detail>` 的 `<category-id>` 与 `<job-category>` 的 ID 一致
- [ ] `<jobnet>` 的 `<category-id>` 与 `<jobnet-category>` 的 ID 一致
- [ ] `<serialize>` 中的 `<job-id>` 与 `<job-detail>` 的 ID 一致
- [ ] `<job-path>` 指定的 Java 类 / JSSP 实际存在（导入时可加载）

## 菜单组

- [ ] `authz-policy.xml` 中 `type="im-menu-group"` 的 `resource` 属性已指定正确的哈希值（不存在 `REPLACE_WITH_MENU_GROUP_HASH` 占位符）
  - build 脚本会根据 `spec.menuGroups[].id` 自动计算 `SHA-256("im-menu-group://menugroups/<id>")`
  - 通过 `grep "REPLACE_WITH" authz-policy.xml` 确认生成的 XML 中没有残留
- [ ] 添加菜单项时，已在 `<menu-group>` 内手动追加 `<menu-items>`

## DDL / DML

- [ ] 已在 CREATE TABLE 的骨架中追加实际的表定义（仅有注释将无法运行）
- [ ] 注意 DDL 的幂等性（考虑对同一租户的重复执行）
- [ ] 未在 DML 中包含业务数据（仅限主数据类）

## 扩展导入 JS

- [ ] `doImport(tenantId)` 内的初始化处理已用 try/catch 包裹
- [ ] 使用 Logger 输出开始 / 完成 / 异常日志
- [ ] 仅使用了 var（禁止 let / const / 箭头函数）
- [ ] 若存在 Tenant Database 访问，则在出错时重新 throw 异常以使整个 Importer 失败

## IM-Workflow 导入（指定了 `workflowImport` 的情况）

- [ ] 原始 WF XML 以 **UTF-16** 编码（`<?xml version="1.0" encoding="UTF-16"?>`）
- [ ] WF XML 中 `<data>` 直下的各节（`<contents>` / `<route>` / `<flow>` / `<matter_property>` / `<rule>`）使用 **2 个空格缩进** 编写（这是 `extractTopLevelSection` 的前提）
- [ ] `import-<artifactId>-config-<N>.xml` 的 `<extends-import>` 中包含指向 `<key>_workflow_import.js` 的 `<extends-import-class>` 行（与 `extendsImport` 并用时为 2 行并列）
- [ ] 目标环境为 **8.0.37 (2025 Spring) 或以上**（`DataImportExecutor` / `SystemStorage` / `TenantInfoManager` 的要求）
- [ ] 执行租户环境安装后，`<key>.workflow_import` 日志中输出了 "workflow import completed."
- [ ] 执行后没有残留 `storage/public/tmp/<key>_*_*.xml` 等临时文件（设计上会在 `finally` 中删除，但 Importer 异常终止时可能残留）
- [ ] 详情请参见 [workflow-import.md](workflow-import.md) 的检查点

## IM-LogicDesigner 导入（指定了 `logicImport` 的情况）

- [ ] 原始 ZIP 为 **IM-LogicDesigner 的导出格式**（与从管理界面导出的格式相同）
- [ ] `import-<artifactId>-config-<N>.xml` 的 `<extends-import>` 中包含指向 `<key>_logic_import.js` 的 `<extends-import-class>` 行（与其他扩展导入并列）
- [ ] 目标环境为 **8.0.37 (2025 Spring) 或以上**（`SystemStorage.getCanonicalPath()` 的要求。`LogicFlowImporter` 本身在 8.0.0 及以上即可）
- [ ] 执行租户环境安装后，`<key>.logic_import` 日志中输出了 "logic import completed."
- [ ] 已知悉扩展导入 JS **使用了 Java 直接访问（`Packages.***`）**（因为 IM-LogicDesigner 没有通用 SSJS API，作为例外被容许）
- [ ] 包含路由定义（`flow_route.json`）时，对应的授权策略被分离到 **不同的 configNumber** 中（若在同一 config 内用 `authzPolicies` 编写，会在资源尚未注册的状态下投入策略并被静默忽略）
- [ ] 路由用策略的 `type` 为 `im-logic-rest`（不是 `service`），`resource` 为 `authzUri` 字符串的 SHA-256（16 进制 lowercase）
- [ ] 详情请参见 [logic-import.md](logic-import.md)

## 运行确认（在租户环境中）

- [ ] 从租户环境安装中导入 `import-<artifactId>-config-<N>.xml`，确认无错误地完成

## 版本升级时的附加检查（configNumber >= 2 的情况）

- [ ] 对既有的 `import-<artifactId>-config-1.xml` ～ `config-(N-1).xml` **未做任何修改**
- [ ] 对既有文件（无后缀的 `<key>-*.xml` 等）**未做任何修改**
- [ ] 新 spec.json 中**仅记述差异部分**（不包含既有角色 / 既有资源 ID 等）
- [ ] 新 config-N.xml 中的 `<*-file>` 引用全部指向预期的路径：
  - **版本本身被提升的情况**（如 `1.1.0`，修改了 `spec.version`）：引用新版本目录（例如 `1.1.0/`）下的无后缀文件
  - **同一版本内仅 config 增加的情况**（`spec.version` 保持不变）：引用相同 `<version>/` 下带 `-<N>` 后缀的文件
- [ ] DDL 中对既有表执行 ALTER 时，在 3 个方言文件（`_postgre` / `_oracle` / `_sqlserver`）中以方言特有语法分别编写
- [ ] 在租户环境中**从 `config-1.xml` 按编号顺序重新执行**，验证无错误地完成（intra-mart Importer 会按编号顺序执行全部 config）
