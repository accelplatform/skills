/**
 * ツール設定情報オブジェクト。
 *
 * Function Calling のツール定義と選択動作を設定します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ToolConfig/index.html
 */
interface ToolConfig {
  /** ツール選択情報 */
  toolChoice?: ToolChoice;
  /** ツール定義情報の配列 */
  toolDefinitions: ToolDefinition[];
}
