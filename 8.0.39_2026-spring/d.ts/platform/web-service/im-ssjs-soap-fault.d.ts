/**
 * SOAP フォルトクラス。
 *
 * SOAP フォルトメッセージを JavaScript オブジェクトとして扱います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SOAPFault/index.html
 */
declare class SOAPFault {
  /**
   * SOAPFault クラスのインスタンスを生成します。
   *
   * @param reason Reason 要素のメッセージ
   */
  constructor(reason: string);

  /** フォルトコード */
  faultCode: string;
  /** フォルトコードの名前空間 URI */
  faultCodeNameSpaceURI: string;
  /** フォルトサブコード */
  faultSubCode: string;
  /** フォルトサブコードの名前空間 URI */
  faultSubCodeNameSpaceURI: string;
  /** 詳細情報 */
  detail: string;
  /** 詳細ノード名（デフォルト: 'Exception'） */
  detailNodeName: string;

  /**
   * SOAP フォルトメッセージを Web サービスクライアントに送信します。
   */
  throwFault(): void;
}
