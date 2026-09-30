/**
 * ソート条件情報オブジェクト。
 *
 * 一覧検索時のソート条件を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/OrderByInfo/index.html
 */
interface OrderByInfo {
  // --- 必須項目 ---

  /** カラム名 */
  columnName: string;
  /** ソート種別（'ASC' または 'DESC'） */
  sortType: OrderByInfo.SortType;
}

declare namespace OrderByInfo {
  type SortType = 'ASC' | 'DESC';
}
