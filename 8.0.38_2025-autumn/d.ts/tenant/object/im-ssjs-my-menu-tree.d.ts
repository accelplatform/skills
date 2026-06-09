/**
 * マイメニューツリーオブジェクト。
 *
 * マイメニューのツリー構造を表します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MyMenuTree/index.html
 */
interface MyMenuTree {
  /** 子マイメニューツリーの配列 */
  readonly children: MyMenuTree[];
  /** マイメニューアイテム */
  readonly menuItem: MyMenuItem;
  /** ステータス */
  readonly status: string;
}
