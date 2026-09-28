/**
 * マイメニューアイテムオブジェクト。
 *
 * マイメニューの各項目に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MyMenuItem/index.html
 */
interface MyMenuItem {
  /** 表示名 */
  displayName: string;
  /** 画像パス */
  imagePath: string;
  /** メニューID */
  menuId: string;
  /** 元メニューID */
  originalMenuId: string;
  /** ソート番号 */
  sortNumber: number;
  /** メニュー種別 */
  type: string;
  /** URL */
  url: string;
}
