/**
 * 品目カテゴリセット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemCategorySetInfo/index.html
 */
interface ItemCategorySetInfo {
  /** 会社コード */
  companyCd: string;
  /** 品目カテゴリセットコード */
  itemCategorySetCd: string;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
