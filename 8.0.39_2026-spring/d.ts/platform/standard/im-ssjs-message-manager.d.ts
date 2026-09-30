/**
 * メッセージマネージャ。
 *
 * ユーザロケールまたは指定ロケールでメッセージを取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MessageManager/index.html
 */
declare class MessageManager {
  /**
   * 指定されたロケールでメッセージを取得します。
   *
   * @param localeId ロケールID
   * @param key メッセージキー
   * @param args プレースホルダ置換用の引数
   * @return メッセージ文字列
   */
  static getLocaleMessage(localeId: string, key: string, ...args: MessageManager.Argument[]): string;

  /**
   * 現在のユーザのロケールでメッセージを取得します。
   *
   * @param key メッセージキー
   * @param args プレースホルダ置換用の引数
   * @return メッセージ文字列
   */
  static getMessage(key: string, ...args: MessageManager.Argument[]): string;

  /**
   * 指定されたロケールでメッセージが存在するかを判定します。
   *
   * @param localeId ロケールID
   * @param key メッセージキー
   * @return メッセージが存在する場合 true
   */
  static hasLocaleMessage(localeId: string, key: string): boolean;

  /**
   * 現在のユーザのロケールでメッセージが存在するかを判定します。
   *
   * @param key メッセージキー
   * @return メッセージが存在する場合 true
   */
  static hasMessage(key: string): boolean;
}

declare namespace MessageManager {
  type Argument = any;
}
