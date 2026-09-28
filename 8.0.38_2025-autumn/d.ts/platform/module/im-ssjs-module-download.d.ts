declare namespace Module {
  /**
   * ダウンロードオブジェクト。
   *
   * サーバからクライアントへのファイルダウンロード機能を提供します。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.download/index.html
   */
  namespace download {
    /**
     * データまたはファイルをダウンロード送信します。
     *
     * @param source 送信データ文字列、File、または Storage オブジェクト
     * @param name ダウンロード時のファイル名
     * @param mime MIME タイプ
     */
    function send(source: string | File | PublicStorage | SystemStorage | SessionScopeStorage, name?: string, mime?: string): void;
  }
}
