/**
 * ファイルやディレクトリを操作するためのクラス。
 *
 * 分散構築にて複数のコンピュータで運用している場合、ファイルを共有できません。
 * 各リクエスト・クライアント・プログラム間でファイル名が重複しないように工夫してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/File/index.html
 */
declare class File {
  /**
   * File クラスのインスタンスを生成します。
   * 相対パスが指定された場合、work/ ディレクトリを親として絶対パスを解決します。
   *
   * @param path ファイルまたはディレクトリのパス
   */
  constructor(path: string);

  /**
   * ディレクトリかどうかを判定します。
   *
   * @return ディレクトリの場合 true
   */
  isDirectory(): boolean;

  /**
   * ファイルの内容をバイナリ文字列として読み込みます。
   *
   * @return バイナリ文字列
   */
  load(): string;

  /**
   * パスを返します。
   *
   * @return ファイルまたはディレクトリのパス
   */
  path(): string;
}
