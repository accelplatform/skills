# TimeZone API リファレンス

## 概要

TimeZone は、タイムゾーン情報を扱うクラスである。
Java の TimeZone クラスと同等の動作を提供し、タイムゾーンマスタに存在しないタイムゾーンも扱える。

- タイムゾーンを要求する API に対しては、`SystemTimeZone` から取得したタイムゾーン情報の使用を推奨
- 指定されたID を認識できない場合は GMT タイムゾーンを返す

## インスタンスの取得

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
```

## プロパティ一覧（読み取り専用）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `id` | String | タイムゾーンID |
| `rawOffset` | Number | UTC に追加するミリ秒単位の時間量 |
| `useDaylightTime` | Boolean | 夏時間使用有無（true: 使用 / false: 不使用） |

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `TimeZone.getTimeZone(id)` | ResultObject | 指定IDのタイムゾーンを取得（static） |
| `getOffset(date)` | Number | 指定日付における UTC からのオフセット（ミリ秒）を取得 |
| `inDaylightTime(date)` | Boolean | 指定日付が夏時間の期間内かどうかを判定 |

## TimeZone.getTimeZone(id)【static】

指定ID のタイムゾーンを取得する。
戻り値の `ResultObject.data` に TimeZone オブジェクトが格納される。

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
let id = timeZone.id;               // "Asia/Tokyo"
let offset = timeZone.rawOffset;     // 32400000 (9時間 = 9 * 60 * 60 * 1000)
```

## getOffset(date)

指定日付における UTC からのオフセット（ミリ秒）を取得する。
夏時間が適用される場合は、その分を含んだオフセットが返される。

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let offset = timeZone.getOffset(new Date());
```

## inDaylightTime(date)

指定日付がこのタイムゾーンで夏時間の期間内かどうかを判定する。

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let isDst = timeZone.inDaylightTime(new Date());
```
