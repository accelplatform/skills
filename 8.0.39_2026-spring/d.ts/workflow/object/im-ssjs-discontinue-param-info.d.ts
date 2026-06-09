/**
 * 取止め用パラメータ情報オブジェクト。
 *
 * 取止め処理を行う際に必要なパラメータデータを保持します。
 * ProcessManager#discontinue() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/DiscontinueParamInfo/index.html
 */
interface DiscontinueParamInfo {
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
  /** 根回しメール情報オブジェクト */
  nego?: NegoModelInfo;
  /** 処理コメント（最大2000バイト） */
  processComment?: string;
}
