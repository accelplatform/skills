/**
 * プライベートグループマネージャ。
 *
 * プライベートグループの操作とユーザの所属操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMPrivateGroupManager/index.html
 */
declare class IMMPrivateGroupManager {
  /**
   * プライベートグループマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当するプライベートグループの件数を取得します。
   *
   * @param condition 検索条件
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPrivateGroup(condition: AppCmnSearchCondition): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のプライベートグループに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるプライベートグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPrivateGroup(bizKey: PrivateGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数のプライベートグループビジネスキーに該当するプライベートグループ情報を取得します。
   *
   * @param bizKey 取得するプライベートグループビジネスキーオブジェクト
   * @return data にプライベートグループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getPrivateGroup(bizKey: PrivateGroupBizKeyInfo): BizApiResultInfo<PrivateGroupInfo | null>;

  // ==================== list 系 ====================

  /**
   * 指定された条件を元に引数のプライベートグループに所属するユーザ一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるプライベートグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPrivateGroup(bizKey: PrivateGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== remove 系 ====================

  /**
   * プライベートグループ情報を削除します。
   *
   * @param bizKey プライベートグループビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removePrivateGroup(bizKey: PrivateGroupBizKeyInfo): BizApiResultInfo<null>;

  /**
   * プライベートグループからユーザの所属を削除します。
   *
   * @param bizKey プライベートグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserAttach(bizKey: PrivateGroupBizKeyInfo, userBizKey: UserBizKeyInfo): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件でプライベートグループを検索します。
   *
   * @param condition 検索条件
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @return data にプライベートグループリスト情報の配列を格納した BizApiResultInfo
   */
  searchPrivateGroup(condition: AppCmnSearchCondition, start?: number, count?: number): BizApiResultInfo<PrivateGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のプライベートグループに所属するユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるプライベートグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPrivateGroup(bizKey: PrivateGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== set 系 ====================

  /**
   * プライベートグループ情報を新規登録または更新します。
   *
   * @param privateGroup プライベートグループ情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setPrivateGroup(privateGroup: PrivateGroupInfo): BizApiResultInfo<null>;

  /**
   * ユーザをプライベートグループに所属させます。
   * 既に存在する場合は更新します。
   *
   * @param bizKey プライベートグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param sortKey ソートキー
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setUserAttach(bizKey: PrivateGroupBizKeyInfo, userBizKey: UserBizKeyInfo, sortKey: string): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件を元に引数のプライベートグループに所属するユーザの総数を取得します。
   *
   * @param bizKey 取得対象となるプライベートグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPrivateGroup(bizKey: PrivateGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;
}
