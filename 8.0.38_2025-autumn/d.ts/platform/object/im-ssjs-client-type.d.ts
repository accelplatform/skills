/**
 * クライアントタイプ情報オブジェクト。
 *
 * マルチデバイス機能で使用されるクライアントタイプの情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ClientType/index.html
 */
interface ClientType {
  /** クライアントタイプID */
  readonly clientTypeId: string;
  /** 表示名 */
  readonly displayName: string;
}
