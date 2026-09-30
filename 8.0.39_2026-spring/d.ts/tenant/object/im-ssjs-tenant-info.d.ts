/**
 * テナント情報オブジェクト。
 *
 * テナントに関する詳細情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/TenantInfo/index.html
 */
interface TenantInfo {
  /** テナント属性のマップ */
  attributes: { [key: string]: string };
  /** カレンダーID */
  calendarId: string;
  /** 日時表示フォーマットコレクション */
  dateTimeFormats: DateTimeFormats;
  /** デフォルトテナントかどうか */
  defaultTenant: boolean;
  /** メールアドレス */
  emailAddress: string;
  /** 文字エンコーディング */
  encoding: string;
  /** 週の開始曜日（0=日曜〜6=土曜） */
  firstDayOfWeek: number;
  /** ホームページ URL */
  homeUrl: string;
  /** ロケールID */
  locale: string;
  /** アカウントロックまでの失敗回数 */
  lockCount: number;
  /** アカウントロック期間（分） */
  lockTerm: number;
  /** テナントID */
  tenantId: string;
  /** テーマID のマップ */
  themeIds: { [clientTypeId: string]: string };
  /** タイムゾーンID */
  timeZoneId: string;
}
