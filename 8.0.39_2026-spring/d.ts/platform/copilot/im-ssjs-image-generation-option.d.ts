/**
 * 画像生成オプション情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ImageGenerationOption/index.html
 */
interface ImageGenerationOption {
  /** 画像の高さ */
  height?: number;
  /** 使用するモデル */
  model?: string;
  /** 生成された画像の出力先 */
  output?: ByteWriter;
  /** 高品質フラグ */
  quality?: boolean;
  /** 画像の幅 */
  width?: number;
}
