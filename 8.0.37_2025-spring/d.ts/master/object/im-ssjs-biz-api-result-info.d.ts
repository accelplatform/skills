/**
 * 処理結果オブジェクト。
 *
 * 任意の処理結果を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/BizApiResultInfo/index.html
 */
type BizApiResultInfo<T> = BizApiResultInfo.Success<T> | BizApiResultInfo.Failure<T>;

declare namespace BizApiResultInfo {
  interface Success<T> {
    /** 処理結果 */
    readonly data: T;
    /** エラーフラグ（true: 失敗 / false: 成功） */
    readonly error: false;
    /** エラーコード */
    readonly errorCode?: string;
    /** エラー発生時のメッセージ */
    readonly message?: string;
    /** エラー発生時のサブメッセージの配列 */
    readonly subMessages?: string[];
  }

  interface Failure<T> {
    /** 処理結果 */
    readonly data: unknown;
    /** エラーフラグ（true: 失敗 / false: 成功） */
    readonly error: true;
    /** エラーコード */
    readonly errorCode: string;
    /** エラー発生時のメッセージ */
    readonly message: string;
    /** エラー発生時のサブメッセージの配列 */
    readonly subMessages: string[];
  }
}
