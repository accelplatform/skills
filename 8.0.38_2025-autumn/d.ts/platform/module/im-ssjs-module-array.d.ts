declare namespace Module {
  /**
   * 配列操作オブジェクト。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.array/index.html
   */
  namespace array {
    type Item = any;
    type Object = { [key: string]: any };

    /**
     * 2 つの配列データを連結します。
     *
     * @param head 先頭配列
     * @param tail 末尾配列
     * @return 連結された新しい配列
     */
    function add(head: Item[], tail: Item[]): Item[];

    /**
     * 配列データへ要素を追加します。
     *
     * @param target 対象配列
     * @param item 追加する要素
     * @param index 挿入位置
     * @return 要素が追加された新しい配列
     */
    function insert(target: Item[], item: Item, index: number): Item[];

    /**
     * 配列データ内の要素を削除します。
     *
     * @param target 対象配列
     * @param index 削除位置
     * @return 要素が削除された新しい配列
     */
    function remove(target: Item[], index: number): Item[];

    /**
     * 配列内のデータをソートします。
     *
     * @param target 対象配列
     * @return ソートされた新しい配列
     */
    function sort(target: Item[]): Item[];

    /**
     * データベースアクセス結果オブジェクトから、配列操作オブジェクトを生成します。
     *
     * @param result データベースアクセス結果オブジェクト
     * @param key キーとなるプロパティ名
     * @param data 値となるプロパティ名
     * @return 生成されたオブジェクト
     */
    function toList(result: DatabaseResult, key: string, data: string): Object[];
  }
}
