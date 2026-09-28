declare namespace Module {
  /**
   * 警告画面表示オブジェクト。
   *
   * @deprecated 代替オブジェクトはありません
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.alert/index.html
   */
  namespace alert {
    /**
     * メッセージ表示後、前ページへ戻る警告画面を表示します。
     *
     * @deprecated 代替メソッドはありません
     * @param messageId メッセージID
     * @param detail 補足メッセージ
     */
    function back(messageId: string, detail?: string): void;

    /**
     * メッセージ表示後、指定ページへ遷移する警告画面を表示します。
     *
     * @deprecated 代替メソッドはありません
     * @param messageId メッセージID
     * @param detail 補足メッセージ
     * @param path 遷移先プログラムパス
     * @param arg 遷移先に渡すパラメータ
     */
    function link(messageId: string, detail: string, path: string, arg?: object): void;

    /**
     * メッセージ表示後、前ページを再読み込みする警告画面を表示します。
     *
     * @deprecated 代替メソッドはありません
     * @param messageId メッセージID
     * @param detail 補足メッセージ
     * @param arg URL パラメータ
     */
    function reload(messageId: string, detail: string, arg?: object): void;

    /**
     * 警告画面を表示します（遷移機能なし）。
     *
     * @deprecated 代替メソッドはありません
     * @param messageId メッセージID
     * @param detail 補足メッセージ
     */
    function write(messageId: string, detail?: string): void;
  }
}
