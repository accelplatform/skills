/**
 * メールテンプレートのアドレス情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TemplateAddressInfo/index.html
 */
interface TemplateAddressInfo {
  /** メールアドレス */
  address: string;
  /** 名前 */
  personal: string;
}
