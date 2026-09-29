/**
 * コンテンツクラス。
 *
 * サーバサイドページを実行しコンテンツを生成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Content/index.html
 */
declare class Content {
  /**
   * Content クラスのインスタンスを生成します。
   * サーバの pages ディレクトリからの相対パス（拡張子なし）で HTML/JS ファイルを読み込みます。
   *
   * @param srcPath 拡張子を除いたページの相対パス
   */
  constructor(srcPath: string);

  /**
   * コンテンツを実行し出力を生成します。
   *
   * @param value ファンクションコンテナの init() に渡す引数
   * @return 実行結果の HTML ソース
   */
  execute(value?: any): string;

  /**
   * ページのファンクションコンテナに定義された関数を実行します。
   *
   * @param path 拡張子を除いたページパス
   * @param functionName 関数名
   * @param args 関数の引数
   * @return 関数の実行結果
   */
  static executeFunction(path: string, functionName: string, ...args: any[]): unknown;

  /**
   * ページのファンクションコンテナから関数を取得します。
   *
   * @param functionName 関数名
   * @return 関数。見つからない場合 null
   */
  getFunction(functionName: string): Function | null;

  /**
   * コンテンツが実行可能かどうかを判定します。
   *
   * @return HTML ファイルが存在しない等で使用不可の場合 true
   */
  isError(): boolean;

  /**
   * オブジェクトの文字列表現を返します。
   *
   * @return 文字列表現
   */
  toString(): string;
}
