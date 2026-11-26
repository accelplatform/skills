/**
 * ユーザ申請用フロー情報オブジェクト。
 *
 * ユーザが申請可能なフローの情報を保持します（ApplyFlowList の取得結果）。
 * フロー関連情報は「imw_m_flow」、「imw_m_flow_detail」、ルート関連情報は「imw_m_route_detail」から取得されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApplyFlowInfo/index.html
 */
interface ApplyFlowInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** フロー名 */
  readonly flowName: string;
  /** 申請ノードID */
  readonly applyNodeId: string;

  // --- NULLABLE プロパティ ---

  /** 備考（フロー） */
  readonly flowNote?: string;
  /** 備考（フローバージョン） */
  readonly flowVersionNote?: string;
  /** システム日で対象者を展開するフラグ（'0': 否 / '1': 可） */
  readonly sysDateTargetExpandFlag?: FlagStatus;
}
