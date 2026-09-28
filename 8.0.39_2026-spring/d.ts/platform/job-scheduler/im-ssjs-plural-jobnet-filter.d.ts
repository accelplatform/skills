/**
 * 複数ジョブネットフィルタオブジェクト。
 *
 * 複数のジョブネットを条件に指定してモニタ情報を取得する際に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/PluralJobnetFilter/index.html
 */
interface PluralJobnetFilter {
  /** 除外するジョブネット情報の配列 */
  excludeJobnets?: { jobnetId: string; triggerId?: string }[];
  /** 終了日時の開始範囲 */
  fromEndDate?: Date;
  /** 開始日時の開始範囲 */
  fromStartDate?: Date;
  /** 検索対象ジョブネット情報の配列 */
  jobnets?: { jobnetId: string; triggerId?: string }[];
  /** 取得件数 */
  length?: number;
  /** メッセージ検索文字列 */
  message?: string;
  /** ソート対象カラム */
  orderByColumn?: string;
  /** 降順ソート（true: 降順 / false: 昇順） */
  orderByDesc?: boolean;
  /** 取得開始位置 */
  start?: number;
  /** ステータス条件の配列 */
  status?: string[];
  /** 終了日時の終了範囲 */
  toEndDate?: Date;
  /** 開始日時の終了範囲 */
  toStartDate?: Date;
}
