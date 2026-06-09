/**
 * システム管理者情報オブジェクト。
 *
 * システム管理者に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/Administrator/index.html
 */
interface Administrator {
  /** ユーザコード */
  userCd: string;
  /** パスワード */
  password: string;
  /** メールアドレス */
  emailAddress: string;
  /** 電話番号 */
  telephoneNumber: string;
  /** ロケールID */
  locale: string;
  /** タイムゾーンID */
  timeZoneId: string;
  /** 文字エンコーディング */
  encoding: string;
}
