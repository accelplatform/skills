/**
 * 処理権限。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#ProcessAuth
 */
declare const ProcessAuth: {
  /** 本人権限でのみ処理可能 */
  readonly processAuth_Self: '0';
  /** 代理権限でのみ処理可能 */
  readonly processAuth_Act: '1';
  /** 本人権限でも代理権限でも処理可能 */
  readonly processAuth_SelfAndAct: '2';
};

type ProcessAuth = (typeof ProcessAuth)[keyof typeof ProcessAuth];
