/**
 * トリガ情報オブジェクト。
 *
 * トリガ種別に応じて BusinessDayTrigger / DatetimeTrigger / RepeatTrigger のいずれかになります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Trigger/index.html
 */
type Trigger = BusinessDayTrigger | DatetimeTrigger | RepeatTrigger;
