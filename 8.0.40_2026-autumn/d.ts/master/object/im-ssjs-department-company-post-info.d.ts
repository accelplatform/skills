/**
 * 組織・役職リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentCompanyPostInfo/index.html
 */
interface DepartmentCompanyPostInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 組織コード */
  readonly departmentCd: string;
  /** 組織名 */
  readonly departmentName: string;
  /** 組織セットコード */
  readonly departmentSetCd: string;
  /** 組織略称 */
  readonly departmentShortName: string;
  /** 役職コード */
  readonly postCd: string;
  /** 役職名 */
  readonly postName: string;
  /** ランク */
  readonly rank: number;
  /** ユーザコード */
  readonly userCd: string;
}
