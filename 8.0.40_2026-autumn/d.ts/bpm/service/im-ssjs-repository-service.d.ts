/**
 * リポジトリサービス。
 *
 * プロセス定義に関する操作を行うクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/bpm.RepositoryService/index.html
 */
declare namespace bpm {
  class RepositoryService {
    /**
     * 指定したプロセス定義のモデルを取得します。
     *
     * @param processDefinitionId プロセス定義ID
     * @return data に BpmnModel 情報オブジェクトを格納した ResultObject
     */
    getBpmnModel(processDefinitionId: string): ResultObject<jp.co.intra_mart.activiti.bpmn.model.BpmnModel>;

    /**
     * プロセス定義ID より、プロセス定義情報を取得します。
     *
     * @param processDefinitionId プロセス定義ID
     * @return data に ProcessDefinition 情報オブジェクトを格納した ResultObject
     */
    getProcessDefinition(processDefinitionId: string): ResultObject<ProcessDefinition>;
  }
}
