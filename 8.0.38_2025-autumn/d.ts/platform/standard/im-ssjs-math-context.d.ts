/**
 * 数値演算の精度と丸めモードを指定するコンテキストクラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MathContext/index.html
 */
declare class MathContext {
  /**
   * 指定の精度と丸めモードで新しい MathContext を構築します。
   *
   * @param precision 精度（0 以上の整数値）
   * @param roundingMode 丸めモード
   */
  constructor(precision: number, roundingMode: RoundingMode);
}
