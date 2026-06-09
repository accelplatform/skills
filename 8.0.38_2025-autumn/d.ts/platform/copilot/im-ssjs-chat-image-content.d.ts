/**
 * 画像型メッセージ本文情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatImageContent/index.html
 */
interface ChatImageContent {
  /** 画像の DataURL 情報 */
  image_url: ChatImageContentUrl;
  /** メッセージ種別（固定値: 'image_url'） */
  type: 'image_url';
  /** 関数呼び出しID（関数実行結果の場合に指定） */
  toolCallId?: string;
}
