/**
 * 処理マネージャ。
 *
 * 案件の処理に必要な情報の取得や、再申請、承認、承認終了、否認、取止め、差戻し、保留、保留削除の処理を行うことができます。
 * 引戻しの処理については、引戻しマネージャ PullBackManager を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessManager/index.html
 */
declare class ProcessManager {
  /**
   * 指定したシステム案件ID とノードID で処理マネージャを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(systemMatterId: string, nodeId: string);

  /**
   * 指定したロケールID、システム案件ID、ノードID で処理マネージャを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(localeId: string, systemMatterId: string, nodeId: string);

  /**
   * 未申請状態の案件の申請処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param applyFromUnapplyParam 起票案件申請用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  applyFromUnapply(applyFromUnapplyParam: ApplyFromUnapplyParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 承認終了処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param approveEndParam 承認終了用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  approveEnd(approveEndParam: ApproveEndParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 承認処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param approveParam 承認用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  approve(approveParam: ApproveParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 否認処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param denyParam 否認用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deny(denyParam: DenyParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 取止め処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param discontinueParam 取止め用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  discontinue(discontinueParam: DiscontinueParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 指定したユーザの未完了案件に対する処理権限者の所属組織情報を取得します。
   *
   * @param authUserCode 権限者コード
   * @return data に処理権限者所属組織情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAuthUserOrgz(authUserCode: string): WorkflowResultInfo<AuthUserOrgzInfo[]>;

  /**
   * 指定したユーザの未完了案件に対する処理権限者情報を取得します。
   *
   * @param executeUserCode 実行者コード
   * @return data に処理権限者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAuthUser(executeUserCode: string): WorkflowResultInfo<ActvExecutableUserInfo[]>;

  /**
   * 処理を行う際に設定が必要なノード情報と処理・確認対象者関連情報を取得します。
   *
   * @return data に設定対象ノードセット情報（処理用）を格納した WorkflowResultInfo
   */
  getConfigSetToProcessWithProcessTarget(): WorkflowResultInfo<NodeConfigSetToProcessInfo>;

  /**
   * 承認等の処理を行う際に処理権限者等の設定が可能なノード情報を取得します（初期値処理権限者情報は含まない）。
   *
   * @return data に設定対象ノードセット情報（処理用）を格納した WorkflowResultInfo
   */
  getConfigSetToProcess(): WorkflowResultInfo<NodeConfigSetToProcessInfo>;

  /**
   * 特定のノードから差戻し可能なノード情報を取得します。
   *
   * @return data に案件ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodesToSendBack(): WorkflowResultInfo<MatterNodeInfo[]>;

  /**
   * パラメータで指定したユーザが対象案件のノードで処理を実行できるか判定します。
   *
   * @param executeUserCode 実行者コード
   * @return data に処理可否判定結果（true: 処理可能 / false: 処理不可能）を格納した WorkflowResultInfo
   */
  isPossibleToProcess(executeUserCode: string): WorkflowResultInfo<boolean>;

  /**
   * 再申請処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param reapplyParam 再申請用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  reapply(reapplyParam: ReapplyParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 保留解除処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param reserveCancelParam 保留解除用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  reserveCancel(reserveCancelParam: ReserveCancelParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 保留処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param reserveParam 保留用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  reserve(reserveParam: ReserveParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 差戻し処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param sendBackParam 差戻し用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  sendBack(sendBackParam: SendBackParamInfo, userParam: ProcessManager.UserParam): WorkflowResultInfo<null>;
}

declare namespace ProcessManager {
  type UserParam = { [key: string]: any };
}
