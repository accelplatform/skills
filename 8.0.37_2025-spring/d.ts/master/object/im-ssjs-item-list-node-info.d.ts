/**
 * 品目リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemListNodeInfo/index.html
 */
interface ItemListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 品目コード */
  readonly itemCd: string;
  /** 略称 */
  readonly shortName: string;
}
