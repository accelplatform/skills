/**
 * パブリックグループツリー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupTreeNodeInfo/index.html
 */
interface PublicGroupTreeNodeInfo {
  /** 子パブリックグループツリー情報 */
  readonly children: PublicGroupTreeNodeInfo[];
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** パブリックグループコード */
  readonly publicGroupCd: string;
  /** パブリックグループセットコード */
  readonly publicGroupSetCd: string;
  /** 略称 */
  readonly shortName: string;
}
