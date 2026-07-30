---
name: jssp-page-verifier
description: JSSP 代码生成后的验证与修正技能。作为子智能体负责 jssp-page-generator 的步骤 7～10。执行 validate-jssp-code.js、validate-ddl.js、check-types.sh 及 post-generation-verification.md 的全部检查，并将错误修正至 0 件。
allowed-tools: Bash, Read, Write, Edit, Glob
---

# JSSP 生成后验证技能

负责对 jssp-page-generator 生成的代码进行质量验证和修正。
**按照从上到下的顺序**执行以下步骤，反复修正直到错误数为 0。但必须遵守下述"修正循环原则"。

---

## 修正循环原则（重要・适用于所有步骤）

**禁止"发现 1 处问题就修正 → 重新执行 → 发现下一处问题再修正 → 重新执行"这种逐个循环的方式。** 各验证工具在单次运行中就会一次性报告所有可检测到的问题，逐个循环只会不必要地重复相同的返工，大幅拖慢整体验证所需时间。

1. 执行验证命令，**一次性列出全部输出的项目**（不要只看到第一项就开始修正）
2. 将列出的全部项目**在一次编辑操作中一并修正**（可跨多个文件/多处位置；不要逐项重复"编辑 → 执行 → 编辑 → 执行"）
3. 修正后，**只重新执行一次相同的验证命令**，确认已变为 0 件 / 0 issues
4. 仅当重新执行后仍有项目残留时（新出现的问题或遗漏），才将 2～3 再重复一次。理想情况下应以"首次检测 → 一并修正 → 重新验证"两轮完成

对于**同一反模式出现在多处**的情况（例如：5 处遗漏了 DbParameter 包裹），不要只修正验证工具输出中列出的位置，而应先用 `grep` 找出具有相同模式的其他所有位置，再一并修正。

---

## 步骤 1～3：自动验证（一并执行 → 一并修正 → 一次性重新验证）

`validate-jssp-code.js` / `check-types.sh` /（仅在适用时）`validate-ddl.js`，**不对每个工具单独进行检测→修正→重新验证的循环，而是将 3 个工具作为一组统一处理**。

### 第一次执行（仅检测，此时尚不修正）

```bash
node .github/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{功能名}/
bash .github/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{功能名}/
```

仅在生成了 DDL 的情况下，同时执行以下命令（未指定 DDL 路径时跳过）。

```bash
node .github/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{功能名}/{version}/
```

**先收集齐 3 个工具的全部输出**，再进入下一步。不要按照"先修正 `validate-jssp-code.js` 的结果，再运行 `check-types.sh`"这样的顺序推进（这会导致 tsc 侧的错误之后才被发现，仅为此又触发一次循环）。

**注意：** 这些脚本每次调用只接受 1 个路径（目录或单个文件）。如果需要一并验证多个文件，不要逐个列出文件，而应传入它们共同的父目录（传入多个路径会导致脚本报错并停止）。

### 检测模式：validate-jssp-code.js（JSSP 代码验证）

- `db.select()` / `db.execute()` 的参数未用 `DbParameter` 包裹
- 向 `DbParameter.number()` 传递字符串（遗漏 `Number()` 转换）
- 使用 `var`（应使用 `let`）
- `imds-selectbox`（不存在的类名，正确为 `imds-select`）
- `imuiCalendar` 的 altField 引用了隐藏 input
- imart 标签的 value 属性被引号括起
- 使用 `include('**/common/**')` 加载公共模块（正确做法是使用 `load()`）
- `load('**/*.js')` 调用时附带 `.js` 扩展名（扩展名会自动添加，导致变成 `.js.js` 从而引发 FileNotFoundException）
- 未接收 `Transaction.begin(...)` 的返回值
- TIMESTAMP/DATE 列的绑定使用了类似日期时间的变量名，如 `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|...)`（在 PostgreSQL 中导致类型转换错误）

> **出现 JSSP-JS-022 警告时：** 打开对应的 SQL 文件，确认该参数是否被 `/*IF param != null*/.../*END*/` 包裹。已包裹 → 误报（在摘要中注明"已确认 SQL 侧 /*IF*/ 保护"）。未包裹 → 修正为 `DbParameter.string(x || '')` 等空字符串回退方式。

> **出现 JSSP-JS-027 / JSSP-JS-028 警告时：** 不要仅仅把 `DbParameter.string(x)` 改写为 `DbParameter.timestamp(new Date(x))` 或 `DbParameter.date(new Date(x))` 就结束。`new Date(字符串)` 在 Rhino 中解析不稳定，会新引发 `JSSP-JS-016`，导致多出一轮修正。**应从一开始就直接修正为最终形态**：`DbParameter.timestamp(parseLocalDateTime(x))` / `DbParameter.date(parseLocalDateTime(x))`（`parseLocalDateTime()` 辅助函数的实现参见 `post-generation-verification.md` 3-9；若文件内尚未定义则一并添加）。由于这两条规则基于变量名启发式检测，请遵循**同一反模式出现在多处**的原则：先用 `grep` 一次性找出其他向 `DbParameter.string(` 传递日期时间类变量的位置，再一并修正为最终形态。

### 检测模式：check-types.sh（tsc 类型检查）

- `result.data === 0` 这样的类型不匹配（更新件数应使用 `result.countRow`）
- 访问 d.ts 中不存在的方法或属性

### 检测模式：validate-ddl.js（DDL 类型验证，仅在生成了 DDL 时）

- PostgreSQL DDL 中使用了 `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB`
- Oracle DDL 中使用了 `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN`
- SQLServer DDL 中使用了 `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN`
- DDL 中包含 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW`（导致导入失败）
- CREATE TABLE 或 ALTER TABLE 中定义了 `CHECK` / `FOREIGN KEY` / `EXCLUDE` 约束
- 共通 DML 文件（`*-dml.sql`）中使用了 ODBC 转义 `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}`

### 一并修正 → 只重新验证一次

按照"修正循环原则"，将上面收集到的全部项目在一次编辑操作中一并修正，然后将已执行的所有工具（validate-jssp-code.js / check-types.sh /（如适用）validate-ddl.js）**一并重新执行一次**，确认全部变为 0 件 / 0 issues。仅当仍有残留时，才将本循环再重复一次。

---

## 步骤 4：手动检查

`post-generation-verification.md` 约有 580 行，若连同与目标画面无关的类别（DB 操作、imACMSearch、IM-Workflow 等）也一并全文读取并逐项核对，在画面较大时可能占用整个验证过程近一半的时间。
请按照以下**先判定适用范围 → 仅确认适用项目**的流程，避免无谓的读取与推理。

### 步骤 4-0：跳过已由自动化覆盖的项目

`post-generation-verification.md` 中，凡标注为"由 `validate-jssp-code.js` 的 `JSSP-XXX-NNN` 自动检测"的项目，**只要步骤 1 已为 0 件（无问题），就无需重新确认**。对应项目如下（以 doc 中的记载为准）：

| 自动检测规则 | 对应的 doc 章节 |
|---|---|
| `JSSP-SQL-001` | 1-2（`/*BEGIN*/` 的正确使用） |
| `JSSP-JS-024` | 3-4（`include()` 误用） |
| `JSSP-JS-025` | 3-4（`load()` 的 `.js` 扩展名错误） |
| `JSSP-JS-026` | 3-7（未接收 `Transaction.begin` 返回值） |
| `JSSP-JS-027` | 3-9（对日期时间类变量名使用 `DbParameter.string` 的警告） |
| `JSSP-HTML-015` | 5-1（`imdsConfirm` 的内联定义） |
| `JSSP-HTML-017` | 4-3（`window._` 桥接） |

同样，"2. tsc 类型检查"章节与本技能"步骤 1～3"中的 `check-types.sh` 内容相同，因此**不再重新读取或重新执行**。

### 步骤 4-1：预先判定适用范围（grep）

剩余项目（未标注自动检测标签的项目），仅在目标文件中实际存在对应模式时才需要确认。**在一次 Bash 调用中一并执行**以下命令，仅对有命中的类别进入下一步骤 4-2。

```bash
TARGET=src/main/jssp/src/{功能名}
echo "[SQL 文件]"; find "$TARGET" -name "*.sql" | head -5
echo "[DB 访问]"; grep -rlE "db\.(select|execute)\(|executeByTemplate|fetchByTemplate" "$TARGET" --include=*.js
echo "[Date 变量解析]"; grep -rnE "new Date\([a-zA-Z_]" "$TARGET" --include=*.js
echo "[imACMSearch]"; grep -rl "imACMSearch" "$TARGET" --include=*.html
echo "[画面间参数传递]"; grep -rlE "location\.href.*\?|<a[^>]+href=\"[^\"]*\?" "$TARGET" --include=*.html
echo "[IM-Workflow]"; find "$TARGET" -maxdepth 1 -type d -name workflow
```

命中数为 0 的类别，只需在报告中记为"不适用（已通过 grep 确认，无匹配模式）"，**不读取 doc 中对应的章节**。

### 步骤 4-2：仅确认适用的项目

仅对 grep 命中的类别，使用 Read 工具打开 `.github/skills/jssp-page-generator/reference/post-generation-verification.md` 中**对应的章节**（指定偏移量进行部分读取，不读取全文）。按照该章节的说明，与目标文件内容进行核对与修正。

| 类别 | doc 章节（大致行范围） |
|---|---|
| SQL 文件 / DB 访问 | 1. SQL 文件验证（13-63 行）、3-1 DbParameter 包裹（92-118 行）、3-5 禁止引用内部表（404-410 行）、3-9 PostgreSQL 类型严格性（362-402 行） |
| Date 变量解析 | 3-2 Rhino 的 Date 字符串解析限制（139-166 行）、3-3 DB 时间戳的规范化（168-195 行）、3-8 java.sql.Timestamp 的处理（305-360 行） |
| imACMSearch | 4. imACMSearch 联动验证（412-496 行） |
| 画面间参数传递 | 5-2（528-569 行） |
| IM-Workflow | 6.（571-577 行） |

对于没有 DB 访问的画面（例如仅由虚拟数据・模拟函数构成的画面等），通过此预先判定，步骤 4 的几乎全部项目都会被标记为"不适用"，从而无需读取 doc 全文。

---

## 完成后的报告

以以下格式返回摘要：

| 步骤 | 结果 |
|------|------|
| 步骤 1（JSSP 代码） | 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 2（DDL） | 已跳过 / 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 3（tsc） | X issues → 已修正 / 0 issues（无问题） |
| 步骤 4（手动检查） | 发现 X 件指摘 → 已修正 / 无指摘 |
