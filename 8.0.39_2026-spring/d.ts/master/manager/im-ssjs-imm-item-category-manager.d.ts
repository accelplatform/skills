/**
 * 品目カテゴリマネージャ。
 *
 * 品目カテゴリ情報の操作と品目の所属操作、内包操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMItemCategoryManager/index.html
 */
declare class IMMItemCategoryManager {
  /**
   * 品目カテゴリマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当する品目カテゴリの件数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCategory(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目に所属する品目カテゴリの件数を取得します。
   *
   * @param bizKey 取得対象となる品目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countCategoryWithItem(bizKey: ItemBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリに所属する品目の件数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countItemWithCategory(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以下の階層に所属する品目の件数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countItemWithCategoryTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以上の階層に所属する品目の件数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countItemWithCategoryUpTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

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
   * 指定された品目カテゴリの配下の絶対基準ツリーを取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteBranch(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  /**
   * 指定された品目カテゴリの直下の絶対基準子品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteChildren(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリセットの絶対基準孤立品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteIsolation(bizKey: ItemCategorySetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリの絶対基準親品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteParent(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリセットの絶対基準ツリーを取得します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteTree(bizKey: ItemCategorySetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  /**
   * 指定された品目カテゴリの上位の絶対基準ツリーを取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteUpBranch(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  /**
   * 指定された品目カテゴリの配下ツリーを取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getBranch(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  /**
   * 品目カテゴリ所属の期間情報を取得します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCategoryAttachTerm(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 品目カテゴリ所属の期間一覧を取得します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCategoryAttachTermList(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の品目カテゴリビジネスキーに該当する品目カテゴリ情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目カテゴリ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCategory(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryInfo | null>;

  /**
   * 引数の品目カテゴリビジネスキーに該当する品目カテゴリ情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param date 基準日（この日付が含まれる期間のみ取得）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に品目カテゴリ情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCategory(bizKey: ItemCategoryBizKeyInfo, date: Date, isDisable: boolean): BizApiResultInfo<ItemCategoryInfo | null>;

  /**
   * 引数の品目カテゴリビジネスキーに該当する全期間分の品目カテゴリ情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に品目カテゴリ情報の配列を格納した BizApiResultInfo
   */
  getCategoryList(bizKey: ItemCategoryBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryInfo[]>;

  /**
   * 引数の品目カテゴリビジネスキーに該当する全期間分の品目カテゴリ情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data に品目カテゴリ情報の配列を格納した BizApiResultInfo
   */
  getCategoryList(bizKey: ItemCategoryBizKeyInfo, isDisable: boolean): BizApiResultInfo<ItemCategoryInfo[]>;

  /**
   * 引数の品目カテゴリセットビジネスキーに該当する品目カテゴリセット情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリセットビジネスキーオブジェクト
   * @return data に品目カテゴリセット情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCategorySet(bizKey: ItemCategorySetBizKeyInfo): BizApiResultInfo<ItemCategorySetInfo | null>;

  /**
   * すべての品目カテゴリセット情報を取得します。
   *
   * @param companyCd 会社コード
   * @return data に品目カテゴリセット情報の配列を格納した BizApiResultInfo
   */
  getCategorySetAll(companyCd?: string): BizApiResultInfo<ItemCategorySetInfo[]>;

  /**
   * 品目カテゴリビジネスキーから、対応する期間情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getCategoryTerm(bizKey: ItemCategoryBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 品目カテゴリビジネスキーから存在する期間の一覧を取得します。
   *
   * @param bizKey 取得する品目カテゴリビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getCategoryTermList(bizKey: ItemCategoryBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 引数の品目が所属している品目カテゴリの一覧を取得します。
   *
   * @param bizKey 品目ビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getCategoryWithItem(bizKey: ItemBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリの直下の子品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getChildren(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * リストノードの名称を階層のフルパス名に置き換えます。
   *
   * @param listNodes 品目カテゴリリストノード情報の配列
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にフルパス名を設定したリスト情報の配列を格納した BizApiResultInfo
   */
  getFullPathListNode(listNodes: ItemCategoryListNodeInfo[], date: Date, localeId: string): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリセットの孤立品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getIsolation(bizKey: ItemCategorySetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 引数の品目カテゴリに所属している品目の一覧を取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getItemWithCategory(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  /**
   * 指定された品目カテゴリの直上の親品目カテゴリ一覧を取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getParent(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された品目カテゴリセットのツリーを取得します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getTree(bizKey: ItemCategorySetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  /**
   * 品目カテゴリセットビジネスキーから、対応するツリー期間情報を取得します。
   *
   * @param bizKey 取得する品目カテゴリセットビジネスキーオブジェクト
   * @param date 期間情報を取得する基準日付
   * @return data に期間情報（該当なしの場合 null）を格納した BizApiResultInfo
   */
  getTreeTerm(bizKey: ItemCategorySetBizKeyInfo, date: Date): BizApiResultInfo<TermInfo | null>;

  /**
   * 品目カテゴリセットビジネスキーから存在するツリー期間の一覧を取得します。
   *
   * @param bizKey 取得する品目カテゴリセットビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効な期間も取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTreeTermList(bizKey: ItemCategorySetBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定された品目カテゴリの上位ツリーを取得します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getUpBranch(bizKey: ItemCategoryBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当する品目カテゴリ一覧を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCategory(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目に所属する品目カテゴリ一覧を取得します。
   *
   * @param bizKey 取得対象となる品目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listCategoryWithItem(bizKey: ItemBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリに所属する品目一覧を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listItemWithCategory(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以下の階層に所属する品目一覧を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listItemWithCategoryTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以上の階層に所属する品目一覧を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listItemWithCategoryUpTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

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
  listTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo[]>;

  // ==================== change 系 ====================

  /**
   * 品目カテゴリセット-内包情報の論理削除ステータスを変更します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param termCd 期間コード
   * @param isDisable true の場合、論理削除する
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  changeCategorySetState(bizKey: ItemCategoryBizKeyInfo, termCd: string, isDisable: boolean): BizApiResultInfo<null>;

  // ==================== merge 系 ====================

  /**
   * 所属情報を過去のデータと結合します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報を過去のデータと結合します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardCategory(bizKey: ItemCategoryBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を過去のデータと結合します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeBackwardCategorySet(bizKey: ItemCategorySetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 所属情報を未来のデータと結合します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報を未来のデータと結合します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardCategory(bizKey: ItemCategoryBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * セット-内包情報を未来のデータと結合します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param mergeTermCd 結合する期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  mergeForwardCategorySet(bizKey: ItemCategorySetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  // ==================== move 系 ====================

  /**
   * 所属情報の期間区切りを変更します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報の期間区切りを変更します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCategory(bizKey: ItemCategoryBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * セット-内包情報の期間区切りを変更します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  moveTermCategorySet(bizKey: ItemCategorySetBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * すべての期間の品目カテゴリ所属情報を削除します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報を削除します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール）
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCategory(bizKey: ItemCategoryBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * 内包情報を削除します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCategoryInclusion(bizKey: ItemCategoryBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * すべての期間のセット-内包情報を削除します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  removeCategorySet(bizKey: ItemCategoryBizKeyInfo): BizApiResultInfo<null>;

  // ==================== search 系 ====================

  /**
   * 指定された条件で品目カテゴリを検索します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCategory(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目に所属する品目カテゴリを検索します。
   *
   * @param bizKey 取得対象となる品目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchCategoryWithItem(bizKey: ItemBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリに所属する品目を検索します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchItemWithCategory(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以下の階層の品目を検索します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchItemWithCategoryTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以上の階層の品目を検索します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置（省略時 0）
   * @param count 取得件数（省略時 0: 全件）
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchItemWithCategoryUpTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemListNodeInfo[]>;

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
  searchTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<ItemCategoryTreeNodeInfo[]>;

  // ==================== separate 系 ====================

  /**
   * 所属情報を期間分割します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報を期間分割します。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCategory(bizKey: ItemCategoryBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * セット-内包情報を期間分割します。
   *
   * @param bizKey 品目カテゴリセットビジネスキーオブジェクト
   * @param sepTermCd 分割する期間コード
   * @param sepTermDate 分割日付
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  separateTermCategorySet(bizKey: ItemCategorySetBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== set / update 系 ====================

  /**
   * 品目を品目カテゴリに所属させます。
   * 既に存在する場合は更新します。
   *
   * @param itemBizKey 品目ビジネスキーオブジェクト
   * @param categoryBizKey 品目カテゴリビジネスキーオブジェクト
   * @param term 期間情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCategoryAttach(itemBizKey: ItemBizKeyInfo, categoryBizKey: ItemCategoryBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * 品目カテゴリ情報を新規登録または更新します。
   *
   * @param category 品目カテゴリ情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCategory(category: ItemCategoryInfo): BizApiResultInfo<null>;

  /**
   * セットおよび品目カテゴリ情報を新規作成または更新します。
   *
   * @param category 品目カテゴリ情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCategoryAsRoot(category: ItemCategoryInfo): BizApiResultInfo<null>;

  /**
   * 品目カテゴリに内包関係を付与または付け替えます。
   *
   * @param bizKey 品目カテゴリビジネスキーオブジェクト
   * @param parentCategoryCd 親品目カテゴリコード
   * @param termCd 期間コード
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  setCategoryInclusion(bizKey: ItemCategoryBizKeyInfo, parentCategoryCd: string, termCd: string): BizApiResultInfo<null>;

  /**
   * 品目カテゴリセットを更新します。
   *
   * @param categorySetInfo 品目カテゴリセット情報
   * @return data に null を格納した BizApiResultInfo（処理の成否は error を参照）
   */
  updateCategorySet(categorySetInfo: ItemCategorySetInfo): BizApiResultInfo<null>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当する品目カテゴリの総数を取得します。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCategory(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目に所属する品目カテゴリの総数を取得します。
   *
   * @param bizKey 取得対象となる品目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalCategoryWithItem(bizKey: ItemBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリに所属する品目の総数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalItemWithCategory(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以下の階層の品目総数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalItemWithCategoryTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数の品目カテゴリ以上の階層の品目総数を取得します。
   *
   * @param bizKey 取得対象となる品目カテゴリビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalItemWithCategoryUpTree(bizKey: ItemCategoryBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

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
