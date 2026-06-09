/**
 * 案件操作権限情報オブジェクト。
 *
 * フローの案件操作の権限者情報（参照者情報）を保持します。
 * 権限者情報はプラグイン情報 PluginInfo に保存されています。
 * その権限者が持つ権限情報がそれぞれの項目に保存されています。
 * 操作権限を持ってないユーザが参照者になります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterHandleAuthInfo/index.html
 */
interface MatterHandleAuthInfo {
  // --- 必須項目 ---

  /** 処理対象者変更可否フラグ（'0': 否 / '1': 可） */
  changeUserFlag: FlagStatus;
  /** 動的処理ノード削除可否フラグ（'0': 否 / '1': 可） */
  deleteDynamicNodeFlag: FlagStatus;
  /** 処理対象者展開可否フラグ（'0': 否 / '1': 可） */
  expandUserFlag: FlagStatus;
  /** 操作レベル */
  handleLevel: HandleLevel;
  /** 案件操作後進可否フラグ（'0': 否 / '1': 可） */
  handleMoveBackwardFlag: FlagStatus;
  /** 案件操作前進可否フラグ（'0': 否 / '1': 可） */
  handleMoveForwardFlag: FlagStatus;
  /** 案件操作終了可否フラグ（'0': 否 / '1': 可） */
  handleTerminateFlag: FlagStatus;
  /** 横配置ノード設定可否フラグ（'0': 否 / '1': 可） */
  horizontalNodeConfigFlag: FlagStatus;
  /** 案件操作権限者（プラグイン情報）オブジェクト */
  matterHandleUserInfo: PluginInfo;
  /** 保留解除可否フラグ（'0': 否 / '1': 可） */
  reserveCancelFlag: FlagStatus;
  /** 動的処理ノード復活可否フラグ（'0': 否 / '1': 可） */
  undeleteDynamicNodeFlag: FlagStatus;
  /** 縦配置ノード設定可否フラグ（'0': 否 / '1': 可） */
  verticalNodeConfigFlag: FlagStatus;
}
