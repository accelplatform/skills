# Portlet Registration (`portletImport`)

## Overview

A mechanism for generating DML against intra-mart standard tables (`b_m_portlet_*`) to register a JSSP presentation page as a portlet (widget) on a portal screen.

Portlet registration is normally done manually from the portal management screen. The DB records inserted at that time are spread across the following three tables.

| Table | Content |
|---------|------|
| `b_m_portlet_info` | Portlet body (path of the presentation page to display, etc.) |
| `b_m_portlet_mode` | Portlet operation mode (`portlet_mode` is fixed to `EDIT`; whether the portlet is actually viewable/editable is switched via `user_flag`) |
| `b_m_portlet_title_info` | Display name (`name`), application name (`application`), description (`description`) × ja/en/zh_CN |

`build-sample-setup-import.js` generates **actual working DELETE / INSERT statements** (not comment-only placeholders like `<key>-ddl.sql`) into these three tables from `portletImport.portlets` in `spec.json`, and outputs them to `<key>-dml.sql`. It also automatically generates **authz policies granting the tenant manager view/edit permission** (`<key>-authz-policy.xml`) according to the value of `editable` (see below).

## Which Portlets Belong in Sample Data Setup

Sample Data Setup **loads sample data for trying out a module** and is not performed in production environments. Apply the same criterion to portlets.

| Nature of the portlet | Where to register it |
|---|---|
| Always required as a module feature (used in production as well) | Tenant Setup (`jssp-tenant-setup-generator`) |
| For demo / sample display during trial use | **Sample Data Setup (this skill)** |

If the same `portletCd` is registered on the Tenant Setup side, do not redefine it on the sample side (the full refresh would overwrite what the tenant side registered).

## Idempotency: DELETE -> INSERT Full Refresh

Sample Data Setup **runs every time setup is executed**. A plain `INSERT` would violate a unique constraint on the second run, so the generated DML is output in the following order for each portlet.

```sql
DELETE FROM b_m_portlet_title_info WHERE title_type = 'portlet' AND identification_id = '<portletCd>';
DELETE FROM b_m_portlet_mode WHERE portlet_cd = '<portletCd>';
DELETE FROM b_m_portlet_info WHERE portlet_cd = '<portletCd>';

INSERT INTO b_m_portlet_info (...) VALUES (...);
INSERT INTO b_m_portlet_mode (...) VALUES (...);
INSERT INTO b_m_portlet_title_info (...) VALUES (...);   -- name / application / description × 3 locales
```

Both the `DELETE` and `INSERT` statements stay within standard SQL and run as-is on PostgreSQL, Oracle, and SQL Server alike (there is no need to specify `dmlPerDialect`).

The full refresh covers only the three tables this skill manages; it does not touch `b_m_portlet_layout` / `b_m_portlet_display_set` (the out-of-scope tables described below).

## Out of Scope: Portal Placement and Display Settings

The following two tables are **out of scope**. They are **portal operation settings** — "which portal, which column/row, and what display (window status) to place the portlet in" — which is a different concern from the portlet's own definition, so they are not included in the uniform Sample Data Setup DML.

- `b_m_portlet_layout` (placement position on the portal)
- `b_m_portlet_display_set` (window display settings)

When placement on a portal is needed, do it manually from the portal management screen after Sample Data Setup.

## Portlets Do Not Need Routing Configuration or Routing Authorization

A JSSP presentation page displayed as a portlet is invoked directly by the portal feature via `b_m_portlet_info.path`, and — unlike a normal screen — does not go through the routing table under `routing-jssp-config/`. Therefore, **do not create** routing configuration or routing authorization via `file-mapping` / `<authz uri="service://...">`. Access control is handled solely by the `im-portal-portlet` / `im-portal-portlet-editmode` authz policies covered in this reference. See `.claude/skills/jssp-page-generator/assets/simple-portlet.md` and the "Exception Rules for Screens Not Called Through the Routing Table" section in `.claude/rules/jssp-file-structure.md` for details.

## spec.json Structure

```jsonc
"portletImport": {
  "portlets": [
    {
      "portletCd": "portlet_sample",              // Portlet CD (a unique ID of alphanumerics/underscores. Must not collide with an existing CD)
      "path": "portlet_sample/view/index",         // Presentation page to display (path relative to src/main/jssp/src/, no extension)
      "pageParam": "test=1",                       // Optional. Fixed parameter passed to the portlet (page_param). Omit if not needed
      "portletModeCd": "portlet_sample_mode",       // Optional. Defaults to "<portletCd>_mode" if omitted
      "editable": false,                            // Optional. false (default): view only / true: view and edit (see "Switching View/Edit Permissions" below)
      "titles": {
        "name":        { "ja": "サンプルポートレット", "en": "Sample Portlet", "zh_CN": "示例 Portlet" },
        "application": { "ja": "サンプルアプリケーション", "en": "Sample Application", "zh_CN": "示例 Application" },
        "description": { "ja": "説明", "en": "Description", "zh_CN": "说明" }
      }
    }
  ]
}
```

| Field | Required | Description |
|-----------|------|------|
| `portletCd` | YES | The portlet's unique CD. Specify an alphanumeric/underscore ID that does not collide within the tenant. **The intra-mart standard `b_m_portlet_info.portlet_cd` column is VARCHAR(20), so keep it to 20 characters or fewer** (exceeding this causes the sample data setup import to fail with `value too long for type character varying(20)`; `build-sample-setup-import.js` raises an error at build time if it is exceeded) |
| `path` | YES | Path of the JSSP presentation page displayed as the portlet (same format as the `page` attribute in routing config) |
| `pageParam` | NO | Fixed query parameter string passed to `init(request)` of the portlet. Defaults to an empty string when omitted |
| `portletModeCd` | NO | CD for `b_m_portlet_mode`. Defaults to `<portletCd>_mode` when omitted. This is likewise capped at **20 characters or fewer**, since `b_m_portlet_mode.portlet_mode_cd` is also VARCHAR(20) (the `_mode` suffix adds 5 characters, so keeping `portletCd` to 15 characters or fewer is a safe margin) |
| `editable` | NO | `false` (default): view only (no one other than the creator can edit) / `true`: both view and edit possible. See "Switching View/Edit Permissions" for details |
| `titles.name` | YES (3 locales) | The portlet's display name (title shown in the header) |
| `titles.application` | YES (3 locales) | The portlet's category name (classification name in the add-portlet dialog) |
| `titles.description` | YES (3 locales) | The portlet's description |

## Fixed Values in the Generated DML

This mechanism is specifically for **portlets that simply display a JSSP presentation page** (`imart.PresentationPagePortlet`). The following values are output as fixed and cannot be changed from spec.json.

| Column | Fixed value | Notes |
|--------|--------|------|
| `producer_id` | empty string | |
| `page_kind` | `pagebase` | Fixed as JSSP page-based |
| `menulinkset_cd` | empty string | |
| `application_id` / `service_id` | empty string | Out of scope for other types such as JavaEE framework portlets |
| `sso_flag` | `0` | |
| `title_bar_flag` | `1` | Title bar shown |
| `cache_config` | `0` | |
| `entity_id_prefix` | `imart\|PresentationPagePortlet` | |
| `open_flag` / `user_portal_flag` / `group_portal_flag` | `1` | Usable in both user portals and group portals |
| `portlet_height` | `-1` | Auto-adjust |
| `rec_user_cd` | `system` | |
| `rec_date` | Build execution time | Date/time when `build-sample-setup-import.js` was run. **`rec_date` is not a timestamp type but a varchar type, with a fixed `yyyy/MM/dd\|HH:mm:ss` format** (note that this is not a standard SQL date/time literal) |
| `portlet_mode` (`b_m_portlet_mode`) | `EDIT` | Fixed value on the intra-mart side |
| `access_check_flag` (`b_m_portlet_mode`) | `0` | |

Only `user_flag` (`b_m_portlet_mode`) varies based on `editable` (see the next section).

Other portlet types (JavaEE framework portlets, RSS portlets, etc.) and full automation that also includes placement on a portal are out of scope for this mechanism. Add the DML manually, or consult the user individually.

## Switching View/Edit Permissions (`editable`)

"Who can view/edit" a portlet is controlled by the combination of `b_m_portlet_mode.user_flag` and authz policies (`type="im-portal-portlet"` / `type="im-portal-portlet-editmode"`).

The authz policies and authz resources (both `im-portal-portlet` and `im-portal-portlet-editmode`) are **always generated regardless of the value of `editable`**. `editable` only affects `b_m_portlet_mode.user_flag` (whether the edit operation itself is actually allowed). This means switching `editable` from `false` to `true` later requires no regeneration of the authorization materials (the tenant manager already holds the edit-permission policy from the start; while `user_flag=0`, the portlet itself is in view-only mode, so the edit operation is blocked regardless).

| `editable` | `user_flag` | Meaning | Authz policies / resources generated |
|---|---|---|---|
| `false` (default) | `0` | View only. The portlet itself is in a non-editable mode | Both `im-portal-portlet` / `im-portal-portlet-editmode` are `PERMIT` for the tenant manager (but the edit operation cannot actually be performed because `user_flag=0`) |
| `true` | `1` | Both view and edit are possible | Same as above (both `im-portal-portlet` / `im-portal-portlet-editmode` are `PERMIT` for the tenant manager) |

### How the Authz Resource ID (Hash Value) Is Computed

The `resource` attribute for `im-portal-portlet` / `im-portal-portlet-editmode` is a SHA-256 hash value computed from the portlet CD, not a human-readable ID. intra-mart internally hashes the following base strings.

```
View permission: sha256("im-portal-portlet://" + portletCd)
Edit permission: sha256("im-portal-portlet-editmode://" + portletCd)
```

`build-sample-setup-import.js` implements this computation as `computePortletViewHash(portletCd)` / `computePortletEditHash(portletCd)`, and automatically outputs it as a default policy (`PERMIT` for the tenant manager) into `<key>-authz-policy.xml` (the same mechanism as the default policy auto-grant for `spec.menuGroups`). To grant permission to roles/users other than the tenant manager, explicitly specify `type: "im-portal-portlet"` or `type: "im-portal-portlet-editmode"` with `resource` set to the hash value above in `spec.authzPolicies` (the hash value can be computed with e.g. `node -e "console.log(require('crypto').createHash('sha256').update('im-portal-portlet://' + '<portletCd>').digest('hex'))"`).

### Auto-Generation of the Authz Resource (`<key>-authz-resource.xml`)

`authz-policy` entries have no `id` and write the hash value above directly into the `resource` attribute, so **without further action this portlet would not appear in the authorization resource tree in the admin screen** (the policy would be left dangling with nothing to attach to). To address this, `build-sample-setup-import.js` also auto-generates a corresponding `authz-resource` entry from `portletImport.portlets` into `<key>-authz-resource.xml` (plus the per-locale files).

- The `id` attribute is **always the same hash value** as the `resource` attribute of the `authz-policy` (using a human-readable id here would make it fail to match the authz-policy side, so the resource and policy would not be linked)
- The `uri` attribute is `im-portal-portlet://<portletCd>` / `im-portal-portlet-editmode://<portletCd>`
- `<parent-group>` specifies the intra-mart standard built-in group `im-portal-portlet` / `im-portal-portlet-editmode` (no predefinition needed — it is assumed to already exist)
- The display name reuses the value of `titles.application` as-is; the edit-mode entry appends a locale-specific suffix (`ja`: `（編集モード）` / `en`: ` (Edit Mode)` / `zh_CN`: `（编辑模式）`)
- Even if `spec.authzResources` is empty, `<key>-authz-resource.xml` (plus per-locale files) is generated as long as `portletImport.portlets` exists, and it is automatically wired into `<tenant-master>` of `import-<artifactId>-config.xml` as an `<authz-resource-file>`

## Integration into the Output File

`portletImport` is output into the same `<key>-dml.sql` as the existing `database` section (DDL/DML for proprietary tables). A DML file is generated from `portletImport` alone even without `spec.database`, and it is automatically wired into `<database><insert-file>` of `import-<artifactId>-config.xml`. DDL (`<key>-ddl_*.sql`) is a mechanism for proprietary tables, so it is not generated when only `portletImport` is present.
