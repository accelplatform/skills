/**
 * オプション設定オブジェクト。
 *
 * データインポート／エクスポートのオプション設定を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/Option/index.html
 */
interface Option {
  /** オプション項目の配列 */
  readonly item: OptionItem[];
  /** オプションキー */
  readonly key: string;
  /** オプション名 */
  readonly name: string;
  /** 必須かどうか */
  readonly required: boolean;
  /** オプション種別 */
  readonly type: string;
}
