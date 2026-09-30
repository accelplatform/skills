/**
 * 分岐先選択情報オブジェクト。
 *
 * 申請・再申請・承認処理時に、分岐先の開始方法が「実行時選択」の分岐開始ノードに対して、
 * 分岐先として指定するノードのID を保存します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchSelectInfo/index.html
 */
interface BranchSelectInfo {
  // --- 任意項目 ---

  /** 分岐開始ノードID */
  branchStartNodeId?: string;
  /** 分岐先ノードID の配列 */
  forwardNodeIds?: string[];
}
