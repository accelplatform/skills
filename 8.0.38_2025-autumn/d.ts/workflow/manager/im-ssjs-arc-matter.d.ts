/**
 * 案件（過去案件）マネージャ。
 *
 * アーカイブ処理で退避させた過去案件に対して、案件に関連している情報を取得する際に使用します。
 * 案件参照者情報、案件情報、処理履歴、関連する XML ファイル情報等、
 * 複数ノードに関連する情報を取得します。
 * 本オブジェクトでは主に「imw_ayyyymm」で始まるトランザクション系の過去案件のデータベースデータを取得します。
 *
 * 過去案件で特定ノード関連情報を取得するには ArcMatterNode を使用します。
 * 過去案件以外に、処理中の案件や完了案件に対しては ActvMatter、CplMatter を利用してください。
 * 一時保存案件の情報は TempSaveMatter から取得できます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ArcMatter/index.html
 */
declare class ArcMatter {
  /**
   * 案件（過去案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param archiveMonth アーカイブ年月（yyyyMM 形式の文字列）
   */
  constructor(systemMatterId: string, archiveMonth: string);

  /**
   * 案件（過去案件）マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param archiveMonth アーカイブ年月（yyyyMM 形式の文字列）
   */
  constructor(localeId: string, systemMatterId: string, archiveMonth: string);

  /**
   * 指定した添付ファイルのセッションスコープストレージを取得します。
   *
   * セッションスコープストレージは、データベースに登録されている添付ファイルバイナリ情報からインスタンスを生成します。
   * 過去案件テーブルが存在しない場合は null が返却されます。
   *
   * @param systemFileName システムファイル名
   * @return 添付ファイルのセッションスコープストレージ
   */
  getAttachFile(systemFileName: string): SessionScopeStorage;

  /**
   * 過去案件の処理時に添付したファイルの情報をすべて取得します。
   *
   * @return data に案件添付ファイル情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAttachFileList(): WorkflowResultInfo<MatterAttachFileInfo[]>;

  /**
   * 過去案件の処理時に添付したファイルの情報の件数を取得します。
   *
   * @return data に案件添付ファイル情報件数 (number) を格納した WorkflowResultInfo
   */
  getAttachFileListCount(): WorkflowResultInfo<number>;

  /**
   * 過去案件の確認履歴をすべて取得します。
   *
   * @return data に案件確認履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmHistoryList(): WorkflowResultInfo<MatterCnfmHistoryInfo[]>;

  /**
   * 過去案件の確認履歴件数を取得します。
   *
   * @return data に案件確認履歴情報件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmHistoryListCount(): WorkflowResultInfo<number>;

  /**
   * 過去案件の最終処理結果フロー情報「flow.xml」を取得します。
   *
   * 案件フロー情報オブジェクトに設定される案件ノード情報オブジェクトは開始ノードから終了ノードまでの順でソートされます。
   * そのノードで実行可能な処理種別情報が必要な場合には getExecNodeListWithProcessType() を利用してください。
   * XML 文字列で取得するには getExecFlowXML() を利用してください。
   *
   * @return data に案件フロー情報オブジェクトを格納した WorkflowResultInfo
   */
  getExecFlow(): WorkflowResultInfo<MatterFlowInfo>;

  /**
   * 過去案件の最終処理結果フロー情報「flow.xml」を文字列で取得します。
   *
   * オブジェクトで取得するには getExecFlow() を利用してください。
   *
   * @return data に XML 文字列 (string) を格納した WorkflowResultInfo
   */
  getExecFlowXML(): WorkflowResultInfo<string>;

  /**
   * 過去案件の最終処理結果フロー情報「flow.xml」から定義されているノードを、
   * 実施可能な処理種別情報とともにすべて取得します。
   *
   * 取得結果は開始ノードから終了ノードまでの順でソートされます。
   * ノード情報ではなく、フロー情報を取得するには getExecFlow() を利用してください。
   *
   * @return data に案件ノード情報（ノード別処理種別含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getExecNodeListWithProcessType(): WorkflowResultInfo<MatterNodeWithProcessTypeInfo[]>;

  /**
   * 過去案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」情報を取得します。
   *
   * 案件フロー情報オブジェクトに設定される案件ノード情報オブジェクトは開始ノードから終了ノードまでの順でソートされます。
   * そのノードで実行可能な処理種別情報が必要な場合には getMasterNodeListWithProcessType() を利用してください。
   * XML 文字列で取得するには getMasterFlowXML() を利用してください。
   *
   * @return data に案件フロー情報オブジェクトを格納した WorkflowResultInfo
   */
  getMasterFlow(): WorkflowResultInfo<MatterFlowInfo>;

  /**
   * 過去案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」を文字列で取得します。
   *
   * オブジェクトで取得するには getMasterFlow() を利用してください。
   *
   * @return data に XML 文字列 (string) を格納した WorkflowResultInfo
   */
  getMasterFlowXML(): WorkflowResultInfo<string>;

  /**
   * 過去案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」から
   * 定義されているノードを、実施可能な処理種別情報とともにすべて取得します。
   *
   * 取得結果は開始ノードから終了ノードまでの順でソートされます。
   * ノード情報ではなく、マスタフロー情報を取得するには getMasterFlow() を利用してください。
   *
   * @return data に案件ノード情報（ノード別処理種別含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMasterNodeListWithProcessType(): WorkflowResultInfo<MatterNodeWithProcessTypeInfo[]>;

  /**
   * 過去案件情報を取得します。
   *
   * コンストラクタに指定したシステム案件ID、ロケールID とアーカイブ年月で案件情報を取得します。
   *
   * @return data に過去案件情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatter(): WorkflowResultInfo<ArcMatterInfo>;

  /**
   * 過去案件の特定のユーザデータ案件プロパティ情報を取得します。
   *
   * @param key 案件プロパティキー
   * @return data にユーザデータ案件プロパティ情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterProperty(key: string): WorkflowResultInfo<UserMatterPropertyInfo>;

  /**
   * 過去案件のユーザデータ案件プロパティ情報をすべて取得します。
   *
   * @return data にユーザデータ案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyList(): WorkflowResultInfo<UserMatterPropertyInfo[]>;

  /**
   * 過去案件のユーザデータ案件プロパティ情報の件数を取得します。
   *
   * @return data にユーザデータ案件プロパティ情報件数 (number) を格納した WorkflowResultInfo
   */
  getMatterPropertyListCount(): WorkflowResultInfo<number>;

  /**
   * 過去案件の進捗ファイル情報「progress.xml」を取得します。
   *
   * @return data にノード進捗情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodeProgressList(): WorkflowResultInfo<NodeProgressInfo[]>;

  /**
   * 過去案件の処理履歴の最新情報を取得します。
   *
   * 差戻しや引戻し等によって、１つのノードが複数回処理された場合には、
   * 対象ノードに対して最後に処理された最新データのみを取得します。
   * 全ての履歴を取得する場合には getProcessHistoryList() を利用してください。
   *
   * @return data に案件処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessHistoryLatestList(): WorkflowResultInfo<MatterProcessHistoryInfo[]>;

  /**
   * 過去案件の処理履歴をすべて取得します。
   *
   * 取得した結果が複数存在する場合は、処理時間順に返却します。
   * 差戻しや引戻し等によって、１つのノードが複数回処理された場合には、１つのノードに対して複数履歴が取得されます。
   * 各ノードに対して最新履歴のみ取得する場合には getProcessHistoryLatestList() を利用してください。
   *
   * @return data に案件処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessHistoryList(): WorkflowResultInfo<MatterProcessHistoryInfo[]>;

  /**
   * 過去案件の処理履歴件数を取得します。
   *
   * @return data に案件処理履歴情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessHistoryListCount(): WorkflowResultInfo<number>;

  /**
   * 過去案件の参照権限者情報をすべて取得します。
   *
   * 検索結果には「imw_ayyyymm_matter_auth_user」の権限者カラムの「AUTH_USER_CODE」が設定されます。
   *
   * @return data に参照権限者コードの配列を格納した WorkflowResultInfo
   */
  getRefAuthUserList(): WorkflowResultInfo<string[]>;

  /**
   * 過去案件の参照権限者件数を取得します。
   *
   * @return data に参照権限者件数 (number) を格納した WorkflowResultInfo
   */
  getRefAuthUserListCount(): WorkflowResultInfo<number>;
}
