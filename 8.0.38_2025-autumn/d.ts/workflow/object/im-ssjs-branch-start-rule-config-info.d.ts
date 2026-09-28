/**
 * ルール定義分岐開始設定情報オブジェクト。
 *
 * 分岐開始設定情報（BranchStartConfigInfo）で、分岐開始方法が「ルール」の場合、
 * 分岐先ノードID に対したルール情報を保存する時に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchStartRuleConfigInfo/index.html
 */
interface BranchStartRuleConfigInfo {
  // --- NULLABLE プロパティ ---

  /** 分岐ノードID */
  readonly nodeId?: string;
  /** ルールID の配列 */
  readonly ruleId?: string[];
}
