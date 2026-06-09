/**
 * HTTP クライアントクラス。
 *
 * HTTP リクエストの送信機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/HttpClient/index.html
 */
declare class HttpClient {
  /**
   * HttpClient クラスのインスタンスを作成します。
   *
   * @param parameters 設定オブジェクト（タイムアウト、リダイレクト、SSL エラー処理等）
   */
  constructor(parameters?: HttpClient.ConstructorParameters);

  /** クッキーストア */
  cookieStore: HttpClientCookie[];

  /**
   * 関連するすべてのリソースを解放します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  close(): boolean;

  /**
   * DELETE リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  doDelete(url: string, parameters?: HttpClient.DeleteParameters): HttpClientResult;

  /**
   * GET リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  get(url: string, parameters?: HttpClient.GetParameters): HttpClientResult;

  /**
   * HEAD リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  head(url: string, parameters?: HttpClient.HeadParameters): HttpClientResult;

  /**
   * OPTIONS リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  options(url: string, parameters?: HttpClient.OptionsParameters): HttpClientResult;

  /**
   * PATCH リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  patch(url: string, parameters?: HttpClient.PatchParameters): HttpClientResult;

  /**
   * POST リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  post(url: string, parameters?: HttpClient.PostParameters): HttpClientResult;

  /**
   * PUT リクエストを実行します。
   *
   * @param url リクエスト URL
   * @param parameters リクエストパラメータ
   * @return リクエスト結果
   */
  put(url: string, parameters?: HttpClient.PutParameters): HttpClientResult;
}

declare namespace HttpClient {
  type ConstructorParameters = {
    /**
     * コネクションプールから利用可能な接続を取得する際のタイムアウト値（単位：ミリ秒）。
     *
     * プールが枯渇している場合に、接続が返却されるまで待機する最大時間を指定します。
     * 内部的に Apache HttpClient の RequestConfig.Builder#setConnectionRequestTimeout() に渡されます。
     *
     * @default -1（無制限）
     */
    'connection-request-timeout-millis'?: number;

    /**
     * リモートホストへの TCP 接続（コネクション）確立に要する最大時間（単位：ミリ秒）。
     *
     * 既に確立済みのコネクションを再利用する場合は、この設定値は参照されません。
     * 内部的に Apache HttpClient の RequestConfig.Builder#setConnectTimeout() に渡されます。
     *
     * @default -1（無制限）
     */
    'connect-timeout-millis'?: number;

    /**
     * ソケットの読み取りタイムアウト値（SO_TIMEOUT）（単位：ミリ秒）。
     *
     * 接続確立後、サーバからのデータ受信を待つ最大待機時間を指定します。
     * 内部的に Apache HttpClient の RequestConfig.Builder#setSocketTimeout() に渡されます。
     *
     * @default -1（無制限）
     */
    'socket-timeout-millis'?: number;

    /**
     * HTTP リダイレクト（3xx レスポンス）を自動的に追従するかどうかを指定します。
     *
     * @default true
     */
    'redirects-enabled'?: boolean;

    /**
     * 自動リダイレクトを追従する場合の最大リダイレクト回数。
     *
     * この回数を超えるとエラーとなります。
     *
     * @default 50
     */
    'max-redirects'?: number;

    /**
     * `true` を指定した場合、SSL 証明書のエラーを無視します。
     *
     * 自己署名証明書や検証に失敗する証明書でも接続を許可します。
     * セキュリティリスクがあるため、テスト用途以外では使用しないでください。
     *
     * @default false
     */
    'ignore-ssl-errors'?: boolean;

    /**
     * その他のパラメータ
     */
    [key: string]: any;
  };

  type DeleteParameters = WithBodyParameters;

  type GetParameters = WithBodyParameters;

  type HeadParameters = WithBodyParameters;

  type OptionsParameters = WithBodyParameters;

  type PatchParameters = MultipartParameters;

  type PostParameters = MultipartParameters;

  type PutParameters = MultipartParameters;

  type StringBodyParameters = {
    /**
     * リクエストヘッダのマップ。
     */
    headers: {
      /** Content-Type ヘッダ */
      'Content-Type': string;

      /** その他のヘッダ */
      [key: string]: string;
    };

    /**
     * リクエストボディ。文字列またはオブジェクトを指定できます。
     *
     * 文字列を指定した場合は、そのままリクエストボディとして送信します。
     * オブジェクトを指定した場合は、application/x-www-form-urlencoded 形式でリクエストを送信します。
     */
    body: string;
  };

  type ObjectBodyParameters = {
    /**
     * リクエストヘッダのマップ。
     */
    headers?: HeaderParameter;

    /**
     * リクエストボディ。文字列またはオブジェクトを指定できます。
     *
     * 文字列を指定した場合は、そのままリクエストボディとして送信します。
     * オブジェクトを指定した場合は、application/x-www-form-urlencoded 形式でリクエストを送信します。
     */
    body?: BodyParameter;
  };

  type WithBodyParameters = (StringBodyParameters | ObjectBodyParameters) & {
    /**
     * リクエストの文字エンコード。指定しない場合は UTF-8 が使用されます。
     * @default UTF-8
     */
    'default-charset'?: string;
  };

  type MultipartParameters = WithBodyParameters & {
    /**
     * リクエストを multipart/form-data 形式で送信するかどうかを指定します。
     * @default false
     */
    multipart?: boolean;
  };

  type HeaderParameter = { [key: string]: string };

  type BodyParameter = { [key: string]: string | StorageParameter | File };

  type StorageParameter =
    /** システムストレージ */
    | SystemStorage
    /** パブリックストレージ */
    | PublicStorage
    /** ストレージ、Content-Type、ファイル名 の組み合わせ */
    | [SystemStorage | PublicStorage, string, string];
}
