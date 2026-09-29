/**
 * パスワードリマインダメール情報オブジェクト。
 *
 * パスワードリマインダのメール送信情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ReminderMailInfo/index.html
 */
interface ReminderMailInfo {
  /** BCC アドレスの配列 */
  readonly mailBcc: string[];
  /** メール本文 */
  readonly mailBody: string;
  /** CC アドレスの配列 */
  readonly mailCc: string[];
  /** From アドレス */
  readonly mailFrom: string;
  /** Reply-To アドレス */
  readonly mailReplyTo: string;
  /** メールタイトル */
  readonly mailSubject: string;
}
