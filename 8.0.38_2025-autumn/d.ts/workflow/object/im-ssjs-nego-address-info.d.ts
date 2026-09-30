/**
 * 根回し宛先情報オブジェクト。
 *
 * 根回し宛先情報オブジェクトは下記のプロパティを持つ Object 型のオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/NegoAddressInfo/index.html
 */
interface NegoAddressInfo {
  // --- 任意項目 ---

  /** メールアドレス */
  address?: string;
  /** 名前 */
  name?: string;
  /** ユーザコード */
  userCd?: string;
}
