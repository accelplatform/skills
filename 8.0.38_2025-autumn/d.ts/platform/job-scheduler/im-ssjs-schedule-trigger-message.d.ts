/**
 * スケジュールトリガメッセージ API。
 *
 * トリガのスケジュール定義を文字列表現で取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ScheduleTriggerMessage/index.html
 */
declare class ScheduleTriggerMessage {
  /**
   * トリガのスケジュール定義文字列を取得します。
   *
   * @param trigger トリガ情報オブジェクト
   * @return スケジュール定義の文字列表現
   */
  static getScheduleText(trigger: Trigger): string;
}
