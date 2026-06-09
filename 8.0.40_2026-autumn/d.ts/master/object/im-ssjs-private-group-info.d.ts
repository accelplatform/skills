/**
 * プライベートグループ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PrivateGroupInfo/index.html
 */
interface PrivateGroupInfo {
  /** 備考 */
  notes: string;
  /** プライベートグループコード */
  privateGroupCd: string;
  /** プライベートグループ名 */
  privateGroupName: string;
  /** プライベートグループ検索名 */
  privateGroupSearchName: string;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
  /** オーナーユーザコード */
  userCd: string;
}
