/**
 * 処理期限後処理種別。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#AutoProcessLimitType
 */
declare const AutoProcessLimitType: {
  /** 承認 */
  readonly autoProcLimitTyp_Applove: '0';
  /** 否認 */
  readonly autoProcLimitTyp_Deny: '1';
  /** 指定ノードへ差戻し */
  readonly autoProcLimitTyp_SendBackToSpecNode: '2';
};

type AutoProcessLimitType = (typeof AutoProcessLimitType)[keyof typeof AutoProcessLimitType];
