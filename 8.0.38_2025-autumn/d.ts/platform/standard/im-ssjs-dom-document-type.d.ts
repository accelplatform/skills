/**
 * ドキュメントタイプクラス。
 *
 * ドキュメントの文書型情報を保持するクラスです。
 *
 * @since 8.0.39
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DOMDocumentType/index.html
 */
declare class DOMDocumentType {
  /**
   * このオブジェクトから利用可能なすべてのエンティティを取得します。
   * 配列の要素は DOMEntity オブジェクトです。
   *
   * @return エンティティの配列
   */
  getEntities(): DOMEntity[];

  /**
   * 内部サブセットを取得します。
   *
   * @return 内部サブセット文字列
   */
  getInternalSubset(): string;

  /**
   * ノードの名前を取得します。
   *
   * @return ノード名
   */
  getName(): string;

  /**
   * このオブジェクトから利用可能なすべての記法を取得します。
   * 配列の要素は DOMNotation オブジェクトです。
   *
   * @return 記法の配列
   */
  getNotations(): DOMNotation[];

  /**
   * 公開識別子を取得します。
   *
   * @return 公開識別子
   */
  getPublicId(): string;

  /**
   * システム識別子を取得します。
   *
   * @return システム識別子
   */
  getSystemId(): string;
}
