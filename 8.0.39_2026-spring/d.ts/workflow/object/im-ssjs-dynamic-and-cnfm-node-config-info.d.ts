/**
 * 動的・確認ノード設定情報オブジェクト。
 *
 * 再申請・申請・承認時に動的承認ノードと確認ノードの処理権限者設定情報を保持します。
 *
 * processTargetConfigs に設定する値によって動作が異なります。
 * - null: 対象ノードを削除
 * - 空配列: 対象ノードに対象者なしを設定
 * - 配列: 対象ノードに対象者を設定
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/DynamicAndCnfmNodeConfigInfo/index.html
 */
interface DynamicAndCnfmNodeConfigInfo {
  // --- 必須項目 ---

  /** ノードID（最大20バイト） */
  nodeId: string;

  // --- 任意項目 ---

  /** 処理対象設定（プラグイン情報）オブジェクトの配列 */
  processTargetConfigs?: PluginInfo[] | null;
}
