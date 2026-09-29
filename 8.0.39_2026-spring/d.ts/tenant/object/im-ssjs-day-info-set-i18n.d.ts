/**
 * 日付情報セット国際化オブジェクト。
 *
 * 日付情報セット名のロケール別表示名を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DayInfoSetI18N/index.html
 */
interface DayInfoSetI18N {
  /** ロケールID をキー、日付情報セット名を値とするマップ */
  dayInfoSetName: { [localeId: string]: string };
}
