---
name: tssp-page-verifier
description: TSSP 代码生成后的验证与修正技能。作为子智能体负责 tssp-page-generator 的步骤 7～10。执行 tssp build --dev（类型检查、面向 Rhino 的 lint）、绕过类型检查（any / @ts-ignore 等）的 grep、validate-jssp-code.js（针对构建输出执行）、validate-ddl.js 及 post-generation-verification.md 的全部检查，并将错误修正至 0 件。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [tssp-typescript](../../requirements/tssp-typescript/AGENTS.md) 已参考并理解内容


# TSSP 生成后验证技能

负责对 tssp-page-generator 生成的代码进行质量验证和修正。
**按照从上到下的顺序**执行以下步骤，反复修正直到错误数为 0。但必须遵守下述"修正循环原则"。

验证涉及以下 2 处。`src/main/jssp/src` 中的 `.js` / `.html` 是 `tssp build` 的输出，因此不要手动编辑，而是通过修正 `src/main/tssp/src` 一侧并重新构建来解决指摘。

| 路径 | 内容 |
|---|---|
| `src/main/tssp/src/{功能名}/` | 源代码的 `.ts` / `.html`。修正在此处进行 |
| `src/main/jssp/src/{功能名}/` | `tssp build` 的输出（`.js` / `.html` / `.js.map`）和 2WaySQL 的 `.sql`（`tssp build` 不输出 `.sql`，因此放置在此处。针对 `.sql` 的指摘直接修正此文件） |

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

源代码位置的确认 / 绕过类型检查的检测 / `tssp build --dev` / `validate-jssp-code.js` /（仅在适用时）`validate-ddl.js`，**不对每个工具单独进行检测→修正→重新验证的循环，而是统一作为一组处理**。但是 `validate-jssp-code.js` 验证的是 `tssp build` 的输出，因此要在 `tssp build` 之后，且仅在构建成功时执行。

### 第一次执行（仅检测，此时尚不修正）

首先在项目根目录执行源代码位置的确认、绕过类型检查的检测（`.d.ts` 的列表和 2 个 grep）、`tssp build`（类型检查、面向 Rhino 的 lint）。由于将 `tssp build` 放在最后，此代码块的退出码即为 `tssp build` 的退出码。

如果输出了 "does not exist"，说明源代码不在 `src/main/tssp/src/{功能名}/` 中（即使目录不存在，grep 也可能不输出任何内容）。应停止验证，先修正源代码的位置。

`tssp build --dev` 通过 package.json 中的 `tssp:dev` 脚本执行。请将 `{包管理器}` 替换为项目的包管理器（`bun` / `npm` / `pnpm` / `yarn`）。

```bash
test -d src/main/tssp/src/{機能名} || echo "src/main/tssp/src/{機能名} does not exist"
find src/main/tssp -name '*.d.ts'
grep -rnE "\bany\b|@ts-(ignore|expect-error|nocheck)|^[[:space:]]*(export[[:space:]]+)?declare[[:space:]]|^[[:space:]]*///[[:space:]]*<reference" src/main/tssp/src/{機能名}/ --include='*.ts'
grep -rlE "^[[:space:]]*(declare[[:space:]]+global|///[[:space:]]*<reference)" src/main/tssp/src --include='*.ts'
{包管理器} run tssp:dev
```

仅在构建成功（退出码 0）时，确认输出目标中没有手动放置的文件，并针对输出执行 `validate-jssp-code.js`（此脚本只读取 `.js` / `.html` / `.sql`，无法验证 `.ts`）。

`find` 行输出的文件不是 `tssp build` 的输出，而是手动放置在 `src/main/jssp/src` 中的文件。如果是本次生成或编辑的文件，应将其移动到 `src/main/tssp/src/{功能名}/` 下相同的相对路径（`.js` 改写为 `.ts`）并重新构建。不属于本次对象的已有文件不要移动，应向用户报告。

```bash
find src/main/jssp/src/{機能名} \( -name '*.ts' -o -name '*.js' -o -name '*.html' \) | grep -vxF -f .accel/tssp-generated.txt
node .agents/skills/tssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

如果构建失败（退出码不为 0），输出并未反映本次的 `.ts`（在写出之前的类型检查、lint、转换、冲突检查失败时不会写出任何内容）。此时不执行 `validate-jssp-code.js`（否则会验证上一次构建的输出），应先修正构建的指摘使其成功，然后再执行。

仅在生成了 DDL 时，同时执行以下命令（未指定 DDL 路径时跳过）：

```bash
node .agents/skills/tssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

**收集齐所执行工具的全部输出后**再进入下一步。不要按"修正 `validate-jssp-code.js` 的结果后再执行绕过类型检查的 grep"这样逐个工具修正、再执行下一个的顺序进行（这会导致后来才发现的错误仅为此而引发再次循环）。

**注意：** `validate-jssp-code.js` / `validate-ddl.js` 每次调用只接受 1 个路径（目录或单个文件）。需要一并验证多个文件时，不要逐个列出文件，而应传入它们共同的父目录（传入多个路径会因错误而停止）。


### 检测模式：validate-jssp-code.js（构建输出的验证）
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

> **出现 JSSP-JS-027 / JSSP-JS-028 警告时：** 不要仅仅把 `DbParameter.string(x)` 改写为 `DbParameter.timestamp(new Date(x))` 或 `DbParameter.date(new Date(x))` 就结束。`new Date(字符串)` 在 Rhino 中解析不稳定，会新引发 `JSSP-JS-016`，导致多出一轮修正。**应从一开始就直接修正为最终形态**，即用 `parseLocalDateTime()` 转换为 `Date`（辅助函数的实现参见 `post-generation-verification.md` 3-8。如果文件内未定义，则一并添加）。该辅助函数的返回值为 `Date | null`，而 `DbParameter.timestamp()` / `DbParameter.date()` 的参数是 `Date`，因此直接写成 `DbParameter.timestamp(parseLocalDateTime(x))` 会使 `tssp build` 因 TS2345 而停止。应先用 `let d = parseLocalDateTime(x);` 接收，再写成 `d !== null ? DbParameter.timestamp(d) : new DbParameter(null, DbParameter.TYPE_TIMESTAMP)`（DATE 列则使用 `DbParameter.date(d)` 和 `DbParameter.TYPE_DATE`）。对于在 SQL 侧通过 `/*IF*/` 分支的参数，应传入裸 `null`，而不是 `new DbParameter(null, ...)`（参见 `.agents/requirements/jssp-2way-sql/AGENTS.md` 中的"【重要】对通过 `/*IF*/` 分支的 DATE / TIMESTAMP 参数传入裸 `null`"）。这 2 条规则基于变量名启发式检测，因此遵循**同一反模式在多处命中**的原则，用 `grep` 一并找出其他将日期时间类变量传给 `DbParameter.string(` 的位置，再统一修正为最终形态。

> **针对构建输出的指摘的修正方法：** 指摘中的 `file:line` 是输出 `.js` 中的位置，与 `.ts` 的行有偏差。请用指摘中的代码片段（函数名、变量名）在 `src/main/tssp/src` 的 `.ts` 中检索并修正，然后重新构建。针对 `.html` 的指摘也要修正 `src/main/tssp/src` 一侧的 `.html`。只有针对 `.sql` 的指摘，直接修正 `src/main/jssp/src` 中的文件。

> **`.ts` 中未编写的代码被指摘时：** `var`（`JSSP-JS-002`）和 `includes()`（`JSSP-JS-009`）来自 tssp 转换 `?.` / `??`、对象的 spread / rest 时放入输出的临时变量和辅助函数。应从 `.ts` 中去除这些写法，改用显式的 `null` 比较和属性赋值来编写。箭头函数（`JSSP-JS-007`）和模板字面量（`JSSP-JS-012`）会按 `.ts` 中的写法原样输出，因此改为 `function` 和 `+` 连接。像 `$data = JSON.stringify({ ... })` 这样直接传入对象字面量，输出时会被格式化为多行而触发 `JSSP-JS-020`，因此应先放入变量，再将 `$data = JSON.stringify(<变量>).replace(/\//g, '\\/');` 写在 1 行内。

### 检测模式：tssp build（类型检查、面向 Rhino 的 lint）

`tssp build` 会按类型检查 → 面向 Rhino 的 lint 的顺序，检查 `src/main/tssp/src` 下的所有 `.ts`。存在类型错误时不会执行 lint，因此修正类型错误后重新构建时，可能首次出现 lint 违规。这一额外的轮次在预期之内，对应"修正循环原则"的第 4 条。

- 类型不匹配，如 `result.data === 0`（更新件数为 `result.countRow`）
- 访问 d.ts 中不存在的方法、属性、全局变量（TS2339 / TS2304 等）。阅读 d.ts 并修正为正确的名称和签名
- `Request` 具有索引签名（`[key: string]: Request.Attribute`。`Request.Attribute` 为 `any`），因此即使调用 `request.getParamValue()` 这样 d.ts 中不存在的方法，`tssp build` 也能通过。用 `grep -rnoE "request\.[A-Za-z_]+\(" src/main/tssp/src/{功能名}/ --include='*.ts'` 列出调用，并确认各方法名存在于 `d.ts/platform/standard/im-ssjs-request.d.ts` 中
- 没有类型标注的参数（TS7006）、未指定类型就引用 `catch (e)` 的 `e`（TS18046。写作 `(e as Error).message`）
- 在 Rhino 1.7.15.1 中会导致语法错误或含义改变的写法（`error rhino(no-default-param)` 等）。各规则的替代写法参见 `tssp-usage` 技能的"Rhino 约束"
- 输出目标的冲突（输出目标中存在不在 `.accel/tssp-generated.txt` 中的文件）。修正方法参见 `tssp-usage` 技能的"冲突"

如果构建因对象功能之外的 `.ts` 而失败，不要修正该文件，应向用户报告。

### 检测模式：绕过类型检查（`.d.ts` 的列表和 grep）

即使 `tssp build` 成功，`.d.ts` 的列表和 2 个 grep 的命中内容也全部作为错误修正。没有命中时不输出任何内容（grep 的退出码为 1）。注释或字符串字面量中的英文单词 "any" 等非代码位置的匹配，作为误报排除。

| 命中内容 | 修正方法 |
|---|---|
| `any`（`: any`、`as any`、`any[]`、`Record<string, any>` 等） | 用 d.ts 的类型或自行编写的 `interface` 标注类型。类型无法确定的值用 `unknown` 接收，用 `typeof` 等缩小范围后再使用 |
| `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` | 删除，并按 d.ts 的签名修正被隐藏的类型错误 |
| `.d.ts` 的列表中出现的文件，以及行首的 `declare` | 删除。`.d.ts` 中的 `interface` 即使没有 `declare` 也能向 d.ts 的类或全局变量添加声明，但运行时并不存在。需要共享类型时，在 `.ts` 中写 `export interface`，并用 `import type` 读取。通过 `load()` 加载的公共模块的名称通过 `import` 引用（参见 `post-generation-verification.md` 3-4）。不要使用 d.ts 中没有的 API，应向用户报告。对象功能之外的 `.d.ts` 不要修正，应向用户报告。在根目录或 `src/main/tssp/` 的 `tsconfig.json` 的 `include` 中添加 `d.ts/` 以外的 `.d.ts` 也属于同样的绕过，`find` 查不到。该 `tsconfig.json` 不要修正，应向用户报告 |
| 行首的 `/// <reference` | 删除。`/// <reference path="..." />` 会将 `src/main/tssp` 之外（`find` 查不到的位置）的 `.d.ts` 也纳入类型检查，与放置 `.d.ts` 属于同样的绕过 |
| 第 2 个 grep 中出现的、对象功能之外的 `.ts`（`declare global`） | 不要修正，应向用户报告。`declare global` 也会影响声明它的文件之外的 `.ts` 的类型检查，因此对象功能的类型检查也被绕过。对象功能的 `.ts` 中的 `declare global` 也会出现在第 1 个 grep 中，因此与行首的 `declare` 一样删除 |

### 检测模式：validate-ddl.js（DDL 类型验证，仅在生成了 DDL 时）

- PostgreSQL DDL 中使用了 `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB`
- Oracle DDL 中使用了 `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN`
- SQLServer DDL 中使用了 `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN`
- DDL 中包含 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW`（导致导入失败）
- CREATE TABLE 或 ALTER TABLE 中定义了 `CHECK` / `FOREIGN KEY` / `EXCLUDE` 约束
- 共通 DML 文件（`*-dml.sql`）中使用了 ODBC 转义 `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}`

### 一并修正 → 只重新验证一次

按照"修正循环原则"，将上面收集到的全部项目在一次编辑操作中一并修正（修正对象是 `src/main/tssp/src` 的 `.ts` / `.html`，只有 `.sql` 是 `src/main/jssp/src` 的文件），然后将与第一次相同的代码块（包括源代码位置的确认和绕过类型检查的检测（`.d.ts` 的列表和 2 个 grep））按 `tssp build --dev` → `validate-jssp-code.js` →（如适用）`validate-ddl.js` 的顺序**一并重新执行一次**，确认全部变为 0 件 / 0 issues。仅当仍有残留时，才将本循环再重复一次。

---

## 步骤 4：手动检查

`post-generation-verification.md` 约有 580 行，若连同与目标画面无关的类别（DB 操作、imACMSearch、IM-Workflow 等）也一并全文读取并逐项核对，在画面较大时可能占用整个验证过程近一半的时间。
请按照以下**先判定适用范围 → 仅确认适用项目**的流程，避免无谓的读取与推理。

### 步骤 4-0：跳过已由自动化覆盖的项目

`post-generation-verification.md` 中，凡标注为"由 `validate-jssp-code.js` 的 `JSSP-XXX-NNN` 自动检测"的项目，**只要步骤 1（`validate-jssp-code.js`）已为 0 件（无问题），就无需重新确认**。对应项目如下（以 doc 中的记载为准）：

| 自动检测规则 | 对应的 doc 章节 |
|---|---|
| `JSSP-SQL-001` | 1-2（`/*BEGIN*/` 的正确使用） |
| `JSSP-JS-024` | 3-4（`include()` 误用） |
| `JSSP-JS-025` | 3-4（`load()` 的 `.js` 扩展名错误） |
| `JSSP-JS-026` | 3-7（未接收 `Transaction.begin` 返回值） |
| `JSSP-JS-027` | 3-9（对日期时间类变量名使用 `DbParameter.string` 的警告） |
| `JSSP-HTML-015` | 5-1（`imdsConfirm` 的内联定义） |
| `JSSP-HTML-017` | 4-3（`window._` 桥接） |

同样，"2. tssp build（类型检查、面向 Rhino 的 lint）"章节与本技能"步骤 1～3"中的 `tssp build --dev` 内容相同，因此**不再重新读取或重新执行**。

### 步骤 4-1：预先判定适用范围（grep）

剩余项目（未标注自动检测标签的项目），仅在目标文件中实际存在对应模式时才需要确认。**在一次 Bash 调用中一并执行**以下命令，仅对有命中的类别进入下一步骤 4-2。

```bash
SRC=src/main/tssp/src/{機能名}
OUT=src/main/jssp/src/{機能名}
echo "[SQL 文件]"; find "$OUT" -name "*.sql" | head -5
echo "[DB 访问]"; grep -rlE "db\.(select|execute)\(|executeByTemplate|fetchByTemplate" "$SRC" --include='*.ts'
echo "[Date 变量解析]"; grep -rnE "new Date\([a-zA-Z_]" "$SRC" --include='*.ts'
echo "[imACMSearch]"; grep -rl "imACMSearch" "$SRC" --include='*.html'
echo "[画面间参数传递]"; grep -rlE "location\.href.*\?|<a[^>]+href=\"[^\"]*\?" "$SRC" --include='*.html'
echo "[IM-Workflow]"; find "$SRC" -maxdepth 1 -type d -name workflow
```

命中数为 0 的类别，只需在报告中记为"不适用（已通过 grep 确认，无匹配模式）"，**不读取 doc 中对应的章节**。

### 步骤 4-2：仅确认适用的项目

仅对 grep 命中的类别，使用 Read 工具打开 `.agents/skills/tssp-page-generator/reference/post-generation-verification.md` 中**对应的章节**（指定偏移量进行部分读取，不读取全文）。按照该章节的说明，与目标文件内容进行核对与修正。

| 类别 | doc 章节（大致行范围） |
|---|---|
| SQL 文件 / DB 访问 | 1. SQL 文件验证（14-64 行）、3-1 DbParameter 包裹（92-118 行）、3-5 禁止引用内部表（420-426 行）、3-9 PostgreSQL 类型严格性（371-418 行） |
| Date 变量解析 | 3-2 Rhino 的 Date 字符串解析限制（139-166 行）、3-3 DB 时间戳的规范化（168-195 行）、3-8 java.sql.Timestamp 的处理（314-369 行） |
| imACMSearch | 4. imACMSearch 联动验证（428-512 行） |
| 画面间参数传递 | 5-2（544-585 行） |
| IM-Workflow | 6.（587-591 行） |

对于没有 DB 访问的画面（例如仅由虚拟数据・模拟函数构成的画面等），通过此预先判定，步骤 4 的几乎全部项目都会被标记为"不适用"，从而无需读取 doc 全文。

---

## 完成后的报告

以以下格式返回摘要：

| 步骤 | 结果 |
|------|------|
| 步骤 1～3（源代码位置） | 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 1（构建输出） | 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 2（DDL） | 已跳过 / 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 3（tssp build） | 发现 X 件 → 已修正 / 0 件（构建成功） |
| 步骤 3（绕过类型检查） | 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 4（手动检查） | 发现 X 件指摘 → 已修正 / 无指摘 |
