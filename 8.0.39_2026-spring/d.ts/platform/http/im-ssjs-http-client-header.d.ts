/**
 * HTTP クライアントヘッダ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HttpClientHeader/index.html
 */
interface HttpClientHeader {
  /** ヘッダ名 */
  readonly name: string;
  /** ヘッダ値 */
  readonly value: string;
}
