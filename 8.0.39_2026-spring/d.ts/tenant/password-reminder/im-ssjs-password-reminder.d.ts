/**
 * パスワードリマインダクラス。
 *
 * パスワードリマインダ情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordReminder/index.html
 */
declare class PasswordReminder {
  /**
   * パスワードリマインダクラスのインスタンスを生成します。
   * ロケールID とタイムゾーンはログインユーザのロケール・タイムゾーンが使用されます。
   *
   * @param userCd ユーザコード
   * @param host ホスト
   */
  constructor(userCd: string, host: string);

  /**
   * パスワードリマインダクラスのインスタンスを生成します。
   * タイムゾーンはログインユーザのタイムゾーンが使用されます。
   *
   * @param userCd ユーザコード
   * @param host ホスト
   * @param localeId ロケールID
   */
  constructor(userCd: string, host: string, localeId: string);

  /**
   * パスワードリマインダクラスのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   * @param host ホスト
   * @param timezone タイムゾーン
   */
  constructor(userCd: string, host: string, timezone: TimeZone);

  /**
   * パスワードリマインダクラスのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param host ホスト
   * @param localeId ロケールID
   * @param timezone タイムゾーン
   */
  constructor(userCd: string, host: string, localeId: string, timezone: TimeZone);

  /**
   * パスワードリマインダメール情報を取得します。
   *
   * @return data にパスワードリマインダメール情報を格納した ResultObject
   */
  getMailInfo(): ResultObject<ReminderMailInfo>;

  /**
   * パスワードリマインダメール基本設定情報を取得します。
   *
   * @return data にパスワードリマインダメール基本設定情報を格納した ResultObject
   */
  getReminderConfig(): ResultObject<PasswordReminderConfig>;

  /**
   * パスワードリマインダメールテンプレート情報を取得します。
   *
   * @return data にパスワードリマインダメールテンプレート情報を格納した ResultObject
   */
  getReminderMailTemplate(): ResultObject<PasswordReminderMailTemplate>;

  /**
   * パスワード再登録画面のショートカット URL を取得します。
   *
   * @param path 画面ページパス
   * @return data にショートカット URL 文字列を格納した ResultObject
   */
  getShortCutUrl(path: string): ResultObject<string>;

  /**
   * パスワードリマインダ機能が有効であるかどうかをチェックします。
   *
   * @return data に有効フラグを格納した ResultObject（true: 有効）
   */
  isEnabled(): ResultObject<boolean>;

  /**
   * パスワードリマインダメール基本設定情報を更新します。
   *
   * @param config パスワードリマインダメール基本設定情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateReminderConfig(config: PasswordReminderConfig): ResultObject<null>;

  /**
   * パスワードリマインダメールテンプレート情報を更新します。
   *
   * @param template パスワードリマインダメールテンプレート情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateReminderMailTemplate(template: PasswordReminderMailTemplate): ResultObject<null>;
}
