/**
 * タスクステータス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#TaskStatus
 */
declare const TaskStatus: {
  /** 申請待ち */
  readonly APPLYWAIT: 'applywait';
  /** 申請 */
  readonly APPLY: 'apply';
  /** 再申請待ち */
  readonly REAPPLYWAIT: 'reapplywait';
  /** 再申請 */
  readonly REAPPLY: 'reapply';
  /** 承認待ち */
  readonly APPROVEWAIT: 'approvewait';
  /** 承認 */
  readonly APPROVE: 'approve';
  /** 承認終了 */
  readonly APPROVEEND: 'approveend';
  /** 承認（復元） */
  readonly APPROVERESTORE: 'approverestore';
  /** 否認 */
  readonly DENY: 'deny';
  /** 差戻し */
  readonly SENDBACK: 'sendback';
  /** キャンセル待ち */
  readonly CANCELWAIT: 'cancelwait';
  /** キャンセル */
  readonly CANCEL: 'cancel';
  /** 引戻し */
  readonly PULLBACK: 'pullback';
  /** 差戻し後引戻し */
  readonly SENDBACKTOPULLBACK: 'sendbacktopullback';
  /** システム処理開始待ち */
  readonly SYSTEMWAIT: 'systemwait';
  /** 分岐 */
  readonly BRANCH: 'branch';
  /** 結合 */
  readonly UNION: 'union';
  /** 結合失敗 */
  readonly UNIONFAILED: 'unionfailed';
  /** システム処理完了 */
  readonly SYSTEMCOMPLETE: 'systemcomplete';
  /** 案件操作 */
  readonly MATTERHANDLE: 'matterhandle';
  /** 案件開始待ち */
  readonly MATTERSTARTWAIT: 'matterstartwait';
  /** 案件開始 */
  readonly MATTERSTART: 'matterstart';
  /** 案件終了待ち */
  readonly MATTERCOMPLETEWAIT: 'mattercompletewait';
  /** 案件終了 */
  readonly MATTERCOMPLETE: 'mattercomplete';
  /** 保留 */
  readonly RESERVE: 'reserve';
  /** 保留状態 */
  readonly RESERVEWAIT: 'reservewait';
  /** 保留解除 */
  readonly RESERVECANCEL: 'reservecancel';
  /** 取止め */
  readonly DISCONTINUE: 'discontinue';
  /** 起票 */
  readonly DRAFT: 'draft';
  /** 申請（復元） */
  readonly APPLYRESTORE: 'applyrestore';
  /** 再申請（復元） */
  readonly REAPPLYRESTORE: 'reapplyrestore';
};

type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
