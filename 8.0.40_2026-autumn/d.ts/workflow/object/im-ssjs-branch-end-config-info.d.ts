/**
 * 分岐終了設定情報オブジェクト。
 *
 * 案件ノード設定情報（MatterNodeConfigInfo）で「分岐終了設定」情報を保存する為に使用します。
 * 分岐終了方法が「ルール」の場合、ルールID の配列にその情報が保存されます。
 * 分岐終了方法が「ユーザプログラム」の場合、そのプラグイン情報は PluginInfo に保存されています。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchEndConfigInfo/index.html
 */
interface BranchEndConfigInfo {
  // --- NULLABLE プロパティ ---

  /** 分岐合流条件の設定（分岐終了） */
  readonly branchEndAttributeType?: BranchUnionConditionSetting;
  /** ユーザプログラム（プラグイン）の配列（分岐合流条件が「ユーザプログラム」の場合に有効） */
  readonly pluginInfo?: PluginInfo[];
  /** ルールID の配列（分岐合流条件が「ルール」の場合に有効） */
  readonly ruleId?: string[];
}
