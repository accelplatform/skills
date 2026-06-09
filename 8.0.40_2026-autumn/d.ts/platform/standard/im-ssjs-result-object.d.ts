/**
 * 汎用的な処理結果オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ResultObject/index.html
 */
type ResultObject<T> = ResultObject.Success<T> | ResultObject.Failure<T>;

declare namespace ResultObject {
  interface Success<T> {
    /** 取得した情報。機能により構造が異なります */
    readonly data: T;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: false;
    /** エラーメッセージ */
    readonly errorMessage?: string;
  }

  interface Failure<T> {
    /** 取得した情報。機能により構造が異なります */
    readonly data?: unknown;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーメッセージ */
    readonly errorMessage: string;
  }
}
