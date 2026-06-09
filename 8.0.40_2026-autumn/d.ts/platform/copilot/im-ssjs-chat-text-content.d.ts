/**
 * テキスト型メッセージ本文情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatTextContent/index.html
 */
interface ChatTextContent {
  /** メッセージ本文テキスト */
  text: string;
  /** 関数呼び出しID（関数実行結果の場合に指定） */
  toolCallId?: string;
  /** メッセージ種別（固定値: 'text'） */
  type: 'text';
}
