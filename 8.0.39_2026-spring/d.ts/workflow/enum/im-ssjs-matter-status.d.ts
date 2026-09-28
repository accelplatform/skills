/**
 * 案件状態。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#MatterStatus
 */
declare const MatterStatus: {
  /** 未完了 */
  readonly matSts_Active: '0';
  /** 完了 */
  readonly matSts_Complete: '1';
  /** 過去完了 */
  readonly matSts_Archived: '2';
};

type MatterStatus = (typeof MatterStatus)[keyof typeof MatterStatus];
