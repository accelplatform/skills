/**
 * 根回し情報オブジェクト。
 *
 * 根回し処理で送信するメッセージの宛先・件名・本文を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/NegoModelInfo/index.html
 */
interface NegoModelInfo {
  // --- 任意項目 ---

  /** To 宛先情報の配列 */
  addressTo?: NegoAddressInfo[];
  /** Cc 宛先情報の配列 */
  addressCc?: NegoAddressInfo[];
  /** Bcc 宛先情報の配列 */
  addressBcc?: NegoAddressInfo[];
  /** 返信先アドレス */
  replyTo?: string;
  /** 件名 */
  subject?: string;
  /** 本文 */
  text?: string;
}
