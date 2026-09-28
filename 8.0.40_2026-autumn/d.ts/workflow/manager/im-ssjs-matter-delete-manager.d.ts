/**
 * 案件削除マネージャオブジェクト。
 *
 * 未完了、完了、過去案件の削除処理を行います。
 * 各テーブルから該当する案件データを削除し、削除した情報を履歴として残します。
 *
 * １件の案件削除処理時には案件のフロー情報に定義されている案件削除リスナーが実行されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterDeleteManager/index.html
 */
declare class MatterDeleteManager {
  /**
   * 案件削除マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 未完了案件を削除します。
   *
   * 指定したシステム案件ID に紐づく未完了案件を削除します。
   * 削除処理後に、元に戻すことはできません。
   *
   * 削除対象の案件が存在する場合、削除処理を実行する前に、未完了案件削除リスナーの実行処理を行います。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param systemMatterId システム案件ID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteActvMatter(systemMatterId: string): WorkflowResultInfo<null>;

  /**
   * 過去案件を１件削除します。
   *
   * 指定したシステム案件ID に該当する過去案件が指定したアーカイブ年月に存在する場合、
   * そのデータベースやトランザクションファイルの全てのデータを削除します。
   * 削除処理後に、元に戻すことはできません。
   *
   * 削除対象の案件が存在する場合、削除処理を実行する前に、過去案件削除リスナーの実行処理を行います。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param systemMatterId システム案件ID
   * @param archiveMonth アーカイブ年月（yyyyMM）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteArcMatter(systemMatterId: string, archiveMonth: string): WorkflowResultInfo<null>;

  /**
   * 過去案件を削除します。
   *
   * 指定したアーカイブ年月（yyyyMM）に該当する過去案件が存在する場合、
   * その全ての案件のデータベースやトランザクションファイルを削除します。
   * 削除処理後に、元に戻すことはできません。
   *
   * このメソッドでは、過去案件削除リスナーの実行処理は行いません。
   * 過去案件削除リスナーの実行処理とともに削除するには deleteArcMatter(String, String) を利用して
   * １件ずつ案件を削除する必要があります。
   *
   * このメソッドでは内部でトランザクション制御を行なっていませんが、
   * データベースのデータ削除処理は、テーブルの「DROP TABLE」で行なっています。
   *
   * @param archiveMonth アーカイブ年月（yyyyMM）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteArcMatterTargetYearMonth(archiveMonth: string): WorkflowResultInfo<null>;

  /**
   * 完了案件を削除します。
   *
   * 指定したシステム案件ID に紐づく完了案件を削除します。
   * 削除処理後に、元に戻すことはできません。
   *
   * 削除対象の案件が存在する場合、削除処理を実行する前に、完了案件削除リスナーの実行処理を行います。
   *
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param systemMatterId システム案件ID
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteCplMatter(systemMatterId: string): WorkflowResultInfo<null>;
}
