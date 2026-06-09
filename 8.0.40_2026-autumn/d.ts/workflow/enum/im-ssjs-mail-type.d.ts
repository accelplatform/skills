/**
 * メール種別。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#MailType
 */
declare const MailType: {
  /** 処理依頼 */
  readonly mailTyp_Proc: '0';
  /** 処理結果通知 */
  readonly mailTyp_Result: '1';
  /** 参照依頼 */
  readonly mailTyp_Ref: '2';
  /** 確認依頼 */
  readonly mailTyp_Cnfm: '3';
  /** 代理通知 */
  readonly mailTyp_Act: '4';
  /** 振替通知 */
  readonly mailTyp_Trans: '5';
  /** 自動催促 */
  readonly mailTyp_Press: '6';
  /** 根回し */
  readonly mailTyp_Nego: '7';
  /** 処理対象者変更通知 */
  readonly mailTyp_Change: '8';
};

type MailType = (typeof MailType)[keyof typeof MailType];
