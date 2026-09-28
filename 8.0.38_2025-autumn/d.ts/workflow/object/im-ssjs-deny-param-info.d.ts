/**
 * 否認用パラメータ情報オブジェクト。
 *
 * 否認処理を行う際に必要なパラメータデータを保持します。
 * ProcessManager#deny() に引数として渡します。
 *
 * @since 8.0.39 (2024 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/DenyParamInfo/index.html
 */
interface DenyParamInfo {
  /** 実行者コード（最大100バイト） */
  executeUserCode: string;
  /** 権限者コード（最大100バイト） */
  authUserCode: string;

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
