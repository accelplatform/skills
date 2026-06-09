/**
 * 繰り返し指定トリガ情報オブジェクト。
 *
 * 繰り返し実行のスケジュール設定に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/RepeatTrigger/index.html
 */
interface RepeatTrigger {
  /** 実行回数 */
  count: number;
  /** 説明 */
  description: string;
  /** 有効/無効フラグ */
  enable: boolean;
  /** トリガ終了日時 */
  endDate: Date;
  /** トリガID */
  id: string;
  /** 繰り返し間隔（秒） */
  interval: number;
  /** ジョブネットID */
  jobnetId: string;
  /** トリガパラメータ */
  parameters: { [key: string]: any };
  /** スケジュール定義文字列（読み取り専用） */
  readonly scheduleText: string;
  /** トリガ開始日時 */
  startDate: Date;
  /** 開始ポイント値 */
  startPoint: number;
  /** トリガ種別 */
  type: 'RepeatTrigger';
}
