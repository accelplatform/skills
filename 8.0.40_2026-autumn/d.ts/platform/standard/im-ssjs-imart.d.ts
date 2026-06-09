/**
 * IMART タグ管理 API。
 *
 * プレゼンテーションページとの連携 API を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Imart/index.html
 */
declare class Imart {
  /**
   * HTML ソースコードを解析・コンパイルし、実行可能な InnerText を返します。
   *
   * @param src 解析する HTML ソース
   * @param engine タグ解析仕様オブジェクト
   * @return 実行可能な InnerText オブジェクト
   */
  static compile(src: string, engine: Imart.Engine): InnerText;

  /**
   * IMART タグの属性値に対する定数定義を登録します。
   * ダブルクォートで囲まれた属性値に適用されます。
   *
   * @param name 定義名
   * @param value 実行時の値
   */
  static defineAttribute(name: string, value: Imart.Value): void;

  /**
   * IMART タグの実行関数を登録します。
   *
   * @param name 定義名
   * @param func 実行関数
   */
  static defineType(name: string, func: (attribute: Imart.Attribute, inner: InnerText) => string): void;

  /**
   * 登録済みの IMART タグ定義関数を直接実行します。
   *
   * @deprecated 代替メソッドはありません
   * @param name IMART タグ定義名
   * @param attribute タグ引数オブジェクト
   * @param inner 実行可能な内部コンテンツ
   * @return 生成された HTML
   */
  static execute(name: string, attribute: Imart.Attribute, inner: InnerText): string;

  /**
   * 指定された IMART タグ定義が存在するかを判定します。
   * Imart.defineType() で定義されたタグのみを判定対象とします。
   *
   * @param name 定義名
   * @return 存在する場合 true
   */
  static isType(name: string): boolean;
}

declare namespace Imart {
  type Engine = any;
  type Value = any;
  type Attribute = any;
}
