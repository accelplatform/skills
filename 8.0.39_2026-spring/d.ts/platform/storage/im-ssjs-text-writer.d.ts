/**
 * TextWriter アクセスクラス。
 *
 * テキストストリームの書き込み機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TextWriter/index.html
 */
declare class TextWriter {
  /**
   * 文字シーケンスまたはサブシーケンスを追記します。
   *
   * @param csq 文字シーケンスまたは文字コード
   * @param start 開始位置
   * @param end 終了位置
   * @return この TextWriter。失敗した場合 null
   */
  append(csq: string | number, start?: number, end?: number): TextWriter | null;

  /**
   * ストリームを閉じ、関連するシステムリソースを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * 出力ストリームをフラッシュし、バッファ内のデータを強制的に書き込みます。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  flush(): boolean;

  /**
   * 改行文字を書き込みます。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  newLine(): boolean;

  /**
   * 文字シーケンスを書き込みます。
   *
   * @param str 文字シーケンスまたは文字コード
   * @param offset 開始オフセット
   * @param length 書き込むバイト数
   * @return 成功した場合 true、失敗した場合 false
   */
  write(str: string | number, offset?: number, length?: number): boolean;
}
