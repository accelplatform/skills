# IM-Workflow 导入规范

在租户环境搭建时，通过 `DataImportExecutor` 加载 IM-Workflow 的导入数据（内容 / 路由 / 流程 / 案件属性 / 规则）。由于 Importer 的标准 `<tenant-master>` 节中没有 IM-Workflow 专用元素，因此采用从扩展导入 JS（`doImport`）中调用 `WorkflowXmlImporter` 的方式。

## 在 spec.json 中的指定方式

```json
"workflowImport": {
  "files": [
    "im_workflow-simple_approval-import.xml"
  ]
}
```

| 字段 | 类型 | 内容 |
|---|---|---|
| `workflowImport.files` | string[] | 枚举 `src/main/storage/public/im_workflow/` 下的文件名。可指定多个，按指定顺序加载 |

省略或 `files` 为空数组时不输出任何内容。

## 构建时的生成物

build 脚本输出以下内容。

| 种类 | 路径 |
|---|---|
| 导入 XML（拷贝） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| 扩展导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| 追加到 import-config.xml | 在 `<extends-import>` 节追加 `<extends-import-class>` 行 |

### 拷贝处理

将 `src/main/storage/public/im_workflow/<file>.xml` 拷贝到 `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml`。不设置子目录，直接平铺放置在 `<version>/` 下。

### 扩展导入 JS

`<key>_workflow_import.js` 以 `doImport(tenantId)` 作为入口点，按 `spec.workflowImport.files` 的顺序读取并加载各 XML。

当同时使用 `spec.extendsImport === true` 时，会生成 `<key>_import.js` 和 `<key>_workflow_import.js` **两者**，并在 `<extends-import>` 节中**两者并列输出**（顺序为 `<key>_import.js` → `<key>_workflow_import.js`）。应用专有的初始化与 WF 导入作为不同关注点予以分离。

## 扩展导入 JS 的处理内容

```
doImport(tenantId)
  ├ resolveTenantLocaleId(tenantId)         获取租户的默认 locale（失败时回退到 'ja'）
  └ for each sourceFile:
      importWorkflowFile()
        ├ 通过 SystemStorage 以 UTF-16 读取 XML
        └ for each dataType ('matter_property' → 'rule' → 'contents' → 'route' → 'flow'):
            importSingleSection()
              ├ 通过 extractTopLevelSections() 将该标签的所有区块切出为数组
              └ for each block:
                  importSectionBody()
                    ├ 以 UTF-16 写出为临时 XML
                    ├ 通过 executeImport() 调用 DataImportExecutor.importData()
                    └ 删除临时文件（finally）
```

### dataType 的取值

`WorkflowXmlImporter` 识别的 `dataType` 选项与 `<data>` 直下的标签名一致。加载顺序为**被引用方 → 引用方**：

| 顺序 | dataType | XML 标签 | 用途 |
|---|---|---|---|
| 1 | `matter_property` | `<matter_property>` | 案件属性 |
| 2 | `rule` | `<rule>` | 分支规则 |
| 3 | `contents` | `<contents>` | 内容定义 |
| 4 | `route` | `<route>` | 路由定义 |
| 5 | `flow` | `<flow>` | 流程定义 |

当原 XML 中不存在对应区块时，会输出 info 日志并跳过。

### XML 的拆分

`WorkflowXmlImporter` 要求**每次 `importData` 调用所传入的 XML 必须以与 `dataType` 对应的单一区块为根元素**。由于原导入 XML 在 `<data>` 直下汇总存放了多个区块，需要使用 `extractTopLevelSections` 切出相应区块，并在前面附加 `<?xml version="1.0" encoding="UTF-16"?>`，重组为临时 XML 后再传入。

`<contents>` / `<route>` / `<flow>` / `<matter_property>` 通常只有 1 个区块，但 `<rule>`（分支规则）为了对应多种申请模式，经常在 `<data>` 直下连续排列多个同名标签。`extractTopLevelSections` 会扫描该标签的所有出现位置，**以数组形式返回全部区块**（每找到一个就推进搜索位置继续循环，而非单次 `indexOf` 查找）。`importSingleSection` 接收该数组后，通过 `importSectionBody` 对每个区块分别生成临时 XML 并调用一次 `importData`，因此无论同名标签并列多少个都不会遗漏。

`extractTopLevelSections` 仅以**行首 2 空格缩进**的标签作为顶层来拾取，因此不会误匹配嵌套的同名标签（例如 `<contents>` 内部的 `<contents>`）。当原 XML 的缩进不为 2 空格时需要调整。

### 临时文件

临时 XML 在 **PublicStorage** 下以 `tmp/<key>_<tenantId>_<dataType>_<index>.xml` 路径创建，并在 `finally` 中务必删除。除租户 ID、dataType 和 key 外，还包含用于应对同名标签并列情况的连号 `index`（即区块在 `extractTopLevelSections` 返回数组中的位置），可避免并行执行或多租户加载时的冲突。

写入前会调用 `ensureTemporaryDirectory()`，当 PublicStorage 的 `tmp/` 目录不存在时通过 `makeDirectories()` 进行创建。由于 SystemStorage 在未创建的目录上写入会失败，因此采用 PublicStorage，并额外保证 `tmp/` 的预先创建。

## 执行时机

`<extends-import>` 节的 JS 在该 config 内的租户主数据（database / authz / menu / job 等）投入完成后立即被调用。详情请参见 [extends-import.md](extends-import.md)。

## 必需版本

| API | 必需版本 |
|---|---|
| `DataImportExecutor` | 8.0.37 (2025 Spring) 及以上 |
| `ByteReader` | 8.0.37 (2025 Spring) 及以上 |
| `SystemStorage` | 8.0.37 (2025 Spring) 及以上 |
| `TenantInfoManager` | 8.0.37 (2025 Spring) 及以上 |

在更早版本的环境中，无法从 SSJS 导入 WF 数据（仅限于从管理画面或 CLI 加载）。

## 版本升级运维

- 当导入 XML 存在差异时，将 `spec.configNumber` 递增为 2、3、……，并在对应的 `spec.version` 下放置新的 WF XML
- 不要触碰旧版本目录下的文件（拷贝目标 XML、`<version>/<key>_workflow_import.js`）
- 借助 build 脚本的既有文件保护，可防止误覆盖（有意覆盖请使用 `--force`）

## 注意事项

| 项目 | 内容 |
|---|---|
| 字符编码 | 原 XML 为 **UTF-16**。读取、临时写出、XML 声明这 3 处都需要统一为 UTF-16 |
| 缩进 | `<data>` 直下的标签以 2 空格缩进为前提。在导入本技能之外生成的 XML 时需要确认 |
| 事务 | `DataImportExecutor` 内部会自行开启事务，因此请勿在 `doImport` 侧用 `Transaction.begin` 包裹 |
| 幂等性 | 重新投入相同 XML 时是按更新处理还是被拒绝，取决于 ID 与版本号的运维方式。请通过 `configNumber` 的拆分运维加以控制以防再执行 |
| 出错时的行为 | 当 `executor.importData` 的结果为 `error` 或 `!success` 时会抛出异常，整个 `doImport` 会被视为失败。整个 Importer 也会被视为失败，因此请注意避免租户主数据陷入半成品状态 |

## 相关 reference

- [extends-import.md](extends-import.md)：扩展导入 JS 总体规范
- [import-config.md](import-config.md)：import-`<artifactId>`-config-`<N>`.xml 的结构（`<extends-import>` 节）
