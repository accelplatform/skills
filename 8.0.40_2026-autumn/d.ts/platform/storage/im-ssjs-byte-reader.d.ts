/**
 * ByteReader アクセスクラス。
 *
 * バイナリストリームの読み取り機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ByteReader/index.html
 */
declare class ByteReader {
  /**
   * ブロックなしで読み取りまたはスキップ可能な推定バイト数を返します。
   *
   * @return 読み取り可能なバイト数。失敗した場合 null
   */
  available(): number | null;

  /**
   * ストリームを閉じ、関連するシステムリソースを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * 1 バイトずつ読み取り、コールバック関数を呼び出します。
   *
   * @param callback コールバック関数（byte, index）
   * @return 成功した場合 true、失敗した場合 false
   */
  eachByte(callback: (byte: number, index: number) => void): boolean;

  /**
   * 指定されたチャンクサイズでデータを読み取り、コールバック関数を呼び出します。
   *
   * @param callback コールバック関数（byteArray, index, bytesRead）
   * @param transSize チャンクサイズ（バイト）
   * @return 成功した場合 true、失敗した場合 false
   */
  eachBytes(callback: (byteArray: number[], index: number, bytesRead: number) => void, transSize: number): boolean;

  /**
   * mark および reset 操作がサポートされているかを判定します。
   *
   * @return サポートされている場合 true。失敗した場合 null
   */
  markSupported(): boolean | null;

  /**
   * 現在のストリーム位置にマークを設定します。
   *
   * @param pos マーク位置
   * @return 成功した場合 true、失敗した場合 false
   */
  mark(pos: number): boolean;

  /**
   * バッファにバイトを読み取ります。
   *
   * @param buffer ターゲットバッファ
   * @param offset 開始オフセット
   * @param length 読み取るバイト数
   * @return 読み取ったバイト数。EOF で -1。失敗した場合 null
   */
  read(buffer?: number[], offset?: number, length?: number): number | null;

  /**
   * ストリーム位置を最後のマーク位置にリセットします。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  reset(): boolean;

  /**
   * 指定されたバイト数をスキップします。
   *
   * @param length スキップするバイト数
   * @return 実際にスキップしたバイト数。失敗時 -1 または null
   */
  skip(length: number): number | null;

  /**
   * すべてのストリームデータを ByteWriter に書き込みます。
   * size が大きいほど処理は高速になりますが、メモリ消費量も増加します。
   *
   * @param writer 書き込み先の ByteWriter
   * @param size 転送チャンクサイズ
   * @return 成功した場合 true、失敗した場合 false
   */
  transferTo(writer: ByteWriter, size?: number): boolean;
}
