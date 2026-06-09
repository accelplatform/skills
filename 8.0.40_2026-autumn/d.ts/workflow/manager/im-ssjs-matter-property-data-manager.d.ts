/**
 * 案件プロパティ定義情報管理マネージャ。
 *
 * 案件プロパティ情報の取得・新規作成・更新・削除を行うことができます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterPropertyDataManager/index.html
 */
declare class MatterPropertyDataManager {
  /**
   * 案件プロパティ定義情報管理マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 案件プロパティ情報を新規作成します。
   *
   * @param models 案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createMatterPropertyData(models: MatterPropertyDataInfoForCreate[]): WorkflowResultInfo<null>;

  /**
   * 案件プロパティ情報を削除します。
   *
   * @param models 案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteMatterPropertyData(models: MatterPropertyDataInfo[]): WorkflowResultInfo<null>;

  /**
   * 案件プロパティ情報の全ロケール分の件数を取得します。
   *
   * @param matterPropertyKey 案件プロパティキー
   * @return data に件数を格納した WorkflowResultInfo
   */
  getMatterPropertyDataCount(matterPropertyKey: string): WorkflowResultInfo<number>;

  /**
   * 指定したロケールID で案件プロパティ情報の件数を取得します。
   *
   * @param matterPropertyKey 案件プロパティキー
   * @param localeId ロケールID
   * @return data に件数を格納した WorkflowResultInfo
   */
  getMatterPropertyDataCountWithLocale(matterPropertyKey: string, localeId: string): WorkflowResultInfo<number>;

  /**
   * 指定した検索条件で案件プロパティ情報を検索します。
   *
   * @param condition 案件プロパティ一覧情報検索条件オブジェクト
   * @return data に案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyDataList(condition: MatterPropertyDataSearchConditionInfo): WorkflowResultInfo<MatterPropertyDataInfo[]>;

  /**
   * 指定した検索条件で案件プロパティ情報の検索結果件数を取得します。
   *
   * @param condition 案件プロパティ一覧情報検索条件オブジェクト
   * @return data に件数を格納した WorkflowResultInfo
   */
  getMatterPropertyDataListCount(condition: MatterPropertyDataSearchConditionInfo): WorkflowResultInfo<number>;

  /**
   * 案件プロパティ情報を全ロケール分取得します。
   *
   * @param matterPropertyKey 案件プロパティキー
   * @return data に案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyData(matterPropertyKey: string): WorkflowResultInfo<MatterPropertyDataInfo[]>;

  /**
   * 指定したロケールID で案件プロパティ情報を１件取得します。
   * 該当する案件プロパティ情報が見つからなかった場合は、data 属性に null が設定されます。
   *
   * @param matterPropertyKey 案件プロパティキー
   * @param localeId ロケールID
   * @return data に案件プロパティ情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterPropertyDataWithLocale(matterPropertyKey: string, localeId: string): WorkflowResultInfo<MatterPropertyDataInfo>;

  /**
   * 指定した案件プロパティキーと案件プロパティ使用種別で案件プロパティ情報を使用している一覧情報、ルールの件数を取得します。
   *
   * @param matterPropertyKey 案件プロパティキー
   * @param matterPropertyType 案件プロパティ使用種別
   * @return data に件数を格納した WorkflowResultInfo
   */
  getMatterPropertyUseCount(matterPropertyKey: string, matterPropertyType: string): WorkflowResultInfo<number>;

  /**
   * 案件プロパティ情報を更新します。
   *
   * @param models 案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  updateMatterPropertyData(models: MatterPropertyDataInfo[]): WorkflowResultInfo<null>;
}
