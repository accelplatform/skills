/**
 * 振替マネージャ。
 *
 * 未完了案件の処理待ちノードに対して、指定したユーザの振替処理を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TransferManager/index.html
 */
declare class TransferManager {
  /**
   * 指定したシステム案件ID とノードID で振替マネージャを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(systemMatterId: string, nodeId: string);

  /**
   * 指定したロケールID、システム案件ID、ノードID で振替マネージャを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(localeId: string, systemMatterId: string, nodeId: string);

  /**
   * 振替により展開される予定の権限者一覧を取得します。
   *
   * 指定した「振替用パラメータ情報オブジェクト」で、未完了案件の処理権限者に対して振替処理を行う場合の処理対象者一覧を取得します。
   * 指定したパラメータの「実行者コード」と「振替元権限者コード」が異なる場合は、代理での振替処理を行う場合の処理対象者一覧を取得します。
   * 上記以外の場合は、「実行者コード」のユーザ本人での振替処理を行う場合の処理対象者一覧を取得します。
   *
   * @param transferParam 振替用パラメータ情報オブジェクト
   * @return data にタスク実行権限者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getTransferUserList(transferParam: TransferParamInfo): WorkflowResultInfo<ActvExecutableUserInfo[]>;

  /**
   * 振替処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * 指定した「振替用パラメータ情報オブジェクト」で、未完了案件の処理権限者に対して振替処理を行います。
   * 指定したパラメータの「実行者コード」と「振替元権限者コード」が異なる場合は、代理での振替処理を行います。
   * 上記以外の場合は、「実行者コード」のユーザ本人での振替処理を行います。
   *
   * @param transferParam 振替用パラメータ情報オブジェクト
   * @param sendMailFlag 振替通知メール送信フラグ
   * @param noticeComment 振替通知コメント
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  transfer(transferParam: TransferParamInfo, sendMailFlag: boolean, noticeComment: string): WorkflowResultInfo<null>;
}
