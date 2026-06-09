/**
 * 会社情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyInfo/index.html
 */
interface CompanyInfo {
  /** 会社コード */
  companyCd: string;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
