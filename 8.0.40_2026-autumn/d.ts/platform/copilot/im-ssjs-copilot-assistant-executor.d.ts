/**
 * IM-Copilot アシスタント実行クラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/CopilotAssistantExecutor/index.html
 */
declare class CopilotAssistantExecutor {
  /**
   * IM-Copilot アシスタント実行クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * 指定したアシスタントID の処理を実行します。
   *
   * @param assistantId アシスタントID
   * @param parameter 入力パラメータ
   * @return data にアシスタントの実行結果（AssistantResult）を格納した ResultObject
   */
  execute(assistantId: string, parameter: CopilotAssistantExecutor.Parameter): ResultObject<AssistantResult>;

  /**
   * 指定したアシスタントID に対する実行権限の有無を確認します。
   *
   * @param assistantId アシスタントID
   * @return data に実行権限の有無を格納（true: 権限あり）
   */
  isAuthorize(assistantId: string): ResultObject<boolean>;
}

declare namespace CopilotAssistantExecutor {
  type Parameter = { [key: string]: any };
}
