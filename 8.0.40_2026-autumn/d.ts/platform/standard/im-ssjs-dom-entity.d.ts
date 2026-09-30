/**
 * DOM のエンティティクラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DOMEntity/index.html
 */
declare class DOMEntity {
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
