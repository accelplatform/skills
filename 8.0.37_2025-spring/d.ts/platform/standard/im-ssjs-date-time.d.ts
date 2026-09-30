/**
 * タイムゾーンを考慮した日時クラス。
 *
 * 0001/01/01〜9999/12/31 の日時を扱います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DateTime/index.html
 */
declare class DateTime {
  /** 1月を表す定数 (0) */
  static readonly JANUARY: 0;
  /** 2月を表す定数 (1) */
  static readonly FEBRUARY: 1;
  /** 3月を表す定数 (2) */
  static readonly MARCH: 2;
  /** 4月を表す定数 (3) */
  static readonly APRIL: 3;
  /** 5月を表す定数 (4) */
  static readonly MAY: 4;
  /** 6月を表す定数 (5) */
  static readonly JUNE: 5;
  /** 7月を表す定数 (6) */
  static readonly JULY: 6;
  /** 8月を表す定数 (7) */
  static readonly AUGUST: 7;
  /** 9月を表す定数 (8) */
  static readonly SEPTEMBER: 8;
  /** 10月を表す定数 (9) */
  static readonly OCTOBER: 9;
  /** 11月を表す定数 (10) */
  static readonly NOVEMBER: 10;
  /** 12月を表す定数 (11) */
  static readonly DECEMBER: 11;

  /** 日曜日を表す定数 (1) */
  static readonly SUNDAY: 1;
  /** 月曜日を表す定数 (2) */
  static readonly MONDAY: 2;
  /** 火曜日を表す定数 (3) */
  static readonly TUESDAY: 3;
  /** 水曜日を表す定数 (4) */
  static readonly WEDNESDAY: 4;
  /** 木曜日を表す定数 (5) */
  static readonly THURSDAY: 5;
  /** 金曜日を表す定数 (6) */
  static readonly FRIDAY: 6;
  /** 土曜日を表す定数 (7) */
  static readonly SATURDAY: 7;

  /**
   * 現在日時で、DateTime クラスのインスタンスを生成します。
   *
   * @param zone タイムゾーン
   */
  constructor(zone?: TimeZone);

  /**
   * Date オブジェクトから、DateTime クラスのインスタンスを生成します。
   *
   * @param date Date オブジェクト
   * @param zone タイムゾーン
   */
  constructor(date: Date, zone?: TimeZone);

  /**
   * 年月日を指定して、DateTime クラスのインスタンスを生成します。
   *
   * @param year 年
   * @param monthOfYear 月（0〜11）
   * @param dayOfMonth 日
   * @param zone タイムゾーン
   */
  constructor(year: number, monthOfYear: number, dayOfMonth: number, zone?: TimeZone);

  /**
   * 年月日時を指定して、DateTime クラスのインスタンスを生成します。
   *
   * @param year 年
   * @param monthOfYear 月（0〜11）
   * @param dayOfMonth 日
   * @param hourOfDay 時（0〜23）
   * @param zone タイムゾーン
   */
  constructor(year: number, monthOfYear: number, dayOfMonth: number, hourOfDay: number, zone?: TimeZone);

  /**
   * 年月日時分を指定して、DateTime クラスのインスタンスを生成します。
   *
   * @param year 年
   * @param monthOfYear 月（0〜11）
   * @param dayOfMonth 日
   * @param hourOfDay 時（0〜23）
   * @param minuteOfHour 分
   * @param zone タイムゾーン
   */
  constructor(year: number, monthOfYear: number, dayOfMonth: number, hourOfDay: number, minuteOfHour: number, zone?: TimeZone);

  /**
   * 年月日時分秒を指定して、DateTime クラスのインスタンスを生成します。
   *
   * @param year 年
   * @param monthOfYear 月（0〜11）
   * @param dayOfMonth 日
   * @param hourOfDay 時（0〜23）
   * @param minuteOfHour 分
   * @param secondOfMinute 秒
   * @param zone タイムゾーン
   */
  constructor(year: number, monthOfYear: number, dayOfMonth: number, hourOfDay: number, minuteOfHour: number, secondOfMinute: number, zone?: TimeZone);

  /**
   * 年月日時分秒と週の開始曜日を指定して、DateTime クラスのインスタンスを生成します。
   *
   * @param year 年
   * @param monthOfYear 月（0〜11）
   * @param dayOfMonth 日
   * @param hourOfDay 時（0〜23）
   * @param minuteOfHour 分
   * @param secondOfMinute 秒
   * @param firstDayOfWeek 週の開始曜日
   * @param zone タイムゾーン
   */
  constructor(year: number, monthOfYear: number, dayOfMonth: number, hourOfDay: number, minuteOfHour: number, secondOfMinute: number, firstDayOfWeek: number, zone?: TimeZone);

  /** 年 */
  readonly year: number;
  /** 月（0〜11） */
  readonly monthOfYear: number;
  /** 日 */
  readonly dayOfMonth: number;
  /** 時（0〜23） */
  readonly hourOfDay: number;
  /** 分 */
  readonly minuteOfHour: number;
  /** 秒 */
  readonly secondOfMinute: number;
  /** 曜日 */
  readonly dayOfWeek: number;
  /** 週の開始曜日 */
  readonly firstDayOfWeek: number;
  /** 月の最終日 */
  readonly lastDayOfMonth: number;
  /** タイムゾーンID */
  readonly timeZoneId: string;

  /**
   * このオブジェクトの独立したコピーを作成します。
   *
   * @return data に複製された DateTime を格納した ResultObject
   */
  clone(): ResultObject<DateTime>;

  /**
   * Date オブジェクトを取得します。
   *
   * @return data に Date オブジェクトを格納した ResultObject
   */
  getDate(): ResultObject<Date>;

  /**
   * エポックからのミリ秒を取得します。
   *
   * @return data にミリ秒を格納した ResultObject
   */
  getTime(): ResultObject<number>;

  /**
   * タイムゾーンオブジェクトを取得します。
   *
   * @return data に TimeZone オブジェクトを格納した ResultObject
   */
  getTimeZone(): ResultObject<TimeZone>;

  /**
   * タイムゾーンオフセット（ミリ秒）を取得します。
   *
   * @return data にオフセット（ミリ秒）を格納した ResultObject
   */
  getTimeZoneOffset(): ResultObject<number>;

  /**
   * 日を減算した新しい DateTime を返します。
   *
   * @param days 減算する日数
   * @return data に処理結果を格納した ResultObject
   */
  minusDays(days: number): ResultObject<DateTime>;

  /**
   * 時間を減算した新しい DateTime を返します。
   *
   * @param hours 減算する時間数
   * @return data に処理結果を格納した ResultObject
   */
  minusHours(hours: number): ResultObject<DateTime>;

  /**
   * 分を減算した新しい DateTime を返します。
   *
   * @param minutes 減算する分数
   * @return data に処理結果を格納した ResultObject
   */
  minusMinutes(minutes: number): ResultObject<DateTime>;

  /**
   * 月を減算した新しい DateTime を返します。
   *
   * @param months 減算する月数
   * @return data に処理結果を格納した ResultObject
   */
  minusMonths(months: number): ResultObject<DateTime>;

  /**
   * 秒を減算した新しい DateTime を返します。
   *
   * @param seconds 減算する秒数
   * @return data に処理結果を格納した ResultObject
   */
  minusSeconds(seconds: number): ResultObject<DateTime>;

  /**
   * 年を減算した新しい DateTime を返します。
   *
   * @param years 減算する年数
   * @return data に処理結果を格納した ResultObject
   */
  minusYears(years: number): ResultObject<DateTime>;

  /**
   * 日を加算した新しい DateTime を返します。
   *
   * @param days 加算する日数
   * @return data に処理結果を格納した ResultObject
   */
  plusDays(days: number): ResultObject<DateTime>;

  /**
   * 時間を加算した新しい DateTime を返します。
   *
   * @param hours 加算する時間数
   * @return data に処理結果を格納した ResultObject
   */
  plusHours(hours: number): ResultObject<DateTime>;

  /**
   * 分を加算した新しい DateTime を返します。
   *
   * @param minutes 加算する分数
   * @return data に処理結果を格納した ResultObject
   */
  plusMinutes(minutes: number): ResultObject<DateTime>;

  /**
   * 月を加算した新しい DateTime を返します。
   *
   * @param months 加算する月数
   * @return data に処理結果を格納した ResultObject
   */
  plusMonths(months: number): ResultObject<DateTime>;

  /**
   * 秒を加算した新しい DateTime を返します。
   *
   * @param seconds 加算する秒数
   * @return data に処理結果を格納した ResultObject
   */
  plusSeconds(seconds: number): ResultObject<DateTime>;

  /**
   * 年を加算した新しい DateTime を返します。
   *
   * @param years 加算する年数
   * @return data に処理結果を格納した ResultObject
   */
  plusYears(years: number): ResultObject<DateTime>;

  /**
   * 文字列表現を返します。
   *
   * @return 'E MMM dd yyyy HH:mm:ss GMT##### (z)' 形式の文字列
   */
  toString(): string;

  /**
   * 日を変更した新しい DateTime を返します。
   *
   * @param dayOfMonth 日
   * @return data に処理結果を格納した ResultObject
   */
  withDayOfMonth(dayOfMonth: number): ResultObject<DateTime>;

  /**
   * 時を変更した新しい DateTime を返します。
   *
   * @param hourOfDay 時（0〜23）
   * @return data に処理結果を格納した ResultObject
   */
  withHourOfDay(hourOfDay: number): ResultObject<DateTime>;

  /**
   * ミリ秒を変更した新しい DateTime を返します。
   *
   * @param milliOfSecond ミリ秒
   * @return data に処理結果を格納した ResultObject
   */
  withMilliOfSecond(milliOfSecond: number): ResultObject<DateTime>;

  /**
   * 分を変更した新しい DateTime を返します。
   *
   * @param minuteOfHour 分
   * @return data に処理結果を格納した ResultObject
   */
  withMinuteOfHour(minuteOfHour: number): ResultObject<DateTime>;

  /**
   * 月を変更した新しい DateTime を返します。
   *
   * @param monthOfYear 月（0〜11）
   * @return data に処理結果を格納した ResultObject
   */
  withMonthOfYear(monthOfYear: number): ResultObject<DateTime>;

  /**
   * 秒を変更した新しい DateTime を返します。
   *
   * @param secondOfMinute 秒
   * @return data に処理結果を格納した ResultObject
   */
  withSecondOfMinute(secondOfMinute: number): ResultObject<DateTime>;

  /**
   * タイムゾーンを変更した新しい DateTime を返します。
   * エポックミリ秒は変更されず、タイムゾーンのみ変換されるため、日時の表現は変化します。
   *
   * @param timezone タイムゾーン
   * @return data に処理結果を格納した ResultObject
   */
  withTimeZone(timezone: TimeZone): ResultObject<DateTime>;

  /**
   * 年を変更した新しい DateTime を返します。
   *
   * @param year 年
   * @return data に処理結果を格納した ResultObject
   */
  withYear(year: number): ResultObject<DateTime>;
}
