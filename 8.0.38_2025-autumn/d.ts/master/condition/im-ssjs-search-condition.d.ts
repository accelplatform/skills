/**
 * 検索条件オブジェクト。
 *
 * 検索条件の管理を行うオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/SearchCondition/index.html
 */
declare class SearchCondition {
  // --- 論理演算子 ---

  /** 論理演算子 AND */
  static readonly AND: string;
  /** 論理演算子 OR */
  static readonly OR: string;

  // --- ソート方向 ---

  /** ソート方向 昇順 */
  static readonly ASC: string;
  /** ソート方向 降順 */
  static readonly DESC: string;

  // --- 検索方式 ---

  /** 検索方式 前方一致 */
  static readonly PREFIX: string;
  /** 検索方式 後方一致 */
  static readonly SUFFIX: string;
  /** 検索方式 部分一致 */
  static readonly PARTIAL: string;
  /** 検索方式 完全一致 */
  static readonly COMPLETE: string;

  // --- 比較演算子 ---

  /** 比較演算子 '=' */
  static readonly EQ: string;
  /** 比較演算子 '<=' */
  static readonly LE: string;
  /** 比較演算子 '>=' */
  static readonly GE: string;
  /** 比較演算子 '<' */
  static readonly LT: string;
  /** 比較演算子 '>' */
  static readonly GT: string;
  /** 比較演算子 '<>' */
  static readonly NOT: string;
  /** 比較演算子 'like' */
  static readonly LIKE: string;
  /** 比較演算子 'not like' */
  static readonly NOT_LIKE: string;
  /** 比較演算子 'is null' */
  static readonly IS_NULL: string;
  /** 比較演算子 'is not null' */
  static readonly IS_NOT_NULL: string;
  /** 比較演算子 'in' */
  static readonly IN: string;
  /** 比較演算子 'not in' */
  static readonly NOT_IN: string;
  /** 比較演算子 'exists' */
  static readonly EXISTS: string;
  /** 比較演算子 'not exists' */
  static readonly NOT_EXISTS: string;

  /**
   * 検索条件オブジェクトを生成します。
   */
  constructor();

  // ==================== addCondition 系 ====================

  /**
   * 検索条件オブジェクトを条件群の末尾に追加します。
   *
   * @param condition 検索条件オブジェクト
   * @return 成功した場合 true、失敗した場合 false
   */
  addCondition(condition: SearchCondition): boolean;

  /**
   * 等号を用いた検索条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param value 比較する値
   * @return 成功した場合 true、失敗した場合 false
   */
  addCondition(columnName: string, value: any): boolean;

  /**
   * 任意の比較方法を用いた検索条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param value 比較する値
   * @param operator 比較演算子
   * @return 成功した場合 true、失敗した場合 false
   */
  addCondition(columnName: string, value: any, operator: string): boolean;

  // ==================== addConditionWithIndex 系 ====================

  /**
   * 検索条件オブジェクトを追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param condition 検索条件オブジェクト
   * @return 成功した場合 true、失敗した場合 false
   */
  addConditionWithIndex(index: number, condition: SearchCondition): boolean;

  /**
   * 等号を用いた検索条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param value 比較する値
   * @return 成功した場合 true、失敗した場合 false
   */
  addConditionWithIndex(index: number, columnName: string, value: any): boolean;

  /**
   * 任意の比較方法を用いた検索条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param value 比較する値
   * @param operator 比較演算子
   * @return 成功した場合 true、失敗した場合 false
   */
  addConditionWithIndex(index: number, columnName: string, value: any, operator: string): boolean;

  // ==================== addLike 系 ====================

  /**
   * 任意の検索方式を用いた LIKE 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param value 比較値
   * @param conditionType 検索方式
   * @return 成功した場合 true、失敗した場合 false
   */
  addLike(columnName: string, value: any, conditionType: string): boolean;

  /**
   * 任意の検索方式を用いた LIKE 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param value 比較値
   * @param conditionType 検索方式
   * @return 成功した場合 true、失敗した場合 false
   */
  addLikeWithIndex(index: number, columnName: string, value: any, conditionType: string): boolean;

  // ==================== addNotLike 系 ====================

  /**
   * 任意の検索方式を用いた NOT LIKE 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param value 比較値
   * @param conditionType 検索方式
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotLike(columnName: string, value: any, conditionType: string): boolean;

  /**
   * 任意の検索方式を用いた NOT LIKE 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param value 比較値
   * @param conditionType 検索方式
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotLikeWithIndex(index: number, columnName: string, value: any, conditionType: string): boolean;

  // ==================== addIn 系 ====================

  /**
   * IN 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param values 比較値群
   * @return 成功した場合 true、失敗した場合 false
   */
  addIn(columnName: string, values: any[]): boolean;

  /**
   * IN 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param values 比較値群
   * @return 成功した場合 true、失敗した場合 false
   */
  addInWithIndex(index: number, columnName: string, values: any[]): boolean;

  // ==================== addNotIn 系 ====================

  /**
   * NOT IN 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @param values 比較値群
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotIn(columnName: string, values: any[]): boolean;

  /**
   * NOT IN 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @param values 比較値群
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotInWithIndex(index: number, columnName: string, values: any[]): boolean;

  // ==================== addIsNull 系 ====================

  /**
   * IS NULL 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addIsNull(columnName: string): boolean;

  /**
   * IS NULL 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addIsNullWithIndex(index: number, columnName: string): boolean;

  // ==================== addIsNotNull 系 ====================

  /**
   * IS NOT NULL 条件を条件群の末尾に追加します。
   *
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addIsNotNull(columnName: string): boolean;

  /**
   * IS NOT NULL 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addIsNotNullWithIndex(index: number, columnName: string): boolean;

  // ==================== addExists 系 ====================

  /**
   * EXISTS 条件を条件群の末尾に追加します。
   *
   * @param subQuery サブクエリ
   * @return 成功した場合 true、失敗した場合 false
   */
  addExists(subQuery: string): boolean;

  /**
   * EXISTS 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param subQuery サブクエリ
   * @return 成功した場合 true、失敗した場合 false
   */
  addExistsWithIndex(index: number, subQuery: string): boolean;

  // ==================== addNotExists 系 ====================

  /**
   * NOT EXISTS 条件を条件群の末尾に追加します。
   *
   * @param subQuery サブクエリ
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotExists(subQuery: string): boolean;

  /**
   * NOT EXISTS 条件を追加します。
   *
   * @param index この条件を追加するインデックス番号
   * @param subQuery サブクエリ
   * @return 成功した場合 true、失敗した場合 false
   */
  addNotExistsWithIndex(index: number, subQuery: string): boolean;

  // ==================== addOrder 系 ====================

  /**
   * ORDER 句を ORDER 文の末尾に追加します。
   *
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addOrder(columnName: string): boolean;

  /**
   * ORDER 句を条件に追加します。
   *
   * @param index この ORDER 句を追加するインデックス番号
   * @param columnName カラム名
   * @return 成功した場合 true、失敗した場合 false
   */
  addOrderWithIndex(index: number, columnName: string): boolean;

  // ==================== 取得系メソッド ====================

  /**
   * 設定されている検索条件の個数を返します。
   *
   * @return 検索条件の個数
   */
  getConditionCount(): number;

  /**
   * 設定されている検索条件の一覧を取得します。
   *
   * @return 検索条件文の配列
   */
  getConditions(): string[];

  /**
   * 設定されている検索条件のパラメータ値の一覧を取得します。
   *
   * @return パラメータ値一覧
   */
  getParameters(): any[];

  /**
   * 設定されている ORDER 文に設定されたカラム名の一覧を取得します。
   *
   * @return ORDER 文に設定されたカラム名の配列
   */
  getOrders(): string[];

  /**
   * 設定されている論理演算子を取得します。
   *
   * @return 論理演算子
   */
  // TODO: typo については、後方互換のために修正していません
  getLogicalOperetor(): string;

  /**
   * 設定されているソート方向を取得します。
   *
   * @return ソート方向
   */
  getSortDirection(): string;

  /**
   * 設定されている検索条件が LIKE 句を利用しているかを取得します。
   *
   * @return 利用している場合 true / 利用していない場合 false
   */
  isUseLike(): boolean;

  // ==================== 設定系メソッド ====================

  /**
   * 利用する論理演算子を設定します。
   *
   * @param logicalOperator 論理演算子
   * @return 成功した場合 true、失敗した場合 false
   */
  // TODO: typo については、後方互換のために修正していません
  setLogicalOperetor(logicalOperator: string): boolean;

  /**
   * 利用するソート方向を設定します。
   *
   * @param sortDirection ソート方向
   * @return 成功した場合 true、失敗した場合 false
   */
  setSortDirection(sortDirection: string): boolean;

  // ==================== SQL 生成系メソッド ====================

  /**
   * 設定された条件から、検索条件文を生成します。
   *
   * @return 検索条件文
   */
  createConditionSection(): string;

  /**
   * 設定された条件から、ORDER BY 句を生成します。
   *
   * @return 生成された ORDER 文
   */
  createOrderSection(): string;

  /**
   * 設定された条件から、WHERE 文を生成します。
   * 引数が true の場合で ORDER BY 句がある場合は、ORDER BY 句も生成されます。
   * 省略された場合は true として扱います。
   *
   * @param withOrderSection ORDER BY 句を生成するかどうか
   * @return 生成された WHERE 文
   */
  createWhereSection(withOrderSection?: boolean): string;

  /**
   * 引数のテーブル名と検索条件オブジェクトから DELETE 文を生成します。
   * エラー時は空文字列が返されます。
   *
   * @param tableName テーブル名
   * @return DELETE 文
   */
  getDeleteSqlStatement(tableName: string): string;

  // ==================== コピー ====================

  /**
   * 設定されている検索条件をコピーします。
   *
   * @return コピーされた検索条件オブジェクト
   */
  copy(): SearchCondition;
}
