/**
 * 添付ファイル設定。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#AttachmentFileConfig
 */
declare const AttachmentFileConfig: {
  /** 追加・削除不可 */
  readonly atmCnf_NotAddDel: '0';
  /** 追加のみ */
  readonly atmCnf_Add: '1';
  /** 追加・削除可 */
  readonly atmCnf_AddDel: '2';
};

type AttachmentFileConfig = (typeof AttachmentFileConfig)[keyof typeof AttachmentFileConfig];
