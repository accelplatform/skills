/**
 * 埋め込みアクションクラス。
 *
 * テキストの埋め込みベクトルを計算します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/EmbeddingsAction/index.html
 */
declare class EmbeddingsAction {
  /**
   * 埋め込みアクションクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * テキストの埋め込みベクトルを計算します。
   *
   * @param text 埋め込み対象のテキスト
   * @param option 埋め込みオプション
   * @return data に埋め込みベクトルの数値配列を格納した ResultObject
   */
  execute(text: string, option?: EmbeddingsOption): ResultObject<number[]>;

  /**
   * アクション種別を返します。
   *
   * @return 'embeddings'
   */
  getActionType(): 'embeddings';

  /**
   * ドライバ種別を返します。
   *
   * @return 'open-ai', 'azure-open-ai', 'amazon-bedrock' のいずれか
   */
  getDriverType(): 'open-ai' | 'azure-open-ai' | 'amazon-bedrock';
}
