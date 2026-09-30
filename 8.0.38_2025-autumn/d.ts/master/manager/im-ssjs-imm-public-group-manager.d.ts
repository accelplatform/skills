/**
 * パブリックグループマネージャ。
 *
 * パブリックグループの操作とユーザの所属操作、内包操作を行うマネージャです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/IMMPublicGroupManager/index.html
 */
declare class IMMPublicGroupManager {
  /**
   * パブリックグループマネージャのインスタンスを生成します。
   *
   * @param updateUserCd 更新ユーザコード（省略時はログインユーザ）
   * @param defaultLocaleId デフォルトロケールID（省略時はログインユーザのロケール）
   */
  constructor(updateUserCd?: string, defaultLocaleId?: string);

  // ==================== count 系 ====================

  /**
   * 指定された条件に該当するパブリックグループの件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分の件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupCategory(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分項目の件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupCategoryItem(condition: AppCmnSearchCondition, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するパブリックグループ分類区分項目の件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupCategoryItemWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループロールの件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupRole(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループロールの件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupRoleWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザの指定パブリックグループにおけるパブリックグループロールの件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param userBizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupRoleWithUserOnPublicGroup(userBizKey: UserBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ分類区分項目に所属するパブリックグループの件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupWithPublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループの件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countPublicGroupWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリールートの件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループロールに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループロールの指定パブリックグループにおけるユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param publicGroupRoleBizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPublicGroupRoleOnPublicGroup(publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ配下のツリーに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPublicGroupTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ上位のツリーに所属するユーザの件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  countUserWithPublicGroupUpTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== get 系 ====================

  /**
   * 指定されたパブリックグループの配下の絶対基準ツリーを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteBranch(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo>;

  /**
   * 指定されたパブリックグループの直下の絶対基準子パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteChildren(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループセットの絶対基準孤立パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteIsolation(bizKey: PublicGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループの絶対基準親パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteParent(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループセットの絶対基準ツリーを取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  getAbsoluteTree(bizKey: PublicGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo[]>;

  /**
   * 指定されたパブリックグループの上位の絶対基準ツリーを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getAbsoluteUpBranch(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo>;

  /**
   * 指定されたパブリックグループの配下ツリーを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getBranch(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo>;

  /**
   * 指定されたパブリックグループの直下の子パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getChildren(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * パブリックグループリスト情報にフルパスを設定して取得します。
   *
   * @param listNodes パブリックグループリスト情報の配列
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getFullPathListNode(listNodes: PublicGroupListNodeInfo[], date: Date, localeId: string): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループセットの孤立パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getIsolation(bizKey: PublicGroupSetBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループの親パブリックグループ一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  getParent(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定されたパブリックグループを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にパブリックグループ情報を格納した BizApiResultInfo
   */
  getPublicGroup(bizKey: PublicGroupBizKeyInfo, termDate: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<PublicGroupInfo>;

  /**
   * 指定されたパブリックグループを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にパブリックグループ情報を格納した BizApiResultInfo
   */
  getPublicGroup(bizKey: PublicGroupBizKeyInfo, termDate: Date, localeId: string): BizApiResultInfo<PublicGroupInfo>;

  /**
   * 指定されたパブリックグループを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する
   * @return data にパブリックグループ情報を格納した BizApiResultInfo
   */
  getPublicGroup(bizKey: PublicGroupBizKeyInfo, termDate: Date, isDisable: boolean): BizApiResultInfo<PublicGroupInfo>;

  /**
   * 指定されたパブリックグループ分類区分を取得します。
   *
   * @param bizKey パブリックグループ分類区分ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data にパブリックグループ分類区分情報を格納した BizApiResultInfo
   */
  getPublicGroupCategory(bizKey: PublicGroupCtgBizKeyInfo, localeId?: string): BizApiResultInfo<PublicGroupCtgInfo>;

  /**
   * 指定されたパブリックグループ分類区分項目を取得します。
   *
   * @param bizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @return data にパブリックグループ分類区分項目情報を格納した BizApiResultInfo
   */
  getPublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<PublicGroupCtgItmInfo>;

  /**
   * 指定されたパブリックグループとパブリックグループ分類区分項目の紐付け期間を取得します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param publicGroupCtgItmBizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getPublicGroupCategoryItemAttachTerm(publicGroupBizKey: PublicGroupBizKeyInfo, publicGroupCtgItmBizKey: PublicGroupCtgItmBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループとパブリックグループ分類区分項目の紐付け期間一覧を取得します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param publicGroupCtgItmBizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupCategoryItemAttachTermList(publicGroupBizKey: PublicGroupBizKeyInfo, publicGroupCtgItmBizKey: PublicGroupCtgItmBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたパブリックグループの全期間一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にパブリックグループ情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupList(bizKey: PublicGroupBizKeyInfo, localeId?: string, isDisable?: boolean): BizApiResultInfo<PublicGroupInfo[]>;

  /**
   * 指定されたユーザが所属するパブリックグループとパブリックグループロールの一覧を取得します。
   *
   * @param bizKey ユーザビジネスキーオブジェクトの配列
   * @param publicGroupCondition パブリックグループの検索条件
   * @param publicGroupRoleCondition パブリックグループロールの検索条件
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isLocale ロケールで絞り込むかどうか
   * @param start 取得開始位置
   * @param count 取得件数
   * @return data にパブリックグループ・パブリックグループロール情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupPublicGroupRoleWithUser(bizKey: UserBizKeyInfo[], publicGroupCondition: AppCmnSearchCondition, publicGroupRoleCondition: AppCmnSearchCondition, date: Date, localeId: string, isLocale: boolean, start?: number, count?: number): BizApiResultInfo<PublicGroupPublicGroupRoleInfo[]>;

  /**
   * 指定されたパブリックグループロールを取得します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param date 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にパブリックグループロール情報を格納した BizApiResultInfo
   */
  getPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, date: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleInfo>;

  /**
   * 指定されたパブリックグループロールの紐付け期間を取得します。
   *
   * @param publicGroupRoleBizKey パブリックグループロールビジネスキーオブジェクト
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getPublicGroupRoleAttachTerm(publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループロールの紐付け期間一覧を取得します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param publicGroupRoleBizKey パブリックグループロールビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupRoleAttachTermList(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたパブリックグループロールの全期間一覧を取得します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にパブリックグループロール情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupRoleList(bizKey: PublicGroupRoleBizKeyInfo, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleInfo[]>;

  /**
   * 指定されたパブリックグループロールの期間を取得します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getPublicGroupRoleTerm(bizKey: PublicGroupRoleBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループロールの期間一覧を取得します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupRoleTermList(bizKey: PublicGroupRoleBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたパブリックグループセットを取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @return data にパブリックグループセット情報を格納した BizApiResultInfo
   */
  getPublicGroupSet(bizKey: PublicGroupSetBizKeyInfo): BizApiResultInfo<PublicGroupSetInfo>;

  /**
   * 全てのパブリックグループセットを取得します。
   *
   * @return data にパブリックグループセット情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupSetAll(): BizApiResultInfo<PublicGroupSetInfo[]>;

  /**
   * 指定されたパブリックグループの期間を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getPublicGroupTerm(bizKey: PublicGroupBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループの期間一覧を取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getPublicGroupTermList(bizKey: PublicGroupBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたパブリックグループの全期間データを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にパブリックグループ情報の配列を格納した BizApiResultInfo
   */
  getPublicGroups(bizKey: PublicGroupBizKeyInfo, termDate: Date, localeId?: string, isDisable?: boolean): BizApiResultInfo<PublicGroupInfo[]>;

  /**
   * 指定されたパブリックグループセットのツリーを取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  getTree(bizKey: PublicGroupSetBizKeyInfo, termDate: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo[]>;

  /**
   * 指定されたパブリックグループセットのツリー期間を取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getTreeTerm(bizKey: PublicGroupSetBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループセットのツリー期間一覧を取得します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getTreeTermList(bizKey: PublicGroupSetBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  /**
   * 指定されたパブリックグループの上位ツリーを取得します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param date 基準日
   * @param localeId 取得するレコードのロケールID
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報を格納した BizApiResultInfo
   */
  getUpBranch(bizKey: PublicGroupBizKeyInfo, date: Date, localeId: string, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo>;

  /**
   * 指定されたパブリックグループとユーザの紐付け期間を取得します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param termDate 期間の基準日
   * @return data に期間情報を格納した BizApiResultInfo
   */
  getUserAttachTerm(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, termDate: Date): BizApiResultInfo<TermInfo>;

  /**
   * 指定されたパブリックグループとユーザの紐付け期間一覧を取得します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data に期間情報の配列を格納した BizApiResultInfo
   */
  getUserAttachTermList(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, isDisable?: boolean): BizApiResultInfo<TermInfo[]>;

  // ==================== list 系 ====================

  /**
   * 指定された条件に該当するパブリックグループの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分の一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分項目の一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するパブリックグループ分類区分項目の一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupCategoryItemWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgItmListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループロールの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupRole(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループロールの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupRoleWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザの指定パブリックグループにおけるパブリックグループロールの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param userBizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupRoleWithUserOnPublicGroup(userBizKey: UserBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ分類区分項目に所属するパブリックグループの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupWithPublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  listPublicGroupWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件に該当するツリールートの一覧を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  listTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループロールに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループロールの指定パブリックグループにおけるユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param publicGroupRoleBizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPublicGroupRoleOnPublicGroup(publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ配下のツリーに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPublicGroupTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ上位のツリーに所属するユーザの一覧を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  listUserWithPublicGroupUpTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== search 系 ====================

  /**
   * 指定された条件に該当するパブリックグループを検索します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroup(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分を検索します。
   * condition に指定できるテーブルは imm_public_group_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupCategory(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分項目を検索します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupCategoryItem(condition: AppCmnSearchCondition, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgItmListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するパブリックグループ分類区分項目を検索します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupCategoryItemWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupCtgItmListNodeInfo[]>;

  /**
   * 指定された条件に該当するパブリックグループロールを検索します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupRole(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループロールを検索します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupRoleWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザの指定パブリックグループにおけるパブリックグループロールを検索します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param userBizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupRoleWithUserOnPublicGroup(userBizKey: UserBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupRoleListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ分類区分項目に所属するパブリックグループを検索します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupWithPublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループを検索します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にリスト情報の配列を格納した BizApiResultInfo
   */
  searchPublicGroupWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupListNodeInfo[]>;

  /**
   * 指定された条件に該当するツリールートを検索します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にツリー情報の配列を格納した BizApiResultInfo
   */
  searchTreeRoot(condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<PublicGroupTreeNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループロールに所属するユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループロールの指定パブリックグループにおけるユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param publicGroupRoleBizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPublicGroupRoleOnPublicGroup(publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ配下のツリーに所属するユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPublicGroupTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  /**
   * 指定された条件を元に引数のパブリックグループ上位のツリーに所属するユーザを検索します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param localeId 対象ロケールID
   * @param start 取得開始位置
   * @param count 取得件数
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にユーザリスト情報の配列を格納した BizApiResultInfo
   */
  searchUserWithPublicGroupUpTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, localeId: string, start?: number, count?: number, isDisable?: boolean): BizApiResultInfo<UserListNodeInfo[]>;

  // ==================== total 系 ====================

  /**
   * 指定された条件に該当するパブリックグループの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroup(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分の全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupCategory(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループ分類区分項目の全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param condition 検索条件
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupCategoryItem(condition: AppCmnSearchCondition, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するパブリックグループ分類区分項目の全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_ctg_itm テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupCategoryItemWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するパブリックグループロールの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupRole(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループロールの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupRoleWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザの指定パブリックグループにおけるパブリックグループロールの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group_role テーブルです。
   *
   * @param userBizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupRoleWithUserOnPublicGroup(userBizKey: UserBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ分類区分項目に所属するパブリックグループの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupWithPublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のユーザに所属するパブリックグループの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param bizKey 取得対象となるユーザビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalPublicGroupWithUser(bizKey: UserBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件に該当するツリールートの全件数を取得します。
   * condition に指定できるテーブルは imm_public_group テーブルです。
   *
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalTreeRoot(condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループに所属するユーザの全件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPublicGroup(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループロールに所属するユーザの全件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループロールの指定パブリックグループにおけるユーザの全件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param publicGroupRoleBizKey 取得対象となるパブリックグループロールビジネスキーオブジェクト
   * @param publicGroupBizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPublicGroupRoleOnPublicGroup(publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, publicGroupBizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ配下のツリーに所属するユーザの全件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPublicGroupTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  /**
   * 指定された条件を元に引数のパブリックグループ上位のツリーに所属するユーザの全件数を取得します。
   * condition に指定できるテーブルは imm_user テーブルです。
   *
   * @param bizKey 取得対象となるパブリックグループビジネスキーオブジェクト
   * @param condition 検索条件
   * @param date 対象日付
   * @param isDisable true の場合、削除フラグが有効なレコードも取得する（省略時 false）
   * @return data にデータ件数 (number) を格納した BizApiResultInfo
   */
  totalUserWithPublicGroupUpTree(bizKey: PublicGroupBizKeyInfo, condition: AppCmnSearchCondition, date: Date, isDisable?: boolean): BizApiResultInfo<number>;

  // ==================== set 系 ====================

  /**
   * パブリックグループを登録・更新します。
   *
   * @param publicGroup パブリックグループ情報
   * @return 処理結果
   */
  setPublicGroup(publicGroup: PublicGroupInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループ分類区分を登録・更新します。
   *
   * @param publicGroupCtg パブリックグループ分類区分情報
   * @return 処理結果
   */
  setPublicGroupCategory(publicGroupCtg: PublicGroupCtgInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループ分類区分項目を登録・更新します。
   *
   * @param publicGroupCtgItm パブリックグループ分類区分項目情報
   * @return 処理結果
   */
  setPublicGroupCategoryItem(publicGroupCtgItm: PublicGroupCtgItmInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループとパブリックグループ分類区分項目の紐付けを登録・更新します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param publicGroupCtgItmBizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param term 期間情報
   * @return 処理結果
   */
  setPublicGroupCategoryItemAttach(publicGroupBizKey: PublicGroupBizKeyInfo, publicGroupCtgItmBizKey: PublicGroupCtgItmBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループの内包関係を登録・更新します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param parentPublicGroupCd 親パブリックグループコード
   * @param termCd 期間コード
   * @return 処理結果
   */
  setPublicGroupInclusion(bizKey: PublicGroupBizKeyInfo, parentPublicGroupCd: string, termCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループロールを登録・更新します。
   *
   * @param publicGroupRole パブリックグループロール情報
   * @return 処理結果
   */
  setPublicGroupRole(publicGroupRole: PublicGroupRoleInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの紐付けを登録・更新します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param publicGroupRoleBizKey パブリックグループロールビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return 処理結果
   */
  setPublicGroupRoleAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * ユーザとパブリックグループの紐付けを登録・更新します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param term 期間情報
   * @return 処理結果
   */
  setUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, term: TermInfo): BizApiResultInfo<null>;

  // ==================== remove 系 ====================

  /**
   * パブリックグループを削除します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール削除）
   * @return 処理結果
   */
  removePublicGroup(bizKey: PublicGroupBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * パブリックグループ分類区分を削除します。
   *
   * @param bizKey パブリックグループ分類区分ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール削除）
   * @return 処理結果
   */
  removePublicGroupCategory(bizKey: PublicGroupCtgBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * パブリックグループ分類区分項目を削除します。
   *
   * @param bizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール削除）
   * @return 処理結果
   */
  removePublicGroupCategoryItem(bizKey: PublicGroupCtgItmBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * パブリックグループとパブリックグループ分類区分項目の紐付けを削除します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param publicGroupCtgItmBizKey パブリックグループ分類区分項目ビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return 処理結果
   */
  removePublicGroupCategoryItemAttach(publicGroupBizKey: PublicGroupBizKeyInfo, publicGroupCtgItmBizKey: PublicGroupCtgItmBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループの内包関係を削除します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return 処理結果
   */
  removePublicGroupInclusion(bizKey: PublicGroupBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループロールを削除します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param localeId 削除対象のロケールID（省略時は全ロケール削除）
   * @return 処理結果
   */
  removePublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, localeId?: string): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの紐付けを削除します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param publicGroupRoleBizKey パブリックグループロールビジネスキーオブジェクト
   * @param termCd 期間コード
   * @return 処理結果
   */
  removePublicGroupRoleAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, publicGroupRoleBizKey: PublicGroupRoleBizKeyInfo, termCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループセットを削除します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @return 処理結果
   */
  removePublicGroupSet(bizKey: PublicGroupSetBizKeyInfo): BizApiResultInfo<null>;

  /**
   * ユーザとパブリックグループの紐付けを削除します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @return 処理結果
   */
  removeUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo): BizApiResultInfo<null>;

  // ==================== update 系 ====================

  /**
   * パブリックグループセットを更新します。
   *
   * @param publicGroupSet パブリックグループセット情報
   * @return 処理結果
   */
  updatePublicGroupSet(publicGroupSet: PublicGroupSetInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループセットの状態を変更します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param termCd 期間コード
   * @param isDisable true の場合、削除フラグを有効にする
   * @return 処理結果
   */
  changePublicGroupSetState(bizKey: PublicGroupSetBizKeyInfo, termCd: string, isDisable: boolean): BizApiResultInfo<null>;

  // ==================== 期間操作系 ====================

  /**
   * パブリックグループの期間を移動します（関連するすべてのデータを含む）。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return 処理結果
   */
  moveTerm(bizKey: PublicGroupBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループの期間を移動します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return 処理結果
   */
  moveTermPublicGroup(bizKey: PublicGroupBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの期間を移動します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return 処理結果
   */
  moveTermPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループセットの期間を移動します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return 処理結果
   */
  moveTermPublicGroupSet(bizKey: PublicGroupSetBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * ユーザ紐付けの期間を移動します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param moveTerm 移動先の期間情報
   * @return 処理結果
   */
  moveTermUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, moveTerm: TermInfo): BizApiResultInfo<null>;

  /**
   * パブリックグループの期間を過去方向に統合します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeBackwardTermPublicGroup(bizKey: PublicGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの期間を過去方向に統合します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeBackwardTermPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループセットの期間を過去方向に統合します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeBackwardTermPublicGroupSet(bizKey: PublicGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * ユーザ紐付けの期間を過去方向に統合します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeBackwardTermUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループの期間を未来方向に統合します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeForwardTermPublicGroup(bizKey: PublicGroupBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの期間を未来方向に統合します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeForwardTermPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループセットの期間を未来方向に統合します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeForwardTermPublicGroupSet(bizKey: PublicGroupSetBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * ユーザ紐付けの期間を未来方向に統合します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param mergeTermCd 統合対象の期間コード
   * @return 処理結果
   */
  mergeForwardTermUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, mergeTermCd: string): BizApiResultInfo<null>;

  /**
   * パブリックグループの期間を分割します。
   *
   * @param bizKey パブリックグループビジネスキーオブジェクト
   * @param sepTermCd 分割対象の期間コード
   * @param sepTermDate 分割日
   * @return 処理結果
   */
  separateTermPublicGroup(bizKey: PublicGroupBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * パブリックグループロールの期間を分割します。
   *
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param sepTermCd 分割対象の期間コード
   * @param sepTermDate 分割日
   * @return 処理結果
   */
  separateTermPublicGroupRole(bizKey: PublicGroupRoleBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * パブリックグループセットの期間を分割します。
   *
   * @param bizKey パブリックグループセットビジネスキーオブジェクト
   * @param sepTermCd 分割対象の期間コード
   * @param sepTermDate 分割日
   * @return 処理結果
   */
  separateTermPublicGroupSet(bizKey: PublicGroupSetBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  /**
   * ユーザ紐付けの期間を分割します。
   *
   * @param publicGroupBizKey パブリックグループビジネスキーオブジェクト
   * @param userBizKey ユーザビジネスキーオブジェクト
   * @param sepTermCd 分割対象の期間コード
   * @param sepTermDate 分割日
   * @return 処理結果
   */
  separateTermUserAttach(publicGroupBizKey: PublicGroupBizKeyInfo, userBizKey: UserBizKeyInfo, sepTermCd: string, sepTermDate: Date): BizApiResultInfo<null>;

  // ==================== deprecated ====================

  /**
   * パブリックグループを登録・更新します。
   *
   * @deprecated setPublicGroup() を使用してください。
   * @param publicGroup パブリックグループ情報
   * @return 処理結果
   */
  set(publicGroup: PublicGroupInfo): BizApiResultInfo<null>;

  /**
   * 指定されたパブリックグループロールを取得します。
   *
   * @deprecated getPublicGroupRole() を使用してください。
   * @param bizKey パブリックグループロールビジネスキーオブジェクト
   * @param date 期間の基準日
   * @param localeId 取得するレコードのロケールID
   * @return data にパブリックグループロール情報を格納した BizApiResultInfo
   */
  getRole(bizKey: PublicGroupRoleBizKeyInfo, date: Date, localeId: string): BizApiResultInfo<PublicGroupRoleInfo>;
}
