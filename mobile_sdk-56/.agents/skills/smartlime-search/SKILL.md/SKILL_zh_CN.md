---
name: smartlime-search
description: 使用 smartlime 的检索功能（useIMSearch 与 smartlime-ui 的 DefaultSearchUI），检索并选择 intra-mart Accel Platform（iAP）的用户・组织・职务・公共组・角色。涵盖 startSearch 的对象（target）・单选／多选・paramString、结果的类型、DefaultSearchUI 支持的对象，以及使用各个检索钩子（useUserSearch 等）制作自定义画面的方法。当提及「选择用户」「选择组织的画面」「选择收件人」「检索负责人」「IMSearch」「DefaultSearchUI」时使用。
---

# 用户・组织等的检索与选择

## 目的

打开检索 iAP 共通主数据（用户・组织・职务・公共组・角色）的画面，并接收用户选择的结果。
前提是已向 `Smartlime` 传入 `imseach={{ SearchComponent: DefaultSearchUI }}`（`smartlime-setup`）。

## 机制

- 调用 `useIMSearch().startSearch(...)` 后，传给 `Smartlime` 的 `SearchComponent`（通常是 smartlime-ui 的 `DefaultSearchUI`）会以模态方式打开
- 用户选择或取消后，`startSearch` 的 Promise 以结果 resolve（不会抛出异常）
- 检索会调用 iAP 的 `/api/bearer/smacolow/master/search/...`（需要 `smacolow` 范围）
- iAP 页面（`IMWebView`）中的检索对话框，使用 `useHackSearchUI` 后也会被替换为同一个检索画面（`smartlime-webview`）

## 用法

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
      paramString: '{}', // 不要设为空字符串（内部会执行 JSON.parse）
    });
    if (result.type !== 'success') {
      if (result.type === 'error') console.error(result.detail);
      return null; // cancel / locked / error
    }
    // 对象是用户，因此结果是用户的记录
    const records = result.result as SearchTypes.UserSearchRecord[];
    return records.map((record) => ({
      userCd: record.data.user_cd,
      userName: record.data.user_name,
    }));
  }, [startSearch]);
}
```

### startSearch 的参数

| 参数 | 内容 |
|------|------|
| `target` | 检索的对象（见下表） |
| `type` | `'single'`（选择 1 条。结果为 1 条记录）／ `'multiple'`（多选。结果为记录数组） |
| `paramString` | 传给 iAP 共通主数据检索画面的参数 JSON 字符串。**如无特别指定则为 `'{}'`**。空字符串 `''` 会导致异常。基准日（`target_date`）会自动附加为当天 |

### 结果

| `type` | 含义 |
|------|------|
| `success` | `result` 中为所选的记录（`single` 为 1 条，`multiple` 为数组） |
| `cancel` | 用户已取消。不作为错误处理 |
| `locked` | 已有其他检索画面处于打开状态（试图重复打开） |
| `error` | 检索失败。`detail` 中包含原因 |

- 结果的类型是各对象记录的联合类型，因此需根据对象将类型收窄为 `SearchTypes.UserSearchRecord` 等。`SearchTypes` 的类型一览请查看 `node_modules/@intra-mart/smartlime/src/packages/Search/types.ts`
- 每条记录包含 `displayName`（显示名）和 `data`（代码・名称等项目）。用户的情况下为 `data.user_cd` / `data.user_name` / `data.email_address1`

## 对象（target）

`DefaultSearchUI` 支持以下 7 种。

| `target` | 检索的对象 |
|------|------|
| `jp.co.intra_mart.master.search.user` | 用户 |
| `jp.co.intra_mart.master.search.department` | 组织 |
| `jp.co.intra_mart.master.search.company_post` | 职务（先选择组织再选择职务） |
| `jp.co.intra_mart.master.search.attached_department_post` | 组织，以及该组织所属的职务 |
| `jp.co.intra_mart.master.search.public_group` | 公共组 |
| `jp.co.intra_mart.master.search.public_group_role` | 公共组的角色 |
| `jp.co.intra_mart.master.search.attached_public_group_role` | 公共组，以及该组的角色 |

- `company`・`private_group`・`role` 虽然包含在类型中，但 `DefaultSearchUI` 并不支持，会显示错误画面。不得使用
- 显示语言由 smartlime-ui 根据设备的语言（ja / en / zh）决定

## 制作自定义检索画面的情况

如果 `DefaultSearchUI` 的外观无法满足需求，可以使用各个检索钩子制作自定义画面。它们都接收 `paramString`，并通过 `search(...)` 返回 `{ type: 'success' | 'error' | 'exception', ... }`。

| 钩子 | 内容 |
|------|------|
| `useUserSearch(paramString)` | 通过 `search(keyword)` 按关键字检索用户（代码・名称・检索名的部分匹配） |
| `useUserAdditionalInformationSearch` | 用户的附加信息 |
| `useDepartmentSearch` / `useDepartmentTopSearch` | 组织的检索 / 组织树的最上层 |
| `usePostSearch` / `useDepartmentPostSearch` | 组织的职务 |
| `usePublicGroupSearch` / `usePublicGroupTopSearch` | 公共组 |
| `useRoleSearch` / `usePublicGroupRoleSearch` | 公共组的角色 |

- 参数和结果的详细信息必须查看 `node_modules/@intra-mart/smartlime/src/packages/Search/hooks/` 的源代码确认
- 将自定义画面作为 `Smartlime` 的 `SearchComponent` 传入时，应将其做成接收 `SelectSearchProps`（`searchTarget` / `searchType` / `paramString` / `success` / `cancel` / `error`）的组件，并且在选择・取消・失败中的任意一种情况下必须调用 `success` / `cancel` / `error`（如果不调用，`startSearch` 将不会结束）

## 确认

- 分别操作单选・多选・取消这 3 种情况，确认取消时不会显示错误
- 确认所选记录的代码（`user_cd` 等）可以直接传给 iAP 的 API
