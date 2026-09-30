/**
 * HTTP クライアント結果オブジェクト。
 *
 * HTTP リクエスト送信後の結果を表します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HttpClientResult/index.html
 */
type HttpClientResult = HttpClientResult.Success | HttpClientResult.Failure;

declare namespace HttpClientResult {
  interface Success {
    /** サーバからのレスポンス情報 */
    readonly data: HttpClientDataResult;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: false;
    /** エラーメッセージ */
    readonly errorMessage?: string;
  }

  interface Failure {
    /** サーバからのレスポンス情報 */
    readonly data?: unknown;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーメッセージ */
    readonly errorMessage: string;
  }
}
