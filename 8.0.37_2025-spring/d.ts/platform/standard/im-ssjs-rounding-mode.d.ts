/**
 * 丸め動作を指定する列挙クラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/RoundingMode/index.html
 */
declare class RoundingMode {
  /** 0 から離れるように丸めます */
  static readonly UP: RoundingMode;
  /** 0 に近づくように丸めます */
  static readonly DOWN: RoundingMode;
  /** 正の無限大に近づくように丸めます */
  static readonly CEILING: RoundingMode;
  /** 負の無限大に近づくように丸めます */
  static readonly FLOOR: RoundingMode;
  /** 四捨五入（最近接偶数への丸め）。5 の場合は切り上げ */
  static readonly HALF_UP: RoundingMode;
  /** 五捨六入。5 の場合は切り捨て */
  static readonly HALF_DOWN: RoundingMode;
  /** 銀行丸め（最近接偶数への丸め） */
  static readonly HALF_EVEN: RoundingMode;
  /** 丸めが不要であることを表します。丸めが必要な場合は例外がスローされます */
  static readonly UNNECESSARY: RoundingMode;
}
