/**
 * パブリックグループセット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupSetInfo/index.html
 */
interface PublicGroupSetInfo {
  /** パブリックグループセットコード */
  publicGroupSetCd: string;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
