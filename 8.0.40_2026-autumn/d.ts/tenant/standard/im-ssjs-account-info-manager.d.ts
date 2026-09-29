/**
 * アカウント情報マネージャ。
 *
 * アカウント情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AccountInfoManager/index.html
 */
declare class AccountInfoManager {
  /** テナント属性: 数値フォーマットID（'im_i18n_decimal_format_id'） */
  static readonly ATTR_DECIMAL_FORMAT: 'im_i18n_decimal_format_id';

  /**
   * アカウント情報マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * アカウント情報を新規追加します。
   *
   * パスワード文字種のバリデーションは行いません。
   * パスワード文字種の検証が必要な場合は PasswordHistoryManager を使用してください。
   *
   * @param accountInfo アカウント情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addAccountInfo(accountInfo: AccountInfo): ResultObject<null>;

  /**
   * ユーザのロール情報を新規追加します。
   *
   * ロールの有効期間は AccountRoleInfo の startDate および endDate で設定します。
   * 有効判定は「開始日 ≤ 基準日 ＜ 終了日」で行われます。
   *
   * @param userCd ユーザコード
   * @param roleInfo ロール情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addAccountRoleInfo(userCd: string, roleInfo: AccountRoleInfo): ResultObject<null>;

  /**
   * ユーザの登録有無をチェックします。
   *
   * @param userCd ユーザコード
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  contains(userCd: string): ResultObject<boolean>;

  /**
   * 指定ユーザのアカウント情報を削除します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAccountInfo(userCd: string): ResultObject<null>;

  /**
   * 全アカウント情報を削除します。
   *
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAccountInfos(): ResultObject<null>;

  /**
   * 指定ユーザのロール情報を削除します。
   *
   * @param userCd ユーザコード
   * @param roleId ロールID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAccountRoleInfo(userCd: string, roleId: string): ResultObject<null>;

  /**
   * 指定ユーザの全ロール情報を削除します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAccountRoleInfos(userCd: string): ResultObject<null>;

  /**
   * アカウント属性を削除します。
   *
   * @param userCd ユーザコード
   * @param name 属性名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAttribute(userCd: string, name: string): ResultObject<null>;

  /**
   * 指定ユーザの全属性を削除します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAttributes(userCd: string): ResultObject<null>;

  /**
   * 指定ユーザのアカウント情報を取得します。
   *
   * ハッシュ方式のパスワード保存を使用している場合、AccountInfo.password は null になります。
   * パスワード検証には AccountPasswordAdapter を使用してください。
   *
   * @param userCd ユーザコード
   * @return data に AccountInfo を格納した ResultObject
   */
  getAccountInfo(userCd: string): ResultObject<AccountInfo>;

  /**
   * 登録アカウント数を取得します。
   *
   * @return data にアカウント数を格納した ResultObject
   */
  getAccountInfoCount(): ResultObject<number>;

  /**
   * 全アカウント情報を取得します。
   *
   * @return data に AccountInfo の配列を格納した ResultObject
   */
  getAccountInfos(): ResultObject<AccountInfo[]>;

  /**
   * 指定件数分のアカウント情報を取得します。
   *
   * 取得件数が 0 の場合は空の配列が返却されます（null にはなりません）。
   * ハッシュ方式のパスワード保存を使用している場合、AccountInfo.password は null になります。
   *
   * @param start 取得開始位置
   * @param count 取得件数
   * @return data に AccountInfo の配列を格納した ResultObject
   */
  getAccountInfos(start: number, count: number): ResultObject<AccountInfo[]>;

  /**
   * 指定ユーザコードのアカウント情報を取得します。
   *
   * @param userCds ユーザコードの配列
   * @return data に AccountInfo の配列を格納した ResultObject
   */
  getAccountInfosByUserCds(userCds: string[]): ResultObject<AccountInfo[]>;

  /**
   * ユーザのロールID 一覧を取得します。
   *
   * 有効期間によるフィルタリングは行いません。直接割り当てられたロールのみ返却し、サブロールは含みません。
   * サブロールを含む全ロールを取得する場合は getAccountRoleIdsRecursively を使用してください。
   *
   * @param userCd ユーザコード
   * @return data にロールID の配列を格納した ResultObject
   */
  getAccountRoleIds(userCd: string): ResultObject<string[]>;

  /**
   * 指定日付で有効なロールID 一覧を取得します。
   *
   * 有効判定は「開始日 ≤ 基準日 ＜ 終了日」で行われます。
   * サブロールは含みません。サブロールを含む場合は getAccountRoleIdsRecursively を使用してください。
   *
   * @param userCd ユーザコード
   * @param date 基準日
   * @return data にロールID の配列を格納した ResultObject
   */
  getAccountRoleIds(userCd: string, date: Date): ResultObject<string[]>;

  /**
   * サブロールを含む全ロールID 一覧を取得します。
   *
   * 有効判定は「開始日 ≤ 基準日 ＜ 終了日」で行われます。
   * ロール階層を再帰的に展開し、ネストしたサブロールをすべて含めた一覧を返却します。
   *
   * @param userCd ユーザコード
   * @param date 基準日
   * @return data にロールID の配列を格納した ResultObject
   */
  getAccountRoleIdsRecursively(userCd: string, date: Date): ResultObject<string[]>;

  /**
   * ユーザの全ロール情報を取得します。
   *
   * @param userCd ユーザコード
   * @return data に AccountRoleInfo の配列を格納した ResultObject
   */
  getAccountRoleInfos(userCd: string): ResultObject<AccountRoleInfo[]>;

  /**
   * 指定日付で有効なロール情報を取得します。
   *
   * @param userCd ユーザコード
   * @param date 基準日
   * @return data に AccountRoleInfo の配列を格納した ResultObject
   */
  getAccountRoleInfos(userCd: string, date: Date): ResultObject<AccountRoleInfo[]>;

  /**
   * アカウント属性値を取得します。
   *
   * @param userCd ユーザコード
   * @param name 属性名
   * @return data に属性値文字列を格納した ResultObject
   */
  getAttribute(userCd: string, name: string): ResultObject<string>;

  /**
   * アカウント属性値を取得します（デフォルト値付き）。
   *
   * @param userCd ユーザコード
   * @param name 属性名
   * @param def デフォルト値
   * @return data に属性値文字列を格納した ResultObject
   */
  getAttribute(userCd: string, name: string, def: string): ResultObject<string>;

  /**
   * アカウント属性名の一覧を取得します。
   *
   * @param userCd ユーザコード
   * @return data に属性名の配列を格納した ResultObject
   */
  getAttributeNames(userCd: string): ResultObject<string[]>;

  /**
   * 全ユーザコードを取得します。
   *
   * @return data にユーザコードの配列を格納した ResultObject
   */
  getUserCds(): ResultObject<string[]>;

  /**
   * 指定ロールを保有するユーザコードを取得します。
   *
   * ロール階層（サブロール）はチェックしません。有効期間の絞り込みも行いません。
   * 有効期間とロール階層を考慮した取得には getUserCdsByRoleId を使用してください。
   *
   * @param roleId ロールID
   * @return data にユーザコードの配列を格納した ResultObject
   */
  getUserCdsByAccountRoleId(roleId: string): ResultObject<string[]>;

  /**
   * 指定属性条件に合致するユーザコードを取得します。
   *
   * @param key 属性名
   * @param value 属性値
   * @return data にユーザコードの配列を格納した ResultObject
   */
  getUserCdsByAttribute(key: string, value: string): ResultObject<string[]>;

  /**
   * 指定日付で有効なロールを保有するユーザコードを取得します。
   *
   * 親ロール階層をすべて辿り、有効期間（開始日 ≤ 基準日 ＜ 終了日）でフィルタリングします。
   * ロール階層を考慮せず単純に割り当てを検索する場合は getUserCdsByAccountRoleId を使用してください。
   *
   * @param roleId ロールID
   * @param date 基準日
   * @return data にユーザコードの配列を格納した ResultObject
   */
  getUserCdsByRoleId(roleId: string, date: Date): ResultObject<string[]>;

  /**
   * ユーザコードで部分一致検索します。
   *
   * ワイルドカード文字が使用できます: `*`（0文字以上に一致）、`?`（任意の1文字に一致）。
   * ハッシュ方式のパスワード保存を使用している場合、AccountInfo.password は null になります。
   *
   * @param userCd 検索文字列
   * @return data に AccountInfo の配列を格納した ResultObject
   */
  searchAccountInfos(userCd: string): ResultObject<AccountInfo[]>;

  /**
   * ユーザコードで部分一致検索します（件数指定）。
   *
   * ワイルドカード文字が使用できます: `*`（0文字以上に一致）、`?`（任意の1文字に一致）。
   * ハッシュ方式のパスワード保存を使用している場合、AccountInfo.password は null になります。
   *
   * @param userCd 検索文字列
   * @param start 取得開始位置
   * @param count 取得件数
   * @return data に AccountInfo の配列を格納した ResultObject
   */
  searchAccountInfos(userCd: string, start: number, count: number): ResultObject<AccountInfo[]>;

  /**
   * アカウント属性を設定します（新規/更新）。
   *
   * userCd、name、value はすべて null および空文字列を指定できません。
   * 属性名が既存の場合は値を上書きし、存在しない場合は新規作成します。
   *
   * @param userCd ユーザコード
   * @param name 属性名
   * @param value 属性値
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  setAttribute(userCd: string, name: string, value: string): ResultObject<null>;

  /**
   * アカウント情報を更新します。
   *
   * AccountInfo.password が null の場合、パスワード以外のフィールドのみ更新されます。
   * パスワード文字種のバリデーションは行いません。
   *
   * @param accountInfo アカウント情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateAccountInfo(accountInfo: AccountInfo): ResultObject<null>;

  /**
   * ユーザのロール情報を更新します。
   *
   * @param userCd ユーザコード
   * @param roleInfo ロール情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateAccountRoleInfo(userCd: string, roleInfo: AccountRoleInfo): ResultObject<null>;
}
