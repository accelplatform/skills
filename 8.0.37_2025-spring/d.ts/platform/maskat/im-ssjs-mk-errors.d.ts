/**
 * マスカット（Maskat）用エラーコレクションクラス。
 *
 * MKError を集約し、throw することでマスカットにエラー情報を送信します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MKErrors/index.html
 */
declare class MKErrors {
  /**
   * マスカット（Maskat）用エラーコレクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エラー要素を追加します。
   *
   * @param error エラー要素
   */
  addError(error: MKError): void;

  /**
   * エラー要素の個数を取得します。
   *
   * @return エラー要素数
   */
  size(): number;
}
