/**
 * 日付情報国際化オブジェクト。
 *
 * 日付情報名のロケール別表示名を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DayInfoI18N/index.html
 */
interface DayInfoI18N {
  /** ロケールID をキー、日付情報名を値とするマップ */
  dayInfoName: { [localeId: string]: string };
}
