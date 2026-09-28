/**
 * アカウント情報オブジェクト。
 *
 * ユーザアカウントに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AccountInfo/index.html
 */
interface AccountInfo {
  /** ユーザコード */
  userCd: string;
  /** パスワード */
  password: string;
  /** ロケールID */
  locale: string;
  /** タイムゾーンID */
  timeZoneId: string;
  /** 文字エンコーディング */
  encoding: string;
  /** カレンダーID */
  calendarId: string;
  /** 週の開始曜日（0=日曜〜6=土曜） */
  firstDayOfWeek: number;
  /** 日時表示フォーマットコレクション */
  dateTimeFormats: DateTimeFormats;
  /** テーマID のマップ */
  themeIds: AccountInfo.ThemeIdMap;
  /** 有効開始日 */
  validStartDate: Date;
  /** 有効終了日 */
  validEndDate: Date;
  /** ロック日時。ロックされていない場合 null */
  lockDate: Date | null;
  /** ログイン失敗回数 */
  loginFailureCount: number;
}

declare namespace AccountInfo {
  type ThemeIdMap = { [clientTypeId: string]: string };
}
