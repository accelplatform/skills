/**
 * ログインセッションマネージャ。
 *
 * ログインセッション情報の登録・取得・削除・無効化機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/LoginSessionManager/index.html
 */
declare class LoginSessionManager {
  /**
   * ログインセッションマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * ログインセッション情報を登録します。
   *
   * @param info ログインセッション情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addLoginSessionInfo(info: LoginSessionInfo): ResultObject<null>;

  /**
   * 指定されたセッションID のログインセッション情報を削除します。
   *
   * @param sessionId セッションID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteLoginSessionInfo(sessionId: string): ResultObject<null>;

  /**
   * 二重ログイン検出時の振る舞いを取得します。
   *
   * @return data に振る舞い文字列（'ERROR' | 'DETECTION' | 'INVALIDATE_USER'）を格納した ResultObject
   */
  getBehavior(): ResultObject<LoginSessionManager.Behavior>;

  /**
   * セッションID からログインセッション情報を取得します。
   *
   * @param sessionId セッションID
   * @return data に LoginSessionInfo を格納した ResultObject
   */
  getLoginSessionInfo(sessionId: string): ResultObject<LoginSessionInfo>;

  /**
   * 全ログインセッション数を返却します。
   *
   * @return data にセッション総数を格納した ResultObject
   */
  getLoginSessionInfoCount(): ResultObject<number>;

  /**
   * 全ログインセッション情報を返却します。
   *
   * @return data に LoginSessionInfo の配列を格納した ResultObject
   */
  getLoginSessionInfos(): ResultObject<LoginSessionInfo[]>;

  /**
   * 指定ユーザのログインセッション情報を取得します。
   *
   * @param userCd ユーザコード
   * @return data に LoginSessionInfo の配列を格納した ResultObject
   */
  getUserLoginSession(userCd: string): ResultObject<LoginSessionInfo[]>;

  /**
   * ログインセッション情報を無効化します。
   *
   * @param sessionId セッションID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  invalidateLoginSessionInfo(sessionId: string): ResultObject<null>;

  /**
   * ユーザコードで部分一致検索したセッション数を返却します。
   *
   * @param userCd ユーザコード（部分一致）
   * @return data に検索結果のセッション数を格納した ResultObject
   */
  searchUserLoginSessionCount(userCd: string): ResultObject<number>;

  /**
   * ユーザコードで部分一致検索したセッション情報を返却します。
   *
   * @param userCd ユーザコード（部分一致）
   * @param start 取得開始位置
   * @param count 取得件数
   * @return data に LoginSessionInfo の配列を格納した ResultObject
   */
  searchUserLoginSessions(userCd: string, start: number, count: number): ResultObject<LoginSessionInfo[]>;
}

declare namespace LoginSessionManager {
  type Behavior =
    /** 通常の認証エラーを表示 */
    | 'ERROR'
    /** 二重ログインの検出を表示 */
    | 'DETECTION'
    /** ログイン中のセッションの無効化可能 */
    | 'INVALIDATE_USER';
}
