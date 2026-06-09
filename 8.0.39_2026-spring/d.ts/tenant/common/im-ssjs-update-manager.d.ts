/**
 * 更新マネージャ。
 *
 * マスタデータなどの最終更新日付を管理し、メモリ上のデータ更新を効率的に行います。
 *
 * 注意:
 * システムが使用する更新管理キーは「im_」で開始されます。
 * そのようなキーに対する更新系 API の使用は禁止されています。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/UpdateManager/index.html
 */
declare class UpdateManager {
  /**
   * 更新マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 保存されている更新管理キーの一覧を取得します。
   *
   * @return 更新管理キーの文字列配列。失敗した場合 null
   */
  getKeys(): string[] | null;

  /**
   * 更新日付を取得します。
   *
   * @param key 更新管理キー
   * @return 更新日付。キーが存在しない場合、失敗した場合 null
   */
  getLastModified(key: string): Date | null;

  /**
   * 更新管理キーの更新日付が検証日付より新しいかを検証します。
   * キーが未存在の場合は true を返します。
   *
   * @param key 更新管理キー
   * @param now 検証日付
   * @return 更新日付が検証日付より新しい場合 true、キーが未存在の場合 true、それ以外の場合 false
   */
  isUpDate(key: string, now: Date): boolean;

  /**
   * 対象となる更新管理キーの更新日付を更新します。
   * 呼び出し時刻が自動設定されます。
   *
   * @param key 更新管理キー
   * @return 更新後の日付。失敗した場合 null
   */
  modify(key: string): Date | null;

  /**
   * 更新管理キーを削除します。
   *
   * @param key 更新管理キー
   * @return 成功した場合 true、失敗した場合 false
   */
  remove(key: string): boolean;

  /**
   * すべての更新管理キーを削除します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  removeAll(): boolean;
}
