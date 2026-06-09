/**
 * メニューグループカテゴリオブジェクト。
 *
 * メニューグループのカテゴリに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuGroupCategory/index.html
 */
interface MenuGroupCategory {
  /** カテゴリID */
  category: string;
  /** ロケールID をキー、カテゴリ名を値とするマップ */
  categoryNames: { [localeId: string]: string };
  /** 編集可能かどうか */
  editable: boolean;
  /** 選択可能かどうか */
  selectable: boolean;
}
