# File Structure Standards

> **Application Scope**: 🟢 **Always** — Applies to every JSSP implementation. Always consult when deciding file placement.

## Directory Structure

```
src/
├── main/
│   ├── conf/
│   │   └── routing-jssp-config/                # Routing configuration
│   └── jssp/
│       └── src/                                # JSSP source root
│           └── {category}/                     # Name grouping similar functions
│               ├── view/                       # Screens
│               │   ├── {view}.js               # Function container
│               │   └── {view}.html             # Presentation page
│               ├── api/                        # REST-API programs
│               │   └── {api}.js                # API implementation (script development model)
│               ├── job/                        # Job programs
│               │   └── {job}.js                # Job implementation (script development model)
│               ├── workflow/                   # IM-Workflow integration programs
│               │   ├── apply/                  # Application screen (screen kind expressed by directory; see exception rules below)
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── approve/                # Approval screen
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── {action}.js             # Action processing (script development model)
│               │   ├── {process}.js            # Case start/end processing (script development model)
│               │   └── {rule}.js               # Rule judgment processing (script development model)
│               └── common/                     # Common processing
│                   └── {function}.js           # Functions
├── test/
│   ├── jssp/
│   │   └── src/                                # Jest on Rhino unit tests
│   │       └── {category}/                     # Same structure as source
│   │           ├── view/{view}.test.js
│   │           ├── api/{api}.test.js
│   │           └── common/{function}.test.js
│   └── e2e/                                    # Playwright E2E tests
│       └── {module-name}.spec.ts
```

### Basic Policy

- Divide folders by functional unit and group related files together
- Processing that is completely identical across `.js` files under `{function}` and used commonly should be consolidated under `common/`
  - One function per file
- Folder names use lowercase alphanumerics and underscores

## File Naming Rules

### Basic Rules

| Item | Rule | Example |
|------|------|---------|
| Character types | Lowercase alphanumerics, underscores | `user_master.js` |
| Pairing | .js and .html must have the same name and **must exist as a pair** | `user_edit.js` + `user_edit.html` |
| Extension | Always lowercase | `.js`, `.html` |

### Exception Rules for Screens Not Called Through the Routing Table

The `view/{view}.js` pattern (a snake_case file name unique per screen) defined on this page applies to **screens called through the routing table via URL access**.

Screens invoked **through a different path that bypasses the routing table** follow **a separate set of rules** defined by the corresponding specialized skill (this is not a contradiction with this page's rules — it stems from a different invocation source):

| Invocation path | Placement / naming rules | Owning skill |
|---|---|---|
| IM-Workflow engine (via `scriptPath` in the XML) | `{feature}/workflow/{screen-kind}/index.js` (screen kind is expressed by the directory; file name is unified to `index`) | `jssp-im-workflow-usage` |

These exception screens are dispatched via a content-definition XML or a platform feature, so they do not need URL routing and can have several screens (apply / approve / detail, etc.) inside one feature.
When generating these, refer to the SKILL.md of each owning skill.

### Mandatory .html Files

For JSSP screens (under `view/`), **even if there is no content to display on the presentation page, a `.html` file with the same name as the `.js` file must be placed**.
If the file does not exist, an error will occur when the screen is requested. If there is no content to display, an **empty file** (0 bytes) is acceptable.

```
content/view/content_list.js    # Function container
content/view/content_list.html  # Presentation page (required even if empty)
```

### Prohibited Items

- Use of uppercase letters (e.g., `UserMaster.js` is not allowed)
- Use of hyphens (e.g., `user-master.js` is not allowed)
- Use of spaces or Japanese characters

### Recommended Patterns

```
# Screen-related
{function_name}_{screen_type}.js/.html

Examples:
user_list.js        # User list
user_edit.js        # User edit
travel_apply.js     # Application screen
travel_approve.js   # Approval screen

# Processing-related (no screen)
{action_type}_{processing_target}.js

Examples:
search_user.js      # Search processing
register_user.js    # Registration processing
update_user.js      # Update processing
delete_user.js      # Delete processing
```

## Routing Configuration

Routing configuration files are placed under `routing-jssp-config/`.

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- URL to script mapping (always specify authz explicitly on each file-mapping) -->
  <file-mapping path="/sample/user/list" page="user/view/user_list">
    <authz uri="service://sample/user/list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

### How to Specify the page Attribute

The `page` attribute specifies the relative path (without extension) from `src/main/jssp/src/`.
Source files are placed under `src/main/jssp/src/`, and the relative path within that is written in the routing `page`.

```
src/main/jssp/src/{category}/view/{view}.js
                    ↓
page="{category}/view/{view}"
```

| File Path | page Attribute Value |
|-----------|---------------------|
| `src/main/jssp/src/simple_form/view/index.js` | `simple_form/view/index` |
| `src/main/jssp/src/sample_wizard/view/index.js` | `sample_wizard/view/index` |
| `src/main/jssp/src/simple_form/api/register.js` | `simple_form/api/register` |

### Authorization Configuration Guidelines

- **`welcome-all` (skipping authorization) is prohibited in principle**. Do not use `<authz-default mapper="welcome-all" />` either.
- **Always specify** `<authz uri="service://{feature}/{operation}" action="execute" />` on each `file-mapping`.
- The authorization resources referenced by `uri` (policy / resource / resource-group / subject-group) must be defined and imported with the `jssp-tenant-setup-generator` skill.
- Note that if the authorization resources are not prepared, access after deployment is always denied.

| Notation | Usage | Description |
|----------|-------|-------------|
| `<authz uri="..." action="..." />` | All screens / all APIs (in principle) | Evaluates access rights against the authorization resource |
| `welcome-all` / `authz-default` | (Deprecated - do not use in principle) | Skips authorization, so it must not be used |
