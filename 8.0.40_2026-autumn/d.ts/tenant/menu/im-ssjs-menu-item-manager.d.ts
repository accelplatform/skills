/**
 * メニューアイテムマネージャ。
 *
 * メニューアイテム情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuItemManager/index.html
 */
declare class MenuItemManager {
  /**
   * メニューアイテムマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * メニューアイテム情報を新規作成します。
   *
   * @param parentMenuId 親メニューID
   * @param menuItem メニューアイテム情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addMenuItem(parentMenuId: string, menuItem: MenuItem): ResultObject<null>;

  /**
   * メニューアイテムをコピーします。
   *
   * コピー先には新しいメニューID が自動生成されます。
   * コピー元のメニューID はコピー先でソース参照として保持されます。
   *
   * @param menuId コピー元メニューID
   * @param parentMenuId コピー先の親メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  copyMenuTree(menuId: string, parentMenuId: string): ResultObject<null>;

  /**
   * メニューアイテム情報を削除します。
   *
   * @param menuId メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteMenuItem(menuId: string): ResultObject<null>;

  /**
   * 子ノードのメニューID リストを取得します。
   *
   * @param menuId メニューID
   * @return data にメニューID の配列を格納した ResultObject
   */
  getChildMenuIds(menuId: string): ResultObject<string[]>;

  /**
   * 子ノードのメニューアイテム情報のリストを取得します。
   *
   * @param menuId メニューID
   * @return data にメニューアイテムの配列を格納した ResultObject
   */
  getChildren(menuId: string): ResultObject<MenuItem[]>;

  /**
   * メニューアイテム情報を取得します。
   *
   * @param menuId メニューID
   * @return data にメニューアイテムを格納した ResultObject
   */
  getMenuItem(menuId: string): ResultObject<MenuItem>;

  /**
   * 指定された URL に紐づくメニューアイテム情報のリストを取得します。
   *
   * @param url URL
   * @return data にメニューアイテムの配列を格納した ResultObject
   */
  getMenuItemsByUrl(url: string): ResultObject<MenuItem[]>;

  /**
   * 指定されたメニューID に紐づくメニュー構成情報を取得します。
   *
   * @param menuId メニューID
   * @return data にメニューツリーを格納した ResultObject
   */
  getMenuNode(menuId: string): ResultObject<MenuTree>;

  /**
   * メニューアイテムを移動します。
   * メニューID とソース参照は変更されません。配下のサブツリーごと移動されます。
   *
   * @param menuId 移動対象メニューID
   * @param parentMenuId 移動先の親メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  moveMenuNode(menuId: string, parentMenuId: string): ResultObject<null>;

  /**
   * メニューアイテム情報を更新します。
   *
   * @param menuItem メニューアイテム情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMenuItem(menuItem: MenuItem): ResultObject<null>;

  /**
   * メニューアイテムID を変更します。
   *
   * @param from 変更前メニューID
   * @param to 変更後メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMenuItemId(from: string, to: string): ResultObject<null>;
}
