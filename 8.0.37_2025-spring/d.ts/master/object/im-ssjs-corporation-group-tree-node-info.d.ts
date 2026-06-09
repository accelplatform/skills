/**
 * 法人グループツリー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationGroupTreeNodeInfo/index.html
 */
interface CorporationGroupTreeNodeInfo {
  /** 子法人グループツリー情報 */
  readonly children: CorporationGroupTreeNodeInfo[];
  /** 会社コード */
  readonly companyCd: string;
  /** 法人グループコード */
  readonly corporationGroupCd: string;
  /** 法人グループセットコード */
  readonly corporationGroupSetCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
