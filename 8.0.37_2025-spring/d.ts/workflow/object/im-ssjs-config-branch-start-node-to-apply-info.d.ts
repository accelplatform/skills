/**
 * 設定対象分岐開始ノード情報（申請用）オブジェクト。
 *
 * 申請処理時に設定可能な分岐開始ノードが存在する場合に、その情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigBranchStartNodeToApplyInfo/index.html
 */
interface ConfigBranchStartNodeToApplyInfo extends ConfigNodeInfo {
  // --- NULLABLE プロパティ ---

  /** 順方向ノード情報オブジェクトの配列 */
  readonly forwardNodes?: ConfigNodeInfo[];
  /** 分岐先複数設定可否フラグ（'0': 否 / '1': 可） */
  readonly multipleBranchFlag?: FlagStatus;
}
