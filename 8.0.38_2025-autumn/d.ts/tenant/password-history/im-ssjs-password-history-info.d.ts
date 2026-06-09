/**
 * パスワード履歴管理情報オブジェクト。
 *
 * パスワード履歴に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordHistoryInfo/index.html
 */
interface PasswordHistoryInfo {
  /** 更新日付 */
  readonly date: Date;
  /** パスワード */
  readonly password: string;
}
