/**
 * 拡張インポートマネージャ。
 *
 * 拡張インポート処理を実行するマネージャクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ExtendsImportManager/index.html
 */
declare class ExtendsImportManager {
  /**
   * 拡張インポート処理を実行します。
   * 引数 module には Java クラス名、またはサーバサイド JavaScript ソースパスを指定します。
   *
   * @param module Java クラス名またはサーバサイド JavaScript ソースパス
   * @return 成功した場合 true、失敗した場合 false
   */
  static doImport(module: string): boolean;
}
