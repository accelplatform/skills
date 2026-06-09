/**
 * タスクサービス。
 *
 * タスクに対する操作を行うクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.TaskService/index.html
 */
declare namespace bpm {
  class TaskService {
    /**
     * 指定のタスクに担当者を割り当てます。
     *
     * @param taskId タスクID
     * @param userId ユーザID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    claim(taskId: string, userId: string): ResultObject<null>;

    /**
     * 指定のタスクを完了させます。
     *
     * @param taskId タスクID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    complete(taskId: string): ResultObject<null>;

    /**
     * 指定のタスクを完了させます。
     * プロセスの変数を定義できます。
     *
     * @param taskId タスクID
     * @param variables 変数マップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    complete(taskId: string, variables: bpm.TaskService.ProcessVariables): ResultObject<null>;

    /**
     * 指定のタスクを完了させます。
     * localScope を true にした場合、タスク変数を定義できます。false にした場合、プロセスの変数を定義できます。
     *
     * @param taskId タスクID
     * @param variables 変数マップ
     * @param localScope ローカルスコープフラグ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    complete(taskId: string, variables: bpm.TaskService.ProcessVariables, localScope: boolean): ResultObject<null>;

    /**
     * 担当になったタスクを取得します。
     *
     * @param taskId タスクID
     * @return data に Task 情報オブジェクトを格納した ResultObject（存在しない場合は null）
     */
    getAssignedTask(taskId: string): ResultObject<Task | null>;

    /**
     * グループタスクを詳細検索します。
     *
     * @param condition 検索条件
     * @return data に Task 情報オブジェクトの配列を格納した ResultObject
     */
    queryGroupTasks(condition: TaskQuery): ResultObject<Task[]>;

    /**
     * 個人タスクを詳細検索します。
     *
     * @param condition 検索条件
     * @return data に Task 情報オブジェクトの配列を格納した ResultObject
     */
    queryUserTasks(condition: TaskQuery): ResultObject<Task[]>;

    /**
     * 指定のタスクから担当者の割り当てを解除します。
     *
     * @param taskId タスクID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    unclaim(taskId: string): ResultObject<null>;
  }

  namespace TaskService {
    type ProcessVariables = { [key: string]: any };
  }
}
