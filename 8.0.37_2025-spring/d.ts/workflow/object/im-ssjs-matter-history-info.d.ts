/**
 * 処理履歴情報オブジェクト。
 *
 * MatterHistory#getMatterHistory() で取得される処理履歴情報を保持するオブジェクトです。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterHistoryInfo/index.html
 */
interface MatterHistoryInfo {
  // --- NOT NULL プロパティ ---

  /** 代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly actFlag: FlagStatus;
  /** 処理日時（'yyyy/MM/dd HH:mm:ss' 形式の文字列） */
  readonly endDate: string;
  /** ノードID */
  readonly nodeId: string;
  /** 代理・振替の場合、代理・振替元（元々処理すべきユーザの）ユーザコードの配列 */
  readonly originalAuthList: string[];
  /** ステータスコード */
  readonly statusCd: string;
  /** 代理・振替の場合、代理・振替先（処理を依頼されたユーザの）ユーザコードの配列 */
  readonly targetAuthList: string[];
  /** タスクID */
  readonly taskId: string;
  /** 振替フラグ（'0': 振替なし / '1': 振替あり） */
  readonly transferFlag: FlagStatus;

  // --- NULLABLE プロパティ ---

  /** 権限者組織名 */
  readonly authOrgzName?: string;
  /** 権限者名 */
  readonly authUserName?: string;
  /** 実行者名 */
  readonly executeUserName?: string;
  /** ノード名 */
  readonly nodeName?: string;
  /** 処理コメント */
  readonly processComment?: string;
  /** ステータス名 */
  readonly statusName?: string;
}
