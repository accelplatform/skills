/**
 * ByteWriter アクセスクラス。
 *
 * バイナリストリームの書き込み機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ByteWriter/index.html
 */
declare class ByteWriter {
  /**
   * ストリームを閉じ、関連するシステムリソースを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * 出力ストリームをフラッシュし、バッファ内のバイトを強制的に書き込みます。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  flush(): boolean;

  /**
   * バッファからバイトを書き込みます。
   *
   * @param buffer バッファ配列または入力ストリーム
   * @param off 開始オフセット
   * @param len 書き込むバイト数
   * @return 成功した場合 true、失敗した場合 false
   */
  write(buffer: number[], offset?: number, length?: number): boolean;
}
