/**
 * メールテンプレート情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TemplateInfo/index.html
 */
interface TemplateInfo {
  /** 送信元アドレス情報 */
  from: TemplateAddressInfo;
  /** 宛先（To）アドレス情報の配列 */
  to: TemplateAddressInfo[];
  /** Cc アドレス情報の配列 */
  cc: TemplateAddressInfo[];
  /** Bcc アドレス情報の配列 */
  bcc: TemplateAddressInfo[];
  /** 返信先アドレス情報の配列 */
  replyTo: TemplateAddressInfo[];
  /** 件名 */
  subject: string;
  /** メール本文情報 */
  body: TemplateBodyInfo;
  /** ヘッダ情報の配列 */
  headers: TemplateHeaderInfo[];
}
