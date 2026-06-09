/**
 * 分岐開始設定情報オブジェクト。
 *
 * 案件ノード設定情報（MatterNodeConfigInfo）で「分岐開始設定」情報を保存する為に使用します。
 * 分岐開始方法が「実行時選択」の場合、選択済みのID が「選択済みノードID」に保存されます。
 * 分岐先の選択が可能なノード情報が BranchStartSelectConfigInfo に保存されます。
 * 分岐開始方法が「ルール」の場合、分岐先ノードID に対したルール情報が BranchStartRuleConfigInfo に保存されます。
 * 分岐開始方法が「ユーザプログラム」の場合、分岐先ノードID に対したユーザプログラムプラグイン情報が BranchStartUserProgramConfigInfo に保存されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/BranchStartConfigInfo/index.html
 */
interface BranchStartConfigInfo {
  // --- NULLABLE プロパティ ---

  /** 分岐条件の設定（分岐開始） */
  readonly branchStartAttributeType?: BranchUnionConditionSetting;
  /** 選択済みノードID の配列（分岐開始方法が「実行時選択」の場合に有効） */
  readonly choicedNodeIds?: string[];
  /** 分岐先ルール設定情報の配列（分岐開始方法が「ルール」の場合に有効） */
  readonly ruleConfig?: BranchStartRuleConfigInfo[];
  /** 分岐先選択設定情報の配列（分岐開始方法が「実行時選択」の場合に有効） */
  readonly selectConfig?: BranchStartSelectConfigInfo[];
  /** 分岐先ユーザプログラム設定情報の配列（分岐開始方法が「ユーザプログラム」の場合に有効） */
  readonly userProgramConfig?: BranchStartUserProgramConfigInfo[];
}
