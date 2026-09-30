/**
 * 取引先マネージャ。
 *
 * 取引先情報の操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCustomerManager/index.html
 */
declare class IMMCustomerManager {
  /**
   * 取引先マネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する取引先の件数を取得します。
   * condition に指定できるテーブルは imm_customer テーブルです。
   *
   * @param companyCd 対象会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  count(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する取引先データの総数を取得します。
   * condition に指定できるテーブルは imm_customer テーブルです。
   *
   * @param companyCd 対象会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  total(companyCd: string, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数の取引先ビジネスキーに該当する取引先情報を全期間・全ロケール分取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerInfo の配列を格納した BizApiResultInfo
   */
  get(bizKey: CustomerBizKeyInfo, isDisable?: boolean): BizApiResultInfo<CustomerInfo[]>;

  /**
   * 引数の取引先ビジネスキーに該当する取引先情報を指定日付の期間・全ロケール分取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param termDate 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerInfo を格納した BizApiResultInfo（該当なしの場合 null）
   */
  get(bizKey: CustomerBizKeyInfo, termDate: Date, isDisable?: boolean): BizApiResultInfo<CustomerInfo | null>;

  /**
   * 引数の取引先ビジネスキーに該当する取引先情報を全期間・指定ロケール分取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerInfo の配列を格納した BizApiResultInfo
   */
  get(bizKey: CustomerBizKeyInfo, localeId: string, isDisable?: boolean): BizApiResultInfo<CustomerInfo[]>;

  /**
   * 引数の取引先ビジネスキーに該当する取引先情報を指定日付の期間・指定ロケール分取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param termDate 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerInfo を格納した BizApiResultInfo（該当なしの場合 null）
   */
  get(bizKey: CustomerBizKeyInfo, termDate: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CustomerInfo | null>;

  // ==================== term 系 ====================

  /**
   * 取引先ビジネスキーに該当する全期間情報を取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間レコードも取得する
   * @return data に TermInfo の配列を格納した BizApiResultInfo
   */
  getTermList(bizKey: CustomerBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 取引先ビジネスキーと日付に対応する期間情報を取得します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param termDate 対象日付
   * @return data に TermInfo を格納した BizApiResultInfo（該当なしの場合 null）
   */
  getTerm(bizKey: CustomerBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 期間分割を行います。
   * 指定された期間コードの終了日を分割日の前日に更新し、分割日を開始日とする新しいレコードを作成します。
   * 分割日が期間の範囲外の場合はエラーになります。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param sepTermCd 分割対象の期間コード
   * @param sepTermDate 分割基準日
   * @return data に新しく作成された TermInfo を格納した BizApiResultInfo
   */
  separateTerm(bizKey: CustomerBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 期間区切りを変更します。
   * 重複するレコードの更新、および超過したレコードの削除が行われます。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param moveTerm 変更後の期間情報
   * @return data に新しく作成された TermInfo の配列を格納した BizApiResultInfo
   */
  moveTerm(bizKey: CustomerBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<TermInfo[]>;

  /**
   * 隣接するひとつ過去のレコードと結合します。
   * 過去のレコードが存在しない場合はエラーになります。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo
   */
  mergeBackwardTerm(bizKey: CustomerBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 隣接するひとつ未来のレコードと結合します。
   * 未来のレコードが存在しない場合はエラーになります。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo
   */
  mergeForwardTerm(bizKey: CustomerBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== list / search 系 ====================

  /**
   * 指定された条件を元に一覧を取得します。
   * condition に指定できるテーブルは imm_customer テーブルです。
   * 該当ロケールのデータが存在しない場合は null 値が挿入されます。
   *
   * @param companyCd 対象会社コード
   * @param condition 一覧条件
   * @param date 対象日付
   * @param localeId 表示ロケールID
   * @param start 開始行（省略時 1）
   * @param count 取得件数（省略時 0 = 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerListNodeInfo の配列を格納した BizApiResultInfo
   */
  list(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CustomerListNodeInfo[]>;

  /**
   * 指定された条件を元に検索を行います。
   * condition に指定できるテーブルは imm_customer テーブルです。
   *
   * @param companyCd 対象会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索ロケールID
   * @param start 開始行（省略時 1）
   * @param count 取得件数（省略時 0 = 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に CustomerListNodeInfo の配列を格納した BizApiResultInfo
   */
  search(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CustomerListNodeInfo[]>;

  // ==================== set / remove 系 ====================

  /**
   * 取引先情報の新規登録、もしくは更新処理を行います。
   * 期間コードが未設定の場合は新規登録、設定済みの場合は更新となります。
   *
   * @param customer 取引先情報オブジェクト
   * @return data に TermInfo の配列を格納した BizApiResultInfo（更新時は空配列）
   */
  set(customer: CustomerInfo): BizApiResultInfo<TermInfo[]>;

  /**
   * すべての期間の取引先情報を削除します。
   *
   * @param bizKey 取引先ビジネスキーオブジェクト
   * @param localeId 対象ロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo
   */
  remove(bizKey: CustomerBizKeyInfo, localeId?: string): BizApiResultInfo<null>;
}
