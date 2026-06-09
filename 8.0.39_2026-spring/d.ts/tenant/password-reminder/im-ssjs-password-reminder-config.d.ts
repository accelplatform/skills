/**
 * パスワードリマインダメール基本設定情報オブジェクト。
 *
 * パスワードリマインダの基本設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordReminderConfig/index.html
 */
interface PasswordReminderConfig {
  /** パスワードリマインダ機能が有効かどうか */
  enable: boolean;
  /** BCC アドレスの配列 */
  mailBcc: string[];
  /** CC アドレスの配列 */
  mailCc: string[];
  /** From アドレス */
  mailFrom: string;
  /** Reply-To アドレス */
  mailReplyTo: string;
  /** プログラムパス */
  programPath: string;
  /** URL の有効日付フォーマット */
  urlLimitDateFormat: string;
  /** URL の有効期間（日数） */
  urlLimitDays: number;
}
