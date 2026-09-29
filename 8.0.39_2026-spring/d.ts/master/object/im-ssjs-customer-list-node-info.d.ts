/**
 * 取引先リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CustomerListNodeInfo/index.html
 */
interface CustomerListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 取引先コード */
  readonly customerCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
