/**
 * マスカット（Maskat）用標準エラーコレクションクラス。
 *
 * StandardImmkError を集約し、throw することでマスカットに XML 形式のエラー情報を送信します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/StandardImmkErrors/index.html
 */
declare class StandardImmkErrors {
  /**
   * マスカット（Maskat）用標準エラーコレクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エラー要素を追加します。
   *
   * @param error エラー要素
   */
  addError(error: StandardImmkError): void;

  /**
   * エラータイプを設定します。
   *
   * @param errorType エラータイプ
   */
  setErrorType(errorType: string): void;

  /**
   * エラー要素の個数を取得します。
   *
   * @return エラー要素数
   */
  size(): number;
}
