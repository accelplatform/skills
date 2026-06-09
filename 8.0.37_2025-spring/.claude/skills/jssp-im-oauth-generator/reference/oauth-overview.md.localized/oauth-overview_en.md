# im_oauth REST-API Overview

intra-mart Accel Platform has a built-in OAuth 2.0 provider feature (`im_oauth_provider`), which can publish REST-APIs with OAuth authorization to external client applications.
In JSSP (Script Development Model), function containers are registered as "resource implementations" and mapped to access URLs via `oauth-client-resources-config`.

## Required Artifacts (4 Types)

To add a single REST-API published via OAuth, you need to prepare the following 4 files.

| # | Type | Location | Role |
|---|------|--------|------|
| 1 | Scope definition XML | `src/main/conf/oauth-client-scopes-config/{arbitrary-file-name}.xml` | Defines access ranges (scopes) |
| 2 | Resource URL configuration XML | `src/main/conf/oauth-client-resources-config/{arbitrary-file-name}.xml` | URL ↔ JSSP resource (or Java class) mapping, required scope declaration |
| 3 | Client detail configuration XML | `src/main/conf/oauth-client-details-config/{arbitrary-file-name}.xml` | Client applications allowed to access (client_id / client_secret / grant type / used scopes) |
| 4 | Resource implementation .js | `src/main/jssp/src/{feature-name}/oauth/{file}.js` | Actual REST-API processing (init function) |

> **Note:** Configuration files placed under `src/main/conf/` are assumed to be placed under `WEB-INF/conf/...` in the WAR after build and deployment. The `WEB-INF/conf/...` notation in the official intra-mart reference refers to the deployed path; the source in this project refers to `src/main/conf/...`.

## Differences from Regular JSSP REST-API (via routing-jssp-config)

| Aspect | Regular REST-API | OAuth REST-API |
|------|----------------|----------------|
| URL mapping | `<file-mapping>` in `src/main/conf/routing-jssp-config/*.xml` | `<client-resource path="..." target="..." />` in `oauth-client-resources-config` |
| Authentication | Tenant login session (Cookie) | OAuth access token (`Authorization: Bearer ...`). Verified by the platform |
| Authorization | `<authz>` URI/action specification (optional) | Choose `welcome-all` (allow anyone) or `uri/action` (controlled by authorization resource) in `<authz>`. Additionally, the access token's **scope** must match `<scope id>` in `<client-resource>` (AND evaluation) |
| CSRF countermeasure (secure token) | Required for write APIs | **Not required** (the OAuth token functions as authentication. Do not add `X-Intramart-Secure-Token` verification) |
| Authenticated user retrieval | `Contexts.getAccountContext()` | Also `Contexts.getAccountContext()`. The context of the token owner user is set |
| `.html` pair file | Required if it's a screen | **Not required** (because it's not a presentation page) |

## Endpoint URL Format

The value written in `<client-resource path="...">` of `oauth-client-resources-config` is used directly as the published URL path.
Client applications access in the following format:

```
GET {context-path}{path}
Authorization: Bearer <access-token>
```

Examples of `{path}`:
- `<client-resource path="/oauth/jssp/sample" ... />` → `https://example.com/imart/oauth/jssp/sample`
- `<client-resource path="/oauth/sample_oauth/get_user" ... />` → `https://example.com/imart/oauth/sample_oauth/get_user`

> Within the project, URLs starting with `/oauth/...` are conventional (the actual URL prefix depends on the dispatcher implementation of the OAuth provider feature, so verify operation after deployment).

## Relationship between scope and authz (Important)

Access control for OAuth REST-APIs is performed in **2 stages** (AND evaluation).

1. **Access token scope check**: Access tokens that clients obtain via the authorization code flow are linked to the set of scopes the user agreed to. Must exactly match `<scope id="...">` in `<client-resource>`
2. **Authorization (authz) check**: Specified by `<authz>` in `<client-resource>`. Two ways to write:
   - (A) Omit `<authz>` (falls back to `<authz-default mapper="welcome-all" />` at the top) ... Authorization decision always passes (controlled by scope only). **Works with no additional artifacts**. Writing `<authz mapper="welcome-all" />` explicitly is redundant and should be avoided (same convention as routing-jssp-config)
   - (B) `<authz uri="service://..." action="execute" />` ... Controlled per-role/user by authorization resource URI/action. **Requires separately prepared authorization resource import materials** (always returns 403 if not prepared)

If both are not satisfied, the platform returns 401 / 403 before calling the application's `init`.
For (A)(B) selection criteria, see "How to Write `<authz>`" in `oauth-resources-config.md`.

## 4-Step Work Order

1. **Decide scope** → Write `oauth-client-scopes-config`
2. **Decide resource URL (path) and JSSP file path (target)** → Write `oauth-client-resources-config` (reference 1 via `<scope>`)
3. **Decide client details** (client_id / client_secret / scopes used) → Write `oauth-client-details-config` (reference 1 via `<scope>`)
4. **Implement JSSP (.js)** → Place at the path specified by `target` in 2

## Related References

- `oauth-scopes-config.md` - How to write scope configuration XML
- `oauth-resources-config.md` - How to write resource URL configuration XML
- `oauth-client-details-config.md` - How to write client detail configuration XML
- `oauth-resource-implementation.md` - JSSP (.js) implementation rules

## Primary Information

- intra-mart Accel Platform OAuth Programming Guide
  - "How to provide resources on intra-mart Accel Platform (Script Development Model)"
    `https://document.intra-mart.jp/library/iap/public/im_oauth/im_oauth_programming_guide/texts/script/index.html`
- Configuration file reference
  - `oauth-client-scopes-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-scopes-config/index.html`
  - `oauth-client-resources-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-resources-config/index.html`
  - `oauth-client-details-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-details-config/index.html`
