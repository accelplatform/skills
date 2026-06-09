/**
 * 音声文字起こしアクションクラス。
 *
 * 音声ファイルをテキストに変換します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AudioTranscriptionAction/index.html
 */
declare class AudioTranscriptionAction {
  /**
   * 音声文字起こしアクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * 音声ファイルの文字起こしを実行します。
   * 対応形式: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
   *
   * @param input 音声データの ByteReader
   * @param option 文字起こしオプション
   * @return data に文字起こしされたテキストを格納した ResultObject
   */
  execute(input: ByteReader, option?: AudioTranscriptionOption): ResultObject<string>;

  /**
   * アクション種別を返します。
   *
   * @return 'audio-transcriptions'
   */
  getActionType(): 'audio-transcriptions';

  /**
   * ドライバ種別を返します。
   *
   * @return 'open-ai', 'azure-open-ai', 'amazon-bedrock' のいずれか
   */
  getDriverType(): 'open-ai' | 'azure-open-ai' | 'amazon-bedrock';
}
