# oauth-client-resources-config (Resource URL Configuration)

A configuration file that maps the **URL (path)** published as the OAuth REST-API to the **JSSP resource implementation file (target)**.
It is the OAuth version of `routing-jssp-config` and declares per-URL authorization method (`<authz>`) and required scope in the same element.

## Location

```
src/main/conf/oauth-client-resources-config/{arbitrary-file-name}.xml
```

After deployment, placed under `WEB-INF/conf/oauth-client-resources-config/...`.

## XML Structure

```
<oauth-client-resources-config>
  <client-resources>
    <client-resource id="..." path="..." type="jssp|java" target="...">
      <authz uri="service://..." action="execute" /> ← Required. See "How to write <authz>" below (specify uri/action)
      <scope id="..." />                            ← Required. Repeat to require multiple scopes with AND condition
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

> Each `<client-resource>` must **explicitly specify** `<authz uri="service://..." action="execute" />`. Skipping authorization via `welcome-all` (fallback using `<authz-default>` or `<authz mapper="welcome-all" />`) is prohibited. `build-oauth.js` also aborts with an error when `spec.json` has `authz: "welcome-all"` or omits the `authz` field.

## Element / Attribute List

| Element / Attribute | Required | Description |
|-------------|:----:|------|
| `oauth-client-resources-config` (root) | ○ | Namespace `http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config` |
| `client-resources` | ○ | Parent element of client-resource |
| `client-resource` | ○ | Individual resource definition |
| `client-resource/@id` | ○ | Unique ID for the resource (used for identification in operation logs, etc.) |
| `client-resource/@path` | ○ | Published URL path (e.g., `/oauth/sample_oauth/get_user`) |
| `client-resource/@type` | ○ | `jssp` or `java` |
| `client-resource/@target` | ○ | For `type="jssp"`, path **without extension** starting from `src/main/jssp/src/`.<br>For `type="java"`, FQCN of the implementation class |
| `authz` | ○ | Authorization resource required to call this URL (always specify with `uri/action`) |
| `authz/@uri` | ○ | Authorization resource URI (e.g., `service://sample_oauth/get_user`) |
| `authz/@action` | ○ | Authorization action (mostly `execute`) |
| `scope` | ○ | Required scope. One or more required |
| `scope/@id` | ○ | scope ID defined in `oauth-client-scopes-config` |

> Examples of `target` specification
> - For `src/main/jssp/src/sample_oauth/oauth/get_user.js` → `target="sample_oauth/oauth/get_user"`
> - For `src/main/jssp/src/equipment_api/oauth/list.js` → `target="equipment_api/oauth/list"`
>
> Set up an `oauth/` subdirectory directly under the feature directory (`{feature-name}/`) to aggregate REST-API resources.
> They are designed to exist in parallel with `{feature-name}/view/` and `{feature-name}/api/` (CSRF secure token version).
> The notation is the same as the `page` attribute of routing-jssp-config (starting from `src/main/jssp/src/`, without extension).

## Sample

The XML is automatically generated from `spec.json` by `scripts/build-oauth.js`. The coding agent does not write it by hand.
- **spec.json sample**: The `"resources": [...]` section of [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json)
- **Generated XML example**: `src/main/conf/oauth-client-resources-config/sample_oauth.xml`

For correspondence between `resources[]` fields in spec.json and XML elements, see the "Element / Attribute List" above.
To mix `type="java"` implementations, directly specify the FQCN like `"type": "java", "target": "jp.co.intra_mart...."` in spec.json.

## path / target Design Guidelines

- `path` is recommended in the form `/oauth/{feature-name}/{operation-name}` (makes URL design uniform within the project)
- `path` **must not duplicate** a URL in `routing-jssp-config` (risk of conflict in platform-side dispatching)
- Assign one function container per URL. Branch by HTTP method (GET/POST/PUT/DELETE) on the JSSP side by checking `request.getMethod()`
- Write `target` **without extension** (do not add `.js`)

## How to Write `<authz>` and its Relationship to scope

`<authz>` and `<scope>` are **evaluated with AND**. `<authz>` **must** use authorization-resource control via `uri/action` as the **required, standard** approach. Skipping authorization via `welcome-all` (omitting `<authz>` or falling back) is prohibited. Confirm with the user at skill execution time that authorization resources will be defined, on the premise that `<authz>` is specified.

### Evaluation Flow

| `<authz>` | `<scope>` | Result |
|-----------|-----------|------|
| Pass | Pass | The resource implementation's `init` is called |
| Fail | - | 403 Forbidden (init not called) |
| - | Fail (insufficient scope) | 403 Forbidden / `invalid_scope` |

### `<authz uri="service://..." action="execute" />` — Controlled by Authorization Resource URI/action (required, standard)

```xml
<client-resource id="..." path="..." type="jssp" target="...">
  <authz uri="service://sample_oauth/get_user" action="execute" />
  <scope id="..." />
</client-resource>
```

- Determines that the token owner user has access to the authorization resource URI
- **Authorization resource import materials must be separately prepared** (each XML of policy / resource / resource-group / subject-group)
  - If not prepared, API calls after deployment will **always fail with 403**
  - Generation is delegated to the `jssp-tenant-setup-generator` skill
- Enables fine-grained access control per role or user
- **Skipping authorization via `welcome-all` is prohibited.** When `spec.json` specifies `"authz": "welcome-all"` or omits the `authz` field, `build-oauth.js` aborts with an error

### `uri/action` Naming Rule

| Segment | Content | Example |
|-----------|------|-----|
| `service://` | Fixed scheme for authorization resource URI | `service://` |
| `{feature-name}/` | Corresponds to feature directory name | `sample_oauth/` |
| `{API-name}` | API file name (without extension) | `get_user` |
| `action=` | Name representing the operation. Mostly `execute` | `execute` |

Example: `<authz uri="service://sample_oauth/get_user" action="execute" />`

## Checklist (Self-Check of Standalone Configuration File)

> The workflow check at skill execution time (requirements interview / final integrity check) is in steps 1 / 8 of `SKILL.md`.
> Here, only items to be checked **when looking at the configuration file alone** are listed.

- [ ] Is `client-resource/@path` unique within the project (not duplicated with URLs in routing-jssp-config)?
- [ ] Is `client-resource/@target` a path without extension starting from `src/main/jssp/src/`?
- [ ] Does the corresponding `.js` file exist at `src/main/jssp/src/{target}.js`?
- [ ] Does `<scope id="...">` match the ID defined in `oauth-client-scopes-config`?
- [ ] Is a **scope representing write permission** assigned to write resources (POST/PUT/DELETE)?
- [ ] Is `<authz uri="service://..." action="execute" />` explicitly written on each `<client-resource>` (not skipping authorization via `welcome-all`)?
- [ ] Do the authorization resource import materials corresponding to the specified `uri/action` exist?
