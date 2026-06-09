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
  <authz-default mapper="..." />                    ← Optional. Fallback when <authz> is omitted
  <client-resources>
    <client-resource id="..." path="..." type="jssp|java" target="...">
      <authz ... />                                 ← Optional. See "How to write <authz>" below (mapper / uri+action)
                                                    ← Omit when it would match <authz-default> (e.g., mapper="welcome-all")
      <scope id="..." />                            ← Required. Repeat to require multiple scopes with AND condition
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

> As with the routing table (`routing-jssp-config`), when `<authz-default mapper="welcome-all" />` is placed at the top, there is no need to write `<authz mapper="welcome-all" />` in each `<client-resource>`. `build-oauth.js` also does not emit `<authz>` when `spec.json` has `authz: "welcome-all"` or omits the `authz` field. Only specify `<authz>` for the (B) case using `uri/action`.

## Element / Attribute List

| Element / Attribute | Required | Description |
|-------------|:----:|------|
| `oauth-client-resources-config` (root) | ○ | Namespace `http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config` |
| `authz-default` | × | Default authorization configuration. Applied to `<client-resource>` where `<authz>` is omitted |
| `authz-default/@mapper` | × | Authorization resource mapper name (e.g., `welcome-all` to allow anyone) |
| `client-resources` | ○ | Parent element of client-resource |
| `client-resource` | ○ | Individual resource definition |
| `client-resource/@id` | ○ | Unique ID for the resource (used for identification in operation logs, etc.) |
| `client-resource/@path` | ○ | Published URL path (e.g., `/oauth/sample_oauth/get_user`) |
| `client-resource/@type` | ○ | `jssp` or `java` |
| `client-resource/@target` | ○ | For `type="jssp"`, path **without extension** starting from `src/main/jssp/src/`.<br>For `type="java"`, FQCN of the implementation class |
| `authz` | × | Authorization resource required to call this URL |
| `authz/@uri` | × | Authorization resource URI (e.g., `service://sample_oauth/get_user`) |
| `authz/@action` | × | Authorization action (mostly `execute`) |
| `authz/@mapper` | × | Authorization resource mapper name (`welcome-all`, etc.) |
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

`<authz>` and `<scope>` are **evaluated with AND**. There are 2 ways to write `<authz>`, and **always confirm which to adopt with the user at skill execution time**.

### Evaluation Flow

| `<authz>` | `<scope>` | Result |
|-----------|-----------|------|
| Pass | Pass | The resource implementation's `init` is called |
| Fail | - | 403 Forbidden (init not called) |
| - | Fail (insufficient scope) | 403 Forbidden / `invalid_scope` |

### (A) Omit `<authz>` — Anyone Can Access (Falls back to `authz-default`)

```xml
<client-resource id="..." path="..." type="jssp" target="...">
  <!-- Do not write <authz> (falls back to authz-default mapper="welcome-all") -->
  <scope id="..." />
</client-resource>
```

- Authorization decision always passes, **controlled only by scope**
- Works with **no additional artifacts**
- **Recommended use case:** PoC, internal use, APIs sufficiently controlled by scope only, when you want to verify operation in the shortest time
- **Disadvantage:** Fine-grained access control per role or user is not possible
- **How to write:** On the assumption that `<authz-default mapper="welcome-all" />` is placed at the top, **do not write `<authz>` itself**. Writing `<authz mapper="welcome-all" />` explicitly is redundant and should be avoided (same convention as routing-jssp-config). When `spec.json` specifies `"authz": "welcome-all"` or omits the `authz` field, `build-oauth.js` will automatically not emit `<authz>`

### (B) `<authz uri="service://..." action="execute" />` — Controlled by Authorization Resource URI/action

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
- **Recommended use case:** Production operations, APIs where multiple roles are mixed and scope alone is insufficient
- **Disadvantage:** Must also generate and maintain authorization resource definition import materials

### `uri/action` Naming Rule (When (B) is Chosen)

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
- [ ] Is `<authz>` written appropriately:
  - (A) For the case of allowing `welcome-all`, is the `<authz>` itself **omitted**, falling back to `<authz-default mapper="welcome-all" />` at the top (i.e., not explicitly writing `<authz mapper="welcome-all" />`)?
  - (B) For the case of specifying `uri/action`, do the corresponding authorization resource import materials exist?
