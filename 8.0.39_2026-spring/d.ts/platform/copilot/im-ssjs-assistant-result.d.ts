/**
 * アシスタント実行結果オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AssistantResult/index.html
 */
interface AssistantResult {
  /** 終了理由（'stop' | 'tool_calls' 等） */
  readonly finishReason: string;
  /** LLM が生成したメッセージ */
  readonly message: AssistantMessage;
  /** 関数呼び出し情報の配列 */
  readonly toolCall: ToolCall[];
}
