/**
 * セッション情報取得 API。
 *
 * Client.get() で取得できるオブジェクトは、Client.set() で設定したインスタンスとは
 * 別のインスタンスになる場合があります。set() 後にオブジェクトを変更しても、
 * 次回 get() 時に反映されない可能性があるため、変更後は再度 set() してください。
 *
 * intra-mart 組み込みオブジェクト（Request, Module.XXXX 等）は格納できません。
 * 格納可能なオブジェクトは、独自オブジェクト・文字列・配列に限られます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Client/index.html
 */
declare class Client {
  /**
   * クライアント固有の保存情報を取得します。
   *
   * @param key 情報を取得するためのキー
   * @return 保存されているオブジェクト。キーに対応する情報がない場合は undefined
   */
  static get(key: string): Client.Value;

  /**
   * セッションID を返します。
   *
   * @return セッションID
   */
  static identifier(): string;

  /**
   * 保存されているすべてのキーの配列を返します。
   *
   * @return キーの配列
   */
  static keys(): string[];

  /**
   * セッションのタイムアウト時間を秒単位で取得します。
   *
   * @return タイムアウト時間（秒）
   */
  static life(): number;

  /**
   * クライアント固有の保存情報を削除します。
   *
   * @param key 削除する情報のキー
   */
  static remove(key: string): void;

  /**
   * クライアント固有の情報を保存します。
   *
   * intra-mart 組み込みオブジェクト（Request, Module.XXXX 等）は格納できません。
   * 格納可能なオブジェクトは、独自オブジェクト・文字列・配列に限られます。
   *
   * @param key 情報を保存するためのキー
   * @param value 保存するオブジェクト
   */
  static set(key: string, value: Client.Value): void;

  /**
   * 指定されたミリ秒間、処理を一時停止します。
   *
   * @deprecated 代替メソッドはありません
   * @param millis 停止時間（ミリ秒）
   */
  static sleep(millis: number): void;
}

declare namespace Client {
  type Value = any;
}
