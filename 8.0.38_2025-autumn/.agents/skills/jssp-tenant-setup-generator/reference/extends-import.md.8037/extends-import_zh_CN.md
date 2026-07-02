# 扩展导入（doImport）规范

由 `<extends-import-class>` 引用的 JSSP 脚本。在 `import-<artifactId>-config-N.xml` 中**按 `<extends-import>` 节的顺序依次调用**。用于实现 Importer 标准处理无法完成的应用特定初始化。

## 执行顺序

intra-mart Importer **按编号顺序** 执行 config-1.xml → config-2.xml → ...。每个 config 内按 `<database>` → `<tenant-master>`（authz / menu / job 等）→ `<extends-import>` 的顺序处理。

示例：同时存在 `config-1.xml` 与 `config-2.xml` 时的执行顺序：

```
config-1.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
config-2.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
```

也就是说，`config-1.xml` 的 `doImport` 是在**该 config 的租户主数据被投入之后立即**被调用的。它不是在整个租户环境安装的最后。

### 版本升级时的含义

- `config-1.xml` 的 `doImport` 以**该版本（config-1）下投入的主数据**为前提运行
- 将在 `config-2.xml` 中追加的主数据，在 `config-1.xml` 的 `doImport` 执行时点尚不存在
- 各版本的 `doImport` 应被实现为仅依赖于**自身 config 编号所投入的范围**

## 放置路径

```
src/main/jssp/src/<key>/initialize/<version>/<key>_import.js
```

`import-<artifactId>-config-1.xml` 中的 `<extends-import-class>` 以相对于 `src/main/jssp/src` 的路径编写。

```xml
<extends-import>
  <extends-import-class>any_app/initialize/1.0.0/any_app_import.js</extends-import-class>
</extends-import>
```

**需包含 `.js` 扩展名**（与 IM-Workflow 不同）。

当 `spec.configNumber >= 2` 时，JS 文件名末尾会被附加 `-<N>` 后缀（例如 `<key>_import-2.js`）。详情请参见 [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス)。
`<version>` 的决定优先级：spec.json 的 `"version"` → 项目根目录的 `module.xml` 或 `pom.xml` 的 `<version>` → `1.0.0`。版本升级时，在新版本目录中新生成 JS 并进行切换。

## 入口点

```javascript
function doImport(tenantId) {
  // 描述在该 config 的租户主数据投入后被调用的初始化处理
}
```

| 参数 | 类型 | 内容 |
|------|-----|------|
| `tenantId` | string | 安装对象的租户 ID |

不需要返回值。抛出异常会使整个 Importer 被视为失败。

## 常见用途

| 用途 | 实现示例 |
|------|--------|
| 初始数据的投入（DML 无法覆盖的部分） | 通过 `TenantDatabase.execute(...)` 执行 INSERT |
| 初始配置文件的放置 | `PublicStorage.write(...)` |
| 与既有系统的同步 | 调用外部 API |
| 主数据的一致性检查 | 投入后的记录数检查 |

## 实现上的约束

- 使用 **Rhino JavaScript（ES5 兼容）** 编写。不能使用 `let` / `const` / 箭头函数 / `import` / `export`
- 可使用**与函数容器同等的 API**（`TenantDatabase`、`SystemStorage`、`PublicStorage`、`Logger` 等）
- 在脚本内全局定义的函数可从 `doImport` 内调用
- **表操作（INSERT/UPDATE/DELETE）必须使用 `Transaction.begin(callback)` 进行事务控制**。以保持多个表的一致性，并在中途失败时回滚
- 必须接收 `Transaction.begin` 的返回值（`DatabaseResult`），并使用 `isSuccess()` 判定成败（丢弃返回值会导致失败被忽略，整体安装被当作"成功"）
- 异常处理**必须用 try/catch 包裹，先用 Logger 记录后再 throw**（仅靠标准日志在运维时无法追踪原因）

## 示例实现

```javascript
function doImport(tenantId) {
  var logger = Logger.getLogger("any_app.initialize");
  logger.info("[any_app] doImport start. tenantId=" + tenantId);

  var businessError = null;
  var txResult = Transaction.begin(function() {
    try {
      var db = new TenantDatabase();
      // 示例：投入应用特定的初始主数据
      var result = db.execute(
        "INSERT INTO any_app_config (tenant_id, config_key, config_value) VALUES (?, ?, ?)",
        [
          DbParameter.string(tenantId),
          DbParameter.string("default_locale"),
          DbParameter.string("ja")
        ]
      );
      if (result.error) {
        throw new Error("Failed to insert any_app_config: " + result.errorMessage);
      }
    } catch (e) {
      businessError = e;
      throw e;   // 为了回滚而重新抛出
    }
  });

  if (businessError) {
    logger.error("[any_app] doImport failed.", businessError);
    throw businessError;
  }
  if (!txResult.isSuccess()) {
    var msg = "[any_app] doImport transaction failed: " + (txResult.errorMessage || "");
    logger.error(msg);
    throw new Error(msg);
  }

  logger.info("[any_app] doImport completed.");
}
```

### 事务控制的模式

| 模式 | 用途 |
|---|---|
| 使用 `Transaction.begin(callback)` 包裹 | 表 INSERT/UPDATE/DELETE（必须） |
| 检查返回值 `txResult.isSuccess()` | 判定事务成败（必须） |
| 通过变量将业务异常传递到外部 | 因为回调内的 `throw` 不会向外传播 |

详情请参见 `.agents/requirements/jssp-error-handling/AGENTS.md` 和 `jssp-page-generator/reference/post-generation-verification.md`（步骤 3-7：Transaction.begin 的返回值检查）。

## spec.json 中的指定

```json
"extendsImport": true
```

为 `true` 时，build 脚本生成具有空 `doImport(tenantId)` 的骨架 JS，并在 `import-<artifactId>-config-1.xml` 中追加 `<extends-import-class>` 行。
为 `false` 或省略时不生成。

实现由用户在生成后追加。
