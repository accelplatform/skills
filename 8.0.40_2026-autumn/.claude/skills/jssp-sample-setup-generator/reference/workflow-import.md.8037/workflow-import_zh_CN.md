# IM-Workflow 导入规范

在示例数据设置时，通过 `DataImportExecutor` 加载 IM-Workflow 的导入数据（内容 / 路由 / 流程 / 案件属性 / 规则）。

`workflowImport.files` 的指定方法·生成 JS 的处理流程·`dataType` 的加载顺序·XML 的拆分（`extractTopLevelSections`。即使 `<rule>` 等同名标签并列多个也会加载全部区块）·UTF-16 的处理·临时文件·事务·必需版本（8.0.37 及以上）与租户环境设置相同。
请参见 `.claude/skills/jssp-tenant-setup-generator/reference/workflow-import.md`。

## 差异

| | 租户环境设置 | **示例数据设置** |
|---|---|---|
| 导入 XML 的复制目标 | `storage/system/products/import/basic/<key>/<version>/<file>.xml` | `storage/system/products/import/sample/<key>/<file>.xml` |
| 扩展导入 JS | `jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` | `jssp/src/<key>/initialize/<key>_workflow_import.js` |
| 防止重复投入 | 拆分 `configNumber` | **没有手段**（每次都会执行） |
| 出错时 | 整个 Importer 立即停止 | **后续处理会继续执行** |

复制源（`src/main/storage/public/im_workflow/`）相同。

**仅在用户明确指示时**才添加 `workflowImport`（参见 SKILL.md「默认策略」）。

## 幂等性

相同的 WF XML 每次都会被投入。租户环境设置可以通过拆分 `configNumber` 的运维方式防止重复执行，但**示例数据设置没有该手段**。重复投入时是按更新处理还是被拒绝，取决于 WF 定义的 ID 与版数的运维方式。

| 手段 | 说明 |
|---|---|
| 采用重复投入时按更新处理的 ID / 版数运维方式 | 通过 WF 定义一侧的设计来应对（推荐） |
| 容许错误 | 在运维上容许第 2 次以后的错误（务必确认日志） |

**务必确认首次执行与第 2 次执行两次的日志。**

## 错误检测

`executor.importData` 的结果为 `error` 或 `!success` 时会抛出异常，但**后续的设置处理会继续执行**。仅凭完成显示无法判断是否成功，因此请确认 `<key>.workflow_import` 日志中是否输出了 `workflow import completed.`。

## 资料的更新

1. 更新 `storage/public/im_workflow/` 中的原始 XML
2. 附加 `--force` 重新执行 build 脚本（覆盖 `storage/system` 之下的副本）

不采用保留旧版本目录的运维方式。

## 相关 reference

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md)：将 LD 流程注册为 WF 插件时的执行顺序
