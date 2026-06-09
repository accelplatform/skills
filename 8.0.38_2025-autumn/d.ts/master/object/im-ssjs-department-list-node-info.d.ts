/**
 * 組織リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentListNodeInfo/index.html
 */
interface DepartmentListNodeInfo {
  /** 会社コード */
  companyCd: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 組織コード */
  departmentCd: string;
  /** 組織セットコード */
  departmentSetCd: string;
  /** 説明 */
  description: string;
  /** 表示名 */
  displayName: string;
  /** 略称 */
  shortName: string;
}
