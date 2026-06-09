/**
 * ユーザプログラム分岐開始設定情報オブジェクト。
 *
 * 分岐開始設定情報（BranchStartConfigInfo）で、分岐開始方法が「ユーザプログラム」の場合、
 * 分岐先ノードID に対したユーザプログラム情報を保存する時に使用します。
 * ユーザプログラムのプラグイン情報は PluginInfo に保存されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchStartUserProgramConfigInfo/index.html
 */
interface BranchStartUserProgramConfigInfo {
  // --- NULLABLE プロパティ ---

  /** 分岐ノードID */
  readonly nodeId?: string;
  /** ユーザプログラム（プラグイン）の配列 */
  readonly pluginInfo?: PluginInfo[];
}
