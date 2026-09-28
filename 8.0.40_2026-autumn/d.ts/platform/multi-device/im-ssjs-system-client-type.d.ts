/**
 * システムクライアントタイプ API。
 *
 * システムで利用可能なクライアントタイプ情報を取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SystemClientType/index.html
 */
declare class SystemClientType {
  /**
   * 内部に保持している設定キャッシュをクリアします。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;

  /**
   * 指定されたクライアントタイプ情報を取得します。
   *
   * @param clientTypeId クライアントタイプID
   * @return data にクライアントタイプ情報（未対応ID の場合 null）を格納した ResultObject
   */
  static getClientType(clientTypeId: string): ResultObject<ClientType | null>;

  /**
   * システムで利用可能なすべてのクライアントタイプ情報を取得します。
   *
   * @return data にクライアントタイプ情報の配列を格納した ResultObject
   */
  static getClientTypes(): ResultObject<ClientType[]>;

  /**
   * システムデフォルトクライアントタイプの詳細情報を取得します。
   *
   * @return data にデフォルトクライアントタイプ情報を格納した ResultObject
   */
  static getDefaultClientType(): ResultObject<ClientType>;

  /**
   * システムデフォルトクライアントタイプのID を取得します。
   *
   * @return data にデフォルトクライアントタイプID 文字列を格納した ResultObject
   */
  static getDefaultClientTypeId(): ResultObject<string>;

  /**
   * 指定されたクライアントタイプID がシステムで使用可能かを判定します。
   *
   * @param clientTypeId クライアントタイプID
   * @return data に使用可否（使用可能なら true、使用不可なら false）を格納した ResultObject
   */
  static isAvailableClientTypeId(clientTypeId: string): ResultObject<boolean>;
}
