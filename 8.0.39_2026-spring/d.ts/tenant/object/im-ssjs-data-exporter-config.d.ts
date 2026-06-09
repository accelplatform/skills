/**
 * データエクスポーター設定オブジェクト。
 *
 * データエクスポーターの設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DataExporterConfig/index.html
 */
interface DataExporterConfig {
  /** クラス名 */
  className: string;
  /** エクスポーターID */
  id: string;
  /** エクスポーター名 */
  name: string;
  /** オプション設定の配列 */
  options: Option[];
}
