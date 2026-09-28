declare namespace Module {
  /**
   * 元号操作オブジェクト。
   *
   * 日本の元号を扱います。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.calendar/index.html
   */
  namespace calendar {
    /**
     * 指定された日付に該当する元号名を取得します。
     *
     * @param target 対象日付
     * @return 元号名
     */
    function getName(target: Date): string;

    /**
     * 全ての設定済み元号データをオブジェクト形式で取得します。
     *
     * @return 元号データオブジェクト
     */
    function getObject(): object;

    /**
     * 指定日付が属する元号内での年数を算出します。
     *
     * @param target 対象日付
     * @return 元号内の年数
     */
    function getYear(target: Date): number;

    /**
     * 新しい元号情報を登録します。
     *
     * @param name 元号名称
     * @param key 識別用キー
     * @param year 開始年
     * @param month 開始月
     * @param day 開始日
     */
    function set(name: string, key: string, year: number, month: number, day: number): void;

    /**
     * 元号と年数から西暦年に変換します。
     *
     * @param key 元号識別キー
     * @param year 元号内の年数
     * @return 西暦年
     */
    function toADYear(key: string, year: number): number;
  }
}
