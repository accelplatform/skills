/**
 * 選択分岐開始設定情報オブジェクト。
 *
 * 分岐開始設定情報（BranchStartConfigInfo）で、分岐開始方法が「実行時選択」の場合、
 * 分岐先の選択が可能なノード情報を保存する時に使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchStartSelectConfigInfo/index.html
 */
interface BranchStartSelectConfigInfo {
  // --- NULLABLE プロパティ ---

  /** 複数分岐設定フラグ（'0': 否 / '1': 可） */
  readonly multipleBranchFlag?: FlagStatus;
  /** 分岐先設定可能ノードID */
  readonly selectableNodeId?: string;
}
