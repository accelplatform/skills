/**
 * 設定対象ノードセット情報（処理用）オブジェクト。
 *
 * 承認等の処理時に設定可能なノード情報一式を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/NodeConfigSetToProcessInfo/index.html
 */
interface NodeConfigSetToProcessInfo extends ConfigNodeInfo {
  // --- NOT NULL プロパティ ---

  /** コンテンツID */
  readonly contentsId: string;
  /** コンテンツバージョンID */
  readonly contentsVersionId: string;
  /** フローID */
  readonly flowId: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** ルートID */
  readonly routeId: string;
  /** ルートバージョンID */
  readonly routeVersionId: string;

  // --- NULLABLE プロパティ ---

  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  readonly applyBaseDate?: string;
  /** 添付ファイル設定 */
  readonly attachmentFileConfig?: AttachmentFileConfig;
  /** 設定対象分岐開始ノード情報（処理用）オブジェクトの配列 */
  readonly configBranchStartNodes?: ConfigBranchStartNodeToProcessInfo[];
  /** 設定対象確認ノード情報（処理用）オブジェクトの配列 */
  readonly configConfirmNodes?: ConfigConfirmNodeToProcessInfo[];
  /** 設定対象動的承認ノード情報（処理用）オブジェクトの配列 */
  readonly configDynamicNodes?: ConfigDynamicNodeToProcessInfo[];
  /** 設定対象横配置ノード情報（処理用）オブジェクトの配列 */
  readonly configHorizontalNodes?: ConfigHorizontalNodeToProcessInfo[];
  /** 設定対象縦配置ノード情報（処理用）オブジェクトの配列 */
  readonly configVerticalNodes?: ConfigVerticalNodeToProcessInfo[];
  /** 標準組織情報オブジェクトの配列 */
  readonly defaultOrgz?: OrgzSetInfo[];
  /** 実施可能処理種別情報オブジェクトの配列 */
  readonly nodeProcessTypes?: NodeProcessTypeInfo[];
}
