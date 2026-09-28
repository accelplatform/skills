/**
 * 案件（完了案件）マネージャ。
 *
 * 完了した案件に対して、案件に関連している情報を取得する際に使用します。
 * 案件操作権限者情報、確認権限者、案件情報、処理履歴、関連する XML ファイル情報等、
 * 複数ノードに関連する情報を取得します。
 * 本オブジェクトでは主に「imw_t_cpl」で始まるトランザクション系の完了案件のデータベースデータを取得します。
 *
 * 完了した案件で特定ノード関連情報を取得するには CplMatterNode を使用します。
 * 完了案件以外に、処理中の案件や過去案件に対しては ActvMatter、ArcMatter を利用してください。
 * 一時保存案件の情報は TempSaveMatter から取得できます。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CplMatter/index.html
 */
declare class CplMatter {
  // --- getMatterHandleAuthUserList 用のソート条件定数（案件操作権限情報）---

  /** ソートの対象項目：処理対象者変更フラグ */
  static readonly CHANGE_USER_FLAG: 'changeUserFlag';
  /** ソートの対象項目：動的処理ノード削除フラグ */
  static readonly DELETE_DYNAMIC_NODE_FLAG: 'deleteDynamicNodeFlag';
  /** ソートの対象項目：処理対象者展開フラグ */
  static readonly EXPAND_USER_FLAG: 'expandUserFlag';
  /** ソートの対象項目：操作レベル */
  static readonly HANDLE_LEVEL: 'handleLevel';
  /** ソートの対象項目：案件操作後進フラグ */
  static readonly HANDLE_MOVE_BACKWARD_FLAG: 'handleMoveBackwardFlag';
  /** ソートの対象項目：案件操作前進フラグ */
  static readonly HANDLE_MOVE_FORWARD_FLAG: 'handleMoveForwardFlag';
  /** ソートの対象項目：案件操作終了フラグ */
  static readonly HANDLE_TERMINATE_FLAG: 'handleTerminateFlag';
  /** ソートの対象項目：横配置ノード設定フラグ */
  static readonly HORIZONTAL_NODE_CONFIG_FLAG: 'horizontalNodeConfigFlag';
  /** ソートの対象項目：保留解除フラグ */
  static readonly RESERVE_CANCEL_FLAG: 'reserveCancelFlag';
  /** ソートの対象項目：動的処理ノード復活フラグ */
  static readonly UNDELETE_DYNAMIC_NODE_FLAG: 'undeleteDynamicNodeFlag';
  /** ソートの対象項目：縦配置ノード設定フラグ */
  static readonly VERTICAL_NODE_CONFIG_FLAG: 'verticalNodeConfigFlag';

  // --- getCnfmAuthUserList / getMatterHandleAuthUserList 共通ソート条件定数 ---

  /** ソートの対象項目：確認済みフラグ */
  static readonly CONFIRM_CPL_FLAG: 'confirmCplFlag';
  /** ソートの対象項目：ユーザコード */
  static readonly USER_CODE: 'userCode';
  /** ソートの対象項目：ユーザ名 */
  static readonly USER_NAME: 'userName';

  /**
   * 案件（完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   */
  constructor(systemMatterId: string);

  /**
   * 案件（完了案件）マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   */
  constructor(localeId: string, systemMatterId: string);

  /**
   * 指定した添付ファイルのセッションスコープストレージを取得します。
   *
   * セッションスコープストレージは、データベースに登録されている添付ファイルバイナリ情報からインスタンスを生成します。
   * 添付ファイルバイナリ情報が存在しない場合、null が返却されます。
   *
   * @param systemFileName システムファイル名
   * @return 添付ファイルのセッションスコープストレージ
   */
  getAttachFile(systemFileName: string): SessionScopeStorage;

  /**
   * 完了案件の処理時に添付したファイルの情報をすべて取得します。
   *
   * @return data に案件添付ファイル情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAttachFileList(): WorkflowResultInfo<MatterAttachFileInfo[]>;

  /**
   * 完了案件の処理時に添付したファイルの情報の件数を取得します。
   *
   * @return data に案件添付ファイル情報の件数 (number) を格納した WorkflowResultInfo
   */
  getAttachFileListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の確認処理権限者情報をすべて取得します。
   *
   * 検索条件を設定する為の引数である権限者情報ソート条件オブジェクトの設定は必須です。
   * 特に検索条件を設定する必要がない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond ソート条件
   * @return data に確認処理権限者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmAuthUserList(cond: SortConditionForAuthUser): WorkflowResultInfo<CnfmAuthUserInfo[]>;

  /**
   * 完了案件の確認処理権限者情報の件数を取得します。
   *
   * @return data に確認処理権限者情報件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmAuthUserListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の確認履歴をすべて取得します。
   *
   * 確認ノードが複数ある場合は、全確認ノード分取得します。
   * 取得結果は確認時間順でソートされます。
   *
   * @return data に案件確認履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmHistoryList(): WorkflowResultInfo<MatterCnfmHistoryInfo[]>;

  /**
   * 完了案件の確認履歴の件数を取得します。
   *
   * 確認ノードが複数ある場合は、全確認ノード分の件数を取得します。
   *
   * @return data に案件確認履歴情報件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmHistoryListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の最終処理結果フロー情報「flow.xml」を取得します。
   *
   * 案件フロー情報オブジェクトに設定される案件ノード情報オブジェクトは開始ノードから終了ノードまでの順でソートされます。
   * そのノードで実行可能な処理種別情報が必要な場合には getExecNodeListWithProcessType() を利用してください。
   * XML 文字列で取得するには getExecFlowXML() を利用してください。
   *
   * @return data に案件フロー情報オブジェクトを格納した WorkflowResultInfo
   */
  getExecFlow(): WorkflowResultInfo<MatterFlowInfo>;

  /**
   * 完了案件の最終処理結果フロー情報「flow.xml」を文字列で取得します。
   *
   * オブジェクトで取得するには getExecFlow() を利用してください。
   *
   * @return data に XML 文字列 (string) を格納した WorkflowResultInfo
   */
  getExecFlowXML(): WorkflowResultInfo<string>;

  /**
   * 完了案件の最終処理結果フロー情報「flow.xml」から定義されているノードを、
   * 実施可能な処理種別情報とともにすべて取得します。
   *
   * 取得結果は開始ノードから終了ノードまでの順でソートされます。
   * ノード情報ではなく、フロー情報を取得するには getExecFlow() を利用してください。
   *
   * @return data に案件ノード情報（ノード別処理種別含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getExecNodeListWithProcessType(): WorkflowResultInfo<MatterNodeWithProcessTypeInfo[]>;

  /**
   * 完了案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」情報を取得します。
   *
   * 案件フロー情報オブジェクトに設定される案件ノード情報オブジェクトは開始ノードから終了ノードまでの順でソートされます。
   * そのノードで実行可能な処理種別情報が必要な場合には getMasterNodeListWithProcessType() を利用してください。
   * XML 文字列で取得するには getMasterFlowXML() を利用してください。
   *
   * @return data に案件フロー情報オブジェクトを格納した WorkflowResultInfo
   */
  getMasterFlow(): WorkflowResultInfo<MatterFlowInfo>;

  /**
   * 完了案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」を文字列で取得します。
   *
   * オブジェクトで取得するには getMasterFlow() を利用してください。
   *
   * @return data に XML 文字列 (string) を格納した WorkflowResultInfo
   */
  getMasterFlowXML(): WorkflowResultInfo<string>;

  /**
   * 完了案件の申請・起票時の初期フロー設定情報であるマスタフロー「masterflow.xml」から
   * 定義されているノードを、実施可能な処理種別情報とともにすべて取得します。
   *
   * 取得結果は開始ノードから終了ノードまでの順でソートされます。
   * ノード情報ではなく、マスタフロー情報を取得するには getMasterFlow() を利用してください。
   *
   * @return data に案件ノード情報（ノード別処理種別含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMasterNodeListWithProcessType(): WorkflowResultInfo<MatterNodeWithProcessTypeInfo[]>;

  /**
   * 完了案件情報を取得します。
   *
   * コンストラクタに指定したシステム案件ID とロケールID で案件情報を取得します。
   *
   * @return data に完了案件情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatter(): WorkflowResultInfo<CplMatterInfo>;

  /**
   * 完了案件の案件操作権限者情報を取得します。
   *
   * パラメータで指定した人の情報のみを取得します。
   * 全ユーザのデータを取得するには getMatterHandleAuthUserList() を利用してください。
   *
   * @param matterHandleUserCd 案件操作権限者コード
   * @return data に案件操作権限者情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterHandleAuthUser(matterHandleUserCd: string): WorkflowResultInfo<MatterHandleAuthUserInfo>;

  /**
   * 完了案件の案件操作権限者情報をすべて取得します。
   *
   * 検索条件を設定する為の引数である権限者情報ソート条件オブジェクトの設定は必須です。
   * 特に検索条件を設定する必要がない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond ソート条件
   * @return data に案件操作権限情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterHandleAuthUserList(cond: SortConditionForAuthUser): WorkflowResultInfo<MatterHandleAuthUserInfo[]>;

  /**
   * 完了案件の案件操作権限者情報の件数を取得します。
   *
   * @return data に案件操作権限情報件数 (number) を格納した WorkflowResultInfo
   */
  getMatterHandleAuthUserListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の特定のユーザデータ案件プロパティ情報を取得します。
   *
   * @param key 案件プロパティキー
   * @return data にユーザデータ案件プロパティ情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterProperty(key: string): WorkflowResultInfo<UserMatterPropertyInfo>;

  /**
   * 完了案件のユーザデータ案件プロパティ情報をすべて取得します。
   *
   * @return data にユーザデータ案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyList(): WorkflowResultInfo<UserMatterPropertyInfo[]>;

  /**
   * 完了案件のユーザデータ案件プロパティ情報の件数を取得します。
   *
   * @return data にユーザデータ案件プロパティ情報件数 (number) を格納した WorkflowResultInfo
   */
  getMatterPropertyListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の進捗ファイル情報「progress.xml」を取得します。
   *
   * @return data にノード進捗情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodeProgressList(): WorkflowResultInfo<NodeProgressInfo[]>;

  /**
   * 完了案件の処理履歴をすべて取得します。
   *
   * 取得した結果が複数存在する場合は、処理時間順に返却します。
   * 差戻しや引戻し等によって、１つのノードが複数回処理された場合には、１つのノードに対して複数履歴が取得されます。
   * 各ノードに対して最新履歴のみ取得する場合には getProcessHistoryLatestList() を利用してください。
   *
   * @return data に案件処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessHistoryList(): WorkflowResultInfo<MatterProcessHistoryInfo[]>;

  /**
   * 完了案件の処理履歴件数を取得します。
   *
   * @return data に案件処理履歴情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessHistoryListCount(): WorkflowResultInfo<number>;

  /**
   * 完了案件の処理履歴の最新情報を取得します。
   *
   * 差戻しや引戻し等によって、１つのノードが複数回処理された場合には、
   * 対象ノードに対して最後に処理された最新データのみを取得します。
   * 全ての履歴を取得する場合には getProcessHistoryList() を利用してください。
   *
   * @return data に案件処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessHistoryLatestList(): WorkflowResultInfo<MatterProcessHistoryInfo[]>;
}
