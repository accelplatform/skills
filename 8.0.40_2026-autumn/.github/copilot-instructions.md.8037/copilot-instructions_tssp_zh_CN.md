# intra-mart Accel Platform 开发项目

## 概述

本项目在 intra-mart Accel Platform 上进行开发，组合使用以下开发模型。

| 开发模型 | 用途 |
|------|------|
| JSSP（脚本开发模型） | 画面及各类插件的源代码 |
| Java（JavaEE 开发模型） | 除画面外的各类插件的源代码 |
| IM-LogicDesigner / IM-Workflow / IM-BPM | 低代码资材 |

## 技术栈

### JSSP（脚本开发模型）

| 项目 | 技术 |
|------|------|
| 服务器端 | Rhino JavaScript（兼容 ES5） |
| 模板 | IMART 标签 |
| 数据库 | TenantDatabase / SharedDatabase API |
| 文件操作 | SystemStorage / PublicStorage / SessionScopeStorage API |
| 工作流 | IM-Workflow / ApplyManager |
| 低代码 | IM-LogicDesigner |

### Java（JavaEE 开发模型）

详情参见 `.github/instructions/java-architecture.instructions.md`。分层结构、依赖规则、命名规约等请参见 `.github/instructions/README.md` 中面向 Java 的规约一览。

## 必须遵守的规则（禁止省略・TSSP）

**新建或编辑** TSSP 文件（`src/main/tssp/src` 下的 `.ts` / `.html`）时，必须**执行**以下步骤。步骤 1 在实现之前进行，步骤 2〜5 在报告完成之前进行。
无论上下文是否被压缩、会话是否重新开始、工作量多少，均不得省略或推迟。

1. 列出要使用的 API，Read `d.ts/` 下对应的文件并记下签名（不得凭记忆编写 API）。
2. 运行 package.json 中的 `tssp:dev` 脚本（`tssp build --dev`），使类型错误和面向 Rhino 的 lint 违规均为 0 件，构建成功。不得使用 `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / 自行编写的 `declare` 来规避类型错误。
3. 通过子代理运行 `tssp-page-verifier` 技能，修复所有问题直至错误数量归零。
4. 如果 `tssp-code-review` 技能可用，则执行该技能。
5. 如果 `jssp-security-check` 技能可用，则执行该技能。

> 对于运行技能的步骤，仅当技能本身不存在时才可跳过。不得以"耗时较长"或"文件数量太多"等理由跳过。

## TSSP 用技能与 JSSP 用技能的区分使用

TSSP 用的技能共 4 个：`tssp-usage` / `tssp-page-generator` / `tssp-page-verifier` / `tssp-code-review`。对于存在 TSSP 用技能的工作，必须使用 TSSP 用技能。
除上述以外的 `jssp-*` 技能和 `.github/instructions/` 中的规约，请酌情读替（转换解读）为 TypeScript 后执行。读替后的写法须遵循 `.github/instructions/tssp-typescript.instructions.md`。不要公开已进行读替的事实。

- 经读替的技能输出的面向 JSSP（`.js`）的代码示例，须改写为 `.ts` 后使用。
- `jssp-security-check` 针对 `src/main/jssp/src` 的构建输出和 `.html` 执行。

## 子代理分割方针（TSSP）

在涉及多文件的大规模 TSSP 实现中，为防止主会话上下文过度膨胀，请按以下方针将工作委托给子代理。

### 执行顺序（存在依赖关系，必须严格遵守）

```
① DDL / SQL 子代理              ← 必须最先执行（是画面、API、批处理的基础）
         ↓ 完成后
② 以下可并行执行：
   ├─ 画面子代理                 （view/*.ts + view/*.html）
   ├─ API 子代理                 （api/*.ts）
   ├─ 批处理子代理               （job/*.ts）
   └─ 工作流子代理               （workflow/ 目录，仅在使用 IM-Workflow 时）
         ↓ 完成后
③ 路由 · 租户设置子代理
   （routing-jssp-config/*.xml、角色、授权、菜单、作业设置）
         ↓ 完成后
④ 验证子代理                    ← 必须执行，禁止省略
   （tssp-page-verifier → tssp-code-review → jssp-security-check）
```

### 各子代理的负责技能

| 子代理 | 负责范围 | 使用技能 |
|-------|---------|---------|
| DDL/SQL | DDL 3种方言・SQL 模板・示例 DML | `tssp-page-generator`（步骤 6） |
| 画面 | `view/*.ts` + `view/*.html` | `tssp-page-generator`（步骤 1〜5） |
| API | `api/*.ts` | `tssp-page-generator`（API 版） |
| 批处理 | `job/*.ts` | `jssp-im-job-generator` |
| 工作流 | `workflow/` 目录 | `jssp-im-workflow-usage` |
| 路由・租户设置 | `routing-jssp-config/*.xml`・租户资材 | `jssp-tenant-setup-generator` |
| 验证 | 所有成果物的验证与修复 | `tssp-page-verifier` / `tssp-code-review` / `jssp-security-check` |

### 注意事项

- 画面子代理和 API 子代理必须参照 DDL/SQL 子代理生成的表名、列名和 SQL 模板路径进行实现。
- 向各子代理下达指令时，需明确传入所依赖的成果物（DDL 路径、SQL 模板路径等）。
- 若单个子代理的生成文件数量过多，可进一步按功能领域拆分（例如：主数据系统与申请流程系统）。
- 编写 `.ts` 的子代理在报告之前必须运行 package.json 中的 `tssp:dev` 脚本，使其负责文件的类型错误和面向 Rhino 的 lint 违规均为 0 件。
- `src/main/jssp/src` 是 `tssp build` 的输出目录，因此不得手动编辑。仅 `tssp build` 不输出的文件才手动放置（2WaySQL 的 `.sql` 放在 `src/main/jssp/src/{功能名}/sql/`，租户环境设置的扩展导入 `*_import.js` 和 `source-config.xml` 放在原有位置）。`.ts` 和 `.html` 放在 `src/main/tssp/src`。

## 参考资料

### 主要规范文件

编码规范放置于 `.github/instructions/` 目录下。文件一览及内容请参考 `.github/instructions/README.md`。

### 主要技能集

各类技能集放置于 `.github/skills/` 目录下。技能一览及内容请参考 `.github/skills/README.md`。

### API 类型定义（d.ts、TSSP）

实现 TSSP 函数容器（`.ts`）时，请参考 `d.ts/` 目录下的 TypeScript 类型定义文件。
其中定义了 SSJS 中可用的全局类、函数和对象的 API 规格（参数、返回值、类型）。
`tssp build` 进行类型检查所用的 tsconfig 包含 `d.ts/**/*.d.ts`，因此使用 d.ts（以及 tsconfig 的 `lib`）中没有的 API 会导致 `tssp build` 失败。像 `Request` 这样带有索引签名的类型，即使方法名未在声明中也能通过类型检查，因此方法名须在 d.ts 中确认。

| 目录 | 内容 |
|------|------|
| `d.ts/platform/` | 平台标准 API（Database、Storage、HTTP、Mail 等） |
| `d.ts/tenant/` | 租户管理 API（Account、Menu、Calendar、Password 等） |

**注意：**
- 实现前，须列出要使用的 API，Read 对应的 d.ts 文件并记下签名（参数、返回值、类型）。
- 不得使用 `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / 自行编写的 `declare` 来规避类型检查。
- d.ts 文件仅用于函数容器（`.ts`）的实现，不得用于展示页面（`.html`）的实现。
