/**
 * アシスタントメッセージ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AssistantMessage/index.html
 */
interface AssistantMessage {
  /** メッセージの内容 */
  readonly contents: string;
  /** 役割（'user' | 'assistant' 等） */
  readonly role: string;
}
