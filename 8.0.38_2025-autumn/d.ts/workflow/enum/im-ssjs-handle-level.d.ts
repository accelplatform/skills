/**
 * 操作レベル。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#HandleLevel
 */
declare const HandleLevel: {
  /** 参照可 */
  readonly handleLevel_Reference: '0';
  /** 操作可 */
  readonly handleLevel_Handle: '1';
};

type HandleLevel = (typeof HandleLevel)[keyof typeof HandleLevel];
