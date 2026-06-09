/**
 * Unicode 変換 API。
 *
 * 文字列の文字コード変換機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Unicode/index.html
 */
declare class Unicode {
  /**
   * 文字列を Unicode に変換します。
   *
   * @param target 変換する文字列
   * @param code 変換元の文字エンコーディング名（Java がサポートする標準エンコーディング名。省略時は server-charset 設定値）
   * @return 変換結果
   */
  static from(target: string, code?: string): string;

  /**
   * Unicode 文字列を他の文字コードに変換します。
   *
   * @param target 変換する文字列
   * @param code 変換先の文字エンコーディング名（Java がサポートする標準エンコーディング名。省略時は server-charset 設定値）
   * @return 変換結果
   */
  static to(target: string, code?: string): string;
}
