/**
 * 未完了（アクティブ）ノード情報オブジェクト。
 *
 * 未完了案件のノード情報を保持するオブジェクトです。
 * 処理結果を格納する際に、このオブジェクトにはデータベーステーブル「imw_t_actv_task」の情報や、
 * フロー XML「flow.xml」の情報の一部が設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvNodeInfo/index.html
 */
interface ActvNodeInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フロー名 */
  readonly flowName: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** 案件名 */
  readonly matterName: string;
  /** ノードID */
  readonly nodeId: string;
  /** ノード種別 */
  readonly nodeType: NodeType;
  /** 開始日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly startDate: string;
  /** タスクステータス */
  readonly status: TaskStatus;
  /** システム案件ID */
  readonly systemMatterId: string;
  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** 申請代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly applyActFlag?: FlagStatus;
  /** 申請権限者コード */
  readonly applyAuthUserCode?: string;
  /** 申請権限者名 */
  readonly applyAuthUserName?: string;
  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  readonly applyBaseDate?: string;
  /** 申請日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly applyDate?: string;
  /** 申請実行者コード */
  readonly applyExecuteUserCode?: string;
  /** 申請実行者名 */
  readonly applyExecuteUserName?: string;
  /** 自動処理期限（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly autoProcessLimitDate?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティ情報オブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** ノード名 */
  readonly nodeName?: string;
  /** 催促処理期限（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly pressLimitDate?: string;
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
  /** 処理権限 */
  readonly processAuth?: ProcessAuth;
}
