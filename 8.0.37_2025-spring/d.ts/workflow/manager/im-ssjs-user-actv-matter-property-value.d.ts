/**
 * ユーザデータ案件プロパティ情報（未完了案件）マネージャオブジェクト。
 *
 * ユーザデータ案件プロパティ情報の新規登録、更新、削除を行います。
 * 本オブジェクトではユーザデータID をキーで検索や更新処理を行います。
 * 検索や更新処理の対象になるテーブルは未完了案件関連テーブルである「imw_t_user_data」です。
 *
 * 完了案件や過去案件のユーザデータプロパティ情報の操作には
 * UserCplMatterPropertyValue、UserArcMatterPropertyValue を利用してください。
 *
 * システム案件ID をキーで未完了案件情報からユーザデータ案件プロパティ情報を取得するには、
 * ActvMatter を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserActvMatterPropertyValue/index.html
 */
declare class UserActvMatterPropertyValue {
  /**
   * ユーザデータ案件プロパティ情報（未完了案件）マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * ユーザデータ案件プロパティ情報を新規登録します。
   *
   * 「imw_t_user_data」テーブルに登録します。
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param matterProperty ユーザデータ案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  createMatterProperty(matterProperty: UserMatterPropertyInfo[]): WorkflowResultInfo<null>;

  /**
   * ユーザデータ案件プロパティ情報を更新します。
   *
   * 「ユーザデータID」と「案件プロパティキー」をキーにして、キー以外に設定されている値を更新します。
   * 値を設定していない項目（null の項目）は更新対象外になります。
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param matterProperty ユーザデータ案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  updateMatterProperty(matterProperty: UserMatterPropertyInfo[]): WorkflowResultInfo<null>;

  /**
   * ユーザデータ案件プロパティ情報を削除します。
   *
   * モデルに設定された項目の値をキーにしてデータを削除します。
   * 値を設定していない項目（null の項目）は検索条件から除いて削除処理を行います。
   * 必ずひとつ以上の項目に値を設定する必要があります。
   * このメソッドでは内部でトランザクション制御を行なっていません。外部で制御を行う必要があります。
   *
   * @param matterProperty ユーザデータ案件プロパティ情報オブジェクトの配列
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  deleteMatterProperty(matterProperty: UserMatterPropertyInfo[]): WorkflowResultInfo<null>;

  /**
   * ユーザデータ案件プロパティ情報を取得します。
   *
   * ユーザデータID と案件プロパティキーで「imw_t_user_data」テーブルから取得します。
   *
   * @param userDataId ユーザデータID
   * @param key 案件プロパティキー
   * @return data にユーザデータ案件プロパティ情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterProperty(userDataId: string, key: string): WorkflowResultInfo<UserMatterPropertyInfo>;

  /**
   * ユーザデータ案件プロパティ情報をすべて取得します。
   *
   * ユーザデータID で「imw_t_user_data」テーブルから取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にユーザデータ案件プロパティ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterPropertyList(userDataId: string): WorkflowResultInfo<UserMatterPropertyInfo[]>;

  /**
   * ユーザデータ案件プロパティ情報の件数を取得します。
   *
   * ユーザデータID で「imw_t_user_data」テーブルから取得します。
   *
   * @param userDataId ユーザデータID
   * @return data にユーザデータ案件プロパティ情報件数 (number) を格納した WorkflowResultInfo
   */
  getMatterPropertyListCount(userDataId: string): WorkflowResultInfo<number>;
}
