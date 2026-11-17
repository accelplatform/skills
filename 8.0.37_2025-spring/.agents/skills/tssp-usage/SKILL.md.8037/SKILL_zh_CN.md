---
name: tssp-usage
description: 用于以 TypeScript 编写 intra-mart 的 SSJS，并通过 tssp CLI 转换为面向 Rhino 1.7.15.1 的 JSSP 进行开发的技能集。提供 `.ts` 和 `.html` 的文件位置（`src/main/tssp/src`）与输出目录（`src/main/jssp/src`）、`tssp build` 的处理顺序与退出码、`export let $data` 和 `import type` 等书写约定、基于 d.ts 的类型检查、面向 Rhino 的 lint 17 条规则的禁止事项及替代写法、利用 `.accel/tssp-generated.txt` 修复冲突的方法，以及使用源映射（source map）的调试步骤。当用户提到想用 TypeScript 编写 SSJS/JSSP、想执行 tssp build、修复 tssp 的构建错误或类型错误、修复 Rhino lint 违规、想了解 .ts 和 .html 的放置位置、解决 .accel/tssp-generated.txt 的冲突、使用源映射调试时使用。画面和 API 的生成本身请使用 tssp-page-generator。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [tssp-typescript](../../requirements/tssp-typescript/AGENTS.md) 已参考并理解内容


# tssp 使用支持技能

tssp 是一个 CLI，用于将以 TypeScript 编写的 intra-mart SSJS（服务端 JavaScript）转换为 Rhino 1.7.15.1（intra-mart 的 SSJS 执行引擎）可以运行的 JSSP JavaScript。工作按以下顺序进行。

1. 读取所用 API 的 d.ts（API 的类型定义），记下签名（「类型检查」）
2. 在 `src/main/tssp/src` 下编写 `.ts` 和 `.html`（「文件位置」「书写约定」「Rhino 限制」）
3. 执行 package.json 中的 `tssp:dev` 脚本，将类型错误和 lint 违规降为 0 件（「构建」）

画面和 API 的生成步骤请使用 tssp-page-generator，生成后的验证请使用 tssp-page-verifier。

## 文件位置

| 放置的内容 | 位置 |
|---|---|
| `.ts`（函数容器）和 `.html`（展示页面） | `src/main/tssp/src` 下。成对的 `.ts` 和 `.html` 放在同一目录并使用相同的名称 |
| tssp 的输出（`.js`、`.html`，`--dev` 时还有 `.js.map`） | `src/main/jssp/src` 下。由 tssp 写入，因此不要手动创建或编辑 |

tssp 保持目录结构进行输出。`.ts` 转换为 `.js`，`.html` 原样复制。

| 输入 | 输出 |
|---|---|
| `src/main/tssp/src/sample/view/list.ts` | `src/main/jssp/src/sample/view/list.js` |
| `src/main/tssp/src/sample/view/list.html` | `src/main/jssp/src/sample/view/list.html` |

- `.ts` 和 `.html` 以外的文件（`.d.ts`、`.css`、`.js` 等）不会输出
- 2WaySQL 模板（`.sql`）不会输出，因此与 JSSP 一样，直接放在 `src/main/jssp/src/{功能名}/sql/` 中。可以手动放置在输出目录中的，仅限 `tssp build` 不输出的文件（此 `.sql`、租户环境设置的扩展导入 `*_import.js`、`source-config.xml`）
- `.html` 的书写方式与 JSSP 相同

## 构建

tssp 已包含在 package.json 的 devDependencies（`@intra-mart/tssp`）中。在项目根目录，使用项目的包管理器执行 package.json 的 `scripts` 中的以下脚本（`bun run tssp:dev`、`npm run tssp:dev`、`pnpm run tssp:dev`、`yarn run tssp:dev`）。node 请使用 20.19 以上的 20 系列，或 22.12 以上版本。

| 脚本 | 实际执行的命令 | 从 `.ts` 的输出 | 用途 |
|---|---|---|---|
| `tssp:dev` | `tssp build --dev` | `.js`（不压缩）和 `.js.map` | 开发中的检查、调试 |
| `tssp:build` | `tssp build`（与 `--production` 相同） | 压缩后的 `.js`。不输出源映射 | 生产环境 |

- 追加选项时写在脚本名之后（`bun run tssp:build --locale ja`）。只有 npm 需要在中间加 `--`（`npm run tssp:build -- --locale ja`）
- 两者都会复制 `.html`。`--dev` 和 `--production` 不能同时指定
- 即使压缩，顶层名称（`init`、`$data` 等）以及包含 `@parameter` 的注释也会保留
- 消息的语言由运行环境的区域设置决定，可用 `--locale ja|en|zh_CN` 指定（不支持的语言回退为 en）。tsc 的诊断，以及规则名、文件位置等 oxlint 自身的输出不受 `--locale` 影响

处理按以下顺序进行。从类型检查到冲突检查之间任何一步失败，都会在不写出任何内容的情况下结束。

1. 类型检查。读取 tsconfig，将 `target` 覆盖为 ES5 后进行检查
2. lint。检查 Rhino 不接受的写法
3. 转换。将 `.ts` 转为 JavaScript，并读取 `.html`
4. 冲突检查
5. 写出

省略 `--tsconfig` 时，按以下顺序使用最先找到的 tsconfig。当 `--tsconfig` 指定的文件不存在时，不会查找其他候选，而是以退出码 2 结束。

1. 项目根目录的 `tsconfig.json`
2. `src/main/tssp/tsconfig.json`
3. tssp 自带的 `tsconfig.default.json`。其中 `strict: true`、`lib: ["ES2015"]`，include 为 `src/main/tssp/src` 和 `d.ts/**/*.d.ts`

放置根目录的 `tsconfig.json` 或 `src/main/tssp/tsconfig.json` 时，请写入与自带默认值相同的 `lib: ["ES2015"]`。如果不写 `lib`，会引入 DOM 类型，与 d.ts 中的 `Request`、`File`、`URL`、`Storage`、`Cache` 等冲突，导致 TS2300。

| 退出码 | 含义 |
|---|---|
| 0 | 成功 |
| 1 | 类型错误、lint 违规、转换失败、冲突、I/O 错误 |
| 2 | 参数有误、`--src` 的目录或 `--tsconfig` 的文件不存在、`src/main/tssp/src` 中的 `.ts` 不在 tsconfig 的范围内 |

## 书写约定

```typescript
// src/main/tssp/src/sample/view/model.ts。只放置类型
export interface Item {
  id: string;
  label: string;
}
```

```typescript
// src/main/tssp/src/sample/view/list.ts
import type { Item } from './model';

// 从 list.html 引用的绑定变量
export let $title = '一覧';
export let $data = '{}';

export function init(request: Request): void {
  const keyword = request.getParameterValue('keyword') || '';
  const items: Item[] = [{ id: '1', label: keyword }];
  // 将 '/' 替换为 '\/'，以免 JSON 内的 </script> 使脚本被截断
  $data = JSON.stringify({ list: items }).replace(/\//g, '\\/');
}
```

（示例中的字符串 `'一覧'` 表示「列表」。）

- 绑定变量写作 `export let $data = ...`，入口点写作 `export function init(request: Request): void`。`export` 在输出中会被去除
- 可以使用 `const`。tssp 会将其转换为 `let`
- `import` 语句会从输出中消失。其他 `.ts` 的类型请用 `import type` 读取
- 要在运行时使用公共模块（`common/` 下的 `.ts`）的函数或常量，与 JSSP 一样用 `load('sample/common/util');` 读取（参数是相对于 `src/main/jssp/src`、不带扩展名的路径。被读取文件的顶层名称会进入调用方的作用域）。为了类型检查，还要写 `import { helper } from '../common/util';`（它会从输出中消失）。公共模块一侧，被引用的名称用 `export function` / `export let` 书写
- 即使 import 函数或常量等值，在运行时也不会传到。类型检查和 lint 能通过，但输出的 `.js` 中该名称并未定义
- `export default`、`export =`、`import =`、`import()`、`import.meta` 会导致 lint 错误
- `?.`、`??`、对象的 spread 和 rest（`{ ...o }`、`const { a, ...rest } = o`）会被 tssp 改写为适合 Rhino 的形式（输出的 `.js` 中会加入使用 `var` 的辅助函数），而箭头函数、模板字面量、解构赋值则原样保留在输出中。这些都不要在服务端代码中使用，与 JSSP 一样用 `function`、`+` 字符串拼接和属性访问来书写。因为针对构建输出执行的 `validate-jssp-code.js`（`tssp-page-verifier` 使用）会将它们指出为 JSSP-JS-002（`var`）/ 007（箭头函数）/ 012（模板字面量）。属于「Rhino 限制」表中的写法（数组剩余元素 `[a, ...b]`、计算键、解构默认值、默认参数、`catch` 和 rest 参数的解构、箭头函数的 rest 参数、`async`）会在类型检查或 lint 阶段使构建停止
- 仅含类型的 `.ts`（如示例中的 `model.ts`）也会输出没有可执行语句的 `.js`

## 类型检查

类型检查针对 tsconfig 所包含的 `d.ts/**/*.d.ts` 中的声明，以及 tsconfig 的 `lib`（自带默认值为 ES2015）中的声明进行。使用两者都没有的全局变量，或类型上未声明的方法，会因类型错误而停止。例外是 `any` 类型的值，以及具有索引签名（`[key: string]: ...`）的类型，读取声明中不存在的名称的属性时也能通过类型检查。即使在 `lib` 中存在但 Rhino 中没有的内容（例如 `Proxy`、`Reflect`）也能通过类型检查和 lint，运行时会出现 ReferenceError，因此不要使用。

```
src/main/tssp/src/a.ts(1,21): error TS2551: Property 'getLoggr' does not exist on type 'typeof Logger'. Did you mean 'getLogger'?
存在类型错误，未进行转换
```

实现之前请执行以下 3 个步骤。

1. 列出所用的 API（类、全局函数、对象）
2. 读取相应的 d.ts。如果不知道位置，可以像 `grep -rnwE "(class|interface|type|namespace|function|const) Logger" d.ts/` 这样查找声明
3. 记下参数和返回值的类型后再编写。对于返回值可能包含 `null
` 的方法，要处理 `null` 的情况

| 目录 | 内容 |
|---|---|
| `d.ts/platform/` | 平台标准 API。`Request` 位于 `d.ts/platform/standard/im-ssjs-request.d.ts` |
| `d.ts/tenant/` | 租户管理 API |
| `d.ts/master/` | IM-通用主数据 API |
| `d.ts/workflow/` | IM-Workflow API。仅限包含 IM-Workflow 的项目 |
| `d.ts/bpm/` | IM-BPM API。仅限包含 IM-BPM 的项目 |

- `Request` 具有 `[key: string]: Request.Attribute`（`Request.Attribute` 为 `any`），以便将 URL 参数作为属性读取。`request.xxx` 即使是 d.ts 中没有的名称、即使作为方法调用，也能通过类型检查，因此方法名要在 d.ts 中确认
- 不得使用 `any`、`as any`、`@ts-ignore`、`@ts-expect-error`、`@ts-nocheck` 或自行编写的 `declare` 来绕过类型检查。在 d.ts 中找不到的 API 不要使用，并向用户报告
- tssp 会将类型检查的 `types` 覆盖为空。`process` 和 `require` 等 Node.js 的名称无法使用（TS2591）
- 类型检查的 `target` 为 ES5，因此用 `for...of` 遍历 `Set` 或 `Map` 会出现 TS2802。请用 `forEach` 遍历。数组可以用 `for...of` 遍历。在 `lib` 仅为 ES5 的 tsconfig 中，将 `Set`、`Map`、`Promise`、`Symbol` 作为值使用会出现 TS2583・TS2585

## Rhino 限制

lint 共 17 条规则，用于检测 Rhino 1.7.15.1 不接受的写法，以及不报错但含义会改变的写法。只有 `no-loop-closure-capture` 是警告（warning），其余均为错误。tssp 将警告也视为违规，命中任何一条规则，构建都会以退出码 1 停止。`.d.ts` 和 `declare` 内部不进行检查。

```
src/main/tssp/src/a.ts:1:17: error rhino(no-default-param): 默认参数在 Rhino 1.7.15.1 中会导致语法错误
存在 lint 违规，未进行转换
```

| 规则 | 禁止的写法 | 替代写法 |
|---|---|---|
| `no-array-rest-pattern` | 数组解构的剩余元素（`const [a, ...b] = xs`） | `xs[0]` 和 `xs.slice(1)` |
| `no-arrow-rest` | 箭头函数的 rest 参数（`(...xs) => xs`） | `function (...xs: number[]) { ... }` |
| `no-async` | `async` 的函数、箭头函数、方法 | 用同步函数编写 |
| `no-catch-destructuring` | `catch` 的解构（`catch ({ message })`） | 用 `catch (e)` 接收，再读取 `(e as Error).message` |
| `no-class` | `class`、constructor 参数的访问修饰符（`private p` 等） | 用 `interface` 描述类型，用返回对象的函数来创建 |
| `no-computed-key` | 对象字面量和解构中的计算键（`{ [k]: v }`） | 像 `const o: Record<string, number> = {};` 这样带类型创建后再 `o[k] = v`。读取时用 `o[k]` |
| `no-default-param` | 默认参数（`function f(a = 1)`） | 改为 `a?: number`，在函数体中写 `a === undefined ? 1 : a` |
| `no-destructuring-default` | 解构的默认值（`const { a = 1 } = o`） | `const a = o.a === undefined ? 1 : o.a;` |
| `no-generator-method` | 对象的 generator 方法（`{ *m() {} }`） | `m: function* () {}` 或 `function*` 声明 |
| `no-helper-name` | 在顶层声明与转换所用辅助函数同名的名称（`ownKeys`、`defineProperty`、`toPropertyKey`、`toPrimitive`、`typeof`、`objectSpread`、`objectWithoutProperties`、`objectWithoutPropertiesLoose`、`usingCtx`。包括前面带 `_`、后面带数字的名称） | 改用其他名称。在函数内部声明的名称不在检查范围内 |
| `no-loop-closure-capture`（警告） | 在循环内的闭包中引用在 `for`・`for...in`・`for...of` 头部以 `let`・`const` 声明的变量。在 Rhino 中所有迭代共享同一个变量 | 在循环体中重新声明 `const j = i;`，并引用 `j`。直接传给 `forEach`・`map` 等的回调不在检查范围内 |
| `no-module-runtime` | `export default`、`export =`、`import =`、`import()`、`import.meta` | 具名 `export` 和 `import type` |
| `no-namespace-value` | `namespace` 内的 `export const`・`export let`・`export var` | 将值放在 `namespace` 之外。`namespace` 内的 `export function` 和类型可以使用 |
| `no-new-target` | `new.target` | 不要使用 |
| `no-rest-destructuring` | rest 参数的解构（`function f(...[a, b])`） | 用 `function f(...args: number[])` 接收，在函数体中读取 `args[0]`、`args[1]` |
| `no-spread-call-array` | 调用、`new`、数组字面量中的 spread（`f(...xs)`、`[...xs]`） | `f.apply(null, xs)`（方法用 `o.m.apply(o, xs)`）、`xs.concat(ys)`、`xs.slice()` |
| `no-unsupported-regexp` | 正则表达式字面量中的命名分组（`(?<y>...)`、`\k<y>`）、后行断言（`(?<=...)`、`(?<!...)`）、修饰符分组（`(?i:...)`）、`g` `i` `m` `s` `y` 以外的标志（`u`、`d`、`v`） | 连同前后的字符一起用编号分组 `(...)` 匹配，再通过 `m[1]` 等取出。正则表达式字面量的标志只使用 `g` `i` `m`。`s` 和 `y` 能通过 lint，但类型检查会以 TS1501 停止，因此写作 `new RegExp('a.b', 's')` |

`no-unsupported-regexp` 只检查正则表达式字面量。命名分组、后行断言、修饰符分组以及 `u` `d` `v` 标志，传给 `new RegExp(...)` 时构建能通过，但运行时会出现 SyntaxError。`s` 和 `y` 传给 `new RegExp(...)` 时能通过类型检查，在 Rhino 中也能运行。带命名分组以及 `u` `d` `v` 标志的正则表达式字面量，在 lint 之前就会被类型检查以 TS1503・TS1501 停止。tssp 会将 `target` 覆盖为 ES5，因此提高 tsconfig 的 `target` 也无法解决。

## 冲突

tssp 将写出的文件记录在 `.accel/tssp-generated.txt` 中。该列表位于执行命令的目录（项目根目录）下，每行一个相对于该目录的相对路径。

如果准备写出的路径上已经存在不在列表中的文件或目录，就会产生冲突。tssp 会显示冲突的路径并以退出码 1 结束，不写出任何内容。

```
以下输出路径已存在且不在生成文件列表（.accel/tssp-generated.txt）中，未写入任何内容:
  src/main/jssp/src/sample/view/list.js
```

修复方法为以下两种之一。

1. 如果该文件是 tssp 的输出，删除后重新执行
2. 如果是手写的文件，更改对应 `.ts` 或 `.html` 的名称

- 没有列表时，准备写出的路径上已有的文件和目录全部都会产生冲突。与准备写出的路径不重合的文件不会冲突。在已有项目中引入时，请先删除输出目录中 tssp 的生成物，再进行第一次构建
- 对于列表中记录的输出，删除原来的 `.ts` 或 `.html` 后，会在下一次成功的构建中被删除。不在列表中的文件不会被删除
- 写出或删除的过程中发生 I/O 错误时，此前的写出和删除不会回滚。修复原因后重新执行同一命令。如果无法保存列表，请删除输出目录中 tssp 的生成物后重新开始

## 调试

1. 确认输出目录的路径中包含名为 `jssp` 的目录。默认输出目录 `src/main/jssp/src` 满足条件。用 `--out` 更改输出目录时，也要在路径中包含 `jssp`。更改 `--out` 进行构建后，`.accel/tssp-generated.txt` 中记录的上次输出（包括默认输出目录中的）都会被删除。要恢复时，不带 `--out` 重新构建
2. 用 `tssp:dev` 脚本进行转换。`.js.map` 会输出到与 `.js` 相同的目录
3. 在调试器中对原始的 `.ts` 设置断点

不带 `--dev` 的构建成功后，上一次 `--dev` 输出的 `.js.map` 会被删除。
