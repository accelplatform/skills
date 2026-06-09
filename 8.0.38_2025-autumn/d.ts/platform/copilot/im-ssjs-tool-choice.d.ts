/**
 * ツール選択情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ToolChoice/index.html
 */
type ToolChoice = ToolChoice.Auto | ToolChoice.Required | ToolChoice.Tool | ToolChoice.None;

declare namespace ToolChoice {
  interface Auto {
    /** ツール選択方式 */
    type: 'auto';
  }

  interface Required {
    /** ツール選択方式 */
    type: 'required';
  }

  interface Tool {
    /** 'tool' タイプ選択時に呼び出す関数名 */
    functionName: string;
    /** ツール選択方式 */
    type: 'tool';
  }

  interface None {
    /** ツール選択方式 */
    type: 'none';
  }
}
