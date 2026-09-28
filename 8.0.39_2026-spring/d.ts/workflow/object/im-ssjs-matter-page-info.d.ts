/**
 * 案件画面定義情報オブジェクト。
 *
 * 案件ノードに紐づく画面定義情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterPageInfo/index.html
 */
interface MatterPageInfo {
  // --- NULLABLE プロパティ ---

  /** アプリケーションID */
  readonly applicationId?: string;
  /** ページパス */
  readonly pagePath?: string;
  /** 画面種別 */
  readonly pageType?: string;
  /** パス種別 */
  readonly pathType?: string;
  /** スクリプトパス */
  readonly scriptPath?: string;
  /** サービスID */
  readonly serviceId?: string;
}
