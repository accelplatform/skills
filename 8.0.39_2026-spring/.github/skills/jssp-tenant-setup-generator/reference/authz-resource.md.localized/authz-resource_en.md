# Authorization Resource / Resource Group XML Specification

Defines the **resources** (units that hold a URI) targeted by authorization, and the **resource groups** (hierarchy) that bundle them.

## Authorization resource group

### Namespace

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">
  ...
</root>
```

### Base file (`<key>-authz-resource-group.xml`)

Defines only the ID and the parent group.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">
  <authz-resource-group id="any-app-content-root">
  </authz-resource-group>

  <authz-resource-group id="any-app-http-services">
    <parent-group id="http-services" />
  </authz-resource-group>
</root>
```

| Attribute / child element | Required | Description |
|---------------------------|----------|-------------|
| `id` attribute | YES | Group ID (kebab-case recommended) |
| `<parent-group>` | NO | ID of the parent group. Standard groups (such as `http-services`) can be specified |

### Language-specific files (`<key>-authz-resource-group_<locale>.xml`)

Describe only the display name.

```xml
<authz-resource-group id="any-app-http-services">
  <display-name>
    <name locale="ja">Any App</name>
  </display-name>
</authz-resource-group>
```

## Authorization resource

### Namespace

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  ...
</root>
```

### Base file (`<key>-authz-resource.xml`)

Defines the ID, URI, and parent group.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  <authz-resource id="any-app-content-maintenance" uri="service://any_app/maintenance/content">
    <parent-group id="any-app-http-services" />
  </authz-resource>
</root>
```

| Attribute / child element | Required | Description |
|---------------------------|----------|-------------|
| `id` attribute | YES | Resource ID. Referenced from the `resource` attribute of `authz-policy` |
| `uri` attribute | YES | Resource URI. **This project supports only `service://...`** (see "URI scheme" below) |
| `<parent-group>` | YES | ID of the resource group it belongs to |

### Language-specific files (`<key>-authz-resource_<locale>.xml`)

Matched by `uri`, and describe only the display name (no `id` attribute required).

```xml
<authz-resource uri="service://any_app/maintenance/content">
  <display-name>
    <name locale="ja">Any App コンテンツ管理</name>
  </display-name>
</authz-resource>
```

## URI scheme

This project uses only `service://`.

| Scheme | Purpose |
|--------|---------|
| `service://<key>/<path>` | HTTP / internal services (all authorization targets, including processes invoked from screens, APIs, and jobs) |

intra-mart may have other authorization resource URI schemes, but this skill set targets only `service://` and expresses all processes including screens and routing using `service://`.

## Notation in spec.json

```json
"authzResourceGroups": [
  { "id": "any-app-content-root", "displayNames": { ... } },
  { "id": "any-app-http-services", "parentGroup": "http-services",
    "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } }
],

"authzResources": [
  {
    "id": "any-app-content-maintenance",
    "uri": "service://any_app/maintenance/content",
    "parentGroup": "any-app-http-services",
    "displayNames": {
      "ja": "Any App コンテンツ管理",
      "en": "Any App Content Maintenance",
      "zh_CN": "Any App 内容管理"
    }
  }
]
```

## Notes

- The group ID referenced by `authzResources[].parentGroup` must either exist in `authzResourceGroups` or be the intra-mart standard group `http-services` (this project uses only `http-services`)
- The mapping between resource ID and URI must be **1:1** (do not assign multiple IDs to the same URI)
- Language-specific files match by the `uri` attribute, not the `id` attribute (take care not to diverge from the base file)
