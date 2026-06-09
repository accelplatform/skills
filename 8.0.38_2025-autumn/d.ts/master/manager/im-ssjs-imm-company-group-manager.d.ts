/**
 * 会社グループマネージャ。
 *
 * 会社グループの操作と会社の所属操作、内包操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCompanyGroupManager/index.html
 */
declare class IMMCompanyGroupManager {
  /**
   * 会社グループマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する会社グループの件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社に所属する会社グループの件数を取得します。
   *
   * @param bizKey 取得対象となる会社ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyGroupWithCompany(bizKey: CompanyBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループに所属する会社の件数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyWithCompanyGroup(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループ以下の階層に所属する会社の件数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyWithCompanyGroupTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループ以上の階層に所属する会社の件数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCompanyWithCompanyGroupUpTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリールートの件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 指定された会社グループの配下の絶対基準ツリーを取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteBranch(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  /**
   * 指定された会社グループの直下の絶対基準子会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteChildren(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループセットの絶対基準孤立会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteIsolation(bizKey: CompanyGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループの絶対基準親会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteParent(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループセットの絶対基準ツリーを取得します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteTree(bizKey: CompanyGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  /**
   * 指定された会社グループの上位の絶対基準ツリーを取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteUpBranch(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  /**
   * 指定された会社グループの配下ツリーを取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getBranch(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  /**
   * 指定された会社グループの直下の子会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getChildren(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 会社グループ所属の期間情報を取得します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyAttachTerm(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 会社グループ所属の期間一覧を取得します。
   *
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCompanyAttachTermList(companyBizKey: CompanyBizKeyInfo, companyGroupBizKey: CompanyGroupBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の会社グループビジネスキーに該当する会社グループ情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に会社グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyGroup(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupInfo | null>;

  /**
   * 引数の会社グループビジネスキーに該当する会社グループ情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @return data に会社グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyGroup(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<CompanyGroupInfo | null>;

  /**
   * 引数の会社グループビジネスキーに該当する会社グループ情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に会社グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyGroup(bizKey: CompanyGroupBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<CompanyGroupInfo | null>;

  /**
   * 引数の会社グループビジネスキーに該当する全期間分の会社グループ情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に会社グループ情報の配列を格納した BizApiResultInfo
   */
  getCompanyGroupList(bizKey: CompanyGroupBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupInfo[]>;

  /**
   * 引数の会社グループビジネスキーに該当する全期間分の会社グループ情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に会社グループ情報の配列を格納した BizApiResultInfo
   */
  getCompanyGroupList(bizKey: CompanyGroupBizKeyInfo, isDisable: boolean): BizApiResultInfo<CompanyGroupInfo[]>;

  /**
   * 引数の会社グループセットビジネスキーに該当する会社グループセット情報を取得します。
   *
   * @param bizKey 取得する会社グループセットビジネスキーオブジェクト
   * @return data に会社グループセット情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo): BizApiResultInfo<CompanyGroupSetInfo | null>;

  /**
   * すべての会社グループセット情報を取得します。
   *
   * @return data に会社グループセット情報の配列を格納した BizApiResultInfo
   */
  getCompanyGroupSetAll(): BizApiResultInfo<CompanyGroupSetInfo[]>;

  /**
   * 会社グループビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCompanyGroupTerm(bizKey: CompanyGroupBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 会社グループビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する会社グループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCompanyGroupTermList(bizKey: CompanyGroupBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * リストノードの名称を階層のフルパス名に置き換えます。
   *
   * @param listNodes 会社グループリストノード情報の配列
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にフルパス名を設定したリスト情報の配列を格納した BizApiResultInfo
   */
  getFullPathListNode(listNodes: CompanyGroupListNodeInfo[], date: Date, localeId: string): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループセットの孤立会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getIsolation(bizKey: CompanyGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループの直上の親会社グループ一覧を取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getParent(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された会社グループセットのツリーを取得します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getTree(bizKey: CompanyGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  /**
   * 会社グループセットビジネスキーから、対応するツリー期間情報を取得します。
   *
   * @param bizKey 取得する会社グループセットビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getTreeTerm(bizKey: CompanyGroupSetBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 会社グループセットビジネスキーから存在するツリー期間の一覧を取得します。
   *
   * @param bizKey 取得する会社グループセットビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTreeTermList(bizKey: CompanyGroupSetBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定された会社グループの上位ツリーを取得します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getUpBranch(bizKey: CompanyGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する会社グループ一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社に所属する会社グループ一覧を取得します。
   *
   * @param bizKey 取得対象となる会社ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyGroupWithCompany(bizKey: CompanyBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループに所属する会社一覧を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyWithCompanyGroup(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループ以下の階層に所属する会社一覧を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyWithCompanyGroupTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループ以上の階層に所属する会社一覧を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCompanyWithCompanyGroupUpTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件に該当するツリー構造の親の一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  listTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo[]>;

  // ==================== change 系 ====================

  /**
   * 会社グループセット-内包情報の論理削除ステータスを変更します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param termCd 期間コード
   * @param isDisable true の場合、論理削除する
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  changeCompanyGroupSetState(bizKey: CompanyGroupSetBizKeyInfo, termCd: string, isDisable: boolean): BizApiResultInfo<null>;

  // ==================== merge 系 ====================

  /**
   * 所属情報を過去のデータと結合します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 会社グループ情報を過去のデータと結合します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCompanyGroup(bizKey: CompanyGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を過去のデータと結合します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 所属情報を未来のデータと結合します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 会社グループ情報を未来のデータと結合します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCompanyGroup(bizKey: CompanyGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を未来のデータと結合します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 所属情報の期間区切りを変更します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 会社グループ情報の期間区切りを変更します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCompanyGroup(bizKey: CompanyGroupBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * セット-内包情報の期間区切りを変更します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * すべての期間の会社グループ所属情報を削除します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo): BizApiResultInfo<null>;

  /**
   * 会社グループ情報を削除します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyGroup(bizKey: CompanyGroupBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 内包情報を削除します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyGroupInclusion(bizKey: CompanyGroupBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * すべての期間のセット-内包情報を削除します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で会社グループを検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社に所属する会社グループを検索します。
   *
   * @param bizKey 取得対象となる会社ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyGroupWithCompany(bizKey: CompanyBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループに所属する会社を検索します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyWithCompanyGroup(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループ以下の階層の会社を検索します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyWithCompanyGroupTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の会社グループ以上の階層の会社を検索します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCompanyWithCompanyGroupUpTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyListNodeInfo[]>;

  /**
   * 指定された条件でツリー構造の親を検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  searchTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CompanyGroupTreeNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 所属情報を期間分割します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 会社グループ情報を期間分割します。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCompanyGroup(bizKey: CompanyGroupBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * セット-内包情報を期間分割します。
   *
   * @param bizKey 会社グループセットビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCompanyGroupSet(bizKey: CompanyGroupSetBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set / update 系 ====================

  /**
   * 会社を会社グループに所属させます。
   * 既に存在する場合は更新します。
   *
   * @param companyGroupBizKey 会社グループビジネスキーオブジェクト
   * @param companyBizKey 会社ビジネスキーオブジェクト
   * @param term 期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCompanyAttach(companyGroupBizKey: CompanyGroupBizKeyInfo, companyBizKey: CompanyBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * 会社グループ情報を新規登録または更新します。
   *
   * @param companyGroup 会社グループ情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCompanyGroup(companyGroup: CompanyGroupInfo): BizApiResultInfo<null>;

  /**
   * 会社グループに内包関係を付与または付け替えます。
   *
   * @param bizKey 会社グループビジネスキーオブジェクト
   * @param parentCompanyGroupCd 親会社グループコード
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCompanyGroupInclusion(bizKey: CompanyGroupBizKeyInfo, parentCompanyGroupCd: string, termCd: string): BizApiResultInfo<null>;

  /**
   * 会社グループセットを更新します。
   *
   * @param companyGroupSet 会社グループセット情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  updateCompanyGroupSet(companyGroupSet: CompanyGroupSetInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する会社グループの総数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyGroup(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社に所属する会社グループの総数を取得します。
   *
   * @param bizKey 取得対象となる会社ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyGroupWithCompany(bizKey: CompanyBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループに所属する会社の総数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyWithCompanyGroup(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループ以下の階層の会社総数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyWithCompanyGroupTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の会社グループ以上の階層の会社総数を取得します。
   *
   * @param bizKey 取得対象となる会社グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCompanyWithCompanyGroupUpTree(bizKey: CompanyGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリー構造の親の総数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalTreeRoot(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;
}
