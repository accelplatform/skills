/**
 * 数値フォーマッタ API。
 *
 * 設定ファイルに記述したフォーマット情報を元に、数値文字列の整形および解析を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DecimalFormatter/index.html
 */
declare class DecimalFormatter {
  /**
   * 指定したフォーマットID でインスタンスを生成します。
   *
   * @param formatId フォーマットID
   * @return DecimalFormatter インスタンス
   */
  static getInstance(formatId: string): DecimalFormatter;

  /**
   * 現在のアカウントコンテキストに紐付くフォーマットでインスタンスを生成します。
   *
   * @return DecimalFormatter インスタンス
   */
  static getAccountInstance(): DecimalFormatter;

  /**
   * BigDecimal を整形して文字列に変換します。
   *
   * @param num 整形対象の BigDecimal
   * @return 整形された数値文字列
   */
  format(num: BigDecimal): string;

  /**
   * BigInteger を整形して文字列に変換します。
   *
   * @param num 整形対象の BigInteger
   * @return 整形された数値文字列
   */
  format(num: BigInteger): string;

  /**
   * 数値を整形して文字列に変換します。
   *
   * @param num 整形対象の数値
   * @return 整形された数値文字列
   */
  format(num: number): string;

  /**
   * 文字列を解析して BigDecimal に変換します。
   *
   * @param text 解析対象の数値文字列
   * @return 解析された BigDecimal
   */
  parseToBigDecimal(text: string): BigDecimal;

  /**
   * 文字列を解析して数値に変換します。
   *
   * @param text 解析対象の数値文字列
   * @return 解析された数値
   */
  parseToNumber(text: string): number;

  /**
   * グループ化の使用を設定します。
   *
   * @param newValue グループ化を使用する場合 true
   */
  setGroupingUsed(newValue: boolean): void;

  /**
   * 小数部分の最大桁数を設定します。
   *
   * @param newValue 最大桁数
   */
  setMaximumFractionDigits(newValue: number): void;

  /**
   * 整数部分の最大桁数を設定します。
   *
   * @param newValue 最大桁数
   */
  setMaximumIntegerDigits(newValue: number): void;

  /**
   * 小数部分の最小桁数を設定します。
   *
   * @param newValue 最小桁数
   */
  setMinimumFractionDigits(newValue: number): void;

  /**
   * 整数部分の最小桁数を設定します。
   *
   * @param newValue 最小桁数
   */
  setMinimumIntegerDigits(newValue: number): void;

  /**
   * 丸めモードを設定します。
   *
   * @param roundingMode 丸めモード
   */
  setRoundingMode(roundingMode: RoundingMode): void;
}
