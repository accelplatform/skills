# oauth-client-details-config (Client Detail Configuration)

A configuration file that registers **client applications** that use OAuth REST-APIs.
It defines the client identifier (`client_id`), secret, grant type, allowed scopes, etc.

## Location

```
src/main/conf/oauth-client-details-config/{arbitrary-file-name}.xml
```

After deployment, placed under `WEB-INF/conf/oauth-client-details-config/...`.
Multiple clients may be defined in one file, but operationally it is easier to identify by splitting into separate files per client (e.g., `sample_oauth.xml`, `partner_app.xml`).

## XML Structure

```
<oauth-client-details-config>
  <client-details>
    <client-detail client-id="..."
        authorized-grant-type="authorization_code|implicit"
        client-secret="..."
        redirect-uri="..."
        access-token-validity-seconds="..."
        icon-path="..."
        code-challenge="NONE|ALL|PLAIN|S256">

      <default-name>...</default-name>

      <localizations>
        <localize locale="...">
          <client-name>...</client-name>
          <description>...</description>
        </localize>
      </localizations>

      <scopes>
        <scope id="..." />
      </scopes>
    </client-detail>
  </client-details>
</oauth-client-details-config>
```

## Element / Attribute List

### `<client-detail>`

| Attribute | Required | Default | Description |
|------|:----:|------------|------|
| `client-id` | ○ | - | Client identifier ID. Sent from the client during OAuth authorization requests |
| `authorized-grant-type` | ○ | - | `authorization_code` (for server-side Web apps) or `implicit` (for SPA / native apps) |
| `client-secret` | △ | - | Required when `authorized-grant-type="authorization_code"` |
| `redirect-uri` | × | - | Client-side redirect endpoint that receives the authorization code. **Recommended for spoofing prevention** |
| `access-token-validity-seconds` | × | `3600` (1 hour) | Access token expiration (seconds) |
| `icon-path` | × | - | Icon shown on the consent screen (80x80 recommended) |
| `code-challenge` | × | `NONE` | PKCE code challenge method. `NONE` / `ALL` / `PLAIN` / `S256` |

### Child Elements

| Element | Required | Description |
|------|:----:|------|
| `default-name` | ○ | Default client display name (locale-independent) |
| `localizations` | × | Parent element of locale-specific display |
| `localize` | × | One entry of locale-specific display |
| `localize/@locale` | ○ | Locale ID (e.g., `ja`, `en`, `zh_CN`) |
| `client-name` | ○ | Locale-specific client display name |
| `description` | ○ | Locale-specific description |
| `scopes` | ○ | Parent element of scopes this client can request |
| `scope` | ○ | Individual scope |
| `scope/@id` | ○ | scope ID defined in `oauth-client-scopes-config` |

## Sample

The XML is automatically generated from `spec.json` by `scripts/build-oauth.js`. The coding agent does not write it by hand.
- **spec.json sample**: The `"clients": [...]` section of [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json)
- **Generated XML example**: `src/main/conf/oauth-client-details-config/sample_oauth.xml`

For correspondence between `clients[]` fields in spec.json and XML elements, see the "Element / Attribute List" above (e.g., spec's `clientId` → XML's `client-id` attribute, `grantType` → `authorized-grant-type`, `codeChallenge` → `code-challenge`, etc.).

## Choice of Grant Type (authorized-grant-type)

| Value | Use | client-secret | Notes |
|----|------|:-------------:|------|
| `authorization_code` | Web apps with a server | Required | Recommended. Obtain code and exchange for access token via server-side communication. Combining with PKCE is desirable |
| `implicit` | SPA / native apps | Not required | Discouraged by specification. Not used in principle in the latest OAuth 2.1. Keep only for compatibility purposes |

## Security Notes

- Since `client-secret` is **written in plaintext in the XML**, this file is subject to Git confidentiality management. Do not directly write production values into the repository; pass them via **`@VARIABLE@`** style filter substitution or overrides during `import`
- If `redirect-uri` is unspecified, authorization code interception attacks (CSRF) may succeed, so **always specify it**
- `code-challenge` is recommended to be `S256` (PKCE support is a countermeasure against authorization code interception)
- `access-token-validity-seconds` should be short according to requirements (e.g., `300`〜`1800`). To make it longer, consider together with refresh token operation

## Checklist

- [ ] Is `client-id` unique within the project / tenant?
- [ ] If `authorized-grant-type="authorization_code"`, is `client-secret` set?
- [ ] Is `redirect-uri` specified (security degrades if unspecified)?
- [ ] Is `<scope id="...">` all defined in `oauth-client-scopes-config`?
- [ ] Have you confirmed whether `client-secret` is a value that can be committed to the repository, or whether it should be replaced by filter substitution?
- [ ] Is `code-challenge` set to `S256` (PKCE support)?
