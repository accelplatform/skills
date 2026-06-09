/**
 * 振替用パラメータ情報オブジェクト。
 *
 * 振替処理を行う際に必要なパラメータデータを保持します。
 * TransferManager#transfer() や TransferManager#getTransferUserList() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TransferParamInfo/index.html
 */
interface TransferParamInfo {
  // --- 必須項目 ---

  /** 実行者コード（最大100バイト） */
  executeUserCode: string;
  /** 振替元権限者コード（最大100バイト） */
  transferOriginalUserCode: string;
  /** 振替先処理対象者情報（プラグイン情報）オブジェクト */
  transferTargetPlugin: PluginInfo;
}
