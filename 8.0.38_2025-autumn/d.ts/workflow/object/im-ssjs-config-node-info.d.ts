/**
 * 設定対象ノード情報オブジェクト。
 *
 * 申請・承認処理時に設定可能な動的承認ノード・確認ノード・横縦配置ノード・分岐開始ノードの
 * 共通情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigNodeInfo/index.html
 */
interface ConfigNodeInfo {
  // --- NOT NULL プロパティ ---

  /** ノードID */
  readonly nodeId: string;

  // --- NULLABLE プロパティ ---

  /** ノード名 */
  readonly nodeName?: string;
  /** ノード種別 */
  readonly nodeType?: NodeType;
  /** 親ノードID（展開されている場合のみ有効） */
  readonly parentNodeId?: string;
  /** 親ノード名（展開されている場合のみ有効） */
  readonly parentNodeName?: string;
  /** 親ノード種別（展開されている場合のみ有効） */
  readonly parentNodeType?: NodeType;
}
