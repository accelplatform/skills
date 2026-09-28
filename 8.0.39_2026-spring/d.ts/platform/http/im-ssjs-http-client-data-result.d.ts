/**
 * HTTP クライアントデータ結果オブジェクト。
 *
 * サーバからのレスポンス情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HttpClientDataResult/index.html
 */
interface HttpClientDataResult {
  /** レスポンスのコンテントレングス */
  readonly contentLength: number;
  /** レスポンスヘッダの配列 */
  readonly responseHeaders: HttpClientHeader[];
  /** HTTP ステータスコード */
  readonly status: number;

  /**
   * すべてのコンテントを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * バイナリ読み込み用としてレスポンスを開きます。
   *
   * @param callback コールバック関数（指定時は自動でリソース解放）
   * @return ByteReader
   */
  openAsBinary(callback?: Function): ByteReader;

  /**
   * テキスト読み込み用としてレスポンスを開きます。
   *
   * @param callback コールバック関数（指定時は自動でリソース解放）
   * @param charsetName 文字セット名
   * @return TextReader
   */
  openAsText(callback?: Function, charsetName?: string): TextReader;
}
