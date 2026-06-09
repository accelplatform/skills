/**
 * 文字列操作ユーティリティ API。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/StringUtil/index.html
 */
declare class StringUtil {
  /**
   * 文字列から制御文字を除去します。
   * C0 制御文字（0x00-0x1F）、DEL（0x7F）、C1 制御文字（0x80-0x9F）を除去します。
   *
   * @param str 対象文字列
   * @param exclusion 除去対象から除外する制御文字
   * @return 制御文字を除去した文字列
   */
  static removeControlCharacter(str: string, ...exclusion: string[]): string;

  /**
   * タブ・改行・復帰を残して制御文字を除去します。
   * タブ（0x09）、LF（0x0a）、CR（0x0d）は除去しません。
   *
   * @param str 対象文字列
   * @return 制御文字を除去した文字列
   */
  static removeControlCharacterWithoutTCL(str: string): string;
}
