/**
 * 品目マネージャ。
 *
 * 品目情報の操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMItemManager/index.html
 */
declare class IMMItemManager {
  /**
   * 品目マネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する品目の件数を取得します。
   *
   * @param companyCd 会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  count(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 引数の品目ビジネスキーに該当する品目情報を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  get(bizKey: ItemBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemInfo | null>;

  /**
   * 引数の品目ビジネスキーに該当する全期間分の品目情報を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目情報の配列を格納した BizApiResultInfo
   */
  get(bizKey: ItemBizKeyInfo, isDisable?: boolean): BizApiResultInfo<ItemInfo[]>;

  /**
   * 引数の品目ビジネスキーに該当する品目情報を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  get(bizKey: ItemBizKeyInfo, date: Date, isDisable?: boolean): BizApiResultInfo<ItemInfo | null>;

  /**
   * 引数の品目ビジネスキーに該当する全期間分の品目情報を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目情報の配列を格納した BizApiResultInfo
   */
  get(bizKey: ItemBizKeyInfo, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemInfo[]>;

  /**
   * 品目ビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getTerm(bizKey: ItemBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 品目ビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する品目ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTermList(bizKey: ItemBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する品目一覧を取得します。
   *
   * @param companyCd 会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  list(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  // ==================== merge 系 ====================

  /**
   * 品目情報を過去のデータと結合します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTerm(bizKey: ItemBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 品目情報を未来のデータと結合します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTerm(bizKey: ItemBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 品目情報の期間区切りを変更します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTerm(bizKey: ItemBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * 品目情報を削除します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  remove(bizKey: ItemBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で品目を検索します。
   *
   * @param companyCd 会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  search(companyCd: string, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 品目情報を期間分割します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTerm(bizKey: ItemBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set 系 ====================

  /**
   * 品目情報を新規登録または更新します。
   *
   * @param item 品目情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  set(item: ItemInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する品目の総数を取得します。
   *
   * @param companyCd 会社コード
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  total(companyCd: string, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;
}
