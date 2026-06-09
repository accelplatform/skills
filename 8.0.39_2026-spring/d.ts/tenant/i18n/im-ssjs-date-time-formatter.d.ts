/**
 * 日時フォーマッタ API。
 *
 * フォーマットパターンを指定して、日付/時刻情報の整形・解析を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DateTimeFormatter/index.html
 */
declare class DateTimeFormatter {
  /**
   * フォーマットパターンに基づいて Date を日付/時刻文字列に整形します。
   *
   * @param pattern フォーマットパターン
   * @param date 整形対象の Date
   * @param localeId ロケールID
   * @return 整形された日付/時刻文字列
   */
  static format(pattern: string, date: Date, localeId?: string): string;

  /**
   * フォーマットパターンとタイムゾーンに基づいて Date を日付/時刻文字列に整形します。
   *
   * @param pattern フォーマットパターン
   * @param date 整形対象の Date
   * @param timezone タイムゾーン
   * @param localeId ロケールID
   * @return 整形された日付/時刻文字列
   */
  static format(pattern: string, date: Date, timezone: TimeZone, localeId?: string): string;

  /**
   * フォーマットパターンに基づいて DateTime を日付/時刻文字列に整形します。
   *
   * @param pattern フォーマットパターン
   * @param dateTime 整形対象の DateTime
   * @param localeId ロケールID
   * @return 整形された日付/時刻文字列
   */
  static format(pattern: string, dateTime: DateTime, localeId?: string): string;

  /**
   * 文字列を解析して DateTime を生成します。
   *
   * @param pattern フォーマットパターン
   * @param text 解析対象の文字列
   * @param localeId ロケールID
   * @return 解析された DateTime
   */
  static parseToDateTime(pattern: string, text: string, localeId?: string): DateTime;

  /**
   * タイムゾーンを指定して文字列を解析し DateTime を生成します。
   *
   * @param pattern フォーマットパターン
   * @param text 解析対象の文字列
   * @param timezone タイムゾーン
   * @param localeId ロケールID
   * @return 解析された DateTime
   */
  static parseToDateTime(pattern: string, text: string, timezone: TimeZone, localeId?: string): DateTime;

  /**
   * 文字列を解析して Date を生成します。
   *
   * @param pattern フォーマットパターン
   * @param text 解析対象の文字列
   * @param localeId ロケールID
   * @return 解析された Date
   */
  static parseToDate(pattern: string, text: string, localeId?: string): Date;

  /**
   * タイムゾーンを指定して文字列を解析し Date を生成します。
   *
   * @param pattern フォーマットパターン
   * @param text 解析対象の文字列
   * @param timezone タイムゾーン
   * @param localeId ロケールID
   * @return 解析された Date
   */
  static parseToDate(pattern: string, text: string, timezone: TimeZone, localeId?: string): Date;
}
