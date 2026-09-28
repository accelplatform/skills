/**
 * 処理済一覧の処理権限条件オブジェクト。
 *
 * 処理中の未完了案件又は完了した案件に対して、あるユーザが処理した一覧を取得する際に
 * 追加検索条件として設定する値を保存するオブジェクトです。
 * 有効なデータを取得するには、いずれかのフラグを「1:取得あり」に設定する必要があります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessedAuthConditionInfo/index.html
 */
interface ProcessedAuthConditionInfo {
  // --- 任意項目 ---

  /** 本人申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applyFlg?: FlagStatus;
  /** 他人（代理元）申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applyOriginalActFlg?: FlagStatus;
  /** 本人（代理先）申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applySelfActFlg?: FlagStatus;
  /** 他人（代理先）申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applyTargetActFlg?: FlagStatus;
  /** 本人承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveFlg?: FlagStatus;
  /** 他人（代理元）承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveOriginalActFlg?: FlagStatus;
  /** 本人（代理先）承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveSelfActFlg?: FlagStatus;
  /** 他人（代理先）承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveTargetActFlg?: FlagStatus;
}
