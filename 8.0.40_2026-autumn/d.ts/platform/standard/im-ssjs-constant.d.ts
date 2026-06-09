/**
 * 定数値管理クラス。
 *
 * define() で登録した値はサーバプロセス内の全ファンクションコンテナから不変のプロパティとしてアクセスできます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Constant/index.html
 */
declare class Constant {
  /**
   * 定数値をシステムに登録します。
   * 登録後、Constant.key で値を参照できます。
   * 同一キーの再定義はできません。
   *
   * @param key プロパティ名
   * @param value 定数値
   */
  static define(key: string, value: Constant.Value): void;

  /**
   * 外部 JavaScript ファイルから定数定義を読み込みます。
   * ファイル内のグローバル変数が定数プロパティとして登録されます。
   *
   * グローバル変数には初期値の代入が必要です。
   * 初期値のない変数は定数として登録されません。
   *
   * @param src 拡張子を除いたファイル名
   */
  static load(src: string): void;

  /** 登録された定数値へのアクセス */
  static [key: string]: Constant.Value;
}

declare namespace Constant {
  type Value = any;
}
