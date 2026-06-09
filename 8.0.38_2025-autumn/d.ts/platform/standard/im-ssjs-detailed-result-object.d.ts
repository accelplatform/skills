/**
 * 詳細なエラー情報が格納可能な処理結果オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DetailedResultObject/index.html
 */
type DetailedResultObject<T> = DetailedResultObject.Success<T> | DetailedResultObject.Failure<T>;

declare namespace DetailedResultObject {
  interface Success<T> {
    /** 取得した情報。機能により構造が異なります */
    readonly data: T;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: false;
    /** エラーコード（xxxx.yyyy.zzzz 形式） */
    readonly errorCode?: string;
    /** エラー補足情報。errorCode に対応する構造を持ちます */
    readonly errorData?: unknown;
    /** エラーメッセージ */
    readonly errorMessage?: string;
  }

  interface Failure<T> {
    /** 取得した情報。機能により構造が異なります */
    readonly data?: unknown;
    /** エラー判定フラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーコード（xxxx.yyyy.zzzz 形式） */
    readonly errorCode: string;
    /** エラー補足情報。errorCode に対応する構造を持ちます */
    readonly errorData?: unknown;
    /** エラーメッセージ */
    readonly errorMessage: string;
  }
}
