/**
 * 法人グループマネージャ。
 *
 * 法人グループの操作と法人の所属操作、内包操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMCorporationGroupManager/index.html
 */
declare class IMMCorporationGroupManager {
  /**
   * 法人グループマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する法人グループの件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人に所属する法人グループの件数を取得します。
   *
   * @param bizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationGroupWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループに所属する法人の件数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationWithCorporationGroup(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループ以下の階層に所属する法人の件数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationWithCorporationGroupTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループ以上の階層に所属する法人の件数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCorporationWithCorporationGroupUpTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

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
   * 指定された法人グループの配下の絶対基準ツリーを取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteBranch(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  /**
   * 指定された法人グループの直下の絶対基準子法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteChildren(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループセットの絶対基準孤立法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteIsolation(bizKey: CorporationGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループの絶対基準親法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteParent(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループセットの絶対基準ツリーを取得します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteTree(bizKey: CorporationGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  /**
   * 指定された法人グループの上位の絶対基準ツリーを取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteUpBranch(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  /**
   * 指定された法人グループの配下ツリーを取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getBranch(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  /**
   * 指定された法人グループの直下の子法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getChildren(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 法人グループ所属の期間情報を取得します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationAttachTerm(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 法人グループ所属の期間一覧を取得します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCorporationAttachTermList(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の法人グループビジネスキーに該当する法人グループ情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に法人グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationGroup(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupInfo | null>;

  /**
   * 引数の法人グループビジネスキーに該当する法人グループ情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @return data に法人グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationGroup(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<CorporationGroupInfo | null>;

  /**
   * 引数の法人グループビジネスキーに該当する法人グループ情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に法人グループ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationGroup(bizKey: CorporationGroupBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<CorporationGroupInfo | null>;

  /**
   * 引数の法人グループビジネスキーに該当する全期間分の法人グループ情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に法人グループ情報の配列を格納した BizApiResultInfo
   */
  getCorporationGroupList(bizKey: CorporationGroupBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupInfo[]>;

  /**
   * 引数の法人グループビジネスキーに該当する全期間分の法人グループ情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に法人グループ情報の配列を格納した BizApiResultInfo
   */
  getCorporationGroupList(bizKey: CorporationGroupBizKeyInfo, isDisable: boolean): BizApiResultInfo<CorporationGroupInfo[]>;

  /**
   * 引数の法人グループセットビジネスキーに該当する法人グループセット情報を取得します。
   *
   * @param bizKey 取得する法人グループセットビジネスキーオブジェクト
   * @return data に法人グループセット情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo): BizApiResultInfo<CorporationGroupSetInfo | null>;

  /**
   * すべての法人グループセット情報を取得します。
   *
   * @param companyCd 会社コード
   * @return data に法人グループセット情報の配列を格納した BizApiResultInfo
   */
  getCorporationGroupSetAll(companyCd: string): BizApiResultInfo<CorporationGroupSetInfo[]>;

  /**
   * 法人グループビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCorporationGroupTerm(bizKey: CorporationGroupBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 法人グループビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する法人グループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCorporationGroupTermList(bizKey: CorporationGroupBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * リストノードの名称を階層のフルパス名に置き換えます。
   *
   * @param listNodes 法人グループリストノード情報の配列
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にフルパス名を設定したリスト情報の配列を格納した BizApiResultInfo
   */
  getFullPathListNode(listNodes: CorporationGroupListNodeInfo[], date: Date, localeId: string): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループセットの孤立法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getIsolation(bizKey: CorporationGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループの直上の親法人グループ一覧を取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getParent(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された法人グループセットのツリーを取得します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getTree(bizKey: CorporationGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  /**
   * 法人グループセットビジネスキーから、対応するツリー期間情報を取得します。
   *
   * @param bizKey 取得する法人グループセットビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getTreeTerm(bizKey: CorporationGroupSetBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 法人グループセットビジネスキーから存在するツリー期間の一覧を取得します。
   *
   * @param bizKey 取得する法人グループセットビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTreeTermList(bizKey: CorporationGroupSetBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定された法人グループの上位ツリーを取得します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getUpBranch(bizKey: CorporationGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する法人グループ一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporationGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人に所属する法人グループ一覧を取得します。
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
  listCorporationGroupWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループに所属する法人一覧を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporationWithCorporationGroup(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループ以下の階層に所属する法人一覧を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporationWithCorporationGroupTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループ以上の階層に所属する法人一覧を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCorporationWithCorporationGroupUpTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

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
  listTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo[]>;

  // ==================== change 系 ====================

  /**
   * 法人グループセット-内包情報の論理削除ステータスを変更します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param termCd 期間コード
   * @param isDisable true の場合、論理削除する
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  changeCorporationGroupSetState(bizKey: CorporationGroupSetBizKeyInfo, termCd: string, isDisable: boolean): BizApiResultInfo<null>;

  // ==================== merge 系 ====================

  /**
   * 所属情報を過去のデータと結合します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 法人グループ情報を過去のデータと結合します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCorporationGroup(bizKey: CorporationGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を過去のデータと結合します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardTermCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 所属情報を未来のデータと結合します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 法人グループ情報を未来のデータと結合します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCorporationGroup(bizKey: CorporationGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を未来のデータと結合します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardTermCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 所属情報の期間区切りを変更します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 法人グループ情報の期間区切りを変更します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCorporationGroup(bizKey: CorporationGroupBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * セット-内包情報の期間区切りを変更します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * すべての期間の法人グループ所属情報を削除します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo): BizApiResultInfo<null>;

  /**
   * 法人グループ情報を削除します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporationGroup(bizKey: CorporationGroupBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 内包情報を削除します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporationGroupInclusion(bizKey: CorporationGroupBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * すべての期間のセット-内包情報を削除します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で法人グループを検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporationGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人に所属する法人グループを検索します。
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
  searchCorporationGroupWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループに所属する法人を検索します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporationWithCorporationGroup(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループ以下の階層の法人を検索します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporationWithCorporationGroupTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の法人グループ以上の階層の法人を検索します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCorporationWithCorporationGroupUpTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationListNodeInfo[]>;

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
  searchTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<CorporationGroupTreeNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 所属情報を期間分割します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 法人グループ情報を期間分割します。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCorporationGroup(bizKey: CorporationGroupBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * セット-内包情報を期間分割します。
   *
   * @param bizKey 法人グループセットビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCorporationGroupSet(bizKey: CorporationGroupSetBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set / update 系 ====================

  /**
   * 法人を法人グループに所属させます。
   * 既に存在する場合は更新します。
   *
   * @param corporationGroupBizKey 法人グループビジネスキーオブジェクト
   * @param corporationBizKey 法人ビジネスキーオブジェクト
   * @param term 期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCorporationAttach(corporationGroupBizKey: CorporationGroupBizKeyInfo, corporationBizKey: CorporationBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * 法人グループ情報を新規登録または更新します。
   *
   * @param corporationGroup 法人グループ情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCorporationGroup(corporationGroup: CorporationGroupInfo): BizApiResultInfo<null>;

  /**
   * 法人グループに内包関係を付与または付け替えます。
   *
   * @param bizKey 法人グループビジネスキーオブジェクト
   * @param parentCorporationGroupCd 親法人グループコード
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCorporationGroupInclusion(bizKey: CorporationGroupBizKeyInfo, parentCorporationGroupCd: string, termCd: string): BizApiResultInfo<null>;

  /**
   * 法人グループセットを更新します。
   *
   * @param corporationGroupSet 法人グループセット情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  updateCorporationGroupSet(corporationGroupSet: CorporationGroupSetInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する法人グループの総数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationGroup(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人に所属する法人グループの総数を取得します。
   *
   * @param bizKey 取得対象となる法人ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationGroupWithCorporation(bizKey: CorporationBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループに所属する法人の総数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationWithCorporationGroup(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループ以下の階層の法人総数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationWithCorporationGroupTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の法人グループ以上の階層の法人総数を取得します。
   *
   * @param bizKey 取得対象となる法人グループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCorporationWithCorporationGroupUpTree(bizKey: CorporationGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

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
