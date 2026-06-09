/**
 * DOM ツリーのノードクラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DOMNode/index.html
 */
declare class DOMNode {
  /** 要素ノード（1） */
  static readonly ELEMENT_NODE: 1;
  /** 属性ノード（2） */
  static readonly ATTRIBUTE_NODE: 2;
  /** テキストノード（3） */
  static readonly TEXT_NODE: 3;
  /** CDATA セクションノード（4） */
  static readonly CDATA_SECTION_NODE: 4;
  /** 実体参照ノード（5） */
  static readonly ENTITY_REFERENCE_NODE: 5;
  /** 実体ノード（6） */
  static readonly ENTITY_NODE: 6;
  /** 処理命令ノード（7） */
  static readonly PROCESSING_INSTRUCTION_NODE: 7;
  /** コメントノード（8） */
  static readonly COMMENT_NODE: 8;
  /** ドキュメントノード（9） */
  static readonly DOCUMENT_NODE: 9;
  /** ドキュメントタイプノード（10） */
  static readonly DOCUMENT_TYPE_NODE: 10;
  /** ドキュメントフラグメントノード（11） */
  static readonly DOCUMENT_FRAGMENT_NODE: 11;
  /** 記法ノード（12） */
  static readonly NOTATION_NODE: 12;

  /**
   * 子ノードを追加します。
   *
   * @param newChild 追加する子ノード
   * @return 成功した場合 true、失敗した場合 false
   */
  appendChild(newChild: DOMNode): boolean;

  /**
   * ノードを複製します。
   *
   * @param deep true の場合、子ノードも含めて深い複製を行う
   * @return 複製されたノード
   */
  cloneNode(deep: boolean): DOMNode;

  /**
   * 指定された属性名の属性値を取得します。
   *
   * @param name 属性名
   * @return 属性値
   */
  getAttribute(name: string): string;

  /**
   * 属性情報一覧を取得します。
   *
   * @return DOMAttribute の配列
   */
  getAttributes(): DOMAttribute[];

  /**
   * 子ノード一覧を配列で返却します。
   *
   * @return 子ノードの配列
   */
  getChildNodes(): DOMNode[];

  /**
   * ノード名を取得します。
   *
   * @return ノード名
   */
  getName(): string;

  /**
   * ノード種別を取得します。
   *
   * @return ノード種別（ELEMENT_NODE 等の定数値）
   */
  getNodeType(): number;

  /**
   * 親ノードを取得します。
   *
   * @return 親ノード
   */
  getParentNode(): DOMNode | null;

  /**
   * タグ名を取得します。
   *
   * @return タグ名
   */
  getTagName(): string;

  /**
   * ノード値を取得します。
   *
   * @return ノード値
   */
  getValue(): string;

  /**
   * 指定された属性名の属性が存在するかどうかを判定します。
   *
   * @param name 属性名
   * @return 属性が存在する場合 true
   */
  hasAttribute(name: string): boolean;

  /**
   * 属性を保有しているかどうかを判定します。
   *
   * @return 属性を保有している場合 true
   */
  hasAttributes(): boolean;

  /**
   * 子ノードが存在するかどうかを判定します。
   *
   * @return 子ノードが存在する場合 true
   */
  hasChildNodes(): boolean;

  /**
   * 指定された参照ノードの前にノードを挿入します。
   *
   * @param newChild 挿入するノード
   * @param refChild 参照ノード
   * @return 成功した場合 true、失敗した場合 false
   */
  insertBefore(newChild: DOMNode, refChild: DOMNode): boolean;

  /**
   * 隣接するテキストノードを統合します。
   */
  normalize(): void;

  /**
   * 属性を削除します。
   *
   * @param name 属性名
   */
  removeAttribute(name: string): void;

  /**
   * 子ノードを削除します。
   *
   * @param oldChild 削除する子ノード
   * @return 成功した場合 true、失敗した場合 false
   */
  removeChild(oldChild: DOMNode): boolean;

  /**
   * 子ノードを置換します。
   *
   * @param newChild 新しいノード
   * @param oldChild 置換対象のノード
   * @return 成功した場合 true、失敗した場合 false
   */
  replaceChild(newChild: DOMNode, oldChild: DOMNode): boolean;

  /**
   * 属性を設定します。
   *
   * @param name 属性名
   * @param value 属性値
   */
  setAttribute(name: string, value: string): void;
}
