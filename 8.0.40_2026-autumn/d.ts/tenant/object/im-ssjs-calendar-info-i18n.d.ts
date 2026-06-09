/**
 * カレンダー情報国際化オブジェクト。
 *
 * カレンダー名のロケール別表示名を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/CalendarInfoI18N/index.html
 */
interface CalendarInfoI18N {
  /** ロケールID をキー、カレンダー名を値とするマップ */
  calendarName: { [localeId: string]: string };
}
