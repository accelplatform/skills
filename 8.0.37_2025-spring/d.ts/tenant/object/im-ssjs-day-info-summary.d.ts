/**
 * 日付情報サマリオブジェクト。
 *
 * 特定日の日付情報のサマリを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DayInfoSummary/index.html
 */
interface DayInfoSummary {
  /** 表示色 */
  readonly color: string;
  /** 対象日付 */
  readonly currentDate: Date;
  /** 日付情報名の配列 */
  readonly dayInfoNames: string[];
  /** 日付情報の配列 */
  readonly dayInfos: DayInfo[];
  /** 休日かどうか */
  readonly isHoliday: boolean;
}
