/**
 * 確認（完了案件）マネージャオブジェクト。
 *
 * コンストラクタに指定したシステム案件ID とノードID で取得した、ある案件の確認ノードに対して、
 * あるユーザが処理権限があるかのチェックや、処理できる組織情報の取得、
 * また指定した確認ノードの確認処理を行うことができます。
 *
 * 本オブジェクトでは、完了状態の案件に対しての確認処理を行います。
 * 完了案件に対して確認処理ができるようにするには、フローの設定で完了案件の確認処理を可能に設定して置く必要があります。
 * 処理中の未完了案件に対して、確認関連処理を行うには CnfmActvMatterManager を利用してください。
 *
 * コンストラクタに指定したロケールID は getAuthUserOrgz(String) で利用されます。
 * 他のメソッドでは利用されません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CnfmCplMatterManager/index.html
 */
declare class CnfmCplMatterManager {
  /**
   * 確認（完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(systemMatterId: string, nodeId: string);

  /**
   * 確認（完了案件）マネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param nodeId ノードID
   */
  constructor(localeId: string, systemMatterId: string, nodeId: string);

  /**
   * 確認処理を実行します。
   *
   * このメソッドでは内部でトランザクションの制御処理を行なっています。
   * メソッドの実行前に、ユーザトランザクションを終了状態にして置く必要があります。
   *
   * 完了案件に対して確認処理を行うには、フローの設定で、事前に完了案件の確認処理を可能に設定して置く必要があります。
   * 完了案件に対して確認処理ができない設定の場合は、処理に失敗します。
   *
   * 確認用パラメータ情報に指定した「権限者コード」のユーザが処理対象確認ノードに対して
   * 確認処理対象者に設定されてない場合には処理ができません。
   * コンストラクタに指定したノードID が確認ノードID ではない場合、又は確認ノードでまだ未到達の場合にも処理に失敗します。
   *
   * @param confirmParam 確認用パラメータ情報オブジェクト
   * @return data に null を格納した WorkflowResultInfo（処理の成否は resultStatus を参照）
   */
  confirm(confirmParam: ConfirmParamInfo): WorkflowResultInfo<null>;

  /**
   * 完了案件に対する確認処理権限者の所属組織情報を取得します。
   *
   * コンストラクタに指定したシステム案件ID に該当する案件で、
   * 確認処理ができるあるユーザに対して、確認処理時に選択できる所属組織情報を取得します。
   *
   * @param authUserCd 権限者コード
   * @return data に処理権限者所属組織情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAuthUserOrgz(authUserCd: string): WorkflowResultInfo<AuthUserOrgzInfo[]>;

  /**
   * 指定したユーザが完了案件の確認処理を実行できるか判定します。
   *
   * 以下の３つの要件を満たす時、確認可能（true）を返却します。
   * ・確認ノードが処理可能な状態か
   * ・指定したユーザが確認ノードの処理対象者として設定されているか
   * ・案件申請時のフロー定義にて「完了した案件の確認」が '有効' に設定されているか
   *
   * @param execUserCd 実行者コード
   * @return data に確認可否判定結果 (true: 確認可能 / false: 確認不可能) を格納した WorkflowResultInfo
   */
  isPossibleToConfirm(execUserCd: string): WorkflowResultInfo<boolean>;
}
