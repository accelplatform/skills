/**
 * 一時保存案件マネージャ。
 *
 * 申請前の一時保存案件に対して、案件に関連している情報を取得する際に使用します。
 * 一時保存情報やユーザデータ案件プロパティ情報の取得ができます。
 * 本オブジェクトでは主に「imw_t_temporary_save」や「imw_t_user_data」のデータベーステーブルからデータを取得します。
 *
 * 申請済みの、未完了・完了・過去案件の情報を取得するには
 * ActvMatter、CplMatter、ArcMatter を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TempSaveMatter/index.html
 */
declare class TempSaveMatter {
  /**
   * 一時保存案件マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   */
  constructor();

  /**
   * 一時保存案件マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   */
  constructor(localeId: string);

  /**
   * 一時保存情報を取得します。
   *
   * コンストラクタに指定したロケールID とパラメータで指定したユーザデータID で一時保存案件情報を取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にユーザ一時保存案件情報オブジェクトを格納した WorkflowResultInfo
   */
  getTempSaveMatter(userDataId: string): WorkflowResultInfo<TempSaveMatterInfo>;

  /**
   * ユーザデータ案件プロパティ情報を取得します。
   *
   * ユーザデータID とキーで特定のユーザデータ案件プロパティ情報を取得します。
   *
   * @param userDataId ユーザデータID
   * @param key キー
   * @return data にユーザデータ案件プロパティ情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterProperty(userDataId: string, key: string): WorkflowResultInfo<UserMatterPropertyInfo>;

  /**
   * ユーザデータ案件プロパティ情報をすべて取得します。
   *
   * ユーザデータID でユーザデータ案件プロパティ情報を取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にユーザデータ案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyList(userDataId: string): WorkflowResultInfo<UserMatterPropertyInfo[]>;

  /**
   * ユーザデータ案件プロパティ情報の件数を取得します。
   *
   * ユーザデータID でユーザデータ案件プロパティ件数を取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にユーザデータ案件プロパティ情報件数 (number) を格納した WorkflowResultInfo
   */
  getMatterPropertyListCount(userDataId: string): WorkflowResultInfo<number>;
}
