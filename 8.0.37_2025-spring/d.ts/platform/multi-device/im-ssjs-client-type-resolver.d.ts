/**
 * クライアントタイプ判別 API。
 *
 * リクエスト情報に基づいてクライアントタイプを判別します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ClientTypeResolver/index.html
 */
declare class ClientTypeResolver {
  /**
   * リクエスト情報に基づいてクライアントタイプID を判定します。
   *
   * @return data にクライアントタイプID 文字列を格納した ResultObject
   */
  static resolve(): ResultObject<string>;

  /**
   * 内部に保持している設定のクリアを実行します。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;
}
