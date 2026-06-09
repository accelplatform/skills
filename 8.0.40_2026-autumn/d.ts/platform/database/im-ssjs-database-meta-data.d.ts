/**
 * JavaScript 版 DatabaseMetaData クラス。
 *
 * JDBC を通じてデータベースおよびドライバのメタ情報を取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatabaseMetaData/index.html
 */
declare class DatabaseMetaData {
  /**
   * データベースのメジャーバージョン番号を取得します。
   *
   * @return メジャーバージョン番号
   */
  getDatabaseMajorVersion(): number;

  /**
   * データベースのマイナーバージョン番号を取得します。
   *
   * @return マイナーバージョン番号
   */
  getDatabaseMinorVersion(): number;

  /**
   * データベースの製品名を取得します。
   *
   * @return 製品名
   */
  getDatabaseProductName(): string;

  /**
   * データベースの製品バージョンを取得します。
   *
   * @return 製品バージョン
   */
  getDatabaseProductVersion(): string;

  /**
   * ドライバのメジャーバージョン番号を取得します。
   *
   * @return メジャーバージョン番号
   */
  getDriverMajorVersion(): number;

  /**
   * ドライバのマイナーバージョン番号を取得します。
   *
   * @return マイナーバージョン番号
   */
  getDriverMinorVersion(): number;

  /**
   * ドライバ名を取得します。
   *
   * @return ドライバ名
   */
  getDriverName(): string;

  /**
   * ドライバのバージョンを取得します。
   *
   * @return ドライババージョン
   */
  getDriverVersion(): string;

  /**
   * データベースでワイルドカードをエスケープする文字を取得します。
   *
   * @return エスケープ文字
   */
  getSearchStringEscape(): string;
}
