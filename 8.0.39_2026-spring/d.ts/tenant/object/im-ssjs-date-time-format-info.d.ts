/**
 * 日時フォーマット情報オブジェクト。
 *
 * 日時フォーマットに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DateTimeFormatInfo/index.html
 */
interface DateTimeFormatInfo {
  /** デフォルトパターン */
  readonly defaultPattern: string;
  /** 表示名 */
  readonly displayName: string;
  /** フォーマットID */
  readonly formatId: string;
  /** パターン一覧 */
  readonly patterns: string[];
}
