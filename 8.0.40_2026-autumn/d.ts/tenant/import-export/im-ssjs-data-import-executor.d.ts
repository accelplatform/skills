/**
 * データインポート実行クラス。
 *
 * インポート処理を実行します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DataImportExecutor/index.html
 */
declare class DataImportExecutor {
  /**
   * データインポート実行クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * 指定されたインポーターID のインポーター設定情報を取得します。
   *
   * @param importerId インポーターID
   * @return data にインポーター設定情報を格納した ResultObject
   */
  getImporterConfig(importerId: string): ResultObject<DataImporterConfig>;

  /**
   * 設定されているすべてのインポーター設定情報を取得します。
   *
   * @return data にインポーター設定情報の配列を格納した ResultObject
   */
  getImporterConfigs(): ResultObject<DataImporterConfig[]>;

  /**
   * インポート処理を実行します。
   *
   * @param importerId インポーターID
   * @param stream 入力ストリーム
   * @param option インポートオプション
   * @return data にインポート結果を格納した ResultObject
   */
  importData(importerId: string, stream: ByteReader, option: { [key: string]: string | number | boolean | Date }): ResultObject<DataImportResult>;
}
