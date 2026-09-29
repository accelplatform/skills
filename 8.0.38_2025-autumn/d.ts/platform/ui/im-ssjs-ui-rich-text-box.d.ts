/**
 * リッチテキストボックス操作 API。
 *
 * imuiRichtextbox タグで生成されるリッチテキストボックスの操作機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/UIRichTextBox/index.html
 */
declare class UIRichTextBox {
  /**
   * HTML 文字列から画像情報を解析し、対応するパブリックストレージのファイルパスを返します。
   *
   * @param html 解析対象の HTML 文字列
   * @return data にパブリックストレージのファイルパス配列（画像がない場合 null）を格納した ResultObject
   */
  static getPaths(html: string): ResultObject<string[] | null>;
}
