/**
 * メニューグループマネージャ。
 *
 * メニューグループ情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuGroupManager/index.html
 */
declare class MenuGroupManager {
  /**
   * メニューグループマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * メニューグループを新規作成します。
   *
   * @param menuGroup メニューグループ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addMenuGroup(menuGroup: MenuGroup): ResultObject<null>;

  /**
   * メニューグループをコピーします。
   * コピー先のメニューグループには新しいID が自動生成されます。
   *
   * @param menuGroupId コピー元メニューグループID
   * @return data にコピー先メニューグループID を格納した ResultObject
   */
  copyMenuGroup(menuGroupId: string): ResultObject<string>;

  /**
   * すべてのメニューグループを削除します。
   *
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAllMenuGroups(): ResultObject<null>;

  /**
   * メニューグループを削除します。
   *
   * @param menuGroupId メニューグループID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteMenuGroup(menuGroupId: string): ResultObject<null>;

  /**
   * すべてのメニューグループID を取得します。
   *
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getAllMenuGroupIds(): ResultObject<string[]>;

  /**
   * すべてのメニューグループを取得します。
   *
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getAllMenuGroups(): ResultObject<MenuGroup[]>;

  /**
   * 表示権限のあるメニューグループID を取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getAvailableMenuGroupIds(category: string): ResultObject<string[]>;

  /**
   * ユーザコードに紐づく表示権限のあるメニューグループID を取得します。
   *
   * @param userCd ユーザコード
   * @param category カテゴリ
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getAvailableMenuGroupIdsWithUser(userCd: string, category: string): ResultObject<string[]>;

  /**
   * 表示権限のあるメニュー構成情報を取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getAvailableMenuTree(category: string): ResultObject<MenuGroup[]>;

  /**
   * メニューグループID に紐づく表示権限のあるメニュー構成情報を取得します。
   * 現在のログインユーザの権限に基づいてフィルタリングされます。
   *
   * @param menuGroupId メニューグループID
   * @return data にメニューグループを格納した ResultObject
   */
  getAvailableMenuTreeWithId(menuGroupId: string): ResultObject<MenuGroup>;

  /**
   * ユーザコード別の表示権限のあるメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getAvailableMenuTreeWithUser(userCd: string, category: string): ResultObject<MenuGroup[]>;

  /**
   * 管理権限のあるメニューグループID を取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getManagedMenuGroupIds(category: string): ResultObject<string[]>;

  /**
   * ユーザコード別の管理権限のあるメニューグループID を取得します。
   *
   * @param userCd ユーザコード
   * @param category カテゴリ
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getManagedMenuGroupIdsWithUser(userCd: string, category: string): ResultObject<string[]>;

  /**
   * 管理権限のあるメニューグループ情報一覧を取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getManagedMenuGroups(category: string): ResultObject<MenuGroup[]>;

  /**
   * 管理権限のあるメニュー構成情報を取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getManagedMenuTree(category: string): ResultObject<MenuGroup[]>;

  /**
   * ユーザコード別の管理権限のあるメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getManagedMenuTreeWithUser(userCd: string, category: string): ResultObject<MenuGroup[]>;

  /**
   * 指定されたメニューグループを取得します。
   *
   * @param menuGroupId メニューグループID
   * @return data にメニューグループを格納した ResultObject
   */
  getMenuGroup(menuGroupId: string): ResultObject<MenuGroup>;

  /**
   * メニューID が属するメニューグループを取得します。
   *
   * @param menuId メニューID
   * @return data にメニューグループを格納した ResultObject
   */
  getMenuGroupByMenuId(menuId: string): ResultObject<MenuGroup>;

  /**
   * メニューグループID のリストを取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループID の配列を格納した ResultObject
   */
  getMenuGroupIds(category: string): ResultObject<string[]>;

  /**
   * メニューグループのリストを取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getMenuGroups(category: string): ResultObject<MenuGroup[]>;

  /**
   * メニュー構成をすべて取得します。
   *
   * @param category カテゴリ
   * @return data にメニューグループの配列を格納した ResultObject
   */
  getMenuTree(category: string): ResultObject<MenuGroup[]>;

  /**
   * メニューグループID に紐づくメニュー構成をすべて取得します。
   *
   * @param menuGroupId メニューグループID
   * @return data にメニューグループを格納した ResultObject
   */
  getMenuTreeWithId(menuGroupId: string): ResultObject<MenuGroup>;

  /**
   * ルートのメニューアイテムを取得します。
   *
   * @param menuGroupId メニューグループID
   * @return data にメニューアイテムを格納した ResultObject
   */
  getRootMenuItem(menuGroupId: string): ResultObject<MenuItem>;

  /**
   * ルートのメニュー構成情報を取得します。
   *
   * @param menuGroupId メニューグループID
   * @return data にメニューツリーを格納した ResultObject
   */
  getRootNode(menuGroupId: string): ResultObject<MenuTree>;

  /**
   * メニューグループにカテゴリを設定します。
   *
   * @param menuGroupId メニューグループID
   * @param category カテゴリID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  setMenuGroupCategory(menuGroupId: string, category: string): ResultObject<null>;

  /**
   * メニュー構成を保存します。
   *
   * @param menuGroupId メニューグループID
   * @param menuTree メニューツリー
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  setMenuTree(menuGroupId: string, menuTree: MenuTree): ResultObject<null>;

  /**
   * メニューグループを更新します。
   *
   * @param menuGroup メニューグループ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMenuGroup(menuGroup: MenuGroup): ResultObject<null>;

  /**
   * メニューグループID を変更します。
   *ID 変更に伴い、関連する認可リソース情報も自動的に更新されます。
   *
   * @param from 変更前メニューグループID
   * @param to 変更後メニューグループID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMenuGroupId(from: string, to: string): ResultObject<null>;
}
