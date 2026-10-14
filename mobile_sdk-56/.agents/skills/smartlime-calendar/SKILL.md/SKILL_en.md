---
name: smartlime-calendar
description: Displays the intra-mart Accel Platform (iAP) calendar (business days, holidays, day information) and lets users select a date with smartlime-ui's IMCalendar / IMCalendarProvider / useIMCalendar. Covers embedding it in a screen, opening it as a modal, receiving the selected date and its day information, and specifying the displayed period and the calendar ID. Use when the user mentions "display a calendar", "select a date", "application reference date", "show holidays", or "IMCalendar".
---

# Displaying the iAP calendar and selecting dates

## Purpose

Display the iAP calendar (business days, holidays, day information) color-coded and let the user select a date.
The user must be signed in and the signed-in user's information must already be fetched (the auth gate in `smartlime-auth`). **Displaying it without user information throws** (`me information does not exist.`).

## How it works

- Fetches calendar information for the displayed month from iAP's `/api/bearer/smacolow/calendar` (requires the `smacolow` scope)
- The time zone and the first day of the week follow the signed-in user's settings (`timeZone` / `firstDayOfWeek`)
- Long-pressing a date shows the list of day information for that date
- The display language is the device language (ja / en / zh; en for anything else)

## Embedding in a screen

```tsx
// src/app/(app)/select-date.tsx
import { IMCalendar, type IMDay } from '@intra-mart/smartlime-ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function SelectDateScreen() {
  const onDayPress = (day: IMDay) => {
    if (day.raw.holiday) return; // When holidays must not be selectable
    // Return to the calling screen and pass the selected date ('YYYY-MM-DD')
    router.dismissTo({ pathname: '/', params: { date: day.day } });
  };

  return (
    <View style={{ flex: 1 }}>
      <IMCalendar onDayPress={onDayPress} />
    </View>
  );
}
```

If the only goal is selecting a date, **a dedicated screen (route) that returns** like this is easy to handle. The back button also works as a cancel.

## Opening as a modal

```tsx
import { IMCalendarProvider, useIMCalendar } from '@intra-mart/smartlime-ui';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

function DateFieldInner() {
  const { open, close, onPressDayEffect } = useIMCalendar();
  const [date, setDate] = useState<string | null>(null);

  onPressDayEffect((day) => {
    setDate(day.day); // 'YYYY-MM-DD'
    close(); // The modal does not close automatically
  });

  return (
    <View>
      <Text>{date ?? 'Not selected'}</Text>
      <Button title="Select a date" onPress={open} />
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

- `useIMCalendar()` can only be used inside `IMCalendarProvider`
- The modal has no close button and does not close until a date is selected. If cancellation is needed, use the "Embedding in a screen" form
- Only the last callback passed to `onPressDayEffect` is used

## props

Common to `IMCalendar` and `IMCalendarProvider`:

| prop | Details |
|------|------|
| `defaultDate` | The date shown first (`'YYYY-MM-DD'`) |
| `minDate` / `maxDate` | The selectable period (`'YYYY-MM-DD'`) |
| `calendarId` | ID of the iAP calendar to display. If omitted, the iAP default. To match the user's calendar, pass `useMeState()?.calendarId` |

`IMCalendar` only: `onDayPress(day)` (when a date is pressed)

## Information on the selected date

Argument of `onDayPress` / `onPressDayEffect` (type `IMDay`):

| Field | Details |
|------|------|
| `day` | The date (`'YYYY-MM-DD'`) |
| `raw.holiday` | Whether it is a holiday |
| `raw.color` | Display color of the date |
| `raw.dayInfos` | List of day information for the date (`dayInfoName`, `dataType` (`weekday` / `holiday` / `config`), etc.) |

- Import the types `IMDay`, `DayInfo`, `DayInfoSummary`, and `ExtendedFormatDate` from `@intra-mart/smartlime-ui`. Do not deep-import from `lib/...` or `src/...`

## Verification

- Display it right after sign-in and after restarting the app, and confirm that no exception occurs
- Confirm that the holiday color-coding matches the calendar on iAP pages
