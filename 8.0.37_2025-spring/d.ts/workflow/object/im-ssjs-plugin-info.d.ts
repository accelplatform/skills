/**
 * プラグイン情報オブジェクト。
 *
 * プラグインの拡張ポイントID・プラグインID・パラメータを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/PluginInfo/index.html
 */
interface PluginInfo {
  // --- 必須項目 ---

  /** 拡張ポイントID（最大500バイト） */
  extensionPointId: string;
  /** プラグインID（最大500バイト） */
  pluginId: string;
  /** パラメータ（最大2000バイト） */
  parameter: string;
}
