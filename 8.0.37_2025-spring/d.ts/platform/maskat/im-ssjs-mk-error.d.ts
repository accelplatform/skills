/**
 * マスカット（Maskat）用エラー要素クラス。
 *
 * マスカットに送信するエラー要素を構築します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MKError/index.html
 */
declare class MKError {
  /**
   * マスカット（Maskat）用エラー要素クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エラーコードを設定します。
   *
   * @param errorCode エラーコード
   */
  setErrorCode(errorCode: string): void;

  /**
   * 補足情報を設定します。
   *
   * @param info 補足情報
   */
  setInfo(info: string): void;

  /**
   * メッセージを設定します。
   *
   * @param message メッセージ
   */
  setMessage(message: string): void;

  /**
   * メッセージコードを設定します。
   *
   * @param messageCode メッセージコード
   */
  setMessageCode(messageCode: string): void;

  /**
   * システムエラーメッセージを設定します。
   *
   * @param systemErrorMessage システムエラーメッセージ
   */
  setSystemErrorMessage(systemErrorMessage: string): void;
}
