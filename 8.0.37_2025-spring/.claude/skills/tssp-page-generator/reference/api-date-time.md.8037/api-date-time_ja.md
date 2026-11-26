---
paths:
  - "src/main/tssp/**/*.ts"
---

# DateTime API リファレンス

## 概要

DateTime は、タイムゾーンを考慮した日時を扱うオブジェクトである。
全メソッドは不変性を保証し、元インスタンスは変更されない（新しいコピーを返す）。

- 月の値は **0始まり**（1月=0、12月=11）
- 年の範囲は 1〜9999
- タイムゾーン省略時はアカウントコンテキストから自動解決

## コンストラクタ

```typescript
// 現在日時（タイムゾーンはアカウント設定から自動解決）
let now = new DateTime();

// タイムゾーン指定で現在日時
let zonedNow = new DateTime(zone);

// Date オブジェクトから生成
let fromDate = new DateTime(date, zone);

// 年月日時分秒を指定（月は0始まり）
let specified = new DateTime(year, monthOfYear, dayOfMonth, hourOfDay, minuteOfHour, secondOfMinute, zone);
```

## 定数

| 定数 | 値 | 定数 | 値 |
|------|-----|------|-----|
| JANUARY | 0 | JULY | 6 |
| FEBRUARY | 1 | AUGUST | 7 |
| MARCH | 2 | SEPTEMBER | 8 |
| APRIL | 3 | OCTOBER | 9 |
| MAY | 4 | NOVEMBER | 10 |
| JUNE | 5 | DECEMBER | 11 |

曜日定数: `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`

## プロパティ一覧（読み取り専用）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| year | Number | 年（1〜9999） |
| monthOfYear | Number | 月（0〜11） |
| dayOfMonth | Number | 日（1〜31） |
| hourOfDay | Number | 時（0〜23） |
| minuteOfHour | Number | 分（0〜59） |
| secondOfMinute | Number | 秒（0〜59） |
| dayOfWeek | Number | 曜日値 |
| lastDayOfMonth | Number | 月末日（28〜31） |
| firstDayOfWeek | Number | 週開始曜日 |
| timeZoneId | String | タイムゾーンID |

## メソッド一覧

### 加算メソッド（新しい DateTime を返す）

| メソッド | 説明 |
|---------|------|
| plusYears(years) | 年を加算 |
| plusMonths(months) | 月を加算 |
| plusDays(days) | 日を加算 |
| plusHours(hours) | 時間を加算 |
| plusMinutes(minutes) | 分を加算 |
| plusSeconds(seconds) | 秒を加算 |

### 減算メソッド（新しい DateTime を返す）

| メソッド | 説明 |
|---------|------|
| minusYears(years) | 年を減算 |
| minusMonths(months) | 月を減算 |
| minusDays(days) | 日を減算 |
| minusHours(hours) | 時間を減算 |
| minusMinutes(minutes) | 分を減算 |
| minusSeconds(seconds) | 秒を減算 |

### 値変更メソッド（新しい DateTime を返す）

| メソッド | 説明 |
|---------|------|
| withYear(year) | 年のみ変更 |
| withMonthOfYear(month) | 月のみ変更 |
| withDayOfMonth(day) | 日のみ変更 |
| withHourOfDay(hour) | 時のみ変更 |
| withMinuteOfHour(minute) | 分のみ変更 |
| withSecondOfMinute(second) | 秒のみ変更 |
| withMilliOfSecond(milli) | ミリ秒のみ変更 |
| withTimeZone(zone) | タイムゾーン変換 |

### 変換・取得メソッド

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getDate() | ResultObject | エポックミリ秒を持つ Date を返却 |
| getTime() | ResultObject | エポックミリ秒を返却 |
| getTimeZone() | ResultObject | タイムゾーンを返却 |
| getTimeZoneOffset() | ResultObject | タイムゾーンオフセット（ミリ秒）を返却 |
| clone() | ResultObject | コピーを作成 |
| toString() | String | RFC 822形式の文字列に変換 |

※ `toString()` 以外のメソッドは `ResultObject` を返却し、`.data` に結果が格納される。`ResultObject<T>`（`d.ts/platform/standard/im-ssjs-result-object.d.ts`）は、`error` が `false` のときだけ `data` が `T` 型になる。`error` を確かめてから `data` を読む（確かめずに読むと `data` は `unknown` 型になり、プロパティやメソッドを使う箇所で `tssp build` の型検査が失敗する）。

## 使用例

### 現在日時の取得

```typescript
let now = new DateTime();
let year = now.year;
let month = now.monthOfYear + 1; // 表示用に+1
let day = now.dayOfMonth;
```

### 日付の加減算

```typescript
let now = new DateTime();

// 3ヶ月後
let futureResult = now.plusMonths(3);
let future: DateTime | null = futureResult.error ? null : futureResult.data;

// 7日前
let pastResult = now.minusDays(7);
let past: DateTime | null = pastResult.error ? null : pastResult.data;

// 翌年の同日
let nextYearResult = now.plusYears(1);
let nextYear: DateTime | null = nextYearResult.error ? null : nextYearResult.data;
```

### 特定日時の生成

```typescript
// 2024年1月15日 14:30:00
let dt = new DateTime(2024, DateTime.JANUARY, 15, 14, 30, 0);
```

### 月末日の取得

```typescript
let now = new DateTime();
let lastDay = now.lastDayOfMonth;
```
