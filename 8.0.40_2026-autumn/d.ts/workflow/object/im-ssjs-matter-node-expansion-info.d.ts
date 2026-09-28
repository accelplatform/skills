/**
 * 案件ノード展開情報オブジェクト。
 *
 * 横・縦配置ノードを展開する際に、展開されるノードのノード名や、
 * そのノードの処理権限者情報を保存します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterNodeExpansionInfo/index.html
 */
interface MatterNodeExpansionInfo {
  // --- 任意項目 ---

  /** ノード名（最大100バイト） */
  nodeName?: string;
  /** 処理対象者情報（プラグイン情報）オブジェクトの配列 */
  processTargetConfigModel?: PluginInfo[];
}
