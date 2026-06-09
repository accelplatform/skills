/**
 * 案件完了状態。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#MatterEndStatus
 */
declare const MatterEndStatus: {
  /** 終了ノード到達 */
  readonly matEndSts_EndNode: '0';
  /** 承認終了 */
  readonly matEndSts_Approve: '1';
  /** 取止め */
  readonly matEndSts_Discon: '2';
  /** 否認 */
  readonly matEndSts_Deny: '3';
  /** 案件操作 */
  readonly matEndSts_MatterHandle: '4';
};

type MatterEndStatus = (typeof MatterEndStatus)[keyof typeof MatterEndStatus];
