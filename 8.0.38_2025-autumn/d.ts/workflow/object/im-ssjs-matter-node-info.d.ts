/**
 * 案件ノード情報オブジェクト。
 *
 * 案件のノード情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterNodeInfo/index.html
 */
interface MatterNodeInfo {
  // --- NOT NULL プロパティ ---

  /** ノードID */
  readonly nodeId: string;
  /** ノード種別 */
  readonly nodeType: NodeType;

  // --- NULLABLE プロパティ ---

  /** 逆方向ノードID の配列 */
  readonly backwardNodeIds?: string[];
  /** 順方向ノードID の配列 */
  readonly forwardNodeIds?: string[];
  /** ノード名 */
  readonly nodeName?: string;
  /** 案件画面定義情報オブジェクトの配列 */
  readonly pages?: MatterPageInfo[];
  /** 親ノードID（展開されている場合のみ有効） */
  readonly parentNodeId?: string;
  /** 親ノード種別（展開されている場合のみ有効） */
  readonly parentNodeType?: NodeType;
}
