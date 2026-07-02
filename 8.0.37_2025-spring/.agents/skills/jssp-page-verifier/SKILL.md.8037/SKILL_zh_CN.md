---
name: jssp-page-verifier
description: JSSP 代码生成后的验证与修正技能。作为子智能体负责 jssp-page-generator 的步骤 7～10。执行 validate-jssp-code.js、validate-ddl.js、check-types.sh 及 post-generation-verification.md 的全部检查，并将错误修正至 0 件。
---

# JSSP 生成后验证技能

负责对 jssp-page-generator 生成的代码进行质量验证和修正。
**按照从上到下的顺序**执行以下步骤，反复修正直到错误数为 0。

---

## 步骤 1：JSSP 代码验证

```bash
node .agents/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{功能名}/
```

**反复修正直到错误数为 0。**

常见检测模式：
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

---

## 步骤 2：DDL 类型验证（仅在生成了 DDL 时）

仅在提示词中指定了 DDL 路径时执行。未指定则跳过。

```bash
node .agents/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{功能名}/{version}/
```

**反复修正直到错误数为 0。**

常见检测模式：
- PostgreSQL DDL 中使用了 `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB`
- Oracle DDL 中使用了 `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN`
- SQLServer DDL 中使用了 `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN`
- DDL 中包含 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW`（导致导入失败）
- CREATE TABLE 或 ALTER TABLE 中定义了 `CHECK` / `FOREIGN KEY` / `EXCLUDE` 约束
- 共通 DML 文件（`*-dml.sql`）中使用了 ODBC 转义 `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}`

---

## 步骤 3：tsc 类型检查

```bash
bash .agents/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{功能名}/
```

**反复修正直到问题数为 0。**

常见检测模式：
- `result.data === 0` 这样的类型不匹配（更新件数应使用 `result.countRow`）
- 访问 d.ts 中不存在的方法或属性

---

## 步骤 4：手动检查

使用 Read 工具打开 `.agents/skills/jssp-page-generator/reference/post-generation-verification.md`，执行所有步骤。

---

## 完成后的报告

以以下格式返回摘要：

| 步骤 | 结果 |
|------|------|
| 步骤 1（JSSP 代码） | 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 2（DDL） | 已跳过 / 发现 X 件 → 已修正 / 0 件（无问题） |
| 步骤 3（tsc） | X issues → 已修正 / 0 issues（无问题） |
| 步骤 4（手动检查） | 发现 X 件指摘 → 已修正 / 无指摘 |
