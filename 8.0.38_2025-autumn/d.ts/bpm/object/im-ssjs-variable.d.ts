/**
 * 変数情報オブジェクト。
 *
 * 変数の情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/Variable/index.html
 */
interface Variable {
  /** 変数名 */
  readonly name: string;
  /** スコープ */
  readonly scope: string;
  /** タイプ */
  readonly type: string;
  /** 値 */
  readonly value: any;
}
