/**
 * 処理結果情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/WorkflowResultInfo/index.html
 */
type WorkflowResultInfo<T> = WorkflowResultInfo.Success<T> | WorkflowResultInfo.Failure<T>;

declare namespace WorkflowResultInfo {
  interface Success<T> {
    /** 処理結果 */
    readonly data: T;
    /** 結果フラグ（true: 成功 / false: 失敗） */
    readonly resultFlag: true;
    /** 処理結果ステータス情報オブジェクト */
    readonly resultStatus: ResultStatusInfo;
  }

  interface Failure<T> {
    /** 処理結果 */
    readonly data: unknown;
    /** 結果フラグ（true: 成功 / false: 失敗） */
    readonly resultFlag: false;
    /** 処理結果ステータス情報オブジェクト */
    readonly resultStatus: ResultStatusInfo;
  }
}
