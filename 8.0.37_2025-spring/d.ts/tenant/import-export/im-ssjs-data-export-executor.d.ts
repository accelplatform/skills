/**
 * データエクスポート実行クラス。
 *
 * エクスポート処理を実行します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DataExportExecutor/index.html
 */
declare class DataExportExecutor {
  /**
   * データエクスポート実行クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エクスポート処理を実行します。
   *
   * @param exporterId エクスポーターID
   * @param stream 出力ストリーム
   * @param option エクスポートオプション
   * @return data にエクスポート結果を格納した ResultObject
   */
  exportData(exporterId: string, stream: ByteWriter, option: { [key: string]: string }): ResultObject<DataExportResult>;

  /**
   * 指定されたエクスポーターID のエクスポーター設定情報を取得します。
   *
   * @param exporterId エクスポーターID
   * @return data にエクスポーター設定情報を格納した ResultObject
   */
  getExporterConfig(exporterId: string): ResultObject<DataExporterConfig>;

  /**
   * 設定されているすべてのエクスポーター設定情報を取得します。
   *
   * @return data にエクスポーター設定情報の配列を格納した ResultObject
   */
  getExporterConfigs(): ResultObject<DataExporterConfig[]>;
}
