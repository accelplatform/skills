# Script Development Model Overview

> **Application Scope**: 🟢 **Always** — Applies to every JSSP implementation. Required reading for understanding project assumptions and the tech stack.

## Purpose

This document defines the standard rules for ensuring code quality, maintainability, and readability in application development using the intra-mart Accel Platform script development model.

## Scope of Application

- All development projects using the script development model (JSSP)
- Function containers (.js) and presentation pages (.html)
- Related configuration files (routing definition XML, etc.)

## Structure of the Script Development Model

The script development model consists of the following two files:

| File Type | Extension | Role |
|-----------|-----------|------|
| Function Container | .js | Server-side JavaScript. Responsible for business logic processing |
| Presentation Page | .html | Responsible for screen display. Uses IMART tags |

**Runtime Environment**: Rhino (JavaScript engine running on Java)

## Processing Sequence

1. Receive request
2. Execute `init()` in session.js
3. Execute `init()` in the function container
4. Execute the presentation page (generate HTML)
5. Execute `close()` in session.js
6. Return response

## Position of These Rules

These rules are recommendations and may be adjusted as appropriate depending on project characteristics.
However, **security-related rules are mandatory and must be strictly observed**.
