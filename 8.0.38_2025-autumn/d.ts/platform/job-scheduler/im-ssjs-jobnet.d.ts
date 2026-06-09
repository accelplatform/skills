/**
 * ジョブネット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Jobnet/index.html
 */
interface Jobnet {
  /** ジョブネットカテゴリID */
  categoryId: string;
  /** 並列実行不可フラグ（true: 不可 / false: 可） */
  disallowConcurrent: boolean;
  /** ジョブネットID */
  id: string;
  /** 実行ジョブID の配列（実行順） */
  jobIds: string[];
  /** 多言語対応の名前・説明情報 */
  localizes: {
    [localeId: string]: {
      /** 名前 */
      name: string;
      /** 説明 */
      description?: string;
    };
  };
  /** ジョブネットパラメータ */
  parameters: { [key: string]: any };
  /** 利用するジョブID の配列 */
  useJobIds: string[];
}
