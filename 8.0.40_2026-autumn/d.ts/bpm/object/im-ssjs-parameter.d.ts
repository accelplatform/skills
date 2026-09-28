/**
 * パラメータオブジェクト。
 *
 * パラメータを格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/Parameter/index.html
 */
interface Parameter {
  /** ラベル */
  label?: string;
  /** タイプ */
  type?: string;
  /** 変数名 */
  variableName?: string;
}
