/**
 * ツール定義情報オブジェクト。
 *
 * Function Calling で AI に実行させる関数の仕様を定義します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ToolDefinition/index.html
 */
interface ToolDefinition {
  /** 関数名 */
  name: string;
  /** 関数の説明 */
  description: string;
  /** パラメータ定義（JSON スキーマ形式） */
  parameters: object;
}
