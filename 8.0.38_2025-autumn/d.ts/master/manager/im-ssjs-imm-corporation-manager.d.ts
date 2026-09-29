/**
 * 法人マネージャ。
 *
 * 法人の操作と取引先の所属操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCorporationManager/index.html
 */
declare class IMMCorporationManager {
  /**
   * 法人マネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する法人の件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporation(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の取引先に所属する法人の件数を取得します。
   *
   * @param bizKey 取得対象となる取引先ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationWithCustomer(bizKey: CustomerBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人に所属する取引先の件数を取得します。
   *
   * @param corporationBizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCustomerWithCorporation(corporationBizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数の法人ビジネスキーに該当する法人情報を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に法人情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporation(bizKey: CorporationBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<CorporationInfo | null>;

  /**
   * 引数の法人ビジネスキーに該当する法人情報を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に法人情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporation(bizKey: CorporationBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<CorporationInfo | null>;

  /**
   * 法人所属の期間情報を取得します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corpBizKey 法人ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationAttachTerm(customerBizKey: CustomerBizKeyInfo, corpBizKey: CorporationBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 法人所属の期間一覧を取得します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corpBizKey 法人ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCorporationAttachTermList(customerBizKey: CustomerBizKeyInfo, corpBizKey: CorporationBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の法人ビジネスキーに該当する全期間分の法人情報を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に法人情報の配列を格納した BizApiResultInfo
   */
  getCorporationList(bizKey: CorporationBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CorporationInfo[]>;

  /**
   * 引数の法人ビジネスキーに該当する全期間分の法人情報を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に法人情報の配列を格納した BizApiResultInfo
   */
  getCorporationList(bizKey: CorporationBizKeyInfo, isDisable: boolean): BizApiResultInfo<CorporationInfo[]>;

  /**
   * 法人ビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationTerm(bizKey: CorporationBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 法人ビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する法人ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCorporationTermList(bizKey: CorporationBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の取引先が所属している法人の一覧を取得します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getCorporationWithCustomer(customerBizKey: CustomerBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 引数の法人に所属している取引先の一覧を取得します。
   *
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getCustomerWithCorporation(corporationBizKey: CorporationBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CustomerListNodeInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する法人一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporation(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の取引先が所属する法人一覧を取得します。
   *
   * @param bizKey 取得対象となる取引先ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporationWithCustomer(bizKey: CustomerBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人に所属する取引先一覧を取得します。
   *
   * @param bizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCustomerWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CustomerListNodeInfo[]>;

  // ==================== merge 系 ====================

  /**
   * 法人所属情報を過去のデータと結合します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardCorporationAttach(customerBizKey: CustomerBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 法人情報を過去のデータと結合します。
   *
   * @param bizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardCorporation(bizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 法人所属情報を未来のデータと結合します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corpBizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardCorporationAttach(customerBizKey: CustomerBizKeyInfo, corpBizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 法人情報を未来のデータと結合します。
   *
   * @param bizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardCorporation(bizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 法人所属情報の期間区切りを変更します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corpBizKey 法人ビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCorporationAttach(customerBizKey: CustomerBizKeyInfo, corpBizKey: CorporationBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 法人情報の期間区切りを変更します。
   *
   * @param bizKey 法人ビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCorporation(bizKey: CorporationBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * すべての期間の法人所属情報を削除します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporationAttach(customerBizKey: CustomerBizKeyInfo, corporationBizKey: CorporationBizKeyInfo): BizApiResultInfo<null>;

  /**
   * 法人情報を削除します。
   *
   * @param bizKey 法人ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporation(bizKey: CorporationBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で法人を検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporation(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の取引先が所属する法人を検索します。
   *
   * @param bizKey 取得対象となる取引先ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporationWithCustomer(bizKey: CustomerBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人に所属する取引先を検索します。
   *
   * @param bizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCustomerWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CustomerListNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 法人所属情報を期間分割します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corpBizKey 法人ビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCorporationAttach(customerBizKey: CustomerBizKeyInfo, corpBizKey: CorporationBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 法人情報を期間分割します。
   *
   * @param bizKey 法人ビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCorporation(bizKey: CorporationBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set 系 ====================

  /**
   * 取引先を法人に所属させます。
   * 既に存在する場合は更新します。
   *
   * @param customerBizKey 取引先ビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param term 期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCorporationAttach(customerBizKey: CustomerBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * 法人情報を新規登録または更新します。
   *
   * @param corporation 法人情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCorporation(corporation: CorporationInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する法人の総数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporation(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の取引先に所属する法人の総数を取得します。
   *
   * @param bizKey 取得対象となる取引先ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationWithCustomer(bizKey: CustomerBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人に所属する取引先の総数を取得します。
   *
   * @param bizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCustomerWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;
}
