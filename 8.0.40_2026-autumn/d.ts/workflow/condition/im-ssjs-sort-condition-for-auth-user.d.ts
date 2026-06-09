/**
 * 確認処理権限者用ソート条件クラス。
 *
 * ActvMatterNode#getCnfmAuthUserList() 等のソート条件として使用します。
 * レコードの取得位置またはレコードの取得件数を設定する場合、ソート条件は必須となります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/SortConditionForAuthUser/index.html
 */
declare class SortConditionForAuthUser {
  /**
   * 確認処理権限者用ソート条件クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * ソート条件を追加します。
   *
   * @param column カラム名（ActvMatterNode.USER_CODE, ActvMatterNode.USER_NAME, ActvMatterNode.CONFIRM_CPL_FLAG 等）
   * @param isASC true: 昇順 / false: 降順
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  addOrder(column: string, isASC: boolean): WorkflowResultInfo<null>;

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
