/**
 * システム有効日付取得 API。
 *
 * システムの最大日付・最小日付を取得する API です。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemValidDate/index.html
 */
declare class SystemValidDate {
  /**
   * 内部に保持している設定のクリアを行います。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;

  /**
   * システム最大日付を取得します。
   * system-valid-date-config.xml で定義された値を返却します。
   *
   * @return data にシステム最大日付を格納した ResultObject
   */
  static getMaxDate(): ResultObject<Date>;

  /**
   * システム最小日付を取得します。
   * system-valid-date-config.xml で定義された値を返却します。
   *
   * @return data にシステム最小日付を格納した ResultObject
   */
  static getMinDate(): ResultObject<Date>;
}
