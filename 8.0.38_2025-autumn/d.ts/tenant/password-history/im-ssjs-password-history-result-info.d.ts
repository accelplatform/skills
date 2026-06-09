/**
 * パスワード履歴チェック結果オブジェクト。
 *
 * パスワード履歴チェックの結果情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordHistoryResultInfo/index.html
 */
interface PasswordHistoryResultInfo {
  /** パスワードチェック成功フラグ */
  readonly success: boolean;
  /** メッセージ */
  readonly message: string;
  /** 詳細メッセージ */
  readonly detail: string;
}
