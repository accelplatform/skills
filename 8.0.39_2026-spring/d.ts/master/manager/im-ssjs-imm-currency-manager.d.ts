/**
 * 通貨マネージャ。
 *
 * 通貨情報の操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCurrencyManager/index.html
 */
declare class IMMCurrencyManager {
  /**
   * 通貨マネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する通貨の件数を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCurrency(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する通貨換算コードの件数を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCurrencyConversion(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する通貨精度の件数を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCurrencyPrecision(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する通貨レートの件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCurrencyRate(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数の通貨ビジネスキーに該当する通貨情報を取得します。
   *
   * @param bizKey 取得する通貨ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrency(bizKey: CurrencyBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CurrencyInfo | null>;

  /**
   * 引数の通貨ビジネスキーに該当する通貨情報を取得します。
   *
   * @param bizKey 取得する通貨ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に通貨情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrency(bizKey: CurrencyBizKeyInfo, localeId: string): BizApiResultInfo<CurrencyInfo | null>;

  /**
   * 引数の通貨ビジネスキーに該当する通貨情報を取得します。
   *
   * @param bizKey 取得する通貨ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に通貨情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrency(bizKey: CurrencyBizKeyInfo, isDisable: boolean): BizApiResultInfo<CurrencyInfo | null>;

  /**
   * 引数の通貨換算コードビジネスキーに該当する通貨換算コード情報を取得します。
   *
   * @param bizKey 取得する通貨換算コードビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨換算コード情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyConversion(bizKey: CurrencyConversionBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CurrencyConversionInfo | null>;

  /**
   * 引数の通貨換算コードビジネスキーに該当する通貨換算コード情報を取得します。
   *
   * @param bizKey 取得する通貨換算コードビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に通貨換算コード情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyConversion(bizKey: CurrencyConversionBizKeyInfo, localeId: string): BizApiResultInfo<CurrencyConversionInfo | null>;

  /**
   * 引数の通貨換算コードビジネスキーに該当する通貨換算コード情報を取得します。
   *
   * @param bizKey 取得する通貨換算コードビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に通貨換算コード情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyConversion(bizKey: CurrencyConversionBizKeyInfo, isDisable: boolean): BizApiResultInfo<CurrencyConversionInfo | null>;

  /**
   * 引数の通貨精度ビジネスキーに該当する通貨精度情報を取得します。
   *
   * @param bizKey 取得する通貨精度ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨精度情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyPrecision(bizKey: CurrencyPrecisionBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CurrencyPrecisionInfo | null>;

  /**
   * 引数の通貨精度ビジネスキーに該当する通貨精度情報を取得します。
   *
   * @param bizKey 取得する通貨精度ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に通貨精度情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyPrecision(bizKey: CurrencyPrecisionBizKeyInfo, localeId: string): BizApiResultInfo<CurrencyPrecisionInfo | null>;

  /**
   * 引数の通貨精度ビジネスキーに該当する通貨精度情報を取得します。
   *
   * @param bizKey 取得する通貨精度ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に通貨精度情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyPrecision(bizKey: CurrencyPrecisionBizKeyInfo, isDisable: boolean): BizApiResultInfo<CurrencyPrecisionInfo | null>;

  /**
   * 引数の通貨レートビジネスキーに該当する通貨レート情報を取得します。
   *
   * @param bizKey 取得する通貨レートビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨レート情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyRate(bizKey: CurrencyRateBizKeyInfo, date: Date, isDisable?: boolean): BizApiResultInfo<CurrencyRateInfo | null>;

  /**
   * 引数の通貨レートビジネスキーに該当する通貨レート情報一覧を取得します。
   *
   * @param bizKey 取得する通貨レートビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨レート情報の配列を格納した BizApiResultInfo
   */
  getCurrencyRateList(bizKey: CurrencyRateBizKeyInfo, isDisable?: boolean): BizApiResultInfo<CurrencyRateInfo[]>;

  /**
   * 通貨レートビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する通貨レートビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCurrencyRateTerm(bizKey: CurrencyRateBizKeyInfo, date: Date, isDisable?: boolean): BizApiResultInfo<TermInfo | null>;

  /**
   * 通貨レートビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する通貨レートビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCurrencyRateTermList(bizKey: CurrencyRateBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定された条件を元に通貨レート情報一覧を取得します。
   *
   * @param currencyCondition 通貨検索条件
   * @param baseCurrencyCondition 相手先通貨検索条件
   * @param currencyConversionCondition 通貨換算コード検索条件
   * @param currencyRateCondition 通貨レート検索条件
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に通貨レート情報の配列を格納した BizApiResultInfo
   */
  getCurrencyRates(currencyCondition: AppCmnSearchCondition, baseCurrencyCondition: AppCmnSearchCondition, currencyConversionCondition: AppCmnSearchCondition, currencyRateCondition: AppCmnSearchCondition, date: Date, localeId?: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyRateInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する通貨一覧を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCurrency(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyListNodeInfo[]>;

  /**
   * 指定された条件に該当する通貨換算コード一覧を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCurrencyConversion(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyConversionListNodeInfo[]>;

  /**
   * 指定された条件に該当する通貨精度一覧を取得します。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCurrencyPrecision(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyPrecisionListNodeInfo[]>;

  /**
   * 指定された条件に該当する通貨レート一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCurrencyRate(condition: AppCmnSearchCondition, date: Date, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyRateListNodeInfo[]>;

  // ==================== merge 系 ====================

  /**
   * 通貨レート情報を過去のデータと結合します。
   *
   * @param bizKey 通貨レートビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCurrencyRate(bizKey: CurrencyRateBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 通貨レート情報を未来のデータと結合します。
   *
   * @param bizKey 通貨レートビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCurrencyRate(bizKey: CurrencyRateBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 通貨レート情報の期間区切りを変更します。
   *
   * @param bizKey 通貨レートビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCurrencyRate(bizKey: CurrencyRateBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * 通貨情報を削除します。
   *
   * @param bizKey 通貨ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCurrency(bizKey: CurrencyBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 通貨換算コード情報を削除します。
   *
   * @param bizKey 通貨換算コードビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCurrencyConversion(bizKey: CurrencyConversionBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 通貨精度情報を削除します。
   *
   * @param bizKey 通貨精度ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCurrencyPrecision(bizKey: CurrencyPrecisionBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 通貨レート情報を削除します。
   *
   * @param bizKey 通貨レートビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCurrencyRate(bizKey: CurrencyRateBizKeyInfo): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で通貨を検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCurrency(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyListNodeInfo[]>;

  /**
   * 指定された条件で通貨換算コードを検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCurrencyConversion(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyConversionListNodeInfo[]>;

  /**
   * 指定された条件で通貨精度を検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCurrencyPrecision(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CurrencyPrecisionListNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 通貨レート情報を期間分割します。
   *
   * @param bizKey 通貨レートビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCurrencyRate(bizKey: CurrencyRateBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set 系 ====================

  /**
   * 通貨情報を新規登録または更新します。
   *
   * @param currency 通貨情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCurrency(currency: CurrencyInfo): BizApiResultInfo<null>;

  /**
   * 通貨換算コード情報を新規登録または更新します。
   *
   * @param currencyConversion 通貨換算コード情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCurrencyConversion(currencyConversion: CurrencyConversionInfo): BizApiResultInfo<null>;

  /**
   * 通貨精度情報を新規登録または更新します。
   *
   * @param currencyPrecision 通貨精度情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCurrencyPrecision(currencyPrecision: CurrencyPrecisionInfo): BizApiResultInfo<null>;

  /**
   * 通貨レート情報を新規登録または更新します。
   *
   * @param currencyRate 通貨レート情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCurrencyRate(currencyRate: CurrencyRateInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する通貨の総数を取得します。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCurrency(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する通貨換算コードの総数を取得します。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCurrencyConversion(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する通貨精度の総数を取得します。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCurrencyPrecision(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;
}
