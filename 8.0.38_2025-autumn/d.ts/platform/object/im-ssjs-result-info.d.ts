/**
 * 処理結果オブジェクト。
 *
 * 任意の処理結果を保持する汎用的なオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ResultInfo/index.html
 */
type ResultInfo<T> = ResultInfo.Success<T> | ResultInfo.Failure<T> | ResultInfo.Invalid<T>;

declare namespace ResultInfo {
  interface Success<T> {
    /** 結果コード（0: 成功、-1: 失敗、-2: 不正な引数） */
    readonly code: 0;  // ResultInfo.Code.Success
    /** API 固有の処理結果データ */
    readonly data: T;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: false;
    /** エラーメッセージ */
    readonly message?: string;
  }

  interface Failure<T> {
    /** 結果コード（0: 成功、-1: 失敗、-2: 不正な引数） */
    readonly code: -1;  // ResultInfo.Code.Failure
    /** API 固有の処理結果データ */
    readonly data?: unknown;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーメッセージ */
    readonly message: string;
  }

  interface Invalid<T> {
    /** 結果コード（0: 成功、-1: 失敗、-2: 不正な引数） */
    readonly code: -2;  // ResultInfo.Code.Invalid
    /** API 固有の処理結果データ */
    readonly data?: unknown;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーメッセージ */
    readonly message: string;
  }

  const Code: {
    /** 成功 */
    readonly Success: 0;
    /** 失敗 */
    readonly Failure: -1;
    /** 不正な引数 */
    readonly Invalid: -2;
  }

  type Code = (typeof Code)[keyof typeof Code];
}
