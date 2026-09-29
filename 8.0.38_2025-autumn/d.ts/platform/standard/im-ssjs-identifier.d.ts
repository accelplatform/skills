/**
 * ユニークID 生成 API。
 *
 * 分散環境を含めてシステム一意なID を生成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Identifier/index.html
 */
declare class Identifier {
  /**
   * ユニークなID を生成して返します。
   * 15バイトの文字列で、時間に対してユニークです。
   *
   * @return 15文字のユニークID
   */
  static get(): string;
}
