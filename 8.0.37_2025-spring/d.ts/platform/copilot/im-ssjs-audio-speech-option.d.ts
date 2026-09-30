/**
 * 音声生成オプション情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AudioSpeechOption/index.html
 */
interface AudioSpeechOption {
  /** 使用するモデル */
  model?: string;
  /** 生成された音声データの出力先 */
  output?: ByteWriter;
}
