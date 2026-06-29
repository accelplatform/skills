# Menu Group XML Specification

Defines **menu groups** to be displayed in the intra-mart admin menu (sitemap) and the **menu items** under them.

## Namespace

```xml
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  ...
</root>
```

## Structure

Multiple `<menu-group-data>` elements can be placed under the root `<root>`. Each `<menu-group-data>` **contains one top-level `<menu-item>`, inside which menu items are nested**.

```
<root>
  <menu-group-data id="<key>_sm-pc">
    <category id="im_sitemap_pc"/>
    <menu-item .../>          ← Top folder (menu-id matches <menu-group-data>)
      <menu-item .../>        ← Child (item or folder)
      <menu-item ...>         ← Further nested if folder
        <menu-item .../>
      </menu-item>
  </menu-group-data>
</root>
```

## Attributes of `<menu-item>`

| Attribute | Required | Description |
|------|------|------|
| `menu-id` | YES | Unique ID of the menu item. By convention, the `_sm-pc` suffix is used (for PC sitemap) |
| `sort-number` | YES | Display order within the same hierarchy (numeric; smaller values appear higher) |
| `type` | YES | `folder` (has children) or `item` (leaf, URL link) |
| `url` | YES when type=item | Link destination URL. Relative form with the leading `/` removed from the `<authz>` path (e.g. `equip/dashboard/list`) |
| `image-path` | YES | Icon path. Even when not specified, output the attribute as an empty string `""` |
| `method` | YES | HTTP method. Normally `get` |
| `use-iframe` | YES | Whether to open in an iframe. Normally `false` |
| `use-popup` | YES | Whether to open in a popup. Normally `false` |

When `type="folder"`, the `url` attribute is **not output**.

## Category

`<category id="im_sitemap_pc">` refers to the intra-mart standard "Sitemap (for PC)".

This project **targets only `im_sitemap_pc`**. Other categories (mobile, etc.) also exist on the intra-mart side, but this skill set does not cover them.

## Base File (`<key>-menu-group.xml`)

Contains only IDs, attributes, and the hierarchy; display names are not included. **No blank line is inserted between sibling elements** (following the actual examples).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      <menu-item menu-id="equip_master_sm-pc" sort-number="100" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
        <menu-item menu-id="equip_master_equipment_sm-pc" sort-number="10" type="item" url="equip/master/equipment/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## Locale-Specific File (`<key>-menu-group_<locale>.xml`)

Reproduces the same structure and adds `<display-names><display-name locale="..">...</display-name></display-names>` to each `<menu-item>`. **A blank line is inserted between sibling elements for readability** (following the actual examples).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <display-names>
        <display-name locale="ja">社内備品貸出システム</display-name>
      </display-names>

      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false">
        <display-names>
          <display-name locale="ja">ダッシュボード</display-name>
        </display-names>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## Criteria for Selecting Menu Items

Criteria for deciding which screens to include in the menu from the screen list in the specifications.

### Screens to Include (Entry Points)

Only screens that serve as starting points of a business flow become menu items:

| Kind | Examples |
|---|---|
| Dashboard | "Dashboard", "Home", "My Page" |
| List screen | "XXX List", "XXX Management" (screens ending in list) |
| Search screen | "XXX Search" |
| Personal screens | "Application List (mine)", "Approval List (addressed to me)" |
| Statistics / report screens | "Usage Statistics Dashboard", "Report Output" |
| Per-user settings screens | "User Settings", "Notification Settings" |

### Screens to Exclude (Navigation Destinations)

Screens that are opened by internal navigation from entry points are not included in the menu:

| Kind | Reason for Exclusion | Typical Way of Opening |
|---|---|---|
| Detail screen | Navigated from a list row click / search result click | `<a>` link, row double-click |
| Register / edit form screen | Navigated from "New", "Edit" buttons in the list | URL navigation via button onClick |
| Dialog-style screen | Opens as a popup from a parent screen | Modals such as `imdsModal` |
| API endpoint | Not for direct URL access | Called from XHR/fetch |
| Print / preview screen | Displayed in another window from a button on the screen | `window.open`, etc. |

Screens that are explicitly marked as **"dialog style", "form", or "detail display"** in the specifications are basically targets for exclusion.

### Criteria for Bundling with Folders

When there are **two or more** related screens, bundle them with `type="folder"` to form a hierarchy. When there is only one, place it directly at the top level:

| Example | Composition |
|---|---|
| Master series (equipment master / category / storage location) | 3 entries under the `備品マスタ管理` folder |
| Inventory series (execution / history) | 2 entries under the `棚卸管理` folder |
| Usage statistics (only one screen) | Placed at the top without a folder |

### How to Assign sort-number (Recommended Convention)

| Hierarchy | Recommended Step | Example |
|---|---|---|
| Top folder itself (same as `<menu-group-data>` id) | A digit range that makes it easy to interleave with other menus later | `2000` |
| Menu items under the top folder | **Steps of 10** (allowing later insertion) | `10`, `20`, `30`, ... |
| Grouping folder (e.g. master management) | **Steps of 100** (visually separating it from siblings as a different group) | `100`, `110`, `120`, ... |
| Menu items inside a folder | Independently numbered in steps of 10 | `10`, `20`, `30` |

### Decision Flow

While reading the specifications, judge in order:

1. The screen description includes **"dialog style", "form", or "detail display"** → **exclude**
2. The screen ID is described as a "navigation destination" of another screen (e.g. the △△ side of "XXX List → △△ Edit Screen") → **exclude**
3. The screen ID is named in an independently accessible way such as **`-list`, `-search`, `-dashboard`, `-history`, `-preference`** → **include**
4. If you are unsure beyond the above, judge by **"whether it is meaningful to register the URL directly as a bookmark and open it"** (include if Yes)

## Description in spec.json

Each element of the `menuGroups` array corresponds to one `<menu-group-data>`. The `items` can be nested recursively.

```jsonc
"menuGroups": [
  {
    "id": "equip_sm-pc",                       // id of <menu-group-data> (convention: <key>_sm-pc)
    "category": "im_sitemap_pc",               // Default when omitted: "im_sitemap_pc"
    "sortNumber": 2000,                        // sort-number of the top folder
    "type": "folder",                          // Top is always folder (when omitted, auto-detected as folder if items exist)
    "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." },
    "items": [
      {
        "id": "equip_dashboard_sm-pc",
        "sortNumber": 10,
        "url": "equip/dashboard/list",         // Required when type=item
        "displayNames": { "ja": "ダッシュボード", "en": "Dashboard", "zh_CN": "仪表板" }
      },
      {
        "id": "equip_master_sm-pc",
        "sortNumber": 100,
        "type": "folder",                      // Folder with children. url is not needed
        "displayNames": { "ja": "備品マスタ管理", "en": "Equipment Master Management", "zh_CN": "设备主数据管理" },
        "items": [
          { "id": "equip_master_equipment_sm-pc", "sortNumber": 10, "url": "equip/master/equipment/list",
            "displayNames": { "ja": "備品マスタ一覧", "en": "Equipment List", "zh_CN": "设备一览" } }
        ]
      }
    ]
  }
]
```

### Field Options for the spec (Optional values, almost always omittable)

| Field | Default | Description |
|-----------|-----------|------|
| `category` | `im_sitemap_pc` | Sitemap kind |
| `sortNumber` | `10` | Display order |
| `type` | `folder` if `items` exists, otherwise `item` | Auto-detection |
| `imagePath` | `""` | Icon path |
| `method` | `get` | HTTP method |
| `useIframe` | `false` | iframe display |
| `usePopup` | `false` | Popup display |
| `url` | `""` | Link destination for type=item (not output when type=folder) |

## Authorization for Menu Groups

Read permission for a menu group is granted by specifying the **hash value of the menu group ID** as the `resource` of `authz-policy`.

> **The tenant administrator (`tenant_manager`) is auto-granted on every menu group by `build-setup-import.js`**, so there is no need to list it in `authzPolicies`. As in the example below, list only **the other target roles/users** (those instructed by the design document or prompt). See "Default Policy" in [authz-policy.md](authz-policy.md) for details.

```xml
<authz-policy resource="d6f1918fc80494cfee9bfa30e8d179a0d46fd029132ad6a66be211f9f6a91b97"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

The hash value is determined by intra-mart's following logic:

```
SHA-256("im-menu-group://menugroups/" + <id of menu-group-data>)
```

Example: `equip_sm-pc` → `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

When the build script finds `"resource": "REPLACE_WITH_MENU_GROUP_HASH"` or `"resource": "REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>"` in spec.json, it **automatically expands it into the hash value** using the above logic. See [authz-policy.md](authz-policy.md) for the details of the mechanism.

## Notes

- The `id` of `<menu-group-data>` should be named **`<key>_sm-pc`** by intra-mart standard (for PC sitemap). When creating a separate structure for mobile, develop it in parallel as a separate file (`_sm-sp`, etc.)
- The `menu-id` of each `<menu-item>` should also have the `_sm-pc` suffix
- The `url` should have **no leading slash** (like `equip/dashboard/list`). The intra-mart side supplements the servlet context
- `image-path` / `method` / `use-iframe` / `use-popup` **must always be output as attributes** even when empty (required by the intra-mart XSD)
