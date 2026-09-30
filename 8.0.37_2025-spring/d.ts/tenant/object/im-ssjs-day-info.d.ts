/**
 * 日付情報オブジェクト。
 *
 * カレンダーの特定日に関する詳細情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DayInfo/index.html
 */
interface DayInfo {
  /** 表示色 */
  color: string;
  /** データ種別 */
  dataType: string;
  /** 日付情報ID */
  dayInfoId: string;
  /** 日付情報名 */
  dayInfoName: string;
  /** 日付情報セットID */
  dayInfoSetId: string;
  /** 日（1〜31） */
  dayOfMonth: number;
  /** 曜日（0=日曜〜6=土曜） */
  dayOfWeek: number;
  /** 月内の曜日の出現回数（第 n 週） */
  dayOfWeekInMonth: number;
  /** 年（4桁） */
  fullYear: number;
  /** 国際化情報 */
  i18n: DayInfoI18N;
  /** 月（0=1月〜11=12月） */
  month: number;
  /** ソートキー */
  sortKey: number;
  /** 有効終了年 */
  validEndYear: number;
  /** 有効開始年 */
  validStartYear: number;
  /** 月内の週番号 */
  weekOfMonth: number;
}
