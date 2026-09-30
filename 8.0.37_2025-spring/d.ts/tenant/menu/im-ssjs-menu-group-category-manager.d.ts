/**
 * メニューグループカテゴリマネージャ。
 *
 * メニューグループカテゴリ情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuGroupCategoryManager/index.html
 */
declare class MenuGroupCategoryManager {
  /**
   * メニューグループカテゴリマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * メニューグループカテゴリ情報を新規作成します。
   *
   * @param category メニューグループカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addCategory(category: MenuGroupCategory): ResultObject<null>;

  /**
   * メニューグループカテゴリ情報を削除します。
   *
   * @param category カテゴリID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteCategory(category: string): ResultObject<null>;

  /**
   * すべてのメニューグループカテゴリ情報を取得します。
   *
   * @return data にメニューグループカテゴリ情報の配列を格納した ResultObject
   */
  getAllCategories(): ResultObject<MenuGroupCategory[]>;

  /**
   * メニューグループカテゴリ情報を取得します。
   *
   * @param category カテゴリID
   * @return data にメニューグループカテゴリ情報を格納した ResultObject
   */
  getCategory(category: string): ResultObject<MenuGroupCategory>;

  /**
   * メニューグループカテゴリ情報を更新します。
   *
   * @param category メニューグループカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateCategory(category: MenuGroupCategory): ResultObject<null>;
}
