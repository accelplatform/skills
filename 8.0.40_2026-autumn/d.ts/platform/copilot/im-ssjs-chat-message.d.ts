/**
 * チャットメッセージ API。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatMessage/index.html
 */
declare class ChatMessage {
  /** メッセージ本文（文字列またはコンテンツ配列） */
  content: string | (ChatTextContent | ChatImageContent)[];
  /** 役割（'user' | 'system' | 'assistant' | 'tool'） */
  role: string;
  /** ツール呼び出し情報の配列 */
  toolCalls?: ToolCall[];

  /**
   * 画像データを DataURL 形式にエンコードします。
   *
   * @param byteReader 画像データの ByteReader
   * @return data に DataURL 文字列を格納した ResultObject
   */
  static convertToImageDataUrl(byteReader: ByteReader): ResultObject<string>;
}
