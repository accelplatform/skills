/**
 * 差戻し用パラメータ情報オブジェクト。
 *
 * 差戻し処理を行う際に必要なパラメータデータを保持します。
 * ProcessManager#sendBack() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/SendBackParamInfo/index.html
 */
interface SendBackParamInfo {
  // --- 必須項目 ---

  /** 権限者コード（最大100バイト） */
  authUserCode: string;
  /** 実行者コード（最大100バイト） */
  executeUserCode: string;

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
  /** 差戻し先ノードID の配列 */
  sendBackNodeId?: string[];
}
