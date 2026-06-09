/**
 * チャットオプション情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatOption/index.html
 */
interface ChatOption {
  /** トークンの最大数 */
  maxTokens?: number;
  /** モデル */
  model?: string;
  /** トークン生成を停止するシーケンスの配列 */
  stops?: string[];
  /** 出力のランダム性（0〜2） */
  temperature?: number;
  /** top-p サンプリング（0〜1） */
  topP?: number;
}
