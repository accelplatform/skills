/**
 * 処理結果ステータス情報オブジェクト。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ResultStatusInfo/index.html
 */
interface ResultStatusInfo {
  // --- NOT NULL プロパティ ---

  /** エラーレベル */
  readonly level: number;
  /** 処理結果メッセージ引数の配列 */
  readonly messageArgs: string[];
  /**
   * 処理結果メッセージID
   *
   * ワークフローで想定している例外以外が発生した場合は null が返却される場合があります（例: Java の例外）。
   */
  readonly messageId: string | null;
  /** メッセージ情報オブジェクトの配列 */
  readonly subMessages: MessageInfo[];
}
