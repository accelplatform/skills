/**
 * 一時保存用パラメータ情報オブジェクト。
 *
 * 一時保存案件を新規作成、更新、削除する時に利用します。
 * 登録や更新、削除処理に使用する際に、処理によって必須の項目が異なります。
 *
 * 【処理別各項目必須／任意一覧】
 * |項目名              |新規作成|更新|削除|
 * |フローID            |●      |●  |△  |
 * |ユーザデータID      |●      |●  |●  |
 * |案件名              |●      |●  |△  |
 * |申請基準日          |●      |●  |△  |
 * |実行者コード        |●      |●  |△  |
 * |権限者コード        |●      |●  |△  |
 * |処理コメント        |△      |△  |△  |
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TempSaveParamInfo/index.html
 */
interface TempSaveParamInfo {
  // --- 必須項目 ---

  /** ユーザデータID */
  userDataId: string;

  // --- 条件付き必須項目 ---
  // **新規作成 API 使用時**: 必須
  // **更新 API 使用時**: 必須
  // **削除 API 使用時**: 任意

  /** 権限者コード */
  applyAuthUserCode?: string;
  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  applyBaseDate?: string;
  /** 実行者コード */
  applyExecuteUserCode?: string;
  /** フローID */
  flowId?: string;
  /** 案件名 */
  matterName?: string;

  // --- 任意項目 ---

  /** 処理コメント */
  processComment?: string;
}
