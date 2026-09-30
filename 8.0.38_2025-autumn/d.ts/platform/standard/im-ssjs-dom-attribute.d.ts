/**
 * ノードの属性クラス。
 *
 * ノードの属性情報を保持するクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DOMAttribute/index.html
 */
declare class DOMAttribute {
  /**
   * 属性名を取得します。
   *
   * @return 属性名
   */
  getName(): string;

  /**
   * 親ノードを取得します。
   * 親ノードを持たない場合 null を返します。
   *
   * @return 親ノードのオブジェクト。親ノードがない場合 null
   */
  getParentNode(): DOMNode | null;

  /**
   * 属性値を取得します。
   *
   * @return 属性値
   */
  getValue(): string;
}
