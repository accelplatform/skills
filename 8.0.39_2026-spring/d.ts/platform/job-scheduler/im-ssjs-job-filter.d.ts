/**
 * モニタ情報フィルタオブジェクト。
 *
 * モニタ情報を条件指定で取得する際に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Filter/index.html
 */
// TODO: API ドキュメントではオブジェクト名は Filter となっているが、名称が単純であるため、JobFilter として定義しています
interface JobFilter {
  /** 開始日時範囲の下限値 */
  fromStartDate?: Date;
  /** 終了日時範囲の下限値 */
  fromEndDate?: Date;
  /** 開始日時範囲の上限値 */
  toStartDate?: Date;
  /** 終了日時範囲の上限値 */
  toEndDate?: Date;
  /** 対象ジョブネットID */
  jobnetId?: string;
  /** 対象トリガID */
  triggerId?: string;
  /** ステータス条件の配列 */
  statuses?: string[];
  /** メッセージ検索文字列 */
  message?: string;
  /** 結果取得の開始位置（0 ベース） */
  start?: number;
  /** 取得する最大件数 */
  length?: number;
  /** ソート対象カラム */
  orderByColumn?: string;
  /** 降順ソート（true: 降順 / false: 昇順） */
  orderByDesc?: boolean;
}
