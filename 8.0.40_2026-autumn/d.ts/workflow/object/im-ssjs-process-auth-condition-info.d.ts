/**
 * 未処理一覧の処理権限条件オブジェクト。
 *
 * 処理中の未完了案件に対して、あるユーザが処理できる一覧又は一括処理一覧を取得する際に、
 * 追加検索条件として設定する値を保存するオブジェクトです。
 * 有効なデータを取得するには、いずれかのフラグを「1:取得あり」に設定する必要があります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessAuthConditionInfo/index.html
 */
interface ProcessAuthConditionInfo {
  // --- 必須項目 ---

  /** 代理申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applyActFlg: FlagStatus;
  /** 本人申請情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  applyFlg: FlagStatus;
  /** 代理承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveActFlg: FlagStatus;
  /** 本人承認情報取得フラグ（'0': 取得なし / '1': 取得あり） */
  approveFlg: FlagStatus;
}