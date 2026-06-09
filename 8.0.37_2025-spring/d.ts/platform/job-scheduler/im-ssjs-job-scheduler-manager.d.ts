/**
 * ジョブスケジューラマネージャ。
 *
 * ジョブ、ジョブネット、トリガ、モニタの CRUD 操作および実行制御を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JobSchedulerManager/index.html
 */
declare class JobSchedulerManager {
  /**
   * ジョブスケジューラマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * ジョブクラスのパラメータ定義を生成します。
   *
   * @param jobType ジョブ実行種別
   * @param jobPath ジョブパス
   * @return data にパラメータ定義情報を格納した ResultObject
   */
  static createParametersDefinition(jobType: string, jobPath: string): ResultObject<{ [key: string]: any }>;

  /**
   * 指定ID のジョブを削除します。
   *
   * @param jobId ジョブID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteJob(jobId: string): ResultObject<null>;

  /**
   * 指定ID のジョブカテゴリを削除します。
   * 子カテゴリと関連ジョブも削除されます。
   *
   * @param categoryId カテゴリID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteJobCategory(categoryId: string): ResultObject<null>;

  /**
   * 指定ID のジョブネットを削除します。
   * 関連トリガも削除されます。
   *
   * @param jobnetId ジョブネットID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteJobnet(jobnetId: string): ResultObject<null>;

  /**
   * 指定ID のジョブネットカテゴリを削除します。
   * 子カテゴリと関連ジョブネットも削除されます。
   *
   * @param categoryId カテゴリID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteJobnetCategory(categoryId: string): ResultObject<null>;

  /**
   * 指定ID のモニタを削除します。
   *
   * @param monitorId モニタID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteMonitor(monitorId: string): ResultObject<null>;

  /**
   * 指定ID のトリガを削除します。
   *
   * @param triggerId トリガID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteTrigger(triggerId: string): ResultObject<null>;

  /**
   * 指定トリガを無効化します。
   *
   * @param triggerId トリガID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  disableTrigger(triggerId: string): ResultObject<null>;

  /**
   * ジョブネット内の全トリガを無効化します。
   *
   * @param jobnetId ジョブネットID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  disableTriggers(jobnetId: string): ResultObject<null>;

  /**
   * 指定トリガを有効化します。
   *
   * @param triggerId トリガID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  enableTrigger(triggerId: string): ResultObject<null>;

  /**
   * ジョブネット内の全トリガを有効化します。
   *
   * @param jobnetId ジョブネットID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  enableTriggers(jobnetId: string): ResultObject<null>;

  /**
   * 指定ジョブネットを即時実行します。
   *
   * @param jobnetId ジョブネットID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  execute(jobnetId: string): ResultObject<null>;

  /**
   * 実行中または停止中のジョブネットを強制終了します。
   *
   * @param monitorId モニタID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  exitJobnet(monitorId: string): ResultObject<null>;

  /**
   * 親カテゴリの全子カテゴリを取得します。
   *
   * @param parentId 親カテゴリID
   * @return data に JobCategory の配列を格納した ResultObject
   */
  findChildJobCategories(parentId: string): ResultObject<JobCategory[]>;

  /**
   * 子カテゴリ数を取得します。
   *
   * @param parentId 親カテゴリID
   * @return data にカウント数を格納した ResultObject
   */
  // TODO: typo については、後方互換のために修正していません
  findChildJobCategoriyCount(parentId: string): ResultObject<number>;

  /**
   * 親カテゴリの全子ジョブネットカテゴリを取得します。
   *
   * @param parentId 親カテゴリID
   * @return data に JobnetCategory の配列を格納した ResultObject
   */
  findChildJobnetCategories(parentId: string): ResultObject<JobnetCategory[]>;

  /**
   * 子ジョブネットカテゴリ数を取得します。
   *
   * @param parentId 親カテゴリID
   * @return data にカウント数を格納した ResultObject
   */
  // TODO: typo については、後方互換のために修正していません
  findChildJobnetCategoriyCount(parentId: string): ResultObject<number>;

  /**
   * 指定ID のジョブ情報を取得します。
   *
   * @param jobId ジョブID
   * @return data に JobDetail を格納した ResultObject
   */
  findJob(jobId: string): ResultObject<JobDetail>;

  /**
   * 指定ID のジョブカテゴリを取得します。
   *
   * @param categoryId カテゴリID
   * @return data に JobCategory を格納した ResultObject
   */
  findJobCategory(categoryId: string): ResultObject<JobCategory>;

  /**
   * カテゴリ内のジョブ数を取得します。
   *
   * @param categoryId カテゴリID
   * @return data にカウント数を格納した ResultObject
   */
  findJobCountByCategory(categoryId: string): ResultObject<number>;

  /**
   * 指定ID のジョブネット情報を取得します。
   *
   * @param jobnetId ジョブネットID
   * @return data に Jobnet を格納した ResultObject
   */
  findJobnet(jobnetId: string): ResultObject<Jobnet>;

  /**
   * 指定ID のジョブネットカテゴリを取得します。
   *
   * @param categoryId カテゴリID
   * @return data に JobnetCategory を格納した ResultObject
   */
  findJobnetCategory(categoryId: string): ResultObject<JobnetCategory>;

  /**
   * カテゴリ内のジョブネット数を取得します。
   *
   * @param categoryId カテゴリID
   * @return data にカウント数を格納した ResultObject
   */
  findJobnetCountByCategory(categoryId: string): ResultObject<number>;

  /**
   * カテゴリ内の全ジョブネットを取得します。
   *
   * @param categoryId カテゴリID
   * @return data に Jobnet の配列を格納した ResultObject
   */
  findJobnetsByCategory(categoryId: string): ResultObject<Jobnet[]>;

  /**
   * カテゴリ内の全ジョブを取得します。
   *
   * @param categoryId カテゴリID
   * @return data に JobDetail の配列を格納した ResultObject
   */
  findJobsByCategory(categoryId: string): ResultObject<JobDetail[]>;

  /**
   * 指定ID のモニタ情報を取得します。
   *
   * @param monitorId モニタID
   * @return data に Monitor を格納した ResultObject
   */
  findMonitor(monitorId: string): ResultObject<Monitor>;

  /**
   * フィルタ条件でモニタ数を取得します。
   *
   * @param filter フィルタ情報
   * @return data にカウント数を格納した ResultObject
   */
  findMonitorCountByFilter(filter: JobFilter | PluralJobnetFilter): ResultObject<number>;

  /**
   * ステータス別のモニタ数を取得します。
   *
   * @param status ステータス
   * @return data にカウント数を格納した ResultObject
   */
  findMonitorCountByStatus(status: string): ResultObject<number>;

  /**
   * トリガ関連のモニタ数を取得します。
   *
   * @param triggerId トリガID
   * @return data にカウント数を格納した ResultObject
   */
  findMonitorCountByTrigger(triggerId: string): ResultObject<number>;

  /**
   * トリガとステータスで絞り込んだモニタ数を取得します。
   *
   * @param triggerId トリガID
   * @param status ステータス
   * @return data にカウント数を格納した ResultObject
   */
  findMonitorCountByTriggerWithStatus(triggerId: string, status: string): ResultObject<number>;

  /**
   * フィルタ条件でモニタを取得します。
   *
   * @param filter フィルタ情報
   * @return data に Monitor の配列を格納した ResultObject
   */
  findMonitorsByFilter(filter: JobFilter | PluralJobnetFilter): ResultObject<Monitor[]>;

  /**
   * ステータス別にモニタを全取得します。
   *
   * @param status ステータス
   * @return data に Monitor の配列を格納した ResultObject
   */
  findMonitorsByStatus(status: string): ResultObject<Monitor[]>;

  /**
   * トリガ関連のモニタを全取得します。
   *
   * @param triggerId トリガID
   * @return data に Monitor の配列を格納した ResultObject
   */
  findMonitorsByTrigger(triggerId: string): ResultObject<Monitor[]>;

  /**
   * トリガとステータスで絞り込んでモニタを取得します。
   *
   * @param triggerId トリガID
   * @param status ステータス
   * @return data に Monitor の配列を格納した ResultObject
   */
  findMonitorsByTriggerWithStatus(triggerId: string, status: string): ResultObject<Monitor[]>;

  /**
   * 指定ID のトリガを取得します。
   *
   * @param triggerId トリガID
   * @return data に Trigger を格納した ResultObject
   */
  findTrigger(triggerId: string): ResultObject<Trigger>;

  /**
   * ジョブネット内のトリガ数を取得します。
   *
   * @param jobnetId ジョブネットID
   * @return data にカウント数を格納した ResultObject
   */
  findTriggerCountByJobnet(jobnetId: string): ResultObject<number>;

  /**
   * ジョブネット内の全トリガを取得します。
   *
   * @param jobnetId ジョブネットID
   * @return data に Trigger の配列を格納した ResultObject
   */
  findTriggersByJobnet(jobnetId: string): ResultObject<Trigger[]>;

  /**
   * 指定ジョブを利用するジョブネットを全取得します。
   *
   * @param jobId ジョブID
   * @return data に Jobnet の配列を格納した ResultObject
   */
  findUsedJobnets(jobId: string): ResultObject<Jobnet[]>;

  /**
   * ジョブを登録します。
   *
   * @param job ジョブ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertJob(job: JobDetail): ResultObject<null>;

  /**
   * ジョブカテゴリを登録します。
   *
   * @param category ジョブカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertJobCategory(category: JobCategory): ResultObject<null>;

  /**
   * ジョブネットを登録します。
   *
   * @param jobnet ジョブネット情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertJobnet(jobnet: Jobnet): ResultObject<null>;

  /**
   * ジョブネットカテゴリを登録します。
   *
   * @param category ジョブネットカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertJobnetCategory(category: JobnetCategory): ResultObject<null>;

  /**
   * トリガを登録します。
   *
   * @param trigger トリガ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertTrigger(trigger: Trigger): ResultObject<null>;

  /**
   * 実行中のジョブネットを一時停止します。
   *
   * @param monitorId モニタID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  pauseJobnet(monitorId: string): ResultObject<null>;

  /**
   * 停止中のジョブネットを再開します。
   *
   * @param monitorId モニタID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  resumeJobnet(monitorId: string): ResultObject<null>;

  /**
   * ジョブ情報を更新します。
   *
   * @param job ジョブ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateJob(job: JobDetail): ResultObject<null>;

  /**
   * ジョブカテゴリを更新します。
   *
   * @param category ジョブカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateJobCategory(category: JobCategory): ResultObject<null>;

  /**
   * ジョブネット情報を更新します。
   *
   * @param jobnet ジョブネット情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateJobnet(jobnet: Jobnet): ResultObject<null>;

  /**
   * ジョブネットカテゴリを更新します。
   *
   * @param category ジョブネットカテゴリ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateJobnetCategory(category: JobnetCategory): ResultObject<null>;

  /**
   * モニタメッセージを更新します。
   *
   * @param monitorId モニタID
   * @param message メッセージ
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMonitorMessage(monitorId: string, message: string): ResultObject<null>;

  /**
   * モニタタスクメッセージを更新します。
   *
   * @param monitorId モニタID
   * @param taskId タスクID
   * @param message メッセージ
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateMonitorTaskMessage(monitorId: string, taskId: string, message: string): ResultObject<null>;

  /**
   * トリガ情報を更新します。
   *
   * @param trigger トリガ情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateTrigger(trigger: Trigger): ResultObject<null>;
}
