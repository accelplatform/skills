# oauth-client-scopes-config (Scope Configuration)

A configuration file that defines the **access ranges (scopes)** provided by the OAuth provider.
This is the unit at which client applications request consent from users.

## Location

```
src/main/conf/oauth-client-scopes-config/{arbitrary-file-name}.xml
```

After deployment, placed under `WEB-INF/conf/oauth-client-scopes-config/...`.
File names may be split per feature unit or per scope group (e.g., `sample_oauth.xml`, `account_scopes.xml`).

## XML Structure

```
<oauth-client-scopes-config>
  <scopes>
    <scope id="...">                 ← 1 or more, repeatable
      <default-subject>...</default-subject>
      <localizations>
        <localize locale="...">      ← Repeated for each locale you want to provide
          <subject>...</subject>
          <text>...</text>
        </localize>
      </localizations>
    </scope>
  </scopes>
</oauth-client-scopes-config>
```

## Element / Attribute List

| Element / Attribute | Required | Description |
|-------------|:----:|------|
| `oauth-client-scopes-config` (root) | ○ | Namespace `http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config` |
| `scopes` | ○ | Parent element of scope |
| `scope` | ○ | Individual access range. Multiple definitions per file are allowed |
| `scope/@id` | ○ | Unique ID identifying the scope. Referenced from client detail / resource configurations |
| `default-subject` | ○ | Default display name used when no locale-specific display name is available |
| `localizations` | × | Parent element of locale-specific display |
| `localize` | × | One entry of locale-specific display |
| `localize/@locale` | ○ | Locale ID (e.g., `ja`, `en`, `zh_CN`) |
| `subject` | ○ | scope name shown in the consent screen (per locale) |
| `text` | ○ | scope description shown in the consent screen (per locale) |

## Sample

The XML is automatically generated from `spec.json` by `scripts/build-oauth.js`. The coding agent does not write it by hand.
- **spec.json sample**: The `"scopes": [...]` section of [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json)
- **Generated XML example**: `src/main/conf/oauth-client-scopes-config/sample_oauth.xml`

For correspondence between `scopes[]` fields in spec.json and XML elements, see the "Element / Attribute List" above.

## Naming Rules (Recommended)

- `scope/@id` should be a **unique ID reflecting the application name or feature name**
- Character types: lowercase alphanumerics and underscores (e.g., `account_read`, `equipment_lending`)
- Industry-standard values such as `openid` / `profile` / `email` may be reserved for OpenID Connect, so use different names for custom scopes
- When **separating read / write for a single feature, split the scope** (e.g., `equipment_read`, `equipment_write`)

## Checklist

- [ ] Is `scope/@id` unique within the project?
- [ ] Is `default-subject` not an empty string?
- [ ] Are `<localize>` entries prepared for all locales used (`ja` / `en` / `zh_CN`, etc.)?
- [ ] Are the same `id` referenced by `oauth-client-resources-config` / `oauth-client-details-config`?
