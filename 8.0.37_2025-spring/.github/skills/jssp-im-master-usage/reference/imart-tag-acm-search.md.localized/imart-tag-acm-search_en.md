---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART imACMSearch Tag Reference

## Overview

The `<imart type="imACMSearch" />` tag generates an object that displays the IM-Common Master search screen as a popup.
Use the `open` method of the generated object to display the search screen as a popup; the search results are passed as arguments to the callback function in object form.

## Attribute List

| Attribute | Type | Default | Description |
|------|------|-----------|------|
| name | String | `"imACMSearch"` | Name of the generated object |
| noscript | Boolean | false | If `true`, scripts are not loaded |

## Parameter List

Set on the object passed to the `open` method.

### Required Parameters

| Parameter | Type | Description |
|-----------|------|------|
| callback_function | String | Callback function name |

### Main Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|-----------|------|
| tabs | Array | - | Tab set to use. Array of `{id, title}`. Required when `target` is not specified |
| target | String | - | Search target (plugin ID). Omitting this and specifying `tabs` explicitly shows only the specified tabs |
| prop | Object | - | Information (fields) to retrieve. Tab ID as key, array of field names as value |
| default_tab_id | String | - | Initial focus tab (specify the tab `id`) |
| type | String | - | Selection mode. `"single"` (single) / `"multiple"` (multiple) |
| wnd_title | String | - | Window title |
| message | String | - | Title bar message |
| wnd_close | Boolean | - | Whether to close the window after selection |
| width | Number | - | Window width |
| height | Number | - | Window height |
| basic_area | String | - | Basic condition area setting |
| target_date | Date | - | Search reference date |
| target_locale | String | - | Display locale |
| deleted_data | Boolean | false | Whether to include deleted data |
| default_selected | Array | - | Initially selected objects |

### User Search-Specific Parameters

| Parameter | Type | Default | Description |
|-----------|------|-----------|------|
| additional_disp | Boolean | - | Whether to display supplementary information |
| additional_user_search_name | Boolean | - | Whether to display search name |
| additional_dept | Boolean | - | Whether to display affiliation |

## Search Screen Tab Plugin IDs

### User Search

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.user.list_user` | User (Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.user.list_user_non_authz` | User (Keyword, no authorization consideration) |
| `jp.co.intra_mart.master.app.search.tabs.user.list_department` | User (Company/Department, Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_department` | User (Company/Department, Tree) |
| `jp.co.intra_mart.master.app.search.tabs.user.list_public_group` | User (Public Group, Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_public_group` | User (Public Group, Tree) |
| `jp.co.intra_mart.master.app.search.tabs.user.list_private_group` | User (Private Group) |
| `jp.co.intra_mart.master.app.search.tabs.user.list_role` | User (Role) |

### Company / Department Search

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.company.list` | Company (Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.department_set.tree` | Department Set (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.department.list` | Department (Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.department.tree` | Department (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.company_post.tree` | Position (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.department_post.tree` | Department / Position (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.attached_department_post.tree` | Affiliated Position (Tree) |

### Public Group Search

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.public_group.list` | Public Group (Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.public_group.tree` | Public Group (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.public_group_set_role.tree` | Role (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.public_group_role.tree` | Public Group / Role (Tree) |
| `jp.co.intra_mart.master.app.search.tabs.attached_public_group_role.tree` | Affiliated Role (Tree) |

### Other Searches

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.private_group.list` | Private Group |
| `jp.co.intra_mart.master.app.search.tabs.role.list` | Role |
| `jp.co.intra_mart.master.app.search.tabs.account.list` | Account (Keyword) |
| `jp.co.intra_mart.master.app.search.tabs.application_role.list` | Application Role |

### Composite Searches

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.department_and_role.tree_and_list` | Department + Role |
| `jp.co.intra_mart.master.app.search.tabs.department_and_user_category_item.tree_and_list` | Department + User Category Item |
| `jp.co.intra_mart.master.app.search.tabs.public_group_and_role.tree_and_list` | Public Group + Role |

### Smartphone

| Plugin ID | Description |
|-------------|------|
| `jp.co.intra_mart.im_master.app.search.tabs.user.department.tree_with_list.smartphone` | User Search (Department Tree) |

## Callback Function Arguments

An array of objects is passed to the callback function. The structure of each element is as follows.

| Property | Type | Description |
|-----------|------|------|
| keyFields | String[] | Field names that uniquely identify the object |
| displayName | String | String for display on screen |
| deleteFlag | Boolean | Logical deletion flag |
| type | String | Data type (base table name) |
| data | Object | Contents of the record retrieved from the database |
| basic_info | Object | Basic condition information |

### Main Fields in the data Object

Shows the `type`, `keyFields`, and default fields included in `data` for each search tab.
Fields additionally specified in the `prop` parameter are also included in `data`.

#### User Search

| Item | Value |
|------|------|
| type | `imm_user` |
| keyFields | `["user_cd"]` |

| Field | Description |
|-----------|------|
| user_cd | User code |
| user_name | User name |
| delete_flag | Deletion flag |

#### Department Search

| Item | Value |
|------|------|
| type | `imm_department` |
| keyFields | `["company_cd", "department_set_cd", "department_cd"]` |

| Field | Description |
|-----------|------|
| company_cd | Company code |
| department_set_cd | Department set code |
| department_cd | Department code |
| department_name | Department name |
| delete_flag | Deletion flag |

#### Company Search

| Item | Value |
|------|------|
| type | `imm_company` |
| keyFields | `["company_cd"]` |

| Field | Description |
|-----------|------|
| company_cd | Company code |
| department_set_cd | Department set code |
| department_cd | Department code |
| department_name | Department name |
| delete_flag | Deletion flag |

#### Public Group Search

| Item | Value |
|------|------|
| type | `imm_public_grp` |
| keyFields | `["public_group_set_cd", "public_group_cd"]` |

| Field | Description |
|-----------|------|
| public_group_set_cd | Public group set code |
| public_group_cd | Public group code |
| public_group_name | Public group name |
| delete_flag | Deletion flag |

#### Private Group Search

| Item | Value |
|------|------|
| type | `imm_private_grp` |
| keyFields | `["private_grp_cd"]` |

| Field | Description |
|-----------|------|
| private_group_cd | Private group code |
| user_cd | User code |
| private_group_name | Private group name |

#### Role Search

| Item | Value |
|------|------|
| type | `b_m_role_b` |
| keyFields | `["role_id"]` |

| Field | Description |
|-----------|------|
| role_id | Role ID |

#### Account Search

| Item | Value |
|------|------|
| type | `b_m_account_b` |
| keyFields | `["user_cd"]` |

| Field | Description |
|-----------|------|
| user_cd | User code |

#### Application Role Search

| Item | Value |
|------|------|
| type | `application_role` |

| Field | Description |
|-----------|------|
| name | Application role name |
| type | Role type |
| applicationId | Application ID |
| applicationName | Application name |
| license | License |

## Usage Examples

### User Search (Keyword only, single selection)

```html
<imart type="head">
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />

  <script>
    // User name click event
    document.getElementById(':userName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
          title: 'Keyword'
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
        },
        callback_function           : 'callbackFromImMaster',
        wnd_title                   : 'User Search',
        message                     : 'User Search',
        wnd_close                   : true,
        type                        : 'single'
      };

      // Open the search screen
      imACMSearch.open(parameter);
    });

    // Callback function
    function callbackFromImMaster(result) {
      if (result.length > 0) {
        console.log(result[0].data.user_code, result[0].data.user_name);
      } else {
        console.log('No user selected');
      }
    }
    // Place function in global scope
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>
```

### User Search (Keyword + Department Tree, multiple selection)

```html
<imart type="head">
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />

  <script>
    // User name click event
    document.getElementById(':userName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id: 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
          title: 'Keyword'
        }, {
          id: 'jp.co.intra_mart.master.app.search.tabs.department.tree',
          title: 'Department (Tree)'
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
        },
        default_tab_id    : 'jp.co.intra_mart.master.app.search.tabs.department.tree',
        callback_function : 'callbackFromImMaster',
        wnd_title         : 'User Search',
        wnd_close         : true,
        type              : 'multiple'
      };

      // Open the search screen
      imACMSearch.open(parameter);
    });

    // Callback function
    function callbackFromImMaster(result) {
      for (let i = 0; i < result.length; i++) {
        console.log(result[i].data.user_cd, result[i].data.user_name);
      }
    }
    // Place function in global scope
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>
```

## Notes

- The `<imart type="imACMSearch" />` tag must be placed inside the HTML `<head>` tag
- The callback function must be defined in the global scope (it cannot be referenced inside immediately invoked functions)
- Specifying `target` enables all tabs associated with that target. To show only specific tabs, omit `target` and use `tabs` to specify them
- Setting `target` incorrectly may cause a parseJSON error
- Field names passed to `prop` must match the keys returned by the tab implementation
