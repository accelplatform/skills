/**
 * メールテンプレートのヘッダ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TemplateHeaderInfo/index.html
 */
interface TemplateHeaderInfo {
  /** ヘッダ名 */
  name: string;
  /** ヘッダ値 */
  value: string;
}
