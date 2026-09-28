/**
 * データインポーター設定オブジェクト。
 *
 * データインポーターの設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DataImporterConfig/index.html
 */
interface DataImporterConfig {
  /** クラス名 */
  className: string;
  /** インポーターID */
  id: string;
  /** インポーター名 */
  name: string;
  /** オプション設定の配列 */
  options: Option[];
}
