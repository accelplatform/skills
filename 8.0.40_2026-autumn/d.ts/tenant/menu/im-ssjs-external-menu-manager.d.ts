/**
 * 外部メニューマネージャ。
 *
 * 外部サービスのメニュー情報にアクセスするためのマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ExternalMenuManager/index.html
 */
declare class ExternalMenuManager {
  /**
   * 外部メニューマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 既定の書式で外部メニューリンク情報をフォーマットします。
   *
   * @param providerId プロバイダID
   * @param menuId メニューID
   * @return data に外部メニューリンクID 文字列を格納した ResultObject
   */
  static createExternalMenuLinkId(providerId: string, menuId: string): ResultObject<string>;

  /**
   * 既定の書式の文字列からプロバイダID とメニューID を取得します。
   *
   * @param string 外部メニューリンクID 文字列
   * @return data に ExternalMenuLinkId を格納した ResultObject
   */
  static parseExternalMenuLinkId(string: string): ResultObject<ExternalMenuLinkId>;

  /**
   * 指定のメニュープロバイダから利用可能なメニュー構成情報を取得します。
   *
   * @param provider メニュープロバイダ
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @param category カテゴリ
   * @return data にメニューツリーの配列を格納した ResultObject
   */
  getAvailableMenuTree(provider: MenuProvider, userCd: string, clientTypeId: string, category: string): ResultObject<MenuTree[]>;

  /**
   * 設定された全メニュープロバイダから利用可能なメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @param category カテゴリ
   * @return data にメニューツリーの配列を格納した ResultObject
   */
  getAvailableMenuTree(userCd: string, clientTypeId: string, category: string): ResultObject<MenuTree[]>;

  /**
   * 指定のメニュープロバイダから管理可能なメニュー構成情報を取得します。
   *
   * @param provider メニュープロバイダ
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @param category カテゴリ
   * @return data にメニューツリーの配列を格納した ResultObject
   */
  getManagedMenuTree(provider: MenuProvider, userCd: string, clientTypeId: string, category: string): ResultObject<MenuTree[]>;

  /**
   * 全メニュープロバイダから管理可能なメニュー構成情報を取得します。
   *
   * @param userCd ユーザコード
   * @param clientTypeId クライアントタイプID
   * @param category カテゴリ
   * @return data にメニューツリーの配列を格納した ResultObject
   */
  getManagedMenuTree(userCd: string, clientTypeId: string, category: string): ResultObject<MenuTree[]>;

  /**
   * 有効な外部メニュープロバイダの一覧を取得します。
   *
   * @return data にメニュープロバイダの配列を格納した ResultObject
   */
  getMenuProviders(): ResultObject<MenuProvider[]>;

  /**
   * 外部メニュープロバイダの一覧を取得します。
   *
   * @param editable 編集可能なプロバイダのみ取得する場合 true
   * @return data にメニュープロバイダの配列を格納した ResultObject
   */
  getMenuProviders(editable: boolean): ResultObject<MenuProvider[]>;

  /**
   * メニュープロバイダを無効化します。
   *
   * @param providerId プロバイダID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  invalidate(providerId: string): ResultObject<null>;

  /**
   * 外部連携が有効かどうかを取得します。
   *
   * @return 有効な場合 true
   */
  isEnable(): boolean;
}
