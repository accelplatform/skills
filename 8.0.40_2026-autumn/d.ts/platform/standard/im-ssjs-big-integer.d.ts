/**
 * 変更が不可能な任意精度の整数を扱うクラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/BigInteger/index.html
 */
declare class BigInteger {
  /**
   * BigInteger の10進 String 表現を BigInteger に変換します。
   *
   * @param value 10進数の文字列表現
   */
  constructor(value: string);

  /**
   * 値がこの BigInteger の絶対値である BigInteger を返します。
   *
   * @return 絶対値の BigInteger
   */
  abs(): BigInteger;

  /**
   * 値が (this + value) である BigInteger を返します。
   *
   * @param value 加算する値
   * @return this + value
   */
  add(value: BigInteger): BigInteger;

  /**
   * この BigInteger を指定された BigInteger と比較します。
   *
   * @param value 比較対象の BigInteger
   * @return この BigInteger が value より小さい場合は -1、等しい場合は 0、大きい場合は 1
   */
  compareTo(value: BigInteger): number;

  /**
   * 値が (this / value) である BigInteger を返します。
   *
   * @param value 除算する値
   * @return this / value
   */
  divide(value: BigInteger): BigInteger;

  /**
   * (this / value) と (this % value) の2つの BigInteger の配列を返します。
   *
   * @param value 除算する値
   * @return [商, 剰余] の配列
   */
  divideAndRemainder(value: BigInteger): BigInteger[];

  /**
   * この BigInteger と指定された Object が等しいかどうかを比較します。
   *
   * @param target 比較対象のオブジェクト
   * @return 等しい場合 true
   */
  equals(target: any): boolean;

  /**
   * この BigInteger と value の最大値を返します。
   *
   * @param value 比較対象の BigInteger
   * @return this と value の大きい方
   */
  max(value: BigInteger): BigInteger;

  /**
   * この BigInteger と value の最小値を返します。
   *
   * @param value 比較対象の BigInteger
   * @return this と value の小さい方
   */
  min(value: BigInteger): BigInteger;

  /**
   * 値が (this * value) である BigInteger を返します。
   *
   * @param value 乗算する値
   * @return this * value
   */
  multiply(value: BigInteger): BigInteger;

  /**
   * 値が (-this) である BigInteger を返します。
   *
   * @return 符号を反転した BigInteger
   */
  negate(): BigInteger;

  /**
   * この BigInteger を Number に変換します。
   * BigInteger 値の精度に関する情報が失われる可能性があります。
   *
   * @return 数値
   */
  numberValue(): number;

  /**
   * 値が (this^exponent) の BigInteger を返します。
   *
   * @param exponent 指数（0以上の整数）
   * @return this の exponent 乗
   */
  pow(exponent: number): BigInteger;

  /**
   * 値が (this % value) である BigInteger を返します。
   *
   * @param value 除算する値
   * @return this % value
   */
  remainder(value: BigInteger): BigInteger;

  /**
   * この BigInteger の符号要素を返します。
   *
   * @return 負の場合は -1、ゼロの場合は 0、正の場合は 1
   */
  signum(): number;

  /**
   * 値が (this - value) である BigInteger を返します。
   *
   * @param value 減算する値
   * @return this - value
   */
  subtract(value: BigInteger): BigInteger;

  /**
   * この BigInteger の10進 String 表現を返します。
   *
   * @return 10進数の文字列表現
   */
  toString(): string;

  /**
   * 値が指定された Number の値と等しい BigInteger を返します。
   *
   * @param value 数値（整数）
   * @return 指定された値の BigInteger
   */
  static valueOf(value: number): BigInteger;
}
