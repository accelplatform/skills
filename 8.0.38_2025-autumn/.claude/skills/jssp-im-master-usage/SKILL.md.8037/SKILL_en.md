---
name: jssp-im-master-usage
description: Generates code for calling IM common master search (imACMSearch) search dialogs. Provides popup implementation patterns for user search, organization search, company search, public group search, role search, etc. Use when mentioning user search, organization selection, master search, user selection dialog, selecting an employee, or searching a department. Never write imACMSearch tag parameters or callback structures from memory — always refer to the reference in this skill.
---

# IM Common Master Search Code Generation Skill

## Overview

A skill set for generating code to call search dialogs using IM common master search (imACMSearch) in intra-mart Accel Platform.
Implements popup calls for various master search screens such as user search, organization search, company search, and public group search.

## Application Policy

**Whenever a screen needs to let the user select an IM common master value (user / department / company / public group / private group / role), this skill must be used to embed a master search dialog.** Do not build a custom `<input type="text">` or `<select>` that requires the user to type a code by hand.

Reasons:

- Manual typing of user codes, department codes, etc. is error-prone and allows nonexistent codes to leak through
- Custom inputs cannot follow organization changes or personnel reassignments
- imACMSearch provides standard support for multi-language display, permission control, and tree/keyword switching out of the box

When generating screens with `jssp-im-workflow-usage` or `jssp-page-generator` and this case arises, combine this skill with them.

## Conventions to Reference

This skill generates HTML snippets (with `imACMSearch` calls) that get embedded into screens. It does not generate `.js` on its own, so the relevant conventions are HTML-centric. See `.claude/rules/README.md` for the full picture.

| Convention | Handling |
|------------|----------|
| `jssp-presentation-page.md` | 🟢 **Required** — HTML structure, id naming |
| `jssp-naming.md` / `jssp-file-structure.md` | 🟢 Required |
| References in the `jssp-imds-theme` skill | 🟢 Required (do not write imds class names from memory) |
| `jssp-function-container.md` / `jssp-2way-sql.md` / `jssp-error-handling.md` etc. | 🔴 **Not needed for this skill alone** (the calling skill applies them) |
| `jssp-accessibility.md` | 🟠 **Business-requirement-dependent** — the master search dialog already has basic ARIA via the imds standard implementation, so additional thick layering is usually unnecessary |

## Finished Sample Assets

- `assets/user-search.md` — Finished user search (HTML snippet)
- `assets/company-search.md` — Finished company search (HTML snippet)
- `assets/department-search.md` — Finished organization search (HTML snippet)
- `assets/public-group-search.md` — Finished public group search (HTML snippet)
- `assets/private-group-search.md` — Finished private group search (HTML snippet)
- `assets/role-search.md` — Finished role search (HTML snippet)

## References

- `reference/imart-tag-acm-search.md` — API reference for the `imACMSearch` tag (parameters, plugin IDs, callback structure)

## When to Use

When the user makes requests such as:
- "Add user search"
- "Implement an organization selection dialog"
- "Add a master search popup"
- "Create a user selection field"

## Implementation Steps

### Requirements Gathering

Confirm the following:
- **Search target**: User / Organization / Company / Public group / Role / Other
- **Selection mode**: Single selection (single) / Multiple selection (multiple)
- **Tabs to use**: Keyword search / Tree search / Multiple tabs
- **Fields to retrieve**: Code, name, and other required fields
- **Placement**: Adding to an existing screen or a new screen

### Reference Lookup

Load `reference/imart-tag-acm-search.md` and confirm the following:
- Plugin ID corresponding to the search target
- Data fields available in the callback function
- Required parameter settings

### Code Generation

Generate code based on the finished sample in `assets/user-search.md`, using the following structure:

#### Head section (inside `<imart type="head">`)

```html
<imart type="head">
  <!-- Tag for calling the IM common master search screen -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 1. Event listener to open the search dialog
    // 2. Call to imACMSearch.open(parameter)
    // 3. Definition of the callback function
    // 4. Registration of the callback function to window
  </script>
</imart>
```

#### Body section (form elements)

```html
<!-- Hidden field (for storing the code value) -->
<input type="hidden" id=":xxxCode:" value="">
<!-- Display field (name display + magnifying glass icon) -->
<input type="text" id=":xxxName:" placeholder="..." class="imds-textbox" readonly value="">
<span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
```

### Mandatory Implementation Rules

- Place `<imart type="imACMSearch" />` always inside `<imart type="head">`
- Define callback functions in global scope (register with `window.functionName = functionName`)
- Explicitly specify plugin IDs in `tabs` and display only the necessary tabs
- Ensure field names specified in `prop` match the keys returned by the tab implementation
- Make display fields `readonly` to allow selection only via the dialog
- In multiple selection mode (`type: 'multiple'`), store the `result` from the callback in a variable and pass it as the `default_selected` parameter on re-search to restore previously selected items in the dialog

## Search Target-Specific Settings

### User Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.user.list_user`
- prop: `['user_cd', 'user_name']`
- Retrieved in callback: `result[i].data.user_cd`, `result[i].data.user_name`
- Finished sample: See `assets/user-search.md`

### Organization Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.department.list` (keyword) / `.tree` (tree)
- prop: `['company_cd', 'department_cd', 'department_name']`
- Retrieved in callback: `result[i].data.department_cd`, `result[i].data.department_name`
- Finished sample: See `assets/department-search.md`

### Company Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.company.list`
- prop: `['company_cd', 'department_set_cd']`
- Retrieved in callback: `result[i].data.company_cd`, `result[i].data.department_name`
- Finished sample: See `assets/company-search.md`

### Public Group Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.public_group.list` (keyword) / `.tree` (tree)
- prop: `['public_group_set_cd', 'public_group_cd', 'public_group_name']`
- Retrieved in callback: `result[i].data.public_group_cd`, `result[i].data.public_group_name`
- Finished sample: See `assets/public-group-search.md`

### Private Group Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.private_group.list`
- prop: `['private_group_cd', 'private_group_name']`
- Retrieved in callback: `result[i].data.private_group_cd`, `result[i].data.private_group_name`
- Finished sample: See `assets/private-group-search.md`

### Role Search

- Plugin ID: `jp.co.intra_mart.master.app.search.tabs.role.list`
- prop: `['role_id']`
- Retrieved in callback: `result[i].data.role_id` (role name retrieved from `result[i].displayName`)
- Finished sample: See `assets/role-search.md`

### Other

For details on plugin IDs and retrieval fields, refer to `reference/imart-tag-acm-search.md`.

## Notes

- Always refer to the reference; never use plugin IDs or field names from memory or guesswork
- Follow the structural pattern of the finished samples (event listener, parameter construction, callback, window registration)
- For the HTML portion, use imds classes following the conventions of the `jssp-imds-theme` skill
