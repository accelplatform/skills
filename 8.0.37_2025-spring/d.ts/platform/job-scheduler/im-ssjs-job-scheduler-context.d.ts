/**
 * ジョブスケジューラコンテキストクラス。
 *
 * ジョブスケジューラによるジョブ実行時にアクセス可能なコンテキスト情報です。
 * Contexts.getJobSchedulerContext() で取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JobSchedulerContext/index.html
 */
interface JobSchedulerContext {
  /** ジョブ実行日時 */
  fireDate: Date;
  /** ジョブ情報 */
  jobDetail: JobDetail;
  /** ジョブネット情報 */
  jobnet: Jobnet;
  /** 全オブジェクトから優先度に基づいてマージされたパラメータ */
  mergedParameters: JobSchedulerContext.Parameters;
  /** モニタID */
  monitorId: string;
  /** 次回実行日時 */
  nextFireDate: Date;
  /** ランタイムパラメータ */
  parameters: JobSchedulerContext.Parameters;
  /** 前回実行日時 */
  previousFireDate: Date;
  /** タスクID */
  taskId: string;
  /** トリガ情報 */
  trigger: Trigger;

  /**
   * 全オブジェクトから優先度に基づいてマージされたパラメータを取得します。
   *
   * @return マージ済みパラメータ
   */
  getMergedParameters(): JobSchedulerContext.Parameters;

  /**
   * 指定キーのパラメータ値を取得します。
   * ランタイム、トリガ、ジョブネット、ジョブの優先順で検索します。
   *
   * @param key パラメータキー
   * @return パラメータ値
   */
  getParameter(key: string): string;

  /**
   * ランタイムパラメータを追加します。
   *
   * @param key パラメータキー
   * @param value パラメータ値
   */
  putParameter(key: string, value: string): void;

  /**
   * 複数のランタイムパラメータを一括追加します。
   *
   * @param parameters キー値ペアのオブジェクト
   */
  putParameters(parameters: JobSchedulerContext.Parameters): void;
}

declare namespace JobSchedulerContext {
  type Parameters = { [key: string]: any };
}
