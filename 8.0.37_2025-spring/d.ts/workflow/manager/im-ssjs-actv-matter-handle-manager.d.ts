/**
 * 案件操作（未完了案件）マネージャ。
 *
 * 未完了案件に対して、管理者権限で設定情報や処理情報の変更操作を行います。
 * ノードのコピーや削除によるフロー情報変更処理、横・縦配置ノードの初期化や再展開、処理待ちノードの変更、
 * 案件参照者、処理権限者、確認処理権限者の情報変更、管理者権限での強制保留削除等の処理を行うことができます。
 *
 * 本オブジェクトは、未完了案件に対して処理を行います。
 * 完了案件に対して、案件操作を行う場合には CplMatterHandleManager を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvMatterHandleManager/index.html
 */
declare class ActvMatterHandleManager {
  /**
   * 案件操作（未完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param operateUserCode 操作者ユーザコード
   */
  constructor(systemMatterId: string, operateUserCode: string);

  /**
   * 案件操作（未完了案件）マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param operateUserCode 操作者ユーザコード
   */
  constructor(localeId: string, systemMatterId: string, operateUserCode: string);

  /**
   * マスタフローから実行中フローにノードをコピー（追加）します。
   *
   * 確認ノード以外の削除した処理ノードをマスタフローからコピーし復活させることができます。
   *
   * @param masterNodeId マスタノードID
   * @param backwardNodeId 挿入する逆方向ノードID
   * @param forwardNodeId 挿入する順方向ノードID
   * @param copyNodeId コピー（追加）ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  copyNodeFromMasterFlow(masterNodeId: string, backwardNodeId: string, forwardNodeId: string, copyNodeId: string): WorkflowResultInfo<null>;

  /**
   * 未完了案件の操作権限者（参照者）情報を新規追加又は更新します。
   *
   * 追加した未完了案件の操作権限者（参照者）情報を未完了案件に反映するには
   * expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 未完了案件の操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;

  /**
   * ノードに処理対象者情報を追加します。
   *
   * 追加した処理対象者情報を未完了案件に反映するには
   * expandProcessTarget() や expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @param plugins プラグイン情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createProcessTarget(nodeId: string, plugins: PluginInfo[]): WorkflowResultInfo<null>;

  /**
   * 案件操作権限者（参照者）情報を全て削除します。
   *
   * 削除した案件操作権限者（参照者）情報を未完了案件に反映するには
   * expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteMatterHandleAuthAll(): WorkflowResultInfo<null>;

  /**
   * 案件操作権限者（参照者）情報を削除します。
   *
   * 削除した案件操作権限者（参照者）情報を未完了案件に反映するには
   * expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 未完了案件の操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;

  /**
   * 指定されたノードを処理中のフローから削除します。
   *
   * ノード状態が処理中又は処理済の場合、またはノード種別が確認ノードの場合は削除できません。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteNode(nodeId: string): WorkflowResultInfo<null>;

  /**
   * ノードの処理対象者情報をすべて削除します。
   *
   * 削除した処理対象者情報を未完了案件に反映するには
   * expandProcessTarget() や expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteProcessTargetAll(nodeId: string): WorkflowResultInfo<null>;

  /**
   * ノードの処理対象者情報を削除します。
   *
   * 削除した処理対象者情報を未完了案件に反映するには
   * expandProcessTarget() や expandConfirmTarget() で再展開処理を行う必要があります。
   *
   * @param nodeId ノードID
   * @param plugins 処理対象者情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteProcessTarget(nodeId: string, plugins: PluginInfo[]): WorkflowResultInfo<null>;

  /**
   * 未完了案件の確認ノードに対して、確認処理権限者を再展開します。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  expandConfirmTarget(nodeId: string): WorkflowResultInfo<null>;

  /**
   * 指定された案件ノード展開情報を横配置・縦配置ノード内に展開、再展開します。
   *
   * @param horizontalVerticalNodeId 横配置・縦配置ノードID
   * @param nodes 案件ノード展開情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  expandHorizontalVerticalNode(horizontalVerticalNodeId: string, nodes: MatterNodeExpansionInfo[]): WorkflowResultInfo<null>;

  /**
   * 未完了案件に対して、案件操作権限者（参照者）を再展開します。
   *
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  expandMatterHandleAuth(): WorkflowResultInfo<null>;

  /**
   * 未完了案件の処理ノードに対して、処理対象者情報を再展開します。
   *
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  expandProcessTarget(nodeId: string): WorkflowResultInfo<null>;

  /**
   * 特定の処理中のノードから案件操作で移動できるノードとして指定可能な移動先ノード情報を取得します。
   *
   * @param originalNodeId 移動元ノードID
   * @return data に案件ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodesToMove(originalNodeId: string): WorkflowResultInfo<MatterNodeInfo[]>;

  /**
   * 指定された横配置・縦配置ノードを初期化します。
   *
   * @param horizontalVerticalNodeId 横配置・縦配置ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  initializeHorizontalVerticalNode(horizontalVerticalNodeId: string): WorkflowResultInfo<null>;

  /**
   * 未完了案件の処理中のノードの移動処理を行います。
   *
   * 内部でトランザクションの制御処理を行います。
   * メソッドの実行前に、ユーザトランザクションを終了状態にしておく必要があります。
   *
   * @param originalNodeId 移動元ノードID
   * @param targetNodeId 移動先ノードID の配列
   * @param comment コメント
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  moveActvNode(originalNodeId: string, targetNodeId: string[], comment: string): WorkflowResultInfo<null>;

  /**
   * 保留解除処理を実行します。
   *
   * 管理者権限で、指定したノードの保留削除処理を行います。
   * 内部でトランザクションの制御処理を行います。
   *
   * @param reserveCancelParam 保留解除用パラメータ情報オブジェクト
   * @param nodeId ノードID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  reserveCancel(reserveCancelParam: ReserveCancelParamInfo, nodeId: string): WorkflowResultInfo<null>;

  /**
   * 分岐開始ノードからの分岐先ノードを設定します。
   *
   * @param branchStartNodeId 分岐開始ノードID
   * @param branchForwardNodeIds 分岐先ノードID の配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  setBranchForwardNode(branchStartNodeId: string, branchForwardNodeIds: string[]): WorkflowResultInfo<null>;

  /**
   * 未完了案件の操作権限者（参照者）情報を更新します。
   *
   * 更新した未完了案件の操作権限者（参照者）情報を未完了案件に反映するには
   * expandMatterHandleAuth() で再展開処理を行う必要があります。
   *
   * @param matterHandleAuth 未完了案件の操作権限情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  updateMatterHandleAuth(matterHandleAuth: MatterHandleAuthInfo[]): WorkflowResultInfo<null>;
}
