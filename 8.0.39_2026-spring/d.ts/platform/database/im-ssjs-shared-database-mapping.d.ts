/**
 * シェアードデータベース設定情報操作 API。
 *
 * アプリケーション再起動なしにシェアードデータベースの設定を管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SharedDatabaseMapping/index.html
 */
declare class SharedDatabaseMapping {
  /**
   * シェアードデータベースを接続ID にバインドします。
   *
   * @param connectId 接続ID
   * @param resourceRefName JNDI データソース名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static bind(connectId: string, resourceRefName: string): ResultObject<null>;

  /**
   * 指定された接続ID のシェアードデータベース設定を取得します。
   *
   * @param connectId 接続ID
   * @return data に設定情報（存在しない場合 null）を格納した ResultObject
   */
  static getMappingInfo(connectId: string): ResultObject<DatabaseMappingInfo | null>;

  /**
   * すべてのシェアードデータベース設定を取得します。
   *
   * @return data にすべての設定情報の配列を格納した ResultObject
   */
  static getMappingInfos(): ResultObject<DatabaseMappingInfo[]>;

  /**
   * 既存のシェアードデータベース接続先を更新します。
   *
   * @param connectId 接続ID
   * @param resourceRefName 新しい JNDI データソース名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static rebind(connectId: string, resourceRefName: string): ResultObject<null>;

  /**
   * シェアードデータベース設定を削除します。
   *
   * @param connectId 接続ID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static unbind(connectId: string): ResultObject<null>;
}
