---
name: smartlime-search
description: Lets users search for and select intra-mart Accel Platform (iAP) users, organizations, positions, public groups, and roles with smartlime's search feature (useIMSearch and smartlime-ui's DefaultSearchUI). Covers the startSearch target, single/multiple selection and paramString, result types, the targets DefaultSearchUI supports, and how to build your own screen with individual search hooks (useUserSearch, etc.). Use when the user mentions "select a user", "organization selection screen", "select recipients", "search for an assignee", "IMSearch", or "DefaultSearchUI".
---

# Searching for and selecting users, organizations, etc.

## Purpose

Open a screen that searches the iAP common master (users, organizations, positions, public groups, roles) and receive the result the user selects.
`imseach={{ SearchComponent: DefaultSearchUI }}` must be passed to `Smartlime` (`smartlime-setup`).

## How it works

- Calling `useIMSearch().startSearch(...)` opens the `SearchComponent` passed to `Smartlime` (usually smartlime-ui's `DefaultSearchUI`) as a modal
- When the user selects or cancels, the `startSearch` Promise resolves with the result (it does not throw)
- Search calls iAP's `/api/bearer/smacolow/master/search/...` (requires the `smacolow` scope)
- Search dialogs inside iAP pages (`IMWebView`) are also replaced by the same search screen when `useHackSearchUI` is used (`smartlime-webview`)

## Usage

```ts
// src/hooks/use-select-users.ts
import { SearchTypes, useIMSearch } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export interface SelectedUser {
  userCd: string;
  userName: string;
}

export function useSelectUsers() {
  const { startSearch } = useIMSearch();

  return useCallback(async (): Promise<SelectedUser[] | null> => {
    const result = await startSearch({
      target: 'jp.co.intra_mart.master.search.user',
      type: 'multiple',
      paramString: '{}', // Do not use an empty string (it is passed to JSON.parse internally)
    });
    if (result.type !== 'success') {
      if (result.type === 'error') console.error(result.detail);
      return null; // cancel / locked / error
    }
    // The target is users, so the result is user records
    const records = result.result as SearchTypes.UserSearchRecord[];
    return records.map((record) => ({
      userCd: record.data.user_cd,
      userName: record.data.user_name,
    }));
  }, [startSearch]);
}
```

### startSearch arguments

| Argument | Details |
|------|------|
| `target` | The search target (table below) |
| `type` | `'single'` (select one; the result is one record) / `'multiple'` (select multiple; the result is an array of records) |
| `paramString` | JSON string of parameters passed to the iAP common master search screen. **Use `'{}'` unless you need something specific**. An empty string `''` throws. The reference date (`target_date`) is automatically set to today |

### Result

| `type` | Meaning |
|------|------|
| `success` | `result` contains the selected records (one for `single`, an array for `multiple`) |
| `cancel` | The user canceled. Do not treat it as an error |
| `locked` | Another search screen is open (an attempt to open it twice) |
| `error` | The search failed. `detail` contains the cause |

- The result type is a union of the record types for each target, so narrow it to `SearchTypes.UserSearchRecord` etc. according to the target. For the list of `SearchTypes` types, see `node_modules/@intra-mart/smartlime/src/packages/Search/types.ts`
- Each record has `displayName` (display name) and `data` (fields such as code and name). For users: `data.user_cd` / `data.user_name` / `data.email_address1`

## Targets

`DefaultSearchUI` supports the following seven.

| `target` | What is searched |
|------|------|
| `jp.co.intra_mart.master.search.user` | Users |
| `jp.co.intra_mart.master.search.department` | Organizations |
| `jp.co.intra_mart.master.search.company_post` | Positions (select an organization, then a position) |
| `jp.co.intra_mart.master.search.attached_department_post` | An organization and a position belonging to that organization |
| `jp.co.intra_mart.master.search.public_group` | Public groups |
| `jp.co.intra_mart.master.search.public_group_role` | Public group roles |
| `jp.co.intra_mart.master.search.attached_public_group_role` | A public group and a role of that group |

- `company`, `private_group`, and `role` are included in the type, but `DefaultSearchUI` does not support them and shows an error screen. Do not use them
- smartlime-ui matches the display language to the device language (ja / en / zh)

## Building your own search screen

If the look of `DefaultSearchUI` is not enough, you can build your own screen with individual search hooks. Each takes `paramString` and returns `{ type: 'success' | 'error' | 'exception', ... }` from `search(...)`.

| Hook | Details |
|------|------|
| `useUserSearch(paramString)` | `search(keyword)` searches users by keyword (partial match on code, name, and search name) |
| `useUserAdditionalInformationSearch` | Additional user information |
| `useDepartmentSearch` / `useDepartmentTopSearch` | Organization search / top level of the organization tree |
| `usePostSearch` / `useDepartmentPostSearch` | Positions of an organization |
| `usePublicGroupSearch` / `usePublicGroupTopSearch` | Public groups |
| `useRoleSearch` / `usePublicGroupRoleSearch` | Public group roles |

- Check the details of arguments and results in the source under `node_modules/@intra-mart/smartlime/src/packages/Search/hooks/`
- When passing your own screen to `Smartlime` as the `SearchComponent`, make it a component that receives `SelectSearchProps` (`searchTarget` / `searchType` / `paramString` / `success` / `cancel` / `error`), and always call `success` / `cancel` / `error` on selection, cancellation, or failure (otherwise `startSearch` never finishes)

## Verification

- Try single selection, multiple selection, and cancellation, and confirm that canceling does not show an error
- Confirm that the codes of the selected records (`user_cd`, etc.) can be passed directly to iAP APIs
