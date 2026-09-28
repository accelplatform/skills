/**
 * 数値フォーマット情報オブジェクト。
 *
 * 数値フォーマットに関する設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DecimalFormatInfo/index.html
 */
interface DecimalFormatInfo {
  /** フォーマットID */
  readonly id: string;
  /** フォーマッタクラス名 */
  readonly clazz: string;
  /** クライアントサイド JavaScript パス */
  readonly 'csjs-path': string;
  /** パラメータ */
  readonly parameter: string;
}
