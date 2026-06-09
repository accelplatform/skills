/**
 * 設定対象展開済ノード情報オブジェクト。
 *
 * 横配置・縦配置ノードの展開済みノード情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ConfigExpandedNodeInfo/index.html
 */
interface ConfigExpandedNodeInfo extends ConfigNodeInfo {
  // --- NULLABLE プロパティ ---

  /** 処理対象者情報オブジェクトの配列 */
  readonly processTargets?: PluginInfo[];
}
