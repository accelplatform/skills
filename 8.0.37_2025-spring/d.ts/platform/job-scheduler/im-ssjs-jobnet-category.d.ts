/**
 * ジョブネットカテゴリ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JobnetCategory/index.html
 */
interface JobnetCategory {
  /** ジョブネットカテゴリID */
  id: string;
  /** 親カテゴリID */
  parentId: string | null;
  /** 多言語対応の表示名情報 */
  localizes: {
    [localeId: string]: {
      /** 表示名 */
      name: string;
    };
  };
}
