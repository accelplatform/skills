/**
 * 保留解除用パラメータ情報オブジェクト。
 *
 * 保留解除処理を行う際に必要なパラメータデータを保持します。
 * ProcessManager#reserveCancel() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ReserveCancelParamInfo/index.html
 */
interface ReserveCancelParamInfo {
  // --- 必須項目 ---

  /** 権限者コード（最大100バイト） */
  authUserCode: string;
  /** 実行者コード（最大100バイト） */
  executeUserCode: string;

  // --- 任意項目 ---

  /** 根回しメール情報オブジェクト */
  nego?: NegoModelInfo;
  /** 処理コメント（最大2000バイト） */
  processComment?: string;
}
