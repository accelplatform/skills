# SystemLocale API 参考

## 概述

SystemLocale 是处理系统中可用语言环境信息的静态对象。

## 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getDefaultLocaleInfo()` | ResultObject | 获取系统默认语言环境信息 |
| `getLocaleInfo(id)` | ResultObject | 获取指定语言环境ID的语言环境信息 |
| `getLocaleInfos()` | ResultObject | 获取所有可用的语言环境信息 |
| `isAvailableLocale(id)` | ResultObject | 判断语言环境ID是否可用 |

## getDefaultLocaleInfo()

获取系统默认语言环境信息。
`ResultObject.data` 中存储 LocaleInfo。

```typescript
let result = SystemLocale.getDefaultLocaleInfo();
if (!result.error) {
  let localeInfo = result.data;
}
```

## getLocaleInfo(id)

获取指定语言环境ID的语言环境信息。
如果指定了系统中不可用的语言环境ID，则返回 `null`。

```typescript
let result = SystemLocale.getLocaleInfo('ja');
if (!result.error && result.data !== null) {
  let localeInfo = result.data;
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 语言环境ID |

## getLocaleInfos()

获取系统中所有可用的语言环境信息。
`ResultObject.data` 中存储 LocaleInfo 的数组。

```typescript
let result = SystemLocale.getLocaleInfos();
if (!result.error) {
  let localeInfos = result.data;

  for (let i = 0; i < localeInfos.length; i++) {
    Debug.print(localeInfos[i].locale);
  }
}
```

## isAvailableLocale(id)

判断指定语言环境ID是否在系统中可用。
`ResultObject.data` 中存储 `true`（可用）或 `false`（不可用）。

```typescript
let result = SystemLocale.isAvailableLocale('ja');
if (result.data) {
  // 可用
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 语言环境ID |