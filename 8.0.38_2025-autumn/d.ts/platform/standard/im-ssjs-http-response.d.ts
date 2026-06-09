/**
 * HTTP レスポンスクラス。
 *
 * Web#getHTTPResponse() で取得し、レスポンスヘッダ・ステータスコード・メッセージボディを操作します。
 * 送信メソッド実行後、JavaScript の実行は停止します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HTTPResponse/index.html
 */
declare class HTTPResponse {
  /**
   * レスポンスにクッキーを追加します。
   *
   * @param cookie クッキーオブジェクト
   */
  addCookie(cookie: Cookie): void;

  /**
   * 日付ベースのレスポンスヘッダを追加します。
   *
   * @param name ヘッダ名
   * @param date 日付値（Date オブジェクトまたはミリ秒）
   */
  addDateHeader(name: string, date: Date | number): void;

  /**
   * レスポンスヘッダを追加します。
   *
   * @param name ヘッダ名
   * @param value ヘッダ値
   */
  addHeader(name: string, value: string): void;

  /**
   * エラーレスポンスを送信します。
   *
   * @param sc ステータスコード
   * @param msg エラーメッセージ
   * @return 成功した場合 true、失敗した場合 false
   */
  sendError(sc: number, msg?: string): boolean;

  /**
   * 生データストリームを送信します。
   *
   * @param strm データストリーム
   */
  sendMessageBody(strm: string): void;

  /**
   * Storage のバイナリデータを送信します。
   *
   * @param source ストレージオブジェクト（PublicStorage, SystemStorage, SessionScopeStorage）
   */
  sendMessageBodyAsBinary(source: Storage): void;

  /**
   * Storage のテキストデータを指定エンコーディングで送信します。
   *
   * @param source ストレージオブジェクト
   * @param charsetName 文字エンコーディング名
   */
  sendMessageBodyAsText(source: Storage, charsetName: string): void;

  /**
   * ファイルの内容を送信します。
   *
   * @param file 送信するファイル
   * @param isDelete 送信後にファイルを削除する場合 true
   */
  sendMessageBodyFile(file: File, isDelete?: boolean): void;

  /**
   * テキストデータを送信します。文字エンコーディングは自動変換されます。
   *
   * @param str 送信する文字列
   */
  sendMessageBodyString(str: string): void;

  /**
   * メッセージボディのバイト長を設定します。
   *
   * @param len バイト長
   */
  setContentLength(len: number): void;

  /**
   * Content-Type ヘッダを設定します。
   *
   * @param type コンテントタイプ
   */
  setContentType(type: string): void;

  /**
   * 日付ベースのレスポンスヘッダを設定します。
   *
   * @param name ヘッダ名
   * @param date 日付値（Date オブジェクトまたはミリ秒）
   */
  setDateHeader(name: string, date: Date | number): void;

  /**
   * レスポンスヘッダを設定（上書き）します。
   *
   * @param name ヘッダ名
   * @param value ヘッダ値
   */
  setHeader(name: string, value: string): void;

  /**
   * HTTP ステータスコードを設定します。
   *
   * @param sc ステータスコード
   */
  setStatus(sc: number): void;
}
