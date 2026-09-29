/**
 * メニューツリーオブジェクト。
 *
 * メニューのツリー構造を表します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuTree/index.html
 */
interface MenuTree {
  /** 子メニューツリーの配列 */
  children: MenuTree[];
  /** メニューアイテム */
  menuItem: MenuItem;
  /** ステータス */
  status: string;
}
