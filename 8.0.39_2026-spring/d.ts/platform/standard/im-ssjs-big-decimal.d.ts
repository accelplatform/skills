/**
 * 変更が不可能な任意精度の符号付き10進数を扱うクラス。
 *
 * BigDecimal は、任意精度の「スケールなしの整数値」と、32ビット整数の「スケール」で構成されます。
 * スケールが 0 または正の場合、小数点以下の桁数を表します。
 * スケールが負の場合、スケールなしの値に 10 の絶対値乗を掛けた値になります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/BigDecimal/index.html
 */
declare class BigDecimal {
  /**
   * BigInteger を BigDecimal に変換します（スケール 0）。
   *
   * @param value BigInteger 値
   */
  constructor(value: BigInteger);

  /**
   * BigInteger を、コンテキストの設定に従って丸めを行い、BigDecimal に変換します。
   *
   * @param value BigInteger 値
   * @param mc 丸めのコンテキスト
   */
  constructor(value: BigInteger, mc: MathContext);

  /**
   * スケールなしの値とスケールから BigDecimal を生成します。
   * 値 = unscaledVal × 10⁻ˢᶜᵃˡᵉ
   *
   * @param unscaledVal スケールなしの整数値
   * @param scale スケール
   */
  constructor(unscaledVal: BigInteger, scale: number);

  /**
   * スケールなしの値、スケール、コンテキストから BigDecimal を生成します。
   *
   * @param unscaledVal スケールなしの整数値
   * @param scale スケール
   * @param mc 丸めのコンテキスト
   */
  constructor(unscaledVal: BigInteger, scale: number, mc: MathContext);

  /**
   * Number を、その2進浮動小数点値の正確な10進表現に変換します。
   *
   * @param value 数値
   */
  constructor(value: number);

  /**
   * Number を、コンテキストの設定に従って丸めを行い、BigDecimal に変換します。
   *
   * @param value 数値
   * @param mc 丸めのコンテキスト
   */
  constructor(value: number, mc: MathContext);

  /**
   * 文字列表現を BigDecimal に変換します。
   * 文字列は、オプションの符号 + 数字 + オプションの小数部/指数部で構成されます。
   *
   * @param value 文字列表現
   */
  constructor(value: string);

  /**
   * 文字列表現を、コンテキストの設定に従って丸めを行い、BigDecimal に変換します。
   *
   * @param value 文字列表現
   * @param mc 丸めのコンテキスト
   */
  constructor(value: string, mc: MathContext);

  /**
   * 値がこの BigDecimal の絶対値である BigDecimal を返します（スケールは this.scale()）。
   *
   * @return |this|
   */
  abs(): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた絶対値を返します。
   *
   * @param mc 丸めのコンテキスト
   * @return 丸められた |this|
   */
  abs(mc: MathContext): BigDecimal;

  /**
   * 値が (this + augend) である BigDecimal を返します。
   * スケールは max(this.scale(), augend.scale()) になります。
   *
   * @param augend 加算する値
   * @return this + augend
   */
  add(augend: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた加算を行います。
   *
   * @param augend 加算する値
   * @param mc 丸めのコンテキスト
   * @return 丸められた this + augend
   */
  add(augend: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * この BigDecimal と指定された BigDecimal を比較します。
   * スケールが異なっていても、値が等しい場合は 0 を返します。
   *
   * @param target 比較対象
   * @return this < target の場合 -1、等しい場合 0、this > target の場合 1
   */
  compareTo(target: BigDecimal): number;

  /**
   * 値が (this / divisor) である BigDecimal を返します。
   * 推奨スケールは this.scale() - divisor.scale() です。
   *
   * @param divisor 除数
   * @return this / divisor
   */
  divide(divisor: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた除算を行います。
   *
   * @param divisor 除数
   * @param mc 丸めのコンテキスト
   * @return 丸められた this / divisor
   */
  divide(divisor: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * 指定されたスケールと丸めモードで除算を行います。
   *
   * @param divisor 除数
   * @param scale 結果のスケール
   * @param roundingMode 丸めモード
   * @return this / divisor（指定されたスケールと丸め）
   */
  divide(divisor: BigDecimal, scale: number, roundingMode: RoundingMode): BigDecimal;

  /**
   * this.scale() をスケールとして、指定された丸めモードで除算を行います。
   *
   * @param divisor 除数
   * @param roundingMode 丸めモード
   * @return this / divisor（this.scale() のスケールと指定された丸め）
   */
  divide(divisor: BigDecimal, roundingMode: RoundingMode): BigDecimal;

  /**
   * 商と剰余を返します。
   *
   * @param divisor 除数
   * @return [商, 剰余] の2要素配列
   */
  divideAndRemainder(divisor: BigDecimal): [BigDecimal, BigDecimal];

  /**
   * コンテキストの設定に従って丸めた商と剰余を返します。
   *
   * @param divisor 除数
   * @param mc 丸めのコンテキスト
   * @return [商, 剰余] の2要素配列
   */
  divideAndRemainder(divisor: BigDecimal, mc: MathContext): [BigDecimal, BigDecimal];

  /**
   * 除算の整数部を返します。
   *
   * @param divisor 除数
   * @return this / divisor の整数部
   */
  divideToIntegralValue(divisor: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた除算の整数部を返します。
   *
   * @param divisor 除数
   * @param mc 丸めのコンテキスト
   * @return this / divisor の整数部
   */
  divideToIntegralValue(divisor: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * 指定されたオブジェクトとこの BigDecimal が等しいかどうかを比較します。
   * 値とスケールの両方が等しい場合に true を返します。
   *
   * @param target 比較対象のオブジェクト
   * @return 値とスケールが等しい場合 true
   */
  equals(target: any): boolean;

  /**
   * この BigDecimal と value の最大値を返します。
   *
   * @param value 比較対象
   * @return this と value の大きい方
   */
  max(value: BigDecimal): BigDecimal;

  /**
   * この BigDecimal と value の最小値を返します。
   *
   * @param value 比較対象
   * @return this と value の小さい方
   */
  min(value: BigDecimal): BigDecimal;

  /**
   * 小数点を n 桁左に移動した BigDecimal を返します。
   *
   * @param n 移動する桁数
   * @return 小数点を左に移動した BigDecimal
   */
  movePointLeft(n: number): BigDecimal;

  /**
   * 小数点を n 桁右に移動した BigDecimal を返します。
   *
   * @param n 移動する桁数
   * @return 小数点を右に移動した BigDecimal
   */
  movePointRight(n: number): BigDecimal;

  /**
   * 値が (this × multiplicand) である BigDecimal を返します。
   * スケールは this.scale() + multiplicand.scale() になります。
   *
   * @param multiplicand 乗数
   * @return this × multiplicand
   */
  multiply(multiplicand: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた乗算を行います。
   *
   * @param multiplicand 乗数
   * @param mc 丸めのコンテキスト
   * @return 丸められた this × multiplicand
   */
  multiply(multiplicand: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * 値が (-this) である BigDecimal を返します。
   * スケールは this.scale() です。
   *
   * @return -this
   */
  negate(): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた符号反転値を返します。
   *
   * @param mc 丸めのコンテキスト
   * @return 丸められた -this
   */
  negate(mc: MathContext): BigDecimal;

  /**
   * この BigDecimal を Number に変換します。
   * BigDecimal 値の精度に関する情報が失われる可能性があります。
   *
   * @return 数値
   */
  numberValue(): number;

  /**
   * 値が (this^n) の BigDecimal を返します。
   *
   * @param n べき指数
   * @return this^n
   */
  pow(n: number): BigDecimal;

  /**
   * コンテキストの設定に従って丸めたべき乗を返します。
   *
   * @param n べき指数
   * @param mc 丸めのコンテキスト
   * @return 丸められた this^n
   */
  pow(n: number, mc: MathContext): BigDecimal;

  /**
   * 精度（スケールなしの値の桁数）を返します。
   *
   * @return 精度
   */
  precision(): number;

  /**
   * 値が (this % divisor) である BigDecimal を返します。
   * 注意: モジュロではありません（負の結果になる場合があります）。
   *
   * @param divisor 除数
   * @return this % divisor
   */
  remainder(divisor: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた剰余を返します。
   *
   * MathContext 設定は、剰余の計算に使用する暗黙的な除算に影響を及ぼします。
   * 剰余の計算自体は正確であるため、結果は mc.getPrecision() よりも多くの桁を含む可能性があります。
   *
   * @param divisor 除数
   * @param mc 丸めのコンテキスト（剰余自体ではなく内部の除算に作用する）
   * @return 丸められた this % divisor
   */
  remainder(divisor: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた BigDecimal を返します。
   *
   * 精度設定が 0 の場合、丸めは実行されません。
   *
   * @param mc 丸めのコンテキスト
   * @return 丸められた BigDecimal
   */
  round(mc: MathContext): BigDecimal;

  /**
   * スケールを返します。
   * 0 または正の場合は小数点以下の桁数、負の場合は 10 の絶対値乗の乗数を表します。
   *
   * @return スケール
   */
  scale(): number;

  /**
   * this × 10^n を返します（スケールが調整されます）。
   *
   * @param n 10のべき指数
   * @return this × 10^n
   */
  scaleByPowerOfTen(n: number): BigDecimal;

  /**
   * 指定されたスケールと丸めモードで新しい BigDecimal を返します。
   *
   * @param newScale 新しいスケール
   * @param roundingMode 丸めモード
   * @return 指定されたスケールの BigDecimal
   */
  setScale(newScale: number, roundingMode: RoundingMode): BigDecimal;

  /**
   * この BigDecimal の符号要素を返します。
   *
   * @return 負の場合は -1、ゼロの場合は 0、正の場合は 1
   */
  signum(): number;

  /**
   * 末尾のゼロを除去した、値が等しい BigDecimal を返します。
   *
   * @return 末尾のゼロが除去された BigDecimal
   */
  stripTrailingZeros(): BigDecimal;

  /**
   * 値が (this - subtrahend) である BigDecimal を返します。
   * スケールは max(this.scale(), subtrahend.scale()) になります。
   *
   * @param subtrahend 減算する値
   * @return this - subtrahend
   */
  subtract(subtrahend: BigDecimal): BigDecimal;

  /**
   * コンテキストの設定に従って丸めた減算を行います。
   *
   * @param subtrahend 減算する値
   * @param mc 丸めのコンテキスト
   * @return 丸められた this - subtrahend
   */
  subtract(subtrahend: BigDecimal, mc: MathContext): BigDecimal;

  /**
   * BigInteger に変換します。
   * 精度が失われる場合があります。
   *
   * @return BigInteger 値
   */
  toBigInteger(): BigInteger;

  /**
   * BigInteger に正確に変換します。
   * 小数部がある場合は例外がスローされます。
   *
   * @return BigInteger 値
   * @throws 小数部が存在する場合
   */
  toBigIntegerExact(): BigInteger;

  /**
   * 指数表記を使用しない文字列表現を返します。
   *
   * @return 文字列表現
   */
  toPlainString(): string;

  /**
   * スケールなしの値を BigInteger として返します。
   *
   * @return スケールなしの値
   */
  unscaledValue(): BigInteger;

  /**
   * Number の値を BigDecimal に変換します。
   *
   * @param value 数値
   * @return value と等しいか近似する BigDecimal
   */
  static valueOf(value: number): BigDecimal;
}
