/**
 * プラグインマネージャ。
 *
 * プラグインの検索・取得機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/PluginManager/index.html
 */
declare class PluginManager {
  /**
   * プラグインマネージャのインスタンスを作成します。
   * ロケールID はログインユーザのロケールが使用されます。
   */
  constructor();

  /**
   * プラグインマネージャのインスタンスを作成します。
   *
   * @param localeId ロケールID（null の場合はログインユーザのロケール）
   */
  constructor(localeId: string);

  /**
   * 保持しているプラグイン定義情報を破棄します。
   *
   * @deprecated refresh を使用してください
   */
  clear(): void;

  /**
   * 指定した拡張ポイントをマネージャが保持している場合 true を返却します。
   *
   * @param point 拡張ポイントID
   * @return 保持している場合 true
   */
  containsPoint(point: string): boolean;

  /**
   * 保有する拡張ポイントの配列を取得します。
   *
   * @return 拡張ポイントID の配列
   */
  getExtensionPoints(): string[];

  /**
   * 指定されたポイントID とプラグインID からプラグイン情報を取得します。
   *
   * @param pointId ポイントID
   * @param pluginId プラグインID
   * @return プラグイン定義情報。失敗した場合 null
   */
  getPluginDescriptor(pointId: string, pluginId: string): PluginDescriptor | null;

  /**
   * ポイントID から最優先度のプラグイン情報を取得します。
   *
   * @param pointId ポイントID
   * @return プラグイン定義情報。失敗した場合 null
   */
  getPluginDescriptor(pointId: string): PluginDescriptor | null;

  /**
   * ポイントID に対応するすべてのプラグイン情報の配列を取得します。
   *
   * @param pointId ポイントID
   * @return プラグイン定義情報の配列
   */
  getPluginDescriptors(pointId: string): PluginDescriptor[];

  /**
   * プラグイン定義情報を初期化します。
   */
  refresh(): void;
}
