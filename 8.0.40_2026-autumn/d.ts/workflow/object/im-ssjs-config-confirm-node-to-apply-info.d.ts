/**
 * 設定対象確認ノード情報（申請用）オブジェクト。
 *
 * 申請処理時に設定可能な確認ノードが存在する場合に、その確認ノードの情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigConfirmNodeToApplyInfo/index.html
 */
interface ConfigConfirmNodeToApplyInfo extends ConfigNodeInfo {
  // --- NULLABLE プロパティ ---

  /** 確認対象者初期情報オブジェクトの配列 */
  readonly defaultConfirmTargets?: PluginInfo[];
  /** 標準組織設定（表示禁止）の配列 */
  readonly defaultOrgzDisable?: OrgzSetInfo[];
  /** プラグイン設定（表示禁止プラグインID）の配列 */
  readonly pluginParameterDisable?: string[];
}
