---
applyTo: "src/main/conf/**/*.xml"
description: "パフォーマンス規約（コンパイラ設定、session.js）"
---

# Performance Standards

> **Application Scope**: 🟡 **Contextual** — Applies only when tuning performance, e.g., compiler settings or session.js adjustments.

## JavaScript Compiler Settings

### source-config.xml Settings

```xml
<!-- Development environment: interpreter mode -->
<source-config>
  <compiler>false</compiler>
</source-config>

<!-- Production environment: compile mode -->
<source-config>
  <compiler>true</compiler>
</source-config>
```

| Setting Value | Usage | Characteristics |
|---------------|-------|-----------------|
| `false` | Development environment | Source changes are reflected immediately. High resource consumption |
| `true` | Production environment | Cached after compilation. Fast, but requires restart when changes are made |

## Notes on session.js

- When `session.js` is modified, **a server restart is required**
- Changes will not be reflected until the server is restarted
- Plan production environment changes carefully
