/**
 * 組織ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentBizKeyInfo/index.html
 */
interface DepartmentBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 組織コード */
  departmentCd: string;
  /** 組織セットコード */
  departmentSetCd: string;
}
