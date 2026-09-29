/**
 * IM-LogicDesigner フロー実行 API。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/LogicFlowExecutor/index.html
 */
declare class LogicFlowExecutor {
  /**
   * 指定されたフローの最新バージョンを実行します。
   *
   * @param flowId フローID
   * @param inputData 入力データ
   * @return 実行結果
   */
  static execute(flowId: string, inputData: LogicFlowExecutor.InputData): ResultObject<LogicFlowExecutor.OutputData>;

  /**
   * 指定されたフローの特定バージョンを実行します。
   *
   * @param flowId フローID
   * @param version バージョン番号
   * @param inputData 入力データ
   * @return 実行結果
   */
  static execute(flowId: string, version: number, inputData: LogicFlowExecutor.InputData): ResultObject<LogicFlowExecutor.OutputData>;
}

declare namespace LogicFlowExecutor {
  type InputData = any;
  type OutputData = any;
}
