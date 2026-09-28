declare namespace Module {
  /**
   * 数値操作オブジェクト。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.number/index.html
   */
  namespace number {
    /**
     * 指定範囲の数値配列を生成します。
     *
     * @param min 開始番号
     * @param max 終了番号
     * @param step 増分（デフォルト: 1）
     * @return 数値配列
     */
    function getArray(min: number, max: number, step?: number): number[];

    /**
     * 指定の桁で四捨五入します。
     *
     * @param target 対象数値
     * @param point 桁数
     * @return 四捨五入された数値
     */
    function round(target: number, point: number): number;

    /**
     * 実数値に変換します。NaN の場合は 0 を返却します。
     *
     * @param target 対象データ
     * @return 実数値
     */
    function toFloat(target: any): number;

    /**
     * 整数値に変換します。NaN の場合は 0 を返却します。
     *
     * @param target 対象データ
     * @return 整数値
     */
    function toInt(target: any): number;
  }
}
