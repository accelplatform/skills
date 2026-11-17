---
paths:
  - "src/main/tssp/**/*.ts"
---

# TypeScript 规约（TSSP）

> **适用范围**: 🟢 **始终** — 生成或编辑 `src/main/tssp/src` 下的 `.ts`（函数容器、通用处理）时适用。规定将 jssp 规约适用于 TypeScript 源码时写法发生变化的部分。

## 与 jssp 规约的关系

- `.ts` 适用末尾「与 jssp 规约的对应表」中列出的 jssp 规约。本规约仅规定在 TypeScript 中写法发生变化的部分
- 本规约的替换对照不适用于以下规约・章节：`jssp-testing.md` / `jssp-performance.md` / `jssp-file-structure.md` 的「目录结构」中 `workflow/` 与 `test/` 的部分 / 同文件「不经过路由表调用的画面的例外规约」中 IM-Workflow 与 IM-ContentsSearch 的行
- jssp 规约的示例与本规约不一致之处，以本规约为准。jssp 规约的各节与本规约的哪一节相关，请参阅末尾的「与 jssp 规约的对应表」
- 构建步骤、通用模块（`common/` 的 `.ts`）的 `export` 与调用方的 `load()` / `import` 的写法、面向 Rhino 的 lint 规则，请参阅 `.claude/skills/tssp-usage/SKILL.md`

## 替换对照

| jssp 规约中的描述 | 在 TSSP 中的处理 |
|---|---|
| 函数容器、通用处理的 `.js`（文件名示例、`@file`、`view/{view}.js` 等） | 替换为 `.ts`。命名规则（小写蛇形命名）不变 |
| 将源码放在 `src/main/jssp/src` | `.ts` 和 `.html` 放在 `src/main/tssp/src`。成对的 `.ts` 和 `.html` 以相同名称放在同一目录 |
| `src/main/jssp/src` 的 `.js` / `.html` | `tssp build` 的输出（使用 `--dev` 时还会输出 `.js.map`）。除下一行的文件外，不要手动创建或编辑。针对输出的指摘，应修改 `src/main/tssp/src` 一侧后重新构建 |
| `tssp build` 不输出的文件（2WaySQL 的 `.sql`、租户环境设置的扩展导入 `*_import.js`、`source-config.xml`） | 直接放在 `src/main/jssp/src`。`.sql` 的位置为 `src/main/jssp/src/{功能名}/sql/` |
| 运行时解析的路径（路由的 `page`、`load()`、`executeByTemplate()` 等的参数） | 以输出目录 `src/main/jssp/src` 为起点、不带扩展名的路径书写。`tssp build` 会保持目录结构进行输出，因此 `src/main/tssp/src/simple_form/view/index.ts` 的 `page` 为 `simple_form/view/index` |
| 对 `jssp-page-generator` 技能的文件的引用（`assets/simple-form.md`、`assets/simple-portlet.md`、`reference/api-database.md`、`scripts/validate-jssp-code.js`） | 参阅 `.claude/skills/tssp-page-generator/` 中的同名文件。`validate-jssp-code.js` 在构建成功后针对输出执行 |

展示页面（`.html`）的写法不变。

## 基本结构

`jssp-function-container.md` 的「基本结构」在 `.ts` 中为如下形式。后续各节均参照此示例。

```typescript
/**
 * 用户查询画面
 *
 * @file index.ts
 * @description 显示用户信息。
 */

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================
export let $title = '用户查询';
export let $data = '{}';

// ========================================
// 类型定义
// ========================================
/** 画面上显示的用户信息 */
interface UserForm {
  userCode: string;             // 用户代码
}

/** 传递给展示页面的处理结果 */
interface ViewResponse {
  result: UserForm | null;
  error: {
    code: string;               // 错误代码
    message: string;            // 错误消息
  };
}

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 *
 * @param request - 请求对象
 */
export function init(request: Request): void {
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

/**
 * 执行主处理。
 *
 * @param request - 请求参数
 * @return 处理结果
 */
function main(request: Request): ViewResponse {
  let logger = Logger.getLogger();
  let response: ViewResponse = {
    result: null,
    error: { code: '', message: '' }
  };

  try {
    let userCode: string = request['userCode'];
    response.result = { userCode: userCode };
  } catch (e) {
    logger.error('画面显示过程中发生了错误。{}', (e as Error).message);
    transferErrorPage('E002', '发生了意外错误。');
    return response;
  }

  return response;
}

/**
 * 发生错误时全屏显示错误消息。
 *
 * @param code - 错误代码
 * @param message - 错误消息
 */
function transferErrorPage(code: string, message: string): void {
  let parameter: Transfer.TransferParam = {
    title: '发生了系统错误',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

完整的实现请参阅 `.claude/skills/tssp-page-generator/assets/simple-form.md`。

## 绑定变量与入口点

- 绑定变量在顶层以 `export let $data = ...` 声明
- 入口点写作 `export function init(request: Request): void`。作业写作 `export function execute(): JobResult`。`export` 在输出的 `.js` 中会被去除

## 函数参数与返回值的类型

- 所有函数的参数和返回值都要写类型。没有类型的参数会因 TS7006 使构建停止
- `init` 以外的函数也以 `request: Request` 接收
- 必定抛出异常的函数，其返回值类型设为 `never`。若设为 `void`，调用之后类型收窄不生效（即使在 `value === null` 时调用该函数，后续的 `value` 仍为 `string | null`）

## 类型定义（`interface`）

- 从请求接收的值、响应（放入 `$data` 的对象、API 的响应）、DB 记录的结构用 `interface` 定义，并标注在变量、参数、返回值上
- `interface` 放在「类型定义」区域。位置在「常量定义」「绑定变量」区域（文件中存在的那些）之后、「入口点」区域之前
- 各 `.ts` 作为独立模块进行类型检查，因此可以在每个文件中定义同名的 `interface`
- 多个文件共享的类型，在仅含类型的 `.ts` 中用 `export interface` 书写，并用 `import type` 读取。仅含类型的 `.ts` 不是函数容器，因此即使放在 `view/` 中也不创建成对的 `.html`
- 用对象字面量、数组字面量创建的变量要加类型注解。没有注解时，`result: null` 会被推断为 `null` 类型，之后的赋值会报 TS2322。`let result = {};` 在之后添加属性时会报 TS2339
- 可由右侧确定类型的变量（`let logger = Logger.getLogger();`、`let statusCode = 200;`）无需类型注解

## d.ts 类型的使用

- 传给 API 的变量和接收 API 返回值的变量，使用 d.ts 的类型（`Transfer.TransferParam`、`DatabaseResult`、`JobResult` 等）。不要用自定义的 `interface` 重新定义 d.ts 中已有的类型
- 传给 API 的对象，用标注了 d.ts 类型的变量来创建。对于像 `Transfer.TransferParam` 这样所有属性均可省略的类型，没有类型注解时，包含错误键（`mesage` 等）的对象也会通过类型检查。有类型注解时，构建会因 TS2561（对于没有相似名称属性的键则为 TS2353）而停止
- 返回 `ResultObject` / `BizApiResultInfo` 的 API，要在确认 `result.error` 为 `false` 之后再读取 `result.data`。未经确认读取的 `data` 为 `unknown`，构建会停止（直接从返回值读取时为 TS2571，用变量接收后读取时为 TS18046，仅用 `result.data &&` 确认时为 TS2339）
- API 的参数要按 d.ts 的类型传递。jssp 规约的示例中，以下写法会被类型检查拦截

| jssp 规约示例中的写法 | 类型错误 | TypeScript 中的写法 |
|---|---|---|
| `db.select(sql, [status])` | TS2322 | `db.select(sql, [DbParameter.string(status)])` |
| 将可能为 `null` 的值传给 `DbParameter.string()` / `DbParameter.number()` | TS2345 | 对于始终输出到 SQL 正文的列，传递 `new DbParameter(value, DbParameter.TYPE_STRING)`（数值为 `DbParameter.TYPE_NUMBER`）。通过 `/*IF*/` 分支的参数，仅在值为 `null` 时不用 `DbParameter` 包装而直接传递 `null` |
| 将返回 `Date \| null` 的辅助函数（`parseLocalDateTime()` 等）的返回值直接传给 `DbParameter.date()` / `DbParameter.timestamp()` | TS2345 | 用变量接收并区分 `null`。通过 `/*IF*/` 分支的参数写作 `d !== null ? DbParameter.date(d) : null`，始终输出到 SQL 正文的列写作 `d !== null ? DbParameter.date(d) : new DbParameter(null, DbParameter.TYPE_DATE)`（TIMESTAMP 则为 `DbParameter.timestamp(d)` 和 `DbParameter.TYPE_TIMESTAMP`） |

## 请求值的接收方式

- `Request` 具有索引签名（值为 `any`）。用 `request['xxx']` 读取的值，要像 `let userCode: string = request['userCode'];` 这样用带类型的变量接收。`getParameterValue()` 的返回值以 `string | null` 接收
- 作为数值判定的值，用经 `parseInt()` 转换后的变量来判定。将 `string` 变量传给 `isNaN()` 会报 TS2345，与数值比较大小会报 TS2365
- `request` 的方法名要在 `d.ts/platform/standard/im-ssjs-request.d.ts` 中确认。即使是 d.ts 中不存在的方法名也会通过类型检查

## `catch` 的 `e`

`catch (e)` 的 `e` 为 `unknown`，`e.message` 会报 TS18046。写作 `(e as Error).message`。

## API 的自定义异常

`jssp-error-handling.md` 的「API 的错误处理」所规定的内联 `@type` 注解的类型转换，以及「在 `d.ts/` 目录下声明 `interface`」这一注意事项，不适用于 `.ts`。定义 `interface ApiError extends Error`，并用 `as ApiError` 进行类型转换。

- JSDoc 的内联 `@type` 注解在 `.ts` 的类型检查中会被忽略。`e` 仍为 `unknown` 而报 TS18046，对 `Error` 类型变量的 `error.code = code` 会报 TS2339
- `ApiError` 在每个 API 的 `.ts` 中定义。需要共享时，放在仅含类型的 `.ts` 中，并用 `import type { ApiError } from '../common/api_types';` 读取

```typescript
/** 带错误代码和 HTTP 状态的异常 */
interface ApiError extends Error {
  code: string;
  httpStatus: number;
}

export function init(request: Request): void {
  let statusCode = 200;
  try {
    validateRequest(request);
  } catch (e) {
    let apiError = e as ApiError;
    statusCode = apiError.httpStatus || 500;
  }
  Web.getHTTPResponse().setStatus(statusCode);
}

function validateRequest(request: Request): void {
  let userCode: string = request['userCode'];
  if (!userCode) {
    throwApiError('E.IWP.FOO.BAR.00001', 400, 'userCode 为必填项。');
  }
}

function throwApiError(code: string, httpStatus: number, message: string): never {
  let error = new Error(message) as ApiError;
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}
```

完整的实现请参阅 `.claude/skills/tssp-page-generator/assets/post-json-api.md`。

## JSDoc

- JSDoc 注释和区域分隔注释与 jssp 规约相同，不得省略
- 不写类型标签（`{Object}`、`{String}` 等）。类型写在函数签名中，JSDoc 采用 `@param request - 请求对象`、`@return 处理结果` 的形式
- 返回值为 `void` / `never` 的函数不写 `@return`
- `interface` 加上 1 行的 `/** 说明 */`，属性用行尾的 `//` 注释说明

## d.ts 的常量

`d.ts/workflow/enum/` 的常量对象（`NodeType`、`ProcessType`、`TaskStatus` 等），值用字面量书写，常量名只写在 `typeof` 的类型注解和注释中。

```typescript
let NODE_TYPE_APPLY: typeof NodeType.nodeTyp_Apply = '2';  // 申请节点（NodeType.nodeTyp_Apply）

export function isApplyNode(nodeType: string): boolean {
  return nodeType === NODE_TYPE_APPLY;
}
```

- 加上类型注解后，字面量与 d.ts 的值不同时，构建会因 TS2322 而停止
- 不要在表达式中将 `NodeType.nodeTyp_Apply` 作为值引用。它会通过构建并原样保留在输出的 `.js` 中，运行时会发生 ReferenceError

## `const` 的处理

`.ts` 中可以使用 `const`。`tssp build` 会将其转换为 `let`。`jssp-code-style.md` 的「关于 `const`」（避免积极使用）不适用于 `.ts`。不使用 `var`。

## 禁止规避类型检查

类型错误应按 d.ts 的签名修改代码来解决。不得用以下写法规避类型检查。它们都不会被 `tssp build` 检测出来。

- `any`（`: any`、`as any`、`any[]`、`Record<string, any>` 等）。类型无法确定的值用 `unknown` 接收，经 `typeof` 等收窄后再使用
- `as unknown as X` 的双重类型转换。`e as Error`、`e as ApiError`、`new Error(message) as ApiError` 可以使用。不使用为了从包含 `null` 的类型中去除 `null` 的 `as`（`parseLocalDateTime(x) as Date` 等）
- `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`
- 自定义的 `declare`、`declare global`、`/// <reference`、`src/main/tssp` 下自定义的 `.d.ts`

不使用 d.ts 中不存在的 API，并向用户报告。`java.*` / `Packages.*` 在 d.ts 中没有声明，构建会因 TS2304 而停止。

## 与 jssp 规约的对应表

| jssp 规约 | 节 | 本规约的节 |
|---|---|---|
| `jssp-overview.md` | 适用范围 / 脚本开发模型的结构 | 替换对照 |
| `jssp-file-structure.md` | 目录结构 / 文件命名规则 / 不经过路由表调用的画面的例外规约 / .html 文件的必要性 / page 属性的指定方式 | 替换对照 / 类型定义（`interface`） |
| `jssp-file-structure.md` | 基本方针（通用处理的集中） | 与 jssp 规约的关系 |
| `jssp-naming.md` | 命名规范一览 / 绑定变量的定义（函数容器） | 替换对照 / 绑定变量与入口点 |
| `jssp-naming.md` | 绑定变量与普通变量的区分 / 避免与保留字冲突 | 绑定变量与入口点 / 类型定义（`interface`） / d.ts 类型的使用 |
| `jssp-function-container.md` | 基本结构 | 基本结构 / 函数参数与返回值的类型 / 类型定义（`interface`） / JSDoc |
| `jssp-function-container.md` | IM 通用主数据 API（IMMUserManager / IMMCompanyManager 等）的注意事项 | d.ts 类型的使用 |
| `jssp-function-container.md` | validateRequest 函数的实现模式 / request 对象的处理 | 请求值的接收方式 |
| `jssp-code-style.md` | 规则：使用 `let` / 每行长度 / 大括号风格 | 类型定义（`interface`） / d.ts 类型的使用 / 函数参数与返回值的类型 |
| `jssp-code-style.md` | 关于 `const` | `const` 的处理 |
| `jssp-code-style.md` | d.ts 常量与枚举值的引用 | d.ts 的常量 |
| `jssp-code-style.md` | 函数注释（JSDoc 格式） | JSDoc |
| `jssp-error-handling.md` | 错误类型与处理方式 / 错误信息结构（画面） / 验证错误 / 画面的错误处理 | 基本结构 / 类型定义（`interface`） / `catch` 的 `e` / d.ts 类型的使用 |
| `jssp-error-handling.md` | HTTP 状态码 / API 的错误处理 | API 的自定义异常 |
| `jssp-security.md` | 输入验证（必须） / 会话管理 | 函数参数与返回值的类型 |
| `jssp-security.md` | SQL 注入对策（必须） / 禁止直接访问 Java 对象 | d.ts 类型的使用 / 禁止规避类型检查 |
| `jssp-logging.md` | 日志输出的实现 / 机密信息的处理 / 日志格式 | 函数参数与返回值的类型 / `catch` 的 `e` |
| `jssp-2way-sql.md` | SQL 文件的存放位置 / 相关文件 | 替换对照 |
| `jssp-2way-sql.md` | 【重要】禁止在 SQL 文件中书写 `--` 注释 / IN 子句的动态生成 / LIKE 搜索时的转义 / 调用方法 / 参数传递 / 直接嵌入 / 结果集处理 / 事务处理 / 检查清单 | 函数参数与返回值的类型 / 类型定义（`interface`） / d.ts 类型的使用 / `catch` 的 `e` / JSDoc |
| `jssp-presentation-page.md` | 展示页面的标准实现方针 / 绑定变量 `$data` 的作用域化（IIFE） / id 属性的命名规约 / getValidationErrors 函数的实现模式 / 验证的执行时机（均为引用 `jssp-page-generator` 技能的文件之处） | 替换对照 |
