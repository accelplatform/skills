/**
 * 一時保存マネージャオブジェクト。
 *
 * 一時保存案件を新規作成、更新、削除処理ができます。
 * このオブジェクトでは、データベーステーブル「imw_t_temporary_save」への処理を行なっています。
 *
 * 新規作成、更新、削除の各処理を実行する際に、処理対象フローの申請ノードに指定したアクション処理が実行されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TempSaveManager/index.html
 */
declare class TempSaveManager {
  /**
   * 一時保存マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   */
  constructor();

  /**
   * 一時保存マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   */
  constructor(localeId: string);

  /**
   * 一時保存案件を新規作成します。
   *
   * 内部でトランザクションの制御処理を行います。
   * メソッドの実行前に、ユーザトランザクションを終了状態にして置く必要があります。
   *
   * 対象のフローの申請ノードに設定されているアクション処理が、
   * データベースに一時保存データを登録する前に実行されます。
   *
   * @param tempSaveParam 一時保存用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createTempSaveMatter(tempSaveParam: TempSaveParamInfo, userParam: TempSaveManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 一時保存案件を更新します。
   *
   * 内部でトランザクションの制御処理を行います。
   * メソッドの実行前に、ユーザトランザクションを終了状態にして置く必要があります。
   *
   * 更新処理は「ユーザデータID」をキーにして行います。
   * 値が設定されてない項目は更新対象外になります。
   *
   * @param tempSaveParam 一時保存用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  updateTempSaveMatter(tempSaveParam: TempSaveParamInfo, userParam: TempSaveManager.UserParam): WorkflowResultInfo<null>;

  /**
   * 一時保存案件を削除します。
   *
   * 内部でトランザクションの制御処理を行います。
   * メソッドの実行前に、ユーザトランザクションを終了状態にして置く必要があります。
   *
   * 削除処理は「ユーザデータID」をキーにして行います。
   * パラメータの「ユーザデータID」項目以外のデータは設定しても無視されます。
   *
   * @param tempSaveParam 一時保存用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteTempSaveMatter(tempSaveParam: TempSaveParamInfo, userParam: TempSaveManager.UserParam): WorkflowResultInfo<null>;
}

declare namespace TempSaveManager {
  type UserParam = { [key: string]: any };
}
