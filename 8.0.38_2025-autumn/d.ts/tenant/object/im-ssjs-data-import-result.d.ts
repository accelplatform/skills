/**
 * データインポート結果オブジェクト。
 *
 * データインポートの実行結果を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DataImportResult/index.html
 */
interface DataImportResult {
  /** 実行ID */
  readonly executeId: string;
  /** 失敗件数 */
  readonly faultCount: number;
  /** メッセージ */
  readonly message: string;
  /** 成功したかどうか */
  readonly success: boolean;
  /** 総件数 */
  readonly totalCount: number;
}
