/**
 * 品目カテゴリリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemCategoryListNodeInfo/index.html
 */
interface ItemCategoryListNodeInfo {
  /** 会社コード */
  companyCd: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 説明 */
  description: string;
  /** 表示名 */
  displayName: string;
  /** 品目カテゴリコード */
  itemCategoryCd: string;
  /** 品目カテゴリセットコード */
  itemCategorySetCd: string;
  /** 略称 */
  shortName: string;
}
