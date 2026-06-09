/**
 * 優先度。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#PriorityLevel
 */
declare const PriorityLevel: {
  /** 高 */
  readonly pryLevel_H: '9';
  /** 通常 */
  readonly pryLevel_N: '5';
  /** 低 */
  readonly pryLevel_L: '1';
};

type PriorityLevel = (typeof PriorityLevel)[keyof typeof PriorityLevel];
