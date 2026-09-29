/**
 * 処理履歴オブジェクト。
 *
 * 指定したシステム案件ID の処理履歴を取得するオブジェクトです。
 * 指定したロケールID のロケールで結果を取得します。
 *
 * 履歴を取得する対象ノードは、ユーザが処理する下記のノード種別を持つノードです。
 * ・申請ノード
 * ・承認ノード
 * ・動的承認ノード
 * ・システムノード
 *
 * 履歴を取得する対象ステータスは、下記のステータスの状態の案件です。
 * ・未完了
 * ・完了
 * ・過去
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterHistory/index.html
 */
declare class MatterHistory {
  /**
   * 処理履歴オブジェクトのインスタンスを生成します。
   *
   * @param systemMatterId システム案件ID
   * @param localeId ロケールID
   */
  constructor(systemMatterId: string, localeId: string);

  /**
   * 処理履歴情報を取得します。
   *
   * コンストラクタに指定したシステム案件ID とロケールID で取得した案件のノード処理履歴をすべて取得します。
   * 取得した結果が複数存在する場合は、処理日時順に返却します。
   *
   * 差戻しや引戻し等によって、１つのノードが複数回処理された場合には、
   * １つのノードに対して複数履歴が取得されます。
   *
   * @return data に処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMatterHistory(): WorkflowResultInfo<MatterHistoryInfo[]>;
}
