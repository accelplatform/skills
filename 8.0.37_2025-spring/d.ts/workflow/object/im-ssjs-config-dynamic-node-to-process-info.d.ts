/**
 * 設定対象動的承認ノード情報（処理用）オブジェクト。
 *
 * 承認等の処理時に設定可能な動的承認ノードが存在する場合に、その動的承認ノードの情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigDynamicNodeToProcessInfo/index.html
 */
interface ConfigDynamicNodeToProcessInfo extends ConfigNodeInfo {
  // --- NULLABLE プロパティ ---

  /** 標準組織設定（表示禁止）の配列 */
  readonly defaultOrgzDisable?: OrgzSetInfo[];
  /** 処理対象者初期情報オブジェクトの配列 */
  readonly defaultProcessTargets?: PluginInfo[];
  /** 削除禁止フラグ（'0': 削除許可 / '1': 削除禁止） */
  readonly deleteDisableFlag?: FlagStatus;
  /** プラグイン設定（表示禁止プラグインID）の配列 */
  readonly pluginParameterDisable?: string[];
  /** 処理対象者情報オブジェクトの配列 */
  readonly processTargets?: PluginInfo[];
  /** 有効フラグ（'0': 無効 / '1': 有効） */
  readonly validFlag?: FlagStatus;
}
