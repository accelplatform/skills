# import-&lt;artifactId&gt;-config.xml 的结构

示例数据设置 Importer 的入口配置文件。
列举执行设置时需要参照的各种 XML/SQL/JS 文件的路径。

## 保存位置

```
src/main/conf/products/import/sample/import-<artifactId>-config.xml
```

被参照的 XML/SQL（`<role-file>` 等）放置在 `src/main/storage/system` 目录下，
扩展导入 JS 放置在 `src/main/jssp/src` 目录下。请注意，仅 `import-<artifactId>-config.xml` 自身放置在 `src/main/conf` 目录下。

| 部分 | 含义 | 决定方式 |
|---|---|---|
| `<artifactId>` | 设置 XML 的文件名。**根据示例数据设置的规范，需要与 `pom.xml` 的 `<artifactId>` 保持一致** | spec.json 的 `"artifactId"` -> 项目根目录 `pom.xml` 的 `<artifactId>`（`<parent>` 内的除外）-> `module.xml` 的 `<id>` 以点号分隔的末段（例如：`mypackage.hoge` -> `hoge`）-> `spec.key`（回退值） |
| `<key>` | 应用密钥（存储目录下用作目录名、参照路径、资源文件名的标识符） | spec.json 的 `"key"`（必需） |

`<artifactId>` 与 `<key>` 可以是不同的值。例如：当 `<key>="equip"` 且 `<artifactId>="equipment-lending-system"` 时，文件放置于 `src/main/conf/products/import/sample/import-equipment-lending-system-config.xml`（文件名使用 `<artifactId>`）。另一方面，被参照的 `<role-file>` 等路径则基于 `<key>`，如 `products/import/sample/equip/equip-role.xml`。

> **注意**：短模块 ID 目录 **在设置文件一侧（`conf/`）不存在**，但 **在导入文件一侧（`storage/system`）存在**（`products/import/sample/%短模块ID%/`）。

## 设置文件只有 1 个

由于示例数据设置不属于 Schema 版本管理的对象，**特定模块的设置文件最多只会创建 1 个**。不存在相当于租户环境设置的 `configNumber` / 多个 config 运维的概念。

build 脚本检测到 `spec.configNumber` / `spec.version` 时会报错停止。资料的更新通过覆盖既有文件（`--force`）进行。

**含义**：无法通过拆分 config 控制执行顺序。顺序控制仅能依靠 `<extends-import>` 内的记述顺序（[extends-import.md](extends-import.md)、[logic-import.md](logic-import.md#面向路由的授权策略无法投入)）。

## 命名空间与 Schema

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

格式文件（xsd）为 `WEB-INF/schema/import-data-config.xsd`。与租户环境设置相同。

## 子元素

在顶层 `<import-data-config>` 直下放置以下各部分。**由于 XSD 上为 `sequence`，务必遵守该顺序。**

| 顺序 | 部分 | 内容 | 输出时机 |
|---|-----------|------|---------------|
| 1 | `<database>` | DDL / DML SQL 的引用 | 存在 `spec.database` 时 |
| 2 | `<tenant-master>` | 角色·授权·菜单·作业的 XML 引用 | 存在相应的 spec 字段时 |
| 3 | `<extends-import>` | 扩展导入 JS 的引用 | `spec.extendsImport === true` 等 |

各部分为 `minOccurs="0"`，因此可以省略。build 脚本不会输出 spec 中未指定的部分 / 元素。

## `<database>`

**按 `create-file` -> `insert-file` 的顺序**（XSD 的 `sequence`）。

```xml
<database>
  <create-file>products/import/sample/any_app/any_app-ddl.sql</create-file>
  <insert-file>products/import/sample/any_app/any_app-dml.sql</insert-file>
</database>
```

仅当存在 `spec.database.tables[].ddl: true` 的表时才会输出 `<create-file>`。DB-Type 后缀（`_postgre` / `_oracle` / `_sqlserver`）由 Importer 自动附加，因此 config 中需**不带后缀**地记述。详情请参见 [database-sql.md](database-sql.md)。

## 路径的基准目录

| 元素 | 基准目录 |
|------|----------------|
| `<create-file>` / `<insert-file>` | 相对 `src/main/storage/system` 的路径 |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | 相对 `src/main/storage/system` 的路径 |
| `<extends-import-class>` | 相对 `src/main/jssp/src` 的路径 |

引用路径中**不包含** `<version>` 目录（`products/import/sample/<key>/<key>-role.xml`、`<key>/initialize/<key>_import.js`）。

## 多语言文件的排列顺序

各元素按 **基础 -> ja -> en -> zh_CN** 的顺序排列。基础文件（无 locale 后缀）记述 ID 和资源定义本身，而 `_ja.xml` / `_en.xml` / `_zh_CN.xml` 仅记述显示名的差异。

```xml
<role-file>products/import/sample/any_app/any_app-role.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_ja.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_en.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_zh_CN.xml</role-file>
```

## 示例（完整版）

请参照将 [examples/any_app.spec.json](../examples/any_app.spec.json) 输入 `scripts/build-sample-setup-import.js` 时的输出。

## 注意

- `<authz-policy-file>` **不具有多语言版本**（因其仅由 subject 表达式和资源 ID 构成，没有显示名）。
- `<database>` 下的 `<create-file>` / `<insert-file>` 是顺序依赖的。先记述 DDL（create-file），然后记述 DML（insert-file）。
- `<extends-import>` 中的扩展导入 JS 会在**租户主数据被投入后立即**调用 `doImport(tenantId)`。详情请参见 [extends-import.md](extends-import.md)。
