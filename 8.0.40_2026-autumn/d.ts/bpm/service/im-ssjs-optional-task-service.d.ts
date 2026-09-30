/**
 * オプショナルタスクサービス。
 *
 * オプショナルタスクに対する操作を行うクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.OptionalTaskService/index.html
 */
declare namespace bpm {
  class OptionalTaskService {
    /**
     * オプショナルタスクを追加します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param parameterMap パラメータマップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    add(processInstanceId: string, activityId: string, parameterMap: OptionalTaskService.ParameterMap): ResultObject<null>;

    /**
     * オプショナルタスクを追加します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param parameterMap パラメータマップ
     * @param version バージョン
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    add(processInstanceId: string, activityId: string, parameterMap: OptionalTaskService.ParameterMap, version: number): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクを削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     */
    deleteOptionalTaskInstance(processInstanceId: string, activityId: string): void;

    /**
     * 事前追加済のオプショナルタスクを削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param version バージョン
     */
    deleteOptionalTaskInstance(processInstanceId: string, activityId: string, version: number): void;

    /**
     * プロセスインスタンスに追加できるオプショナルタスクの情報を取得します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @return data に OptionalTaskInfo 情報オブジェクトの配列を格納した ResultObject
     */
    getAddableOptionalTaskInfo(processInstanceId: string): ResultObject<OptionalTaskInfo[]>;

    /**
     * 事前追加済のオプショナルタスクを取得します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @return data に OptionalTaskInstance 情報オブジェクトを格納した ResultObject（存在しない場合は null）
     */
    getOptionalTaskInstance(processInstanceId: string, activityId: string): ResultObject<OptionalTaskInstance | null>;

    /**
     * プロセスインスタンスに事前追加済のオプショナルタスクを取得します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @return data に OptionalTaskInstance 情報オブジェクトの配列を格納した ResultObject
     */
    getOptionalTaskInstances(processInstanceId: string): ResultObject<OptionalTaskInstance[]>;

    /**
     * バージョンを取得します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @return data にバージョンを格納した ResultObject
     */
    getVersion(processInstanceId: string): ResultObject<number>;

    /**
     * 事前追加済のオプショナルタスクのパラメータの変数を削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param variableName 変数名
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    removeParameter(processInstanceId: string, activityId: string, variableName: string): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクのパラメータの変数を削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param variableName 変数名
     * @param version バージョン
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    removeParameter(processInstanceId: string, activityId: string, variableName: string, version: number): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクの複数のパラメータの変数を削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param variableNames 変数名のリスト
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    removeParameters(processInstanceId: string, activityId: string, variableNames: string[]): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクの複数のパラメータの変数を削除します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param variableNames 変数名のリスト
     * @param version バージョン
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    removeParameters(processInstanceId: string, activityId: string, variableNames: string[], version: number): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクの複数のパラメータの変数を設定します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param parameterMap パラメータマップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    setParameters(processInstanceId: string, activityId: string, parameterMap: OptionalTaskService.ParameterMap): ResultObject<null>;

    /**
     * 事前追加済のオプショナルタスクの複数のパラメータの変数を設定します。
     *
     * @param processInstanceId プロセスインスタンスID
     * @param activityId アクティビティID
     * @param parameterMap パラメータマップ
     * @param version バージョン
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    setParameters(processInstanceId: string, activityId: string, parameterMap: OptionalTaskService.ParameterMap, version: number): ResultObject<null>;

    /**
     * プロセス定義ID により、プロセスを開始します。
     *
     * @param processDefinitionId プロセス定義ID
     * @param businessKey 業務キー
     * @param variables 変数マップ
     * @param optionalTaskInstances オプショナルタスクの配列
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceById(processDefinitionId: string, businessKey: string, variables: bpm.OptionalTaskService.ProcessVariables, optionalTaskInstances: OptionalTaskInstance[]): ResultObject<ProcessInstance>;

    /**
     * プロセス定義キーにより、プロセスを開始します。
     *
     * @param processDefinitionKey プロセス定義キー
     * @param businessKey 業務キー
     * @param variables 変数マップ
     * @param optionalTaskInstances オプショナルタスクの配列
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByKey(processDefinitionKey: string, businessKey: string, variables: bpm.OptionalTaskService.ProcessVariables, optionalTaskInstances: OptionalTaskInstance[]): ResultObject<ProcessInstance>;
  }

  namespace OptionalTaskService {
    type ParameterMap = { [key: string]: any };
    type ProcessVariables = { [key: string]: any };
  }
}
