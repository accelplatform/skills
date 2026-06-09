/**
 * アクセスコンテキスト取得 API。
 *
 * アクセスコンテキストを取得するための API を提供するクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Contexts/index.html
 */
declare class Contexts {
  /**
   * アカウントコンテキストを取得します。
   *
   * @return アカウントコンテキストオブジェクト
   */
  static getAccountContext(): AccountContext;

  /**
   * クライアントコンテキストを取得します。
   * Web 実行環境でのみ使用可能です。
   *
   * @return クライアントコンテキストオブジェクト
   */
  static getClientContext(): ClientContext;

  /**
   * 外部ユーザコンテキストを取得します。
   * Web 実行環境でのみ使用可能です。
   *
   * @return 外部ユーザコンテキストオブジェクト
   */
  static getExternalUserContext(): ExternalUserContext;

  /**
   * ジョブスケジューラコンテキストを取得します。
   * ジョブスケジューラ実行環境でのみ使用可能です。
   *
   * @return ジョブスケジューラコンテキストオブジェクト
   */
  static getJobSchedulerContext(): JobSchedulerContext;

  /**
   * ユーザコンテキストを取得します。
   * Web 実行環境でのみ使用可能です。
   *
   * @return ユーザコンテキストオブジェクト
   */
  static getUserContext(): UserContext;
}
