/**
 * トランザクション制御 API。
 *
 * データベーストランザクションの開始・コミット・ロールバックを行います。
 * トランザクションはスレッド単位で管理されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Transaction/index.html
 */
declare class Transaction {
  /**
   * トランザクションを開始します。
   * 関数を渡した場合、その関数のスコープ内でのみトランザクションが有効になり、コミット・ロールバックが自動管理されます（推奨）。
   * 例外発生時は自動的にロールバックされます。
   *
   * @param operation トランザクション内で実行する関数
   * @return データベースアクセス処理結果
   */
  static begin(operation?: Function): DatabaseResult;

  /**
   * トランザクションをコミットします。
   *
   * @return データベースアクセス処理結果
   */
  static commit(): DatabaseResult;

  /**
   * 現在のトランザクション状態を取得します。
   *
   * @return data に boolean を含む DatabaseResult（true: アクティブ、false: 非アクティブ、null: エラー）
   */
  static isTransaction(): DatabaseResult;

  /**
   * トランザクションをロールバックします。
   *
   * @return データベースアクセス処理結果
   */
  static rollback(): DatabaseResult;

  /**
   * ロールバックが予定されているかを判定します。
   *
   * @return data に boolean を含む DatabaseResult（true: ロールバック予定、false: 予定なし、null: エラー）
   */
  static toBeRollbacked(): DatabaseResult;
}
