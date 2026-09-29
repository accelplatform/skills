/**
 * 設定対象縦配置ノード情報（申請用）オブジェクト。
 *
 * 申請処理時に設定可能な縦配置ノードが存在する場合に、その縦配置ノードの情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigVerticalNodeToApplyInfo/index.html
 */
interface ConfigVerticalNodeToApplyInfo extends ConfigNodeInfo {
  // --- NULLABLE プロパティ ---

  /** 標準組織設定（表示禁止）の配列 */
  readonly defaultOrgzDisable?: OrgzSetInfo[];
  /** 処理対象者初期情報オブジェクトの配列 */
  readonly defaultProcessTargets?: PluginInfo[];
  /** 割当可能ノード数（最大） */
  // TODO: typo については、後方互換のために修正していません
  readonly dispachNodeMax?: string;
  /** 割当可能ノード数（最小） */
  // TODO: typo については、後方互換のために修正していません
  readonly dispachNodeMin?: string;
  /** プラグイン設定（表示禁止プラグインID）の配列 */
  readonly pluginParameterDisable?: string[];
}
