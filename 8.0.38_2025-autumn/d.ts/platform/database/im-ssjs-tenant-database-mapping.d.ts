/**
 * テナントデータベース設定情報操作 API。
 *
 * テナントデータベースの設定を管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TenantDatabaseMapping/index.html
 */
declare class TenantDatabaseMapping {
  /**
   * テナントデータベースをバインドします。
   *
   * @param tenantId テナントID
   * @param resourceRefName JNDI データソース名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static bind(tenantId: string, resourceRefName: string): ResultObject<null>;

  /**
   * テナントデータベース設定を取得します。
   *
   * @param tenantId テナントID（省略時はコンテキストから解決）
   * @return data にテナントデータベース設定情報（存在しない場合 null）を格納した ResultObject
   */
  static getMappingInfo(tenantId?: string): ResultObject<DatabaseMappingInfo | null>;

  /**
   * すべてのテナントデータベース設定を取得します。
   *
   * @return data にすべてのテナントデータベース設定情報の配列を格納した ResultObject
   */
  static getMappingInfos(): ResultObject<DatabaseMappingInfo[]>;

  /**
   * 既存のテナントデータベース接続先を更新します。
   *
   * @param tenantId テナントID
   * @param resourceRefName 新しい JNDI データソース名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static rebind(tenantId: string, resourceRefName: string): ResultObject<null>;

  /**
   * テナントデータベース設定を削除します。
   *
   * @param tenantId テナントID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static unbind(tenantId: string): ResultObject<null>;
}
