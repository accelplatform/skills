declare namespace Module {
  /**
   * 文字列操作オブジェクト。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.string/index.html
   */
  namespace string {
    type Condition = 'and' | 'or';

    /**
     * HTML 特殊文字をエンティティに変換します。
     *
     * @param target 対象文字列
     * @param exclusion 変換除外文字
     * @return 変換後の文字列
     */
    function browse(target: string, exclusion?: string): string;

    /**
     * 文字列を 1 文字ずつの配列に分割します。
     *
     * @param target 対象文字列
     * @return 文字の配列
     */
    function chars(target: string): string[];

    /**
     * HTML 特殊文字（シングルクォート含む）をエンティティに変換します。
     *
     * @param target 対象文字列
     * @param exclusion 変換除外文字
     * @return 変換後の文字列
     */
    function escapeHtml(target: string, exclusion?: string): string;

    /**
     * データを文字列に変換します。
     *
     * @param target 対象データ
     * @return 文字列
     */
    function from(target: any): string;

    /**
     * ASCII 文字のみで構成されているかを判定します。
     *
     * @param target 対象文字列
     * @return ASCII のみの場合 true
     */
    function isASCII(target: string): boolean;

    /**
     * 部分文字列の出現回数をカウントします。
     *
     * @param target 対象文字列
     * @param searchWord 検索文字列
     * @return 出現回数
     */
    function quantity(target: string, searchWord: string): number;

    /**
     * AND/OR 条件でキーワード出現を検索します。
     *
     * @param target 対象文字列
     * @param piece スペース区切りのキーワード
     * @param condition 検索条件
     * @return 出現回数
     */
    function refer(target: string, piece: string, condition: Condition): number;

    /**
     * 文字列のバイト長を返却します。
     *
     * @param target 対象文字列
     * @return バイト数
     */
    function size(target: string): number;
  }
}
