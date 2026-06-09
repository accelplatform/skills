/**
 * TextReader アクセスクラス。
 *
 * テキストストリームの読み取り機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TextReader/index.html
 */
declare class TextReader {
  /**
   * ストリームを閉じ、関連するシステムリソースを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * 1 行ずつ読み取り、コールバック関数を呼び出します。
   *
   * @param callback コールバック関数（line, index）
   * @return 成功した場合 true、失敗した場合 false
   */
  eachLine(callback: (line: string, index: number) => void): boolean;

  /**
   * mark および reset 操作がサポートされているかを判定します。
   *
   * @return サポートされている場合 true、サポートされていない場合 false
   */
  markSupported(): boolean;

  /**
   * 現在のストリーム位置にマークを設定します。
   *
   * @param readAheadLimit マーク位置
   * @return 成功した場合 true、失敗した場合 false
   */
  mark(readAheadLimit: number): boolean;

  /**
   * 1 行分のテキストを読み取ります（行末文字は含まれません）。
   *
   * @return 行文字列。ストリーム終端で null
   */
  readLine(): string | null;

  /**
   * バッファに文字を読み取ります。
   *
   * @param buffer ターゲットバッファ
   * @param offset 開始オフセット
   * @param length 読み取る文字数
   * @return 読み取った文字数。EOF で -1。失敗した場合 null
   */
  read(buffer?: number[], offset?: number, length?: number): number | null;

  /**
   * ストリームが読み取り可能かを判定します。
   * false が返された場合でも、次の読み取りが確実にブロックするというわけではありません。
   *
   * @return ブロックなしで読み取り可能な場合 true。失敗した場合 null
   */
  ready(): boolean | null;

  /**
   * ストリーム位置をマーク位置にリセットします。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  reset(): boolean;

  /**
   * 指定された文字数をスキップします。
   *
   * @param n スキップする文字数
   * @return 実際にスキップした文字数。失敗した場合 null
   */
  skip(n: number): number | null;

  /**
   * すべてのストリームデータを TextWriter に書き込みます。
   *
   * @param writer 書き込み先の TextWriter
   * @param transSize 転送チャンクサイズ
   * @return 成功した場合 true、失敗した場合 false
   */
  transferTo(writer: TextWriter, transSize?: number): boolean;
}
