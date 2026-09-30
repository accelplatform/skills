/**
 * フラグ状態。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#FlagStatus
 */
declare const FlagStatus: {
  /** 無効 */
  readonly Disable: '0';
  /** 有効 */
  readonly Enable: '1';
};

type FlagStatus = (typeof FlagStatus)[keyof typeof FlagStatus];
