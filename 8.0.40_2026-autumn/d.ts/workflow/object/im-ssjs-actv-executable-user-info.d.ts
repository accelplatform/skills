/**
 * タスク実行可能ユーザ情報オブジェクト。
 *
 * 未完了案件に対する処理権限者情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvExecutableUserInfo/index.html
 */
interface ActvExecutableUserInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** フローID */
  readonly flowId: string;
  /** ロケールID */
  readonly localeId: string;
  /** ノードID */
  readonly nodeId: string;
  /** システム案件ID */
  readonly systemMatterId: string;

  // --- NULLABLE プロパティ ---

  /** タスク権限者組織情報の配列 */
  readonly actvExecutableUserOrgzInfo?: ActvExecutableUserOrgzInfo[];
  /** 権限者名 */
  readonly authUserName?: string;
  /** 無効フラグ（'0': タスク実行可 / '1': タスク実行不可） */
  readonly invalidFlag?: FlagStatus;
}
