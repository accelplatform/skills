/**
 * リクエストパラメータ情報クラス。
 *
 * ファイルアップロードデータ、ヘッダ、パラメータ値を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/RequestParameter/index.html
 */
declare class RequestParameter {
  /**
   * アップロードされたファイルのファイル名を取得します。
   * ファイルアップロード以外のリクエストでは null を返します。
   *
   * @return ファイル名。ファイルアップロード以外の場合 null
   */
  getFileName(): string | null;

  /**
   * 指定されたヘッダの値を取得します。
   *
   * @param name ヘッダ名
   * @return ヘッダ値
   */
  getHeader(name: string): string;

  /**
   * パラメータエンティティに関連するすべてのヘッダ名を取得します。
   *
   * @return ヘッダ名の配列。ヘッダがない場合 null
   */
  getHeaderNames(): string[] | null;

  /**
   * データのバイト長を取得します。
   *
   * @return バイト長
   */
  getLength(): number;

  /**
   * パラメータ名を取得します。
   *
   * @return パラメータ名
   */
  getName(): string;

  /**
   * 文字エンコーディング変換済みのパラメータ値を取得します。
   *
   * @return パラメータ値
   */
  getValue(): string;

  /**
   * 文字変換なしのパラメータ値を取得します。
   *
   * @deprecated openValueAsBinary() または openValueAsText() を使用してください
   * @return バイナリ文字列
   */
  getValueAsStream(): string;

  /**
   * パラメータ値をバイナリストリームとして取得します。
   * ファイルアップロード用です。
   *
   * @param callback コールバック関数
   * @return ByteReader 読み取ったデータ
   */
  openValueAsBinary(callback?: Function): ByteReader;

  /**
   * パラメータ値をテキストストリームとして取得します。
   *
   * @param callback コールバック関数
   * @param charsetName エンコーディング名
   * @return TextReader 読み取ったデータ
   */
  openValueAsText(callback?: Function, charsetName?: string): TextReader;
}
