/**
 * 品目カテゴリビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemCategoryBizKeyInfo/index.html
 */
interface ItemCategoryBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 品目カテゴリコード */
  itemCategoryCd: string;
  /** 品目カテゴリセットコード */
  itemCategorySetCd: string;
}
