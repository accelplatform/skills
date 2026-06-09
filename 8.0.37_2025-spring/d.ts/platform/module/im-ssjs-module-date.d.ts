declare namespace Module {
  /**
   * 日付操作オブジェクト。
   *
   * 日付データの加算・比較・変換機能を提供します。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.date/index.html
   */
  namespace date {
    /**
     * 日情報に指定増分を加算した日付を返却します。
     */
    function addDay(date: Date, plus: number): Date;

    /**
     * 時間情報に指定増分を加算した日付を返却します。
     */
    function addHour(date: Date, plus: number): Date;

    /**
     * 分情報に指定増分を加算した日付を返却します。
     */
    function addMinute(date: Date, plus: number): Date;

    /**
     * 月情報に指定増分を加算した日付を返却します。
     */
    function addMonth(date: Date, plus: number): Date;

    /**
     * 秒情報に指定増分を加算した日付を返却します。
     */
    function addSecond(date: Date, plus: number): Date;

    /**
     * 年情報に指定増分を加算した日付を返却します。
     */
    function addYear(date: Date, plus: number): Date;

    /**
     * 曜日を表す文字列を取得します（Sunday, Monday 等）。
     *
     * @param date 対象日付
     * @return 曜日名
     */
    function dayName(date: Date): string;

    /**
     * 指定された日付情報から日付操作クラスのインスタンスを生成します。
     *
     * @param year 年
     * @param month 月
     * @param day 日
     * @param hour 時
     * @param minute 分
     * @param second 秒
     * @return 日付操作クラスのインスタンス
     */
    function get(year: number, month: number, day: number, hour?: number, minute?: number, second?: number): Date;

    /**
     * 2 つの日付のうち未来の方を返却します。
     *
     * @param targetA 日付 A
     * @param targetB 日付 B（省略時は現在日時）
     * @return 未来の日付
     */
    function getFuture(targetA: Date, targetB?: Date): Date;

    /**
     * 2 つの日付のうち過去の方を返却します。
     *
     * @param targetA 日付 A
     * @param targetB 日付 B（省略時は現在日時）
     * @return 過去の日付
     */
    function getPast(targetA: Date, targetB?: Date): Date;

    /**
     * 指定日付の年情報を 4 桁で返却します。
     *
     * @param date 対象日付
     * @return 年（4 桁）
     */
    function getYear(date: Date): number;

    /**
     * 2 つの日付の時間間隔を年単位で返却します。
     */
    function interval(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を日単位で返却します。
     */
    function intervalDay(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を時間単位で返却します。
     */
    function intervalHour(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を分単位で返却します。
     */
    function intervalMinute(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を月単位で返却します。
     */
    function intervalMonth(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を秒単位で返却します。
     */
    function intervalSecond(targetA: Date, targetB: Date): number;

    /**
     * 2 つの日付の時間間隔を年単位で返却します。
     */
    function intervalYear(targetA: Date, targetB: Date): number;

    /**
     * 日付が指定範囲内かを判定します。
     *
     * @param left 左辺境界日付
     * @param lOp 左辺オペレータ
     * @param target チェック対象日付
     * @param rOp 右辺オペレータ
     * @param right 右辺境界日付
     * @return 範囲内の場合 true
     */
    function isBetween(left: Date, lOp: string, target: Date, rOp?: string, right?: Date): boolean;

    /**
     * 指定日付が現在より未来かを判定します。
     *
     * @param target 対象日付
     * @return 未来の場合 true
     */
    function isFuture(target: Date): boolean;

    /**
     * 指定年が閏年かを判定します。
     *
     * @param target 対象日付
     * @return 閏年の場合 true
     */
    function isLeapYear(target: Date): boolean;

    /**
     * 指定日付が現在より過去かを判定します。
     *
     * @param target 対象日付
     * @return 過去の場合 true
     */
    function isPast(target: Date): boolean;

    /**
     * 指定年月日が有効な日付かを判定します。
     *
     * @param year 年
     * @param month 月
     * @param day 日
     * @return 有効な場合 true
     */
    function isValid(year: number, month: number, day: number): boolean;

    /**
     * 月を表す文字列を取得します（January, February 等）。
     *
     * @param target 対象日付
     * @return 月名
     */
    function monthName(target: Date): string;

    /**
     * 現在の日付を返却します（時刻は 00:00:00）。
     *
     * @return 今日の日付
     */
    function today(): Date;
  }
}
