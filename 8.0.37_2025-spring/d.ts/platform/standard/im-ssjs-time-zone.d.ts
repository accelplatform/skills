/**
 * タイムゾーン情報を扱うクラス。
 *
 * インスタンスは TimeZone.getTimeZone() で取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TimeZone/index.html
 */
declare class TimeZone {
  /** タイムゾーンID */
  readonly id: string;
  /** UTC からのオフセット（ミリ秒） */
  readonly rawOffset: number;
  /** 夏時間が適用される場合 true */
  readonly useDaylightTime: boolean;

  /**
   * 指定されたID のタイムゾーンを取得します。
   * 認識できないID の場合は GMT を返します。
   *
   * @param id タイムゾーンID
   * @return data に TimeZone を含む ResultObject
   */
  /**
   * 指定された日付における UTC オフセットを取得します。
   *
   * @param date 日付
   * @return オフセット（ミリ秒）
   */
  getOffset(date: Date): number;

  static getTimeZone(id: string): ResultObject<TimeZone>;

  /**
   * 指定された日付が夏時間かどうかを判定します。
   *
   * @param date 日付
   * @return 夏時間の場合 true
   */
  inDaylightTime(date: Date): boolean;
}
