---
name: smartlime-calendar
description: 使用 smartlime-ui 的 IMCalendar / IMCalendarProvider / useIMCalendar 显示 intra-mart Accel Platform（iAP）的日历（工作日・假日・日期信息），并让用户选择日期。涵盖嵌入画面的用法、以模态方式打开的用法、所选日期及日期信息的接收方式，以及显示期间和日历 ID 的指定。当提及「显示日历」「选择日期」「申请基准日」「显示假日」「IMCalendar」时使用。
---

# iAP 日历的显示与日期的选择

## 目的

以不同颜色区分显示 iAP 的日历（工作日・假日・日期信息），并让用户选择日期。
前提是已登录，且已获取登录用户的信息（`smartlime-auth` 的认证门控）。**在没有用户信息的状态下显示会抛出异常**（`me information does not exist.`）。

## 机制

- 从 iAP 的 `/api/bearer/smacolow/calendar` 获取要显示月份的日历信息（需要 `smacolow` 范围）
- 时区和每周的起始日遵循登录用户的设置（`timeZone` / `firstDayOfWeek`）
- 长按日期后，会显示该日的日期信息一览
- 显示语言为设备的语言（ja / en / zh。其他语言为 en）

## 嵌入画面

```tsx
// src/app/(app)/select-date.tsx
import { IMCalendar, type IMDay } from '@intra-mart/smartlime-ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function SelectDateScreen() {
  const onDayPress = (day: IMDay) => {
    if (day.raw.holiday) return; // 不允许选择假日的情况
    // 返回调用方画面，并传递所选日期（'YYYY-MM-DD'）
    router.dismissTo({ pathname: '/', params: { date: day.day } });
  };

  return (
    <View style={{ flex: 1 }}>
      <IMCalendar onDayPress={onDayPress} />
    </View>
  );
}
```

如果目的只是选择日期，像这样**做成专用画面（路由）并返回**的形式更易于处理。也可以通过返回按钮取消。

## 以模态方式打开

```tsx
import { IMCalendarProvider, useIMCalendar } from '@intra-mart/smartlime-ui';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

function DateFieldInner() {
  const { open, close, onPressDayEffect } = useIMCalendar();
  const [date, setDate] = useState<string | null>(null);

  onPressDayEffect((day) => {
    setDate(day.day); // 'YYYY-MM-DD'
    close(); // 模态框不会自动关闭
  });

  return (
    <View>
      <Text>{date ?? '未选择'}</Text>
      <Button title="选择日期" onPress={open} />
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

- `useIMCalendar()` 只能在 `IMCalendarProvider` 内部使用
- 模态框没有关闭按钮，不选择日期就不会关闭。需要取消时，请使用“嵌入画面”的形式
- 传给 `onPressDayEffect` 的回调，只有最后传入的那个会被使用

## props

`IMCalendar` 与 `IMCalendarProvider` 通用：

| prop | 内容 |
|------|------|
| `defaultDate` | 最初显示的日期（`'YYYY-MM-DD'`） |
| `minDate` / `maxDate` | 可选择的期间（`'YYYY-MM-DD'`） |
| `calendarId` | 要显示的 iAP 日历的 ID。省略时为 iAP 的默认值。如需与用户的日历一致，传入 `useMeState()?.calendarId` |

仅 `IMCalendar`：`onDayPress(day)`（按下日期时）

## 所选日期的信息

`onDayPress` / `onPressDayEffect` 的参数（类型 `IMDay`）：

| 项目 | 内容 |
|------|------|
| `day` | 日期（`'YYYY-MM-DD'`） |
| `raw.holiday` | 是否为假日 |
| `raw.color` | 该日的显示颜色 |
| `raw.dayInfos` | 该日的日期信息一览（`dayInfoName`、`dataType`（`weekday` / `holiday` / `config`）等） |

- 类型 `IMDay`・`DayInfo`・`DayInfoSummary`・`ExtendedFormatDate` 从 `@intra-mart/smartlime-ui` import。不得深层 import `lib/...` 或 `src/...`

## 确认

- 在刚登录后和应用重启后进行显示，确认不会抛出异常
- 确认假日的颜色区分与 iAP 页面上的日历一致
