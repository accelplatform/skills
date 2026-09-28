/**
 * システム数値フォーマット API。
 *
 * システムで利用可能な数値用フォーマットを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemDecimalFormat/index.html
 */
declare class SystemDecimalFormat {
  /**
   * システムデフォルトのフォーマットを取得します。
   *
   * @return data にデフォルトフォーマット情報を格納した ResultObject
   */
  static getDefaultFormat(): ResultObject<DecimalFormatInfo>;

  /**
   * 指定されたフォーマットID に対応するフォーマットを取得します。
   *
   * @param id フォーマットID
   * @return data にフォーマット情報（存在しない場合 null）を格納した ResultObject
   */
  static getFormat(id: string): ResultObject<DecimalFormatInfo | null>;

  /**
   * フォーマットをすべて取得します。
   *
   * @return data にフォーマット情報の配列を格納した ResultObject
   */
  static getFormats(): ResultObject<DecimalFormatInfo[]>;

  /**
   * 指定されたフォーマットID がシステムで利用可能かを判定します。
   *
   * @param id フォーマットID
   * @return data に利用可否を格納した ResultObject（true: 利用可能）
   */
  static isAvailableFormat(id: string): ResultObject<boolean>;
}
