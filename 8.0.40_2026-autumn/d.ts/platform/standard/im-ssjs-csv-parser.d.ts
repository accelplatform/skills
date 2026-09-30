/**
 * CSV 解析 API。
 *
 * CSV 形式で書かれている文字列から2次元配列を作成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/CSVParser/index.html
 */
declare class CSVParser {
  /**
   * CSV 形式の文字列の解析を行います。
   * CSV 形式のデータが保管されている文字列を2次元配列データに変換します。
   *
   * @param csvtext CSV 形式の文字列
   * @param delimita CSV 形式の区切り文字（半角1文字で指定。' ', '\t', ',' など）
   * @return 文字列の2次元配列データ
   */
  static parse(csvtext: string, delimita: string): string[][];
}
