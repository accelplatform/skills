/**
 * 日時フォーマットオブジェクト。
 *
 * 日時表示や入力に使用されるフォーマット情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemDateTimeFormat/index.html#method-getFormats_3
 */
interface DateTimeFormats {
  /** フォーマットセットID */
  'format-set-id': string;
  /** ロケールID */
  locale: string;
  /** 日付標準フォーマット */
  IM_DATETIME_FORMAT_DATE_STANDARD: string;
  /** 日付簡易フォーマット */
  IM_DATETIME_FORMAT_DATE_SIMPLE: string;
  /** 日付入力フォーマット */
  IM_DATETIME_FORMAT_DATE_INPUT: string;
  /** 時刻標準フォーマット */
  IM_DATETIME_FORMAT_TIME_STANDARD: string;
  /** 時刻タイムスタンプフォーマット */
  IM_DATETIME_FORMAT_TIME_TIMESTAMP: string;
  /** 時刻入力フォーマット */
  IM_DATETIME_FORMAT_TIME_INPUT: string;
}
