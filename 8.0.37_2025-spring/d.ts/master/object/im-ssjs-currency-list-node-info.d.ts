/**
 * 通貨リスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyListNodeInfo/index.html
 */
interface CurrencyListNodeInfo {
  /** 会社コード */
  readonly companyCd: string;
  /** 通貨コード */
  readonly currencyCd: string;
  /** 通貨 ISO コード */
  readonly currencyIsoCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 表示名 */
  readonly description: string;
  /** 記述名 */
  readonly displayName: string;
  /** 通貨単位記号 */
  readonly unitSign: string;
}
