/**
 * 組織分類項目リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentCtgItmListNodeInfo/index.html
 */
interface DepartmentCtgItmListNodeInfo {
  /** 分類コード */
  readonly categoryCd: string;
  /** 分類項目コード */
  readonly categoryItemCd: string;
  /** 会社コード */
  readonly companyCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
}
