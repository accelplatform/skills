/**
 * 音声生成アクションクラス。
 *
 * テキストから音声を生成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AudioSpeechAction/index.html
 */
declare class AudioSpeechAction {
  /**
   * 音声生成アクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * テキストから音声を生成します。
   * option.output 指定時は data が null、未指定時は mp3 形式の ByteReader を返します。
   *
   * @param text 音声生成対象のテキスト
   * @param option 音声生成オプション
   * @return data に mp3 形式の ByteReader（option.output 指定時は null）を格納した ResultObject
   */
  execute(text: string, option?: AudioSpeechOption): ResultObject<ByteReader | null>;

  /**
   * アクション種別を返します。
   *
   * @return 'audio-speech'
   */
  getActionType(): 'audio-speech';

  /**
   * ドライバ種別を返します。
   *
   * @return 'open-ai', 'azure-open-ai', 'amazon-bedrock' のいずれか
   */
  getDriverType(): 'open-ai' | 'azure-open-ai' | 'amazon-bedrock';
}
