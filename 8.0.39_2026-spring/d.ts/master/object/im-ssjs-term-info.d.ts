/**
 * 期間情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/TermInfo/index.html
 */
interface TermInfo {
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** ソートキー */
  sortKey: number;
  /** 開始日 */
  startDate: Date;
  /** 期間コード */
  termCd: string;
}
