---
paths:
  - "src/main/jssp/**/*.js"
---

# UserActvMatterPropertyValue API リファレンス

## 概要

`UserActvMatterPropertyValue` は、ユーザデータ案件プロパティ情報マネージャオブジェクトである。
ユーザデータ案件プロパティ情報の新規登録、更新、削除を行う。

本オブジェクトでは **ユーザデータID** をキーに検索や更新処理を行う。
検索・更新処理の対象テーブルは未完了案件関連テーブル `imw_t_user_data` である。

- 完了案件のユーザデータプロパティ情報を操作する場合は `UserCplMatterPropertyValue` を使用する
- 過去案件のユーザデータプロパティ情報を操作する場合は `UserArcMatterPropertyValue` を使用する
- システム案件IDをキーに未完了案件からユーザデータ案件プロパティ情報を取得する場合は `ActvMatter` を使用する

## コンストラクタ

```javascript
let manager = new UserActvMatterPropertyValue();
```

引数なし。

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| createMatterProperty(Array) | WorkflowResultInfo\<null\> | 案件プロパティ情報を新規登録 |
| updateMatterProperty(Array) | WorkflowResultInfo\<null\> | 案件プロパティ情報を更新 |
| deleteMatterProperty(Array) | WorkflowResultInfo\<null\> | 案件プロパティ情報を削除 |
| getMatterPropertyList(String) | WorkflowResultInfo\<UserMatterPropertyInfo[]\> | ユーザデータIDで案件プロパティ一覧を取得 |
| getMatterProperty(String, String) | WorkflowResultInfo\<UserMatterPropertyInfo\> | ユーザデータID＋キーで案件プロパティを取得 |
| getMatterPropertyListCount(String) | WorkflowResultInfo\<number\> | ユーザデータIDで案件プロパティ件数を取得 |

## メソッド詳細

### createMatterProperty

ユーザデータ案件プロパティ情報を新規登録する。

```javascript
WorkflowResultInfo<null> createMatterProperty(Array matterProperty)
```

| 引数 | 型 | 説明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | ユーザデータ案件プロパティ情報オブジェクトの配列 |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<null\> | 処理結果。`data` 属性には `null` が設定される |

- `imw_t_user_data` テーブルに **insert** で登録する
- 配列が未設定の場合はエラー情報を格納した結果オブジェクトを返却する
- 登録対象の配列件数と実際に成功した登録件数が異なる場合もエラーを返却する
- 既に同一キーが存在する場合は **一意制約違反でエラー** になる（上書きは行わない）
- **内部でトランザクション制御を行わない**。外部で制御が必要

### updateMatterProperty

ユーザデータ案件プロパティ情報を更新する。

```javascript
WorkflowResultInfo<null> updateMatterProperty(Array matterProperty)
```

| 引数 | 型 | 説明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | ユーザデータ案件プロパティ情報オブジェクトの配列 |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<null\> | 処理結果。`data` 属性には `null` が設定される |

- 「ユーザデータID」と「案件プロパティキー」をキーにして、キー以外に設定されている値を更新する
- 値を設定していない項目（`null` の項目）は **更新対象外** になる
- 配列が未設定の場合はエラーを返却する
- 更新されたデータが 1 件未満の場合もエラーを返却する
- **内部でトランザクション制御を行わない**。外部で制御が必要

### deleteMatterProperty

ユーザデータ案件プロパティ情報を削除する。

```javascript
WorkflowResultInfo<null> deleteMatterProperty(Array matterProperty)
```

| 引数 | 型 | 説明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | ユーザデータ案件プロパティ情報オブジェクトの配列 |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<null\> | 処理結果 |

- **内部でトランザクション制御を行わない**。外部で制御が必要

### getMatterPropertyList

指定したユーザデータIDに紐づく案件プロパティ情報の一覧を取得する。

```javascript
WorkflowResultInfo<UserMatterPropertyInfo[]> getMatterPropertyList(String userDataId)
```

| 引数 | 型 | 説明 |
|------|------|------|
| userDataId | String | ユーザデータID |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo[]\> | `data` に案件プロパティ情報オブジェクトの配列を格納 |

### getMatterProperty

指定したユーザデータIDと案件プロパティキーに該当する案件プロパティ情報を取得する。

```javascript
WorkflowResultInfo<UserMatterPropertyInfo> getMatterProperty(String userDataId, String key)
```

| 引数 | 型 | 説明 |
|------|------|------|
| userDataId | String | ユーザデータID |
| key | String | 案件プロパティキー |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo\> | `data` に案件プロパティ情報オブジェクトを格納 |

### getMatterPropertyListCount

指定したユーザデータIDに紐づく案件プロパティの件数を取得する。

```javascript
WorkflowResultInfo<number> getMatterPropertyListCount(String userDataId)
```

| 引数 | 型 | 説明 |
|------|------|------|
| userDataId | String | ユーザデータID |

| 戻り値 | 説明 |
|--------|------|
| WorkflowResultInfo\<number\> | `data` に案件プロパティの件数を格納 |

## 案件プロパティ情報オブジェクトの構造

`createMatterProperty` / `updateMatterProperty` / `deleteMatterProperty` の引数配列の各要素、および `getMatterProperty` / `getMatterPropertyList` の戻り値の `data` に使用されるオブジェクト。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| userDataId | String | ユーザデータID |
| matterPropertyKey | String | 案件プロパティキー |
| matterPropertyValue | String | 案件プロパティ値 |

## 使用例

### 案件プロパティの新規登録

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A001' },
  { userDataId: 'UD001', matterPropertyKey: 'product_name', matterPropertyValue: 'サンプル商品' }
];

let result = manager.createMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('案件プロパティ登録に失敗しました。{}', result.resultStatus.messageId);
}
```

### 案件プロパティの更新

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A002' }
];

let result = manager.updateMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('案件プロパティ更新に失敗しました。{}', result.resultStatus.messageId);
}
```

### 案件プロパティの取得

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();

// 一覧取得
let listResult = manager.getMatterPropertyList('UD001');
for (let i = 0; i < listResult.data.length; i++) {
  logger.info('{} = {}', listResult.data[i].matterPropertyKey, listResult.data[i].matterPropertyValue);
}

// 単一取得
let itemResult = manager.getMatterProperty('UD001', 'product_code');
logger.info('product_code = {}', itemResult.data.matterPropertyValue);

// 件数取得
let countResult = manager.getMatterPropertyListCount('UD001');
logger.info('プロパティ件数: {}', countResult.data);
```

### 案件プロパティの登録・更新（存在チェック付き）

`createMatterProperty` は既存キーがあると一意制約違反になるため、存在チェックを行って登録または更新を使い分ける。

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let userDataId = 'UD001';
let propertyKey = 'product_code';
let propertyValue = 'A003';

let existing = manager.getMatterProperty(userDataId, propertyKey);
let properties = [
  { userDataId: userDataId, matterPropertyKey: propertyKey, matterPropertyValue: propertyValue }
];

let result;
if (existing.data) {
  result = manager.updateMatterProperty(properties);
} else {
  result = manager.createMatterProperty(properties);
}

if (!result.resultFlag) {
  logger.error('案件プロパティ処理に失敗しました。{}', result.resultStatus.messageId);
}
```

## 注意事項

- 全メソッドとも **内部でトランザクション制御を行わない**。必要に応じて外部で `Transaction.begin` 等を使用すること
- `createMatterProperty` は insert のため、同一キーが既に存在する場合は一意制約違反でエラーになる。登録済みかどうか不明な場合は `getMatterProperty` で存在チェックを行うこと
- `updateMatterProperty` は `null` のフィールドを更新対象外とする。値をクリアする目的で `null` を渡しても更新されない
- 案件プロパティ定義を後から追加した場合、追加前に申請された案件にはそのプロパティが存在しない。承認時に `updateMatterProperty` を呼ぶとエラーになるため、`getMatterProperty` で存在を確認し、存在しなければ `createMatterProperty` で登録すること
