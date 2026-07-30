---
name: jssp-im-logic-usage
description: Generates code that calls an existing IM-LogicDesigner routing definition (logic flow API) from a JSSP presentation page. Fetches and parses the swagger spec (`<BASE-URL>/logic/all-api-docs`) to determine request parameters and response structure, then generates the `fetch` call code. Use when the user mentions calling an IM-LogicDesigner flow, hitting a logic flow API, calling `logic/api`, or using an existing routing definition. To newly create a logic flow (`flow_definition.json`) or routing definition (`flow_route.json`), use `jssp-im-logic-generator` instead.
---

# IM-LogicDesigner Routing Call Code Generation Skill

## Overview

Generates code that calls an **existing routing definition** (`<BASE-URL>/logic/api/<route>`) already configured on an IM-LogicDesigner logic flow, from a JSSP presentation page (browser-side JS).

This skill covers the **calling side**. Creating a new logic flow / routing definition is the job of `jssp-im-logic-generator` and is out of scope here.

## Application Policy

**Whenever a JSSP screen needs to call an IM-LogicDesigner logic flow, always access it through its routing definition.** There is no way to execute a logic flow directly; only flows with a routing definition (`flow_route.json`) can be executed over HTTP at `<BASE-URL>/logic/api/<route>`.

If the target flow does not yet have a routing definition, a routing definition (`routes` spec) must first be created with `jssp-im-logic-generator`. Confirm this with the user and inform them if it is missing.

## Implementation Steps

### 1. Identify the target call

Confirm with the user (skip items that are already obvious from the request):
- The logic flow / feature to call (part of the route path, tag name, etc.)
- HTTP method (should be registered as one of GET/POST/PUT/DELETE — confirm from the swagger spec below)
- Input/display fields needed on the screen side

### 2. Fetch the swagger spec

IM-LogicDesigner exposes all routing definitions registered in the current tenant as a Swagger 2.0 document at:

```
<BASE-URL>/logic/all-api-docs
```

Example: `http://127.0.0.1/imart/logic/all-api-docs`

Use `scripts/fetch-logic-swagger.js` to fetch and extract it (reading the raw document directly wastes context; filter by keyword instead).

```bash
# List all routes (path, method, summary, tags, operationId)
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --list

# Detail for a target route ($ref-resolved request/response schema included)
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --route <keyword>
```

**Determining `<BASE-URL>`**: Check the project's dev server URL settings (e.g. `.mcp.json`). If there is no clue, default to `http://127.0.0.1/imart` and confirm with the user.

#### When 401 / 403 is returned (mandatory handling)

This endpoint is protected by an authorization setting. If the fetch fails with HTTP 401 or 403, **do not guess or silently retry** — present the following message to the user verbatim.

> Please grant "Guest User" access to "IM-LogicDesigner" - "Swagger specification" under "Screens/Processes" in the authorization settings screen.

`scripts/fetch-logic-swagger.js` prints this message to stderr as-is on 401/403 (exit code 1). You may relay the script's output directly to the user.

### 3. Identify the request/response structure

From the fetched spec, check `paths["<path>"][<method>]` for the target route.

| Item | Location |
|------|---------|
| HTTP method | key under `paths["<path>"]` (`get`/`post`/`put`/`delete`) |
| Request parameters | `parameters[].schema.$ref` → `definitions[<ref>].properties` |
| Response structure | `responses.default.schema.$ref` → `definitions[<ref>].properties` |
| Feature tag | `tags` |

When run with `--route`, `$ref` is already inlined, so there is no need to look up `definitions` separately.

Always consult `reference/swagger-routing-call.md` for the detailed structure and type mapping.

### 4. Generate the call code

Follow the `fetch` call pattern in `reference/swagger-routing-call.md` and implement the code inside the `<script>` of the JSSP presentation page. See `assets/sample-call.md` for a complete example.

Mandatory implementation rules:
- Specify the call URL as a relative path `logic/api/<route>` (per the URL policy in `jssp-presentation-page.md`)
- Judge success/failure by **HTTP status (`response.ok`)**, not the JSSP-specific `{error, errorMessage}` shape — the routing response is the flow's own output data and does not follow the JSSP API response convention
- Match the request body shape exactly to the `properties` in `definitions` — do not add or remove fields by guesswork
- If a type is unclear or the spec is missing information, confirm with the user before generating code

## Conventions to Consult

| Convention / Skill | Handling |
|------|---------|
| `jssp-presentation-page.md` | 🟢 Required — URL policy, basic `fetch` call shape |
| `reference/swagger-routing-call.md` (this skill) | 🟢 Required — how to read the swagger structure, fetch call pattern, known caveats |
| `jssp-im-logic-generator`'s `reference/route_definition.schema.json` / `routing-response.md` | 🟡 Reference — routing definition specs (`secured`, `responseType`, etc.) not present in the swagger spec |
| `jssp-error-handling.md` | 🔴 Not needed for this skill alone — logic flow API responses do not follow the JSSP API response convention |
| `jssp-security.md` | 🟡 Reference — only attach the CSRF token (`X-Intramart-Secure-Token`) header when the target routing is confirmed to have `secured: true` |

## References

- `reference/swagger-routing-call.md` - swagger spec structure, fetch call code pattern, known caveats
- `scripts/fetch-logic-swagger.js` - swagger spec fetch/extraction helper script (Node.js, no dependencies)
- `assets/sample-call.md` - complete example (HTML + JS for calling a GET route)

## Limitations

- The swagger spec does not include `secured` (whether a secure token is required), `authentication` (auth method), or `authzUri` (authorization URI) — these are routing definition (`flow_route.json`) settings and cannot be determined from the spec. When unknown, implement without a secure token and ask the user to verify on the real server.
- Out of scope if the target flow has no routing definition (create one first with `jssp-im-logic-generator`).
- Routes registered as GET may still have `parameters[].in` set to `"body"` (a quirk of intra-mart's swagger generation). Since a browser `fetch` cannot attach an HTTP body to a GET request, always check the "body parameter on GET" section of `reference/swagger-routing-call.md` before implementing.
