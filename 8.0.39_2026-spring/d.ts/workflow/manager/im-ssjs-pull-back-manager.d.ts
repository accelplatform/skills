/**
 * 引戻しマネージャ。
 *
 * 案件の引戻し処理および引戻し可能なノード情報の取得を行うことができます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/PullBackManager/index.html
 */
declare class PullBackManager {
  /**
   * 指定したシステム案件ID で引戻しマネージャを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   */
  constructor(systemMatterId: string);

  /**
   * 指定したロケールID、システム案件ID で引戻しマネージャを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   */
  constructor(localeId: string, systemMatterId: string);

  /**
   * 指定したユーザが引戻し可能な案件ノード情報を取得します。
   *
   * @param executeUserCode 実行者コード
   * @return data に案件ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodesToPullBack(executeUserCode: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * 引戻し処理を実行します。
   *
   * 内部でトランザクション制御を行うため、呼び出し前にユーザトランザクションを終了状態にしてください。
   *
   * @param pullBackParam 引戻し用パラメータ情報オブジェクト
   * @param userParam ユーザデータ保存用情報オブジェクト（プロパティ形式で定義）
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  pullBack(pullBackParam: PullBackParamInfo, userParam: PullBackManager.UserParam): WorkflowResultInfo<null>;
}

declare namespace PullBackManager {
  type UserParam = { [key: string]: any };
}
