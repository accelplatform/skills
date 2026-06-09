/**
 * ベクトルストアセットアップサービスクラス。
 *
 * ベクトルデータベース接続情報のシステムセットアップ情報を管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/VectorStoreSetupService/index.html
 */
declare class VectorStoreSetupService {
  /**
   * ベクトルストアセットアップサービスクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * サポートするベクトルデータベース種別の一覧を取得します。
   *
   * @return data にベクトルデータベース種別の配列を格納した ResultObject
   */
  getSupportedVectorStoreKinds(): ResultObject<VectorStoreSetupService.VectorStoreKind[]>;

  /**
   * 指定されたベクトルデータベース種別のシステムセットアップ情報を取得します。
   *
   * @param vectorStoreKind ベクトルデータベース種別
   * @return data にセットアップ情報を格納した ResultObject
   */
  getSystemSetupInfo(vectorStoreKind: string): ResultObject<VectorStoreSetupService.SystemSetupInfo>;

  /**
   * ベクトルデータベース接続情報のバリデータパスの一覧を取得します。
   *
   * @return data にバリデータパスの文字列配列を格納した ResultObject
   */
  getSystemSetupValidatorPaths(): ResultObject<string[]>;

  /**
   * 指定されたテナントのベクトルデータベース接続情報を取得します。
   *
   * @param tenantId テナントID
   * @return data に接続情報を格納した ResultObject
   */
  getVectorStoreInfo(tenantId: string): ResultObject<VectorStoreSetupService.VectorStoreInfo>;
}

declare namespace VectorStoreSetupService {
  type VectorStoreKind = {
    /** ベクトルデータベース種別の名前 */
    name: string;
    /** ベクトルデータベース種別の表示名 */
    caption: string;
  };

  type SystemSetupInfo = {
    /** システムセットアップページのパス */
    systemSetupPagePath: string;
    /** システムセットアップバリデータのパス */
    systemSetupValidatorPath: string;
    /** システムセットアップ実行者のパス */
    systemSetupExecutorPath: string;
  };

  type VectorStoreInfo = {
    /** テナントID */
    tenantId: string;
    /** ベクトルデータベース種別 */
    vectorStoreKind: string;
    /** リソースプロパティ */
    resourceProperties: object;
  };
}
