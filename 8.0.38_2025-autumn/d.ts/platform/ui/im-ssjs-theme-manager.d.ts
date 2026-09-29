/**
 * テーママネージャ。
 *
 * クライアントタイプに紐づくテーマ情報の取得機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ThemeManager/index.html
 */
declare class ThemeManager {
  /**
   * テーママネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 指定されたクライアントタイプID に紐づくテーマの情報をすべて取得します。
   *
   * @param clientTypeId クライアントタイプID
   * @return テーマ情報の配列
   */
  getAllTheme(clientTypeId: string): ThemeManager.ThemeInfo[];

  /**
   * 指定されたクライアントタイプID のデフォルトのテーマを返します。
   *
   * @param clientTypeId クライアントタイプID
   * @return テーマ情報オブジェクト
   */
  getDefaultTheme(clientTypeId: string): ThemeManager.ThemeInfo;

  /**
   * ホーム URL に指定された URL をエンコードした文字列表現を返します。
   *
   * @return エンコード済み URL 文字列
   */
  getEncodedHomeUrl(): string;

  /**
   * ライブラリ読み込み用の JSSP パスを返します。
   * 該当するライブラリが存在しない場合は空文字列を返します。
   *
   * @return JSSP パス文字列
   */
  getLibrariesPath(): string;

  /**
   * 指定されたテーマID に対するテーマを返します。
   *
   * @param themeId テーマID
   * @return テーマ情報オブジェクト
   */
  getTheme(themeId: string): ThemeManager.ThemeInfo;
}

declare namespace ThemeManager {
  interface ThemeInfo {
    readonly author: string;
    readonly id: string;
    readonly image: string;
    readonly folder: string;
    readonly version: string;
    readonly name: string;
    readonly description: string;
    readonly clientTypes: {
      readonly id: string;
      readonly default: boolean;
    }[];
  }
}
