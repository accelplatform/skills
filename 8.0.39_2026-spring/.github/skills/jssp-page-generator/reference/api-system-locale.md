---
paths:
  - "src/main/jssp/**/*.js"
---

# SystemLocale API リファレンス

## 概要

SystemLocale は、システムで利用可能なロケール情報を扱う静的オブジェクトである。

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getDefaultLocaleInfo()` | ResultObject | システムデフォルトのロケール情報を取得 |
| `getLocaleInfo(id)` | ResultObject | 指定ロケールID のロケール情報を取得 |
| `getLocaleInfos()` | ResultObject | 利用可能なすべてのロケール情報を取得 |
| `isAvailableLocale(id)` | ResultObject | ロケールID が利用可能かどうかを判定 |

## getDefaultLocaleInfo()

システムデフォルトのロケール情報を取得する。
`ResultObject.data` に LocaleInfo が格納される。

```javascript
let result = SystemLocale.getDefaultLocaleInfo();
let localeInfo = result.data;
```

## getLocaleInfo(id)

指定されたロケールID のロケール情報を取得する。
システムで利用不可なロケールID が指定された場合は `null` を返却する。

```javascript
let result = SystemLocale.getLocaleInfo('ja');
let localeInfo = result.data;
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `id` | String | ロケールID |

## getLocaleInfos()

システムで利用可能なロケール情報をすべて取得する。
`ResultObject.data` に LocaleInfo の配列が格納される。

```javascript
let result = SystemLocale.getLocaleInfos();
let localeInfos = result.data;

for (let i = 0; i < localeInfos.length; i++) {
    Debug.print(localeInfos[i].id);
}
```

## isAvailableLocale(id)

指定されたロケールID がシステムで利用可能かどうかを判定する。
`ResultObject.data` に `true`（利用可能）または `false`（利用不可）が格納される。

```javascript
let result = SystemLocale.isAvailableLocale('ja');
if (result.data) {
    // 利用可能
}
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `id` | String | ロケールID |
