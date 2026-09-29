/**
 * データベースアクセス処理結果オブジェクト。
 *
 * クエリ結果、実行統計、エラー情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatabaseResult/index.html
 */
interface DatabaseResult {
  /** 取得または影響を受けた行数 */
  countRow: number;
  /** 取得データの配列。各要素はカラム名（小文字）でアクセス可能なレコード */
  data: { [columnName: string]: DatabaseResult.Data }[];
  /** エラーが発生した場合 true */
  error: boolean;
  /** エラーコード */
  errorCode: number;
  /** エラーメッセージ */
  errorMessage: string;
  /** 開始位置から取得可能な最大行数 */
  maxRow: number;
  /** ストアドプロシージャやファンクションに渡されたパラメータ値 */
  params: DatabaseResult.Parameter[];
  /** SELECT クエリの場合 true */
  select: boolean;
  /** 実行された SQL 文 */
  sql: string;
  /** 標準 SQL ステートコード */
  sqlState: string;

  /**
   * 処理結果に関する説明メッセージを取得します。
   *
   * @return メッセージ
   */
  getMessage(): string;

  /**
   * データベース操作が正常に完了したかどうかを判定します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  isSuccess(): boolean;
}

declare namespace DatabaseResult {
  type Data = any;
  type Parameter = any;
}
