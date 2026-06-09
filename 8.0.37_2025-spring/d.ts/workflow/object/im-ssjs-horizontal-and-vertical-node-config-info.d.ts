/**
 * 横配置・縦配置ノード設定情報オブジェクト。
 *
 * 再申請・申請・承認時に横・縦配置ノードの展開情報を保存します。
 * matterNodeExpansions に空配列を設定した場合は対象ノードを削除（展開数0で展開）し、
 * 有効な展開情報の配列を設定した場合は対象ノードを展開情報を元に展開します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/HorizontalAndVerticalNodeConfigInfo/index.html
 */
interface HorizontalAndVerticalNodeConfigInfo {
  // --- 必須項目 ---

  /** ノードID（最大20バイト）。展開前の横配置・縦配置ノードID を指定 */
  nodeId: string;

  // --- 任意項目 ---

  /** 案件ノード展開情報オブジェクトの配列 */
  matterNodeExpansions?: MatterNodeExpansionInfo[];
}
