/**
 * プロシージャクラス。
 *
 * JavaScript 関数やオブジェクトを登録し、後から利用可能にします。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Procedure/index.html
 */
declare class Procedure {
  /**
   * JavaScript 関数またはオブジェクトを登録します。
   * 登録後、Procedure.key() でアクセスできます。
   *
   * @param key プロパティ名
   * @param value 登録する関数またはオブジェクト
   */
  static define(key: string, value: Procedure.Value): void;

  /** 登録された関数・オブジェクトへのアクセス */
  static [key: string]: Procedure.Value;
}

declare namespace Procedure {
  type Value = any;
}
