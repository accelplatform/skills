/**
 * 処理種別。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#ProcessType
 */
declare const ProcessType: {
  /** 起票 */
  readonly procTyp_drf: '0';
  /** 申請 */
  readonly procTyp_apy: '1';
  /** 再申請 */
  readonly procTyp_rapy: '2';
  /** 取止め */
  readonly procTyp_dct: '3';
  /** 承認 */
  readonly procTyp_apr: '4';
  /** 承認終了 */
  readonly procTyp_apre: '5';
  /** 否認 */
  readonly procTyp_deny: '6';
  /** 保留 */
  readonly procTyp_rsv: '7';
  /** 保留解除 */
  readonly procTyp_rsvc: '8';
  /** 引戻し */
  readonly procTyp_pbk: '9';
  /** 差戻し */
  readonly procTyp_sbk: '10';
  /** 確認 */
  readonly procTyp_cnfm: '11';
  /** 振替 */
  readonly procTyp_trans: '12';
};

type ProcessType = (typeof ProcessType)[keyof typeof ProcessType];
