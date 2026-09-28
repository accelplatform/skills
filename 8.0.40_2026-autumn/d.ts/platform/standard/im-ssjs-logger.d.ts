/**
 * ログ出力用クラス。
 *
 * TRACE, DEBUG, INFO, WARN, ERROR の5つのログレベルを提供します。
 * フォーマット文字列では {} をプレースホルダーとして使用します。
 *
 * プレースホルダ引数の渡し方：
 * - 1個: `logger.info('msg {}', arg)`
 * - 2個: `logger.info('msg {} {}', arg1, arg2)`
 * - **3個以上: `logger.info('msg {} {} {}', [a, b, c])` ← 配列で渡す**
 *
 * 3個以上のプレースホルダがある場合、個別引数で渡すと3番目以降が出力されないため、
 * 必ず配列にまとめて第2引数として渡してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Logger/index.html
 */
declare class Logger {
  /**
   * DEBUG レベルのログを出力します。
   *
   * @param message メッセージ
   */
  debug(message: string): void;

  /**
   * DEBUG レベルのログをパラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param arg パラメータ
   */
  debug(format: string, arg: any): void;

  /**
   * DEBUG レベルのログを複数パラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param args パラメータ配列
   */
  debug(format: string, args: any[]): void;

  /**
   * DEBUG レベルのログを2パラメータで出力します。
   *
   * @param format フォーマット文字列
   * @param arg1 パラメータ1
   * @param arg2 パラメータ2
   */
  debug(format: string, arg1: any, arg2: any): void;

  /**
   * ERROR レベルのログを出力します。
   *
   * @param message メッセージ
   */
  error(message: string): void;

  /**
   * ERROR レベルのログをパラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param arg パラメータ
   */
  error(format: string, arg: any): void;

  /**
   * ERROR レベルのログを複数パラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param args パラメータ配列
   */
  error(format: string, args: any[]): void;

  /**
   * ERROR レベルのログを2パラメータで出力します。
   *
   * @param format フォーマット文字列
   * @param arg1 パラメータ1
   * @param arg2 パラメータ2
   */
  error(format: string, arg1: any, arg2: any): void;

  /**
   * Logger インスタンスを取得します。
   * ロガー名は呼び出し元の JavaScript ファイルパスから自動生成されます（ファイルセパレータはドットに変換）。
   *
   * @return Logger オブジェクト
   */
  static getLogger(): Logger;

  /**
   * 指定された名前の Logger インスタンスを取得します。
   *
   * @param name ロガー名
   * @return Logger オブジェクト
   */
  static getLogger(name: string): Logger;

  /**
   * INFO レベルのログを出力します。
   *
   * @param message メッセージ
   */
  info(message: string): void;

  /**
   * INFO レベルのログをパラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param arg パラメータ
   */
  info(format: string, arg: any): void;

  /**
   * INFO レベルのログを複数パラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param args パラメータ配列
   */
  info(format: string, args: any[]): void;

  /**
   * INFO レベルのログを2パラメータで出力します。
   *
   * @param format フォーマット文字列
   * @param arg1 パラメータ1
   * @param arg2 パラメータ2
   */
  info(format: string, arg1: any, arg2: any): void;

  /**
   * DEBUG レベルが有効かを判定します。
   *
   * @return 有効な場合 true
   */
  isDebugEnabled(): boolean;

  /**
   * ERROR レベルが有効かを判定します。
   *
   * @return 有効な場合 true
   */
  isErrorEnabled(): boolean;

  /**
   * INFO レベルが有効かを判定します。
   *
   * @return 有効な場合 true
   */
  isInfoEnabled(): boolean;

  /**
   * TRACE レベルが有効かを判定します。
   *
   * @return 有効な場合 true
   */
  isTraceEnabled(): boolean;

  /**
   * WARN レベルが有効かを判定します。
   *
   * @return 有効な場合 true
   */
  isWarnEnabled(): boolean;

  /**
   * TRACE レベルのログを出力します。
   *
   * @param message メッセージ
   */
  trace(message: string): void;

  /**
   * TRACE レベルのログをパラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param arg パラメータ
   */
  trace(format: string, arg: any): void;

  /**
   * TRACE レベルのログを複数パラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param args パラメータ配列
   */
  trace(format: string, args: any[]): void;

  /**
   * TRACE レベルのログを2パラメータで出力します。
   *
   * @param format フォーマット文字列
   * @param arg1 パラメータ1
   * @param arg2 パラメータ2
   */
  trace(format: string, arg1: any, arg2: any): void;

  /**
   * WARN レベルのログを出力します。
   *
   * @param message メッセージ
   */
  warn(message: string): void;

  /**
   * WARN レベルのログをパラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param arg パラメータ
   */
  warn(format: string, arg: any): void;

  /**
   * WARN レベルのログを複数パラメータ置換で出力します。
   *
   * @param format フォーマット文字列
   * @param args パラメータ配列
   */
  warn(format: string, args: any[]): void;

  /**
   * WARN レベルのログを2パラメータで出力します。
   *
   * @param format フォーマット文字列
   * @param arg1 パラメータ1
   * @param arg2 パラメータ2
   */
  warn(format: string, arg1: any, arg2: any): void;
}
