/**
 * オプション項目オブジェクト。
 *
 * オプションの選択肢を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/OptionItem/index.html
 */
interface OptionItem {
  /** 項目名 */
  readonly name: string;
  /** 項目値 */
  readonly value: string;
}
