/**
 * アクセスコンテキストのライフサイクル管理 API。
 *
 * アクセスコンテキストの保存・復元・切り替えを行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Lifecycle/index.html
 */
declare class Lifecycle {
  /**
   * 現在のアクセスコンテキストを破棄し、保存済みのコンテキストを復元します。
   */
  static pop(): void;

  /**
   * 現在のアクセスコンテキストを保存し、新しいコンテキストに遷移します。
   *
   * @param id リソース識別子
   * @param resource リソース情報
   */
  static stack(id: string, resource?: Lifecycle.Resource): void;

  /**
   * 現在のアクセスコンテキストを破棄し、新しいコンテキストに切り替えます。
   *
   * @param id リソース識別子
   * @param resource リソース情報
   */
  static switchTo(id: string, resource?: Lifecycle.Resource): void;
}

declare namespace Lifecycle {
  type Resource = any;
}
