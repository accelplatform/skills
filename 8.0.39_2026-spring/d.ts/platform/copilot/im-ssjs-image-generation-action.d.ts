/**
 * 画像生成アクションクラス。
 *
 * プロンプトから画像を生成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ImageGenerationAction/index.html
 */
declare class ImageGenerationAction {
  /**
   * 画像生成アクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * 画像生成を実行します。
   * option.output 指定時は data が null、未指定時は PNG 形式の ByteReader を返します。
   *
   * @param prompt 生成画像の説明文
   * @param option 画像生成オプション
   * @return data に PNG 形式の ByteReader（option.output 指定時は null）を格納した ResultObject
   */
  execute(prompt: string, option?: ImageGenerationOption): ResultObject<ByteReader | null>;

  /**
   * アクション種別を返します。
   *
   * @return 'images-generations'
   */
  getActionType(): 'images-generations';

  /**
   * ドライバ種別を返します。
   *
   * @return 'open-ai', 'azure-open-ai', 'amazon-bedrock' のいずれか
   */
  getDriverType(): 'open-ai' | 'azure-open-ai' | 'amazon-bedrock';
}
