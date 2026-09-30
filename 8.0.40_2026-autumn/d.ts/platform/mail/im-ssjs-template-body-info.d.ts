/**
 * メールテンプレートのメール本文情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TemplateBodyInfo/index.html
 */
interface TemplateBodyInfo {
  /** コンテンツタイプ（例: 'text/plain', 'text/html'） */
  contentType: string;
  /** メール本文テキスト */
  text: string;
}
