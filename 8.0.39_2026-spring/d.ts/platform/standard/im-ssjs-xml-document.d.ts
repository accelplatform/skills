/**
 * XML を解析するパーサークラス。
 *
 * XML タグをノードとして管理し、属性や子ノードを操作できます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/XMLDocument/index.html
 */
declare class XMLDocument {
  /**
   * XML ソース文字列を解析して、XMLDocument クラスのインスタンスを生成します。
   * ドキュメントノードが複数存在する場合は XML 解析エラーとなります。
   *
   * @param src XML ソース
   */
  constructor(src: string);

  /**
   * 新しい要素ノードを作成します。
   *
   * @param tagName タグ名
   * @return 作成されたノード
   */
  createElement(tagName: string): DOMNode;

  /**
   * 新しいテキストノードを作成します。
   *
   * @param data テキストデータ
   * @return 作成されたテキストノード
   */
  createTextNode(data: string): DOMNode;

  /**
   * ドキュメントタイプを取得します。
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
   *
   * @param elementId 要素のID
   * @return 一致するノード。見つからない場合 null
   */
  getElementById(elementId: string): DOMNode | null;

  /**
   * 指定されたタグ名に一致するすべてのノードを取得します。
   *
   * @param tagname タグ名
   * @return DOMNode の配列。エラー時は null
   */
  getElementsByTagName(tagname: string): DOMNode[] | null;

  /**
   * XML 文字列表現を取得します。
   *
   * @return XML 文字列
   */
  getXmlString(): string;

  /**
   * パースエラーが発生したかどうかを判定します。
   *
   * @return エラーの場合 true
   */
  isError(): boolean;
}
