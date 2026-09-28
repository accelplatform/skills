/**
 * リクエストクラス。
 *
 * クライアントからのリクエスト情報を保持します。
 * ブラウザリクエスト毎にインスタンスが生成され、init() やアクションバインド関数に渡されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Request/index.html
 */
declare class Request {
  /**
   * URL 引数の値を取得します。
   *
   * @deprecated getParameterValues() を使用してください
   */
  get(key: string): string[];

  /**
   * リクエスト属性値を取得します。
   *
   * @param name 属性名
   * @return 属性値。見つからない場合 null
   */
  getAttribute(name: string): Request.Attribute | null;

  /**
   * リクエスト属性名の一覧を取得します。
   *
   * @return 属性名の配列
   */
  getAttributeNames(): string[];

  /**
   * メッセージボディのバイト長を取得します。
   *
   * @return バイト長。不明の場合 -1
   */
  getContentLength(): number;

  /**
   * メッセージボディの MIME タイプを取得します。
   *
   * @return MIME タイプ。不明の場合 null
   */
  getContentType(): string | null;

  /**
   * クッキーの値を取得します。
   *
   * @param name クッキー名
   * @return クッキー値。見つからない場合 null
   */
  getCookie(name: string): string | null;

  /**
   * クッキー名の一覧を取得します。
   *
   * @return クッキー名の配列。存在しない場合 null
   */
  getCookieNames(): string[] | null;

  /**
   * 指定されたクッキー名のすべての値を取得します。
   *
   * @param name クッキー名
   * @return クッキー値の配列
   */
  getCookies(name: string): string[];

  /**
   * リクエストヘッダの値を取得します。
   *
   * @param name ヘッダ名
   * @return ヘッダ値
   */
  getHeader(name: string): string;

  /**
   * リクエストヘッダ名の一覧を取得します。
   *
   * @return ヘッダ名の配列
   */
  getHeaderNames(): string[];

  /**
   * 指定されたヘッダ名のすべての値を取得します。
   *
   * @param name ヘッダ名
   * @return ヘッダ値の配列
   */
  getHeaders(name: string): string[];

  /**
   * メッセージボディを指定エンコーディングでデコードして取得します。
   *
   * @param encoding エンコーディング名
   * @return デコードされた文字列
   */
  getMessageBody(encoding: string): string;

  /**
   * メッセージボディをバイナリ文字列として取得します。
   *
   * @return バイナリ文字列
   */
  getMessageBodyAsStream(): string;

  /**
   * メッセージボディを Unicode 文字列として取得します。
   *
   * @return 文字列
   */
  getMessageBodyAsString(): string;

  /**
   * メッセージボディをバイナリストリームとして取得します。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @return ByteReader オブジェクト
   */
  openMessageBodyAsBinary(callback?: Function): ByteReader;

  /**
   * メッセージボディをテキストストリームとして取得します。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @param encoding エンコーディング名
   * @return TextReader オブジェクト
   */
  openMessageBodyAsText(callback?: Function, encoding?: string): TextReader;

  /**
   * HTTP メソッド名を取得します。
   *
   * @return 'GET', 'POST', 'PUT' 等
   */
  getMethod(): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | string;

  /**
   * パラメータを RequestParameter オブジェクトとして取得します。
   *
   * @param name パラメータ名
   * @return RequestParameter オブジェクト
   */
  getParameter(name: string): RequestParameter;

  /**
   * リクエストパラメータ名の一覧を取得します。
   *
   * @return パラメータ名の配列
   */
  getParameterNames(): string[];

  /**
   * パラメータのすべての値を RequestParameter 配列として取得します。
   *
   * @param name パラメータ名
   * @return RequestParameter の配列
   */
  getParameters(name: string): RequestParameter[];

  /**
   * URL 引数の値を取得します。
   *
   * @param key パラメータ名
   * @return 値。存在しない場合 null
   */
  getParameterValue(key: string): string | null;

  /**
   * URL 引数の値をすべて取得します。
   *
   * @param key パラメータ名
   * @return 値の配列
   */
  getParameterValues(key: string): string[];

  /**
   * クエリ文字列を取得します。
   *
   * @return クエリ文字列。存在しない場合 null
   */
  getQueryString(): string | null;

  /**
   * クエリ文字列またはメッセージボディを取得します。
   *
   * @deprecated getMessageBodyAsStream() または getQueryString() を使用してください
   */
  query(): string;

  /**
   * リクエスト属性を削除します。
   *
   * @param name 属性名
   */
  removeAttribute(name: string): void;

  /**
   * リクエスト属性を設定します。
   *
   * @param name 属性名
   * @param object 属性値
   */
  setAttribute(name: string, object: Request.Attribute): void;

  /** URL 引数へのプロパティアクセス */
  [key: string]: Request.Attribute;
}

declare namespace Request {
  type Attribute = any;
}
