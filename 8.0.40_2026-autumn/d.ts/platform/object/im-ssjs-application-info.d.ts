/**
 * アプリケーション情報オブジェクト。
 *
 * インストール済みアプリケーションのライセンス情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 */
interface ApplicationInfo {
  /** 有効期限切れかどうか（トライアルライセンス） */
  readonly expired: boolean;
  /** 有効期限日時（ミリ秒）。トライアルライセンスの場合のみ有効 */
  readonly expiredDate: number;
  /** フリーライセンスかどうか */
  readonly free: boolean;
  /** インストール日時（ミリ秒） */
  readonly installDate: number;
  /** ライセンスキーの配列 */
  readonly licenseKeys: string[];
  /** 期間限定ライセンスかどうか */
  readonly limited: boolean;
  /** 期間限定ライセンスの有効期限日時（ミリ秒） */
  readonly limitedDate: number;
  /** 最大ユーザ数 */
  readonly maxAccount: number;
  /** 最大サーバ数 */
  readonly maxProcess: number;
  /** アプリケーション名 */
  readonly name: string;
  /** パッケージバージョン */
  readonly packageVersion: string;
  /** シリアル番号の配列 */
  readonly serialNumbers: string[];
  /** 対象ロケールID の配列 */
  readonly targetLocales: string[];
  /** トライアルライセンスかどうか */
  readonly trial: boolean;
  /** アプリケーション種別 */
  readonly type: string;
  /** バージョン */
  readonly version: string;

  /**
   * 指定キーのプロパティ値を取得します。
   *
   * @param key プロパティキー
   * @return プロパティ値
   */
  getProperty(key: string): string;

  /**
   * 指定キーのプロパティ値を配列で取得します。
   *
   * @param key プロパティキー
   * @return プロパティ値の配列
   */
  getProperties(key: string): string[];
}
