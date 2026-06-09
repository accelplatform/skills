/**
 * ドライバ設定情報オブジェクト。
 *
 * JDBC ドライバの接続設定を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JDBCDriverInfo/index.html
 */
interface JDBCDriverInfo {
  /** データベース接続パスワード */
  password: string;
  /** ドライバタイプ／クラス識別子 */
  type: string;
  /** データベース接続 URL */
  url: string;
  /** データベース接続ユーザ */
  user: string;
  /** JDBC ドライバ固有のプロパティ（キー: プロパティ名、値: プロパティ値） */
  [propertyName: string]: string;
}
