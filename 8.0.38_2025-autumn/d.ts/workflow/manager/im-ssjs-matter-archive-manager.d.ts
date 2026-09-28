/**
 * 案件アーカイブマネージャオブジェクト。
 *
 * 特定１つの完了した案件の退避処理を行うことができます。
 * 既に退避した案件に対して、参照可能なユーザの追加や削除処理も行えます。
 *
 * 本オブジェクトで行われる退避処理では、案件退避リスナーは実行されません。
 * 案件退避リスナーの実行と共に退避処理を行うには、案件退避バッチを利用する必要があります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterArchiveManager/index.html
 */
declare class MatterArchiveManager {
  /**
   * 案件アーカイブマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 過去案件参照可能ユーザを追加します。
   *
   * 案件退避処理で作成した過去案件に対して、参照できるユーザを
   * 権限者テーブル「imw_ayyyymm_matter_auth_user」に追加します。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param archiveMonth アーカイブ年月（yyyyMM）
   * @param systemMatterId システム案件ID
   * @param flowId フローID
   * @param referableUserCd 過去案件参照可能ユーザコードの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  // TODO: API ドキュメントでは戻り値は void となっているが、実際は WorkflowResultInfo<null> が返却される
  addReferableUser(archiveMonth: string, systemMatterId: string, flowId: string, referableUserCd: string[]): WorkflowResultInfo<null>;

  /**
   * 指定した完了案件の退避処理を行います。
   *
   * 「imw_t_cpl_」で始まる完了案件関連テーブルのデータを「imw_ayyyymm_」で始まる
   * 過去案件関連テーブルへのデータ移行処理を行います。
   *
   * 本メソッドで案件退避処理を行う時には、グループ単位で設定したリスナーや、
   * フローで設定した案件退避処理は動作しません。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param systemMatterId システム案件ID
   * @param referableUserCd 過去案件参照可能ユーザコードの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  archive(systemMatterId: string, referableUserCd: string[]): WorkflowResultInfo<null>;

  /**
   * 過去案件参照可能ユーザを新規作成します。
   *
   * @deprecated addReferableUser(String, String, String, Array) を使用してください
   * @param archiveMonth アーカイブ年月（yyyyMM）
   * @param systemMatterId システム案件ID
   * @param referableUserCd 過去案件参照可能ユーザコードの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createReferableUser(archiveMonth: string, systemMatterId: string, referableUserCd: string[]): WorkflowResultInfo<null>;

  /**
   * 過去案件参照可能ユーザを削除します。
   *
   * 権限者テーブル「imw_ayyyymm_matter_auth_user」から参照できるユーザを削除します。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param archiveMonth アーカイブ年月（yyyyMM）
   * @param systemMatterId システム案件ID
   * @param referableUserCd 過去案件参照可能ユーザコードの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteReferableUser(archiveMonth: string, systemMatterId: string, referableUserCd: string[]): WorkflowResultInfo<null>;
}
