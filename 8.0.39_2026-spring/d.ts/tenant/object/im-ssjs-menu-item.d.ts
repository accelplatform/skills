/**
 * メニューアイテムオブジェクト。
 *
 * メニューの各項目に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuItem/index.html
 */
interface MenuItem {
  /** URL パラメータ */
  arguments: { [key: string]: string };
  /** メニューの説明 */
  description: string;
  /** ロケールID をキー、表示名を値とするマップ */
  displayNames: { [localeId: string]: string };
  /** 16x16 アイコンパス */
  icon16: string;
  /** 32x32 アイコンパス */
  icon32: string;
  /** 48x48 アイコンパス */
  icon48: string;
  /** 画像パス */
  imagePath: string;
  /** メニューID */
  menuId: string;
  /** HTTP メソッド */
  method: string;
  /** 元メニューID */
  originalMenuId: string;
  /** ソート番号 */
  sortNumber: number;
  /** メニュー種別 */
  type: string;
  /** URL */
  url: string;
  /** iframe を使用するかどうか */
  useIframe: boolean;
  /** ポップアップを使用するかどうか */
  usePopup: boolean;
}
