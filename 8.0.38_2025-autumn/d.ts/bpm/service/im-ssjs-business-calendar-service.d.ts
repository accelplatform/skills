/**
 * ビジネスカレンダーサービス。
 *
 * ビジネスカレンダー設定関連処理を行うクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.BusinessCalendarService/index.html
 */
declare namespace bpm {
  class BusinessCalendarService {
    /**
     * 指定された日数を加算します。
     *
     * @param target 対象日付
     * @param timeZoneId タイムゾーンID
     * @param days 加算日数
     * @return 加算後の日付
     */
    addDays(target: Date, timeZoneId: string, days: number): Date;

    /**
     * 期間内の日数を返却します。from と to が同日の場合、1 を返却します。
     *
     * @param from 開始日
     * @param to 終了日
     * @param timeZoneId タイムゾーンID
     * @return 日数
     */
    countDays(from: Date, to: Date, timeZoneId: string): number;

    /**
     * 期間内の休日日数を返却します。
     *
     * @param from 開始日
     * @param to 終了日
     * @param timeZoneId タイムゾーンID
     * @param calendarId カレンダーID
     * @return 休日日数
     */
    // TODO: 単語の区切りの誤りについては、後方互換のために修正していません
    countHoliDays(from: Date, to: Date, timeZoneId: string, calendarId: string): number;

    /**
     * 指定されたタイムゾーンにおける時刻を設定します。
     *
     * @param target 対象日付
     * @param hh 時
     * @param timeZoneId タイムゾーンID
     * @return 時刻設定後の日付
     */
    editClock(target: Date, hh: number, timeZoneId: string): Date;

    /**
     * 指定されたタイムゾーンにおける時刻（時分）を設定します。
     * 秒、ミリ秒には 0 が設定されます。
     *
     * @param target 対象日付
     * @param hh 時
     * @param mm 分
     * @param timeZoneId タイムゾーンID
     * @return 時刻設定後の日付
     */
    editClock(target: Date, hh: number, mm: number, timeZoneId: string): Date;

    /**
     * 指定されたタイムゾーンにおける時刻（時分秒）を設定します。
     * ミリ秒には 0 が設定されます。
     *
     * @param target 対象日付
     * @param hh 時
     * @param mm 分
     * @param ss 秒
     * @param timeZoneId タイムゾーンID
     * @return 時刻設定後の日付
     */
    editClock(target: Date, hh: number, mm: number, ss: number, timeZoneId: string): Date;

    /**
     * 指定されたタイムゾーンにおける時刻（時分秒ミリ秒）を設定します。
     *
     * @param target 対象日付
     * @param hh 時
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZoneId タイムゾーンID
     * @return 時刻設定後の日付
     */
    editClock(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZoneId: string): Date;

    /**
     * 指定されたタイムゾーンにおける時刻（時分秒ミリ秒）を設定します。
     *
     * @param target 対象日付
     * @param hh 時
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZone TimeZone オブジェクト
     * @return 時刻設定後の日付
     */
    editClock(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZone: TimeZone): Date;

    /**
     * 期間（from - to）から期間内の休日の日数分 to に営業日（休日は含まず）を加算した日付を返却します。
     *
     * @param from 開始日
     * @param to 終了日
     * @param timeZoneId タイムゾーンID
     * @param calendarId カレンダーID
     * @return 休日を除外した日付
     */
    // TODO: 単語の区切りの誤りについては、後方互換のために修正していません
    excludeHoliDays(from: Date, to: Date, timeZoneId: string, calendarId: string): Date;

    /**
     * 指定されたタイムゾーンにおける時刻なし（0:00:00.000）の日付型を返却します。
     *
     * @param target 対象日付
     * @param timeZoneId タイムゾーンID
     * @return 時刻なしの日付
     */
    getDateWithoutTime(target: Date, timeZoneId: string): Date;

    /**
     * 対象日付の次の営業日を返却します。
     *
     * @param date 対象日付
     * @param timeZoneId タイムゾーンID
     * @param calendarId カレンダーID
     * @return 次の営業日
     */
    getNextBusinessDay(date: Date, timeZoneId: string, calendarId: string): Date;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より後の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より後の場合 true
     */
    isAfter(target: Date, hh: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より後の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より後の場合 true
     */
    isAfter(target: Date, hh: number, mm: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より後の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より後の場合 true
     */
    isAfter(target: Date, hh: number, mm: number, ss: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より後の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より後の場合 true
     */
    isAfter(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より後の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZone TimeZone オブジェクト
     * @return 指定時刻より後の場合 true
     */
    isAfter(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZone: TimeZone): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より前の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より前の場合 true
     */
    isBefore(target: Date, hh: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より前の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より前の場合 true
     */
    isBefore(target: Date, hh: number, mm: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より前の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より前の場合 true
     */
    isBefore(target: Date, hh: number, mm: number, ss: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より前の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZoneId タイムゾーンID
     * @return 指定時刻より前の場合 true
     */
    isBefore(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZoneId: string): boolean;

    /**
     * 指定されたタイムゾーンにおいての対象日付の時刻が指定の時刻より前の場合、true を返します。
     *
     * @param target 比較対象の日付
     * @param hh 時（24時間表記）
     * @param mm 分
     * @param ss 秒
     * @param milliSec ミリ秒
     * @param timeZone TimeZone オブジェクト
     * @return 指定時刻より前の場合 true
     */
    isBefore(target: Date, hh: number, mm: number, ss: number, milliSec: number, timeZone: TimeZone): boolean;

    /**
     * 休日判定を行います。
     *
     * @param target 判定対象日付
     * @param timeZoneId タイムゾーンID
     * @param calendarId カレンダーID
     * @return 休日の場合 true
     */
    // TODO: 単語の区切りの誤りについては、後方互換のために修正していません
    isHoliDay(target: Date, timeZoneId: string, calendarId: string): boolean;

    /**
     * 休日判定を行います。
     *
     * @param target 判定対象日付
     * @param timeZone TimeZone オブジェクト
     * @param calendarId カレンダーID
     * @return 休日の場合 true
     */
    // TODO: 単語の区切りの誤りについては、後方互換のために修正していません
    isHoliDay(target: Date, timeZone: TimeZone, calendarId: string): boolean;
  }
}
