/**
 * メッセージ情報オブジェクト。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MessageInfo/index.html
 */
interface MessageInfo {
  // --- NOT NULL プロパティ ---

  /** メッセージ画面表示フラグ */
  readonly displayFlag: boolean;
  /** メッセージ引数の配列 */
  readonly messageArgs: string[];
  /** メッセージID */
  readonly messageId: string;
}
