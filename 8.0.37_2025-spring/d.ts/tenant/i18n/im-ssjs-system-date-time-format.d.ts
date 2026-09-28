/**
 * システム日時フォーマット API。
 *
 * システムで利用可能な日時用フォーマットを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemDateTimeFormat/index.html
 */
declare class SystemDateTimeFormat {
  /**
   * 内部に保持している日時用フォーマットのキャッシュをクリアします。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;

  /**
   * システムデフォルトのフォーマットセットを取得します。
   *
   * @return data にデフォルトフォーマットセット情報を格納した ResultObject
   */
  static getDefaultFormatSet(): ResultObject<DateTimeFormatSetInfo>;

  /**
   * システムデフォルトのフォーマットセットからデフォルトのフォーマットパターンのみを抽出します。
   *
   * @return フォーマットパターンオブジェクト
   */
  static getDefaultFormats(): DateTimeFormats;

  /**
   * 指定されたフォーマットセットを取得します。
   * 存在しない場合はデフォルトを返します。
   *
   * @param formatSetId フォーマットセットID
   * @return data にフォーマットセット情報を格納した ResultObject
   */
  static getFormatSet(formatSetId: string): ResultObject<DateTimeFormatSetInfo>;

  /**
   * フォーマットセットをすべて取得します。
   *
   * @return data にフォーマットセット情報の配列を格納した ResultObject
   */
  static getFormatSets(): ResultObject<DateTimeFormatSetInfo[]>;

  /**
   * 指定されたフォーマットセットからデフォルトのフォーマットパターンのみを抽出します。
   *
   * @param formatSetId フォーマットセットID
   * @return フォーマットパターンオブジェクト
   */
  static getFormats(formatSetId: string): DateTimeFormats;

  /**
   * 指定されたフォーマットセットID がシステムで利用可能かを判定します。
   *
   * @param id フォーマットセットID
   * @return data に利用可否を格納した ResultObject（true: 利用可能）
   */
  static isAvailableFormatSet(id: string): ResultObject<boolean>;
}
