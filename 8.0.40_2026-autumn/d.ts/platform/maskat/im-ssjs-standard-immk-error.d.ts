/**
 * マスカット（Maskat）用標準エラー要素クラス。
 *
 * マスカットに送信する標準エラー要素を構築します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/StandardImmkError/index.html
 */
declare class StandardImmkError {
  /**
   * マスカット（Maskat）用標準エラー要素クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エラーID を設定します。
   *
   * @param id エラーID
   */
  setId(id: string): void;

  /**
   * メッセージを設定します。
   *
   * @param message メッセージまたはメッセージコード
   */
  setMessage(message: string): void;
}
