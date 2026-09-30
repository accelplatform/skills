/**
 * サービス制限クラス。
 *
 * サービスの起動を制限する機能を提供します。
 * サーバ再起動なしにサービスの停止・再開を制御できます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ImServiceRestrictor/index.html
 */
declare class ImServiceRestrictor {
  /**
   * サービス制限クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * 現在停止中のすべてのサービスID を取得します。
   *
   * @return data に停止中のサービスID 配列を格納した ResultObject
   */
  getRestrictedServiceIds(): ResultObject<string[]>;

  /**
   * 停止中のサービスを再開します。
   *
   * @param serviceId サービスID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  restartService(serviceId: string): ResultObject<null>;

  /**
   * 指定されたサービスを停止します。
   * 停止したサービスは restartService で再開するまで、サーバ再起動後も停止状態が維持されます。
   *
   * @param serviceId サービスID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  restrictService(serviceId: string): ResultObject<null>;
}
