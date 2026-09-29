/**
 * IMART タグ引数情報クラス。
 *
 * IMART タグの開始タグと終了タグの間のスクリプト情報を表します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/InnerText/index.html
 */
declare class InnerText {
  /**
   * このオブジェクトが表すスクリプトを実行します。
   * IMART タグが含まれる場合、順次実行されます。
   *
   * @return 実行結果のソースコード
   */
  execute(): string;
}
