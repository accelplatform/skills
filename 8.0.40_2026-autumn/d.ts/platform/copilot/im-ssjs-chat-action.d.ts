/**
 * チャットアクションクラス。
 *
 * 生成 AI サービスとの対話を実行します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatAction/index.html
 */
declare class ChatAction {
  /**
   * チャットアクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * メッセージ配列を送信してチャットを実行します。
   *
   * @param messages メッセージの配列
   * @param option チャットオプション
   * @return data に応答メッセージを含む ChatMessage の配列を格納した ResultObject
   */
  execute(messages: ChatMessage[], option?: ChatOption): ResultObject<ChatMessage[]>;

  /**
   * ツール設定を含めてチャットを実行します（Function Calling 対応）。
   *
   * @param messages メッセージの配列
   * @param option チャットオプション
   * @param toolConfig ツール設定
   * @return data に応答メッセージ（toolCalls を含む場合あり）の ChatMessage の配列を格納した ResultObject
   */
  executeWithTool(messages: ChatMessage[], option: ChatOption | undefined, toolConfig: ToolConfig): ResultObject<ChatMessage[]>;

  /**
   * アクション種別を返します。
   *
   * @return 'chat'
   */
  getActionType(): 'chat';

  /**
   * ドライバ種別を返します。
   *
   * @return 'open-ai', 'azure-open-ai', 'amazon-bedrock' のいずれか
   */
  getDriverType(): 'open-ai' | 'azure-open-ai' | 'amazon-bedrock';
}
