/**
 * ロール情報マネージャ。
 *
 * ロール情報に関連する操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/RoleInfoManager/index.html
 */
declare class RoleInfoManager {
  /**
   * ロール情報マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * ロール情報を新規登録します。
   *
   * @param roleInfo ロール情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addRoleInfo(roleInfo: RoleInfo): ResultObject<null>;

  /**
   * 指定ロールにサブロールを追加します。
   *
   * @param roleId ロールID
   * @param subRoleId サブロールID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addSubRoleInfo(roleId: string, subRoleId: string): ResultObject<null>;

  /**
   * ロール内包チェックを行います。
   *
   * 第1引数（nestRoleIds）のロールについてのみ、ネストしたサブロールを含めてチェックします。
   * 第2引数（roleIds）のロールは直接一致のみで判定されます。
   * nestRoleIds の中に roleIds のいずれかのロールが含まれる場合に true を返します。
   *
   * @param nestRoleIds 内包ロールID の配列
   * @param roleIds ロールID の配列
   * @return data に内包判定結果を格納した ResultObject（true: 内包）
   */
  certify(nestRoleIds: string[], roleIds: string[]): ResultObject<boolean>;

  /**
   * ロールの登録状態を確認します。
   *
   * @param roleId ロールID
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  contains(roleId: string): ResultObject<boolean>;

  /**
   * カテゴリの登録状態を確認します。
   *
   * @param category カテゴリ名
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  containsCategory(category: string): ResultObject<boolean>;

  /**
   * ロール名の登録状態を確認します。
   *
   * @param roleName ロール名
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  containsRoleName(roleName: string): ResultObject<boolean>;

  /**
   * ロール名の登録状態を確認します（指定ロールID を除外）。
   *
   * @param roleName ロール名
   * @param exceptRoleId 除外するロールID
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  containsRoleName(roleName: string, exceptRoleId: string): ResultObject<boolean>;

  /**
   * すべてのカテゴリを削除します。
   *
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteCategories(): ResultObject<null>;

  /**
   * カテゴリを削除します。
   *
   * @param category カテゴリ名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteCategory(category: string): ResultObject<null>;

  /**
   * ロール情報を削除します。
   *
   * @param roleId ロールID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteRoleInfo(roleId: string): ResultObject<null>;

  /**
   * すべてのロール情報を削除します。
   *
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteRoleInfos(): ResultObject<null>;

  /**
   * サブロール関係を削除します。
   *
   * @param roleId ロールID
   * @param subRoleId サブロールID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteSubRoleInfo(roleId: string, subRoleId: string): ResultObject<null>;

  /**
   * ロールのすべてのサブロール関係を削除します。
   *
   * @param roleId ロールID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteSubRoleInfos(roleId: string): ResultObject<null>;

  /**
   * 全親ロールID を取得します。
   *
   * ロール階層を再帰的に辿り、すべての上位ロールID を返却します。
   * 1階層上の親のみ取得する場合は getParentRoleIds を使用してください。
   *
   * @param roleId ロールID
   * @return data に親ロールID の配列を格納した ResultObject
   */
  getAllParentRoleIds(roleId: string): ResultObject<string[]>;

  /**
   * 全サブロールID を取得します。
   *
   * ロール階層を再帰的に展開し、すべての下位ロールID を返却します。
   * 1階層下のサブロールのみ取得する場合は getSubRoleIds を使用してください。
   *
   * @param roleId ロールID
   * @return data にサブロールID の配列を格納した ResultObject
   */
  getAllSubRoleIds(roleId: string): ResultObject<string[]>;

  /**
   * カテゴリ一覧を取得します。
   * 重複を除いた一意のカテゴリ名一覧を返却します。
   *
   * @return data にカテゴリ名の配列を格納した ResultObject
   */
  getCategories(): ResultObject<string[]>;

  /**
   * カテゴリに属するロール数を取得します。
   *
   * @deprecated getRoleInfoCountByCategory を使用してください
   * @param category カテゴリ名
   * @return data にロール数を格納した ResultObject
   */
  getCategoryCount(category: string): ResultObject<number>;

  /**
   * 親ロールID を取得します（1 階層）。
   *
   * @param roleId ロールID
   * @return data に親ロールID の配列を格納した ResultObject
   */
  getParentRoleIds(roleId: string): ResultObject<string[]>;

  /**
   * すべてのロールID を取得します。
   *
   * @return data にロールID の配列を格納した ResultObject
   */
  getRoleIds(): ResultObject<string[]>;

  /**
   * ロール情報を取得します。
   *
   * @param roleId ロールID
   * @return data に RoleInfo を格納した ResultObject
   */
  getRoleInfo(roleId: string): ResultObject<RoleInfo>;

  /**
   * ロール数を取得します。
   *
   * @return data にロール数を格納した ResultObject
   */
  getRoleInfoCount(): ResultObject<number>;

  /**
   * カテゴリ別ロール数を取得します。
   *
   * @param category カテゴリ名
   * @return data にロール数を格納した ResultObject
   */
  getRoleInfoCountByCategory(category: string): ResultObject<number>;

  /**
   * カテゴリ・ロール名別ロール数を取得します。
   *
   * category と roleName にはワイルドカード（`*`: 0文字以上、`?`: 任意の1文字）が使用できます。
   * searchRoleInfosByCategoryAndRoleName と組み合わせてページネーション実装に利用してください。
   *
   * @param category カテゴリ名
   * @param roleName ロール名
   * @param localeId ロケールID
   * @return data にロール数を格納した ResultObject
   */
  getRoleInfoCountByCategoryAndRoleName(category: string, roleName: string, localeId: string): ResultObject<number>;

  /**
   * すべてのロール情報を取得します。
   *
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  getRoleInfos(): ResultObject<RoleInfo[]>;

  /**
   * カテゴリ検索によるロール情報を取得します。
   *
   * @param category カテゴリ名
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  getRoleInfosByCategory(category: string): ResultObject<RoleInfo[]>;

  /**
   * ロールID リストによるロール情報を取得します。
   *
   * @param roleIds ロールID の配列
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  getRoleInfosByRoleIds(roleIds: string[]): ResultObject<RoleInfo[]>;

  /**
   * サブロールID を取得します（1 階層）。
   *
   * @param roleId ロールID
   * @return data にサブロールID の配列を格納した ResultObject
   */
  getSubRoleIds(roleId: string): ResultObject<string[]>;

  /**
   * 指定日付以降に更新があったかを判定します。
   *
   * @param date 基準日
   * @return data に更新有無を格納した ResultObject（true: 更新あり）
   */
  isUpdate(date: Date): ResultObject<boolean>;

  /**
   * カテゴリ名を更新します。
   * 該当カテゴリに属するすべてのロールのカテゴリ名を一括で更新します。
   *
   * @param oldCategory 旧カテゴリ名
   * @param newCategory 新カテゴリ名
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  moveCategory(oldCategory: string, newCategory: string): ResultObject<null>;

  /**
   * カテゴリ・ロール名による検索を行います。
   *
   * category と roleName にはワイルドカード（`*`: 0文字以上、`?`: 任意の1文字）が使用できます。
   * sortIndex には `category`、`role_name`、`display_name` が指定可能です。
   * sortOrder には `ASC` または `DESC` を指定します。
   *
   * @param category カテゴリ名
   * @param roleName ロール名
   * @param localeId ロケールID
   * @param limit 取得件数
   * @param offset 取得開始位置
   * @param sortIndex ソートカラム
   * @param sortOrder ソート順
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  searchRoleInfosByCategoryAndRoleName(category: string, roleName: string, localeId: string, limit: number, offset: number, sortIndex: string, sortOrder: string): ResultObject<RoleInfo[]>;

  /**
   * ロールID で検索します。
   * ワイルドカード文字が使用できます: `*`（0文字以上に一致）、`?`（任意の1文字に一致）。
   *
   * @param roleId ロールID（部分一致）
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  searchRoleInfosByRoleId(roleId: string): ResultObject<RoleInfo[]>;

  /**
   * ロール名で検索します。
   * ワイルドカード文字が使用できます: `*`（0文字以上に一致）、`?`（任意の1文字に一致）。
   *
   * @param roleName ロール名（部分一致）
   * @return data に RoleInfo の配列を格納した ResultObject
   */
  searchRoleInfosByRoleName(roleName: string): ResultObject<RoleInfo[]>;

  /**
   * ロール情報を更新します。
   *
   * @param roleInfo ロール情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateRoleInfo(roleInfo: RoleInfo): ResultObject<null>;
}
