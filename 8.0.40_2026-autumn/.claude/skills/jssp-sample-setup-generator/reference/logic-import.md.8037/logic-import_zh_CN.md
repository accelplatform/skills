# IM-LogicDesigner 导入规范

在示例数据设置时，通过 `LogicFlowImporter` 加载 IM-LogicDesigner 的导入数据（ZIP）。

`logicImport.files` 的指定方法·生成 JS 的处理流程·需要 Java 直接访问（`Packages.***`）的理由与被容许的依据·`InputStream` 的创建方法·事务·必需版本与租户环境设置相同。
请参见 `.claude/skills/jssp-tenant-setup-generator/reference/logic-import.md`。

## 差异

| | 租户环境设置 | **示例数据设置** |
|---|---|---|
| 导入 ZIP 的复制目标 | `storage/system/products/import/basic/<key>/<version>/<file>.zip` | `storage/system/products/import/sample/<key>/<file>.zip` |
| 扩展导入 JS | `jssp/src/<key>/initialize/<version>/<key>_logic_import.js` | `jssp/src/<key>/initialize/<key>_logic_import.js` |
| `importData` 的签名 | `importData(inputStream)`（不覆盖） | **`importData(inputStream, true)`（带覆盖）** |
| 面向路由的授权策略 | 可通过拆分 `configNumber` 投入 | **无法投入** |
| 出错时 | 整个 Importer 立即停止 | **后续处理会继续执行** |

复制源（`src/main/storage/public/im_logic/`）相同。

**仅在用户明确指示时**才添加 `logicImport`（参见 SKILL.md「默认策略」）。

## 使用带覆盖的 `importData`

由于每次都会执行，且无法通过拆分 config 防止重复执行，因此不覆盖的版本从第 2 次开始必定发生冲突错误。

```javascript
// 第 2 个参数 true：覆盖既有流程
importer.importData(inputStream, true);
```

若要避免覆盖，可在生成后的 JS 中改写为 `importer.importData(inputStream)`（这意味着容许第 2 次以后的错误）。

## 面向路由的授权策略无法投入

当逻辑流中包含路由定义时，导入时会针对 `flow_route.json` 的 `authzUri`（例如 `im-logic-rest://<flowId>`）自动生成授权资源（type 为 `im-logic-rest`）。

**引用该资源的 `authz-policy` 无法通过示例数据设置投入。**

执行顺序：

```
database -> tenant-master(authz / menu / job) -> extends-import(doImport)
```

`<authz-policy-file>` 位于 `<tenant-master>` 之下，会在 LogicDesigner 扩展导入**之前**被处理。策略会在资源尚未注册的状态下被投入，**导致 Importer 报错（后续处理会继续）**。租户环境设置可以通过拆分 `configNumber` 解决，但**示例数据设置只能创建 1 个设置文件，因此无法拆分。**

**应对方法**：在租户环境设置一侧（`jssp-tenant-setup-generator` 的 `configNumber` 拆分）投入。策略的写法（`type` 为 `im-logic-rest` 而非 `service`，`resource` 为 `authzUri` 的 SHA-256）请参见
`.claude/skills/jssp-tenant-setup-generator/reference/logic-import.md` 的「面向路由的授权策略的投入顺序」。

build 脚本检测到 `type="im-logic-rest"` 时会发出警告。

## 错误检测

抛出 `LogicServiceException` 时，`catch` 会捕获并重新 throw，但**后续的设置处理会继续执行**。请确认 `<key>.logic_import` 日志中是否输出了 `logic import completed.`。

## 资料的更新

1. 更新 `storage/public/im_logic/` 中的原始 ZIP
2. 附加 `--force` 重新执行 build 脚本（覆盖 `storage/system` 之下的副本）

不采用保留旧版本目录的运维方式。

## 相关 reference

- [extends-import.md](extends-import.md)
- [workflow-import.md](workflow-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md)
