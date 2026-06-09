/**
 * URL 操作クラス。
 *
 * URL のエンコード・デコード・構築を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/URL/index.html
 */
declare class URL {
  /**
   * URL クラスのインスタンスを生成します。
   *
   * @param pagePath プログラムのページパス
   */
  constructor(pagePath: string);

  /**
   * 絶対 URL を取得します。
   *
   * @return 絶対 URL 文字列
   */
  absoluteLocation(): string;

  /**
   * URL にセッション情報を付加します。
   *
   * @param url 対象 URL
   * @return セッション情報が付加された URL
   */
  static createSessionURL(url: string): string;

  /**
   * URL エンコードされた文字列をデコードします。
   *
   * @param target デコードする文字列
   * @param enc エンコード時に使用した文字エンコーディング名
   * @return デコードされた文字列
   */
  static decode(target: string, enc?: string): string;

  /**
   * 文字列を URL エンコードします。
   *
   * @param target エンコードする文字列
   * @param enc 文字エンコーディング名（省略時はシステムデフォルト）
   * @return エンコードされた文字列
   */
  static encode(target: string, enc?: string): string;

  /**
   * URL 引数を取得します。
   *
   * @return 'name=value&name=value' 形式の文字列
   */
  getArgument(): string;

  /**
   * 構築された URL を取得します。
   *
   * @return URL 文字列
   */
  location(): string;

  /**
   * リクエスト時に実行する関数を指定します。
   *
   * @param funcName JavaScript 関数名
   */
  setAction(funcName: string): void;

  /**
   * URL 引数を設定します。
   *
   * @param name 引数キー
   * @param value 引数値
   */
  setArgument(name: string, value: string): void;

  /**
   * URL にラベルを設定します。
   *
   * @param name ラベル名
   */
  setLabel(name: string): void;
}
