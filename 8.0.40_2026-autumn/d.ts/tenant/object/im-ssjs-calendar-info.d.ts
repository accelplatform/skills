/**
 * カレンダー情報オブジェクト。
 *
 * カレンダーに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/CalendarInfo/index.html
 */
interface CalendarInfo {
  /** カレンダーID */
  calendarId: string;
  /** カレンダー名 */
  calendarName: string;
  /** 国際化情報 */
  i18n: CalendarInfoI18N;
  /** ソートキー */
  sortKey: number;
}
