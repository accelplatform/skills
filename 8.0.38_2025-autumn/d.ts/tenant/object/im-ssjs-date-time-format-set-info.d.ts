/**
 * 日時フォーマットセット情報オブジェクト。
 *
 * 日付フォーマットと時刻フォーマットのセットを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DateTimeFormatSetInfo/index.html
 */
interface DateTimeFormatSetInfo {
  /** 日付フォーマット情報の配列 */
  readonly dateFormats: DateTimeFormatInfo[];
  /** 表示名 */
  readonly displayName: string;
  /** フォーマットセットID */
  readonly formatSetId: string;
  /** ロケールID */
  readonly locale: string;
  /** 時刻フォーマット情報の配列 */
  readonly timeFormats: DateTimeFormatInfo[];
}
