/**
 * 関数呼び出し情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ToolCall/index.html
 */
interface ToolCall {
  /** 関数呼び出し引数（JSON 形式の文字列） */
  arguments: string;
  /** 関数呼び出しID */
  id: string;
  /** 関数名 */
  name: string;
}
