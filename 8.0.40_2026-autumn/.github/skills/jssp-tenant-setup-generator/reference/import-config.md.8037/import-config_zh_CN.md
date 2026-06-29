# import-<artifactId>-config-1.xml 的结构

租户环境配置 Importer 的入口配置文件。
列举执行配置时需要参照的各种 XML/SQL/JS 文件的路径。

## 保存位置

```
src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml
```

被参照的 XML/SQL（`<role-file>` 等）放置在 `src/main/storage/system` 目录下，
扩展导入 JS 放置在 `src/main/jssp/src` 目录下。请注意，仅 `import-<artifactId>-config-<N>.xml` 自身放置在 `src/main/conf` 目录下。

| 部分 | 含义 | 决定方式 |
|---|---|---|
| `<artifactId>` | 配置 XML 存储目录名兼文件名。**根据 intra-mart 租户环境配置的规范，需要与 `pom.xml` 的 `<artifactId>` 保持一致**（目录名和文件名都使用相同的 `<artifactId>`） | spec.json 的 `"artifactId"` → 项目根目录 `pom.xml` 的 `<artifactId>`（`<parent>` 内的除外）→ `module.xml` 的 `<id>` 以点号分隔的末段（例如：`mypackage.hoge` → `hoge`）→ `spec.key`（回退值） |
| `<key>` | 应用密钥（存储目录下用作目录名、参照路径、资源文件名的标识符） | spec.json 的 `"key"`（必需） |
| `<N>` | config 编号。初版为 `1`，每次版本升级递增为 `2`、`3`、... | spec.json 的 `"configNumber"`（省略时为 `1`） |

`<artifactId>` 与 `<key>` 可以是不同的值。例如：当 `<key>="equip"` 且 `<artifactId>="equipment-lending-system"` 时，文件放置于 `src/main/conf/products/import/basic/equipment-lending-system/import-equipment-lending-system-config-1.xml`（目录名和文件名均使用 `<artifactId>`）。另一方面，被参照的 `<role-file>` 等路径则基于 `<key>`，如 `products/import/basic/equip/1.0.0/equip-role.xml`。

## 版本升级时的运用

intra-mart Importer 的规范是按 `import-<artifactId>-config-1.xml` → `import-<artifactId>-config-2.xml` → ... 的**编号顺序**执行**所有**文件。因此：

- **不要修改已存在的 config-N.xml**（修改会导致需要对已有租户重新导入）
- **新版本作为 config-(N+1).xml 新增**
- **新 config 中只记述差异**（为防止重复导入，不要包含已有的角色 ID 等）
- **资源也放置在 `basic/<key>/<version>/` 的独立目录**（旧版本作为历史保留）

build 脚本禁止覆盖已有文件（使用 `--force` 允许），仅通过更改 `spec.configNumber` 与 `spec.version` 即可安全地追加差异 config。详情请参照 SKILL.md 的"多 config 运用"。

## 命名空间与 Schema

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

## 子元素

顶层 `<import-data-config>` 下直接放置以下各节。

| 节 | 内容 | 输出时机 |
|-----------|------|---------------|
| `<database>` | DDL / DML SQL 的参照 | 当存在 `spec.database` 时 |
| `<tenant-master>` | 角色、授权、菜单、作业的 XML 参照 | 当存在对应的 spec 字段时 |
| `<extends-import>` | 扩展导入 JS 的参照 | 当 `spec.extendsImport === true` 时 |

build 脚本不会输出 spec 中未指定的节/元素（即便是空标签也不输出）。

## `<database>` 下的 DB-Type 后缀自动添加

对于 `<create-file>` / `<insert-file>` 中所写的文件名（扩展名之前），intra-mart Importer 会根据连接的目标 DB **自动添加** `_postgre` / `_oracle` / `_sqlserver` 后缀。

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

→ PostgreSQL 环境：读取 `equip-ddl_postgre.sql` / Oracle：`equip-ddl_oracle.sql` / SQL Server：`equip-ddl_sqlserver.sql`

config-1.xml 内的参照需要**不带后缀**地记述。实际文件的放置按以下优先级解析：

1. **带后缀的文件**（`_postgre` / `_oracle` / `_sqlserver`）—— DB 特定，优先
2. **不带后缀的文件** —— 所有 DB 共通的回退

因此推荐的模式是：

- **DDL 按 3 种方言分别提供**（因为类型和约束语法在各 DB 间不同）
- **DML 合并为 1 个文件**（因为 INSERT 语句容易用标准 SQL 统一）

详情请参照 [database-sql.md](database-sql.md)。

## 路径的基准目录

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
```

| 元素 | 基准目录 |
|------|----------------|
| `<create-file>` / `<insert-file>` | 相对于 `src/main/storage/system` 的路径 |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | 相对于 `src/main/storage/system` 的路径 |
| `<extends-import-class>` | 相对于 `src/main/jssp/src` 的路径 |

参照路径中包含 `<key>/<version>/` 的目录结构（例如：`products/import/basic/<key>/<version>/<key>-role.xml`、`<key>/initialize/<version>/<key>_import.js`）。`<version>` 的决定优先级为：spec.json 的 `"version"` → 项目根目录的 `module.xml` 或 `pom.xml` 的 `<version>` → `1.0.0`。版本升级时的运用方式是：在另一版本目录中新生成资源，重写本文件的参照行进行切换。

### configNumber > 1 时的文件名后缀

当 `spec.configNumber >= 2` 时，build 脚本会在各文件的基础部分末尾添加 `-<N>` 后缀。输出目录（`<version>/` 和 `<version>/initialize/`）保持不变，仅文件名被分离。

| 种类 | configNumber: 1 | configNumber: 4 |
|---|---|---|
| 基础 XML | `equip-authz-policy.xml` | `equip-authz-policy-4.xml` |
| 多语言 XML | `equip-role_ja.xml` | `equip-role-4_ja.xml` |
| DB 方言 SQL | `equip-ddl_postgre.sql` | `equip-ddl-4_postgre.sql` |
| 扩展导入 JS | `equip_import.js` | `equip_import-4.js` |
| 工作流导入 JS | `equip_workflow_import.js` | `equip_workflow_import-4.js` |
| 逻辑导入 JS | `equip_logic_import.js` | `equip_logic_import-4.js` |

`-<N>` 会插入在 locale（`_ja` / `_en` / `_zh_CN`）或 DB 方言（`_postgre` / `_oracle` / `_sqlserver`）后缀的**正前方**，因此不会与这些命名规则相冲突。

`import-<artifactId>-config-<N>.xml` 中的参照路径示例：

```xml
<!-- configNumber: 1 -->
<role-file>products/import/basic/equip/1.0.0/equip-role.xml</role-file>

<!-- configNumber: 4 -->
<authz-policy-file>products/import/basic/equip/1.0.0/equip-authz-policy-4.xml</authz-policy-file>
```

后缀分离并非用于版本升级运用，而是用于**在同一版本内需要控制导入顺序的情况**（例如：在 LogicDesigner 路由生成的资源上事后施加策略的情况）。详情请参照 [logic-import.md](logic-import.md)。

## 多语言文件的排列顺序

各元素按 **基础 → ja → en → zh_CN** 的顺序排列。基础文件（无 locale 后缀）记述 ID 和资源定义本身，而 `_ja.xml` / `_en.xml` / `_zh_CN.xml` 仅记述显示名的差异。

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_ja.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_en.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_zh_CN.xml</role-file>
```

## 示例（完整版）

请参照将 [examples/any_app.spec.json](../examples/any_app.spec.json) 输入 `scripts/build-setup-import.js` 时的输出。

## 注意

- `<authz-policy-file>` **不具有多语言版本**（因其仅由 subject 表达式和资源 ID 构成，没有显示名）。
- `<database>` 下的 `<create-file>` / `<insert-file>` 是顺序依赖的。先记述 DDL（create-file），然后记述 DML（insert-file）。
- `<extends-import>` 中的扩展导入 JS 会在**本 config 中的租户主数据被导入后立即**调用 `doImport(tenantId)`（同一 config 内的 database / authz / menu / job 已经加载完毕）。当存在多个 config 时，相同的流程会按编号顺序重复执行，因此由后续 config 导入的主数据在前一个 config 的 `doImport` 时点尚不存在。详情请参照 [extends-import.md](extends-import.md)。
