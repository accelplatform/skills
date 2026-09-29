/**
 * 簡易ユーザ情報オブジェクト。
 *
 * 代理先、代理元として設定されているユーザ情報を取得する処理の結果オブジェクトとして使用されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/SimpleUserInfo/index.html
 */
interface SimpleUserInfo {
  // --- NOT NULL プロパティ ---

  /** ユーザコード */
  readonly userCode: string;

  // --- NULLABLE プロパティ ---

  /** ユーザ名 */
  readonly userName?: string;
}
