# Agent Definitions

This directory contains sub-agent definition files used by coding agents.
When invoking an agent from the VSCode chat panel, the appropriate sub-agent is automatically selected based on the task.

## Overview

Each agent is defined in a `*.agent.md` file and is used as a sub-agent when a coding agent performs a specific task.
In large-scale implementations, multiple agents work in coordination following an execution order based on dependencies.

## How Agents Are Selected

Each agent file has a **`description`** field in the frontmatter. The coding agent uses this description to automatically select the appropriate sub-agent for the task.

To specify an agent explicitly, mention the agent name (the value of the `name` field) in the prompt.

## Agent List

| File | Role | Skill Used |
|------|------|-----------|
| `jssp-page-generator.agent.md` | Generates new JSSP screens (.js/.html), routing configurations (.xml), and DDL/SQL | `jssp-page-generator` |
| `jssp-im-job-generator.agent.md` | Generates new batch processing programs (.js) to be executed by the job scheduler | `jssp-im-job-generator` |
| `jssp-im-workflow-usage.agent.md` | Generates new IM-Workflow integration programs (application/approval/confirmation screens, action processing) | `jssp-im-workflow-usage` |
| `jssp-tenant-setup-generator.agent.md` | Generates new tenant environment setup (Importer) materials | `jssp-tenant-setup-generator` |
| `jssp-page-verifier.agent.md` | Runs validation on generated JSSP files and fixes errors | `jssp-page-verifier` |
| `jssp-code-review.agent.md` | Performs quality review of JSSP code (conventions, naming rules, error handling, etc.) | `jssp-code-review` |
| `jssp-security-check.agent.md` | Detects security vulnerabilities in JSSP code (SQL injection, XSS, etc.) | `jssp-security-check` |

## Execution Order

Because agents have dependencies, they must be executed in the following order.

```
① jssp-page-generator (DDL/SQL)  ← always first
         ↓ after completion
② The following can run in parallel
   ├─ jssp-page-generator (screens / API)
   ├─ jssp-im-job-generator (batch)
   └─ jssp-im-workflow-usage (workflow)
         ↓ after completion
③ jssp-tenant-setup-generator (routing / tenant config)
         ↓ after completion
④ jssp-page-verifier → jssp-code-review → jssp-security-check (validation — required)
```

## Localization

Each agent file has localized variants (`*_ja.md`, `*_en.md`, `*_zh_CN.md`) under `*.agent.md.<version>/`.
These switch automatically based on the project's locale setting.
