/**
 * 承認終了用パラメータ情報オブジェクト。
 *
 * 承認終了処理を行う際に必要なパラメータデータを保持します。
 * ProcessManager#approveEnd() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApproveEndParamInfo/index.html
 */
interface ApproveEndParamInfo {
  // --- 必須項目 ---

  /** 実行者コード（最大100バイト） */
  executeUserCode: string;
  /** 権限者コード（最大100バイト） */
  authUserCode: string;

  // --- 任意項目 ---

  /** 権限者会社コード（最大100バイト） */
  authCompanyCode?: string;
  /** 権限者組織コード（最大100バイト） */
  authOrgzCode?: string;
  /** 権限者組織セットコード（最大100バイト） */
  authOrgzSetCode?: string;
  /** 案件名（最大200バイト） */
  matterName?: string;
  /** 案件番号（最大20バイト） */
  matterNumber?: string;
  /** 根回しメール情報オブジェクト */
  nego?: NegoModelInfo;
  /** 優先度（最大1バイト） */
  priorityLevel?: PriorityLevel;
  /** 処理コメント（最大2000バイト） */
  processComment?: string;
  /** 削除対象システムファイル名の配列 */
  systemFileNameForDelete?: string[];
  /** 添付ファイル一時領域ディレクトリキー */
  tempDirKey?: string;
}
