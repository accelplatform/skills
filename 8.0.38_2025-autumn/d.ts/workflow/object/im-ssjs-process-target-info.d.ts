/**
 * 処理対象者情報オブジェクト。
 *
 * 処理対象者に関するプラグイン情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessTargetInfo/index.html
 */
interface ProcessTargetInfo {
  // --- NOT NULL プロパティ ---

  /** 拡張ポイントID */
  readonly extensionPointId: string;
  /** ノードID */
  readonly nodeId: string;
  /** プラグインID */
  readonly pluginId: string;

  // --- NULLABLE プロパティ ---

  /** パラメータ */
  readonly parameter?: string;
  /** 処理対象種別名 */
  readonly processTargetClassifyName?: string;
  /** 処理対象名 */
  readonly processTargetName?: string;
}
