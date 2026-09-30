/**
 * ログインセッション情報オブジェクト。
 *
 * ユーザのログインセッションに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/LoginSessionInfo/index.html
 */
interface LoginSessionInfo {
  /** このログインセッションが無効な場合 true */
  invalidate: boolean;
  /** ログイン時刻 */
  loginTime: Date;
  /** リモートアドレス */
  remoteAddr: string;
  /** セッションID */
  sessionId: string;
  /** ユーザエージェント */
  userAgent: string;
  /** ユーザ CD */
  userCd: string;
}
