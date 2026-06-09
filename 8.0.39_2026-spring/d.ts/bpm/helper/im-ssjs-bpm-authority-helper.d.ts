/**
 * BPM 権限チェックヘルパー。
 *
 * アカウントコンテキストのユーザに IM-BPM の各操作を行う権限があるかどうかをチェックするためのヘルパオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.BPMAuthorityHelper/index.html
 */
declare namespace bpm {
  class BPMAuthorityHelper {
    /**
     * 指定されたアクティブなタスクを完了する権限があるかを判定します。
     *
     * @param taskId タスクID
     * @return data に権限有無（true: 権限あり / false: 権限なし）を格納した ResultObject
     */
    canCompleteTask(taskId: string): ResultObject<boolean>;

    /**
     * 指定されたプロセスインスタンス履歴を参照する権限があるかを判定します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @return data に権限有無（true: 権限あり / false: 権限なし）を格納した ResultObject
     */
    canReferProcessInstance(processInstanceId: string): ResultObject<boolean>;

    /**
     * 指定されたタスク履歴を参照する権限があるかを判定します。
     *
     * @param taskId タスクID
     * @return data に権限有無（true: 権限あり / false: 権限なし）を格納した ResultObject
     */
    canReferTask(taskId: string): ResultObject<boolean>;

    /**
     * 指定されたプロセス定義を開始する権限があるかを判定します。
     *
     * @param processDefinitionId プロセス定義ID
     * @return data に権限有無（true: 権限あり / false: 権限なし）を格納した ResultObject
     */
    canStartProcess(processDefinitionId: string): ResultObject<boolean>;
  }
}
