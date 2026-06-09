/**
 * セーフ URL マネージャ。
 *
 * セーフ URL リストにアクセスし、URL の安全性を確認します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SafeUrlManager/index.html
 */
declare class SafeUrlManager {
  /**
   * セーフ URL マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * セーフ URL を追加します。
   *
   * @param id セーフ URLID
   * @param url URL 文字列
   * @param isRegex 正規表現かどうか
   * @return data に追加件数を格納した ResultObject
   */
  addSafeUrl(id: string, url: string, isRegex: boolean): ResultObject<number>;

  /**
   * セーフ URL の件数を取得します。
   *
   * @param urlLike URL 部分一致文字列
   * @return data にレコード件数を格納した ResultObject
   */
  countSafeUrls(urlLike?: string): ResultObject<number>;

  /**
   * 指定ID のセーフ URL を削除します。
   *
   * @param id セーフ URLID
   * @return data に削除件数を格納した ResultObject
   */
  deleteSafeUrl(id: string): ResultObject<number>;

  /**
   * セーフ URL リストを取得します（ページング・ソート対応）。
   *
   * @param start 取得開始位置
   * @param length 取得件数
   * @param orderBy ソート順
   * @param urlLike URL 部分一致文字列
   * @return data にセーフ URL 情報の配列を格納した ResultObject
   */
  fetchSafeUrls(start: number, length: number, orderBy: string, urlLike?: string): ResultObject<SafeUrl[]>;

  /**
   * 指定ID のセーフ URL を取得します。
   *
   * @param id セーフ URLID
   * @return data にセーフ URL 情報（存在しない場合 null）を格納した ResultObject
   */
  getSafeUrl(id: string): ResultObject<SafeUrl | null>;

  /**
   * セーフ URL リストを取得します。
   *
   * @return data にセーフ URL 情報の配列を格納した ResultObject
   */
  getSafeUrls(): ResultObject<SafeUrl[]>;

  /**
   * 指定された URL がセーフリストに存在するかを確認します。
   *
   * @param url 確認対象の URL
   * @param safeUrls セーフ URL の配列（省略時はシステム設定を使用）
   * @return data に安全性判定結果を格納した ResultObject（true: 安全）
   */
  isSafe(url: string, safeUrls?: SafeUrl[]): ResultObject<boolean>;

  /**
   * 指定ID のセーフ URL を更新します。
   *
   * @param id セーフ URLID
   * @param url URL 文字列
   * @param isRegex 正規表現かどうか
   * @return data に更新件数を格納した ResultObject
   */
  updateSafeUrl(id: string, url: string, isRegex: boolean): ResultObject<number>;
}
