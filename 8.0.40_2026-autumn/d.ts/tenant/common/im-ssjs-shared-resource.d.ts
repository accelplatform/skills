/**
 * リソース排他制御クラス。
 *
 * リソースの一意な表現とロック管理・共有機能を提供します。
 * テナント単位でのリソースロックを実現します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SharedResource/index.html
 */
declare class SharedResource {
  /**
   * SharedResource クラスのインスタンスを生成します。
   *
   * @param application アプリケーション名（任意の文字列）
   * @param businessKeys リソースを一意に表すキーバリュー
   */
  constructor(application: string, businessKeys: SharedResource.BusinessKeys);

  /**
   * アプリケーション名を取得します。
   *
   * @return アプリケーション名
   */
  getApplication(): string;

  /**
   * 業務キーを取得します。
   *
   * @return 業務キーオブジェクト
   */
  getBusinessKeys(): SharedResource.BusinessKeys;

  /**
   * この SharedResource を一意に表すキーを返却します。
   *
   * @return 一意キー文字列
   */
  getKey(): string;

  /**
   * ロックを獲得します。
   * timeout に 0 を指定した場合、ロック解除まで待機します。
   *
   * @param timeout タイムアウト（秒）。ミリ秒ではないので注意すること
   * @return 成功した場合 true、失敗した場合 false
   */
  tryLock(timeout: number): boolean;

  /**
   * ロック獲得後、クライアント側に対してロック獲得を通知します。
   *
   * @param timeout タイムアウト（秒）。ミリ秒ではないので注意すること
   * @return 成功した場合 true、失敗した場合 false
   */
  tryLockAndNotify(timeout: number): boolean;

  /**
   * ロック獲得後、処理を実行し完了後にロックを解放します。
   *
   * @param func 実行する関数
   * @param timeout タイムアウト（秒）。ミリ秒ではないので注意すること
   * @return 成功した場合 true、失敗した場合 false
   */
  run(func: Function, timeout: number): boolean;

  /**
   * ロック獲得・解放時にクライアントへ通知します。
   *
   * @param func 実行する関数
   * @param timeout タイムアウト（秒）。ミリ秒ではないので注意すること
   * @return 成功した場合 true、失敗した場合 false
   */
  runAndNotify(func: Function, timeout: number): boolean;

  /**
   * ロックを解放します。
   */
  unlock(): void;

  /**
   * ロック解放後、クライアントに対して通知します。
   */
  unlockAndNotify(): void;

  /**
   * クライアントに対してリソース更新を通知します。
   */
  notifyUpdate(): void;
}

declare namespace SharedResource {
  type BusinessKeys = { [key: string]: string };
}
