# 导入 XML 的 XSD 验证

将生成的 IM-Workflow 导入 XML 通过描述性 schema `reference/im_workflow-import.xsd` 进行结构验证的步骤。

该 schema 不是 IM-Workflow 官方规范 schema，而是仅以 XSD 1.0 兼容形式表达本技能集支持的 `contents` / `route` / `flow` / `matter_property` / `rule`、各部分及其下属对象结构和数组结构。

## 前提

- 可使用 Node.js（推荐 v18 及以上，`TextDecoder` 与顶层 `await` 可用的版本）
- 生成的 XML 以 UTF-16LE 形式放置在 `src/main/storage/public/im_workflow/im_workflow-{name}-import.xml`
- `xmllint-wasm` 可在项目的 `node_modules` 中解析（首次执行 `npm install --no-save xmllint-wasm`）

## 执行

验证脚本已随技能集一同提供。从项目根目录执行：

```bash
node {{AGENT_ROOT}}/skills/jssp-im-workflow-generator/scripts/validate-xsd.js \
     src/main/storage/public/im_workflow/im_workflow-{name}-import.xml
```

行为：

- 根据 BOM 自动识别 UTF-16LE / UTF-16BE / UTF-8，规范化为 UTF-8 后，使用 `xmllint-wasm`（libxml2 的 WASM 版本）依据 `reference/im_workflow-import.xsd` 进行验证。
- 在子进程中启动 ESM `.mjs` 来加载 `xmllint-wasm`。路径通过 `pathToFileURL()` 规范化为 `file://` URL，因此在 Linux / macOS / Windows 上均可运行。

> **限制：** 在 Node.js v20+ 中，在同一进程内通过 ESM 直接 `import` `xmllint-wasm` 时，其内部 Worker 线程的 WASM VFS 初始化可能失败（ErrnoError F:44）。本脚本通过委派至子进程来规避该问题。

## 期望结果

- 成功：`OK: ... is valid against the schema`（退出码 0）
- 失败：`NG: ...` 及错误列表（前 30 条，退出码 1）

## 错误示例与对策

| 错误 | 原因 | 对策 |
|------|------|------|
| `Element 'XXX': This element is not expected.` | 输出了 XSD 未定义的字段名 | 在样例 XML（`assets/sample-complete-branch.md` 或真实导出 `sample.xml`）中确认该标签的正确位置，并修改 XML 端。若该字段在真实导出中存在，则向 XSD 端补充。 |
| `Start tag expected, '<' not found` | 将 UTF-16 字符串按 UTF-8 读取 / encoding 声明与实际字节不一致 | 先使用 `scripts/validate-xml-encoding.js` 验证并修复编码。确认 XML 的 `encoding="UTF-16"` 声明与实际编码（UTF-16LE/BE + BOM）一致。 |
| `complex type 'XXX': The content model is not deterministic` | 违反 XSD 1.0 UPA 约束（如命名元素与 xs:any 混用等） | 将相应 complexType 改为纯 choice 或纯 any。 |

## 注意

- XSD 以 XSD 1.0 兼容的风格编写，因此可由 `xmllint-wasm`（基于 libxml2）验证
- 验证仅针对结构（元素名、父子关系、必填属性），不会检测 ID 引用完整性、顺序或业务规则
- 业务规则检查请配合 `reference/import-xml-checklist.md` 的自检清单使用
