/**
 * セーフ URL オブジェクト。
 *
 * セーフ URL リストの各エントリ情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SafeUrl/index.html
 */
interface SafeUrl {
  /** セーフ URLID */
  readonly id: string;
  /** 正規表現かどうか */
  readonly isRegex: boolean;
  /** URL 文字列 */
  readonly url: string;
}
