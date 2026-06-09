/**
 * アカウントコンテキストオブジェクト。
 *
 * アカウントに関する情報を保持するアクセスコンテキストです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/AccountContext/index.html
 */
interface AccountContext {
  /** アプリケーションライセンスの一覧 */
  readonly applicationLicenses: string[];
  /** 認証済みかどうか。ログイン済みの場合 true */
  readonly authenticated: boolean;
  /** カレンダーID */
  readonly calendarId: string;
  /** 日時表示フォーマットコレクション */
  readonly dateTimeFormats: DateTimeFormats;
  /** 数値フォーマットID（8.0.15 以降） */
  readonly decimalFormatId: string;
  /** 文字エンコーディング */
  readonly encoding: string;
  /** 週の開始曜日（0=日曜〜6=土曜） */
  readonly firstDayOfWeek: number;
  /** ホームページ URL */
  readonly homeUrl: string;
  /** ロケールID */
  readonly locale: string;
  /** ログイングループID（テナントID と同値） */
  readonly loginGroupId: string;
  /** ログイン日時。未認証の場合 null */
  readonly loginTime: Date | null;
  /** ロールID の一覧（サブロールを含む） */
  readonly roleIds: string[];
  /** ログイン署名。未認証の場合 null */
  readonly signature: string | null;
  /** テナントID（8.0.7 以降） */
  readonly tenantId: string;
  /** テーマID */
  readonly themeId: string;
  /** タイムゾーン情報オブジェクト */
  readonly timeZone: TimeZone;
  /** ユーザ CD */
  readonly userCd: string;
  /** ユーザ種別 */
  readonly userType: AccountContext.UserType;
}

declare namespace AccountContext {
  type UserType = /** システム管理者 */
    | 'administrator'
    /** 一般ユーザ（テナント管理者、通常ユーザ、ゲストユーザ） */
    | 'user';
}
