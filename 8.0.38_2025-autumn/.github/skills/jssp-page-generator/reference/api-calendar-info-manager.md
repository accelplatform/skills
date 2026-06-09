---
paths:
  - "src/main/jssp/**/*.js"
---

# CalendarInfoManager API リファレンス

## 概要

CalendarInfoManager は、カレンダー情報を管理するクラスである。
カレンダー情報、日付情報セット、日付情報、曜日情報の管理および特定日の日付情報検索機能を提供する。

- 優先順位に従って複数の日付情報から該当日の情報を解決できる
- insert / update メソッドで複数ロケールの国際化項目を指定可能
- delete メソッドは国際化項目もすべて削除する

## コンストラクタ

```javascript
let manager = new CalendarInfoManager();
```

## メソッド一覧

### カレンダー管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getCalendarInfo(calendarId)` | ResultObject | カレンダーを取得 |
| `getCalendarInfos()` | ResultObject | すべてのカレンダーを取得 |
| `insertCalendarInfo(info)` | ResultObject | カレンダーを作成 |
| `updateCalendarInfo(info)` | ResultObject | カレンダーを更新 |
| `deleteCalendarInfo(info)` | ResultObject | カレンダーを削除 |
| `hasCalendarInfo(calendarId)` | ResultObject | カレンダーの存在確認 |

### 日付情報セット管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getDayInfoSet(dayInfoSetId)` | ResultObject | 日付情報セットを取得 |
| `getDayInfoSets()` | ResultObject | すべての日付情報セットを取得 |
| `getDayInfoSetsByCalendarId(calendarId)` | ResultObject | カレンダーに登録された日付情報セットを取得 |
| `insertDayInfoSet(info)` | ResultObject | 日付情報セットを作成 |
| `updateDayInfoSet(info)` | ResultObject | 日付情報セットを更新 |
| `deleteDayInfoSet(info)` | ResultObject | 日付情報セットを削除 |
| `hasDayInfoSet(dayInfoSetId)` | ResultObject | 日付情報セットの存在確認 |
| `includeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | カレンダーに日付情報セットを追加 |
| `excludeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | カレンダーから日付情報セットを除去 |

### 日付情報管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getDayInfo(dayInfoSetId, dayInfoId)` | ResultObject | 日付情報を取得 |
| `getDayInfosByCalendarId(calendarId)` | ResultObject | カレンダーのすべての日付情報を取得 |
| `getDayInfosByDayInfoSetId(dayInfoSetId)` | ResultObject | セットのすべての日付情報を取得 |
| `insertDayInfo(info)` | ResultObject | 日付情報を作成 |
| `updateDayInfo(info)` | ResultObject | 日付情報を更新 |
| `deleteDayInfo(info)` | ResultObject | 日付情報を削除 |
| `hasDayInfo(calendarId, date, dayInfo)` | ResultObject | 日付情報の存在確認 |

### 曜日情報管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getCalendarWeekDayInfos(calendarId)` | ResultObject | 曜日情報を取得（キーは曜日番号） |
| `insertCalendarWeekDayInfo(info)` | ResultObject | 曜日情報を作成 |
| `updateCalendarWeekDayInfo(info)` | ResultObject | 曜日情報を更新 |
| `deleteCalendarWeekDayInfo(info)` | ResultObject | 曜日情報を削除 |

### 日付情報クエリ

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getDayInfoSummary(calendarId, date)` | ResultObject | 指定日の日付情報を取得 |
| `getDayInfoSummariesOnMonth(calendarId, date, fill)` | ResultObject | 1ヶ月分の日付情報を取得 |
| `getDayInfoSummariesOnWeek(calendarId, date, shiftFirstDayOfWeek)` | ResultObject | 1週間分の日付情報を取得 |
| `getDayInfoSummariesOnTerm(calendarId, start, end)` | ResultObject | 期間の日付情報を取得 |
| `isHoliday(calendarId, date)` | ResultObject | 指定日が休日かどうかを判定 |

### 優先順位・週設定

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `updateDayInfoSetSortKeyOnCalendar(calendarId, dayInfoSetIds)` | ResultObject | 日付情報セットの優先順位を変更 |
| `updateDayInfoSortKeyOnDayInfoSet(dayInfoSetId, dayInfoIds)` | ResultObject | 日付情報の優先順位を変更 |

## 日付情報クエリの使用例

### 指定日の日付情報を取得

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummary('calendar01', new Date());
let summary = result.data;
```

### 1ヶ月分の日付情報を取得

`fill` に `true` を指定すると、最初の日が日曜日・最後の日が土曜日となるよう前後の月の情報で埋める。

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummariesOnMonth('calendar01', new Date(), true);
let summaries = result.data;
```

### 期間の日付情報を取得

```javascript
let manager = new CalendarInfoManager();
let start = new DateTime(2024, DateTime.APRIL, 1, 0, 0, 0).getDate();
let end = new DateTime(2024, DateTime.APRIL, 30, 0, 0, 0).getDate();
let result = manager.getDayInfoSummariesOnTerm('calendar01', start, end);
let summaries = result.data;
```

### 休日判定

```javascript
let manager = new CalendarInfoManager();
let result = manager.isHoliday('calendar01', new Date());
if (result.data) {
    // 休日
}
```

## カレンダー・日付情報の管理例

### カレンダーの作成

```javascript
let manager = new CalendarInfoManager();
let info = new CalendarInfo();
info.calendarId = 'calendar01';
manager.insertCalendarInfo(info);
```

### 日付情報セットの追加・除去

```javascript
let manager = new CalendarInfoManager();

// カレンダーに日付情報セットを追加
manager.includeDayInfoSet('calendar01', ['dayInfoSet01', 'dayInfoSet02']);

// カレンダーから日付情報セットを除去
manager.excludeDayInfoSet('calendar01', ['dayInfoSet02']);
```
