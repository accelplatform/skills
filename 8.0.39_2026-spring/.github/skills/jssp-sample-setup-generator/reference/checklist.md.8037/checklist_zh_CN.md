# 示例数据设置资料 生成后自检清单

执行 build-sample-setup-import.js 之后，请确认以下事项。

多语言文件·引用完整性·任务调度器·菜单组的各章节请参见
`.github/skills/jssp-tenant-setup-generator/reference/checklist.md`（替换方式参见 SKILL.md 的「参照时的替换」）。

以下是示例数据设置固有的项目。

## 文件结构

- [ ] 已输出 `src/main/conf/products/import/sample/import-<artifactId>-config.xml`
  - **不夹入短模块 ID 目录**（直接位于 `conf/products/import/sample/` 之下）
  - **文件名中不带 Schema 版本**（是 `-config.xml` 而非 `-config-1.xml`）
- [ ] 各 XML / SQL 已输出到 `src/main/storage/system/products/import/sample/<key>/` 之下
  - **不夹入 `<version>` 目录**
  - 短模块 ID 目录（`<key>/`）**存在**（不要与设置文件一侧混淆）
- [ ] 扩展导入 JS 位于 `src/main/jssp/src/<key>/initialize/` 直下（**无 `<version>` 目录**）
- [ ] 全部 XML 文件以 UTF-8（不带 BOM）编码

## 固有检查（最重要）

- [ ] **未指定 `spec.version` / `spec.configNumber`**（一旦指定，build 脚本会报错停止）
- [ ] **仅对示例数据设置专用表指定了 `ddl: true`**。模块本体的表在租户环境设置一侧创建
- [ ] **已确认幂等性**（每次都会执行全部模块的处理）
  - [ ] DDL 的 CREATE TABLE 在表已创建的状态下不会报错（带存在检查）
  - [ ] DML 的 INSERT 在重复导入时不会违反唯一约束（`WHERE NOT EXISTS` / 先 `DELETE` 再 `INSERT` 等）
  - [ ] 扩展导入 `doImport()` 重新执行后结果相同（推荐全量刷新）
  - [ ] `logicImport` 的 JS 为 `importData(inputStream, true)`（带覆盖）
- [ ] **已加入日志输出**（即使发生异常也会继续后续处理，没有日志就会漏掉失败）
- [ ] 需要控制 `<extends-import-class>` 的顺序时，**通过同一文件内的记述顺序** 控制（无法拆分 config）
- [ ] 未包含 `type="im-logic-rest"` 的授权策略（无法投入。build 脚本会发出警告）
- [ ] **未重新定义租户环境设置一侧已定义的角色 / 授权资源 / 菜单组 / 作业**（会造成重复导入）
- [ ] 示例一侧新定义的 ID 与租户环境设置一侧没有冲突（因为两种设置会针对同一 `<key>` 投入资料）。授权主体组的 `sort-key`·菜单组的 `sortNumber` 也要与租户一侧使用不同的值段
- [ ] 未指定 `ddl` 的表已由租户环境设置的 DDL 创建

## XSD 结构

- [ ] `<import-data-config>` 直下按 **`database` -> `tenant-master` -> `extends-import`** 的顺序（XSD 的 sequence）
- [ ] `<database>` 内按 **`create-file` -> `insert-file`** 的顺序
- [ ] `<tenant-master>` 内按依赖顺序（角色 -> 授权资源组 -> 授权资源 -> 授权主体组 -> 菜单组 -> **授权策略** -> 任务调度器）

## DDL（指定了 `tables[].ddl: true` 的情况）

- [ ] 已在 CREATE TABLE 的骨架中追加实际的表定义（保持注释状态则什么也不会创建）
- [ ] **已删除注释行**（规范上不支持 SQL 语句中的注释）
- [ ] **3 个方言全部**（`_postgre` / `_oracle` / `_sqlserver`）以方言特有的类型·语法编写
- [ ] **未将没有存在检查的 `DROP` / `CREATE` 放在开头**（首条失败时同一文件剩余的全部内容都会被跳过，在表未创建的状态下被视为"成功" -> [database-sql.md](database-sql.md#importer-的-sql-执行行为重要)）
- [ ] **在表已创建的状态下重新执行也不会报错**（[database-sql.md](database-sql.md#表已创建状态下的重新导入)）
  - [ ] PostgreSQL：`CREATE TABLE IF NOT EXISTS`
  - [ ] SQL Server：`IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '<table>') CREATE TABLE ...`
  - [ ] Oracle 23ai 及以上：`CREATE TABLE IF NOT EXISTS`
  - [ ] **低于 Oracle 23ai**：存在检查（PL/SQL）会因拆分而失效，无法使用。仅使用单纯的 `CREATE TABLE`（不混入 `DROP`），或通过扩展导入创建（[database-sql.md](database-sql.md#低于-oracle-23ai-无法编写存在检查)）
- [ ] 选择 `DROP` -> `CREATE` 方式时，使用 `DROP TABLE IF EXISTS`（PostgreSQL / SQL Server），并已确认可以接受**试用中的数据被清除**。**低于 Oracle 23ai 时不使用**

## DML

- [ ] 已在 INSERT 语句的骨架中追加实际数据
- [ ] **已删除注释行**
- [ ] SQL 语句末尾带有分号 `;`
- [ ] **幂等**（`WHERE NOT EXISTS` / 先 `DELETE` 再 `INSERT` 等）
- [ ] 未包含业务事务数据（仅限主数据类）
- [ ] `dmlPerDialect: false` 时，INSERT 写在标准 SQL 的范围内

## Portlet 注册（指定了 `portletImport` 的情况）

- [ ] `<key>-dml.sql` 中输出了向 `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` 的 DELETE + INSERT
- [ ] **Portlet DML 中没有混入注释行**（并用 `spec.database` 时，需删除自有表的骨架注释。由于 `SQLFileImporter` 以 `;` 机械拆分，注释中的 `;` 或末尾注释会导致运行时错误）
- [ ] `portletCd` **未与租户环境设置一侧已注册的 Portlet 重复**（会因全量刷新而被覆盖）
- [ ] `path` 指向实际存在的 JSSP 展示页面（相对 `src/main/jssp/src/` 的路径，不带扩展名）
- [ ] 未为 Portlet 用页面 **创建路由配置·路由授权**（由门户直接调用，因此不需要）
- [ ] `editable` 的指定符合意图（`false`：仅查看 / `true`：可查看·编辑），且 `<key>-authz-policy.xml` 中输出了对应的 `im-portal-portlet` / `im-portal-portlet-editmode` 策略
- [ ] **已确认连续执行 2 次也不会报错**（DELETE -> INSERT 的全量刷新）
- [ ] 已理解门户上的配置（`b_m_portlet_layout`）不在对象范围内。试用时从门户管理画面手动配置

## 扩展导入 JS

- [ ] `doImport(tenantId)` 内的初始化处理已用 try/catch 包裹
- [ ] 使用 Logger 输出开始 / 完成 / 异常日志
- [ ] 遵循 `.github/instructions/jssp-code-style.instructions.md`（变量声明使用 `let`，不使用 `var`，字符串使用单引号）
- [ ] 若存在 Tenant Database 访问，则用 `Transaction.begin` 控制并检查 `isSuccess()`
- [ ] **幂等**（推荐全量刷新方式）

## 任务调度器

- [ ] 添加触发器时，已设置 `enable: false`，以免示例用作业擅自开始运行

## IM-Workflow 导入（指定了 `workflowImport` 的情况）

- [ ] 用户 **明确** 指示过（并非基于推测添加）
- [ ] **已验证第 2 次执行时的行为**（每次都会执行。是按更新处理 / 还是容许报错）
- [ ] `<key>.workflow_import` 日志中输出了 "workflow import completed."
- [ ] 执行后没有残留 `storage/public/tmp/<key>_*_*.xml` 等临时文件
- [ ] 详情请参见 [workflow-import.md](workflow-import.md)

## IM-LogicDesigner 导入（指定了 `logicImport` 的情况）

- [ ] 用户 **明确** 指示过（并非基于推测添加）
- [ ] 生成的 JS 为 `importer.importData(inputStream, true)`（**带覆盖**）
- [ ] 包含路由定义（`flow_route.json`）时，**未将对应的授权策略写在示例数据设置一侧**（应在租户环境设置一侧投入）
- [ ] `<key>.logic_import` 日志中输出了 "logic import completed."
- [ ] 详情请参见 [logic-import.md](logic-import.md)

## IMW 逻辑流插件注册

- [ ] `<extends-import-class>` 按 **以下顺序** 排列（构建脚本会以相反顺序生成，因此**生成后需手动重新排序**。无法通过拆分 config 控制顺序）：
  1. `<key>_logic_import.js`
  2. `<key>_workflow_import.js`
  3. `<key>_import.js`
- [ ] 采用全量刷新方式（`deleteLogicFlow` -> `createLogicFlow`）
- [ ] 在 IM-Workflow 管理画面的"逻辑流列表"中目标流程已注册

## 运行确认（在租户环境中）

- [ ] 已先执行租户环境设置并正常完成（模块本体的表·必需主数据齐备）
- [ ] 已执行示例数据设置，并确认无错误地完成
- [ ] 已确认 `ddl: true` 的表被创建，且示例数据已投入
- [ ] 已确认投入的示例数据可以从画面上查看
- [ ] **已连续执行 2 次，并确认第 2 次也无错误地完成**（幂等性的验证。最重要）
  - [ ] 第 2 次执行时 `CREATE TABLE` 没有报错
  - [ ] 第 2 次执行时 INSERT 没有违反唯一约束
  - [ ] 非 `DROP` -> `CREATE` 方式时，第 1 次投入的数据在第 2 次执行后仍然保留
- [ ] 已确认设置日志，异常没有被吞掉（**即使发生异常后续处理也会继续执行，因此仅凭完成显示无法判断是否成功**）

## 更新资料时

- [ ] 既有资料的更新通过 **使用 `--force` 覆盖** 进行（不采用增加版本目录的运维方式）
- [ ] 更新后的资料与模块的最新版本保持一致（示例数据始终维持最新状态）
- [ ] 存在被删除的资料时，`import-<artifactId>-config.xml` 中的引用行与实际文件都已删除（build 脚本不会自动删除不再需要的文件）
