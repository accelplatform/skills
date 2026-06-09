/**
 * カレンダー曜日情報オブジェクト。
 *
 * カレンダーの曜日ごとの設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/CalendarWeekDayInfo/index.html
 */
interface CalendarWeekDayInfo {
  /** カレンダーID */
  calendarId: string;
  /** 表示色 */
  color: string;
  /** 曜日（0=日曜〜6=土曜） */
  dayOfWeek: number;
  /** 休日かどうか */
  holiday: boolean;
}
