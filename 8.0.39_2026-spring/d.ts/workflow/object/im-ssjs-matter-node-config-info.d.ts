/**
 * 案件ノード設定情報オブジェクト。
 *
 * 案件のノード設定情報を格納するオブジェクトです。
 * フロー XML のノード情報の全てが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterNodeConfigInfo/index.html
 */
interface MatterNodeConfigInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** ノードID */
  readonly nodeId: string;
  /** ノード種別 */
  readonly nodeType: NodeType;

  // --- NULLABLE プロパティ ---

  /** アクション処理（プラグイン情報）の配列 */
  readonly actionProcess?: PluginInfo[];
  /** 添付ファイル可否フラグ */
  readonly attachFileFlag?: AttachmentFileConfig;
  /** 権限者設定可能ノードID の配列 */
  // TODO: typo については、後方互換のために修正していません
  readonly authConfiguableNodeIds?: string[];
  /** 自動催促可否フラグ（'0': 否 / '1': 可） */
  readonly autoPressFlag?: FlagStatus;
  /** 自動催促期限（日数） */
  readonly autoPressLimitDay?: string;
  /** 自動処理可否フラグ（'0': 否 / '1': 可） */
  readonly autoProcessFlag?: FlagStatus;
  /** 自動処理期限（日数） */
  readonly autoProcessLimitDay?: string;
  /** 処理期限後処理種別 */
  readonly autoProcessLimitType?: AutoProcessLimitType;
  /** 自動処理差戻し先ノードID */
  readonly autoProcessSendBackNodeId?: string;
  /** 逆方向ノードID の配列 */
  readonly backwardNodeIds?: string[];
  /** 分岐終了設定情報オブジェクト */
  readonly branchEndConfig?: BranchEndConfigInfo;
  /** 分岐開始設定情報オブジェクト */
  readonly branchStartConfig?: BranchStartConfigInfo;
  /** 標準組織設定（表示禁止）の配列 */
  readonly defaultOrgzDisable?: OrgzSetInfo[];
  /** 割当可能ノード数（最大） */
  // TODO: typo については、後方互換のために修正していません
  readonly dispachNodeMax?: string;
  /** 割当可能ノード数（最小） */
  // TODO: typo については、後方互換のために修正していません
  readonly dispachNodeMin?: string;
  /** 動的承認ノード削除禁止フラグ（'0': 削除許可 / '1': 削除禁止） */
  readonly dynamicNodeDeleteDisableFlag?: FlagStatus;
  /** 実行可能処理種別情報の配列 */
  readonly executableProcessType?: NodeProcessTypeInfo[];
  /** 展開元ノードID の配列 */
  readonly expansionOriginalNodeId?: string[];
  /** 順方向ノードID の配列 */
  readonly forwardNodeIds?: string[];
  /** 一括処理可否フラグ（'0': 否 / '1': 可） */
  readonly lumpProcessFlag?: FlagStatus;
  /** 案件メール定義情報オブジェクトの配列 */
  readonly matterMail?: MatterMailInfo[];
  /** 案件画面定義情報オブジェクトの配列 */
  readonly matterPage?: MatterPageInfo[];
  /** 到達処理情報オブジェクトの配列 */
  readonly nodeArriveProcess?: PluginInfo[];
  /** ノード名 */
  readonly nodeName?: string;
  /** プラグイン設定（表示禁止プラグインID）の配列 */
  readonly pluginParameterDisable?: string[];
  /** ノード遷移後処理の配列 */
  readonly postProcess?: PluginInfo[];
  /** ノード遷移前処理の配列 */
  readonly preProcess?: PluginInfo[];
  /** 権限者情報の配列 */
  readonly processTargets?: PluginInfo[];
}
