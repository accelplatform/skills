/**
 * ページマネージャ。
 *
 * ページ情報やページ遷移に関連する機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/PageManager/index.html
 */
declare class PageManager {
  /**
   * 設定情報からページ URL を取得します。
   * 指定したページコードに対応するページ URL を返却します。
   *
   * ページの一覧はプラグイン拡張ポイント `jp.co.intra_mart.page` で設定します。
   * 対応するページコードが存在しない場合、data は null を返します。
   *
   * @param pageCode ページコード
   * @return data にページ URL 文字列を格納した ResultObject（未登録の場合 null）
   */
  static getPageUrl(pageCode: string): ResultObject<string | null>;

  /**
   * 指定ページにリダイレクトを行います。
   * HTML フォームを作成し onload イベントの submit で実現するため、POST メソッドにも対応しています。
   *
   * onload イベントによるリダイレクトのため、Ajax リクエストの場合はリダイレクトされません。
   * Ajax コールバック内での使用は避けてください。
   * URL 内のクエリ文字列は POST 送信時にリクエストボディへ変換されます。
   *
   * @param url リダイレクト URL
   * @param method リダイレクトメソッド
   * @param parameters 拡張するリクエストパラメータ
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static redirect(url: string, method?: PageManager.Method, parameters?: { [key: string]: string }): ResultObject<null>;
}

declare namespace PageManager {
  type Method = 'GET' | 'POST';
}
