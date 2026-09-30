/**
 * メニューグループオブジェクト。
 *
 * メニューグループに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuGroup/index.html
 */
interface MenuGroup {
  /** メニューグループカテゴリ */
  category: MenuGroupCategory;
  /** メニューグループID */
  menuGroupId: string;
  /** メニューID */
  menuId: string;
  /** ルートメニューツリー */
  root: MenuTree;
}
