/**
 * Web 関連 API。
 *
 * Web サーバおよび HTTP リクエスト・レスポンス情報へのアクセスを提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Web/index.html
 */
declare class Web {
  /**
   * Web サーバのベース URL を取得します。
   *
   * @return 'http://server:port/path' 形式の URL
   */
  static base(): string;

  /**
   * 現在処理中のページパスを取得します。
   *
   * @return ページパス
   */
  static current(): string;

  /**
   * リダイレクト用に URL をエンコードします。
   *
   * @param url エンコードする URL
   * @return エンコードされた URL
   */
  static encodeRedirectURL(url: string): string;

  /**
   * セッションID を含めて URL をエンコードします。
   *
   * @param url エンコードする URL
   * @return エンコードされた URL
   */
  static encodeURL(url: string): string;

  /**
   * リクエスト URI のコンテキスト部分を取得します。
   *
   * @return コンテキストパス
   */
  static getContextPath(): string;

  /**
   * CGI 環境変数を取得します。
   *
   * @param refName 環境変数名
   * @return 環境変数値
   */
  static getenv(refName: string): string;

  /**
   * HTTP レスポンスオブジェクトを取得します。
   *
   * @return HTTPResponse オブジェクト
   */
  static getHTTPResponse(): HTTPResponse;

  /**
   * プロトコル名とバージョンを取得します。
   *
   * @return 'HTTP/1.1' 等
   */
  static getProtocol(): string;

  /**
   * クライアントの IP アドレスを取得します。
   *
   * Web サーバがリバースプロキシの背後にある場合、Web サーバの IP アドレスが取得されることがあります。
   * この場合、HTTP ヘッダ 'X-Forwarded-For' を参照してクライアントの IP アドレスを取得してください。
   *
   * @return IP アドレス
   */
  static getRemoteAddr(): string;

  /**
   * クライアントの完全修飾ドメイン名を取得します。
   *
   * @return FQDN または IP アドレス
   */
  static getRemoteHost(): string;

  /**
   * リクエストオブジェクトを取得します。
   *
   * @return Request オブジェクト
   */
  static getRequest(): Request;

  /**
   * リクエストスキームを取得します。
   *
   * @return 'http', 'https' 等
   */
  static getScheme(): string;

  /**
   * リクエストを受信したサーバのホスト名を取得します。
   *
   * @return ホスト名
   */
  static getServerName(): string;

  /**
   * リクエストに使用されたポート番号を取得します。
   *
   * @return ポート番号
   */
  static getServerPort(): number;

  /**
   * Web サーバ名を取得します。
   *
   * @return サーバ名
   */
  static host(): string;

  /**
   * リクエストがセキュアチャネル（HTTPS）かどうかを判定します。
   *
   * @return HTTPS の場合 true
   */
  static isSecure(): boolean;

  /**
   * リクエスト URL を取得します。
   *
   * @return URL 文字列
   */
  static location(): string;

  /**
   * Web サーバの HTTP 待受ポート番号を取得します。
   *
   * @return ポート番号
   */
  static port(): number;

  /**
   * Web サーバのプロトコルを取得します。
   *
   * @return プロトコル名
   */
  static protocol(): string;

  /**
   * リクエスト元のページパスを取得します。
   *
   * @return ページパス
   */
  static referer(): string;

  /**
   * Web サーバのスクリプトファイル名を取得します。
   *
   * @return スクリプトファイル名
   */
  static script(): string;

  /**
   * HTTP レスポンスヘッダを設定します。
   *
   * @param name ヘッダ名
   * @param value ヘッダ値
   */
  static setHTTPResponseHeader(name: string, value: string): void;
}
