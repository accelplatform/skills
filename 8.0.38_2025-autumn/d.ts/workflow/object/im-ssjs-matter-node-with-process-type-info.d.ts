/**
 * 案件ノード情報（ノード別処理種別含む）オブジェクト。
 *
 * 案件のノード情報を格納するオブジェクトです。
 * このオブジェクトにはフロー XML のノード情報の一部が設定されます。
 * 展開されたノード（横・縦配置ノードの子ノード）の場合、親ノード情報は含まれていません。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterNodeWithProcessTypeInfo/index.html
 */
interface MatterNodeWithProcessTypeInfo {
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
  /** 処理種別情報オブジェクトの配列 */
  readonly nodeProcessType?: NodeProcessTypeInfo[];
  /** 画面定義情報オブジェクトの配列 */
  readonly pages?: MatterPageInfo[];
}
