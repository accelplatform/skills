/**
 * プラグイン定義情報クラス。
 *
 * プラグインの定義情報を保持し、インスタンス生成や XML 情報へのアクセスを提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/PluginDescriptor/index.html
 */
declare class PluginDescriptor {
  /**
   * 指定ノードパスの最初のクラスインスタンスを取得します。
   *
   * @param nodePath ノードパス
   * @return クラスインスタンス。失敗した場合 null
   */
  createInstance(nodePath: string): PluginDescriptor.Instance | null;

  /**
   * ノードパスで取得できる複数クラスのインスタンス配列を取得します。
   *
   * @param nodePath ノードパス
   * @return クラスインスタンスの配列。失敗した場合 null
   */
  createInstances(nodePath: string): PluginDescriptor.Instance[] | null;

  /**
   * 指定ノード属性値からインスタンスを生成します。
   *
   * @param node ターゲットノード
   * @param attrName 属性名
   * @return クラスインスタンス。失敗した場合 null
   */
  createNodeInstance(node: DOMNode, attrName: string): PluginDescriptor.Instance | null;

  /**
   * グループ属性値の配列を取得します。
   *
   * @return グループ文字列の配列。失敗した場合 null
   */
  getGroups(): string[] | null;

  /**
   * プラグインID を取得します。
   *
   * @return プラグインID。失敗した場合 null
   */
  getId(): string | null;

  /**
   * name 属性値を取得します。
   *
   * @return name 属性値。失敗した場合 null
   */
  getName(): string | null;

  /**
   * プラグイン定義 XML のノードを取得します。
   *
   * @return DOMNode。失敗した場合 null
   */
  getNode(): DOMNode | null;

  /**
   * ランク属性値を取得します。
   *
   * @return ランク文字列。失敗した場合 null
   */
  getRank(): string | null;

  /**
   * ターゲット属性値を取得します。
   *
   * @return ターゲット文字列。失敗した場合 null
   */
  getTarget(): string | null;

  /**
   * バージョン属性値を取得します。
   *
   * @return バージョン文字列。失敗した場合 null
   */
  getVersion(): string | null;

  /**
   * プラグイン定義 XML を文字列として取得します。
   *
   * @return XML 文字列。失敗した場合 null
   */
  getXmlString(): string | null;

  /**
   * before 属性が true かどうかを判定します。
   *
   * @return before 属性が true の場合 true
   */
  isBefore(): boolean;

  /**
   * enable 属性の有効性を判定します。
   *
   * @return 有効な場合 true（デフォルト: true）
   */
  isEnable(): boolean;
}

declare namespace PluginDescriptor {
  type Instance = any;
}
