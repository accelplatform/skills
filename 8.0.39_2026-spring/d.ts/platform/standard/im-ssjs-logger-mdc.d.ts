/**
 * ログ出力用の MDC（Mapped Diagnostic Context）管理 API。
 *
 * ログレイアウト設定で 'X{key}' や 'mdc{key}' パターンで出力できるキー・バリューを管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/LoggerMDC/index.html
 */
declare class LoggerMDC {
  /**
   * MDC のすべてのエントリを削除します。
   * 製品標準のリクエストログが正常に出力されなくなる可能性があります。
   *
   * @deprecated 代替メソッドはありません
   */
  static clear(): void;

  /**
   * 指定されたキーに関連付けられた値を取得します。
   *
   * @param key キー（null 不可）
   * @return 関連付けられた値
   */
  static get(key: string): string;

  /**
   * 現在のスレッドのコンテキストマップにキー・バリューを格納します。
   * 製品標準で使用されているキーと同一のキーを指定した場合、標準ログが正常に出力されなくなります。
   *
   * @param key キー（null 不可）
   * @param value 値
   */
  static put(key: string, value: string): void;

  /**
   * 指定されたキーに関連付けられた値を削除します。
   *
   * @param key キー（null 不可）
   */
  static remove(key: string): void;
}
