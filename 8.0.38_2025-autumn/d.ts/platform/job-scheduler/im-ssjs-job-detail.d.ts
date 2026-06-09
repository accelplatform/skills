/**
 * ジョブ詳細情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JobDetail/index.html
 */
interface JobDetail {
  /** ジョブカテゴリID */
  categoryId: string;
  /** ジョブID */
  id: string;
  /** ジョブ実行種別 */
  jobType: JobDetail.JobType;
  /** 多言語対応の名前・説明情報 */
  localizes: {
    [localeId: string]: {
      /** 名前 */
      name: string;
      /** 説明 */
      description?: string;
    };
  };
  /** ジョブパラメータ */
  parameters: { [key: string]: any };
}

declare namespace JobDetail {
  type JobType =
    /** JavaEE */
    | 'JAVA'
    /** スクリプト開発 */
    | 'SCRIPT';
}
