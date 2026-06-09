/**
 * ユーザマネージャ。
 *
 * ユーザ情報の操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMUserManager/index.html
 */
declare class IMMUserManager {
  /**
   * ユーザマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUser(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するユーザ分類区分の件数を取得します。
   * condition に指定できるテーブルは imm_user_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserCategory(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するユーザ分類区分項目の件数を取得します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserCategoryItem(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するユーザ分類区分項目数を取得します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserCategoryItemWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザ分類区分項目に所属するユーザ数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるユーザ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数のユーザビジネスキーに該当するユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUser(bizKey: UserBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<UserInfo | null>;

  /**
   * 引数のユーザビジネスキーに該当するユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @return data にユーザ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUser(bizKey: UserBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<UserInfo | null>;

  /**
   * 引数のユーザビジネスキーに該当するユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUser(bizKey: UserBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<UserInfo | null>;

  /**
   * 引数のユーザ分類区分ビジネスキーに該当するユーザ分類区分情報を取得します。
   *
   * @param bizKey 取得するユーザ分類区分ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data にユーザ分類区分情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserCategory(bizKey: UserCtgBizKeyInfo, localeId?: string): BizApiResultInfo<UserCtgInfo | null>;

  /**
   * 引数のユーザ分類区分項目ビジネスキーに該当するユーザ分類区分項目情報を取得します。
   *
   * @param bizKey 取得するユーザ分類区分項目ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data にユーザ分類区分項目情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<UserCtgItmInfo | null>;

  /**
   * 引数のユーザビジネスキーに該当する全期間分のユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserList(bizKey: UserBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<UserInfo[] | null>;

  /**
   * 引数のユーザビジネスキーに該当する全期間分のユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data にユーザ情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserList(bizKey: UserBizKeyInfo, localeId: string): BizApiResultInfo<UserInfo[] | null>;

  /**
   * 引数のユーザビジネスキーに該当する全期間分のユーザ情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data にユーザ情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserList(bizKey: UserBizKeyInfo, isDisable: boolean): BizApiResultInfo<UserInfo[] | null>;

  /**
   * 複数ユーザの各ユーザ情報を検索します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト群
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ情報の配列を格納した BizApiResultInfo
   */
  getUsers(bizKey: UserBizKeyInfo[], date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * ユーザビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserTerm(bizKey: UserBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * ユーザビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得するユーザビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getUserTermList(bizKey: UserBizKeyInfo, isDisable: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * ユーザ、ユーザ分類区分項目の両ビジネスキーと日付から、対応する所属期間情報を取得します。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param userCtgItmBizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserCategoryItemAttachTerm(userBizKey: UserBizKeyInfo, userCtgItmBizKey: UserCtgItmBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * ユーザ、ユーザ分類区分項目の両ビジネスキーから存在する所属期間の一覧を取得します。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param userCtgItmBizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getUserCategoryItemAttachTermList(userBizKey: UserBizKeyInfo, userCtgItmBizKey: UserCtgItmBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件を元にユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUser(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元にユーザ分類区分を検索します。
   * condition に指定できるテーブルは imm_user_ctg テーブルです。
   *
   * @param condition 取得条件
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分リスト情報の配列を格納した BizApiResultInfo
   */
  listUserCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgListNodeInfo[]>;

  /**
   * 指定された条件を元にユーザ分類区分項目を検索します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param condition 取得条件
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  listUserCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するユーザ分類区分項目の一覧を取得します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  listUserCategoryItemWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザ分類区分項目に所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== search 系 ====================

  /**
   * 指定された条件を元にユーザ検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUser(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元にユーザ分類区分検索を行います。
   * condition に指定できるテーブルは imm_user_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分リスト情報の配列を格納した BizApiResultInfo
   */
  searchUserCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgListNodeInfo[]>;

  /**
   * 指定された条件を元にユーザ分類区分項目検索を行います。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  searchUserCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するユーザ分類区分項目情報について検索を行います。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザ分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  searchUserCategoryItemWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザ分類区分項目に所属するユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalUser(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するユーザ分類区分の総数を取得します。
   * condition に指定できるテーブルは imm_user_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalUserCategory(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するユーザ分類区分項目の総数を取得します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalUserCategoryItem(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するユーザ分類区分項目の総数を取得します。
   * condition に指定できるテーブルは imm_user_ctg_itm テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserCategoryItemWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザ分類区分項目に所属するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== set 系（登録・更新）====================

  /**
   * ユーザ情報を新規登録、もしくは更新処理を行います。
   * 期間コードが指定されていない場合は新規登録、指定されている場合は更新します。
   *
   * @param user ユーザ情報オブジェクト
   * @return data に新規登録したユーザの期間情報の配列（更新時は空配列）を格納した BizApiResultInfo
   */
  setUser(user: UserInfo): BizApiResultInfo<TermInfo[]>;

  /**
   * ユーザ分類区分情報を新規登録、もしくは更新処理を行います。
   *
   * @param userCtg ユーザ分類区分情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setUserCategory(userCtg: UserCtgInfo): BizApiResultInfo<null>;

  /**
   * ユーザ分類区分項目情報を新規登録、もしくは更新処理を行います。
   *
   * @param userCtgItm ユーザ分類区分項目情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setUserCategoryItem(userCtgItm: UserCtgItmInfo): BizApiResultInfo<null>;

  /**
   * ユーザをユーザ分類区分項目に新規所属、もしくは更新処理を行います。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param userCtgItmBizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param term 期間、削除フラグ、ソートキーの情報オブジェクト
   * @return data に新規登録した期間情報の配列（更新時は空配列）を格納した BizApiResultInfo
   */
  setUserCategoryItemAttach(userBizKey: UserBizKeyInfo, userCtgItmBizKey: UserCtgItmBizKeyInfo, term: TermInfo): BizApiResultInfo<TermInfo[]>;

  // ==================== remove 系（削除）====================

  /**
   * 引数のユーザビジネスキーに該当するすべての期間のユーザ情報を削除します。
   *
   * @param bizKey 削除対象のユーザビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUser(bizKey: UserBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当するすべての期間のユーザ情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUser(localeId: string): BizApiResultInfo<null>;

  /**
   * 引数のユーザ分類区分ビジネスキーに該当するユーザ分類区分情報を削除します。
   *
   * @param bizKey 削除対象のユーザ分類区分ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserCategory(bizKey: UserCtgBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当するユーザ分類区分情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserCategory(localeId: string): BizApiResultInfo<null>;

  /**
   * 引数のユーザ分類区分項目ビジネスキーに該当するユーザ分類区分項目情報を削除します。
   *
   * @param bizKey 削除対象のユーザ分類区分項目ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserCategoryItem(bizKey: UserCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当するユーザ分類区分項目情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserCategoryItem(localeId: string): BizApiResultInfo<null>;

  /**
   * 指定されたキーに対応するすべての期間のユーザ分類区分項目所属情報を削除します。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param userCtgItmBizKey ユーザ分類区分項目ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserCategoryItemAttach(userBizKey: UserBizKeyInfo, userCtgItmBizKey: UserCtgItmBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  // ==================== 期間操作系 ====================

  /**
   * 登録済みのユーザ情報についての期間分割を行います。
   *
   * @param bizKey 分割を行うユーザビジネスキーオブジェクト
   * @param sepTermCd 分割を行う期間コード
   * @param sepTermDate 分割を行う基準日付
   * @return data に分割後新たに作成されたユーザの期間情報を格納した BizApiResultInfo
   */
  separateTermUser(bizKey: UserBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 登録済のユーザ情報を隣接するひとつ過去のレコードと結合します。
   *
   * @param bizKey 結合元となるユーザビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermUser(bizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済のユーザ情報を隣接するひとつ未来のレコードと結合します。
   *
   * @param bizKey 結合元となるユーザビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermUser(bizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済みのユーザ情報についての期間区切りを変更します。
   *
   * @param bizKey 変更対象のユーザビジネスキーオブジェクト
   * @param moveTerm 変更を行う期間コード及び変更後の期間情報オブジェクト
   * @return data に新しく作成された期間情報の配列を格納した BizApiResultInfo
   */
  moveTermUser(bizKey: UserBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<TermInfo[]>;
}
