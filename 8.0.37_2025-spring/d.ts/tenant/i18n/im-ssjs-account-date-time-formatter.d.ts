/**
 * アカウント日時フォーマッタクラス。
 *
 * ログインユーザが設定しているフォーマットパターンを利用して、日付/時刻文字列の整形および解析を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AccountDateTimeFormatter/index.html
 */
declare class AccountDateTimeFormatter {
  /** 日付入力用フォーマット（'IM_DATETIME_FORMAT_DATE_INPUT'） */
  static readonly IM_DATETIME_FORMAT_DATE_INPUT: 'IM_DATETIME_FORMAT_DATE_INPUT';
  /** 日付簡易表示用フォーマット（'IM_DATETIME_FORMAT_DATE_SIMPLE'） */
  static readonly IM_DATETIME_FORMAT_DATE_SIMPLE: 'IM_DATETIME_FORMAT_DATE_SIMPLE';
  /** 日付標準表示用フォーマット（'IM_DATETIME_FORMAT_DATE_STANDARD'） */
  static readonly IM_DATETIME_FORMAT_DATE_STANDARD: 'IM_DATETIME_FORMAT_DATE_STANDARD';
  /** 時刻入力用フォーマット（'IM_DATETIME_FORMAT_TIME_INPUT'） */
  static readonly IM_DATETIME_FORMAT_TIME_INPUT: 'IM_DATETIME_FORMAT_TIME_INPUT';
  /** 時刻標準表示用フォーマット（'IM_DATETIME_FORMAT_TIME_STANDARD'） */
  static readonly IM_DATETIME_FORMAT_TIME_STANDARD: 'IM_DATETIME_FORMAT_TIME_STANDARD';
  /** タイムスタンプ用フォーマット（'IM_DATETIME_FORMAT_TIME_TIMESTAMP'） */
  static readonly IM_DATETIME_FORMAT_TIME_TIMESTAMP: 'IM_DATETIME_FORMAT_TIME_TIMESTAMP';

  /**
   * Date を日付/時刻文字列に整形します。
   *
   * @param date 整形対象の Date
   * @param formatId フォーマットID
   * @return 整形された日付/時刻文字列
   */
  static format(date: Date, ...formatId: string[]): string;

  /**
   * DateTime を日付/時刻文字列に整形します。
   *
   * @param dateTime 整形対象の DateTime
   * @param formatId フォーマットID
   * @return 整形された日付/時刻文字列
   */
  static format(dateTime: DateTime, ...formatId: string[]): string;

  /**
   * ログインユーザのフォーマットパターンを取得します。
   *
   * @param formatId フォーマットID
   * @return フォーマットパターン文字列
   */
  static getPattern(...formatId: string[]): string;

  /**
   * 文字列を解析して Date を生成します。
   *
   * @param text 解析対象の日付/時刻文字列
   * @param formatId フォーマットID
   * @return 解析された Date
   */
  static parseToDate(text: string, ...formatId: string[]): Date;

  /**
   * 文字列を解析して DateTime を生成します。
   *
   * @param text 解析対象の日付/時刻文字列
   * @param formatId フォーマットID
   * @return 解析された DateTime
   */
  static parseToDateTime(text: string, ...formatId: string[]): DateTime;

  /**
   * 2 時点間の期間を日数に変換します。
   *
   * @param from 開始日時
   * @param to 終了日時
   * @return 日数
   */
  static getDiffDays(from: Date | DateTime, to: Date | DateTime): number;

  /**
   * 2 時点間の期間を時間数に変換します。
   *
   * @param from 開始日時
   * @param to 終了日時
   * @return 時間数
   */
  static getDiffHours(from: Date | DateTime, to: Date | DateTime): number;

  /**
   * 2 時点間の期間を分数に変換します。
   *
   * @param from 開始日時
   * @param to 終了日時
   * @return 分数
   */
  static getDiffMinutes(from: Date | DateTime, to: Date | DateTime): number;

  /**
   * 2 時点間の期間を秒数に変換します。
   *
   * @param from 開始日時
   * @param to 終了日時
   * @return 秒数
   */
  static getDiffSeconds(from: Date | DateTime, to: Date | DateTime): number;
}
