/**
 * XML パーサークラス。
 *
 * XML ドキュメントを解析し DOMDocument オブジェクトを返します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/XMLParser/index.html
 */
declare class XMLParser {
  /**
   * XML パーサークラスのインスタンスを生成します。
   */
  constructor();

  /**
   * パースエラーのメッセージを取得します。
   *
   * @return エラーメッセージ
   */
  getErrorMessage(): string;

  /**
   * パースエラーが発生したかどうかを判定します。
   *
   * @return エラーの場合 true
   */
  isError(): boolean;

  /**
   * ファイルパスから XML ファイルを読み込み解析します。
   * パスは絶対パス、または Java VM のシステムプロパティ user.dir からの相対パスで指定します。
   *
   * @param path ファイルパス
   * @return DOMDocument オブジェクト
   */
  parse(path: string): DOMDocument;

  /**
   * File オブジェクトから XML ファイルを読み込み解析します。
   *
   * @param file File オブジェクト
   * @return DOMDocument オブジェクト
   */
  parse(file: File): DOMDocument;

  /**
   * Storage オブジェクトから XML を読み込み解析します。
   *
   * @param storage ストレージオブジェクト（PublicStorage/SystemStorage/SessionScopeStorage）
   * @return DOMDocument オブジェクト
   */
  parse(storage: Storage): DOMDocument;

  /**
   * XML 形式の文字列を解析し DOMDocument を返します。
   * ドキュメントノードが複数存在する場合は XML 解析エラーとなります。
   *
   * @param src XML 文字列
   * @return DOMDocument オブジェクト
   */
  parseString(src: string): DOMDocument;
}
