---
name: smartlime-calendar
description: smartlime-ui の IMCalendar / IMCalendarProvider / useIMCalendar で、intra-mart Accel Platform（iAP）のカレンダー（稼働日・休日・日付情報）を表示し、日付を選択させる。画面に埋め込む使い方、モーダルで開く使い方、選択した日付と日付情報の受け取り方、表示する期間とカレンダー ID の指定を扱う。「カレンダーを表示」「日付を選択」「申請基準日」「休日を表示」「IMCalendar」と言及されたときに使用。
---

# iAP のカレンダーの表示と日付の選択

## 目的

iAP のカレンダー（稼働日・休日・日付情報）を色分けして表示し、ユーザーに日付を選ばせる。
ログイン済みで、ログインユーザーの情報が取得済みであること（`smartlime-auth` の認証ゲート）。**ユーザー情報が無い状態で表示すると例外になる**（`me information does not exist.`）。

## 仕組み

- 表示する月のカレンダー情報を iAP の `/api/bearer/smacolow/calendar` から取得する（`smacolow` スコープが必要）
- タイムゾーンと週の始まりは、ログインユーザーの設定（`timeZone` / `firstDayOfWeek`）に従う
- 日付を長押しすると、その日の日付情報の一覧を表示する
- 表示の言語は端末の言語（ja / en / zh。それ以外は en）

## 画面に埋め込む

```tsx
// src/app/(app)/select-date.tsx
import { IMCalendar, type IMDay } from '@intra-mart/smartlime-ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function SelectDateScreen() {
  const onDayPress = (day: IMDay) => {
    if (day.raw.holiday) return; // 休日を選ばせない場合
    // 呼び出し元の画面に戻り、選んだ日付（'YYYY-MM-DD'）を渡す
    router.dismissTo({ pathname: '/', params: { date: day.day } });
  };

  return (
    <View style={{ flex: 1 }}>
      <IMCalendar onDayPress={onDayPress} />
    </View>
  );
}
```

日付の選択だけが目的なら、このように**専用の画面（ルート）にして戻る**形が扱いやすい。戻るボタンで取り消しもできる。

## モーダルで開く

```tsx
import { IMCalendarProvider, useIMCalendar } from '@intra-mart/smartlime-ui';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

function DateFieldInner() {
  const { open, close, onPressDayEffect } = useIMCalendar();
  const [date, setDate] = useState<string | null>(null);

  onPressDayEffect((day) => {
    setDate(day.day); // 'YYYY-MM-DD'
    close(); // モーダルは自動では閉じない
  });

  return (
    <View>
      <Text>{date ?? '未選択'}</Text>
      <Button title="日付を選ぶ" onPress={open} />
    </View>
  );
}

export function DateField() {
  return (
    <IMCalendarProvider>
      <DateFieldInner />
    </IMCalendarProvider>
  );
}
```

- `useIMCalendar()` は `IMCalendarProvider` の内側でだけ使える
- モーダルには閉じるボタンが無く、日付を選ばないと閉じない。取り消しが必要な場合は「画面に埋め込む」形を使う
- `onPressDayEffect` に渡したコールバックは、最後に渡したものだけが使われる

## props

`IMCalendar` と `IMCalendarProvider` に共通:

| prop | 内容 |
|------|------|
| `defaultDate` | 最初に表示する日（`'YYYY-MM-DD'`） |
| `minDate` / `maxDate` | 選べる期間（`'YYYY-MM-DD'`） |
| `calendarId` | 表示する iAP のカレンダーの ID。省略時は iAP の既定。ユーザーのカレンダーに合わせる場合は `useMeState()?.calendarId` を渡す |

`IMCalendar` だけ: `onDayPress(day)`（日付を押したとき）

## 選択した日付の情報

`onDayPress` / `onPressDayEffect` の引数（型 `IMDay`）:

| 項目 | 内容 |
|------|------|
| `day` | 日付（`'YYYY-MM-DD'`） |
| `raw.holiday` | 休日かどうか |
| `raw.color` | その日の表示色 |
| `raw.dayInfos` | その日の日付情報の一覧（`dayInfoName`、`dataType`（`weekday` / `holiday` / `config`）など） |

- 型 `IMDay`・`DayInfo`・`DayInfoSummary`・`ExtendedFormatDate` は `@intra-mart/smartlime-ui` から import する。`lib/...` や `src/...` を深く import しないこと

## 確認

- ログイン直後とアプリの再起動後に表示し、例外にならないこと
- 休日の色分けが iAP の画面のカレンダーと一致すること
