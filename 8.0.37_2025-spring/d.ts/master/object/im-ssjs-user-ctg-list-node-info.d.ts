/**
 * ユーザ分類区分リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserCtgListNodeInfo/index.html
 */
interface UserCtgListNodeInfo {
  /** 分類コード */
  readonly categoryCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
}
