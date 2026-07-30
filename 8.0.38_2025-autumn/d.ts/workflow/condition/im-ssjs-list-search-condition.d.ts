/**
 * 検索条件オブジェクト。
 *
 * 検索条件になる情報を設定します。
 * 条件を指定する際に、検索のキーは各検索処理マネージャの検索キープロパティで指定します。
 * レコードの取得位置またはレコードの取得件数を設定する場合、ソート条件は必須となります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ListSearchCondition/index.html
 */
declare class ListSearchCondition {
  /** 比較演算子：等しい ('=') */
  static readonly OP_EQ: string;
  /** 比較演算子：以下 ('<=') */
  static readonly OP_LE: string;
  /** 比較演算子：以上 ('>=') */
  static readonly OP_GE: string;
  /** 比較演算子：より小さい ('<') */
  static readonly OP_LT: string;
  /** 比較演算子：より大きい ('>') */
  static readonly OP_GT: string;
  /** 比較演算子：あいまい検索 ('like') */
  static readonly OP_LIKE: string;

  /** カラムタイプ：VARCHAR */
  static readonly COL_VARCHAR: string;
  /** カラムタイプ：DATE */
  static readonly COL_DATE: string;
  /** カラムタイプ：TIMESTAMP */
  static readonly COL_TIMESTAMP: string;
  /** カラムタイプ：NUMBER */
  static readonly COL_NUMBER: string;

  /**
   * 検索条件オブジェクトのインスタンスを生成します。
   */
  constructor();

  /**
   * 検索結果モデルに表示カラムとして追加する案件プロパティのキーを追加します。
   *
   * @param mpKeyName 案件プロパティキー
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addColumnByMatterProp(mpKeyName: string): WorkflowResultInfo<null>;

  /**
   * 絞り込み条件を追加します。
   *
   * @param column カラム（各マネージャの定数値を指定）
   * @param value 比較値
   * @param operatorType 比較演算子（OP_EQ, OP_LIKE 等）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addCondition(column: string, value: string, operatorType: string): WorkflowResultInfo<null>;

  /**
   * 案件プロパティの絞り込み条件を追加します。
   *
   * @param mpKeyName 案件プロパティキー
   * @param value 比較値
   * @param operatorType 比較演算子（OP_EQ, OP_LIKE 等）
   * @param type 案件プロパティ値の型（COL_VARCHAR, COL_NUMBER 等）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addConditionByMatterProp(mpKeyName: string, value: string, operatorType: string, type: string): WorkflowResultInfo<null>;

  /**
   * ソート条件を追加します。
   *
   * @param column カラム（各マネージャの定数値を指定）
   * @param isASC true: 昇順 / false: 降順
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addOrder(column: string, isASC: boolean): WorkflowResultInfo<null>;

  /**
   * 案件プロパティをソート条件に追加します。
   *
   * @param mpKeyName 案件プロパティキー
   * @param isASC true: 昇順 / false: 降順
   * @param type 案件プロパティ値の型（COL_VARCHAR, COL_NUMBER 等）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addOrderByMatterProp(mpKeyName: string, isASC: boolean, type: string): WorkflowResultInfo<null>;

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
   * @param count レコードの取得件数（数値を文字列で指定）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setCount(count: string): WorkflowResultInfo<null>;

  /**
   * レコードの取得位置を設定します。
   *
   * @param offset レコードの取得位置（数値を文字列で指定）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setOffset(offset: string): WorkflowResultInfo<null>;
}
