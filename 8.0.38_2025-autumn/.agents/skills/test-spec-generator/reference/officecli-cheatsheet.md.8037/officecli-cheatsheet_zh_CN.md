# officecli 命令速查表（本技能使用的范围）

officecli 是可通过 CLI 读写 xlsx/docx/pptx 的工具。本技能主要使用以下命令。

## 读取

```bash
# 以文本形式列出工作表内容（附带单元格坐标）。先用它掌握整体结构
officecli view <file.xlsx> text

# 获取特定单元格・行・工作表的详细格式（字体・fill・边框・合并等）
officecli get <file.xlsx> "/<工作表名>/<单元格地址>" --json
officecli get <file.xlsx> "/<工作表名>" --json          # 整个工作表（递归包含行・单元格）
officecli get <file.xlsx> "/" --json                     # 整个工作簿（工作表一览・主题颜色）

# raw XML（styles.xml, sheetN.xml 等）。用于确认 get 会丢失的信息，例如 fill 的 theme+tint
officecli raw <file.xlsx> "/xl/styles.xml"
officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"
officecli raw <file.xlsx> "/xl/workbook.xml"              # 确认工作表名与 sheetN.xml 的对应关系
```

**单元格地址指定**：使用类似 `/<工作表名>/A1` 的 Excel 表示法。类似 `/<工作表名>/row[2]/cell[1]` 的下标表示法可能无法使用（会出现 `Element not found` 错误），因此应先通过 `get` 的 `--json` 输出确认实际使用的路径格式（如 `/容器/A2`），再使用。

## 写入

```bash
# 创建新文件（会在后台启动常驻进程，加快后续命令的执行）
officecli create <file.xlsx> --json

# 添加工作表（ifExists: "use" 表示如已存在同名工作表则复用，不报错）
officecli add <file.xlsx> "/" --type sheet --prop name=<工作表名> --prop ifExists=use

# 批量导入 CSV/TSV（比逐个设置单元格快得多）
officecli import <file.xlsx> "/<工作表名>" --prop start-cell=A1 < data.csv

# 修改单元格格式（fill 必须是6位十六进制，不接受主题名；详见 officecli-fill-color.md）
officecli set <file.xlsx> "/<工作表名>/A1" --prop fill=#D6DCE5 --prop font.bold=true

# 将多条命令合并为一次进程启动执行（本技能的主要用法）
officecli batch <file.xlsx> --input <batch.json> --json

# 将更改写入磁盘（保持常驻进程继续运行）
officecli save <file.xlsx> --json

# 终止常驻进程（其他进程读取文件前需先执行 save 或 close）
officecli close <file.xlsx> --json
```

## `batch` 命令的格式

通过 `--input <file>` 传入的 JSON 是如下形式的数组。

```json
[
  { "command": "add", "parent": "/", "type": "sheet", "props": { "name": "前提条件", "ifExists": "use" } },
  { "command": "import", "parent": "/前提条件", "props": { "start-cell": "A1" }, "text": "A1,B1\nA2,B2" },
  { "command": "set", "path": "/前提条件/A1", "props": { "font.bold": "true" } },
  { "command": "remove", "path": "/Sheet1" }
]
```

- `command` 为 `add` / `set` / `get` / `query` / `remove` / `move` / `swap` / `import` 之一
- 某条命令失败后，后续命令仍会继续执行（结果会在 `--json` 输出的 `summary.failed` 中汇总）。请确认失败原因后再修正并重新执行
- **幂等性**：`add ... ifExists:"use"` 会复用已存在的工作表，因此重复执行是安全的。`import` 对同一起始单元格重新导入会覆盖内容。`set` 是差量合并，因此要"清除"之前设置的值，必须显式地用新值覆盖（参见 [officecli-fill-color.md](officecli-fill-color.md)）
- 若 `/Sheet1` 已被删除，再次 `remove` 会报 `Sheet not found` 错误，但这是无害的。本技能的 `build-test-spec.js` 在重新执行时只会忽略这一种错误

## 故障排查

| 现象 | 原因 | 处理方法 |
|---|---|---|
| `Invalid color value: 'dk2'` | 向 `set` 的 `fill`/`font.color` 传入了主题颜色名称 | 转换为6位十六进制值。参见 [officecli-fill-color.md](officecli-fill-color.md) |
| `Element not found: row[2]/cell[1]` | 单元格路径的下标表示法有误 | 先通过 `get --json` 确认实际路径（`/工作表名/A2` 形式）后再使用 |
| 表头颜色・字体与原文件不同 | 遗漏了 tint，或未指定 `font.name` 而默认为 Calibri | 用 `officecli get <file> "/<工作表>/<单元格>" --json` 确认自己生成的文件的实际格式，并与模板逐单元格比对 |
| `Sheet not found: "Sheet1"` | 尝试再次删除已删除的 `Sheet1` | 无害，重新执行时可忽略 |
| 生成后内容看起来未反映 | 在 `save`/`close` 之前从其他进程读取了文件 | `batch` 执行后必须调用 `save`（保持常驻）或 `close`（终止常驻） |
