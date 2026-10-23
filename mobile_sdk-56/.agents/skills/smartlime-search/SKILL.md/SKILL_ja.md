---
name: smartlime-search
description: smartlime の検索機能（useIMSearch と smartlime-ui の DefaultSearchUI）で、intra-mart Accel Platform（iAP）のユーザー・組織・役職・パブリックグループ・ロールを検索して選択させる。startSearch の対象（target）・単一／複数選択・paramString、結果の型、DefaultSearchUI が対応する対象、個別の検索フック（useUserSearch など）で独自の画面を作る方法を扱う。「ユーザーを選択」「組織を選ぶ画面」「宛先の選択」「担当者の検索」「IMSearch」「DefaultSearchUI」と言及されたときに使用。
---

# ユーザー・組織などの検索と選択

## 目的

iAP の共通マスタ（ユーザー・組織・役職・パブリックグループ・ロール）を検索する画面を開き、ユーザーが選んだ結果を受け取る。
`Smartlime` に `imseach={{ SearchComponent: DefaultSearchUI }}` を渡してあること（`smartlime-setup`）。

## 仕組み

- `useIMSearch().startSearch(...)` を呼ぶと、`Smartlime` に渡した `SearchComponent`（通常は smartlime-ui の `DefaultSearchUI`）がモーダルで開く
- ユーザーが選択・取消すると、`startSearch` の Promise が結果で解決する（例外は投げない）
- 検索は iAP の `/api/bearer/smacolow/master/search/...` を呼ぶ（`smacolow` スコープが必要）
- iAP の画面（`IMWebView`）の中の検索ダイアログも、`useHackSearchUI` を使えば同じ検索画面に置き換わる（`smartlime-webview`）

## 使い方

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
      paramString: '{}', // 空文字列にしない（内部で JSON.parse される）
    });
    if (result.type !== 'success') {
      if (result.type === 'error') console.error(result.detail);
      return null; // cancel / locked / error
    }
    // 対象がユーザーなので、結果はユーザーのレコード
    const records = result.result as SearchTypes.UserSearchRecord[];
    return records.map((record) => ({
      userCd: record.data.user_cd,
      userName: record.data.user_name,
    }));
  }, [startSearch]);
}
```

### startSearch の引数

| 引数 | 内容 |
|------|------|
| `target` | 検索の対象（下表） |
| `type` | `'single'`（1 件選択。結果はレコード 1 件）／ `'multiple'`（複数選択。結果はレコードの配列） |
| `paramString` | iAP の共通マスタ検索画面に渡すパラメータの JSON 文字列。**特に指定が無ければ `'{}'`**。空文字列 `''` は例外になる。基準日（`target_date`）は当日が自動で付く |

### 結果

| `type` | 意味 |
|------|------|
| `success` | `result` に選択されたレコード（`single` は 1 件、`multiple` は配列） |
| `cancel` | ユーザーが取り消した。エラーとして扱わない |
| `locked` | 別の検索画面が開いている（二重に開こうとした） |
| `error` | 検索に失敗した。`detail` に原因 |

- 結果の型は対象ごとのレコードの合併型なので、対象に合わせて `SearchTypes.UserSearchRecord` などへ型を絞る。`SearchTypes` の型の一覧は `node_modules/@intra-mart/smartlime/src/packages/Search/types.ts` を見ること
- 各レコードは `displayName`（表示名）と `data`（コード・名称などの項目）を持つ。ユーザーなら `data.user_cd` / `data.user_name` / `data.email_address1`

## 対象（target）

`DefaultSearchUI` が対応するのは次の 7 つ。

| `target` | 検索する対象 |
|------|------|
| `jp.co.intra_mart.master.search.user` | ユーザー |
| `jp.co.intra_mart.master.search.department` | 組織 |
| `jp.co.intra_mart.master.search.company_post` | 役職（組織を選んでから役職） |
| `jp.co.intra_mart.master.search.attached_department_post` | 組織と、その組織に所属する役職 |
| `jp.co.intra_mart.master.search.public_group` | パブリックグループ |
| `jp.co.intra_mart.master.search.public_group_role` | パブリックグループの役割 |
| `jp.co.intra_mart.master.search.attached_public_group_role` | パブリックグループと、そのグループの役割 |

- `company`・`private_group`・`role` は型には含まれるが、`DefaultSearchUI` は対応しておらず、エラーの画面になる。使わないこと
- 表示の言語は smartlime-ui が端末の言語（ja / en / zh）に合わせる

## 独自の検索画面を作る場合

`DefaultSearchUI` の見た目で足りない場合は、個別の検索フックで独自の画面を作れる。いずれも `paramString` を受け取り、`search(...)` で `{ type: 'success' | 'error' | 'exception', ... }` を返す。

| フック | 内容 |
|------|------|
| `useUserSearch(paramString)` | `search(keyword)` でユーザーをキーワード検索（コード・名前・検索名の部分一致） |
| `useUserAdditionalInformationSearch` | ユーザーの追加情報 |
| `useDepartmentSearch` / `useDepartmentTopSearch` | 組織の検索 / 組織ツリーの最上位 |
| `usePostSearch` / `useDepartmentPostSearch` | 組織の役職 |
| `usePublicGroupSearch` / `usePublicGroupTopSearch` | パブリックグループ |
| `useRoleSearch` / `usePublicGroupRoleSearch` | パブリックグループの役割 |

- 引数と結果の詳細は `node_modules/@intra-mart/smartlime/src/packages/Search/hooks/` のソースで確認すること
- 独自の画面を `Smartlime` の `SearchComponent` として渡す場合は、`SelectSearchProps`（`searchTarget` / `searchType` / `paramString` / `success` / `cancel` / `error`）を受け取る部品にし、選択・取消・失敗のどれかで必ず `success` / `cancel` / `error` を呼ぶこと（呼ばないと `startSearch` が終わらない）

## 確認

- 単一選択・複数選択・取消の 3 つを操作し、取消でエラー表示が出ないこと
- 選択したレコードのコード（`user_cd` 等）を、そのまま iAP の API に渡せること
