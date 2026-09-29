/**
 * 通貨換算コードリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyConversionListNodeInfo/index.html
 */
interface CurrencyConversionListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 通貨換算コード */
  readonly currencyConversionCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 表示名 */
  readonly description: string;
  /** 記述名 */
  readonly displayName: string;
  /** 略称 */
  readonly shortName: string;
}
