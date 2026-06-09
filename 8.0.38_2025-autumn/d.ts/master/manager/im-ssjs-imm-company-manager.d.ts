/**
 * 会社組織マネージャ。
 *
 * 会社組織の操作とユーザの所属操作、内包操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCompanyManager/index.html
 */
declare class IMMCompanyManager {
  /**
   * 会社組織マネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する会社の件数を取得します。
   * condition に指定できるテーブルは imm_company テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompany(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する役職の件数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyPost(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属する役職の件数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyPostWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザの指定組織における役職の件数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param userBizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param departmentBizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyPostWithUserOnDepartment(userBizKey: UserBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織の件数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartment(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織分類区分の件数を取得します。
   * condition に指定できるテーブルは imm_department_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartmentCategory(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織分類区分項目の件数を取得します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartmentCategoryItem(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織に所属する組織分類区分項目の件数を取得します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartmentCategoryItemWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織分類区分項目に所属する組織の件数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey 取得対象となる組織分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartmentWithDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属する組織の件数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countDepartmentWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリールートの件数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の役職に所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となる役職ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithCompanyPost(bizKey: CompanyPostBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の役職の指定組織におけるユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param companyPostBizKey 取得対象となる役職ビジネスキーオブジェクト
   * @param departmentBizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithCompanyPostOnDepartment(companyPostBizKey: CompanyPostBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織に所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織配下のツリーに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithDepartmentTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織上位のツリーに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となる組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithDepartmentUpTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 指定された組織の配下の絶対基準ツリーを取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteBranch(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo>;

  /**
   * 指定された組織の直下の絶対基準子組織一覧を取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteChildren(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織セットの絶対基準孤立組織一覧を取得します。
   *
   * @param bizKey 組織セットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteIsolation(bizKey: DepartmentSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織の絶対基準親組織一覧を取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteParent(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織セットの絶対基準ツリーを取得します。
   *
   * @param bizKey 組織セットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteTree(bizKey: DepartmentSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo[]>;

  /**
   * 指定された組織の上位の絶対基準ツリーを取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteUpBranch(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo>;

  /**
   * 指定された組織の配下ツリーを取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getBranch(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo>;

  /**
   * 指定された組織の直下の子組織一覧を取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getChildren(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 引数の会社ビジネスキーに該当する会社情報を取得します。
   *
   * @param bizKey 取得する会社ビジネスキーオブジェクト
   * @return data に会社情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompany(bizKey: CompanyBizKeyInfo): BizApiResultInfo<CompanyInfo | null>;

  /**
   * すべての会社情報を取得します。
   *
   * @return data に会社情報の配列を格納した BizApiResultInfo
   */
  getCompanyAll(): BizApiResultInfo<CompanyInfo[]>;

  /**
   * 引数の役職ビジネスキーに該当する役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPost(bizKey: CompanyPostBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<CompanyPostInfo | null>;

  /**
   * 引数の役職ビジネスキーに該当する役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @return data に役職情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPost(bizKey: CompanyPostBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<CompanyPostInfo | null>;

  /**
   * 引数の役職ビジネスキーに該当する役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に役職情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPost(bizKey: CompanyPostBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<CompanyPostInfo | null>;

  /**
   * ユーザの組織における役職の所属期間情報を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPostAttachTerm(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, companyPostBizKey: CompanyPostBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * ユーザの組織における役職の所属期間の一覧を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCompanyPostAttachTermList(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, companyPostBizKey: CompanyPostBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の役職ビジネスキーに該当する全期間分の役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPostList(bizKey: CompanyPostBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CompanyPostInfo[] | null>;

  /**
   * 引数の役職ビジネスキーに該当する全期間分の役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に役職情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPostList(bizKey: CompanyPostBizKeyInfo, localeId: string): BizApiResultInfo<CompanyPostInfo[] | null>;

  /**
   * 引数の役職ビジネスキーに該当する全期間分の役職情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPostList(bizKey: CompanyPostBizKeyInfo, isDisable: boolean): BizApiResultInfo<CompanyPostInfo[] | null>;

  /**
   * 役職ビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyPostTerm(bizKey: CompanyPostBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 役職ビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する役職ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCompanyPostTermList(bizKey: CompanyPostBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の組織ビジネスキーに該当する組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartment(bizKey: DepartmentBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<DepartmentInfo | null>;

  /**
   * 引数の組織ビジネスキーに該当する組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @return data に組織情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartment(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<DepartmentInfo | null>;

  /**
   * 引数の組織ビジネスキーに該当する組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartment(bizKey: DepartmentBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<DepartmentInfo | null>;

  /**
   * 引数の組織分類区分ビジネスキーに該当する組織分類区分情報を取得します。
   *
   * @param bizKey 取得する組織分類区分ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に組織分類区分情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentCategory(bizKey: DepartmentCtgBizKeyInfo, localeId?: string): BizApiResultInfo<DepartmentCtgInfo | null>;

  /**
   * 引数の組織分類区分項目ビジネスキーに該当する組織分類区分項目情報を取得します。
   *
   * @param bizKey 取得する組織分類区分項目ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に組織分類区分項目情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<DepartmentCtgItmInfo | null>;

  /**
   * 組織、組織分類区分項目の両ビジネスキーと日付から、対応する所属期間情報を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param departmentCtgItmBizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentCategoryItemAttachTerm(departmentBizKey: DepartmentBizKeyInfo, departmentCtgItmBizKey: DepartmentCtgItmBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 組織、組織分類区分項目の両ビジネスキーから存在する所属期間の一覧を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param departmentCtgItmBizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getDepartmentCategoryItemAttachTermList(departmentBizKey: DepartmentBizKeyInfo, departmentCtgItmBizKey: DepartmentCtgItmBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたユーザの組織及び役職情報を取得します。
   *
   * @param bizKey ユーザビジネスキーオブジェクトの配列
   * @param departmentCondition 組織検索条件
   * @param companyPostCondition 役職検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param isLocale true の場合、ロケールを考慮する
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @return data に組織役職情報の配列を格納した BizApiResultInfo
   */
  getDepartmentCompanyPostWithUser(bizKey: UserBizKeyInfo[], departmentCondition: AppCmnSearchCondition, companyPostCondition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, isLocale: boolean, start?: number, count?: number): BizApiResultInfo<DepartmentCompanyPostInfo[]>;

  /**
   * 引数の組織ビジネスキーに該当する全期間分の組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentList(bizKey: DepartmentBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<DepartmentInfo[] | null>;

  /**
   * 引数の組織ビジネスキーに該当する全期間分の組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data に組織情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentList(bizKey: DepartmentBizKeyInfo, localeId: string): BizApiResultInfo<DepartmentInfo[] | null>;

  /**
   * 引数の組織ビジネスキーに該当する全期間分の組織情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織情報の配列（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentList(bizKey: DepartmentBizKeyInfo, isDisable: boolean): BizApiResultInfo<DepartmentInfo[] | null>;

  /**
   * 複数組織の各組織情報を検索します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト群
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織情報の配列を格納した BizApiResultInfo
   */
  getDepartments(bizKey: DepartmentBizKeyInfo[], date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<DepartmentInfo[]>;

  /**
   * 引数の組織セットビジネスキーに該当する組織セット情報を取得します。
   *
   * @param bizKey 取得する組織セットビジネスキーオブジェクト
   * @return data に組織セット情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentSet(bizKey: DepartmentSetBizKeyInfo): BizApiResultInfo<DepartmentSetInfo | null>;

  /**
   * すべての組織セット情報を取得します。
   *
   * @return data に組織セット情報の配列を格納した BizApiResultInfo
   */
  getDepartmentSetAll(): BizApiResultInfo<DepartmentSetInfo[]>;

  /**
   * 引数の会社ビジネスキーに該当する組織セット情報を取得します。
   *
   * @param bizKey 取得する会社ビジネスキーオブジェクト
   * @return data に組織セット情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentSetWithCompany(bizKey: CompanyBizKeyInfo): BizApiResultInfo<DepartmentSetInfo | null>;

  /**
   * 組織ビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getDepartmentTerm(bizKey: DepartmentBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 組織ビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する組織ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getDepartmentTermList(bizKey: DepartmentBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 組織リスト情報にフルパスの組織名を付与します。
   *
   * @param listNodes 組織リスト情報の配列
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にフルパス付き組織リスト情報の配列を格納した BizApiResultInfo
   */
  getFullPathListNode(listNodes: DepartmentListNodeInfo[], date: Date, localeId: string): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織セットの孤立組織一覧を取得します。
   *
   * @param bizKey 組織セットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getIsolation(bizKey: DepartmentSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織の親組織一覧を取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getParent(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された組織セットのツリーを取得します。
   *
   * @param bizKey 組織セットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  getTree(bizKey: DepartmentSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo[]>;

  /**
   * 組織セットビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する組織セットビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getTreeTerm(bizKey: DepartmentSetBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 組織セットビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する組織セットビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTreeTermList(bizKey: DepartmentSetBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定された組織の上位ツリーを取得します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getUpBranch(bizKey: DepartmentBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo>;

  /**
   * ユーザ、組織の両ビジネスキーと日付から、対応する所属期間情報を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getUserAttachTerm(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * ユーザ、組織の両ビジネスキーから存在する所属期間の一覧を取得します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getUserAttachTermList(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件を元に会社を検索します。
   * condition に指定できるテーブルは imm_company テーブルです。
   *
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に会社リスト情報の配列を格納した BizApiResultInfo
   */
  listCompany(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に役職を検索します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyPost(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属する役職の一覧を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyPostWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザの指定組織における役職の一覧を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyPostWithUserOnDepartment(userBizKey: UserBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に組織を検索します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartment(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元に組織分類区分を検索します。
   * condition に指定できるテーブルは imm_department_ctg テーブルです。
   *
   * @param condition 取得条件
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartmentCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgListNodeInfo[]>;

  /**
   * 指定された条件を元に組織分類区分項目を検索します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param condition 取得条件
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartmentCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織に所属する組織分類区分項目の一覧を取得します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartmentCategoryItemWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織分類区分項目に所属する組織の一覧を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartmentWithDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属する組織の一覧を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 取得条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  listDepartmentWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元にツリールートを検索します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  listTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo[]>;

  /**
   * 指定された条件を元に引数の役職に所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 役職ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithCompanyPost(bizKey: CompanyPostBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の役職の指定組織におけるユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithCompanyPostOnDepartment(companyPostBizKey: CompanyPostBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織に所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織配下のツリーに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithDepartmentTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織上位のツリーに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 取得条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param localeId 表示対象のロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithDepartmentUpTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== search 系 ====================

  /**
   * 指定された条件を元に会社検索を行います。
   * condition に指定できるテーブルは imm_company テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に会社リスト情報の配列を格納した BizApiResultInfo
   */
  searchCompany(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に役職検索を行います。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyPost(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属する役職情報について検索を行います。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyPostWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザの指定組織における役職情報について検索を行います。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に役職リスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyPostWithUserOnDepartment(userBizKey: UserBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyPostListNodeInfo[]>;

  /**
   * 指定された条件を元に組織検索を行います。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartment(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元に組織分類区分検索を行います。
   * condition に指定できるテーブルは imm_department_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartmentCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgListNodeInfo[]>;

  /**
   * 指定された条件を元に組織分類区分項目検索を行います。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartmentCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織に所属する組織分類区分項目情報について検索を行います。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織分類区分項目リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartmentCategoryItemWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織分類区分項目に所属する組織情報について検索を行います。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartmentWithDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属する組織情報について検索を行います。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に組織リスト情報の配列を格納した BizApiResultInfo
   */
  searchDepartmentWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentListNodeInfo[]>;

  /**
   * 指定された条件を元にツリールート検索を行います。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  searchTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<DepartmentTreeNodeInfo[]>;

  /**
   * 指定された条件を元に引数の役職に所属するユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 役職ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithCompanyPost(bizKey: CompanyPostBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の役職の指定組織におけるユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithCompanyPostOnDepartment(companyPostBizKey: CompanyPostBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織に所属するユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織配下のツリーに所属するユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithDepartmentTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の組織上位のツリーに所属するユーザ情報について検索を行います。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 検索対象日付
   * @param localeId 検索対象ロケールID
   * @param start 取得開始レコード行（省略時 1）
   * @param count 取得レコード数（省略時 0 = 全件取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithDepartmentUpTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する会社の総数を取得します。
   * condition に指定できるテーブルは imm_company テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalCompany(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する役職の総数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalCompanyPost(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属する役職の総数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyPostWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザの指定組織における役職の総数を取得します。
   * condition に指定できるテーブルは imm_company_post テーブルです。
   *
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyPostWithUserOnDepartment(userBizKey: UserBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織の総数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalDepartment(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織分類区分の総数を取得します。
   * condition に指定できるテーブルは imm_department_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalDepartmentCategory(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当する組織分類区分項目の総数を取得します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalDepartmentCategoryItem(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織に所属する組織分類区分項目の総数を取得します。
   * condition に指定できるテーブルは imm_department_ctg_itm テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalDepartmentCategoryItemWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織分類区分項目に所属する組織の総数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalDepartmentWithDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属する組織の総数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param bizKey ユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalDepartmentWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリールートの総数を取得します。
   * condition に指定できるテーブルは imm_department テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ総数 (number) を格納した BizApiResultInfo
   */
  totalTreeRoot(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の役職に所属するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 役職ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithCompanyPost(bizKey: CompanyPostBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の役職の指定組織におけるユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithCompanyPostOnDepartment(companyPostBizKey: CompanyPostBizKeyInfo, departmentBizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織に所属するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithDepartment(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織配下のツリーに所属するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithDepartmentTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の組織上位のツリーに所属するユーザの総数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param departmentMain true の場合、主組織のみ取得する
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithDepartmentUpTree(bizKey: DepartmentBizKeyInfo, condition: AppCmnSearchCondition, departmentMain: boolean, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== set 系（登録・更新）====================

  /**
   * 役職情報を新規登録、もしくは更新処理を行います。
   *
   * @param companyPost 役職情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCompanyPost(companyPost: CompanyPostInfo): BizApiResultInfo<null>;

  /**
   * ユーザの組織における役職を設定します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCompanyPostAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, companyPostBizKey: CompanyPostBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * 組織情報を新規登録、もしくは更新処理を行います。
   *
   * @param department 組織情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setDepartment(department: DepartmentInfo): BizApiResultInfo<null>;

  /**
   * 組織分類区分情報を新規登録、もしくは更新処理を行います。
   *
   * @param departmentCtg 組織分類区分情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setDepartmentCategory(departmentCtg: DepartmentCtgInfo): BizApiResultInfo<null>;

  /**
   * 組織分類区分項目情報を新規登録、もしくは更新処理を行います。
   *
   * @param departmentCtgItm 組織分類区分項目情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setDepartmentCategoryItem(departmentCtgItm: DepartmentCtgItmInfo): BizApiResultInfo<null>;

  /**
   * 組織を組織分類区分項目に新規所属、もしくは更新処理を行います。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param departmentCtgItmBizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param term 期間、削除フラグ、ソートキーの情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setDepartmentCategoryItemAttach(departmentBizKey: DepartmentBizKeyInfo, departmentCtgItmBizKey: DepartmentCtgItmBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * 組織の内包関係を設定します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param parentDepartmentCd 親組織コード
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setDepartmentInclusion(bizKey: DepartmentBizKeyInfo, parentDepartmentCd: string, termCd: string): BizApiResultInfo<null>;

  /**
   * ユーザを組織に新規所属、もしくは更新処理を行います。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param term 期間、削除フラグ、ソートキーの情報オブジェクト
   * @param departmentMain true の場合、主組織として設定する
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, term: TermInfo, departmentMain: boolean): BizApiResultInfo<null>;

  /**
   * 会社情報を更新します。
   *
   * @param company 会社情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  updateCompany(company: CompanyInfo): BizApiResultInfo<null>;

  /**
   * 組織セット情報を更新します。
   *
   * @param departmentSet 組織セット情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  updateDepartmentSet(departmentSet: DepartmentSetInfo): BizApiResultInfo<null>;

  // ==================== remove 系（削除）====================

  /**
   * 引数の会社ビジネスキーに該当する会社情報を削除します。
   *
   * @param bizKey 削除対象の会社ビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompany(bizKey: CompanyBizKeyInfo): BizApiResultInfo<null>;

  /**
   * 引数の役職ビジネスキーに該当するすべての期間の役職情報を削除します。
   *
   * @param bizKey 削除対象の役職ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyPost(bizKey: CompanyPostBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当するすべての期間の役職情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyPost(localeId: string): BizApiResultInfo<null>;

  /**
   * ユーザの組織における役職設定を解除します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param companyPostBizKey 役職ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyPostAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, companyPostBizKey: CompanyPostBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * 引数の組織ビジネスキーに該当するすべての期間の組織情報を削除します。
   *
   * @param bizKey 削除対象の組織ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartment(bizKey: DepartmentBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当するすべての期間の組織情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartment(localeId: string): BizApiResultInfo<null>;

  /**
   * 引数の組織分類区分ビジネスキーに該当する組織分類区分情報を削除します。
   *
   * @param bizKey 削除対象の組織分類区分ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentCategory(bizKey: DepartmentCtgBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当する組織分類区分情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentCategory(localeId: string): BizApiResultInfo<null>;

  /**
   * 引数の組織分類区分項目ビジネスキーに該当する組織分類区分項目情報を削除します。
   *
   * @param bizKey 削除対象の組織分類区分項目ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentCategoryItem(bizKey: DepartmentCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 引数のロケールID に該当する組織分類区分項目情報を削除します。
   *
   * @param localeId 削除対象のロケールID
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentCategoryItem(localeId: string): BizApiResultInfo<null>;

  /**
   * 組織の組織分類区分項目所属を解除します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param departmentCtgItmBizKey 組織分類区分項目ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentCategoryItemAttach(departmentBizKey: DepartmentBizKeyInfo, departmentCtgItmBizKey: DepartmentCtgItmBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * 組織の内包関係を解除します。
   *
   * @param bizKey 組織ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentInclusion(bizKey: DepartmentBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * 引数の組織セットビジネスキーに該当する組織セット情報を削除します。
   *
   * @param bizKey 削除対象の組織セットビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeDepartmentSet(bizKey: DepartmentSetBizKeyInfo): BizApiResultInfo<null>;

  /**
   * ユーザの組織所属を解除します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo): BizApiResultInfo<null>;

  // ==================== 期間操作系 ====================

  /**
   * 登録済の役職情報を隣接するひとつ過去のレコードと結合します。
   *
   * @param bizKey 結合元となる役職ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCompanyPost(bizKey: CompanyPostBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済の組織情報を隣接するひとつ過去のレコードと結合します。
   *
   * @param bizKey 結合元となる組織ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermDepartment(bizKey: DepartmentBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済の組織セット情報を隣接するひとつ過去のレコードと結合します。
   *
   * @param bizKey 結合元となる組織セットビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermDepartmentSet(bizKey: DepartmentSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済のユーザ所属情報を隣接するひとつ過去のレコードと結合します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済の役職情報を隣接するひとつ未来のレコードと結合します。
   *
   * @param bizKey 結合元となる役職ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCompanyPost(bizKey: CompanyPostBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済の組織情報を隣接するひとつ未来のレコードと結合します。
   *
   * @param bizKey 結合元となる組織ビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermDepartment(bizKey: DepartmentBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済の組織セット情報を隣接するひとつ未来のレコードと結合します。
   *
   * @param bizKey 結合元となる組織セットビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermDepartmentSet(bizKey: DepartmentSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済のユーザ所属情報を隣接するひとつ未来のレコードと結合します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param mergeTermCd 結合対象の期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 登録済みの役職情報についての期間区切りを変更します。
   *
   * @param bizKey 変更対象の役職ビジネスキーオブジェクト
   * @param moveTerm 変更を行う期間コード及び変更後の期間情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCompanyPost(bizKey: CompanyPostBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 登録済みの組織情報についての期間区切りを変更します。
   *
   * @param bizKey 変更対象の組織ビジネスキーオブジェクト
   * @param moveTerm 変更を行う期間コード及び変更後の期間情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermDepartment(bizKey: DepartmentBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 登録済みの組織セット情報についての期間区切りを変更します。
   *
   * @param bizKey 変更対象の組織セットビジネスキーオブジェクト
   * @param moveTerm 変更を行う期間コード及び変更後の期間情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermDepartmentSet(bizKey: DepartmentSetBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 登録済みのユーザ所属情報についての期間区切りを変更します。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param moveTerm 変更を行う期間コード及び変更後の期間情報オブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 登録済みの役職情報についての期間分割を行います。
   *
   * @param bizKey 分割を行う役職ビジネスキーオブジェクト
   * @param sepTermCd 分割を行う期間コード
   * @param sepTermDate 分割を行う基準日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCompanyPost(bizKey: CompanyPostBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 登録済みの組織情報についての期間分割を行います。
   *
   * @param bizKey 分割を行う組織ビジネスキーオブジェクト
   * @param sepTermCd 分割を行う期間コード
   * @param sepTermDate 分割を行う基準日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermDepartment(bizKey: DepartmentBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 登録済みの組織セット情報についての期間分割を行います。
   *
   * @param bizKey 分割を行う組織セットビジネスキーオブジェクト
   * @param sepTermCd 分割を行う期間コード
   * @param sepTermDate 分割を行う基準日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermDepartmentSet(bizKey: DepartmentSetBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 登録済みのユーザ所属情報についての期間分割を行います。
   *
   * @param departmentBizKey 組織ビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param sepTermCd 分割を行う期間コード
   * @param sepTermDate 分割を行う基準日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermUserAttach(departmentBizKey: DepartmentBizKeyInfo, userBizKey: UserBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== その他 ====================

  /**
   * 組織セットの状態を変更します。
   *
   * @param bizKey 変更対象の組織セットビジネスキーオブジェクト
   * @param termCd 期間コード
   * @param isDisable true の場合、無効にする
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  changeDepartmentSetState(bizKey: DepartmentSetBizKeyInfo, termCd: string, isDisable: boolean): BizApiResultInfo<null>;

  /**
   * エグゼキュータを変更します。
   *
   * @param extensionPoint 拡張ポイント
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  changeExecutor(extensionPoint: string): BizApiResultInfo<null>;
}
