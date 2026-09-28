/**
 * 処理種別情報オブジェクト。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/NodeProcessTypeInfo/index.html
 */
interface NodeProcessTypeInfo {
  // --- NULLABLE プロパティ ---

  /** 処理種別 */
  readonly nodeProcess?: ProcessType;
  /** 処理種別名 */
  readonly nodeProcessName?: string;
}
