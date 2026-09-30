/**
 * ジョブカテゴリ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JobCategory/index.html
 */
interface JobCategory {
  /** カテゴリID */
  id: string;
  /** 親カテゴリID（ルートの場合 null） */
  parentId: string | null;
  /** 多言語対応の表示名情報 */
  localizes: {
    [localeId: string]: {
      /** 表示名 */
      name: string;
    };
  };
}
