# 扩展导入（doImport）规范

由 `<extends-import-class>` 引用的 JSSP 脚本。按 `<extends-import>` 部分中的记述顺序依次调用。

入口点 `doImport(tenantId)` 的规范·可用的 API·事务控制的模式·示例实现与租户环境设置相同。
请参见 `.claude/skills/jssp-tenant-setup-generator/reference/extends-import.md`。

## 差异

| | 租户环境设置 | **示例数据设置** |
|---|---|---|
| 放置路径 | `jssp/src/<key>/initialize/<version>/<key>_import.js` | `jssp/src/<key>/initialize/<key>_import.js`（无 `<version>`） |
| 重新执行 | 已完成设置的会被跳过 | **每次都会执行** -> 必须幂等 |
| 发生异常时 | 整个 Importer 立即停止 | **后续处理会继续执行** -> 必须输出日志 |
| 顺序控制 | 拆分 `configNumber` 或记述顺序 | **仅记述顺序** |

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

## 执行顺序

```
database(DDL -> DML) -> tenant-master(role/authz/menu/job) -> extends-import(doImport)
```

`doImport` 在租户主数据投入后立即被调用。由于只能创建 1 个设置文件，无法通过拆分 config 控制顺序。

| 想做的事 | 手段 |
|---|---|
| 控制多个扩展导入之间的顺序 | `<extends-import-class>` 的记述顺序 |
| 在扩展导入之后投入租户主数据 | **不可能**。请在租户环境设置一侧（拆分 `configNumber`）进行 |

具体示例：[imw-logic-plugin-import.md](imw-logic-plugin-import.md)、[logic-import.md](logic-import.md#面向路由的授权策略无法投入)

## 幂等性

由于每次都会执行，需实现为重新执行后结果相同。

| 模式 | 实现方针 |
|---|---|
| 数据投入 | 全量刷新（删除 -> 创建）最为可靠。或在存在检查后 INSERT |
| 文件放置 | 检查已存在后再写入。或始终覆盖 |
| 外部系统联动 | 确认重复执行也不会产生副作用 |

全量刷新的实例参见 [imw-logic-plugin-import.md](imw-logic-plugin-import.md)（`deleteLogicFlow` -> `createLogicFlow`）。

## 错误检测

即使抛出异常，整个 Importer 也不会停止（后续的设置处理会继续执行）。**必须通过 `Logger` 输出开始 / 完成 / 异常日志。** 没有日志就会漏掉失败。

## spec.json 中的指定

```json
"extendsImport": true
```

为 `true` 时生成空的 `doImport(tenantId)` 骨架，并添加 `<extends-import-class>` 行。实现内容在生成后追加。
