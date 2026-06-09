/**
 * 案件状態マネージャ。
 *
 * コンストラクタに指定する「検索レベル」の範囲で、案件情報や案件プロパティ情報を取得します。
 * 検索レベル「0」: 未完了案件のみ、「1」: 未完了＋完了案件、「2」: 未完了＋完了＋過去案件。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserMatterStatus/index.html
 */
declare class UserMatterStatus {
  /**
   * 指定した検索レベルで案件状態マネージャを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param searchLevel 検索レベル（'0': 未完了, '1': 未完了＋完了, '2': 未完了＋完了＋過去）
   */
  constructor(searchLevel: UserMatterStatus.SearchLevel);

  /**
   * 指定したロケールID、検索レベルで案件状態マネージャを生成します。
   *
   * @param localeId ロケールID
   * @param searchLevel 検索レベル（'0': 未完了, '1': 未完了＋完了, '2': 未完了＋完了＋過去）
   */
  constructor(localeId: string, searchLevel: UserMatterStatus.SearchLevel);

  /**
   * 特定の案件の案件プロパティ状態情報を取得します。
   *
   * コンストラクタに指定した検索レベルの範囲内で、パラメータで指定したユーザデータID の案件プロパティ状態情報を取得します。
   *
   * @param userDataId ユーザデータID
   * @return data に案件プロパティ状態情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterPropertyStatus(userDataId: string): WorkflowResultInfo<UserMatterPropertyStatusInfo>;

  /**
   * 特定の案件の状態と詳細情報を取得します（ユーザデータID 指定）。
   *
   * @param userDataId ユーザデータID
   * @return data に案件状態詳細情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterStatusDetailWithUserDataId(userDataId: string): WorkflowResultInfo<UserMatterStatusDetailInfo>;

  /**
   * 特定の案件の状態と詳細情報を取得します。
   *
   * コンストラクタに指定した検索レベルの範囲内で、パラメータで指定したシステム案件ID の案件状態詳細情報を取得します。
   *
   * @param systemMatterId システム案件ID
   * @return data に案件状態詳細情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterStatusDetail(systemMatterId: string): WorkflowResultInfo<UserMatterStatusDetailInfo>;

  /**
   * 特定の案件の状態を取得します（ユーザデータID 指定）。
   *
   * @param userDataId ユーザデータID
   * @return data に案件状態情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterStatusWithUserDataId(userDataId: string): WorkflowResultInfo<UserMatterStatusInfo>;

  /**
   * 特定の案件の状態を取得します。
   *
   * コンストラクタに指定した検索レベルの範囲内で、パラメータで指定したシステム案件ID の案件状態情報を取得します。
   *
   * @param systemMatterId システム案件ID
   * @return data に案件状態情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterStatus(systemMatterId: string): WorkflowResultInfo<UserMatterStatusInfo>;

  /**
   * システム案件ID を取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にシステム案件ID を格納した WorkflowResultInfo
   */
  getSystemMatterId(userDataId: string): WorkflowResultInfo<string>;
}

declare namespace UserMatterStatus {
  const enum SearchLevel {
    Actv = '0',
    Actv_Cpl = '1',
    Actv_Cpl_Past = '2',
  }
}
