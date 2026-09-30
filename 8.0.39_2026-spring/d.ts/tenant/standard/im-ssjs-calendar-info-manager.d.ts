/**
 * カレンダー情報マネージャ。
 *
 * カレンダー情報、日付情報の管理と、特定日の日付情報を検索します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/CalendarInfoManager/index.html
 */
declare class CalendarInfoManager {
  /**
   * カレンダー情報マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * カレンダーを削除します。
   *
   * @param calendarInfo カレンダー情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteCalendarInfo(calendarInfo: CalendarInfo): ResultObject<null>;

  /**
   * 曜日情報を削除します。
   *
   * @param calendarWeekDayInfo 曜日情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteCalendarWeekDayInfo(calendarWeekDayInfo: CalendarWeekDayInfo): ResultObject<null>;

  /**
   * 日付情報を削除します。
   *
   * @param dayInfo 日付情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteDayInfo(dayInfo: DayInfo): ResultObject<null>;

  /**
   * 日付情報セットを削除します。
   *
   * @param dayInfoSet 日付情報セット
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteDayInfoSet(dayInfoSet: DayInfoSet): ResultObject<null>;

  /**
   * カレンダーから日付情報セットを除外します。
   *
   * @param calendarId カレンダーID
   * @param dayInfoSetIds 日付情報セットID の配列
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  excludeDayInfoSet(calendarId: string, dayInfoSetIds: string[]): ResultObject<null>;

  /**
   * カレンダー情報を取得します。
   *
   * @param calendarId カレンダーID
   * @return data にカレンダー情報を格納した ResultObject
   */
  getCalendarInfo(calendarId: string): ResultObject<CalendarInfo>;

  /**
   * すべてのカレンダー情報を取得します。
   *
   * @return data にカレンダー情報の配列を格納した ResultObject
   */
  getCalendarInfos(): ResultObject<CalendarInfo[]>;

  /**
   * カレンダーの曜日情報を取得します。
   *
   * @param calendarId カレンダーID
   * @return data に曜日情報の配列を格納した ResultObject
   */
  getCalendarWeekDayInfos(calendarId: string): ResultObject<CalendarWeekDayInfo[]>;

  /**
   * 日付情報を取得します。
   *
   * @param dayInfoSetId 日付情報セットID
   * @param dayInfoId 日付情報ID
   * @return data に日付情報を格納した ResultObject
   */
  getDayInfo(dayInfoSetId: string, dayInfoId: string): ResultObject<DayInfo>;

  /**
   * 日付情報セットを取得します。
   *
   * @param dayInfoSetId 日付情報セットID
   * @return data に日付情報セットを格納した ResultObject
   */
  getDayInfoSet(dayInfoSetId: string): ResultObject<DayInfoSet>;

  /**
   * すべての日付情報セットを取得します。
   *
   * @return data に日付情報セットの配列を格納した ResultObject
   */
  getDayInfoSets(): ResultObject<DayInfoSet[]>;

  /**
   * カレンダー内の日付情報セットを取得します。
   *
   * @param calendarId カレンダーID
   * @return data に日付情報セットの配列を格納した ResultObject
   */
  getDayInfoSetsByCalendarId(calendarId: string): ResultObject<DayInfoSet[]>;

  /**
   * カレンダー内のすべての日付情報を取得します。
   *
   * @param calendarId カレンダーID
   * @return data に日付情報の配列を格納した ResultObject
   */
  getDayInfosByCalendarId(calendarId: string): ResultObject<DayInfo[]>;

  /**
   * セット内のすべての日付情報を取得します。
   *
   * @param dayInfoSetId 日付情報セットID
   * @return data に日付情報の配列を格納した ResultObject
   */
  getDayInfosByDayInfoSetId(dayInfoSetId: string): ResultObject<DayInfo[]>;

  /**
   * すべての日付情報を取得します。
   *
   * 正確なソート順が必要な場合は、すべてのカレンダー（または日付情報セット）を取得した上で
   * カレンダーごとに日付情報を取得してください。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に日付情報の配列を格納した ResultObject
   */
  getDayInfos(): ResultObject<DayInfo[]>;

  /**
   * 指定日の日付情報サマリを取得します。
   *
   * @param calendarId カレンダーID
   * @param date 対象日付
   * @return data に日付情報サマリの配列を格納した ResultObject
   */
  getDayInfoSummary(calendarId: string, date: Date): ResultObject<DayInfoSummary[]>;

  /**
   * 1 ヶ月分の日付情報サマリを取得します。
   *
   * date パラメータの年・月のみ使用されます（日は無視されます）。
   * fill が true の場合、カレンダーグリッドを完全な週で埋めるため、
   * 先頭が日曜日・末尾が土曜日になるよう前後月の日付情報を補完します。
   *
   * @param calendarId カレンダーID
   * @param date 対象月の任意の日付
   * @param fill 前後月の日付で埋める場合 true
   * @return data に日付情報サマリの配列を格納した ResultObject
   */
  getDayInfoSummariesOnMonth(calendarId: string, date: Date, fill: boolean): ResultObject<DayInfoSummary[]>;

  /**
   * 指定期間の日付情報サマリを取得します。
   * start および end パラメータの年・月・日のみ使用されます（時刻部分は無視されます）。
   *
   * @param calendarId カレンダーID
   * @param start 開始日
   * @param end 終了日
   * @return data に日付情報サマリの配列を格納した ResultObject
   */
  getDayInfoSummariesOnTerm(calendarId: string, start: Date, end: Date): ResultObject<DayInfoSummary[]>;

  /**
   * 指定期間の日付情報サマリを取得します（日付情報セットID 指定）。
   *
   * baseCalendarId は曜日情報の取得にのみ使用されます。
   * このメソッドは日付情報セット再編成時のプレビュー表示を目的として設計されており、
   * 一般的なアプリケーション用途には使用しないでください。
   *
   * @param baseCalendarId ベースカレンダーID
   * @param dayInfoSetIds 日付情報セットID の配列
   * @param start 開始日
   * @param end 終了日
   * @return data に日付情報サマリの配列を格納した ResultObject
   */
  getDayInfoSummariesOnTermByDayInfoSetIds(baseCalendarId: string, dayInfoSetIds: string[], start: Date, end: Date): ResultObject<DayInfoSummary[]>;

  /**
   * 1 週間分の日付情報サマリを取得します。
   *
   * date パラメータの年・月・曜日のみ使用されます。
   * 指定日を含む週の開始日から7日分のデータを返却します。
   *
   * @param calendarId カレンダーID
   * @param date 対象週の任意の日付
   * @param shiftFirstDayOfWeek 週の開始曜日をシフトする場合 true
   * @return data に日付情報サマリの配列を格納した ResultObject
   */
  getDayInfoSummariesOnWeek(calendarId: string, date: Date, shiftFirstDayOfWeek: boolean): ResultObject<DayInfoSummary[]>;

  /**
   * カレンダーの存在を判定します。
   *
   * @param calendarId カレンダーID
   * @return data に存在有無を格納した ResultObject（true: 存在する）
   */
  hasCalendarInfo(calendarId: string): ResultObject<boolean>;

  /**
   * 日付情報セットの存在を判定します。
   *
   * @param dayInfoSetId 日付情報セットID
   * @return data に存在有無を格納した ResultObject（true: 存在する）
   */
  hasDayInfoSet(dayInfoSetId: string): ResultObject<boolean>;

  /**
   * 指定日が該当の日付情報を持つかを判定します。
   *
   * @param calendarId カレンダーID
   * @param date 対象日付
   * @param dayInfo 日付情報
   * @return data に判定結果を格納した ResultObject（true: 該当あり）
   */
  hasDayInfo(calendarId: string, date: Date, dayInfo: DayInfo): ResultObject<boolean>;

  /**
   * カレンダーに日付情報セットを追加します。
   *
   * 追加された日付情報セットは最低優先度として設定されます。
   * 既にカレンダーに含まれている日付情報セットID を指定すると例外がスローされます。
   *
   * @param calendarId カレンダーID
   * @param dayInfoSetIds 日付情報セットID の配列
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  includeDayInfoSet(calendarId: string, dayInfoSetIds: string[]): ResultObject<null>;

  /**
   * カレンダーを作成します。
   *
   * @param calendarInfo カレンダー情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertCalendarInfo(calendarInfo: CalendarInfo): ResultObject<null>;

  /**
   * 曜日情報を作成します。
   *
   * @param calendarWeekDayInfo 曜日情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertCalendarWeekDayInfo(calendarWeekDayInfo: CalendarWeekDayInfo): ResultObject<null>;

  /**
   * 日付情報を作成します。
   *
   * @param dayInfo 日付情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertDayInfo(dayInfo: DayInfo): ResultObject<null>;

  /**
   * 日付情報セットを作成します。
   *
   * @param dayInfoSet 日付情報セット
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertDayInfoSet(dayInfoSet: DayInfoSet): ResultObject<null>;

  /**
   * 指定日が休日かを判定します。
   *
   * @param calendarId カレンダーID
   * @param date 対象日付
   * @return data に休日判定結果を格納した ResultObject（true: 休日）
   */
  isHoliday(calendarId: string, date: Date): ResultObject<boolean>;

  /**
   * 週の開始曜日を設定します。
   *
   * 有効な値は 0（日曜）〜 6（土曜）です。範囲外の値を指定した場合は false を返し、値は変更されません。
   * この設定は getDayInfoSummariesOnWeek および getDayInfoSummariesOnMonth（fill=true）に影響します。
   *
   * @deprecated SSJS-API は公開されていません。
   * @param firstDayOfWeek 曜日（0: 日曜 〜 6: 土曜）
   * @return 成功した場合 true、失敗した場合 false
   */
  // TODO: @JSFunction 定義がないため、公開されていません
  // setFirstDayOfWeek(firstDayOfWeek: number): boolean;

  /**
   * カレンダーを更新します。
   *
   * @param calendarInfo カレンダー情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateCalendarInfo(calendarInfo: CalendarInfo): ResultObject<null>;

  /**
   * 曜日情報を更新します。
   *
   * @param calendarWeekDayInfo 曜日情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateCalendarWeekDayInfo(calendarWeekDayInfo: CalendarWeekDayInfo): ResultObject<null>;

  /**
   * 日付情報を更新します。
   *
   * @param dayInfo 日付情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateDayInfo(dayInfo: DayInfo): ResultObject<null>;

  /**
   * 日付情報セットを更新します。
   *
   * @param dayInfoSet 日付情報セット
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateDayInfoSet(dayInfoSet: DayInfoSet): ResultObject<null>;

  /**
   * カレンダー内の日付情報セットの優先順位を変更します。
   *
   * 配列に含まれるID が先頭から優先度が高くなります。
   * 配列に含まれていないID は末尾に移動します。
   * カレンダーに含まれていないID は無視されます。
   *
   * @param calendarId カレンダーID
   * @param dayInfoSetIds 日付情報セットID の配列（優先順）
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateDayInfoSetSortKeyOnCalendar(calendarId: string, dayInfoSetIds: string[]): ResultObject<null>;

  /**
   * セット内の日付情報の優先順位を変更します。
   *
   * 配列に含まれるID が先頭から優先度が高くなります。
   * 配列に含まれていないID は末尾に移動します。
   *
   * @param dayInfoSetId 日付情報セットID
   * @param dayInfoIds 日付情報ID の配列（優先順）
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateDayInfoSortKeyOnDayInfoSet(dayInfoSetId: string, dayInfoIds: string[]): ResultObject<null>;
}
