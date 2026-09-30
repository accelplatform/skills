/**
 * アプリケーション・ロック管理 API。
 *
 * アプリケーション・ロックの制御を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/NewLock/index.html
 */
declare class NewLock {
  /**
   * アプリケーションロックを取得します。
   * ロック取得までブロックします。
   *
   * @param name ロックカテゴリキーワード
   * @return 成功した場合 true、失敗した場合 false
   */
  static lock(name: string): boolean;

  /**
   * リクエストスコープのアプリケーションロックを取得します。
   * リクエスト完了時に自動解放されます。ロック取得までブロックします。
   *
   * @param name ロックカテゴリキーワード
   * @return 成功した場合 true、失敗した場合 false
   */
  static lockRequestScope(name: string): boolean;

  /**
   * ロックを取得し、関数を実行後に自動解放します。
   *
   * @param name ロックカテゴリキーワード
   * @param func 実行する関数
   * @param timeout ロック取得の待機時間（秒）
   * @return 成功した場合 true、失敗した場合 false
   */
  static run(name: string, func: Function, timeout: number): boolean;

  /**
   * タイムアウト付きでロックを取得します。
   * timeout が 0 の場合は無期限に待機します。
   *
   * @param name ロックカテゴリキーワード
   * @param timeout 待機時間（秒、0 で無期限）
   * @return 成功した場合 true、失敗した場合 false
   */
  static tryLock(name: string, timeout: number): boolean;

  /**
   * タイムアウト付きでリクエストスコープのロックを取得します。
   * リクエスト完了時に自動解放されます。
   *
   * @param name ロックカテゴリキーワード
   * @param timeout 最大待機時間（秒）
   * @return 成功した場合 true、失敗した場合 false
   */
  static tryLockRequestScope(name: string, timeout: number): boolean;

  /**
   * アプリケーションロックを解放します。
   *
   * @param name ロックカテゴリキーワード
   * @return 成功した場合 true、失敗した場合 false
   */
  static unlock(name: string): boolean;
}
