# intra-mart Accel Platform 脚本开发项目

## 概述

本项目使用 intra-mart Accel Platform 的脚本开发模型（JSSP）进行开发。

## 技术栈

| 项目 | 技术 |
|------|------|
| 服务器端 | Rhino JavaScript（兼容 ES5） |
| 模板 | IMART 标签 |
| 数据库 | TenantDatabase / SharedDatabase API |
| 文件操作 | SystemStorage / PublicStorage / SessionScopeStorage API |
| 工作流 | IM-Workflow / ApplyManager |
| 低代码 | IM-LogicDesigner |

## 必须遵守的规则（禁止省略）

**新建或编辑** JSSP 文件（`.js` / `.html`）后，在报告完成之前必须**执行**以下步骤。
无论上下文是否被压缩、会话是否重新开始、工作量多少，均不得省略或推迟。

1. 通过子代理运行 `jssp-page-verifier` 技能，修复所有问题直至错误数量归零。
2. 如果 `jssp-code-review` 技能可用，则执行该技能。
3. 如果 `jssp-security-check` 技能可用，则执行该技能。

> 仅当技能本身不存在时才可跳过。不得以"耗时较长"或"文件数量太多"等理由跳过。

## 子代理分割方针

在涉及多文件的大规模实现中，为防止主会话上下文过度膨胀，请按以下方针将工作委托给子代理。

### 执行顺序（存在依赖关系，必须严格遵守）

```
① DDL / SQL 子代理              ← 必须最先执行（是画面、API、批处理的基础）
         ↓ 完成后
② 以下可并行执行：
   ├─ 画面子代理                 （view/*.js + view/*.html）
   ├─ API 子代理                 （api/*.js）
   ├─ 批处理子代理               （job/*.js）
   └─ 工作流子代理               （workflow/ 目录，仅在使用 IM-Workflow 时）
         ↓ 完成后
③ 路由 · 租户设置子代理
   （routing-jssp-config/*.xml、角色、授权、菜单、作业设置）
         ↓ 完成后
④ 验证子代理                    ← 必须执行，禁止省略
   （jssp-page-verifier → jssp-code-review → jssp-security-check）
```

### 各子代理的负责技能

| 子代理 | 负责范围 | 使用技能 |
|-------|---------|---------|
| DDL/SQL | DDL 3种方言・SQL 模板・示例 DML | `jssp-page-generator`（步骤 6） |
| 画面 | `view/*.js` + `view/*.html` | `jssp-page-generator`（步骤 1〜5） |
| API | `api/*.js` | `jssp-page-generator`（API 版） |
| 批处理 | `job/*.js` | `jssp-im-job-generator` |
| 工作流 | `workflow/` 目录 | `jssp-im-workflow-usage` |
| 路由・租户设置 | `routing-jssp-config/*.xml`・租户资材 | `jssp-tenant-setup-generator` |
| 验证 | 所有成果物的验证与修复 | `jssp-page-verifier` / `jssp-code-review` / `jssp-security-check` |

### 注意事项

- 画面子代理和 API 子代理必须参照 DDL/SQL 子代理生成的表名、列名和 SQL 模板路径进行实现。
- 向各子代理下达指令时，需明确传入所依赖的成果物（DDL 路径、SQL 模板路径等）。
- 若单个子代理的生成文件数量过多，可进一步按功能领域拆分（例如：主数据系统与申请流程系统）。

## 参考资料

### 主要规范文件

编码规范放置于 `.claude/rules/` 目录下。文件一览及内容请参考 `.claude/rules/README.md`。

### 主要技能集

各类技能集放置于 `.claude/skills/` 目录下。技能一览及内容请参考 `.claude/skills/README.md`。

### API 类型定义（d.ts）

实现函数容器时，请参考 `d.ts/` 目录下的 TypeScript 类型定义文件。
其中定义了 SSJS 中可用的全局类、函数和对象的 API 规格（参数、返回值、类型）。

| 目录 | 内容 |
|------|------|
| `d.ts/platform/` | 平台标准 API（Database、Storage、HTTP、Mail 等） |
| `d.ts/tenant/` | 租户管理 API（Account、Menu、Calendar、Password 等） |

**注意：**
- 不得凭记忆或推测使用 API，实现前必须确认对应 d.ts 文件中的类型信息。
- d.ts 文件仅用于函数容器的实现，不得用于展示页面的实现。

