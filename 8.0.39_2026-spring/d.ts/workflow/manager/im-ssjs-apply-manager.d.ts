/**
 * 申請マネージャ。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApplyManager/index.html
 */
declare class ApplyManager {
  /**
   * 指定したロケールID で申請マネージャを生成します。
   *
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(localeId?: string);

  /**
   * 申請処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param applyParam 申請用パラメータ情報
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に申請結果情報オブジェクトを格納した WorkflowResultInfo
   */
  apply(applyParam: ApplyParamInfo, userParam: ApplyManager.UserParam): WorkflowResultInfo<ApplyResultInfo>;

  /**
   * 起票案件を新規登録します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param draftParam 起票用パラメータ情報
   * @return data に申請結果情報オブジェクトを格納した WorkflowResultInfo
   */
  draft(draftParam: DraftParamInfo): WorkflowResultInfo<ApplyResultInfo>;

  /**
   * 特定のユーザが特定のフローで案件を申請する際に選択可能な所属組織情報を取得します。
   *
   * @param flowId フローID
   * @param baseDate 申請基準日（'yyyy/MM/dd' 形式）
   * @param authUserCd 権限者コード
   * @return data に権限者所属組織情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAuthUserOrgz(flowId: string, baseDate: string, authUserCd: string): WorkflowResultInfo<AuthUserOrgzInfo[]>;

  /**
   * 申請を行う際に処理権限者等の設定が可能なノード情報を、初期値で設定した処理権限者情報と共に取得します。
   *
   * @param flowId フローID
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式）
   * @return data に設定対象ノードセット情報（申請用）を格納した WorkflowResultInfo
   */
  getConfigSetToApplyWithProcessTarget(flowId: string, applyBaseDate: string): WorkflowResultInfo<NodeConfigSetToApplyInfo>;

  /**
   * 申請を行う際に処理権限者等の設定が可能なノード情報を取得します（初期値処理権限者情報は含まない）。
   *
   * @param flowId フローID
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式）
   * @return data に設定対象ノードセット情報（申請用）を格納した WorkflowResultInfo
   */
  getConfigSetToApply(flowId: string, applyBaseDate: string): WorkflowResultInfo<NodeConfigSetToApplyInfo>;
}

declare namespace ApplyManager {
  type UserParam = { [key: string]: any };
}
