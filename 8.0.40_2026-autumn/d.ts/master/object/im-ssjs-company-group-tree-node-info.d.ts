/**
 * 会社グループツリー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyGroupTreeNodeInfo/index.html
 */
interface CompanyGroupTreeNodeInfo {
  /** 子会社グループツリー情報 */
  readonly children: CompanyGroupTreeNodeInfo[];
  /** 会社グループコード */
  readonly companyGroupCd: string;
  /** 会社グループセットコード */
  readonly companyGroupSetCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
