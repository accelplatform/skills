/**
 * ランタイムサービス。
 *
 * プロセスに対する操作を行うクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.RuntimeService/index.html
 */
declare namespace bpm {
  class RuntimeService {
    /**
     * 参照メッセージと実行ID を指定してメッセージを送信します。
     *
     * @param messageName 参照メッセージ
     * @param executionId 実行ID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    messageEventReceived(messageName: string, executionId: string): ResultObject<null>;

    /**
     * 参照メッセージと実行ID を指定してメッセージを送信します。
     * プロセスの変数を定義できます。
     *
     * @param messageName 参照メッセージ
     * @param executionId 実行ID
     * @param variables 変数マップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    messageEventReceived(messageName: string, executionId: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<null>;

    /**
     * 非同期で参照メッセージと実行ID を指定してメッセージを送信します。
     *
     * @param messageName 参照メッセージ
     * @param executionId 実行ID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    messageEventReceivedAsync(messageName: string, executionId: string): ResultObject<null>;

    /**
     * エグゼキューションを詳細検索します。
     *
     * @param condition 検索条件
     * @return data に Execution 情報オブジェクトの配列を格納した ResultObject
     */
    queryExecutions(condition: ExecutionQuery): ResultObject<Execution[]>;

    /**
     * 実行ID を指定して、シグナルを送信します。
     * 受信タスク、および中間イベントを対象とします。
     *
     * @param executionId 実行ID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signal(executionId: string): ResultObject<null>;

    /**
     * 実行ID を指定して、シグナルを送信します。
     * 受信タスク、および中間イベントを対象とします。
     * プロセスの変数を定義できます。
     *
     * @param executionId 実行ID
     * @param variables 変数マップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signal(executionId: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<null>;

    /**
     * 指定のシグナルを送信します。
     * 同一シグナルを待機しているすべてのアクティビティが、このシグナルを受信します。
     *
     * @param signalName シグナル
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signalEventReceived(signalName: string): ResultObject<null>;

    /**
     * 指定のシグナルをブロードキャストします。
     * プロセスの変数を定義できます。
     *
     * @param signalName シグナル
     * @param variables 変数マップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signalEventReceived(signalName: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<null>;

    /**
     * 実行ID を指定して、指定のシグナルを送信します。
     * プロセスの変数を定義できます。
     *
     * @param signalName シグナル
     * @param executionId 実行ID
     * @param variables 変数マップ
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signalEventReceived(signalName: string, executionId: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<null>;

    /**
     * 指定のシグナルを送信します。
     * このシグナルを受信したアクティビティは非同期で実行されます。
     *
     * @param signalName シグナル
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signalEventReceivedAsync(signalName: string): ResultObject<null>;

    /**
     * 実行ID を指定して、指定のシグナルを送信します。
     * このシグナルを受信したアクティビティは非同期で実行されます。
     *
     * @param signalName シグナル
     * @param executionId 実行ID
     * @return data に null を格納した ResultObject（処理の成否は error を参照）
     */
    signalEventReceivedAsync(signalName: string, executionId: string): ResultObject<null>;

    /**
     * プロセス定義ID により、プロセスを開始します。
     *
     * @param processDefinitionId プロセス定義ID
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceById(processDefinitionId: string): ResultObject<ProcessInstance>;

    /**
     * プロセス定義ID により、プロセスを開始します。
     * プロセスの変数を定義できます。
     *
     * @param processDefinitionId プロセス定義ID
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceById(processDefinitionId: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;

    /**
     * プロセス定義ID により、プロセスを開始します。
     * 業務キー、およびプロセスの変数を定義できます。
     *
     * @param processDefinitionId プロセス定義ID
     * @param businessKey 業務キー
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceById(processDefinitionId: string, businessKey: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;

    /**
     * プロセス定義キーにより、プロセスを開始します。
     *
     * @param processDefinitionKey プロセス定義キー
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByKey(processDefinitionKey: string): ResultObject<ProcessInstance>;

    /**
     * プロセス定義キーにより、プロセスを開始します。
     * プロセスの変数を定義できます。
     *
     * @param processDefinitionKey プロセス定義キー
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByKey(processDefinitionKey: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;

    /**
     * プロセス定義キーにより、プロセスを開始します。
     * 業務キー、およびプロセスの変数を定義できます。
     *
     * @param processDefinitionKey プロセス定義キー
     * @param businessKey 業務キー
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByKey(processDefinitionKey: string, businessKey: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;

    /**
     * メッセージにより、プロセスを開始します。
     *
     * @param messageName メッセージ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByMessage(messageName: string): ResultObject<ProcessInstance>;

    /**
     * メッセージにより、プロセスを開始します。
     * プロセスの変数を定義できます。
     *
     * @param messageName メッセージ
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByMessage(messageName: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;

    /**
     * メッセージにより、プロセスを開始します。
     * 業務キー、およびプロセスの変数を定義できます。
     *
     * @param messageName メッセージ
     * @param businessKey 業務キー
     * @param variables 変数マップ
     * @return data に ProcessInstance 情報オブジェクトを格納した ResultObject
     */
    startProcessInstanceByMessage(messageName: string, businessKey: string, variables: bpm.RuntimeService.ProcessVariables): ResultObject<ProcessInstance>;
  }

  namespace RuntimeService {
    type ProcessVariables = { [key: string]: any };
  }
}
