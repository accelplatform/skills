/**
 * 品目カテゴリツリー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemCategoryTreeNodeInfo/index.html
 */
interface ItemCategoryTreeNodeInfo {
  /** 子品目カテゴリツリー情報 */
  readonly children: ItemCategoryTreeNodeInfo[];
  /** 会社コード */
  readonly companyCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 品目カテゴリコード */
  readonly itemCategoryCd: string;
  /** 品目カテゴリセットコード */
  readonly itemCategorySetCd: string;
  /** 略称 */
  readonly shortName: string;
}
