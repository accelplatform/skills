/**
 * 案件操作（完了案件）マネージャ。
 *
 * 完了案件に対して、管理者権限で設定情報の変更操作を行います。
 * 案件参照者、確認処理権限者の情報変更等の処理を行うことができます。
 *
 * 本オブジェクトは、完了案件に対して処理を行います。
 * 未完了案件に対して、案件操作を行う場合には ActvMatterHandleManager を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CplMatterHandleManager/index.html
 */
declare class CplMatterHandleManager {
  /**
   * 案件操作（完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param operateUserCode 操作者ユーザコード
   */
  constructor(systemMatterId: string, operateUserCode: string);

  /**
   * 案件操作（完了案件）マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param operateUserCode 操作者ユーザコード
   */
  constructor(localeId: string, systemMatterId: string, operateUserCode: string);

  /**
   * 案件操作（完了案件）マネージャのインスタンスを生成します。
   *
   * 追加した処理権限者情報を完了案件に反映するには expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @param plugins 処理対象者情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo
   */
  createConfirmTarget(nodeId: string, plugins: PluginInfo[]): WorkflowResultInfo<null>;

  /**
   * 完了案件に対して、案件操作権限者（参照者）情報を新規追加又は更新します。
   *
   * 追加した案件操作権限者（参照者）情報を完了案件に反映するには expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 案件操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo
   */
  createMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;

  /**
   * 完了案件の確認ノードの処理権限者情報をすべて削除します。
   *
   * 削除した処理権限者情報を完了案件に反映するには expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo
   */
  deleteConfirmTargetAll(nodeId: string): WorkflowResultInfo<null>;

  /**
   * 完了案件の確認ノードの処理権限者情報を削除します。
   *
   * 削除した処理権限者情報を完了案件に反映するには expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @param plugins 処理対象者情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo
   */
  deleteConfirmTarget(nodeId: string, plugins: PluginInfo[]): WorkflowResultInfo<null>;

  /**
   * 完了案件に対して、案件操作権限者（参照者）情報を全て削除します。
   *
   * 削除した案件操作権限者（参照者）情報を完了案件に反映するには expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @return data に null を格納した WorkflowResultInfo
   */
  deleteMatterHandleAuthAll(): WorkflowResultInfo<null>;

  /**
   * 完了案件に対して、案件操作権限者（参照者）情報を削除します。
   *
   * 削除した案件操作権限者（参照者）情報を完了案件に反映するには expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 案件操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo
   */
  deleteMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;

  /**
   * 完了案件の確認ノードに対して、確認処理権限者を再展開します。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo
   */
  expandConfirmTarget(nodeId: string): WorkflowResultInfo<null>;

  /**
   * 完了案件に対して、案件操作権限者（参照者）を再展開します。
   *
   * @return data に null を格納した WorkflowResultInfo
   */
  expandMatterHandleAuth(): WorkflowResultInfo<null>;

  /**
   * 完了案件に対して、案件操作権限者（参照者）情報を更新します。
   *
   * 更新した案件操作権限者（参照者）情報を完了案件に反映するには expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 案件操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo
   */
  updateMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;
}
