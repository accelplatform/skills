# Role definition XML specification

XML for registering roles (business-level roles). Consists of 4 files: a base file + locale-specific files (ja/en/zh_CN).

## Namespace

```xml
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  ...
</root>
```

## Base file (`<key>-role.xml`)

Defines the role's ID, name, and category. **Do not write the display name.**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <category>any_app</category>
  </role-data>
</root>
```

| Attribute / Child element | Required | Content |
|--------------|------|------|
| `name` attribute | YES | Role name (system-internal name). Duplicates not allowed |
| `id` attribute | YES | Role ID (short alphanumeric). Referenced by the subject expression `S(b_m_role:<id>)`. **Must be 20 characters or less** |
| `<category>` | NO | Role category. May be empty |

**Character-count restriction on role ID:**
- The role ID must fit within **20 characters** (intra-mart restriction)
- Exceeding 20 characters causes an error during Importer execution
- Examples: `equip_admin` (11 chars OK), `equip_accounting` (16 chars OK), `some_very_long_role_name` (24 chars NG)

## Locale-specific files (`<key>-role_<locale>.xml`)

Describe only the display name. `name` / `id` must be the same as in the base (matching keys).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <display-names>
      <display-name locale="ja">Any App 管理者</display-name>
    </display-names>
  </role-data>
</root>
```

`locale` is one of `ja` / `en` / `zh_CN`. One file per one locale.

## Description in spec.json

```json
"roles": [
  {
    "id": "app_manager",
    "name": "any_app_manager",
    "category": "any_app",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## Notes

- The role `id` is referenced from the authorization policy's `subject` expression `S(b_m_role:<id>)`, so it must exactly match the notation used on the authorization policy side.
- Distinction between `name` and `id`: `name` is the human-readable internal name, while `id` is the short code used in the subject expression and as the primary key in the DB.
- For role names (both `name` and `id`), **use the names specified in the specification document if they are explicit**. If not explicit, you may choose an appropriate name (e.g., `<shortName>_<role type>` or `<key>_<role type>`, etc., with high readability and no collisions with existing roles).
