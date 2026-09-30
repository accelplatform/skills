/**
 * 文字列変換 API。
 *
 * データをパターン指定でフォーマットされた文字列に変換します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Format/index.html
 */
declare class Format {
  /**
   * Date オブジェクトをフォーマット文字列に変換します。
   * Java VM のタイムゾーンおよびロケールが使用されます。
   *
   * @deprecated DateTimeFormatter#format() を使用してください
   * @param format パターン文字列
   * @param date Date オブジェクト
   * @return フォーマットされた文字列
   */
  static fromDate(format: string, date: Date): string;

  /**
   * 数値をフォーマット文字列に変換します。
   *
   * @param format パターン文字列（0, #, ., , を使用）
   * @param value 数値
   * @return フォーマットされた文字列
   */
  static fromNumber(format: string, value: number): string;

  /**
   * 引数をパターン指定でフォーマットされた文字列に変換します。
   *
   * @param format パターン文字列（%s, %n, %d, %x, %b, %m, %t, %% を使用）
   * @param args データ値（最大16個まで）
   * @return フォーマットされた文字列
   */
  static get(format: string, ...args: any[]): string;

  /**
   * フォーマットされた日付文字列を Date オブジェクトに変換します。
   *
   * @deprecated DateTimeFormatter#parseToDate() を使用してください
   * @param format パターン文字列
   * @param src 日付文字列
   * @return Date オブジェクト。失敗した場合 null
   */
  static toDate(format: string, src: string): Date | null;

  /**
   * 数値を3桁カンマ区切り文字列に変換します。
   * 小数部は最大2桁表示されます。
   *
   * @param value 数値
   * @return カンマ区切りの文字列
   */
  static toMoney(value: number): string;
}
