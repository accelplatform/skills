# Authorization Subject Group XML Specification

Defines "candidate groups to be displayed in the subject column of an authorization policy".
These appear as **pull-down candidates** when users configure authorization on the intra-mart administration screen.

## Namespace

```xml
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  ...
</subject-groups>
```

**The root element is `<subject-groups>`** (not `<root>`). Take care.

## Base file (`<key>-authz-subject-group.xml`)

Defines only `sort-key` and `expression`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  <authz-subject-group sort-key="900">
    <expression>S(b_m_role:app_manager)</expression>
  </authz-subject-group>
</subject-groups>
```

| Attribute / child element | Required | Description |
|---------------------------|----------|-------------|
| `sort-key` attribute | YES | Display order (smaller values come first). 100-999 is conventionally used |
| `<expression>` | YES | subject expression (such as `S(b_m_role:...)`). Identical to the subject syntax in `authz-policy.md` |

## Language-specific files (`<key>-authz-subject-group_<locale>.xml`)

Matched by `expression`, with a display name attached.

```xml
<authz-subject-group sort-key="900">
  <display-name>
    <name locale="ja">Any App 管理者</name>
  </display-name>
  <expression>S(b_m_role:app_manager)</expression>
</authz-subject-group>
```

Both `sort-key` and `<expression>` serve as the matching keys with the base file.

## Notation in spec.json

```json
"authzSubjectGroups": [
  {
    "sortKey": 900,
    "expression": "S(b_m_role:app_manager)",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## Notes

- The role / user / organization referenced by `expression` must **exist beforehand** (even for roles imported by the same Importer, the order is set up so that role definitions are processed first)
- Assign an independent numeric range of `sort-key` per app so it does not collide with other apps. Since intra-mart standards widely use values between 10 and 10000, new apps should choose values that avoid collision
- Be aware that the root element is `<subject-groups>` in the plural, unlike other XML. Note also that the XML namespace itself is `subject-group` (singular)
