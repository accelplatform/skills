/**
 * 検索条件クラス（案件プロパティなし）。
 *
 * 案件プロパティを使用しない一覧検索の検索条件・ソート条件・ページング条件を設定します。
 * レコードの取得位置またはレコードの取得件数を設定する場合、ソート条件は必須となります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ListSearchConditionNoMatterProperty/index.html
 */
declare class ListSearchConditionNoMatterProperty {
  /** 比較演算子：等しい ('=') */
  static readonly OP_EQ: string;
  /** 比較演算子：以上 ('>=') */
  static readonly OP_GE: string;
  /** 比較演算子：より大きい ('>') */
  static readonly OP_GT: string;
  /** 比較演算子：以下 ('<=') */
  static readonly OP_LE: string;
  /** 比較演算子：あいまい検索 ('like') */
  static readonly OP_LIKE: string;
  /** 比較演算子：より小さい ('<') */
  static readonly OP_LT: string;

  /**
   * 検索条件クラス（案件プロパティなし）のインスタンスを生成します。
   */
  constructor();

  /**
   * 絞り込み条件を追加します。
   *
   * @param column カラム名（ActvMatterNode 等の定数値を指定）
   * @param value 比較値
   * @param operator 比較演算子（OP_EQ, OP_LIKE 等）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addCondition(column: string, value: string, operator: string): WorkflowResultInfo<null>;

  /**
   * ソート条件を追加します。
   *
   * @param column カラム名（ActvMatterNode 等の定数値を指定）
   * @param ascending true: 昇順 / false: 降順
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addSortCondition(column: string, ascending: boolean): WorkflowResultInfo<null>;

  /**
   * 結合条件を設定します。
   *
   * @param isAndCombination true: AND 結合 / false: OR 結合
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setAndCombination(isAndCombination: boolean): WorkflowResultInfo<null>;

  /**
   * レコードの取得件数を設定します。
   *
   * @param count 取得件数
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setCount(count: number): WorkflowResultInfo<null>;

  /**
   * レコードの取得位置を設定します。
   *
   * @param offset 取得開始位置
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setOffset(offset: number): WorkflowResultInfo<null>;
}
