/**
 * クライアントコンテキストオブジェクト。
 *
 * クライアントに関する情報を保持するアクセスコンテキストです。
 * Web 実行環境でのみ取得可能です。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ClientContext/index.html
 */
interface ClientContext {
  /** クライアントタイプID */
  readonly clientTypeId: string;
}
