/**
 * 案件フロー情報オブジェクト。
 *
 * 案件のフロー情報（flow.xml / masterflow.xml）を保持するオブジェクトです。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterFlowInfo/index.html
 */
interface MatterFlowInfo {
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

  /** 未完了案件削除プログラム情報オブジェクトの配列 */
  readonly actvMatterDeleteListenerPlugin?: PluginInfo[];
  /** 過去案件削除プログラム情報オブジェクトの配列 */
  readonly arcMatterDeleteListenerPlugin?: PluginInfo[];
  /** 非同期処理可否フラグ（'0': 否 / '1': 可） */
  readonly asyncProcessFlag?: FlagStatus;
  /** 添付ファイル可否フラグ（'0': 否 / '1': 可） */
  readonly attachFileFlag?: FlagStatus;
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
  /** カレンダーID */
  readonly calendarId?: string;
  /** 確認詳細画面情報オブジェクト */
  readonly confirmDetailPage?: MatterPageInfo;
  /** 確認者設定可否フラグ（'0': 否 / '1': 可） */
  readonly confirmUserSetupFlag?: FlagStatus;
  /** 完了案件確認処理フラグ（'0': 否 / '1': 可） */
  readonly cplMatterConfirmFlag?: FlagStatus;
  /** 完了案件削除プログラム情報オブジェクトの配列 */
  readonly cplMatterDeleteListenerPlugin?: PluginInfo[];
  /** 標準組織情報オブジェクトの配列 */
  readonly defaultOrgz?: OrgzSetInfo[];
  /** 最終結果通知メール情報オブジェクトの配列 */
  readonly finalizeMail?: MatterMailInfo[];
  /** 案件終了時実行プログラム情報オブジェクトの配列 */
  readonly finalizePlugin?: PluginInfo[];
  /** フローグループID の配列 */
  readonly flowGroupId?: string[];
  /** 案件操作権限情報オブジェクトの配列 */
  readonly handleAuth?: MatterHandleAuthInfo[];
  /** 案件開始時実行プログラム情報オブジェクトの配列 */
  readonly initializePlugin?: PluginInfo[];
  /** 一括確認可否フラグ（'0': 否 / '1': 可） */
  readonly lumpConfirmFlag?: FlagStatus;
  /** 一括処理可否フラグ（'0': 否 / '1': 可） */
  readonly lumpProcessFlag?: FlagStatus;
  /** 案件退避処理プログラム情報オブジェクトの配列 */
  readonly matterArchiveListenerPlugin?: PluginInfo[];
  /** ノード情報オブジェクトの配列 */
  readonly nodes?: MatterNodeInfo[];
  /** 過去参照画面情報オブジェクト */
  readonly pastDetailPage?: MatterPageInfo;
  /** 処理詳細画面情報オブジェクト */
  readonly processDetailPage?: MatterPageInfo;
  /** システム日で対象者を展開するフラグ（'0': 否 / '1': 可） */
  readonly sysDateTargetExpandFlag?: FlagStatus;
  /** 参照詳細画面情報オブジェクト */
  readonly viewDetailPage?: MatterPageInfo;
  /** 参照依頼メール情報オブジェクトの配列 */
  readonly viewRequestMail?: MatterMailInfo[];
}
