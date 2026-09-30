/**
 * 引戻し用パラメータ情報オブジェクト。
 *
 * 引戻し処理を行う際に必要なパラメータデータを保持します。
 * PullBackManager#pullBack() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/PullBackParamInfo/index.html
 */
interface PullBackParamInfo {
  // --- 必須項目 ---

  /** 権限者コード（最大100バイト） */
  authUserCode: string;
  /** 実行者コード（最大100バイト） */
  executeUserCode: string;
  /** 引戻し先ノードID（最大50バイト） */
  pullBackTargetNodeId: string;

  // --- 任意項目 ---

  /** 根回しメール情報オブジェクト */
  nego?: NegoModelInfo;
  /** 処理コメント（最大2000バイト） */
  processComment?: string;
}
