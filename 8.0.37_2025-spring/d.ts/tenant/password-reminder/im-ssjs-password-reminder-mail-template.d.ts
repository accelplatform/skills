/**
 * パスワードリマインダメールテンプレート情報オブジェクト。
 *
 * パスワードリマインダのメールテンプレート情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordReminderMailTemplate/index.html
 */
interface PasswordReminderMailTemplate {
  /** ロケールID */
  locale: string;
  /** メール本文テンプレート */
  mailTemplate: string;
  /** メールタイトル */
  mailTitle: string;
}
