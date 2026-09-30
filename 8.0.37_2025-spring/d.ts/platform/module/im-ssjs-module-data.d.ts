declare namespace Module {
  /**
   * データ型判定オブジェクト。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.data/index.html
   */
  namespace data {
    type VarType =  'string' | 'number' | 'boolean' | 'undefined' | 'object' | 'array' | 'date' | 'null' | 'function';

    /**
     * データの変数型を判定して型名を返却します。
     *
     * @param target チェック対象データ
     * @return 型名
     */
    function varType(target: any): VarType;
  }
}
