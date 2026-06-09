/**
 * 案件処理履歴情報オブジェクト。
 *
 * 案件で処理を行ったノードの履歴を保存するオブジェクトです。
 * 処理結果を格納する際に、このオブジェクトには案件のステータス（未完了、完了、過去）によって、
 * 未完了案件「imw_t_cpl_task」「imw_t_cpl_user」、
 * 完了案件「imw_t_cpl_matter_task」「imw_t_cpl_matter_user」、
 * 過去案件「imw_a_yyyymm_matter_task」のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterProcessHistoryInfo/index.html
 */
interface MatterProcessHistoryInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** 終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly endDate: string;
  /** 実行者コード */
  readonly executeUserCode: string;
  /** 実行者名 */
  readonly executeUserName: string;
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

  // --- NULLABLE プロパティ ---

  /** 代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly actFlag?: FlagStatus;
  /** 権限者会社コード */
  readonly authCompanyCode?: string;
  /** 権限者会社名 */
  readonly authCompanyName?: string;
  /** 権限者組織セットコード */
  readonly authOrgzSetCode?: string;
  /** 権限者組織コード */
  readonly authOrgzCode?: string;
  /** 権限者組織名 */
  readonly authOrgzName?: string;
  /** 権限者名 */
  readonly authUserName?: string;
  /** ノード名 */
  readonly nodeName?: string;
  /** 処理コメント */
  readonly processComment?: string;
  /** 処理時間 */
  readonly processTime?: string;
  /** 処理種別 */
  readonly processType?: ProcessType;
}
