/**
 * パスワード履歴マネージャ。
 *
 * パスワード履歴管理情報の参照、更新を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PasswordHistoryManager/index.html
 */
declare class PasswordHistoryManager {
  /**
   * パスワード履歴マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 指定ユーザの入力パスワードをデータベースに追加します。
   *
   * @param userCd ユーザコード
   * @param password パスワード
   * @return 成功した場合 true、失敗した場合 false
   */
  addPasswordHistory(userCd: string, password: string): boolean;

  /**
   * パスワードの入力チェックを行います。
   *
   * @param userCd ユーザコード
   * @param password パスワード
   * @return パスワード履歴チェック結果
   */
  checkPasswordHistory(userCd: string, password: string): PasswordHistoryResultInfo;

  /**
   * パスワード利用可能文字のみチェックを行います。
   *
   * @param userCd ユーザコード
   * @param password パスワード
   * @return パスワード履歴チェック結果
   */
  checkPassword(userCd: string, password: string): PasswordHistoryResultInfo;

  /**
   * すべてのパスワード履歴を削除します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  clearPasswordHistories(): boolean;

  /**
   * 指定ユーザのパスワード履歴を削除します。
   *
   * @param userCd ユーザコード
   * @return 成功した場合 true、失敗した場合 false
   */
  clearPasswordHistory(userCd: string): boolean;

  /**
   * 指定長のランダムパスワードを生成します。
   *
   * @param count パスワードの文字数
   * @return 生成されたパスワード文字列
   */
  createPassword(count: string): string;

  /**
   * 最新のパスワードと更新日付を取得します。
   *
   * @param userCd ユーザコード
   * @return パスワード履歴管理情報。取得できない場合は null
   */
  getLatestPasswordHistory(userCd: string): PasswordHistoryInfo | null;

  /**
   * 設定したパスワードの有効期限を取得します。
   *
   * @return 有効期限（日数）
   */
  getPasswordExpireLimit(): number;

  /**
   * 指定ユーザのパスワード履歴を取得します。
   *
   * @param userCd ユーザコード
   * @return パスワード履歴管理情報の配列。取得できない場合は null
   */
  getPasswordHistories(userCd: string): PasswordHistoryInfo[] | null;

  /**
   * 指定ユーザのパスワード履歴数を取得します。
   *
   * @param userCd ユーザコード
   * @return パスワード履歴数。取得できない場合は -1
   */
  getPasswordHistoryCount(userCd: string): number;

  /**
   * パスワードの世代管理数を取得します。
   *
   * @return 世代管理数。取得できない場合は -1
   */
  getPasswordHistoryManagedCount(): number;

  /**
   * パスワード変更画面の URL を取得します。
   *
   * @return パスワード変更画面の URL
   */
  getPasswordPage(): string;

  /**
   * 初回ログイン時にパスワード変更を要求するかどうかを取得します。
   *
   * @return パスワード変更を要求する場合 true、要求しない場合 false
   */
  isChangePasswordFirstLogin(): boolean;

  /**
   * クライアントタイプを判定します。
   * パラメータ deny-client-types に記述があるクライアントタイプの判定を行います。
   *
   * @param clientType クライアントタイプ
   * @return 拒否対象の場合 true、拒否対象でない場合 false
   */
  isDenyClientType(clientType: string): boolean;

  /**
   * 指定ユーザが初回ログインかどうかを判定します。
   *
   * @param userCd ユーザコード
   * @return 初回ログインの場合 true、初回ログインでない場合 false
   */
  isFirstLogin(userCd: string): boolean;

  /**
   * パスワード変更後の画面遷移方式を判定します。
   *
   * @return ログイン画面に戻る場合 true、ログイン処理を継続してログインする場合 false
   */
  isForwardInitialPage(): boolean;

  /**
   * パスワードの有効期限切れを判定します。
   *
   * @param userCd ユーザコード
   * @param clientType クライアントタイプ
   * @param date 判定対象日付
   * @return 有効期限切れの場合 true、有効期限内の場合 false
   */
  isPasswordExpired(userCd: string, clientType: string, date: Date): boolean;

  /**
   * 履歴管理を行うかどうかを判定します。
   *
   * @return 履歴管理を行う場合 true、行わない場合 false
   */
  isPasswordHistoryManaged(): boolean;

  /**
   * 指定ユーザの初回ログイン設定を変更します。
   *
   * @param userCd ユーザコード
   * @param isFirstLogin 初回ログインフラグ
   * @return 成功した場合 true、失敗した場合 false
   */
  setFirstLogin(userCd: string, isFirstLogin: boolean): boolean;

  /**
   * 残す履歴数を指定してパスワード履歴を削除します。
   *
   * @param userCd ユーザコード
   * @param remain 残す履歴数
   * @return 成功した場合 true、失敗した場合 false
   */
  verifyPasswordHistory(userCd: string, remain: number): boolean;
}
