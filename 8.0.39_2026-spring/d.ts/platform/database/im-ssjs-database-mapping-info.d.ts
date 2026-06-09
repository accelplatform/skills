/**
 * データベース設定情報オブジェクト。
 *
 * データベース接続の設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 */
interface DatabaseMappingInfo {
  /**
   * 接続ID を取得します。
   *
   * @return 接続ID
   */
  getConnectId(): string;

  /**
   * リソース参照名を取得します。
   *
   * @return リソース参照名
   */
  getResourceRefName(): string;
}
