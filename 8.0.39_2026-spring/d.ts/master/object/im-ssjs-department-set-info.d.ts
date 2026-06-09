/**
 * 組織セット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentSetInfo/index.html
 */
interface DepartmentSetInfo {
  /** 会社コード */
  companyCd: string;
  /** 組織セットコード */
  departmentSetCd: string;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
