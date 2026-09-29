/**
 * 分岐結合条件設定。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#BranchUnionConditionSetting
 */
declare const BranchUnionConditionSetting: {
  /** 処理時に分岐先を選択 */
  readonly branchUnionCondSet_ChoiceOnRuntime: '0';
  /** ルール */
  readonly branchUnionCondSet_Rule: '1';
  /** ユーザプログラム */
  readonly branchUnionCondSet_UserProgram: '2';
  /** 設定しない */
  readonly branchUnionCondSet_NotSetting: '3';
};

type BranchUnionConditionSetting = (typeof BranchUnionConditionSetting)[keyof typeof BranchUnionConditionSetting];
