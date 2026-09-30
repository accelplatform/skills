/**
 * 日付情報セットオブジェクト。
 *
 * 日付情報のグループを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DayInfoSet/index.html
 */
interface DayInfoSet {
  /** 日付情報セットID */
  dayInfoSetId: string;
  /** 日付情報セット名 */
  dayInfoSetName: string;
  /** 週の開始曜日（0=日曜〜6=土曜） */
  firstDayOfWeek: number;
  /** 国際化情報 */
  i18n: DayInfoSetI18N;
  /** ソートキー */
  sortKey: number;
}
