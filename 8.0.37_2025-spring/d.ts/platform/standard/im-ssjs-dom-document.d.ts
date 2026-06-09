/**
 * XML 文書全体を表す DOM Document クラス。
 *
 * XML のタグをノードとして管理し、各ノードは属性や子ノードを持つことができます。
 * ルートノードは getDocumentElement で取得します。
 * XMLParser オブジェクトの parse() や parseString() メソッドから生成されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DOMDocument/index.html
 */
declare class DOMDocument {
  /**
   * 指定されたタグ名で新しい要素ノードを作成します。
   *
   * @param tagName タグ名
   * @return 作成された要素ノード
   */
  createElement(tagName: string): DOMNode;

  /**
   * 指定されたデータで新しいテキストノードを作成します。
   *
   * @param data テキストデータ
   * @return 作成されたテキストノード
   */
  createTextNode(data: string): DOMNode;

  /**
   * ドキュメントの文書型定義を取得します。
   *
   * @return ドキュメントタイプオブジェクト
   */
  getDoctype(): DOMDocumentType;

  /**
   * ルートドキュメントノードを取得します。
   *
   * @return ルートノード
   */
  getDocumentElement(): DOMNode;

  /**
   * 指定されたID に一致するノードを取得します。
   * 見つからない場合 null を返します。
   *
   * @param elementId 要素のID
   * @return 一致するノード。見つからない場合 null
   */
  getElementById(elementId: string): DOMNode | null;

  /**
   * 指定されたタグ名に一致するすべての要素ノードを取得します。
   *
   * @param tagname タグ名
   * @return 一致する DOMNode の配列
   */
  getElementsByTagName(tagname: string): DOMNode[];

  /**
   * ノード作成時にエラーが発生した場合のエラーメッセージを取得します。
   *
   * @return エラーメッセージ
   */
  getErrorMessage(): string;

  /**
   * 操作中にエラーが発生したかどうかを判定します。
   *
   * @return エラーが存在する場合 true
   */
  isError(): boolean;
}
