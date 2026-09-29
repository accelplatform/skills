/**
 * HTTP クライアントクッキー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HttpClientCookie/index.html
 */
interface HttpClientCookie {
  /** クッキーのコメント */
  comment: string;
  /** クッキーのコメント URL */
  readonly commentURL: string;
  /** クッキーの作成日 */
  creationDate: Date;
  /** クッキーのドメイン名 */
  domain: string;
  /** クッキーの有効期限 */
  expiryDate: Date;
  /** クッキー名 */
  readonly name: string;
  /** クッキーのパス */
  path: string;
  /** クッキーの永続化フラグ */
  readonly persistent: boolean;
  /** クッキーのポート値 */
  readonly ports: number[];
  /** クッキーのセキュアフラグ */
  secure: boolean;
  /** クッキー値 */
  value: string;
  /** クッキーのバージョン値 */
  version: number;

  /**
   * クッキーの有効期限が切れたかどうかをチェックします。
   *
   * @param date チェック対象日付
   * @return 期限切れの場合 true
   */
  expired(date: Date): boolean;
}
