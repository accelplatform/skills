/**
 * 永続情報操作クラス。
 *
 * リクエスト間・クライアント間・サーバ間で共有の値を操作します。
 * データは Storage に保存され、明示的に削除しない限り永続化されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Permanent/index.html
 */
declare class Permanent {
  /**
   * 永続情報操作クラスのインスタンスを生成します。
   *
   * @param domain 格納先ディレクトリ名。OS のファイル命名規則に準拠した値を指定してください
   * @param group カテゴリ識別子
   */
  constructor(domain: string, group: string);

  /**
   * カテゴリ内のすべてのデータを取得します。
   *
   * @return キーをプロパティ名としたオブジェクト
   */
  elements(): Permanent.Object;

  /**
   * 指定されたドメインのカテゴリ・キー一覧を返します。
   *
   * @param domain ドメイン名
   * @return カテゴリ・キーの配列。返却順序は保証されません
   */
  static entries(domain: string): string[];

  /**
   * カテゴリのすべてのデータとカテゴリ自体を削除します。
   *
   * @return 削除されたデータ。データがない場合は空オブジェクト
   */
  extinction(): Permanent.Object;

  /**
   * 指定されたキーのデータを取得します。
   *
   * @param key キー
   * @return データ。キーが存在しない場合 null
   */
  get(key: string): Permanent.Value | null;

  /**
   * カテゴリ内のすべてのキーを取得します。
   *
   * @return キーの配列。返却順序は保証されません
   */
  keys(): string[];

  /**
   * 指定されたキーのデータを削除します。
   *
   * @param key キー
   * @return 削除されたデータ。キーが存在しない場合 null
   */
  remove(key: string): Permanent.Value | null;

  /**
   * 指定されたキーでデータを格納します。
   *
   * @param key キー
   * @param value 格納する値
   * @return 以前の値。新規の場合 null
   */
  set(key: string, value: Permanent.Value): Permanent.Value | null;
}

declare namespace Permanent {
  type Value = any;
  type Object = { [key: string]: Permanent.Value };
}
