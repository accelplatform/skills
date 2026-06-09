/**
 * 処理済ノード情報オブジェクト。
 *
 * 処理済ノード情報を取得する処理で、処理結果である案件ノード情報を保存するためのオブジェクトです。
 * このオブジェクトには案件のステータスによって、下記テーブルのデータがマッピングされます。
 * 未完了の場合：「imw_t_actv_matter」、「imw_t_actv_matter_locale」、「imw_t_cpl_task」
 * 完了の場合：「imw_t_cpl_matter」、「imw_t_cpl_matter_locale」、「imw_t_cpl_matter_task」
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CplNodeInfo/index.html
 */
interface CplNodeInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** 終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly endDate: string;
  /** 実行者コード */
  readonly executeUserCode: string;
  /** 実行者名 */
  readonly executeUserName: string;
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
  /** 操作者コード */
  readonly operateUserCode: string;
  /** 操作者名 */
  readonly operateUserName: string;
  /** 開始日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly startDate: string;
  /** タスクステータス */
  readonly status: TaskStatus;
  /** システム案件ID */
  readonly systemMatterId: string;
  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** 代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly actFlag?: FlagStatus;
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
  /** 権限者名 */
  readonly authUserName?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** ノード名 */
  readonly nodeName?: string;
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
  /** 処理種別 */
  readonly processType?: ProcessType;
}
