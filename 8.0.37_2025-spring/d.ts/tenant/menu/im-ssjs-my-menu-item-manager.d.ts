/**
 * マイメニューアイテムマネージャ。
 *
 * マイメニューアイテム情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MyMenuItemManager/index.html
 */
declare class MyMenuItemManager {
  /**
   * マイメニューアイテムマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * マイメニューアイテム情報を登録するためのカテゴリを新規作成します。
   *
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addMyMenuCategory(userCd: string, clientTypeId: string): ResultObject<null>;

  /**
   * マイメニューアイテム情報を新規作成します。
   *
   * @param userCd ユーザコード
   * @param parentMenuId 親メニューID
   * @param myMenuItem マイメニューアイテム情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addMyMenuItem(userCd: string, parentMenuId: string, myMenuItem: MyMenuItem): ResultObject<null>;

  /**
   * メニューアイテムをマイメニューアイテムにコピーします。
   *
   * @param userCd ユーザコード
   * @param menuId コピー元メニューID
   * @param parentMenuId コピー先の親メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  copy2MyMenu(userCd: string, menuId: string, parentMenuId: string): ResultObject<null>;

  /**
   * マイメニューアイテムをコピーします。
   *
   * @param userCd ユーザコード
   * @param menuId コピー元メニューID
   * @param parentMenuId コピー先の親メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  copyMyMenuTree(userCd: string, menuId: string, parentMenuId: string): ResultObject<null>;

  /**
   * 指定されたユーザに登録されているすべてのマイメニューを削除します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteMyMenu(userCd: string): ResultObject<null>;

  /**
   * マイメニューアイテム情報を削除します。
   *
   * @param userCd ユーザコード
   * @param menuId メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteMyMenuItem(userCd: string, menuId: string): ResultObject<null>;

  /**
   * 子ノードのマイメニューID リストを取得します。
   *
   * @param userCd ユーザコード
   * @param menuId メニューID
   * @return data にメニューID の配列を格納した ResultObject
   */
  getChildMenuIds(userCd: string, menuId: string): ResultObject<string[]>;

  /**
   * 子ノードのマイメニューアイテム情報のリストを取得します。
   *
   * @param userCd ユーザコード
   * @param menuId メニューID
   * @return data にマイメニューアイテムの配列を格納した ResultObject
   */
  getChildren(userCd: string, menuId: string): ResultObject<MyMenuItem[]>;

  /**
   * マイメニューアイテム情報を取得します。
   *
   * @param userCd ユーザコード
   * @param menuId メニューID
   * @return data にマイメニューアイテムを格納した ResultObject
   */
  getMyMenuItem(userCd: string, menuId: string): ResultObject<MyMenuItem>;

  /**
   * 指定された URL に紐づくマイメニューアイテム情報のリストを取得します。
   *
   * @param userCd ユーザコード
   * @param url URL
   * @return data にマイメニューアイテムの配列を格納した ResultObject
   */
  getMyMenuItemsByUrl(userCd: string, url: string): ResultObject<MyMenuItem[]>;

  /**
   * 指定されたマイメニューID に紐づくマイメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param menuId メニューID
   * @return data にマイメニューツリーを格納した ResultObject
   */
  getMyMenuNode(userCd: string, menuId: string): ResultObject<MyMenuTree>;

  /**
   * ルートのマイメニューアイテム情報を取得します。
   *
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @return data にマイメニューアイテムを格納した ResultObject
   */
  getRootMyMenuItem(userCd: string, clientTypeId: string): ResultObject<MyMenuItem>;

  /**
   * ルートのマイメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @return data にマイメニューツリーを格納した ResultObject
   */
  getRootMyMenuTree(userCd: string, clientTypeId: string): ResultObject<MyMenuTree>;

  /**
   * 指定された URL に紐づくマイメニューアイテム情報が存在するかどうかを取得します。
   *
   * @param userCd ユーザコード
   * @param url URL
   * @return data に存在有無を格納した ResultObject（true: 存在する）
   */
  hasMyMenuItemsByUrl(userCd: string, url: string): ResultObject<boolean>;

  /**
   * マイメニューアイテムを移動します。
   *
   * @param userCd ユーザコード
   * @param menuId 移動対象メニューID
   * @param parentMenuId 移動先の親メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  moveMyMenuNode(userCd: string, menuId: string, parentMenuId: string): ResultObject<null>;

  /**
   * マイメニューID を変更します。
   *
   * @param userCd ユーザコード
   * @param from 変更前メニューID
   * @param to 変更後メニューID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMyMenuItemId(userCd: string, from: string, to: string): ResultObject<null>;

  /**
   * マイメニューアイテム情報を更新します。
   *
   * @param userCd ユーザコード
   * @param myMenuItem マイメニューアイテム情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMyMenuItem(userCd: string, myMenuItem: MyMenuItem): ResultObject<null>;
}
