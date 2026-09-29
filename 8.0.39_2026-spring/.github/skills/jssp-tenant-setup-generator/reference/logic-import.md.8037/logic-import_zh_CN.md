# IM-LogicDesigner 导入规范

在租户环境搭建时，通过 `LogicFlowImporter` 加载 IM-LogicDesigner 的导入数据（ZIP）。与 IM-Workflow 不同，无需进行 `<data>` 节拆分，直接将导出时的 ZIP 传递给 `importData(InputStream)` 即可。

## 在 spec.json 中的指定方式

```json
"logicImport": {
  "files": [
    "im-logicdesigner-data-sample-simple.zip"
  ]
}
```

| 字段 | 类型 | 内容 |
|---|---|---|
| `logicImport.files` | string[] | 枚举 `src/main/storage/public/im_logic/` 下的文件名。可指定多个，按指定顺序加载 |

省略或 `files` 为空数组时不输出任何内容。

## 构建时的生成物

build 脚本输出以下内容。

| 种类 | 路径 |
|---|---|
| 导入 ZIP（拷贝） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |
| 扩展导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| 追加到 import-config.xml | 在 `<extends-import>` 节追加 `<extends-import-class>` 行 |

### 拷贝处理

将 `src/main/storage/public/im_logic/<file>.zip` 拷贝到 `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip`。不设置子目录，直接平铺放置在 `<version>/` 下（与 IM-Workflow 相同）。

### 扩展导入 JS

`<key>_logic_import.js` 以 `doImport(tenantId)` 作为入口点，按 `spec.logicImport.files` 的顺序读取并加载各 ZIP。

当同时使用 `spec.extendsImport` / `workflowImport` / `logicImport` 时，各自的 JS 独立生成，并在 `<extends-import>` 节中**按以下顺序并列输出**：

```
<extends-import-class>...<key>_import.js</extends-import-class>             ← extendsImport
<extends-import-class>...<key>_workflow_import.js</extends-import-class>    ← workflowImport
<extends-import-class>...<key>_logic_import.js</extends-import-class>       ← logicImport
```

## 扩展导入 JS 的处理内容

```
doImport(tenantId)
  ├ LogicServiceProvider.getInstance().getLogicFlowImporter()  通过 Java 直接访问获取 importer
  └ for each sourceFile:
      importLogicFile()
        ├ readAllBytes()       将 SystemStorage 的全部字节聚合到 Java byte[] 中
        ├ 生成 ByteArrayInputStream
        ├ importer.importData(inputStream)
        └ inputStream.close()（finally）

readAllBytes(sourceStorage)
  ├ 分配一个 ByteArrayOutputStream
  ├ 通过 ByteReader#eachBytes 按 chunk（8KB 单位）追加到 output
  └ 通过 output.toByteArray() 取出 Java byte[]
```

## API 使用方法

### 需要 Java 直接访问

IM-LogicDesigner **没有提供与 IM-Workflow 的 `DataImportExecutor` 对应的通用 SSJS API**。`jp.co.intra_mart.foundation.logic.LogicFlowImporter` 是 Java 接口，需要从 SSJS 通过 `Packages.***` 进行引用。

```javascript
let importer = Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider
  .getInstance()
  .getLogicFlowImporter();
importer.importData(inputStream);
```

这是 `.github/instructions/jssp-security.instructions.md` 中"禁止 Java 直接访问"原则的例外用途。**在业务 SSJS 中一律禁止**，**仅在租户环境搭建的扩展导入 JS 中允许**。理由：

- IM-LogicDesigner 的加载在 SSJS API 中无法实现，只能通过 Java 完成
- 扩展导入 JS 是租户管理用的特殊入口点，不处理外部输入，攻击面有限
- 通过提供与 WF 风格一致的实现步骤，可统一用户的应用初始化处理

### LogicFlowImporter#importData 的行为

| 签名 | 行为 |
|---|---|
| `importData(InputStream stream)` | 不覆盖。与既有数据冲突时报错，事务回滚 |
| `importData(InputStream stream, boolean isUpdate)` | 当 `isUpdate=true` 时可覆盖既有数据 |

骨架 JS 采用**不覆盖版**（仅第 1 个参数）。重新投入时的行为预期通过与 IM-Workflow 相同的 `configNumber` 拆分运维加以控制。如果运维上需要覆盖，请在生成后的 JS 中改写为 `importer.importData(inputStream, true)`。

### InputStream 的创建方法

`SystemStorage` 可能采用外部存储插件或分布式构成（AP 服务器和存储服务器位于不同节点），从 `getCanonicalPath()` 获得的本地路径未必能用 `FileInputStream` 打开。因此采用**通过 `openAsBinary()` 获取 `ByteReader`，将全部字节读入内存，再经由 Java 的 `ByteArrayInputStream` 传递**的方式。

```javascript
function readAllBytes(sourceStorage) {
  let output = new Packages.java.io.ByteArrayOutputStream();
  let reader = sourceStorage.openAsBinary();
  try {
    reader.eachBytes(function (chunk, index, bytesRead) {
      for (let i = 0; i < bytesRead; i++) {
        output.write(chunk[i]);
      }
    }, 8192);
  } finally {
    reader.close();
  }
  return output.toByteArray();
}

let byteArray = readAllBytes(sourceStorage);
let inputStream = new Packages.java.io.ByteArrayInputStream(byteArray);
```

`ByteReader#eachBytes` 是指定 chunk size 的回调方式，JavaScript 端将每个字节逐个转写到 `ByteArrayOutputStream.write(int)`。chunk size 8KB 是存储 I/O 的标准缓冲大小。

**内存消耗**：由于将整个导入文件展开到内存，因此不适用于极大的 ZIP（数百 MB 以上）。一般的 IM-LogicDesigner 导出 ZIP 在数 MB 量级，在租户环境搭建时的单次执行中预期不会出现内存压力。

## 执行时机

`<extends-import>` 节的 JS 在该 config 内的租户主数据（database / authz / menu / job 等）投入完成后立即被调用。详情请参见 [extends-import.md](extends-import.md)。

## 面向路由的授权策略的投入顺序

当 LogicDesigner 的逻辑流**包含路由定义（REST API 端点）**时，导入时会自动生成与 `flow_route.json` 的 `authzUri`（例：`im-logic-rest://<flowId>`）对应的授权资源（type 为 `im-logic-rest`）。引用该资源的 `authz-policy` **不能在同一 config 中投入**。

### 问题

`config-N.xml` 的执行顺序如 [extends-import.md](extends-import.md) 所示：

```
database → tenant-master(authz / menu / job) → extends-import(doImport)
```

`<authz-policy-file>` 在 `<tenant-master>` 下评估，因此会在 LogicDesigner 扩展导入运行**之前**被处理。如果在同一 config 中写入引用了路由所创建资源的策略，资源尚未注册即被引用，Importer 会报错。

### 解决方案：拆分 configNumber

拆分 `spec.configNumber`，单独生成专用于策略的 `config-(N+1).xml`。Importer 按 config 编号顺序执行，因此在后续 config 投入时，路由的资源已经注册完成。

| config | 内容 |
|---|---|
| `config-1.xml` | 通过 `logicImport` 加载 LogicDesigner（生成 URI 资源） |
| `config-2.xml` | 仅记述面向 LogicDesigner 路由的 `authzPolicies`（引用既有资源） |

build 脚本在 `configNumber >= 2` 时，会在文件名 base 部分的末尾追加 `-<N>` 后缀（例：`equip-authz-policy-2.xml`）。详情请参见 [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス)。

### spec.json 的配置示例

初版 spec.json（LogicDesigner 加载）：

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 1,
  "logicImport": { "files": ["any_app-logic.zip"] }
  // authzPolicies 中不包含面向 LogicDesigner 路由的项
}
```

用于追加策略的 spec.json（在同一版本中投入时，`version` 可保持不变）：

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 2,
  "authzPolicies": [
    {
      "resource": "<authzUri 的 SHA-256 哈希>",
      "type": "im-logic-rest",
      "action": "execute",
      "subject": "S(b_m_role:app_user)",
      "effect": "PERMIT"
    }
  ]
}
```

`type` 需指定为 `im-logic-rest`（注意：不是 `service`）。资源 ID（URI 哈希）的写法请参见 [authz-policy.md](authz-policy.md)。

### 路由的资源 ID 与 type

在 `authzPolicies` 中指定 LogicDesigner 路由生成的授权资源时：

| 字段 | 值 |
|---|---|
| `type` | `im-logic-rest`（**不是 `service`**） |
| `resource` | `flow_route.json` 中 `authzUri` 字符串的 **SHA-256 哈希（小写十六进制）** |
| `action` | `execute` |

```
authzUri: "im-logic-rest://sample_simple"
↓ SHA-256
resource: "d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
type:     "im-logic-rest"
```

如果将 `type` 设为 `service`，由于资源是注册在 LogicDesigner 的 `im-logic-rest` 命名空间中，**策略将无法绑定到实际资源，Importer 执行时会被静默忽略**（不会报错，但授权不生效），请注意。

### 注意

- LogicDesigner 路由**以外**的普通资源 / 策略可以包含在 `config-1.xml` 中而不会有问题。需要分离到 `config-2.xml` 的**仅为面向路由的策略**
- 当在同一版本下运维 `config-1` / `config-2` 时，需要分别用两个 spec.json 运行 `build-setup-import.js` 两次
- 由于既有文件保护，即使在生成 `config-1` 之后再投入 `configNumber: 2` 的 spec.json，`config-1.xml` 以及 `1.0.0/` 下无后缀的文件也不会被覆盖（新增部分以 `-2` 后缀形式输出）
- 在追加路由的版本升级中，请继续将该 config 的策略进一步分离到 `config-(N+2).xml` 等的运维方式

## 必需版本

| API | 必需版本 |
|---|---|
| `LogicFlowImporter` | 8.0.0 及以上（intra-mart 8 系列全体） |
| `SystemStorage` / `ByteReader` | 8.0.37 (2025 Spring) 及以上 |

`SystemStorage` / `ByteReader` 的 SSJS API 仅在 8.0.37 及以上版本中提供，因此在更早版本的环境中，由本技能生成的 JS 无法运行。

## 版本升级运维

- 当导入 ZIP 存在差异时，将 `spec.configNumber` 递增为 2、3、……，并在对应的 `spec.version` 下放置新的 ZIP
- 不要触碰旧版本目录下的文件（拷贝目标 ZIP、`<version>/<key>_logic_import.js`）
- 借助 build 脚本的既有文件保护，可防止误覆盖（有意覆盖请使用 `--force`）

## 注意事项

| 项目 | 内容 |
|---|---|
| 事务 | `LogicFlowImporter#importData` 内部会自行开启事务，因此请勿在 `doImport` 侧用 `Transaction.begin` 包裹 |
| 文件格式 | LogicFlowImporter 接受的格式为 **IM-LogicDesigner 的导出 ZIP**。不允许手工制作的 ZIP 或其他格式 |
| 出错时的行为 | 当抛出 `LogicServiceException` 时，扩展导入 JS 的 `catch` 会捕获并重新抛出，使整个 Importer 视为失败 |
| 存储结构依赖 | 即使 `SystemStorage` 与 AP 服务器位于不同主机、不同挂载点，也能通过 `openAsBinary()` 透明读取，无需修改代码 |
| 内存消耗 | `byte[]` 会全量展开到内存。如果需要处理极大的 ZIP（数百 MB 以上），可考虑切换为流式方式（自行构造将每个 chunk 传递给 `importData` 的中间 InputStream） |

## 相关 reference

- [extends-import.md](extends-import.md)：扩展导入 JS 总体规范
- [workflow-import.md](workflow-import.md)：IM-Workflow 导入（兄弟功能）
- [import-config.md](import-config.md)：import-`<artifactId>`-config-`<N>`.xml 的结构（`<extends-import>` 节）
