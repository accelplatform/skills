/**
 * キャッシュクラス。
 *
 * スクリプト開発モデル向けのキャッシュ機能を提供します。
 * キャッシュ設定は WEB-INF/conf/im-ehcache-config/{name}.xml で定義します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Cache/index.html
 */
declare class Cache {
  /**
   * Cache クラスのインスタンスを生成します。
   *
   * @param cacheName キャッシュ設定ファイルで定義されたキャッシュ名
   */
  constructor(cacheName: string);

  /**
   * キャッシュの内容を取得します。
   *
   * @param key キー
   * @return キャッシュされたオブジェクト。見つからない場合 null
   */
  get(key: string): Cache.Value;

  /**
   * キャッシュに内容を登録します。
   * 値はシリアライズ可能なオブジェクトである必要があります。
   *
   * @param key キー
   * @param value キャッシュする値
   */
  put(key: string, value: Cache.Value): void;

  /**
   * 指定されたキーに対するキャッシュを削除します。
   *
   * @param key キー
   */
  remove(key: string): void;

  /**
   * キャッシュに含まれる全ての内容を削除します。
   */
  removeAll(): void;
}

declare namespace Cache {
  type Value = any;
}
