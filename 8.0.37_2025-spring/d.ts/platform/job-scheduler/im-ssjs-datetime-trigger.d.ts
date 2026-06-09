/**
 * 日時指定トリガ情報オブジェクト。
 *
 * 日時指定のスケジュール設定に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatetimeTrigger/index.html
 */
interface DatetimeTrigger {
  /** 日付（1〜31 の配列） */
  daysOfMonth: number[];
  /** 曜日（1=日〜7=土 の配列） */
  daysOfWeek: number[];
  /** 説明 */
  description: string;
  /** 有効/無効フラグ */
  enable: boolean;
  /** トリガ終了日時 */
  endDate: Date;
  /** 実行時刻（0〜23 の配列） */
  hours: number[];
  /** トリガID */
  id: string;
  /** ジョブネットID */
  jobnetId: string;
  /** 実行分（0〜59 の配列） */
  minutes: number[];
  /** 月（0〜11 の配列） */
  months: number[];
  /** トリガパラメータ */
  parameters: { [key: string]: any };
  /** スケジュール定義文字列（読み取り専用） */
  readonly scheduleText: string;
  /** トリガ開始日時 */
  startDate: Date;
  /** 開始ポイント値 */
  startPoint: number;
  /** タイムゾーン */
  timeZone: TimeZone;
  /** トリガ種別 */
  type: 'DatetimeTrigger';
  /** 年の配列 */
  years: number[];
}
