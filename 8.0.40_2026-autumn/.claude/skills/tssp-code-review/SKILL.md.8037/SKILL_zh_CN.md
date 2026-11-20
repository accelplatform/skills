---
name: tssp-code-review
description: intra-mart TSSP 代码（src/main/tssp/src 的 .ts / .html）的质量审查。除 tssp build --dev（类型检查、面向 Rhino 的 lint）、绕过类型检查（any / as any / @ts-ignore 等）的 grep、validate-jssp-code.js（针对构建输出执行）的结果外，还全面检查编码规范（禁止 var、命名规则、绑定变量）、类型（interface、与 d.ts 一致）、安全性（SQL 注入、XSS）、错误处理（forward、恢复）、结构（init 函数、职责分离）。在提及代码审查、质量确认、PR 审查、检查代码、确认是否符合规范时使用。
allowed-tools: Bash, Read, Glob
---

# TSSP 代码审查技能

## 概要

对 intra-mart Accel Platform 脚本开发模型（TSSP）编写的代码进行审查，从质量、规范合规性和安全性的角度进行检查。

审查涉及以下 2 处。`src/main/jssp/src` 中的 `.js` / `.html` 是 `tssp build` 的输出，因此指摘应以 `src/main/tssp/src` 一侧的文件和行来表示。

| 路径 | 内容 |
|---|---|
| `src/main/tssp/src/{功能名}/` | 审查对象的源代码（`.ts` / `.html`） |
| `src/main/jssp/src/{功能名}/` | `tssp build` 的输出（`.js` / `.html` / `.js.map`）和 2WaySQL 的 `.sql`（`tssp build` 不输出 `.sql`，因此放置在此处。针对 `.sql` 的指摘以此文件来表示）。步骤 1 的 `validate-jssp-code.js` 验证此处 |

## 审查步骤

### 步骤 1：执行自动验证

在项目根目录执行以下命令，首先找出工具可检测的问题。先执行绕过类型检查的 2 个 grep（对象功能的 `.ts`，以及 `src/main/tssp/src` 整体的 `declare global`）、`src/main/tssp` 下 `.d.ts` 的查找、`tssp build`（类型检查、面向 Rhino 的 lint）。由于将 `tssp build` 放在最后，此代码块的退出码即为 `tssp build` 的退出码。

`tssp build --dev` 通过 package.json 中的 `tssp:dev` 脚本执行。请将 `{包管理器}` 替换为项目的包管理器（`bun` / `npm` / `pnpm` / `yarn`）。

```bash
grep -rnE "\bany\b|@ts-(ignore|expect-error|nocheck)|^[[:space:]]*(export[[:space:]]+)?declare[[:space:]]|^[[:space:]]*///[[:space:]]*<reference" src/main/tssp/src/{機能名}/ --include='*.ts'
grep -rlE "^[[:space:]]*(declare[[:space:]]+global|///[[:space:]]*<reference)" src/main/tssp/src --include='*.ts'
find src/main/tssp -name '*.d.ts'
{包管理器} run tssp:dev
```

仅在构建成功（退出码 0）时，才针对输出执行 `validate-jssp-code.js`（此脚本只读取 `.js` / `.html` / `.sql`，无法验证 `.ts`）。

```bash
node .claude/skills/tssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

如果构建失败（退出码不为 0），输出并未反映本次的 `.ts`（在类型检查、lint、转换、冲突检查失败时不会写出任何内容）。此时不执行 `validate-jssp-code.js`（否则会验证上一次构建的输出），并记录"因构建失败未执行"。如果构建失败是由对象功能之外的 `.ts` 导致的，也一并记录。

如果输出了错误或警告，原样记录，与步骤 2 的审查结果一并报告。此技能不修改代码。

- 如果 `find` 输出了 `.d.ts`，需确认其内容。若存在全局 `declare`，或向 d.ts 的类型添加 `interface`（如 `interface Logger { fakeMethod(): void }` 这样添加 d.ts 中不存在的方法的写法，grep 检测不到），即使位于功能目录之外，也作为绕过类型检查记录到指摘中。平台的 d.ts 位于 `d.ts/`（项目根目录下），不放在 `src/main/tssp` 下。如果在根目录或 `src/main/tssp/` 的 `tsconfig.json` 的 `include` 中添加了 `d.ts/` 以外的 `.d.ts`，`find` 虽然查不到，但同样作为这种绕过来记录
- grep 命中的内容，即使 `tssp build` 成功也要作为指摘记录（没有命中时不输出任何内容，退出码为 1）。注释或字符串字面量中的英文单词 "any" 等非代码位置的匹配除外
- 第 1 个 grep 中出现的 `/// <reference` 会将 `src/main/tssp` 之外（`find` 查不到的位置）的 `.d.ts` 也纳入类型检查，因此作为绕过类型检查记录。第 2 个 grep 在 `src/main/tssp/src` 整体中查找 `declare global`。`declare global` 也会影响声明它的文件之外的 `.ts` 的类型检查，因此即使在对象功能之外的文件中，也作为绕过类型检查记录
- `validate-jssp-code.js` 指摘中的 `file:line` 是输出 `.js` 中的位置，与 `.ts` 的行有偏差。请用指摘中的代码片段（函数名、变量名）在 `src/main/tssp/src` 的 `.ts` 中检索，以 `.ts` 的文件和行来记录。`.html` 由 `tssp build` 原样复制，因此以 `src/main/tssp/src` 下相同的路径、相同的行来记录
- 针对 `.ts` 中未编写的代码的指摘，原因在于 `.ts` 一侧的写法。针对 `var`（`JSSP-JS-002`）的指摘，除 `.ts` 中编写的 `var` 外，也会出现在 tssp 转换 `?.` / `??`（左侧不是变量时）和对象的 spread / rest 时放入输出的临时变量、辅助函数上。针对 `includes()`（`JSSP-JS-009`）的指摘，也会出现在转换对象的 rest 时放入的辅助函数上（参见 2-6）

---

### 步骤 2：LLM 审查脚本无法检测的项目

通过阅读代码确认以下项目。

#### 2-1. 命名规则

- [ ] 文件名是否为蛇形命名法？（`user_master.ts`）
- [ ] 函数名和变量名是否为驼峰命名法？（`getUserInfo`）
- [ ] 常量是否为大写蛇形命名法？（`MAX_RETRY_COUNT`）
- [ ] 是否未使用缩写？（`btn` → `button`、`msg` → `message` 等）
- [ ] 绑定变量是否带有 `$` 前缀？（`$data`、`$title` 等）

#### 2-2. 绑定变量

- [ ] 绑定变量是否像 `export let $data = ...` 这样以顶层的 `export let` 声明？
- [ ] 绑定变量是否用 `JSON.stringify()` 字符串化？
- [ ] `JSON.stringify()` 后是否用 `.replace(/\//g, '\\/') ` 进行转义？
- [ ] 是否先将对象放入变量再传给 `JSON.stringify()`，并将 `$data = JSON.stringify(<变量>).replace(/\//g, '\\/');` 写在 1 行内？（如果直接传入对象字面量，当属性有 2 个以上时（包括 `{ list: [{ a: 1, b: 2 }] }` 这样嵌套的内侧），输出时会被格式化为多行，从而触发 `JSSP-JS-020`）
- [ ] 表示页面是否以 `(function($data) { ... })(<imart ...>);` 的 IIFE 形式接收，且未将 `$data` 设为全局变量？

#### 2-3. 错误处理

- [ ] 是否用 `try-catch` 捕获错误？
- [ ] 不可恢复的错误是否用 `Transfer.toErrorPage()` 跳转到错误画面？
- [ ] 可恢复的错误是否存储在绑定变量的 `error` 属性中？
- [ ] 是否将错误内容输出到日志（`Logger.getLogger().error()`）？
- [ ] 面向用户的消息是否已通用化（不包含内部信息）？

#### 2-4. 结构和设计

- [ ] `init()` 函数是否以 `export function init(request: Request): void` 的形式作为入口点实现？
- [ ] 每个函数是否只有单一职责（是否混合了多个处理）？
- [ ] 每个函数是否在 50 行以内（超过时需要拆分）？
- [ ] 嵌套是否在 4 层以内？
- [ ] 是否通过 `$data` 向表示页面传递数据？
- [ ] 是否将 `.ts` 和 `.html` 放在 `src/main/tssp/src` 中，并将成对的 `.ts` 和 `.html` 以相同名称放在同一目录？是否没有在 `src/main/jssp/src`（`tssp build` 的输出目标）中放置手写的 `.js` / `.html`？（只有 2WaySQL 的 `.sql` 放在 `src/main/jssp/src/{功能名}/sql/` 中。）未列入 `.accel/tssp-generated.txt`（tssp 写出的文件清单）的 `.js` / `.html` 即为手写文件

#### 2-5. 性能和其他

- [ ] 是否使用了 `new Packages.***`（Java 类的直接实例化）？
- [ ] 是否有不必要的循环或重复查询？

#### 2-6. TypeScript（类型、声明、import）

- [ ] 是否未使用 `var`？（使用 `let`。`const` 会被 tssp 转换为 `let`，因此可以使用）
- [ ] 是否没有用 `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / 自行编写的 `declare` 绕过类型检查？（`catch (e)` 中的 `e` 是 `unknown`，因此写作 `(e as Error).message`）是否没有通过步骤 1 的 grep 检测不到的 `as unknown as X` 双重类型转换，放行与 d.ts 的类型不一致的值？
- [ ] 是否用 `interface` 定义了从请求接收的值、响应（放入 `$data` 的对象、API 的应答）、DB 记录的形态，并将该类型标注在变量、参数和返回值上？（例：`UserForm`、`ViewResponse { result: UserForm | null; error: { code: string; message: string } }`）
- [ ] 函数的参数和返回值是否标注了类型？（`init` 以外的函数也以 `request: Request` 接收，并像 `function main(request: Request): ViewResponse` 这样写出返回值类型。仅抛出异常的函数写作 `: never`）
- [ ] 是否按照 d.ts 的 API 定义调用（是否凭推测使用）？阅读所用 API 的 d.ts，并与签名核对。处理 API 参数和返回值的变量是否使用了 d.ts 的类型（`JobResult`、`Transfer.TransferParam`、`DatabaseResult` 等），而没有用自行编写的 `interface` 重新定义 d.ts 中已有的类型？
- [ ] 是否对照 d.ts（`d.ts/platform/standard/im-ssjs-request.d.ts`）确认了 `request` 的方法名？`Request` 具有索引签名（`[key: string]: Request.Attribute`。`Request.Attribute` 为 `any`），因此即使是 `request.getParamterValue()` 这样 d.ts 中不存在的方法名也能通过类型检查。通过 `request.xxx` 读取的 URL 参数（`any`）是否先放入带类型的 `interface` 或 `string` 变量后再使用？
- [ ] 是否没有在表达式中将 `d.ts/workflow/enum/` 中以 `declare const` 声明的常量对象（`NodeType`、`ProcessType`、`TaskStatus`、`MatterStatus` 等）作为值引用？（如 `node.nodeType === NodeType.nodeTyp_Apply`）这样的写法能通过类型检查、面向 Rhino 的 lint 和 `validate-jssp-code.js`，并原样保留在输出的 `.js` 中，但 SSJS 运行时没有这些对象，因此运行时会发生 ReferenceError。应直接写常量值（字符串字面量），`NodeType` 等名称只写在类型标注中（`typeof NodeType.nodeTyp_Apply`）
- [ ] 是否没有使用 `Proxy`、`Reflect`（Rhino 中不存在，运行时会发生 ReferenceError）或 `Promise`（服务端只有同步处理，因此不使用）这类存在于 tsconfig 的 `lib`（默认为 ES2015）类型中、但 SSJS 中不使用的内容？（它们都能通过类型检查、面向 Rhino 的 lint 和 `validate-jssp-code.js`）
- [ ] 在 `import` 公共模块的函数、常量时，是否也用 `load('...')` 加载了同一模块？（`import` 会从输出中消失，因此没有 `load()` 时虽然能通过类型检查和 lint，但输出的 `.js` 中该名称未定义。）仅读取类型的 `import` 是否写作 `import type`？
- [ ] 是否没有使用箭头函数、模板字面量、解构赋值、对象的 spread / rest、`?.` / `??`？（用 `function`、`+` 连接、显式的 `null` 比较和属性赋值来编写。tssp 虽然会放行这些写法，但根据写法不同，输出中会放入辅助函数或 `var`，或者原样输出，从而成为步骤 1 中 `validate-jssp-code.js` 的指摘（`JSSP-JS-002` / `007` / `009` / `012` / `013` 等））

#### 2-7. 作业脚本（仅 job 目录）

仅在目标中包含 job 目录下的 .ts 文件时确认。

- [ ] `execute()` 函数是否以 `export function execute()` 的形式作为入口点实现（而非 `init()`）？
- [ ] 返回值的类型是否为 d.ts 的 `JobResult`（`status: 'success' | 'warning' | 'error'`、`message: string`）？（是否没有使用自行编写的类型或 `Object`）
- [ ] `message` 是否未包含机密信息（因为会记录在监控表中）？
- [ ] 是否记录了作业的开始和结束日志？
- [ ] 发生错误时是否返回 `status: 'error'`（不使用 `Transfer.toErrorPage()`）？

#### 2-8. 工作流画面外处理

仅在 `workflow/` 目录下**没有同名 `.html` 文件的 `.ts` 文件**且**非 `workflow/rule/` 目录**的文件包含在目标中时确认（画面文件和规则定义不在对象内）。

- [ ] 是否记录了处理的开始和结束日志？

---

## 输出格式

```
## 审查结果：{对象路径}

### 步骤 1：自动验证结果

- tssp build: {成功 / 失败（失败时原样记录输出）}
- 绕过类型检查的 grep 和 `.d.ts` 的查找: {命中内容、原样记录输出 / 无命中}
- validate-jssp-code.js: {原样记录输出 / 因构建失败未执行}

### 步骤 2：LLM 审查结果

| 类别 | 文件 | 行 | 内容 | 重要度 |
|------|---------|-----|------|--------|
| 命名规则 | user_edit.ts | 12 | 使用缩写变量名 `btn` | 中 |
| 错误处理 | user_edit.ts | 78 | 未使用 Transfer.toErrorPage() | 高 |
| 结构 | user_list.ts | - | init() 超过 80 行 | 中 |
| 类型 | user_edit.ts | 34 | 通过 `as unknown as UserForm` 放行了与 d.ts 的类型不一致的值 | 高 |

### 改善建议

1. ...
2. ...
```

未检测到问题时，报告"未检测到问题"。
