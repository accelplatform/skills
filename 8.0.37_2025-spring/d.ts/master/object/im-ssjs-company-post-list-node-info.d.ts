/**
 * 役職リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyPostListNodeInfo/index.html
 */
interface CompanyPostListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 組織セットコード */
  readonly departmentSetCd: string;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 役職コード */
  readonly postCd: string;
  /** ランク */
  readonly rank: number;
}
