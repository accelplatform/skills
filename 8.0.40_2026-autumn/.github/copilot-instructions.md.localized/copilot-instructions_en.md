# intra-mart Accel Platform Script Development Project

## Overview

This project uses the intra-mart Accel Platform script development model (JSSP).

## Technology Stack

| Item | Technology |
|------|------------|
| Server-side | Rhino JavaScript (ES5 compatible) |
| Template | IMART tags |
| Database | TenantDatabase / SharedDatabase API |
| File Operations | SystemStorage / PublicStorage / SessionScopeStorage API |
| Workflow | IM-Workflow / ApplyManager |
| Low-code | IM-LogicDesigner |

## References

### Key Convention Files

Coding conventions are placed under `instructions/`. For the file list and contents, refer to `instructions/README.md`.

### Key Skill Sets

Various skill sets are placed under `skills/`. For the skill list and contents, refer to `skills/README.md`.

### API Type Definitions (d.ts)

When implementing function containers, refer to the TypeScript type definition files under `d.ts/`.
These define the API specifications (arguments, return values, and types) for globally available classes, functions, and objects in SSJS.

| Directory | Description |
|-----------|-------------|
| `d.ts/platform/` | Platform standard APIs (Database, Storage, HTTP, Mail, etc.) |
| `d.ts/tenant/` | Tenant management APIs (Account, Menu, Calendar, Password, etc.) |

**Notes:**
- Never use APIs from memory or guesswork — always verify the type information in the corresponding d.ts file before implementing.
- d.ts files should only be used for function container implementation, not for presentation page implementation.

## Recent Context

<!-- BEGIN AUTO-CONTEXT: managed by copilot-mem. Edit outside this block. -->

*No recent activity*

<!-- END AUTO-CONTEXT -->
