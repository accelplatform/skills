/**
 * 組織ツリー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentTreeNodeInfo/index.html
 */
interface DepartmentTreeNodeInfo {
  /** 子組織ツリー情報 */
  readonly children: DepartmentTreeNodeInfo[];
  /** 会社コード */
  readonly companyCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 組織コード */
  readonly departmentCd: string;
  /** 組織セットコード */
  readonly departmentSetCd: string;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
