# 代理定义

本目录存放编码代理使用的子代理定义文件。
从 VSCode 聊天栏调用代理时，系统会根据任务自动选择合适的子代理。

## 概述

各代理以 `*.agent.md` 格式的文件定义，当编码代理执行特定任务时作为子代理使用。
大规模实现中，多个代理按照依赖关系规定的执行顺序协作运行。

## 代理的参考方针

各代理文件开头的 frontmatter 中明确记载了 **`description`** 字段。编码代理根据该描述自动选择适合任务的子代理。

如需明确指定代理，请在提示词中提及代理名称（`name` 字段的值）。

## 代理一览

| 文件 | 职责 | 使用技能 |
|------|------|---------|
| `jssp-page-generator.agent.md` | 新规生成 JSSP 画面（.js/.html）、路由设置（.xml）及 DDL/SQL | `jssp-page-generator` |
| `jssp-im-job-generator.agent.md` | 新规生成由作业调度器执行的批处理程序（.js） | `jssp-im-job-generator` |
| `jssp-im-workflow-usage.agent.md` | 新规生成 IM-Workflow 联动程序（申请・审批・确认画面、动作处理） | `jssp-im-workflow-usage` |
| `jssp-tenant-setup-generator.agent.md` | 新规生成租户环境初始化（Importer）资材 | `jssp-tenant-setup-generator` |
| `jssp-page-verifier.agent.md` | 对生成的 JSSP 文件执行验证并修复错误 | `jssp-page-verifier` |
| `jssp-code-review.agent.md` | 对 JSSP 代码进行质量审查（规约・命名规则・错误处理等） | `jssp-code-review` |
| `jssp-security-check.agent.md` | 检测 JSSP 代码中的安全漏洞（SQL 注入・XSS 等） | `jssp-security-check` |

## 执行顺序

各代理之间存在依赖关系，因此须按以下顺序执行。

```
① jssp-page-generator（DDL/SQL）← 必须最先执行
         ↓ 完成后
② 以下可并行执行
   ├─ jssp-page-generator（画面・API）
   ├─ jssp-im-job-generator（批处理）
   └─ jssp-im-workflow-usage（工作流）
         ↓ 完成后
③ jssp-tenant-setup-generator（路由・租户设置）
         ↓ 完成后
④ jssp-page-verifier → jssp-code-review → jssp-security-check（验证・必须）
```

## 本地化

各代理文件在 `*.agent.md.<version>/` 下都有本地化版本（`*_ja.md`、`*_en.md`、`*_zh_CN.md`）。
根据项目区域设置自动切换。
