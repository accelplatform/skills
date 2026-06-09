/**
 * ショートカット情報オブジェクト。
 *
 * ショートカット URL に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ShortCutInfo/index.html
 */
interface ShortCutInfo {
  /** 許可ユーザのユーザID の配列 */
  allowUsers: string[];
  /** ユーザ認証が必要かどうか */
  isAuth: boolean;
  /** 表示対象 URL */
  url: string;
  /** URL 引数オブジェクト */
  urlParams: { [key: string]: string };
  /** URL 引数オブジェクト内のキー値 */
  urlParamsKey: string;
  /** 有効期限。null の場合はシステム日付 */
  validEndDate: Date | null;
  /** 拡張検証用コード */
  validationCode: string;
  /** 検証コードに対応するパラメータ値 */
  validationParam: string;
}
