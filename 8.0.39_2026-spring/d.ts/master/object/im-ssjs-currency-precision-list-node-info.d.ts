/**
 * 通貨精度リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyPrecisionListNodeInfo/index.html
 */
interface CurrencyPrecisionListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 通貨コード */
  readonly currencyCd: string;
  /** 通貨精度 */
  readonly currencyPrecision: number;
  /** 通貨精度区分 */
  readonly currencyPrecisionType: string;
  /** 通貨スケール */
  readonly currencyScale: number;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 表示名 */
  readonly description: string;
  /** 記述名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
