/**
 * 申請結果情報オブジェクト。
 *
 * 申請処理結果として、申請処理中に作成されたシステム案件ID・ユーザデータID・案件番号を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApplyResultInfo/index.html
 */
interface ApplyResultInfo {
  // --- NOT NULL プロパティ ---

  /** 案件番号 */
  readonly matterNumber: string;
  /** システム案件ID */
  readonly systemMatterId: string;
  /** ユーザデータID */
  readonly userDataId: string;
}
