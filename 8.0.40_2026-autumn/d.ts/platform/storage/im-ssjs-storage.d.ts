/**
 * ストレージオブジェクト。
 *
 * ストレージ種別に応じて PublicStorage / SystemStorage / SessionScopeStorage のいずれかになります。
 *
 * @since 8.0.37 (2025 Spring)
 */
type Storage = PublicStorage | SystemStorage | SessionScopeStorage;
