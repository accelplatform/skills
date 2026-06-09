/**
 * クッキークラス。
 *
 * クッキーを生成するためのクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Cookie/index.html
 */
declare class Cookie {
  /**
   * 指定された名前と値で、Cookie クラスのインスタンスを生成します。
   *
   * @param name クッキー名
   * @param value クッキー値
   */
  constructor(name: string, value: string);

  /**
   * クッキーの目的を説明するコメントを取得します。
   *
   * @return コメント文字列。未設定の場合 null
   */
  getComment(): string | null;

  /**
   * クッキーのドメイン名を取得します。
   *
   * @return ドメイン名
   */
  getDomain(): string;

  /**
   * クッキーの最大有効期間を秒単位で取得します。
   *
   * @return 最大有効期間（秒）
   */
  getMaxAge(): number;

  /**
   * クッキー名を取得します。
   *
   * @return クッキー名
   */
  getName(): string;

  /**
   * クッキーを返すサーバ上のパスを取得します。
   *
   * @return サーバパス
   */
  getPath(): string;

  /**
   * セキュアプロトコルでのみ送信するかどうかを取得します。
   *
   * @return セキュアプロトコルが必要な場合 true
   */
  getSecure(): boolean;

  /**
   * クッキーの値を取得します。
   *
   * @return クッキー値
   */
  getValue(): string;

  /**
   * クッキーのプロトコルバージョンを取得します。
   *
   * @return プロトコルバージョン
   */
  getVersion(): number;

  /**
   * HTTP のみのアクセスに制限されているかどうかを取得します。
   *
   * @return HTTP のみの場合 true
   */
  isHttpOnly(): boolean;

  /**
   * クッキーの目的を説明するコメントを設定します。
   *
   * @param purpose コメント文字列
   */
  setComment(purpose: string): void;

  /**
   * クッキーのドメインを設定します。
   *
   * @param domain ドメイン名
   */
  setDomain(domain: string): void;

  /**
   * クッキーを HTTP のみのアクセスに制限するかどうかを設定します。
   *
   * @param isHttpOnly HTTP のみに制限する場合 true
   */
  setHttpOnly(isHttpOnly: boolean): void;

  /**
   * クッキーの最大有効期間を秒単位で設定します。
   * 負の値: セッション終了時に削除、0: 即時削除、正の値: 有効期間（秒）。
   *
   * @param expiry 最大有効期間（秒）
   */
  setMaxAge(expiry: number): void;

  /**
   * クッキーを返すサーバ上のパスを設定します。
   *
   * @param uri サーバパス
   */
  setPath(uri: string): void;

  /**
   * セキュアプロトコルでのみクッキーを送信するかどうかを設定します。
   *
   * @param isSecure セキュアプロトコルが必要な場合 true
   */
  setSecure(isSecure: boolean): void;

  /**
   * クッキーの値を設定します。
   *
   * @param newValue 新しいクッキー値
   */
  setValue(newValue: string): void;

  /**
   * クッキーのプロトコルバージョンを設定します。
   *
   * @param version プロトコルバージョン
   */
  setVersion(version: number): void;
}
