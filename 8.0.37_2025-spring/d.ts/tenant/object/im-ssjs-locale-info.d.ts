/**
 * ロケール情報オブジェクト。
 *
 * ロケールに関する詳細情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/LocaleInfo/index.html
 */
interface LocaleInfo {
  /** ロケールID */
  readonly locale: string;
  /** 表示名 */
  readonly displayName: string;
  /** 自言語での表示名 */
  readonly displayNameByOwnLocale: string;
  /** デフォルトエンコーディング */
  readonly defaultEncoding: string;
  /** 利用可能なエンコーディングの配列 */
  readonly encodings: string[];
}
